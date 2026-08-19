import React from 'react';
import { AggregateStats } from '../../types';

interface ProgressChartsProps {
  stats: AggregateStats;
}

export const ProgressCharts: React.FC<ProgressChartsProps> = ({ stats }) => {
  const history = stats.wpmHistory.length > 0 
    ? stats.wpmHistory 
    : [
        { date: 'Day 1', wpm: 25, accuracy: 94, mode: '15s' },
        { date: 'Day 2', wpm: 32, accuracy: 96, mode: '30s' },
        { date: 'Day 3', wpm: 38, accuracy: 95, mode: '60s' },
        { date: 'Day 4', wpm: 45, accuracy: 98, mode: '60s' },
      ];

  const maxWpm = Math.max(60, ...history.map(h => h.wpm));
  const height = 160;
  const width = 500;
  const padding = 30;

  // Generate SVG path for WPM
  const points = history.map((item, index) => {
    const x = padding + (index / Math.max(1, history.length - 1)) * (width - padding * 2);
    const y = height - padding - (item.wpm / maxWpm) * (height - padding * 2);
    return { x, y, item };
  });

  const pathD = points.length > 1
    ? points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')
    : `M ${padding} ${height / 2} L ${width - padding} ${height / 2}`;

  const areaD = points.length > 1
    ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : '';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* WPM Speed Trend Chart */}
      <div 
        id="wpm-trend-chart-card"
        className="bg-slate-900/80 dark:bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col"
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Speed Trajectory (Net WPM)</h3>
            <p className="text-xs text-slate-400">Keystroke speed progression across recent sessions</p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
            Peak: {stats.bestNetWpm || Math.round(maxWpm)} WPM
          </span>
        </div>

        <div className="w-full overflow-hidden flex-1 flex items-center justify-center">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
            <defs>
              <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#334155" strokeDasharray="3 3" strokeWidth="0.8" />
            <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#334155" strokeDasharray="3 3" strokeWidth="0.8" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#475569" strokeWidth="1" />

            {/* Area & Line */}
            {areaD && <path d={areaD} fill="url(#wpmGradient)" />}
            <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Data Points */}
            {points.map((p, idx) => (
              <g key={idx} className="group cursor-pointer">
                <circle cx={p.x} cy={p.y} r="4" fill="#10b981" stroke="#0f172a" strokeWidth="2" />
                <text 
                  x={p.x} 
                  y={p.y - 10} 
                  textAnchor="middle" 
                  fontSize="10" 
                  fill="#cbd5e1" 
                  className="font-mono opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {p.item.wpm} WPM
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-2 px-2">
          <span>First Test</span>
          <span>Latest Test</span>
        </div>
      </div>

      {/* Accuracy & Consistency Chart */}
      <div 
        id="accuracy-trend-chart-card"
        className="bg-slate-900/80 dark:bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col"
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Accuracy Stability (%)</h3>
            <p className="text-xs text-slate-400">Keystroke precision and error control</p>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
            Avg: {stats.averageAccuracy || 97}%
          </span>
        </div>

        <div className="w-full flex-1 flex flex-col justify-end gap-2 pt-4">
          <div className="flex items-end justify-between gap-1.5 h-32 px-2">
            {history.slice(-10).map((item, idx) => {
              const heightPercent = Math.max(15, (item.accuracy - 70) * 3.3);
              const isHigh = item.accuracy >= 98;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[9px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.accuracy}%
                  </span>
                  <div 
                    className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                      isHigh ? 'bg-cyan-400' : 'bg-cyan-600/70 hover:bg-cyan-500'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[8px] font-mono text-slate-400 truncate w-full text-center">
                    {item.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-2 px-2 border-t border-slate-800/80 pt-2">
          <span>90% Baseline</span>
          <span className="text-cyan-400 font-semibold">100% Target Precision</span>
        </div>
      </div>
    </div>
  );
};
