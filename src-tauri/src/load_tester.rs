use reqwest::{
    header::{HeaderMap, HeaderName, HeaderValue},
    multipart, Client, Method,
};
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter};
use tokio::sync::mpsc;
use tokio_util::sync::CancellationToken;
use regex::Regex;
use std::collections::HashMap;
use tokio_tungstenite::connect_async;
use futures::{StreamExt, SinkExt};
use tokio_tungstenite::tungstenite::Message;

fn interpolate(text: &str, vars: &HashMap<String, String>, csv_row: Option<&HashMap<String, String>>) -> String {
    let re = Regex::new(r"\{\{([^}]+)\}\}").unwrap();
    re.replace_all(text, |caps: &regex::Captures| {
        let key = &caps[1];
        if let Some(row) = csv_row {
            if let Some(val) = row.get(key) {
                return val.clone();
            }
        }
        if let Some(val) = vars.get(key) {
            return val.clone();
        }
        caps[0].to_string() // return original if not found
    }).into_owned()
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct AssertionConfig {
    pub status_code: Option<u16>,
    pub body_contains: Option<String>,
    pub max_latency_ms: Option<f64>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
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
    pub file_path: Option<String>,
    pub file_key: Option<String>,
    pub custom_headers: Option<String>,
    // Advanced Settings
    pub timeout_secs: Option<u64>,
    pub user_agent: Option<String>,
    pub ignore_ssl: Option<bool>,
    pub follow_redirects: Option<bool>,
    pub max_redirects: Option<usize>,
    pub dns_cache: Option<bool>,
    pub keep_alive: Option<bool>,
    pub rps_limit: Option<u32>,
    pub assertions: Option<AssertionConfig>,
    // New Advanced Features
    pub ramp_up_secs: Option<u64>,
    pub ramp_up_steps: Option<usize>,
    pub csv_data_path: Option<String>,
    pub env_vars: Option<std::collections::HashMap<String, String>>,
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
    pub assertion_failures: usize,
    pub is_running: bool,
    pub rps: f64,
    pub bytes_sent_per_sec: f64,
    pub bytes_recv_per_sec: f64,
    pub total_bytes_sent: u64,
    pub total_bytes_recv: u64,
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

    pub fn start(&mut self, app: AppHandle, config: LoadTestConfig) -> Result<(), String> {
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
                    if let (Ok(name), Ok(value)) =
                        (HeaderName::from_str(k), HeaderValue::from_str(v))
                    {
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
            use base64::{engine::general_purpose::STANDARD, Engine as _};
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
        
        let file_path = config.file_path.clone();
        let file_key = config.file_key.clone().unwrap_or_else(|| "file".to_string());
        
        let duration = Duration::from_secs(config.duration);
        let threads = config.threads;
        let rps_limit = config.rps_limit.unwrap_or(0);
        let env_vars = config.env_vars.clone().unwrap_or_default();
        
        let mut csv_data: Vec<HashMap<String, String>> = Vec::new();
        if let Some(csv_path) = &config.csv_data_path {
            if let Ok(mut rdr) = csv::Reader::from_path(csv_path) {
                for result in rdr.deserialize() {
                    if let Ok(record) = result {
                        csv_data.push(record);
                    }
                }
            } else {
                eprintln!("Failed to open or parse CSV at: {}", csv_path);
            }
        }
        let csv_data = Arc::new(csv_data);

        tauri::async_runtime::spawn(async move {
            let semaphore = if rps_limit > 0 {
                let sem = Arc::new(tokio::sync::Semaphore::new(rps_limit as usize));
                let sem_clone = sem.clone();
                let cancel_clone = cancel_token.clone();
                tauri::async_runtime::spawn(async move {
                    let mut interval = tokio::time::interval(Duration::from_secs(1));
                    loop {
                        tokio::select! {
                            _ = interval.tick() => {
                                let current = sem_clone.available_permits();
                                if current < rps_limit as usize {
                                    sem_clone.add_permits(rps_limit as usize - current);
                                }
                            }
                            _ = cancel_clone.cancelled() => break,
                        }
                    }
                });
                Some(sem)
            } else {
                None
            };

            let mut final_body_bytes: Option<Vec<u8>> = None;
            if body_type == "file" {
                if let Some(path) = &file_path {
                    match tokio::fs::read(path).await {
                        Ok(data) => {
                            final_body_bytes = Some(data);
                        }
                        Err(e) => {
                            eprintln!("Failed to read file for payload: {}", e);
                            is_running.store(false, Ordering::SeqCst);
                            return;
                        }
                    }
                }
            }

            let mut builder = Client::builder()
                .timeout(Duration::from_secs(config.timeout_secs.unwrap_or(30)))
                .pool_idle_timeout(Duration::from_secs(15))
                .pool_max_idle_per_host(threads);

            if let Some(ua) = &config.user_agent {
                builder = builder.user_agent(ua);
            }

            if let Some(ignore) = config.ignore_ssl {
                builder = builder.danger_accept_invalid_certs(ignore);
            }

            if let Some(follow) = config.follow_redirects {
                if !follow {
                    builder = builder.redirect(reqwest::redirect::Policy::none());
                } else if let Some(max) = config.max_redirects {
                    builder = builder.redirect(reqwest::redirect::Policy::limited(max));
                }
            }

            if let Some(keep_alive) = config.keep_alive {
                if !keep_alive {
                    builder = builder.pool_max_idle_per_host(0);
                }
            }

            let client = match builder.build() {
                Ok(c) => c,
                Err(e) => {
                    eprintln!("Failed to build client: {}", e);
                    is_running.store(false, Ordering::SeqCst);
                    return;
                }
            };

            // (success, latency, sent_bytes, recv_bytes, assertion_failed)
            let (tx, mut rx) = mpsc::channel::<(bool, f64, u64, u64, bool)>(10000);
            let start_time = Instant::now();
            let assertions = config.assertions.clone();
            let ramp_up_secs = config.ramp_up_secs;

            // Spawn workers
            for i in 0..threads {
                let client = client.clone();
                let tx = tx.clone();
                let url = url.clone();
                let method = method.clone();
                let headers = headers.clone();
                let body = body.clone();
                let final_body_bytes = final_body_bytes.clone();
                let file_path_clone = file_path.clone();
                let file_key = file_key.clone();
                let cancel = cancel_token.clone();
                let body_type = body_type.clone();
                let semaphore = semaphore.clone();
                let assertions = assertions.clone();
                let env_vars = env_vars.clone();
                let csv_data = csv_data.clone();

                tauri::async_runtime::spawn(async move {
                    if let Some(ramp_secs) = ramp_up_secs {
                        if threads > 1 {
                            let delay = (ramp_secs as f64 / (threads - 1) as f64) * i as f64;
                            if delay > 0.0 {
                                tokio::time::sleep(Duration::from_secs_f64(delay)).await;
                            }
                        }
                    }

                    // Estimate request overhead once
                    let request_line_size = method.as_str().len() + url.len() + 11; // " HTTP/1.1\r\n"
                    let mut header_size = 0;
                    for (name, value) in &headers {
                        header_size += name.as_str().len() + value.len() + 4; // ": \r\n"
                    }
                    let body_len = if body_type == "file" {
                        final_body_bytes.as_ref().map(|b| b.len()).unwrap_or(0)
                    } else {
                        body.len()
                    };
                    let sent_bytes_base = (request_line_size + header_size + body_len + 2) as u64;

                    let mut iteration = 0;

                    loop {
                        if cancel.is_cancelled() || start_time.elapsed() >= duration {
                            break;
                        }

                        // Apply rate limiting
                        let _permit = if let Some(sem) = &semaphore {
                            match sem.acquire().await {
                                Ok(p) => Some(p),
                                Err(_) => break,
                            }
                        } else {
                            None
                        };

                        let csv_row = if !csv_data.is_empty() {
                            Some(&csv_data[iteration % csv_data.len()])
                        } else {
                            None
                        };
                        iteration += 1;

                        let interpolated_url = interpolate(&url, &env_vars, csv_row);
                        
                        // Interpolate headers
                        let mut interpolated_headers = HeaderMap::new();
                        for (k, v) in &headers {
                            if let Ok(v_str) = v.to_str() {
                                let new_v = interpolate(v_str, &env_vars, csv_row);
                                if let Ok(new_v_header) = HeaderValue::from_str(&new_v) {
                                    interpolated_headers.insert(k.clone(), new_v_header);
                                } else {
                                    interpolated_headers.insert(k.clone(), v.clone());
                                }
                            } else {
                                interpolated_headers.insert(k.clone(), v.clone());
                            }
                        }

                        let mut req = client
                            .request(method.clone(), &interpolated_url)
                            .headers(interpolated_headers);
                        
                        let is_ws = interpolated_url.starts_with("ws://") || interpolated_url.starts_with("wss://");
                        
                        let mut req_start = Instant::now();
                        let mut elapsed = 0.0;
                        let mut recv_bytes = 0;
                        let mut assertion_failed = false;
                        let mut success = false;

                        if is_ws {
                            req_start = Instant::now();
                            match connect_async(&interpolated_url).await {
                                Ok((mut ws_stream, _)) => {
                                    success = true;
                                    if !body.is_empty() {
                                        let interpolated_body = interpolate(&body, &env_vars, csv_row);
                                        if ws_stream.send(Message::text(interpolated_body)).await.is_ok() {
                                            if let Some(Ok(msg)) = ws_stream.next().await {
                                                recv_bytes = msg.into_data().len() as u64;
                                            }
                                        }
                                    }
                                    let _ = ws_stream.close(None).await;
                                }
                                Err(_) => {
                                    success = false;
                                }
                            }
                            elapsed = req_start.elapsed().as_secs_f64();
                        } else {
                            if body_type == "file" {
                                if let Some(bytes_data) = &final_body_bytes {
                                    let file_name = if let Some(path) = &file_path_clone {
                                        std::path::Path::new(path)
                                            .file_name()
                                            .unwrap_or_default()
                                            .to_string_lossy()
                                            .into_owned()
                                    } else {
                                        "upload.bin".to_string()
                                    };
                                    
                                    let part = multipart::Part::bytes(bytes_data.clone())
                                        .file_name(file_name);
                                    let form = multipart::Form::new()
                                        .part(file_key.clone(), part);
                                    req = req.multipart(form);
                                }
                            } else if body_type != "none" && !body.is_empty() {
                                let interpolated_body = interpolate(&body, &env_vars, csv_row);
                                req = req.body(interpolated_body);
                            }

                            req_start = Instant::now();
                            let res = req.send().await;
                            elapsed = req_start.elapsed().as_secs_f64();

                            success = match res {
                                Ok(r) => {
                                    let status = r.status();
                                    let ok = status.is_success();
                                    
                                    // Assertion: Status Code
                                    if let Some(expected_status) = assertions.as_ref().and_then(|a| a.status_code) {
                                        if status.as_u16() != expected_status {
                                            assertion_failed = true;
                                        }
                                    }
                                    
                                    // Assertion: Max Latency
                                    if let Some(max_latency) = assertions.as_ref().and_then(|a| a.max_latency_ms) {
                                        if (elapsed * 1000.0) > max_latency {
                                            assertion_failed = true;
                                        }
                                    }

                                    // Assertion: Body Contains
                                    let body_bytes = r.bytes().await.ok();
                                    if let Some(bytes) = body_bytes {
                                        recv_bytes = bytes.len() as u64;
                                        if let Some(content) = assertions.as_ref().and_then(|a| a.body_contains.as_ref()) {
                                            let body_str = String::from_utf8_lossy(&bytes);
                                            if !body_str.contains(content) {
                                                assertion_failed = true;
                                            }
                                        }
                                    }
                                    
                                    ok
                                }
                                Err(_) => {
                                    assertion_failed = true;
                                    false
                                }
                            };
                        }

                        if tx
                            .send((success, elapsed, sent_bytes_base, recv_bytes, assertion_failed))
                            .await
                            .is_err()
                        {
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
                let mut total_assertion_failures = 0;
                let mut latencies = Vec::new();

                let mut total_bytes_sent = 0;
                let mut total_bytes_recv = 0;

                let mut last_total_requests = 0;
                let mut last_total_bytes_sent = 0;
                let mut last_total_bytes_recv = 0;

                let mut last_report = Instant::now();

                loop {
                    tokio::select! {
                        Some((success, latency, sent, recv, failed)) = rx.recv() => {
                            total_requests += 1;
                            if !success {
                                total_errors += 1;
                            }
                            if failed {
                                total_assertion_failures += 1;
                            }
                            latencies.push(latency);
                            total_bytes_sent += sent;
                            total_bytes_recv += recv;
                        }
                        _ = tokio::time::sleep(Duration::from_millis(500)) => {
                            if rx.is_empty() && (reporter_cancel.is_cancelled() || start_time.elapsed() >= duration) {
                                break;
                            }
                        }
                    }

                    if last_report.elapsed() >= Duration::from_secs(1) {
                        let now = Instant::now();
                        let interval = now.duration_since(last_report).as_secs_f64();

                        let rps = (total_requests - last_total_requests) as f64 / interval;
                        let bs_ps = (total_bytes_sent - last_total_bytes_sent) as f64 / interval;
                        let br_ps = (total_bytes_recv - last_total_bytes_recv) as f64 / interval;

                        last_total_requests = total_requests;
                        last_total_bytes_sent = total_bytes_sent;
                        last_total_bytes_recv = total_bytes_recv;
                        last_report = now;

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

                        let p50 = if sorted.is_empty() {
                            0.0
                        } else {
                            sorted[(sorted.len() as f64 * 0.50) as usize]
                        };
                        let p80 = if sorted.is_empty() {
                            0.0
                        } else {
                            sorted[(sorted.len() as f64 * 0.80) as usize]
                        };
                        let p90 = if sorted.is_empty() {
                            0.0
                        } else {
                            sorted[(sorted.len() as f64 * 0.90) as usize]
                        };
                        let p95 = if sorted.is_empty() {
                            0.0
                        } else {
                            sorted[(sorted.len() as f64 * 0.95) as usize]
                        };
                        let p99 = if sorted.is_empty() {
                            0.0
                        } else {
                            sorted[(sorted.len() as f64 * 0.99) as usize]
                        };

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
                            assertion_failures: total_assertion_failures,
                            is_running: true,
                            rps,
                            bytes_sent_per_sec: bs_ps,
                            bytes_recv_per_sec: br_ps,
                            total_bytes_sent,
                            total_bytes_recv,
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

                let p50 = if sorted.is_empty() {
                    0.0
                } else {
                    sorted[(sorted.len() as f64 * 0.50) as usize]
                };
                let p80 = if sorted.is_empty() {
                    0.0
                } else {
                    sorted[(sorted.len() as f64 * 0.80) as usize]
                };
                let p90 = if sorted.is_empty() {
                    0.0
                } else {
                    sorted[(sorted.len() as f64 * 0.90) as usize]
                };
                let p95 = if sorted.is_empty() {
                    0.0
                } else {
                    sorted[(sorted.len() as f64 * 0.95) as usize]
                };
                let p99 = if sorted.is_empty() {
                    0.0
                } else {
                    sorted[(sorted.len() as f64 * 0.99) as usize]
                };

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
                    assertion_failures: total_assertion_failures,
                    is_running: false,
                    rps: 0.0,
                    bytes_sent_per_sec: 0.0,
                    bytes_recv_per_sec: 0.0,
                    total_bytes_sent,
                    total_bytes_recv,
                };
                let _ = app.emit("load_test_progress", final_stats);

            });
        });

        Ok(())
    }
}
