import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { BusinessAdminDashboard } from './BusinessAdminDashboard';
import { SalesManagerDashboard } from './SalesManagerDashboard';
import { EmployeeDashboard } from './EmployeeDashboard';

export const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role;

  switch (role) {
    case 'SUPER_ADMIN':
      return <SuperAdminDashboard />;
    case 'BUSINESS_ADMIN':
      return <BusinessAdminDashboard />;
    case 'SALES_MANAGER':
      return <SalesManagerDashboard />;
    case 'EMPLOYEE':
      return <EmployeeDashboard />;
    default:
      // Never fall back to a privileged dashboard for an unknown/missing
      // role. Least-privilege default: treat anyone we can't positively
      // identify as an Employee.
      return <EmployeeDashboard />;
  }
};
