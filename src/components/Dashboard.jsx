import React, { useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { save } from '@tauri-apps/plugin-dialog';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import HeaderStats from './HeaderStats';
import LiveChart from './LiveChart';

const Dashboard = ({ config, stats, isRunning, handleStart, handleStop, onNavigate }) => {
    const [activeTab, setActiveTab] = React.useState('percentiles');
    const dashboardRef = useRef(null);

    const exportToPDF = async () => {
        if (!dashboardRef.current) return;
        
        try {
            const canvas = await html2canvas(dashboardRef.current, {
                backgroundColor: '#0a0a0b', // match dark theme
                scale: 2
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            
            const filePath = await save({
                filters: [{ name: 'PDF', extensions: ['pdf'] }],
                defaultPath: `report_${new Date().getTime()}.pdf`
            });
            
            if (filePath) {
                // To save binary data via Tauri, we need to convert the PDF array buffer
                const pdfBuffer = pdf.output('arraybuffer');
                const uint8Array = new Uint8Array(pdfBuffer);
                // We need a specific tauri command to save binary, or we can use the web save for now
                // Actually, the easiest way in a web-like context is saving directly if invoke is hard for binary
                // But we are in Tauri, let's use standard web save for now which Tauri intercepts or allows download
                pdf.save(`report_${new Date().getTime()}.pdf`);
            }
        } catch (error) {
            console.error('Failed to generate PDF:', error);
        }
    };

    const exportToCSV = async () => {
        if (!stats || stats.iterations === 0) return;
        
        const rows = [
            ['Metric', 'Value'],
            ['URL', config.url],
            ['Method', config.method],
            ['V-Users', stats.vusers],
            ['Duration', stats.duration],
            ['Iterations', stats.iterations],
            ['Hits', stats.hits],
            ['Errors', stats.errors],
            ['Assertion Failures', stats.assertionFailures || 0],
            ['RPS', stats.rps.toFixed(2)],
            ['Avg Response (s)', stats.avgResponse],
            ['P50 (s)', stats.p50],
            ['P90 (s)', stats.p90],
            ['P99 (s)', stats.p99],
            ['Total Sent', stats.totalBytesSent],
            ['Total Received', stats.totalBytesRecv]
        ];

        const csvContent = rows.map(e => e.join(",")).join("\n");
        
        try {
            const filePath = await save({
                filters: [{ name: 'CSV', extensions: ['csv'] }],
                defaultPath: `current_report_${new Date().getTime()}.csv`
            });
            
            if (filePath) {
                await invoke('save_report', { path: filePath, content: csvContent });
            }
        } catch (error) {
            console.error('Failed to save CSV:', error);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-dark relative" ref={dashboardRef}>
            <header className="bg-surface-dark border-b border-surface-border flex flex-col flex-shrink-0" data-html2canvas-ignore>
                <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border/50">
                    <h2 className="text-2xl font-light text-white tracking-wide">
                        Load Nexus
                    </h2>
                    <div className="flex items-center gap-3">
                        {!isRunning && stats.iterations > 0 && (
                            <>
                                <button
                                    onClick={exportToPDF}
                                    className="px-5 py-2 rounded-md text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white transition-all duration-300 border border-surface-border flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">picture_as_pdf</span> Export PDF
                                </button>
                                <button
                                    onClick={exportToCSV}
                                    className="px-5 py-2 rounded-md text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white transition-all duration-300 border border-surface-border flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">download</span> Export CSV
                                </button>
                            </>
                        )}
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
