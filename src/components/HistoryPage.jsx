import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { save } from '@tauri-apps/plugin-dialog';

const HistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRuns, setSelectedRuns] = useState([]);
    const [comparing, setComparing] = useState(false);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            setLoading(true);
            const data = await invoke('get_test_history');
            setHistory(data);
        } catch (error) {
            console.error('Failed to load history:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteRun = async (id) => {
        try {
            await invoke('delete_test_run', { id });
            setHistory(history.filter(run => run.id !== id));
            setSelectedRuns(selectedRuns.filter(runId => runId !== id));
        } catch (error) {
            console.error('Failed to delete run:', error);
        }
    };

    const toggleRunSelection = (id) => {
        if (selectedRuns.includes(id)) {
            setSelectedRuns(selectedRuns.filter(runId => runId !== id));
        } else {
            if (selectedRuns.length < 2) {
                setSelectedRuns([...selectedRuns, id]);
            }
        }
    };

    const getRunById = (id) => history.find(r => r.id === id);

    const exportToCSV = async (run) => {
        const stats = JSON.parse(run.stats_json);
        
        const rows = [
            ['Metric', 'Value'],
            ['Timestamp', run.timestamp],
            ['URL', run.url],
            ['Method', run.method],
            ['V-Users', stats.vusers],
            ['Duration', stats.duration],
            ['Iterations', stats.iterations],
            ['Hits', stats.hits],
            ['Errors', stats.errors],
            ['Assertion Failures', stats.assertionFailures || 0],
            ['RPS', run.rps.toFixed(2)],
            ['Avg Response (s)', stats.avgResponse],
            ['P50 (s)', stats.p50],
            ['P90 (s)', stats.p90],
            ['P99 (s)', run.p99],
            ['Total Sent', stats.totalBytesSent],
            ['Total Received', stats.totalBytesRecv]
        ];

        const csvContent = rows.map(e => e.join(",")).join("\n");
        
        try {
            const filePath = await save({
                filters: [{ name: 'CSV', extensions: ['csv'] }],
                defaultPath: `report_${run.id}_${run.timestamp.split('T')[0]}.csv`
            });
            
            if (filePath) {
                await invoke('save_report', { path: filePath, content: csvContent });
            }
        } catch (error) {
            console.error('Failed to save CSV:', error);
        }
    };

    const exportComparisonCSV = async (runA, runB) => {
        const statsA = JSON.parse(runA.stats_json);
        const statsB = JSON.parse(runB.stats_json);
        
        const rows = [
            ['Metric', 'Run A Value', 'Run B Value', 'Delta %'],
            ['Timestamp', runA.timestamp, runB.timestamp, ''],
            ['URL', runA.url, runB.url, ''],
            ['RPS', runA.rps.toFixed(2), runB.rps.toFixed(2), (((runB.rps - runA.rps) / runA.rps) * 100).toFixed(2)],
            ['P99 Latency (s)', runA.p99, runB.p99, (((runB.p99 - runA.p99) / runA.p99) * 100).toFixed(2)],
            ['Success Rate %', (runA.success_rate * 100).toFixed(2), (runB.success_rate * 100).toFixed(2), (runB.success_rate - runA.success_rate).toFixed(2)],
            ['Errors', statsA.errors, statsB.errors, (((statsB.errors - statsA.errors) / (statsA.errors || 1)) * 100).toFixed(2)]
        ];

        const csvContent = rows.map(e => e.join(",")).join("\n");
        
        try {
            const filePath = await save({
                filters: [{ name: 'CSV', extensions: ['csv'] }],
                defaultPath: `comparison_${runA.id}_vs_${runB.id}.csv`
            });
            
            if (filePath) {
                await invoke('save_report', { path: filePath, content: csvContent });
            }
        } catch (error) {
            console.error('Failed to save CSV:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (comparing && selectedRuns.length === 2) {
        const runA = getRunById(selectedRuns[0]);
        const runB = getRunById(selectedRuns[1]);
        const statsA = JSON.parse(runA.stats_json);
        const statsB = JSON.parse(runB.stats_json);

        const compareRow = (label, valA, valB, isLowerBetter = true) => {
            const diff = valB - valA;
            const percent = valA === 0 ? 0 : (diff / valA) * 100;
            const isBetter = isLowerBetter ? diff < 0 : diff > 0;
            const color = diff === 0 ? 'text-text-secondary' : isBetter ? 'text-green-400' : 'text-red-400';

            return (
                <div className="flex items-center justify-between py-3 border-b border-surface-border">
                    <span className="text-text-secondary">{label}</span>
                    <div className="flex gap-12 text-right">
                        <div className="w-24 font-mono">{typeof valA === 'number' ? valA.toFixed(2) : valA}</div>
                        <div className="w-24 font-mono">{typeof valB === 'number' ? valB.toFixed(2) : valB}</div>
                        <div className={`w-24 font-mono font-bold ${color}`}>
                            {diff > 0 ? '+' : ''}{percent.toFixed(2)}%
                        </div>
                    </div>
                </div>
            );
        };

        return (
            <div className="flex-1 overflow-y-auto p-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setComparing(false)}
                            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <h1 className="text-2xl font-bold">Compare Test Runs</h1>
                    </div>
                    <button 
                        onClick={() => exportComparisonCSV(runA, runB)}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl transition-all border border-surface-border"
                    >
                        <span className="material-symbols-outlined">download</span>
                        Download Comparison CSV
                    </button>
                </div>

                <div className="bg-surface-dark border border-surface-border rounded-2xl overflow-hidden">
                    <div className="bg-white/5 p-6 border-b border-surface-border">
                        <div className="flex items-center justify-between">
                            <div className="w-1/3 text-text-secondary">Metric</div>
                            <div className="flex gap-12 text-right">
                                <div className="w-24 text-text-secondary">Run A</div>
                                <div className="w-24 text-text-secondary">Run B</div>
                                <div className="w-24 text-text-secondary">Delta</div>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        {compareRow('RPS', runA.rps, runB.rps, false)}
                        {compareRow('P50 Latency (ms)', statsA.p50 * 1000, statsB.p50 * 1000)}
                        {compareRow('P99 Latency (ms)', runA.p99 * 1000, runB.p99 * 1000)}
                        {compareRow('Avg Latency (ms)', statsA.avgResponse * 1000, statsB.avgResponse * 1000)}
                        {compareRow('Success Rate (%)', runA.success_rate * 100, runB.success_rate * 100, false)}
                        {compareRow('Total Requests', statsA.iterations, statsB.iterations, false)}
                        {compareRow('Errors', statsA.errors, statsB.errors)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Test History</h1>
                    <p className="text-text-secondary mt-1">Review and compare previous load tests</p>
                </div>
                {selectedRuns.length === 2 && (
                    <button 
                        onClick={() => setComparing(true)}
                        className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-primary/20"
                    >
                        <span className="material-symbols-outlined">compare_arrows</span>
                        Compare Selected
                    </button>
                )}
            </div>

            {history.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-text-secondary bg-surface-dark border border-dashed border-surface-border rounded-2xl">
                    <span className="material-symbols-outlined text-4xl mb-2">history</span>
                    <p>No test history found. Start a test to see it here.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {history.map((run) => (
                        <div 
                            key={run.id}
                            className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer ${
                                selectedRuns.includes(run.id) 
                                    ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5' 
                                    : 'bg-surface-dark border-surface-border hover:border-white/20'
                            }`}
                            onClick={() => toggleRunSelection(run.id)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center">
                                        <span className={`material-symbols-outlined ${run.success_rate > 0.95 ? 'text-green-400' : 'text-red-400'}`}>
                                            {run.method === 'GET' ? 'download' : 'upload'}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-lg">{run.method}</span>
                                            <span className="text-text-secondary">{run.url}</span>
                                        </div>
                                        <div className="text-text-secondary text-sm flex items-center gap-3 mt-1">
                                            <span>{new Date(run.timestamp).toLocaleString()}</span>
                                            <span>•</span>
                                            <span>{run.rps.toFixed(1)} RPS</span>
                                            <span>•</span>
                                            <span>P99: {(run.p99 * 1000).toFixed(0)}ms</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right mr-4">
                                        <div className="text-sm text-text-secondary">Success Rate</div>
                                        <div className={`font-bold ${(run.success_rate * 100).toFixed(1) === '100.0' ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {(run.success_rate * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            exportToCSV(run);
                                        }}
                                        className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-text-secondary transition-colors"
                                        title="Download Report"
                                    >
                                        <span className="material-symbols-outlined">download</span>
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteRun(run.id);
                                        }}
                                        className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-red-400/10 hover:text-red-400 text-text-secondary transition-colors"
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HistoryPage;
