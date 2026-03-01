mod load_tester;
use load_tester::{LoadTestConfig, LoadTestEngine};
use std::sync::Mutex;
use tauri::{AppHandle, Manager, State};

struct TestEngineState(Mutex<LoadTestEngine>);

#[tauri::command]
fn start_test(
    app: AppHandle,
    state: State<'_, TestEngineState>,
    config: LoadTestConfig,
) -> Result<(), String> {
    let mut engine = state.0.lock().unwrap();
    engine.start(app, config)
}

#[tauri::command]
fn stop_test(state: State<'_, TestEngineState>) -> Result<(), String> {
    let engine = state.0.lock().unwrap();
    engine.stop();
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            app.manage(TestEngineState(Mutex::new(LoadTestEngine::new())));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![start_test, stop_test])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
