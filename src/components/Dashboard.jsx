import React from 'react';
import HeaderStats from './HeaderStats';
import LiveChart from './LiveChart';

const Dashboard = ({ config, stats, isRunning, handleStart, handleStop, onNavigate }) => {

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-dark relative">
            <header className="bg-surface-dark border-b border-surface-border flex flex-col flex-shrink-0">
                <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border/50">
                    <h2 className="text-2xl font-light text-white tracking-wide">
                        Load-Nexus
                    </h2>
                    <div className="flex items-center gap-3">
                        {!isRunning ? (
                            <button
                                onClick={handleStart}
                                className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 border border-primary transition-colors shadow-[0_0_15px_rgba(255,170,0,0.4)]"
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

                <HeaderStats stats={stats} targetDuration={config.duration} />

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
        </div>
    );
};

export default Dashboard;
