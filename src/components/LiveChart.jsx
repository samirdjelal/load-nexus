import React, { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const LiveChart = ({ stats, activeTab }) => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (stats.elapsedSecs > 0) {
            setHistory(prev => {
                if (prev.length > 0 && stats.elapsedSecs < prev[prev.length - 1].elapsedSecs) {
                    return [{
                        time: stats.duration,
                        elapsedSecs: stats.elapsedSecs,
                        p50: stats.p50,
                        p80: stats.p80,
                        p90: stats.p90,
                        p95: stats.p95,
                        p99: stats.p99,
                        avg: stats.avgResponse,
                        rps: stats.rps,
                        sent: stats.bytesSentPerSec,
                        recv: stats.bytesRecvPerSec
                    }];
                }
                if (prev.length > 0 && prev[prev.length - 1].elapsedSecs === stats.elapsedSecs) {
                    return prev;
                }
                const newHistory = [...prev, {
                    time: stats.duration,
                    elapsedSecs: stats.elapsedSecs,
                    p50: stats.p50,
                    p80: stats.p80,
                    p90: stats.p90,
                    p95: stats.p95,
                    p99: stats.p99,
                    avg: stats.avgResponse,
                    rps: stats.rps,
                    sent: stats.bytesSentPerSec,
                    recv: stats.bytesRecvPerSec
                }];
                return newHistory;
            });
        } else if (stats.duration === "0:00:00" && stats.iterations === 0) {
            setHistory([]);
        }
    }, [stats]);

    const data = {
        labels: history.map(d => d.time),
        datasets: activeTab === 'percentiles' ? [
            {
                label: 'P99 (s)',
                data: history.map(d => d.p99),
                borderColor: '#bef264',
                backgroundColor: 'rgba(190, 242, 100, 0.1)',
                fill: false,
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2,
            },
            {
                label: 'P95 (s)',
                data: history.map(d => d.p95),
                borderColor: '#f87171',
                backgroundColor: 'rgba(248, 113, 113, 0.1)',
                fill: false,
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2,
            },
            {
                label: 'P90 (s)',
                data: history.map(d => d.p90),
                borderColor: '#2dd4bf',
                backgroundColor: 'rgba(45, 212, 191, 0.1)',
                fill: false,
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2,
            },
            {
                label: 'P80 (s)',
                data: history.map(d => d.p80),
                borderColor: '#fb923c',
                backgroundColor: 'rgba(251, 146, 60, 0.1)',
                fill: false,
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2,
            },
            {
                label: 'P50 (s)',
                data: history.map(d => d.p50),
                borderColor: '#a78bfa',
                backgroundColor: 'rgba(167, 139, 250, 0.1)',
                fill: false,
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2,
            }
        ] : [
            {
                label: 'RPS',
                data: history.map(d => d.rps),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: false,
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2,
                yAxisID: 'y',
            },
            {
                label: 'Sent (MB/s)',
                data: history.map(d => d.sent / (1024 * 1024)),
                borderColor: '#fb923c',
                backgroundColor: 'rgba(251, 146, 60, 0.1)',
                fill: false,
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2,
                yAxisID: 'y1',
            },
            {
                label: 'Recv (MB/s)',
                data: history.map(d => d.recv / (1024 * 1024)),
                borderColor: '#2dd4bf',
                backgroundColor: 'rgba(45, 212, 191, 0.1)',
                fill: false,
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2,
                yAxisID: 'y1',
            }
        ],
    };

    const getMax = (key) => history.length > 0 ? Math.max(...history.map(d => d[key])).toFixed(2) : '0.00';
    const getOverall = (key) => history.length > 0 ? (history.reduce((a, b) => a + b[key], 0) / history.length).toFixed(2) : '0.00';

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
            x: {
                display: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                },
                ticks: {
                    color: '#9ca3af',
                    font: {
                        family: 'monospace',
                        size: 10
                    },
                    maxTicksLimit: 8,
                    maxRotation: 0,
                }
            },
            y: {
                display: true,
                min: 0,
                title: {
                    display: activeTab === 'throughput',
                    text: 'Req / s',
                    color: '#9ca3af',
                    font: { size: 10 }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                border: {
                    display: false,
                },
                ticks: {
                    color: '#9ca3af',
                    font: {
                        family: 'monospace',
                        size: 10
                    },
                }
            },
            y1: {
                display: activeTab === 'throughput',
                position: 'right',
                min: 0,
                title: {
                    display: true,
                    text: 'MB / s',
                    color: '#9ca3af',
                    font: { size: 10 }
                },
                grid: {
                    drawOnChartArea: false,
                },
                ticks: {
                    color: '#9ca3af',
                    font: {
                        family: 'monospace',
                        size: 10
                    },
                }
            }
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };

    const formatBytes = (bytes, perSec = false) => {
        const numBytes = Number(bytes);
        if (!numBytes || numBytes === 0) return perSec ? '0 B/s' : '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(numBytes) / Math.log(k));
        const val = parseFloat((numBytes / Math.pow(k, i)).toFixed(2));
        return `${val} ${sizes[i]}${perSec ? '/s' : ''}`;
    };

    return (
        <div className="flex-1 bg-background-dark p-6 flex flex-col relative min-w-0">
            <div className="h-[250px] max-h-[250px] w-full relative z-10">
                <Line data={data} options={options} />
            </div>

            <div className="mt-8 flex flex-col items-end">
                <div className="w-full grid grid-cols-4 gap-x-8 text-xs font-mono border-t border-surface-border/30 pt-4">
                    {activeTab === 'percentiles' ? (
                        <>
                            <div className="pb-2 font-bold text-text-secondary">Percentile</div>
                            <div className="pb-2 font-bold text-text-secondary text-right">Current (s)</div>
                            <div className="pb-2 font-bold text-text-secondary text-right">Max (s)</div>
                            <div className="pb-2 font-bold text-text-secondary text-right">Overall (s)</div>

                            <div className="py-1.5 flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#bef264]"></div>
                                <span className="text-text-primary">p99</span>
                            </div>
                            <div className="py-1.5 text-right text-text-primary">{stats.p99?.toFixed(2) || '0.00'}</div>
                            <div className="py-1.5 text-right text-text-primary">{getMax('p99')}</div>
                            <div className="py-1.5 text-right text-text-primary">{getOverall('p99')}</div>

                            <div className="py-1.5 flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#f87171]"></div>
                                <span className="text-text-primary">p95</span>
                            </div>
                            <div className="py-1.5 text-right text-text-primary">{stats.p95?.toFixed(2) || '0.00'}</div>
                            <div className="py-1.5 text-right text-text-primary">{getMax('p95')}</div>
                            <div className="py-1.5 text-right text-text-primary">{getOverall('p95')}</div>

                            <div className="py-1.5 flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#2dd4bf]"></div>
                                <span className="text-text-primary">p90</span>
                            </div>
                            <div className="py-1.5 text-right text-text-primary">{stats.p90?.toFixed(2) || '0.00'}</div>
                            <div className="py-1.5 text-right text-text-primary">{getMax('p90')}</div>
                            <div className="py-1.5 text-right text-text-primary">{getOverall('p90')}</div>

                            <div className="py-1.5 flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#fb923c]"></div>
                                <span className="text-text-primary">p80</span>
                            </div>
                            <div className="py-1.5 text-right text-text-primary">{stats.p80?.toFixed(2) || '0.00'}</div>
                            <div className="py-1.5 text-right text-text-primary">{getMax('p80')}</div>
                            <div className="py-1.5 text-right text-text-primary">{getOverall('p80')}</div>

                            <div className="py-1.5 flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#a78bfa]"></div>
                                <span className="text-text-primary">p50</span>
                            </div>
                            <div className="py-1.5 text-right text-text-primary">{stats.p50?.toFixed(2) || '0.00'}</div>
                            <div className="py-1.5 text-right text-text-primary">{getMax('p50')}</div>
                            <div className="py-1.5 text-right text-text-primary">{getOverall('p50')}</div>
                        </>
                    ) : (
                        <>
                            <div className="pb-2 font-bold text-text-secondary">Metric</div>
                            <div className="pb-2 font-bold text-text-secondary text-right">Current</div>
                            <div className="pb-2 font-bold text-text-secondary text-right">Max</div>
                            <div className="pb-2 font-bold text-text-secondary text-right">Total</div>

                            <div className="py-1.5 flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
                                <span className="text-text-primary">RPS</span>
                            </div>
                            <div className="py-1.5 text-right text-text-primary">{stats.rps?.toFixed(2) || '0.00'}</div>
                            <div className="py-1.5 text-right text-text-primary">{getMax('rps')}</div>
                            <div className="py-1.5 text-right text-text-primary">{stats.iterations || 0} hits</div>

                            <div className="py-1.5 flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#fb923c]"></div>
                                <span className="text-text-primary">Sent</span>
                            </div>
                            <div className="py-1.5 text-right text-text-primary">{formatBytes(stats.bytesSentPerSec, true)}</div>
                            <div className="py-1.5 text-right text-text-primary">{formatBytes(getMax('sent'), true)}</div>
                            <div className="py-1.5 text-right text-text-primary">{formatBytes(stats.totalBytesSent)}</div>

                            <div className="py-1.5 flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#2dd4bf]"></div>
                                <span className="text-text-primary">Recv</span>
                            </div>
                            <div className="py-1.5 text-right text-text-primary">{formatBytes(stats.bytesRecvPerSec, true)}</div>
                            <div className="py-1.5 text-right text-text-primary">{formatBytes(getMax('recv'), true)}</div>
                            <div className="py-1.5 text-right text-text-primary">{formatBytes(stats.totalBytesRecv)}</div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiveChart;
