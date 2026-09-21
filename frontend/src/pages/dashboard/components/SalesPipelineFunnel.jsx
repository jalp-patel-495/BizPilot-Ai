import React from 'react';
import { Layers, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SalesPipelineFunnel = ({ stages = [] }) => {
  const navigate = useNavigate();

  const stageColors = {
    NEW: 'border-l-blue-500 bg-blue-50/20',
    CONTACTED: 'border-l-indigo-500 bg-indigo-50/20',
    QUALIFIED: 'border-l-purple-500 bg-purple-50/20',
    PROPOSAL: 'border-l-amber-500 bg-amber-50/20',
    NEGOTIATION: 'border-l-orange-500 bg-orange-50/20',
    WON: 'border-l-emerald-500 bg-emerald-50/20',
    LOST: 'border-l-rose-500 bg-rose-50/20',
  };

  return (
    <div className="bg-white rounded-lg border border-[#E5E5E5] p-5 shadow-subtle">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#111111] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#555555]" />
            Active Sales Pipeline Trajectory
          </h3>
          <p className="text-xs text-[#666666] mt-0.5">Stage distribution across all sales opportunities</p>
        </div>
        <button
          onClick={() => navigate('/leads?view=kanban')}
          className="text-xs font-medium text-[#111111] hover:underline flex items-center gap-1"
        >
          View Kanban Board
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {stages.map((st) => (
          <div
            key={st.stage}
            onClick={() => navigate(`/leads?status=${st.stage}`)}
            className={`p-3 rounded-md border border-[#E5E5E5] border-l-4 ${
              stageColors[st.stage] || 'border-l-neutral-400'
            } hover:border-[#CCCCCC] transition cursor-pointer flex flex-col justify-between`}
          >
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#666666]">
                {st.label}
              </span>
              <p className="text-xl font-bold text-[#111111] mt-1">{st.count}</p>
            </div>
            <div className="mt-2 pt-2 border-t border-[#EBEBEB]">
              <span className="text-[11px] font-medium text-[#444444]">
                Rs. {(st.value || 0).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
