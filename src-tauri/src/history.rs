use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TestRun {
    pub id: i64,
    pub timestamp: String,
    pub url: String,
    pub method: String,
    pub config_json: String,
    pub stats_json: String,
    pub success_rate: f64,
    pub p99: f64,
    pub rps: f64,
}

pub struct HistoryManager {
    db_path: PathBuf,
}

impl HistoryManager {
    pub fn new(app_dir: PathBuf) -> Self {
        let mut db_path = app_dir;
        db_path.push("history.db");
        
        let conn = Connection::open(&db_path).expect("Failed to open history database");
        conn.execute(
            "CREATE TABLE IF NOT EXISTS test_runs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                url TEXT NOT NULL,
                method TEXT NOT NULL,
                config_json TEXT NOT NULL,
                stats_json TEXT NOT NULL,
                success_rate REAL NOT NULL,
                p99 REAL NOT NULL,
                rps REAL NOT NULL
            )",
            [],
        ).expect("Failed to create test_runs table");

        Self { db_path }
    }

    pub fn save_run(
        &self,
        url: &str,
        method: &str,
        config_json: &str,
        stats_json: &str,
        success_rate: f64,
        p99: f64,
        rps: f64,
    ) -> Result<i64> {
        let conn = Connection::open(&self.db_path)?;
        let now: DateTime<Utc> = Utc::now();
        let timestamp = now.to_rfc3339();

        conn.execute(
            "INSERT INTO test_runs (timestamp, url, method, config_json, stats_json, success_rate, p99, rps)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![timestamp, url, method, config_json, stats_json, success_rate, p99, rps],
        )?;

        Ok(conn.last_insert_rowid())
    }

    pub fn get_all_runs(&self) -> Result<Vec<TestRun>> {
        let conn = Connection::open(&self.db_path)?;
        let mut stmt = conn.prepare(
            "SELECT id, timestamp, url, method, config_json, stats_json, success_rate, p99, rps 
             FROM test_runs ORDER BY id DESC"
        )?;
        
        let runs_iter = stmt.query_map([], |row| {
            Ok(TestRun {
                id: row.get(0)?,
                timestamp: row.get(1)?,
                url: row.get(2)?,
                method: row.get(3)?,
                config_json: row.get(4)?,
                stats_json: row.get(5)?,
                success_rate: row.get(6)?,
                p99: row.get(7)?,
                rps: row.get(8)?,
            })
        })?;

        let mut runs = Vec::new();
        for run in runs_iter {
            runs.push(run?);
        }
        Ok(runs)
    }

    pub fn delete_run(&self, id: i64) -> Result<()> {
        let conn = Connection::open(&self.db_path)?;
        conn.execute("DELETE FROM test_runs WHERE id = ?1", params![id])?;
        Ok(())
    }
}
