import React, { useState } from 'react';

const ConfigurationForm = ({ initialConfig, onSave, onClose }) => {
    const [config, setConfig] = useState(initialConfig || {
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

    const handleChange = (e) => {
        setConfig({ ...config, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        onSave(config);
        onClose();
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-surface-dark border border-surface-border w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-surface-border flex justify-between items-center bg-surface-dark/80">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">settings</span> Test Configuration
                    </h3>
                    <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[70vh] flex flex-col gap-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Target URL</label>
                            <input
                                type="text"
                                name="url"
                                value={config.url}
                                onChange={handleChange}
                                className="w-full bg-background-dark border border-surface-border rounded p-2.5 text-white focus:outline-none focus:border-primary transition-colors text-sm font-mono"
                                placeholder="https://api.example.com/v1/users"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Method</label>
                            <select
                                name="method"
                                value={config.method}
                                onChange={handleChange}
                                className="w-full bg-background-dark border border-surface-border rounded p-2.5 text-white focus:outline-none focus:border-primary transition-colors text-sm font-mono appearance-none"
                            >
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="DELETE">DELETE</option>
                                <option value="PATCH">PATCH</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">V-Users (Threads)</label>
                            <input
                                type="number"
                                name="threads"
                                value={config.threads}
                                onChange={handleChange}
                                className="w-full bg-background-dark border border-surface-border rounded p-2.5 text-white focus:outline-none focus:border-primary transition-colors text-sm font-mono"
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
                                className="w-full bg-background-dark border border-surface-border rounded p-2.5 text-white focus:outline-none focus:border-primary transition-colors text-sm font-mono"
                                min="1"
                            />
                        </div>
                    </div>

                    <div className="border-t border-surface-border pt-6">
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Authentication</label>
                        <div className="flex gap-4 mb-4">
                            <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                                <input type="radio" name="authType" value="none" checked={config.authType === 'none'} onChange={handleChange} className="accent-primary w-4 h-4 bg-background-dark border-surface-border" /> None
                            </label>
                            <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                                <input type="radio" name="authType" value="bearer" checked={config.authType === 'bearer'} onChange={handleChange} className="accent-primary w-4 h-4 bg-background-dark border-surface-border" /> Bearer Token
                            </label>
                        </div>
                        {config.authType === 'bearer' && (
                            <input
                                type="text"
                                name="bearerToken"
                                value={config.bearerToken}
                                onChange={handleChange}
                                className="w-full bg-background-dark border border-surface-border rounded p-2.5 text-white focus:outline-none focus:border-primary transition-colors text-sm font-mono"
                                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                            />
                        )}
                    </div>

                    <div className="border-t border-surface-border pt-6">
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Request Body</label>
                        <div className="flex gap-4 mb-4">
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
                                className="w-full bg-background-dark border border-surface-border rounded p-2.5 text-white focus:outline-none focus:border-primary transition-colors text-sm font-mono h-32 custom-scrollbar"
                                placeholder={config.bodyType === 'json' ? '{\n  "key": "value"\n}' : config.bodyType === 'graphql' ? 'query {\n  users {\n    id\n  }\n}' : 'key=value\nkey2=value2'}
                            ></textarea>
                        )}
                    </div>

                    <div className="border-t border-surface-border pt-6">
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Custom Headers (JSON)</label>
                        <textarea
                            name="customHeaders"
                            value={config.customHeaders}
                            onChange={handleChange}
                            className="w-full bg-background-dark border border-surface-border rounded p-2.5 text-white focus:outline-none focus:border-primary transition-colors text-sm font-mono h-24 custom-scrollbar"
                            placeholder='{\n  "Content-Type": "application/json",\n  "User-Agent": "LoadNexus/1.0"\n}'
                        ></textarea>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-surface-border bg-surface-dark/80 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded text-sm font-medium text-text-secondary hover:text-white transition-colors border border-transparent hover:bg-white/5"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded text-sm font-medium bg-primary hover:bg-primary/90 text-white transition-colors border border-primary shadow-[0_0_15px_rgba(19,91,236,0.3)] flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">save</span> Apply Configuration
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfigurationForm;
