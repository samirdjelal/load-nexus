use reqwest::{Client, Method, header::{HeaderMap, HeaderName, HeaderValue}};
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter};
use tokio::sync::mpsc;
use tokio_util::sync::CancellationToken;

#[derive(Debug, Deserialize, Clone)]
pub struct LoadTestConfig {
    pub url: String,
    pub method: String,
    pub threads: usize,
    pub duration: u64,
    pub auth_type: String, // "none" | "bearer" | "basic"
    pub bearer_token: Option<String>,
    pub basic_user: Option<String>,
    pub basic_pass: Option<String>,
    pub body_type: String, // "none" | "json" | "graphql" | "formdata"
    pub body_data: Option<String>,
    pub custom_headers: Option<String>,
}

#[derive(Debug, Serialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct LoadTestStats {
    pub duration: String,
    pub elapsed_secs: u64,
    pub vusers: usize,
    pub iterations: usize,
    pub hits: usize,
    pub avg_response: f64,
    pub p50: f64,
    pub p80: f64,
    pub p90: f64,
    pub p95: f64,
    pub p99: f64,
    pub errors: usize,
    pub is_running: bool,
}

pub struct LoadTestEngine {
    cancel_token: CancellationToken,
    is_running: Arc<AtomicBool>,
}

impl LoadTestEngine {
    pub fn new() -> Self {
        Self {
            cancel_token: CancellationToken::new(),
            is_running: Arc::new(AtomicBool::new(false)),
        }
    }

    pub fn stop(&self) {
        if self.is_running.load(Ordering::SeqCst) {
            self.cancel_token.cancel();
            self.is_running.store(false, Ordering::SeqCst);
        }
    }

    pub fn start(
        &mut self,
        app: AppHandle,
        config: LoadTestConfig,
    ) -> Result<(), String> {
        if self.is_running.load(Ordering::SeqCst) {
            return Err("Test is already running".to_string());
        }

        self.cancel_token = CancellationToken::new();
        self.is_running.store(true, Ordering::SeqCst);

        let cancel_token = self.cancel_token.clone();
        let is_running = self.is_running.clone();

        // Prepare headers parsing synchronously
        let mut headers = HeaderMap::new();
        if let Some(custom) = &config.custom_headers {
            for line in custom.lines() {
                let parts: Vec<&str> = line.splitn(2, ':').collect();
                if parts.len() == 2 {
                    let k = parts[0].trim();
                    let v = parts[1].trim();
                    if let (Ok(name), Ok(value)) = (HeaderName::from_str(k), HeaderValue::from_str(v)) {
                        headers.insert(name, value);
                    }
                }
            }
        }
        if config.auth_type == "bearer" {
            if let Some(token) = &config.bearer_token {
                let val = format!("Bearer {}", token);
                if let Ok(value) = HeaderValue::from_str(&val) {
                    headers.insert(reqwest::header::AUTHORIZATION, value);
                }
            }
        } else if config.auth_type == "basic" {
            use base64::{Engine as _, engine::general_purpose::STANDARD};
            let user = config.basic_user.clone().unwrap_or_default();
            let pass = config.basic_pass.clone().unwrap_or_default();
            let encoded = STANDARD.encode(format!("{}:{}", user, pass));
            let val = format!("Basic {}", encoded);
            if let Ok(value) = HeaderValue::from_str(&val) {
                headers.insert(reqwest::header::AUTHORIZATION, value);
            }
        }
        if config.body_type == "json" || config.body_type == "graphql" {
            headers.insert(
                reqwest::header::CONTENT_TYPE,
                HeaderValue::from_static("application/json"),
            );
        } else if config.body_type == "formdata" {
            headers.insert(
                reqwest::header::CONTENT_TYPE,
                HeaderValue::from_static("application/x-www-form-urlencoded"),
            );
        }

        let method = Method::from_str(&config.method.to_uppercase()).unwrap_or(Method::GET);
        let url = config.url.clone();
        let body = config.body_data.clone().unwrap_or_default();
        let body_type = config.body_type.clone();
        let duration = Duration::from_secs(config.duration);
        let threads = config.threads;

        tauri::async_runtime::spawn(async move {
            let mut builder = Client::builder()
                .timeout(Duration::from_secs(30))
                .pool_idle_timeout(Duration::from_secs(15))
                .pool_max_idle_per_host(threads);

            let client = match builder.build() {
                Ok(c) => c,
                Err(e) => {
                    eprintln!("Failed to build client: {}", e);
                    is_running.store(false, Ordering::SeqCst);
                    return;
                }
            };

            let (tx, mut rx) = mpsc::channel::<(bool, f64)>(10000);
            let start_time = Instant::now();

            // Spawn workers
            for _ in 0..threads {
                let client = client.clone();
                let tx = tx.clone();
                let url = url.clone();
                let method = method.clone();
                let headers = headers.clone();
                let body = body.clone();
                let cancel = cancel_token.clone();
                let body_type = body_type.clone();

                tauri::async_runtime::spawn(async move {
                    loop {
                        if cancel.is_cancelled() || start_time.elapsed() >= duration {
                            break;
                        }

                        let mut req = client.request(method.clone(), &url).headers(headers.clone());
                        
                        if body_type != "none" && !body.is_empty() {
                            req = req.body(body.clone());
                        }

                        let req_start = Instant::now();
                        let res = req.send().await;
                        let elapsed = req_start.elapsed().as_secs_f64();

                        let success = match res {
                            Ok(r) => r.status().is_success(),
                            Err(_) => false,
                        };

                        if tx.send((success, elapsed)).await.is_err() {
                            break;
                        }
                    }
                });
            }
            drop(tx);

            // Reporter task
            let reporter_cancel = cancel_token.clone();
            tauri::async_runtime::spawn(async move {
                let mut total_requests = 0;
                let mut total_errors = 0;
                let mut latencies = Vec::new();
                
                let mut last_report = Instant::now();

                loop {
                    tokio::select! {
                        Some((success, latency)) = rx.recv() => {
                            total_requests += 1;
                            if !success {
                                total_errors += 1;
                            }
                            latencies.push(latency);
                        }
                        _ = tokio::time::sleep(Duration::from_millis(500)) => {
                            if rx.is_empty() && (reporter_cancel.is_cancelled() || start_time.elapsed() >= duration) {
                                break;
                            }
                        }
                    }

                    if last_report.elapsed() >= Duration::from_secs(1) {
                        last_report = Instant::now();
                        
                        let elapsed_secs = start_time.elapsed().as_secs();
                        let formatted_duration = format!(
                            "{}:{:02}:{:02}",
                            elapsed_secs / 3600,
                            (elapsed_secs % 3600) / 60,
                            elapsed_secs % 60
                        );

                        let avg = if latencies.is_empty() {
                            0.0
                        } else {
                            latencies.iter().sum::<f64>() / latencies.len() as f64
                        };

                        let mut sorted = latencies.clone();
                        sorted.sort_by(|a, b| a.partial_cmp(b).unwrap());
                        
                        let p50 = if sorted.is_empty() { 0.0 } else { sorted[(sorted.len() as f64 * 0.50) as usize] };
                        let p80 = if sorted.is_empty() { 0.0 } else { sorted[(sorted.len() as f64 * 0.80) as usize] };
                        let p90 = if sorted.is_empty() { 0.0 } else { sorted[(sorted.len() as f64 * 0.90) as usize] };
                        let p95 = if sorted.is_empty() { 0.0 } else { sorted[(sorted.len() as f64 * 0.95) as usize] };
                        let p99 = if sorted.is_empty() { 0.0 } else { sorted[(sorted.len() as f64 * 0.99) as usize] };

                        let stats = LoadTestStats {
                            duration: formatted_duration,
                            elapsed_secs,
                            vusers: threads,
                            iterations: total_requests,
                            hits: total_requests,
                            avg_response: (avg * 1000.0).round() / 1000.0,
                            p50: (p50 * 1000.0).round() / 1000.0,
                            p80: (p80 * 1000.0).round() / 1000.0,
                            p90: (p90 * 1000.0).round() / 1000.0,
                            p95: (p95 * 1000.0).round() / 1000.0,
                            p99: (p99 * 1000.0).round() / 1000.0,
                            errors: total_errors,
                            is_running: true,
                        };

                        let _ = app.emit("load_test_progress", stats);
                    }
                }

                // Final report
                is_running.store(false, Ordering::SeqCst);
                
                // Send final stats with is_running: false
                let elapsed_secs = start_time.elapsed().as_secs();
                let formatted_duration = format!(
                    "{}:{:02}:{:02}",
                    elapsed_secs / 3600,
                    (elapsed_secs % 3600) / 60,
                    elapsed_secs % 60
                );

                let avg = if latencies.is_empty() {
                    0.0
                } else {
                    latencies.iter().sum::<f64>() / latencies.len() as f64
                };

                let mut sorted = latencies.clone();
                sorted.sort_by(|a, b| a.partial_cmp(b).unwrap());
                
                let p50 = if sorted.is_empty() { 0.0 } else { sorted[(sorted.len() as f64 * 0.50) as usize] };
                let p80 = if sorted.is_empty() { 0.0 } else { sorted[(sorted.len() as f64 * 0.80) as usize] };
                let p90 = if sorted.is_empty() { 0.0 } else { sorted[(sorted.len() as f64 * 0.90) as usize] };
                let p95 = if sorted.is_empty() { 0.0 } else { sorted[(sorted.len() as f64 * 0.95) as usize] };
                let p99 = if sorted.is_empty() { 0.0 } else { sorted[(sorted.len() as f64 * 0.99) as usize] };

                let final_stats = LoadTestStats {
                    duration: formatted_duration,
                    elapsed_secs,
                    vusers: threads,
                    iterations: total_requests,
                    hits: total_requests,
                    avg_response: (avg * 1000.0).round() / 1000.0,
                    p50: (p50 * 1000.0).round() / 1000.0,
                    p80: (p80 * 1000.0).round() / 1000.0,
                    p90: (p90 * 1000.0).round() / 1000.0,
                    p95: (p95 * 1000.0).round() / 1000.0,
                    p99: (p99 * 1000.0).round() / 1000.0,
                    errors: total_errors,
                    is_running: false,
                };
                let _ = app.emit("load_test_progress", final_stats);
            });
        });

        Ok(())
    }
}
