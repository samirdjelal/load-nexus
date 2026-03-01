import React from 'react';

const HeaderStats = ({ stats, targetDuration }) => {
    const progress = targetDuration > 0 ? Math.min((stats.elapsedSecs / targetDuration) * 100, 100) : 0;

    // Format target duration as H:MM:SS
    const formatDuration = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="px-6 py-4">
            <div className="flex justify-between items-end mb-2">
                <div className="h-8 w-64 bg-surface-border relative overflow-hidden rounded-sm">
                    <div
                        className="absolute inset-y-0 left-0 bg-primary progress-stripe transition-all duration-1000 ease-linear"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <div className="text-white font-mono font-bold text-lg tracking-wider">
                    {stats.duration} <span className="text-text-secondary text-base font-normal">/ {formatDuration(targetDuration)}</span>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-px bg-surface-border mt-4 border border-surface-border rounded-sm overflow-hidden">
                <div className="bg-surface-dark p-4 flex flex-col justify-between h-24 hover:bg-[#2a2a2a] transition-colors">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">Duration</span>
                    <span className="text-2xl font-bold text-white font-mono">{stats.duration}</span>
                </div>
                <div className="bg-surface-dark p-4 flex flex-col justify-between h-24 hover:bg-[#2a2a2a] transition-colors">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">V-Users</span>
                    <span className="text-2xl font-bold text-white font-mono">{stats.vusers} <span className="text-text-secondary text-lg">/ {stats.vusers}</span></span>
                </div>
                <div className="bg-surface-dark p-4 flex flex-col justify-between h-24 hover:bg-[#2a2a2a] transition-colors">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">Iterations</span>
                    <span className="text-2xl font-bold text-white font-mono">{stats.iterations}</span>
                </div>
                <div className="bg-surface-dark p-4 flex flex-col justify-between h-24 hover:bg-[#2a2a2a] transition-colors">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">Hits</span>
                    <span className="text-2xl font-bold text-white font-mono">{stats.hits}</span>
                </div>

                <div className="bg-surface-dark p-4 flex flex-col justify-between h-24 hover:bg-[#2a2a2a] transition-colors">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">Avg Response Time</span>
                    <span className="text-2xl font-bold text-white font-mono">{stats.avgResponse} s</span>
                </div>
                <div className="bg-surface-dark p-4 flex flex-col justify-between h-24 hover:bg-[#2a2a2a] transition-colors">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">P50 Response Time</span>
                    <span className="text-2xl font-bold text-white font-mono">{stats.p50} s</span>
                </div>
                <div className="bg-surface-dark p-4 flex flex-col justify-between h-24 hover:bg-[#2a2a2a] transition-colors">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">P90 Response Time</span>
                    <span className="text-2xl font-bold text-white font-mono">{stats.p90} s</span>
                </div>
                <div className="bg-surface-dark p-4 flex flex-col justify-between h-24 hover:bg-[#2a2a2a] transition-colors">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">Errors</span>
                    <span className={`text-2xl font-bold font-mono ${stats.errors > 0 ? 'text-chart-red' : 'text-white'}`}>
                        {stats.errors}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default HeaderStats;
