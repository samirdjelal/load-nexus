import React from 'react';

const HeaderStats = ({ stats }) => {
    return (
        <div className="px-6 py-4">
            <div className="flex justify-between items-end mb-2">
                <div className="h-8 w-64 bg-accent-orange progress-stripe relative overflow-hidden rounded-sm"></div>
                <div className="text-white font-mono font-bold text-lg tracking-wider">
                    {stats.duration} <span className="text-text-secondary text-base font-normal">/ 0:11:00</span>
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
