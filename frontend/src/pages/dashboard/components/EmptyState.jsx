import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-[#D9D9D9] bg-[#FAFAFA]">
      <div className="w-10 h-10 rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center text-[#666666] mb-3 shadow-xs">
        <Icon className="w-5 h-5 text-[#666666]" />
      </div>
      <h4 className="text-sm font-semibold text-[#111111] mb-1">{title}</h4>
      <p className="text-xs text-[#666666] max-w-sm mb-4">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#111111] text-white text-xs font-medium hover:bg-[#262626] transition shadow-xs"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
