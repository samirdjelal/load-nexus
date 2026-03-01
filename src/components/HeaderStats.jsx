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
                <div className="bg-surface-dark p-4 flex flex-col justify-between h-24 hover:bg-[#2a2a2a] transition-colors relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary relative z-10">Duration</span>
                    <span className="text-2xl font-bold text-white font-mono relative z-10">{stats.duration}</span>
                </div>
                <div className="bg-surface-dark p-4 flex flex-col justify-between h-24 hover:bg-[#2a2a2a] transition-colors relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-chart-teal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary relative z-10">V-Users</span>
                    <span className="text-2xl font-bold text-white font-mono relative z-10">{stats.vusers} <span className="text-text-secondary text-lg">/ {stats.vusers}</span></span>
                </div>
                <div className="bg-surface-dark p-4 flex flex-col justify-between h-24 hover:bg-[#2a2a2a] transition-colors relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-chart-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary relative z-10">Iterations</span>
                    <span className="text-2xl font-bold text-white font-mono relative z-10">{stats.iterations}</span>
                </div>
                <div className="bg-surface-dark p-4 flex flex-col justify-between h-24 hover:bg-[#2a2a2a] transition-colors relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-chart-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary relative z-10">Hits</span>
                    <span className="text-2xl font-bold text-white font-mono relative z-10">{stats.hits}</span>
                </div>

                <div className="bg-surface-dark p-4 flex flex-col justify-between h-24 hover:bg-[#2a2a2a] transition-colors relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-chart-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary relative z-10">Avg Response Time</span>
                    <span className="text-2xl font-bold text-white font-mono relative z-10">{stats.avgResponse} s</span>
                </div>
                <div className="bg-surface-dark p-4 flex flex-col justify-between h-24 hover:bg-[#2a2a2a] transition-colors relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary relative z-10">P50 Response Time</span>
                    <span className="text-2xl font-bold text-white font-mono relative z-10">{stats.p50} s</span>
                </div>
                <div className="bg-surface-dark p-4 flex flex-col justify-between h-24 hover:bg-[#2a2a2a] transition-colors relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-chart-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary relative z-10">P90 Response Time</span>
                    <span className="text-2xl font-bold text-white font-mono relative z-10">{stats.p90} s</span>
                </div>
                <div className="bg-surface-dark p-4 flex flex-col justify-between h-24 hover:bg-[#2a2a2a] transition-colors relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-chart-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary relative z-10">Errors</span>
                    <span className={`text-2xl font-bold font-mono relative z-10 ${stats.errors > 0 ? 'text-chart-red' : 'text-white'}`}>
                        {stats.errors}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default HeaderStats;
