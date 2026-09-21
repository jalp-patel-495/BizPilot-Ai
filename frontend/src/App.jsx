import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';

import { LandingPage } from './pages/landing/LandingPage';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';

// The 9 Specified Core Platform Modules
import { Dashboard } from './pages/dashboard/Dashboard';
import { CustomersPage } from './pages/customers/CustomersPage';
import { LeadsPage } from './pages/leads/LeadsPage';
import { SalesPage } from './pages/sales/SalesPage';
import { ProductsPage } from './pages/products/ProductsPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { AIAssistantPage } from './pages/ai/AIAssistantPage';
import { AutomationPage } from './pages/automation/AutomationPage';
import { SettingsPage } from './pages/settings/SettingsPage';

// Secondary Operational Modules
import { ProfilePage } from './pages/profile/ProfilePage';
import { UsersPage } from './pages/users/UsersPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { InvoicesPage } from './pages/invoices/InvoicesPage';
import { SupportPage } from './pages/support/SupportPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';

// Role-Specific Navigation Pages
import { RolesPermissionsPage } from './pages/admin/RolesPermissionsPage';
import { AIInsightsPage } from './pages/ai/AIInsightsPage';
import { TeamPerformancePage } from './pages/sales/TeamPerformancePage';
import { AISalesInsightsPage } from './pages/sales/AISalesInsightsPage';
import { MyTasksPage } from './pages/tasks/MyTasksPage';
import { MyActivitiesPage } from './pages/activities/MyActivitiesPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Authentication Lifecycle */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Application Workspace */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              {/* Accessible by All 4 Roles (with role-scoped data) */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/leads" element={<LeadsPage />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/tasks" element={<MyTasksPage />} />
              <Route path="/activities" element={<MyActivitiesPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/automation" element={<AutomationPage />} />
              <Route path="/ai-assistant" element={<AIAssistantPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* Management & Analytical Roles (Super Admin, Business Admin, Sales Manager) */}
              <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'BUSINESS_ADMIN', 'SALES_MANAGER']} />}>
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/employees" element={<UsersPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/sales-analytics" element={<AnalyticsPage />} />
                <Route path="/team-performance" element={<TeamPerformancePage />} />
                <Route path="/ai-sales-insights" element={<AISalesInsightsPage />} />
              </Route>

              {/* Administrative Roles (Super Admin & Business Admin) */}
              <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'BUSINESS_ADMIN']} />}>
                <Route path="/ai-insights" element={<AIInsightsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/invoices" element={<InvoicesPage />} />
              </Route>

              {/* Super Admin Exclusive */}
              <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/businesses" element={<AdminDashboard initialTab="businesses" />} />
                <Route path="/roles-permissions" element={<RolesPermissionsPage />} />
                <Route path="/system-analytics" element={<AdminDashboard initialTab="system_usage" />} />
                <Route path="/ai-monitoring" element={<AdminDashboard initialTab="ai_usage" />} />
              </Route>
            </Route>
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
