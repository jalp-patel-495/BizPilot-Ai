import React, { useState } from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import api from '../../../services/api';
import { EmptyState } from './EmptyState';

export const EmployeeTasksCard = ({ tasks = [], onTaskCompleted }) => {
  const [completingId, setCompletingId] = useState(null);

  const handleComplete = async (taskId) => {
    try {
      setCompletingId(taskId);
      await api.put(`/automations/tasks/${taskId}/complete`);
      if (onTaskCompleted) {
        onTaskCompleted(taskId);
      }
    } catch (err) {
      console.error('Failed to complete task:', err);
    } finally {
      setCompletingId(null);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENT_P0':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">Urgent</span>;
      case 'HIGH_P1':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">High</span>;
      case 'MEDIUM_P2':
        return <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">Medium</span>;
      default:
        return <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200">Normal</span>;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[#E5E5E5] p-5 shadow-subtle flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#111111] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            My Actionable Tasks
          </h3>
          <p className="text-xs text-[#666666] mt-0.5">Pending action items and client follow-ups</p>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#F3F3F3] text-[#111111] border border-[#E5E5E5]">
          {tasks.length} Pending
        </span>
      </div>

      <div className="flex-1">
        {tasks.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="All tasks completed!"
            description="You currently don't have any pending tasks assigned to you. Outstanding work will appear here."
          />
        ) : (
          <div className="space-y-2.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-md border border-[#EBEBEB] bg-[#FAFAFA] hover:bg-white hover:border-[#D9D9D9] transition flex items-start justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getPriorityBadge(task.priority)}
                    <h4 className="text-xs font-semibold text-[#111111] truncate">{task.title}</h4>
                  </div>
                  {task.description && (
                    <p className="text-[11px] text-[#666666] line-clamp-1 mb-1">{task.description}</p>
                  )}
                  {task.lead_company && (
                    <p className="text-[10px] text-[#8A8A8A]">
                      Lead: <span className="text-[#333333] font-medium">{task.lead_company}</span>
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleComplete(task.id)}
                  disabled={completingId === task.id}
                  className="px-2.5 py-1 rounded bg-white hover:bg-[#111111] hover:text-white text-[#111111] border border-[#D9D9D9] text-xs font-medium transition flex items-center gap-1 shrink-0 group-hover:border-[#111111]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{completingId === task.id ? 'Saving...' : 'Complete'}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
