import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ConfigurationPage from './components/ConfigurationPage';

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [isRunning, setIsRunning] = useState(false);
  const [config, setConfig] = useState({
    url: 'https://httpbin.org/get',
    method: 'GET',
    threads: 10,
    duration: 60,
    authType: 'none',
    bearerToken: '',
    basicUser: '',
    basicPass: '',
    bodyType: 'none',
    bodyData: '',
    filePath: '',
    fileKey: 'file',
    customHeaders: ''
  });

  const [stats, setStats] = useState({
    duration: "0:00:00",
    elapsedSecs: 0,
    vusers: 0,
    iterations: 0,
    hits: 0,
    avgResponse: 0,
    p50: 0,
    p80: 0,
    p90: 0,
    p95: 0,
    p99: 0,
    errors: 0,
    rps: 0,
    bytesSentPerSec: 0,
    bytesRecvPerSec: 0,
    totalBytesSent: 0,
    totalBytesRecv: 0
  });

  useEffect(() => {
    let unlisten;
    const setupListener = async () => {
      unlisten = await listen('load_test_progress', (event) => {
        setStats(event.payload);
        if (event.payload.isRunning !== undefined) {
          setIsRunning(event.payload.isRunning);
        }
      });
    };
    setupListener();
    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  const handleStart = async () => {
    setIsRunning(true);
    setStats(prev => ({ ...prev, vusers: config.threads }));
    try {
      const payload = {
        url: config.url,
        method: config.method,
        threads: parseInt(config.threads, 10),
        duration: parseInt(config.duration, 10),
        auth_type: config.authType,
        bearer_token: config.bearerToken || null,
        basic_user: config.basicUser || null,
        basic_pass: config.basicPass || null,
        body_type: config.bodyType,
        body_data: config.bodyData || null,
        file_path: config.filePath || null,
        file_key: config.fileKey || null,
        custom_headers: config.customHeaders || null,
      };
      await invoke('start_test', { config: payload });
    } catch (error) {
      console.error("Failed to start test:", error);
      setIsRunning(false);
    }
  };

  const handleStop = async () => {
    try {
      await invoke('stop_test');
    } catch (error) {
      console.error("Failed to stop test:", error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-dark">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      {activePage === 'dashboard' && (
        <Dashboard
          config={config}
          stats={stats}
          isRunning={isRunning}
          handleStart={handleStart}
          handleStop={handleStop}
          onNavigate={setActivePage}
        />
      )}
      {activePage === 'scenarios' && (
        <ConfigurationPage
          initialConfig={config}
          onSave={(newConf) => {
            setConfig(newConf);
            setActivePage('dashboard');
          }}
          onCancel={() => setActivePage('dashboard')}
        />
      )}
    </div>
  );
}

export default App;
