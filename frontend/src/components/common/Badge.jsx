import React from 'react';

export const RoleBadge = ({ role }) => {
  const configs = {
    SUPER_ADMIN: {
      label: 'Super Admin',
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      dot: 'bg-rose-500',
    },
    BUSINESS_ADMIN: {
      label: 'Business Admin',
      bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      dot: 'bg-indigo-500',
    },
    SALES_MANAGER: {
      label: 'Sales Manager',
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      dot: 'bg-amber-500',
    },
    EMPLOYEE: {
      label: 'Employee',
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      dot: 'bg-emerald-500',
    },
  };

  const config = configs[role] || {
    label: role,
    bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    dot: 'bg-slate-400',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      {config.label}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const configs = {
    ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    PAID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    WON: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    QUALIFIED: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    PROCESSED: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    PROPOSAL: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    IN_PROGRESS: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    NEW: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    CONTACTED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    HIGH: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    URGENT: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    LOST: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    CLOSED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  const style = configs[status?.toUpperCase()] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${style}`}>
      {status}
    </span>
  );
};
