import React from 'react';
import { Users, Trophy } from 'lucide-react';
import { RoleBadge } from '../../../components/common/Badge';

export const TeamPerformanceTable = ({ team = [] }) => {
  return (
    <div className="bg-white rounded-lg border border-[#E5E5E5] p-5 shadow-subtle">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#111111] flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Sales Representatives Performance
          </h3>
          <p className="text-xs text-[#666666] mt-0.5">Assigned lead volume, deal closures, and conversion efficiency</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#E5E5E5] text-[#8A8A8A] font-medium">
              <th className="pb-2.5 font-medium">Representative</th>
              <th className="pb-2.5 font-medium">Role</th>
              <th className="pb-2.5 font-medium text-right">Assigned Leads</th>
              <th className="pb-2.5 font-medium text-right">Closed Deals</th>
              <th className="pb-2.5 font-medium text-right">Pipeline Value</th>
              <th className="pb-2.5 font-medium text-right">Win Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0]">
            {team.map((rep) => (
              <tr key={rep.user_id} className="hover:bg-[#FAFAFA] transition">
                <td className="py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xs">
                      {rep.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-[#111111]">{rep.name}</p>
                      <p className="text-[11px] text-[#8A8A8A]">{rep.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3">
                  <RoleBadge role={rep.role} />
                </td>
                <td className="py-3 text-right font-semibold text-[#111111]">
                  {rep.assigned_leads}
                </td>
                <td className="py-3 text-right font-semibold text-emerald-600">
                  {rep.deals_won}
                </td>
                <td className="py-3 text-right font-medium text-[#111111]">
                  Rs. {(rep.pipeline_value || 0).toLocaleString()}
                </td>
                <td className="py-3 text-right">
                  <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200">
                    {rep.win_rate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
