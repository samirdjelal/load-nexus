import React from 'react';
import HeaderStats from './HeaderStats';
import LiveChart from './LiveChart';

const Dashboard = ({ config, stats, isRunning, handleStart, handleStop, onNavigate }) => {
    const [activeTab, setActiveTab] = React.useState('percentiles');

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-dark relative">
            <header className="bg-surface-dark border-b border-surface-border flex flex-col flex-shrink-0">
                <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border/50">
                    <h2 className="text-2xl font-light text-white tracking-wide">
                        Load Nexus
                    </h2>
                    <div className="flex items-center gap-3">
                        {!isRunning ? (
                            <button
                                onClick={handleStart}
                                className="px-5 py-2 rounded-md text-xs font-bold uppercase tracking-wider bg-primary hover:bg-primary/90 text-background-dark transition-all duration-300 shadow-[0_0_15px_rgba(255,170,0,0.3)] hover:shadow-[0_0_25px_rgba(255,170,0,0.5)] flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">play_circle</span> Start
                            </button>
                        ) : (
                            <button
                                onClick={handleStop}
                                className="px-5 py-2 rounded-md text-xs font-bold uppercase tracking-wider bg-chart-red/10 hover:bg-chart-red/20 text-chart-red transition-all duration-300 border border-chart-red/30 hover:border-chart-red/50 hover:shadow-[0_0_15px_rgba(252,165,165,0.2)] flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">stop_circle</span> Stop
                            </button>
                        )}
                    </div>
                </div>

                <HeaderStats stats={stats} targetDuration={config.duration} />

                <div className="px-6 flex items-center gap-1 mt-6 mb-4">
                    <div className="inline-flex bg-background-dark/80 p-1 rounded-lg border border-surface-border/50">
                        <button
                            onClick={() => setActiveTab('percentiles')}
                            className={`px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-200 ${activeTab === 'percentiles'
                                    ? 'bg-surface-border text-white shadow-sm'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-border/30'
                                }`}
                        >
                            Response Time
                        </button>
                        <button
                            onClick={() => setActiveTab('throughput')}
                            className={`px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-200 ${activeTab === 'throughput'
                                    ? 'bg-surface-border text-white shadow-sm'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-border/30'
                                }`}
                        >
                            Throughput
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-0 custom-scrollbar bg-background-dark relative">
                <div className="w-full h-full flex flex-col md:flex-row">
                    <LiveChart stats={stats} activeTab={activeTab} />
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
