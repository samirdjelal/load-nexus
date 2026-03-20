import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { check } from '@tauri-apps/plugin-updater';
import { ask, message } from '@tauri-apps/plugin-dialog';
import { relaunch } from '@tauri-apps/plugin-process';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ConfigurationPage from './components/ConfigurationPage';
import OnboardingWizard from './components/OnboardingWizard';
import SettingsPage from './components/SettingsPage';
import HistoryPage from './components/HistoryPage';

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [isRunning, setIsRunning] = useState(false);
  const [lastConfigUsed, setLastConfigUsed] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('nexus_settings');
    return saved ? JSON.parse(saved) : {
      timeout: 30,
      userAgent: 'LoadNexus/1.0',
      ignoreSsl: false,
      followRedirects: true,
      maxRedirects: 5,
      dnsCache: true,
      keepAlive: true,
      rpsLimit: 0,
    };
  });
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
    customHeaders: '',
    assertions: {
      status_code: 200,
      max_latency_ms: null,
      body_contains: null
    }
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
    assertionFailures: 0,
    rps: 0,
    bytesSentPerSec: 0,
    bytesRecvPerSec: 0,
    totalBytesSent: 0,
    totalBytesRecv: 0
  });

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('nexus_onboarding_seen');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('nexus_onboarding_seen', 'true');
  };

  const handleShowTutorial = () => {
    setShowOnboarding(true);
  };

  useEffect(() => {
    let unlisten;
    const setupListener = async () => {
      unlisten = await listen('load_test_progress', (event) => {
        const newStats = event.payload;
        setStats(newStats);
        
        if (newStats.isRunning === false && isRunning) {
          setIsRunning(false);
          // Save to history when test finishes
          saveToHistory(newStats);
        } else if (newStats.isRunning !== undefined) {
          setIsRunning(newStats.isRunning);
        }
      });
    };
    setupListener();
    return () => {
      if (unlisten) unlisten();
    };
  }, [isRunning, lastConfigUsed]);

  const saveToHistory = async (finalStats) => {
    if (!lastConfigUsed) return;
    
    try {
      const successRate = finalStats.iterations > 0 
        ? finalStats.hits / finalStats.iterations 
        : 0;
        
      const rpsValue = finalStats.iterations / (finalStats.elapsedSecs || 1);

      await invoke('save_test_result', {
        url: lastConfigUsed.url,
        method: lastConfigUsed.method,
        configJson: JSON.stringify(lastConfigUsed),
        statsJson: JSON.stringify(finalStats),
        successRate: successRate,
        p99: finalStats.p99,
        rps: rpsValue
      });
      console.log('Test result saved to history');
    } catch (error) {
      console.error('Failed to save test result:', error);
    }
  };

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const update = await check();
        if (update) {
          console.log(`Update to ${update.version} available! Date: ${update.date}`);
          let downloaded = 0;
          let contentLength = 0;

          const confirmed = await ask(
            `A new version (${update.version}) is available. Would you like to install it now?`,
            { title: 'Update Available', kind: 'info' }
          );

          if (confirmed) {
            await update.downloadAndInstall((event) => {
              switch (event.event) {
                case 'Started':
                  contentLength = event.data.contentLength;
                  console.log(`started downloading ${event.data.contentLength} bytes`);
                  break;
                case 'Progress':
                  downloaded += event.data.chunkLength;
                  console.log(`downloaded ${downloaded} from ${contentLength}`);
                  break;
                case 'Finished':
                  console.log('download finished');
                  break;
              }
            });

            await message('Update installed successfully. The application will now restart.', {
              title: 'Update Complete',
              kind: 'info'
            });
            await relaunch();
          }
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    };

    checkForUpdates();
  }, []);

  const handleStart = async () => {
    setIsRunning(true);
    setStats(prev => ({ ...prev, vusers: config.threads }));
    
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
      // Advanced Settings
      timeout_secs: settings.timeout,
      user_agent: settings.userAgent,
      ignore_ssl: settings.ignoreSsl,
      follow_redirects: settings.followRedirects,
      max_redirects: settings.maxRedirects,
      dns_cache: settings.dnsCache,
      keep_alive: settings.keepAlive,
      rps_limit: settings.rpsLimit,
      assertions: config.assertions,
      ramp_up_secs: config.ramp_up_secs || null,
      csv_data_path: config.csv_data_path || null,
      env_vars: config.env_vars || null,
    };
    
    setLastConfigUsed(payload);

    try {
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
      <OnboardingWizard 
        isOpen={showOnboarding} 
        onClose={handleCloseOnboarding} 
        initialConfig={config}
        onSave={(newConfig) => {
          setConfig(prev => ({ ...prev, ...newConfig }));
          setActivePage('dashboard');
        }}
      />
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onShowTutorial={handleShowTutorial}
      />
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
      {activePage === 'history' && (
        <HistoryPage />
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
      {activePage === 'settings' && (
        <SettingsPage
          settings={settings}
          onSave={(newSettings) => {
            setSettings(newSettings);
            localStorage.setItem('nexus_settings', JSON.stringify(newSettings));
            setActivePage('dashboard');
          }}
        />
      )}
    </div>
  );
}


export default App;
