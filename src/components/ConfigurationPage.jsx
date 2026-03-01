import React, { useState } from 'react';

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
        customHeaders: ''
    });

    const handleChange = (e) => {
        setConfig({ ...config, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        onSave(config);
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-dark relative">
            <header className="bg-surface-dark border-b border-surface-border flex flex-col flex-shrink-0">
                <div className="flex items-center justify-between px-6 py-4">
                    <h2 className="text-2xl font-light text-white tracking-wide">
                        Configuration: <span className="font-bold">Current Scenario</span>
                    </h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-1.5 rounded text-sm font-medium text-text-secondary hover:text-white transition-colors border border-surface-border hover:bg-white/5"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-1.5 rounded text-sm font-medium bg-primary hover:bg-primary/90 text-white transition-colors border border-primary shadow-[0_0_15px_rgba(19,91,236,0.5)] flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">save</span> Apply Config
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
                <div className="bg-surface-dark border border-surface-border w-full max-w-4xl mx-auto rounded-xl flex flex-col pb-8">
                    <div className="px-8 py-6 border-b border-surface-border">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">play_circle</span> Request Details
                        </h3>
                    </div>

                    <div className="p-8 flex flex-col gap-8">
                        <div className="grid grid-cols-4 gap-6">
                            <div className="col-span-3">
                                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Target URL</label>
                                <input
                                    type="text"
                                    name="url"
                                    value={config.url}
                                    onChange={handleChange}
                                    className="w-full bg-background-dark border border-surface-border rounded p-3 text-white focus:outline-none focus:border-primary transition-colors text-sm font-mono"
                                    placeholder="https://api.example.com/v1/users"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Method</label>
                                <select
                                    name="method"
                                    value={config.method}
                                    onChange={handleChange}
                                    className="w-full bg-background-dark border border-surface-border rounded p-3 text-white focus:outline-none focus:border-primary transition-colors text-sm font-mono appearance-none"
                                >
                                    <option value="GET">GET</option>
                                    <option value="POST">POST</option>
                                    <option value="PUT">PUT</option>
                                    <option value="DELETE">DELETE</option>
                                    <option value="PATCH">PATCH</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">V-Users (Threads)</label>
                                <input
                                    type="number"
                                    name="threads"
                                    value={config.threads}
                                    onChange={handleChange}
                                    className="w-full bg-background-dark border border-surface-border rounded p-3 text-white focus:outline-none focus:border-primary transition-colors text-sm font-mono"
                                    min="1"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Duration (Seconds)</label>
                                <input
                                    type="number"
                                    name="duration"
                                    value={config.duration}
                                    onChange={handleChange}
                                    className="w-full bg-background-dark border border-surface-border rounded p-3 text-white focus:outline-none focus:border-primary transition-colors text-sm font-mono"
                                    min="1"
                                />
                            </div>
                        </div>

                        <div className="border-t border-surface-border pt-8 flex flex-col gap-6">
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-4">Authentication</label>
                                <div className="flex gap-6 mb-4">
                                    <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                                        <input type="radio" name="authType" value="none" checked={config.authType === 'none'} onChange={handleChange} className="accent-primary w-4 h-4 bg-background-dark border-surface-border" /> None
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                                        <input type="radio" name="authType" value="bearer" checked={config.authType === 'bearer'} onChange={handleChange} className="accent-primary w-4 h-4 bg-background-dark border-surface-border" /> Bearer Token
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                                        <input type="radio" name="authType" value="basic" checked={config.authType === 'basic'} onChange={handleChange} className="accent-primary w-4 h-4 bg-background-dark border-surface-border" /> Basic Auth
                                    </label>
                                </div>
                                {config.authType === 'bearer' && (
                                    <input
                                        type="text"
                                        name="bearerToken"
                                        value={config.bearerToken}
                                        onChange={handleChange}
                                        className="w-full bg-background-dark border border-surface-border rounded p-3 text-white focus:outline-none focus:border-primary transition-colors text-sm font-mono mt-2"
                                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                                    />
                                )}
                                {config.authType === 'basic' && (
                                    <div className="grid grid-cols-2 gap-6 mt-2">
                                        <div>
                                            <input
                                                type="text"
                                                name="basicUser"
                                                value={config.basicUser}
                                                onChange={handleChange}
                                                className="w-full bg-background-dark border border-surface-border rounded p-3 text-white focus:outline-none focus:border-primary transition-colors text-sm font-mono"
                                                placeholder="Username"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="password"
                                                name="basicPass"
                                                value={config.basicPass}
                                                onChange={handleChange}
                                                className="w-full bg-background-dark border border-surface-border rounded p-3 text-white focus:outline-none focus:border-primary transition-colors text-sm font-mono"
                                                placeholder="Password"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-surface-border pt-8 pb-2">
                                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-4">Request Body</label>
                                <div className="flex gap-6 mb-4">
                                    <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                                        <input type="radio" name="bodyType" value="none" checked={config.bodyType === 'none'} onChange={handleChange} className="accent-primary w-4 h-4 bg-background-dark border-surface-border" /> None
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                                        <input type="radio" name="bodyType" value="json" checked={config.bodyType === 'json'} onChange={handleChange} className="accent-primary w-4 h-4 bg-background-dark border-surface-border" /> JSON
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                                        <input type="radio" name="bodyType" value="graphql" checked={config.bodyType === 'graphql'} onChange={handleChange} className="accent-primary w-4 h-4 bg-background-dark border-surface-border" /> GraphQL
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                                        <input type="radio" name="bodyType" value="formdata" checked={config.bodyType === 'formdata'} onChange={handleChange} className="accent-primary w-4 h-4 bg-background-dark border-surface-border" /> FormData
                                    </label>
                                </div>
                                {config.bodyType !== 'none' && (
                                    <textarea
                                        name="bodyData"
                                        value={config.bodyData}
                                        onChange={handleChange}
                                        className="w-full bg-background-dark border border-surface-border rounded p-3 text-white focus:outline-none focus:border-primary transition-colors text-sm font-mono h-40 custom-scrollbar mt-2"
                                        placeholder={config.bodyType === 'json' ? '{\n  "key": "value"\n}' : config.bodyType === 'graphql' ? 'query {\n  users {\n    id\n  }\n}' : 'key=value\nkey2=value2'}
                                    ></textarea>
                                )}
                            </div>

                            <div className="border-t border-surface-border pt-8 pb-2">
                                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-4">Custom Headers</label>
                                <textarea
                                    name="customHeaders"
                                    value={config.customHeaders}
                                    onChange={handleChange}
                                    className="w-full bg-background-dark border border-surface-border rounded p-3 text-white focus:outline-none focus:border-primary transition-colors text-sm font-mono h-32 custom-scrollbar mt-2"
                                    placeholder="Content-Type: application/json&#10;User-Agent: LoadNexus/1.0"
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ConfigurationPage;
