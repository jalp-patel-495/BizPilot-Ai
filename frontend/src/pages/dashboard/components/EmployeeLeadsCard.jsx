import React from 'react';
import { Target, ArrowUpRight, Flame, Sun, Snowflake } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from './EmptyState';

export const EmployeeLeadsCard = ({ leads = [] }) => {
  const navigate = useNavigate();

  const getClassificationBadge = (cls) => {
    switch (cls) {
      case 'HOT':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
            <Flame className="w-3 h-3 text-rose-500" /> Hot
          </span>
        );
      case 'WARM':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
            <Sun className="w-3 h-3 text-amber-500" /> Warm
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            <Snowflake className="w-3 h-3 text-blue-500" /> Cold
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[#E5E5E5] p-5 shadow-subtle flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#111111] flex items-center gap-2">
            <Target className="w-4 h-4 text-[#555555]" />
            My Assigned Leads
          </h3>
          <p className="text-xs text-[#666666] mt-0.5">Opportunities assigned directly to your portfolio</p>
        </div>
        <button
          onClick={() => navigate('/leads')}
          className="text-xs font-medium text-[#111111] hover:underline flex items-center gap-1"
        >
          View All Leads
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1">
        {leads.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No leads assigned"
            description="You currently don't have any leads assigned to you. When new accounts are routed to you, they will appear here."
          />
        ) : (
          <div className="space-y-2.5">
            {leads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => navigate(`/leads`)}
                className="p-3 rounded-md border border-[#EBEBEB] bg-[#FAFAFA] hover:bg-white hover:border-[#D9D9D9] transition cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-xs font-semibold text-[#111111] truncate">{lead.contact_name}</p>
                    {getClassificationBadge(lead.classification)}
                  </div>
                  <p className="text-[11px] text-[#666666] truncate">{lead.company}</p>
                  {lead.recommended_action && (
                    <p className="text-[10px] text-neutral-500 mt-1 truncate">
                      Next: {lead.recommended_action}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-[#111111]">
                    ${(lead.deal_value || 0).toLocaleString()}
                  </span>
                  <span className="block text-[10px] font-medium text-emerald-600">
                    AI Score: {lead.ai_score || 80}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
