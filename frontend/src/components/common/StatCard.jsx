import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const StatCard = ({ label, value, change, trend = 'up', subtext, icon: Icon, color = 'indigo' }) => {
  const colorMap = {
    indigo: 'from-indigo-500/20 to-purple-500/5 text-indigo-400 border-indigo-500/20',
    cyan: 'from-cyan-500/20 to-blue-500/5 text-cyan-400 border-cyan-500/20',
    emerald: 'from-emerald-500/20 to-teal-500/5 text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-500/20 to-orange-500/5 text-amber-400 border-amber-500/20',
    rose: 'from-rose-500/20 to-pink-500/5 text-rose-400 border-rose-500/20',
  };

  const selectedColor = colorMap[color] || colorMap.indigo;

  return (
    <div className="glass-panel glass-panel-hover p-6 rounded-2xl relative overflow-hidden border border-slate-800">
      {/* Background ambient gradient glow */}
      <div className={`absolute -right-6 -bottom-6 w-28 h-28 bg-gradient-to-br ${selectedColor} rounded-full blur-2xl pointer-events-none opacity-40`} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">{label}</p>
          <h3 className="text-2xl font-bold tracking-tight text-white">{value}</h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl bg-slate-900/80 border border-slate-800 ${selectedColor} shadow-inner`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend === 'up'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : trend === 'down'
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
          }`}
        >
          {trend === 'up' && <TrendingUp className="w-3 h-3" />}
          {trend === 'down' && <TrendingDown className="w-3 h-3" />}
          {trend === 'neutral' && <Minus className="w-3 h-3" />}
          {change > 0 ? `+${change}%` : `${change}%`}
        </span>
        <span className="text-xs text-slate-400">{subtext}</span>
      </div>
    </div>
  );
};
