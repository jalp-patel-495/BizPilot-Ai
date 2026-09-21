import React from 'react';

export const RoleBadge = ({ role }) => {
  const configs = {
    SUPER_ADMIN: {
      label: 'Super Admin',
      bg: 'bg-neutral-100 text-neutral-900 border-neutral-300',
      dot: 'bg-neutral-900',
    },
    BUSINESS_ADMIN: {
      label: 'Business Admin',
      bg: 'bg-neutral-100 text-neutral-800 border-neutral-300',
      dot: 'bg-neutral-700',
    },
    SALES_MANAGER: {
      label: 'Sales Manager',
      bg: 'bg-neutral-50 text-neutral-700 border-neutral-200',
      dot: 'bg-neutral-500',
    },
    EMPLOYEE: {
      label: 'Employee',
      bg: 'bg-neutral-50 text-neutral-600 border-neutral-200',
      dot: 'bg-neutral-400',
    },
  };

  const config = configs[role] || {
    label: role,
    bg: 'bg-neutral-50 text-neutral-600 border-neutral-200',
    dot: 'bg-neutral-400',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${config.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const configs = {
    ACTIVE: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    PAID: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    WON: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    QUALIFIED: 'bg-neutral-100 text-neutral-800 border-neutral-300',
    PROCESSED: 'bg-neutral-100 text-neutral-800 border-neutral-300',
    PROPOSAL: 'bg-neutral-100 text-neutral-700 border-neutral-200',
    IN_PROGRESS: 'bg-neutral-100 text-neutral-700 border-neutral-200',
    NEW: 'bg-neutral-50 text-neutral-700 border-neutral-200',
    CONTACTED: 'bg-amber-50 text-amber-800 border-amber-200',
    PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
    HIGH: 'bg-rose-50 text-rose-800 border-rose-200',
    URGENT: 'bg-rose-50 text-rose-800 border-rose-200',
    LOST: 'bg-neutral-50 text-neutral-500 border-neutral-200',
    CLOSED: 'bg-neutral-50 text-neutral-500 border-neutral-200',
  };

  const style = configs[status?.toUpperCase()] || 'bg-neutral-50 text-neutral-600 border-neutral-200';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${style}`}>
      {status}
    </span>
  );
};
