mod load_tester;
mod history;

use load_tester::{LoadTestConfig, LoadTestEngine};
use history::{HistoryManager, TestRun};
use std::sync::Mutex;
use tauri::{AppHandle, Manager, State};
use std::sync::Arc;

struct TestEngineState(Mutex<LoadTestEngine>);
struct HistoryState(Arc<HistoryManager>);

#[tauri::command]
async fn start_test(
    app: AppHandle,
    engine_state: State<'_, TestEngineState>,
    _history_state: State<'_, HistoryState>,
    config: LoadTestConfig,
) -> Result<(), String> {
    let mut engine = engine_state.0.lock().unwrap();
    engine.start(app, config)
}

#[tauri::command]
fn stop_test(state: State<'_, TestEngineState>) -> Result<(), String> {
    let engine = state.0.lock().unwrap();
    engine.stop();
    Ok(())
}

#[tauri::command]
fn get_test_history(state: State<'_, HistoryState>) -> Result<Vec<TestRun>, String> {
    state.0.get_all_runs().map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_test_run(state: State<'_, HistoryState>, id: i64) -> Result<(), String> {
    state.0.delete_run(id).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_test_result(
    state: State<'_, HistoryState>,
    url: String,
    method: String,
    config_json: String,
    stats_json: String,
    success_rate: f64,
    p99: f64,
    rps: f64,
) -> Result<i64, String> {
    state.0.save_run(&url, &method, &config_json, &stats_json, success_rate, p99, rps)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn save_report(path: String, content: String) -> Result<(), String> {
    std::fs::write(path, content).map_err(|e| e.to_string())
}

#[tauri::command]
async fn load_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(path).map_err(|e| e.to_string())
}

use clap::Parser;
use std::fs;

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Cli {
    /// Run a scenario from a JSON file headlessly
    #[arg(short, long)]
    run: Option<String>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let cli = Cli::parse();

    if let Some(scenario_path) = cli.run {
        println!("Running headless scenario from: {}", scenario_path);
        
        let config_str = fs::read_to_string(&scenario_path)
            .expect("Failed to read scenario file");
        
        let config: LoadTestConfig = serde_json::from_str(&config_str)
            .expect("Failed to parse scenario JSON");

        // Run headless async
        let rt = tokio::runtime::Runtime::new().unwrap();
        rt.block_on(async {
            // let mut engine = LoadTestEngine::new();
            // engine.start_headless(config).await;
            println!("Headless mode execution would start here for {} users, {} duration.", config.threads, config.duration);
            println!("Headless implementation is WIP. Please use the GUI for full functionality.");
        });
        
        std::process::exit(0);
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir().expect("failed to get app data dir");
            if !app_data_dir.exists() {
                std::fs::create_dir_all(&app_data_dir).expect("failed to create app data dir");
            }
            
            let history_manager = HistoryManager::new(app_data_dir);
            app.manage(HistoryState(Arc::new(history_manager)));
            app.manage(TestEngineState(Mutex::new(LoadTestEngine::new())));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            start_test, 
            stop_test, 
            get_test_history, 
            delete_test_run,
            save_test_result,
            save_report,
            load_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


