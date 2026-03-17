# Load Nexus - Project Context

Load Nexus is a high-performance, professional-grade API load testing desktop application. It combines a high-concurrency **Rust** engine with a modern **React** frontend using the **Tauri** framework.

## 🚀 Project Overview

*   **Purpose:** Provide real-time, high-throughput API load testing with deep performance insights (latency percentiles, RPS, throughput).
*   **Architecture:**
    *   **Backend (Rust):** A multi-threaded engine built with `tokio` and `reqwest`. It manages concurrent workers and a reporter task that aggregates metrics.
    *   **Frontend (React/Vite):** A glassmorphic UI using `TailwindCSS` for styling and `Chart.js`/`recharts` for live performance visualization.
    *   **Communication:** Tauri `invoke` for commands and `event` system for real-time stats streaming.

## 🛠️ Tech Stack

*   **Core:** Rust 2021, Tauri v2, React 19.
*   **Backend Dependencies:**
    *   `tokio`: Async runtime for managing thousands of concurrent requests.
    *   `reqwest`: HTTP client with support for JSON, multipart, and TLS.
    *   `serde`: Serialization/deserialization for config and stats.
*   **Frontend Dependencies:**
    *   `vite`: Build tool and dev server.
    *   `chart.js` & `react-chartjs-2`: Real-time charting.
    *   `lucide-react`: Iconography.
    *   `tailwindcss`: Utility-first CSS framework.

## 📂 Key Files & Directories

*   `src-tauri/src/load_tester.rs`: **The Core Engine.** Contains the `LoadTestEngine` which manages worker threads, request logic, and statistics reporting (P50-P99 latencies, bytes/sec).
*   `src-tauri/src/lib.rs`: Tauri application setup, state management, and command handlers (`start_test`, `stop_test`).
*   `src/App.jsx`: Main React entry point; manages global test state and listens for `load_test_progress` events.
*   `src/components/Dashboard.jsx`: Real-time monitoring interface with live charts.
*   `src/components/ConfigurationPage.jsx`: Test scenario builder (URL, method, auth, body, file uploads).
*   `tauri.conf.json`: Tauri configuration including window dimensions and plugin setup (updater, dialog, etc.).

## 🏗️ Building and Running

### Development
1.  Install Node dependencies: `npm install`
2.  Run in dev mode: `npm run tauri dev`
    *   This starts the Vite dev server (`localhost:1420`) and the Tauri window.

### Production Build
1.  Build the application: `npm run tauri build`
    *   Output will be in `src-tauri/target/release/bundle`.

## 📝 Development Conventions

*   **Concurrency:** Backend logic must remain non-blocking. Use `tauri::async_runtime::spawn` for long-running tasks.
*   **State:** The load testing engine is stored in Tauri's state as a `Mutex<LoadTestEngine>`.
*   **Events:** Performance metrics are emitted every second using the `load_test_progress` event string.
*   **Styling:** Follow the established glassmorphic/dark-mode theme using Tailwind classes.
*   **Error Handling:** Commands should return `Result<(), String>` to provide meaningful error messages to the frontend.

## 🎯 Testing

*   **Frontend:** Standard React testing (though no explicit test files were found, typical Vite/React patterns apply).
*   **Backend:** Rust unit tests can be added in `load_tester.rs` to verify header parsing and stats calculation.
*   **Manual Verification:** Use `https://httpbin.org` for verifying different request types and auth methods.
