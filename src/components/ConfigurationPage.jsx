import React, { useState } from 'react';
import { open, save } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { parseCurlCommand } from '../utils/curlParser';

const ConfigurationPage = ({ initialConfig, onSave, onCancel }) => {
    const [config, setConfig] = useState(initialConfig || {
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

    const [isCurlModalOpen, setIsCurlModalOpen] = useState(false);
    const [curlInput, setCurlInput] = useState('');

    const handleChange = (e) => {
        setConfig({ ...config, [e.target.name]: e.target.value });
    };

    const handleSaveConfig = () => {
        onSave(config);
    };

    const handleCancel = () => {
        if (onCancel) onCancel();
    };

    const handleExportProject = async () => {
        try {
            const filePath = await save({
                filters: [{ name: 'Nexus Project', extensions: ['nexus', 'json'] }],
                defaultPath: 'my_scenario.nexus'
            });
            if (filePath) {
                await invoke('save_report', { path: filePath, content: JSON.stringify(config, null, 2) });
            }
        } catch (error) {
            console.error('Failed to export project:', error);
        }
    };

    const handleImportProject = async () => {
        try {
            const selected = await open({
                filters: [{ name: 'Nexus Project', extensions: ['nexus', 'json'] }],
                multiple: false
            });
            if (selected) {
                const content = await invoke('load_file', { path: selected });
                setConfig(JSON.parse(content));
            }
        } catch (error) {
            console.error('Failed to import project:', error);
        }
    };

    const handleApplyCurl = () => {
        const parsedConfig = parseCurlCommand(curlInput);
        if (parsedConfig) {
            setConfig({
                ...config,
                ...parsedConfig
            });
            setIsCurlModalOpen(false);
            setCurlInput('');
        } else {
            alert('Invalid cURL command or empty input.');
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-dark relative">
            <header className="bg-surface-dark border-b border-surface-border flex flex-col flex-shrink-0 relative z-10">
                <div className="flex items-center justify-between px-6 py-4">
                    <h2 className="text-2xl font-light text-white tracking-wide">
                        Scenario Details
                    </h2>
                    <div className="flex items-center gap-2">
                        {/* Utility actions group */}
                        <div className="flex items-center bg-background-dark/60 border border-surface-border/60 rounded-lg p-1 gap-0.5">
                            <button
                                onClick={() => setIsCurlModalOpen(true)}
                                title="Fill from cURL"
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-primary hover:text-primary/80 hover:bg-primary/10 transition-all duration-150"
                            >
                                <span className="material-symbols-outlined" style={{fontSize:'16px'}}>terminal</span>
                                <span className="hidden sm:inline">cURL</span>
                            </button>
                            <div className="w-px h-4 bg-surface-border/60" />
                            <button
                                onClick={handleImportProject}
                                title="Load Project"
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-text-secondary hover:text-white hover:bg-surface-border/50 transition-all duration-150"
                            >
                                <span className="material-symbols-outlined" style={{fontSize:'16px'}}>folder_open</span>
                                <span className="hidden sm:inline">Load</span>
                            </button>
                            <div className="w-px h-4 bg-surface-border/60" />
                            <button
                                onClick={handleExportProject}
                                title="Save Project"
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-text-secondary hover:text-white hover:bg-surface-border/50 transition-all duration-150"
                            >
                                <span className="material-symbols-outlined" style={{fontSize:'16px'}}>save_as</span>
                                <span className="hidden sm:inline">Save</span>
                            </button>
                        </div>

                        {/* Separator */}
                        <div className="w-px h-5 bg-surface-border/40 mx-1" />

                        {/* Cancel */}
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-white hover:bg-surface-border/40 transition-all duration-150"
                        >
                            <span className="material-symbols-outlined" style={{fontSize:'15px'}}>close</span>
                            <span className="hidden sm:inline">Cancel</span>
                        </button>

                        {/* Primary action */}
                        <button
                            onClick={handleSaveConfig}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary hover:bg-primary/90 text-white transition-all duration-150 border border-primary/80 shadow-[0_0_12px_rgba(255,170,0,0.35)] hover:shadow-[0_0_18px_rgba(255,170,0,0.5)]"
                        >
                            <span className="material-symbols-outlined" style={{fontSize:'15px'}}>check_circle</span>
                            Apply
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto custom-scrollbar relative p-6">
                <div className="max-w-5xl mx-auto flex flex-col gap-6">
                    {/* Target & Execution Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Target Setup Card */}
                        <div className="bg-surface-dark border border-surface-border rounded-lg p-6 shadow-lg relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-xl">language</span> Target Setup
                            </h3>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Target URL</label>
                                    <input
                                        type="text"
                                        name="url"
                                        value={config.url}
                                        onChange={handleChange}
                                        className="w-full bg-background-dark/50 border border-surface-border/50 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all text-sm font-mono placeholder-text-secondary/50"
                                        placeholder="https://api.example.com/v1/users"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">HTTP Method</label>
                                    <div className="relative">
                                        <select
                                            name="method"
                                            value={config.method}
                                            onChange={handleChange}
                                            className="w-full bg-background-dark/50 border border-surface-border/50 rounded-md p-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all text-sm font-mono appearance-none"
                                        >
                                            <option value="GET">GET</option>
                                            <option value="POST">POST</option>
                                            <option value="PUT">PUT</option>
                                            <option value="DELETE">DELETE</option>
                                            <option value="PATCH">PATCH</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">expand_more</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Execution Parameters Card */}
                        <div className="bg-surface-dark border border-surface-border rounded-lg p-6 shadow-lg relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-chart-teal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-chart-teal text-xl">speed</span> Execution Parameters
                            </h3>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">V-Users (Threads)</label>
                                    <input
                                        type="number"
                                        name="threads"
                                        value={config.threads}
                                        onChange={handleChange}
                                        className="w-full bg-background-dark/50 border border-surface-border/50 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-chart-teal/40 focus:border-chart-teal/60 transition-all text-sm font-mono"
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Duration (Sec)</label>
                                    <input
                                        type="number"
                                        name="duration"
                                        value={config.duration}
                                        onChange={handleChange}
                                        className="w-full bg-background-dark/50 border border-surface-border/50 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-chart-teal/40 focus:border-chart-teal/60 transition-all text-sm font-mono"
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Ramp-up (Sec)</label>
                                    <input
                                        type="number"
                                        name="ramp_up_secs"
                                        value={config.ramp_up_secs || ''}
                                        onChange={(e) => setConfig({...config, ramp_up_secs: e.target.value ? parseInt(e.target.value) : null})}
                                        className="w-full bg-background-dark/50 border border-surface-border/50 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-chart-teal/40 focus:border-chart-teal/60 transition-all text-sm font-mono"
                                        min="0"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Authentication Card */}
                    <div className="bg-surface-dark border border-surface-border rounded-lg p-6 shadow-lg">
                        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-chart-purple text-xl">lock</span> Authentication
                        </h3>

                        <div className="mb-6">
                            <div className="inline-flex bg-background-dark/80 p-1 rounded-lg border border-surface-border/50">
                                {['none', 'bearer', 'basic'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setConfig({ ...config, authType: type })}
                                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-200 ${config.authType === type
                                            ? 'bg-surface-border text-white shadow-sm'
                                            : 'text-text-secondary hover:text-text-primary hover:bg-surface-border/30'
                                            }`}
                                    >
                                        {type === 'none' ? 'None' : type === 'bearer' ? 'Bearer Token' : 'Basic Auth'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="transition-all duration-300">
                            {config.authType === 'bearer' && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Bearer Token</label>
                                    <input
                                        type="text"
                                        name="bearerToken"
                                        value={config.bearerToken}
                                        onChange={handleChange}
                                        className="w-full bg-background-dark/50 border border-surface-border/50 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-chart-purple/40 focus:border-chart-purple/60 transition-all text-sm font-mono placeholder-text-secondary/50"
                                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                                    />
                                    <p className="text-xs text-text-secondary mt-2">Token will be sent in the Authorization header as Bearer [token]</p>
                                </div>
                            )}
                            {config.authType === 'basic' && (
                                <div className="grid grid-cols-2 gap-5 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Username</label>
                                        <input
                                            type="text"
                                            name="basicUser"
                                            value={config.basicUser}
                                            onChange={handleChange}
                                            className="w-full bg-background-dark/50 border border-surface-border/50 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-chart-purple/40 focus:border-chart-purple/60 transition-all text-sm font-mono"
                                            placeholder="Username"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Password</label>
                                        <input
                                            type="password"
                                            name="basicPass"
                                            value={config.basicPass}
                                            onChange={handleChange}
                                            className="w-full bg-background-dark/50 border border-surface-border/50 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-chart-purple/40 focus:border-chart-purple/60 transition-all text-sm font-mono"
                                            placeholder="Password"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Data & Variables Card */}
                    <div className="bg-surface-dark border border-surface-border rounded-lg p-6 shadow-lg mb-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-400 text-xl">dataset</span> Data & Variables
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Environment Variables</label>
                                <textarea
                                    value={config.env_vars ? Object.entries(config.env_vars).map(([k,v]) => `${k}=${v}`).join('\n') : ''}
                                    onChange={(e) => {
                                        const lines = e.target.value.split('\n');
                                        const vars = {};
                                        lines.forEach(line => {
                                            const [k, ...v] = line.split('=');
                                            if (k && v.length) vars[k.trim()] = v.join('=').trim();
                                        });
                                        setConfig({...config, env_vars: Object.keys(vars).length > 0 ? vars : null});
                                    }}
                                    className="w-full bg-background-dark/50 border border-surface-border/50 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400/60 transition-all text-sm font-mono h-24"
                                    placeholder="BASE_URL=https://api.example.com&#10;TOKEN=secret123"
                                />
                                <p className="text-xs text-text-secondary mt-1">Use as {'{{'}VAR_NAME{'}}'} in URL, Headers, or Body</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">CSV Data Source</label>
                                <div className="flex flex-col items-center justify-center border-2 border-dashed border-surface-border/50 rounded-md bg-background-dark/20 p-4 relative group h-24">
                                    <button
                                        onClick={async () => {
                                            const selected = await open({
                                                multiple: false,
                                                filters: [{ name: 'CSV', extensions: ['csv'] }]
                                            });
                                            if (selected) {
                                                setConfig({ ...config, csv_data_path: selected });
                                            }
                                        }}
                                        className="px-4 py-1.5 rounded-md text-xs font-medium bg-surface-dark hover:bg-surface-border text-white transition-all border border-surface-border shadow-md flex items-center gap-2 mb-2"
                                    >
                                        <span className="material-symbols-outlined text-blue-400 text-sm">upload_file</span>
                                        Select CSV
                                    </button>
                                    {config.csv_data_path ? (
                                        <p className="text-xs text-white font-mono truncate max-w-full" title={config.csv_data_path}>
                                            {config.csv_data_path.split('\\').pop().split('/').pop()}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-text-secondary font-mono">No CSV selected</p>
                                    )}
                                </div>
                                <p className="text-xs text-text-secondary mt-1">Columns map to {'{{'}column_name{'}}'} variables, iterated sequentially.</p>
                            </div>
                        </div>
                    </div>

                    {/* Assertions Card */}
                    <div className="bg-surface-dark border border-surface-border rounded-lg p-6 shadow-lg mb-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-400 text-xl">rule</span> Response Assertions
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Expected Status</label>
                                <input
                                    type="number"
                                    value={config.assertions?.status_code || ''}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        assertions: { ...config.assertions, status_code: e.target.value ? parseInt(e.target.value) : null }
                                    })}
                                    className="w-full bg-background-dark/50 border border-surface-border/50 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-400/40 focus:border-red-400/60 transition-all text-sm font-mono"
                                    placeholder="200"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Max Latency (ms)</label>
                                <input
                                    type="number"
                                    value={config.assertions?.max_latency_ms || ''}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        assertions: { ...config.assertions, max_latency_ms: e.target.value ? parseFloat(e.target.value) : null }
                                    })}
                                    className="w-full bg-background-dark/50 border border-surface-border/50 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-400/40 focus:border-red-400/60 transition-all text-sm font-mono"
                                    placeholder="500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Body Contains</label>
                                <input
                                    type="text"
                                    value={config.assertions?.body_contains || ''}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        assertions: { ...config.assertions, body_contains: e.target.value || null }
                                    })}
                                    className="w-full bg-background-dark/50 border border-surface-border/50 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-400/40 focus:border-red-400/60 transition-all text-sm font-mono"
                                    placeholder="success"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payload & Headers Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
                        {/* Request Body Card */}
                        <div className="bg-surface-dark border border-surface-border rounded-lg p-6 shadow-lg flex flex-col">
                            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-chart-green text-xl">data_object</span> Request Body
                            </h3>

                            <div className="mb-4">
                                <div className="inline-flex bg-background-dark/80 p-1 rounded-lg border border-surface-border/50 w-full overflow-x-auto custom-scrollbar">
                                    {['none', 'json', 'graphql', 'formdata', 'file'].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setConfig({ ...config, bodyType: type })}
                                            className={`flex-1 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-200 whitespace-nowrap ${config.bodyType === type
                                                ? 'bg-surface-border text-white shadow-sm'
                                                : 'text-text-secondary hover:text-text-primary hover:bg-surface-border/30'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {config.bodyType === 'file' ? (
                                <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-top-2 duration-300 min-h-[160px] gap-4">
                                    <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-surface-border/50 rounded-md bg-background-dark/20 p-6 relative group">
                                        <button
                                            onClick={async () => {
                                                const selected = await open({
                                                    multiple: false,
                                                });
                                                if (selected) {
                                                    setConfig({ ...config, filePath: selected });
                                                }
                                            }}
                                            className="px-6 py-2.5 rounded-md text-sm font-medium bg-surface-dark hover:bg-surface-border text-white transition-all border border-surface-border shadow-md flex items-center gap-2 mb-4 group-hover:bg-surface-border"
                                        >
                                            <span className="material-symbols-outlined text-chart-green group-hover:scale-110 transition-transform">upload_file</span>
                                            Select File
                                        </button>
                                        {config.filePath ? (
                                            <div className="text-center w-full">
                                                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Selected File</p>
                                                <p className="text-sm text-white font-mono truncate px-4 max-w-full" title={config.filePath}>
                                                    {config.filePath.split('\\').pop().split('/').pop()}
                                                </p>
                                                <p className="text-xs text-text-secondary/60 mt-2 truncate max-w-full" title={config.filePath}>
                                                    {config.filePath}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-text-secondary font-mono">No file selected</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Form Field Name</label>
                                        <input
                                            type="text"
                                            name="fileKey"
                                            value={config.fileKey || 'file'}
                                            onChange={handleChange}
                                            className="w-full bg-background-dark/50 border border-surface-border/50 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-chart-green/40 focus:border-chart-green/60 transition-all text-sm font-mono placeholder-text-secondary/50"
                                            placeholder="file"
                                        />
                                        <p className="text-xs text-text-secondary mt-1">The key used for the multipart form data</p>
                                    </div>
                                </div>
                            ) : config.bodyType !== 'none' ? (
                                <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-top-2 duration-300 min-h-[160px]">
                                    <textarea
                                        name="bodyData"
                                        value={config.bodyData}
                                        onChange={handleChange}
                                        className="w-full flex-1 bg-background-dark/50 border border-surface-border/50 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-chart-green/40 focus:border-chart-green/60 transition-all text-sm font-mono custom-scrollbar resize-none placeholder-text-secondary/50"
                                        placeholder={config.bodyType === 'json' ? '{\n  "key": "value"\n}' : config.bodyType === 'graphql' ? 'query {\n  users {\n    id\n  }\n}' : 'key=value\nkey2=value2'}
                                    ></textarea>
                                </div>
                            ) : (
                                <div className="flex-1 border-2 border-dashed border-surface-border/50 rounded-md flex items-center justify-center min-h-[160px] bg-background-dark/20">
                                    <p className="text-text-secondary text-sm font-mono">No body for this request</p>
                                </div>
                            )}
                        </div>

                        {/* Custom Headers Card */}
                        <div className="bg-surface-dark border border-surface-border rounded-lg p-6 shadow-lg flex flex-col">
                            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-chart-blue text-xl">list_alt</span> Custom Headers
                            </h3>

                            <div className="flex-1 flex flex-col min-h-[212px]">
                                <textarea
                                    name="customHeaders"
                                    value={config.customHeaders}
                                    onChange={handleChange}
                                    className="w-full flex-1 bg-background-dark/50 border border-surface-border/50 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-chart-blue/40 focus:border-chart-blue/60 transition-all text-sm font-mono custom-scrollbar resize-none placeholder-text-secondary/50"
                                    placeholder="Content-Type: application/json&#10;User-Agent: LoadNexus/1.0&#10;X-Custom-Auth: your_token_here"
                                ></textarea>
                                <p className="text-xs text-text-secondary mt-3">Enter one header per line in format key: value</p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* cURL Import Modal */}
            {isCurlModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-surface-dark border border-surface-border rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between bg-background-dark/30">
                            <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">terminal</span>
                                Import from cURL
                            </h3>
                            <button 
                                onClick={() => setIsCurlModalOpen(false)}
                                className="text-text-secondary hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-text-secondary mb-4">
                                Paste a cURL command below to automatically fill the configuration.
                            </p>
                            <textarea
                                value={curlInput}
                                onChange={(e) => setCurlInput(e.target.value)}
                                className="w-full h-48 bg-background-dark/50 border border-surface-border rounded-lg p-4 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all resize-none custom-scrollbar"
                                placeholder='curl -X POST https://api.example.com/data \
  -H "Content-Type: application/json" \
  -d "{\"key\": \"value\"}"'
                            ></textarea>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsCurlModalOpen(false)}
                                    className="px-4 py-2 rounded-md text-sm font-medium text-text-secondary hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApplyCurl}
                                    className="px-6 py-2 rounded-md text-sm font-medium bg-primary hover:bg-primary/90 text-white transition-all shadow-[0_0_15px_rgba(255,170,0,0.3)] hover:shadow-[0_0_20px_rgba(255,170,0,0.5)]"
                                >
                                    Parse & Apply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConfigurationPage;
