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

const LiveChart = ({ stats }) => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (stats.elapsed_secs > 0 && stats.elapsed_secs % 5 === 0) {
            setHistory(prev => {
                if (prev.length > 0 && prev[prev.length - 1].elapsed_secs === stats.elapsed_secs) {
                    return prev;
                }
                const newHistory = [...prev, {
                    time: stats.duration,
                    elapsed_secs: stats.elapsed_secs,
                    p50: stats.p50,
                    p80: stats.p80,
                    p90: stats.p90,
                    p95: stats.p95,
                    p99: stats.p99,
                    avg: stats.avgResponse
                }];
                return newHistory;
            });
        } else if (stats.duration === "0:00:00" && stats.iterations === 0) {
            setHistory([]);
        }
    }, [stats]);

    const data = {
        labels: history.map(d => d.time),
        datasets: [
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
                display: false,
            },
            y: {
                display: false,
                min: 0,
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

    return (
        <div className="flex-1 bg-background-dark p-6 flex flex-col relative">
            <div className="absolute left-6 top-10 bottom-48 w-8 flex flex-col justify-between text-[10px] font-mono text-text-secondary text-right pr-2 border-r border-surface-border/50">
                <span>1.0</span>
                <span>0.8</span>
                <span>0.6</span>
                <span>0.4</span>
                <span>0.2</span>
                <span>0</span>
            </div>

            <div className="ml-10 h-[400px] w-full relative">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div className="border-b border-surface-border/20 h-0 w-full"></div>
                    <div className="border-b border-surface-border/20 h-0 w-full"></div>
                    <div className="border-b border-surface-border/20 h-0 w-full"></div>
                    <div className="border-b border-surface-border/20 h-0 w-full"></div>
                    <div className="border-b border-surface-border/20 h-0 w-full"></div>
                    <div className="border-b border-surface-border/50 h-0 w-full"></div>
                </div>

                <div className="w-full h-full relative z-10" style={{ minHeight: '400px' }}>
                    <Line data={data} options={options} />
                </div>

                <div className="absolute bottom-0 left-0 w-full flex justify-between text-[10px] font-mono text-text-secondary pt-2 translate-y-full">
                    {history.length > 0 ? (
                        <>
                            <span>{history[0]?.time}</span>
                            {history.length > 10 && <span>{history[Math.floor(history.length * 0.33)]?.time}</span>}
                            {history.length > 30 && <span>{history[Math.floor(history.length * 0.66)]?.time}</span>}
                            <span>{history[history.length - 1]?.time}</span>
                        </>
                    ) : (
                        <>
                            <span>0:00</span>
                            <span>0:01</span>
                            <span>0:02</span>
                            <span>0:03</span>
                        </>
                    )}
                </div>
            </div>

            <div className="mt-12 ml-10 flex flex-col items-end">
                <div className="w-full grid grid-cols-4 gap-x-8 text-xs font-mono border-t border-surface-border/30 pt-4">
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
                </div>
            </div>
        </div>
    );
};

export default LiveChart;
