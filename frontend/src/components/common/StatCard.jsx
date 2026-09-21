import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const StatCard = ({ label, value, change, trend = 'up', subtext, icon: Icon }) => {
  return (
    <div className="bg-white p-5 rounded-lg border border-[#E5E5E5] shadow-subtle hover:border-[#D4D4D4] transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[#666666] mb-1">{label}</p>
          <h3 className="text-2xl font-semibold tracking-tight text-[#111111]">{value}</h3>
        </div>
        {Icon && (
          <div className="p-2 rounded-md bg-[#F7F7F7] border border-[#EBEBEB] text-[#555555]">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3.5 pt-3 border-t border-[#F0F0F0] flex items-center gap-2">
        {change !== undefined && change !== null && (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded border ${
              trend === 'up'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : trend === 'down'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-neutral-50 text-neutral-600 border-neutral-200'
            }`}
          >
            {trend === 'up' && <TrendingUp className="w-3 h-3" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3" />}
            {trend === 'neutral' && <Minus className="w-3 h-3" />}
            {change > 0 ? `+${change}%` : `${change}%`}
          </span>
        )}
        {subtext && <span className="text-[11px] text-[#8A8A8A]">{subtext}</span>}
      </div>
    </div>
  );
};
