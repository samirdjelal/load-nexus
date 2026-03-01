import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import HeaderStats from './HeaderStats';
import LiveChart from './LiveChart';
import ConfigurationForm from './ConfigurationForm';

const Dashboard = () => {
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [isRunning, setIsRunning] = useState(false);

    const [config, setConfig] = useState({
        url: 'https://httpbin.org/get',
        method: 'GET',
        threads: 10,
        duration: 60,
        authType: 'none',
        bearerToken: '',
        bodyType: 'none',
        bodyData: '',
        customHeaders: ''
    });

    const [stats, setStats] = useState({
        duration: "0:00:00",
        elapsed_secs: 0,
        vusers: 0,
        iterations: 0,
        hits: 0,
        avgResponse: 0,
        p50: 0,
        p80: 0,
        p90: 0,
        p95: 0,
        p99: 0,
        errors: 0
    });

    useEffect(() => {
        let unlisten;
        const setupListener = async () => {
            unlisten = await listen('load_test_progress', (event) => {
                setStats(event.payload);
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
                body_type: config.bodyType,
                body_data: config.bodyData || null,
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
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-dark relative">
            <header className="bg-surface-dark border-b border-surface-border flex flex-col flex-shrink-0">
                <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border/50">
                    <h2 className="text-2xl font-light text-white tracking-wide">
                        Live Load Test Analytics: <span className="font-bold">API Stress Test v1</span>
                    </h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsConfigOpen(true)}
                            className="bg-surface-border hover:bg-white/10 text-white px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 border border-white/10 transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">settings</span> Configure
                        </button>
                        {!isRunning ? (
                            <button
                                onClick={handleStart}
                                className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 border border-primary transition-colors shadow-[0_0_15px_rgba(19,91,236,0.5)]"
                            >
                                <span className="material-symbols-outlined text-sm">play_circle</span> Start
                            </button>
                        ) : (
                            <button
                                onClick={handleStop}
                                className="bg-chart-red/20 hover:bg-chart-red/30 text-chart-red px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 border border-chart-red/50 transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">stop_circle</span> Stop
                            </button>
                        )}
                    </div>
                </div>

                <HeaderStats stats={stats} />

                <div className="px-6 flex items-end gap-1 mt-2">
                    <button className="px-6 py-3 text-sm font-bold text-white bg-surface-dark border-t-2 border-chart-teal relative top-[1px] shadow-[0_-2px_10px_rgba(0,0,0,0.2)]">
                        Response Time Percentiles
                    </button>
                    <button className="px-6 py-3 text-sm font-medium text-text-secondary hover:text-white transition-colors bg-transparent border-b-2 border-transparent">
                        Network Throughput
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-0 custom-scrollbar bg-background-dark relative">
                <div className="w-full h-full flex flex-col md:flex-row">
                    <LiveChart stats={stats} />
                </div>
            </main>

            {isConfigOpen && (
                <ConfigurationForm
                    initialConfig={config}
                    onSave={(newConf) => setConfig(newConf)}
                    onClose={() => setIsConfigOpen(false)}
                />
            )}
        </div>
    );
};

export default Dashboard;
