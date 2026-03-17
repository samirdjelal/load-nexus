import React, { useState } from 'react';
import { Save, RotateCcw, Shield, Globe, Clock, Zap } from 'lucide-react';

const SettingsPage = ({ settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState(settings || {
    timeout: 30,
    userAgent: 'LoadNexus/1.0',
    ignoreSsl: false,
    followRedirects: true,
    maxRedirects: 5,
    dnsCache: true,
    keepAlive: true,
    rpsLimit: 0,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value, 10) || 0 : value)
    }));
  };

  const handleSave = () => {
    onSave(localSettings);
  };

  const handleReset = () => {
    const defaults = {
      timeout: 30,
      userAgent: 'LoadNexus/1.0',
      ignoreSsl: false,
      followRedirects: true,
      maxRedirects: 5,
      dnsCache: true,
      keepAlive: true,
      rpsLimit: 0,
    };
    setLocalSettings(defaults);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-dark">
      <header className="bg-surface-dark border-b border-surface-border flex flex-col flex-shrink-0 relative z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-2xl font-light text-white tracking-wide">
            Global Settings
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-1.5 rounded text-sm font-medium text-text-secondary hover:text-white transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Reset Defaults
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded text-sm font-medium bg-primary hover:bg-primary/90 text-white transition-colors border border-primary shadow-[0_0_15px_rgba(255,170,0,0.4)] flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Settings
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Network & Performance */}
          <div className="bg-surface-dark border border-surface-border rounded-lg p-6 shadow-lg">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Network & Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Request Timeout (seconds)</label>
                <input
                  type="number"
                  name="timeout"
                  value={localSettings.timeout}
                  onChange={handleChange}
                  className="w-full bg-background-dark/50 border border-surface-border/50 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm font-mono"
                  min="1"
                />
                <p className="text-xs text-text-secondary mt-2">Maximum time to wait for a single request response.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Global RPS Limit (0 for no limit)</label>
                <input
                  type="number"
                  name="rpsLimit"
                  value={localSettings.rpsLimit}
                  onChange={handleChange}
                  className="w-full bg-background-dark/50 border border-surface-border/50 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm font-mono"
                  min="0"
                />
                <p className="text-xs text-text-secondary mt-2">Limit total Requests Per Second across all threads.</p>
              </div>
              <div className="flex items-center justify-between p-4 bg-background-dark/30 rounded-lg border border-surface-border/30">
                <div>
                  <label className="block text-sm font-medium text-white">Enable Keep-Alive</label>
                  <p className="text-xs text-text-secondary">Reuse connections for multiple requests.</p>
                </div>
                <input
                  type="checkbox"
                  name="keepAlive"
                  checked={localSettings.keepAlive}
                  onChange={handleChange}
                  className="w-5 h-5 accent-primary"
                />
              </div>
            </div>
          </div>

          {/* Identity & Browser Simulation */}
          <div className="bg-surface-dark border border-surface-border rounded-lg p-6 shadow-lg">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-chart-blue" /> Identity & Browser
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Default User-Agent</label>
                <input
                  type="text"
                  name="userAgent"
                  value={localSettings.userAgent}
                  onChange={handleChange}
                  className="w-full bg-background-dark/50 border border-surface-border/50 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-chart-blue/40 transition-all text-sm font-mono"
                  placeholder="LoadNexus/1.0"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 bg-background-dark/30 rounded-lg border border-surface-border/30">
                  <div>
                    <label className="block text-sm font-medium text-white">Follow Redirects</label>
                    <p className="text-xs text-text-secondary">Automatically follow HTTP 3xx responses.</p>
                  </div>
                  <input
                    type="checkbox"
                    name="followRedirects"
                    checked={localSettings.followRedirects}
                    onChange={handleChange}
                    className="w-5 h-5 accent-chart-blue"
                  />
                </div>
                {localSettings.followRedirects && (
                  <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Max Redirects</label>
                    <input
                      type="number"
                      name="maxRedirects"
                      value={localSettings.maxRedirects}
                      onChange={handleChange}
                      className="w-full bg-background-dark/50 border border-surface-border/50 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-chart-blue/40 transition-all text-sm font-mono"
                      min="1"
                      max="20"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Security & Advanced */}
          <div className="bg-surface-dark border border-surface-border rounded-lg p-6 shadow-lg">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-chart-purple" /> Security & Advanced
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 bg-background-dark/30 rounded-lg border border-surface-border/30">
                <div>
                  <label className="block text-sm font-medium text-white">Ignore SSL Errors</label>
                  <p className="text-xs text-text-secondary">Allow invalid or self-signed certificates.</p>
                </div>
                <input
                  type="checkbox"
                  name="ignoreSsl"
                  checked={localSettings.ignoreSsl}
                  onChange={handleChange}
                  className="w-5 h-5 accent-chart-purple"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-background-dark/30 rounded-lg border border-surface-border/30">
                <div>
                  <label className="block text-sm font-medium text-white">DNS Caching</label>
                  <p className="text-xs text-text-secondary">Cache DNS lookups to reduce overhead.</p>
                </div>
                <input
                  type="checkbox"
                  name="dnsCache"
                  checked={localSettings.dnsCache}
                  onChange={handleChange}
                  className="w-5 h-5 accent-chart-purple"
                />
              </div>
            </div>
          </div>

          {/* Stress Testing specific help */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5" /> Stress Testing Tip
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              For high-intensity stress testing, disabling SSL verification and DNS caching can sometimes help achieve higher RPS by reducing client-side CPU overhead, but it may not accurately reflect real-world user conditions. Use "Keep-Alive" to simulate modern browser behavior.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
