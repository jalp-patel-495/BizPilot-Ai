import React from 'react';
import { RefreshCw, Calendar } from 'lucide-react';
import { RoleBadge } from '../../../components/common/Badge';

export const DashboardHeader = ({
  title,
  subtitle,
  role,
  onRefresh,
  refreshing = false,
  dateFilter,
  onDateFilterChange,
  children,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E5] mb-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-xl font-bold tracking-tight text-[#111111]">{title}</h1>
          {role && <RoleBadge role={role} />}
        </div>
        <p className="text-xs text-[#666666] max-w-xl">{subtitle}</p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        {onDateFilterChange && (
          <div className="flex items-center bg-[#F7F7F7] border border-[#E5E5E5] rounded-md p-0.5 text-xs font-medium">
            {[
              { id: 'today', label: 'Today' },
              { id: 'this_week', label: 'Week' },
              { id: 'this_month', label: 'Month' },
              { id: 'this_year', label: 'Year' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => onDateFilterChange(tab.id)}
                className={`px-2.5 py-1 rounded transition ${
                  dateFilter === tab.id
                    ? 'bg-white text-[#111111] font-semibold shadow-xs border border-[#E0E0E0]'
                    : 'text-[#666666] hover:text-[#111111]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {children}

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="p-1.5 rounded-md border border-[#D9D9D9] bg-white text-[#555555] hover:text-[#111111] hover:bg-[#F7F7F7] transition text-xs flex items-center gap-1.5"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}
      </div>
    </div>
  );
};
