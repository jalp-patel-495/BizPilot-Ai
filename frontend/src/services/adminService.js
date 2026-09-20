import api from './api';

export const adminService = {
  // 1. Dashboard Overview
  getDashboardMetrics: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data?.data;
  },

  // 2. Businesses Management
  getBusinesses: async (params = {}) => {
    const res = await api.get('/admin/businesses', { params });
    return res.data?.data || [];
  },

  createBusiness: async (payload) => {
    const res = await api.post('/admin/businesses', payload);
    return res.data?.data;
  },

  updateBusiness: async (id, payload) => {
    const res = await api.put(`/admin/businesses/${id}`, payload);
    return res.data?.data;
  },

  toggleBusinessStatus: async (id) => {
    const res = await api.delete(`/admin/businesses/${id}`);
    return res.data?.data;
  },

  // 3. User Management
  getUsers: async (params = {}) => {
    const res = await api.get('/admin/users', { params });
    return res.data?.data || [];
  },

  updateUser: async (id, payload) => {
    const res = await api.put(`/admin/users/${id}`, payload);
    return res.data?.data;
  },

  resetUserPassword: async (id, newPassword) => {
    const res = await api.post(`/admin/users/${id}/reset-password`, { new_password: newPassword });
    return res.data;
  },

  // 4. Subscriptions
  getSubscriptions: async (params = {}) => {
    const res = await api.get('/admin/subscriptions', { params });
    return res.data?.data || [];
  },

  updateSubscription: async (id, payload) => {
    const res = await api.put(`/admin/subscriptions/${id}`, payload);
    return res.data?.data;
  },

  // 5. Plans Management
  getPlans: async () => {
    const res = await api.get('/admin/plans');
    return res.data?.data || [];
  },

  updatePlan: async (id, payload) => {
    const res = await api.put(`/admin/plans/${id}`, payload);
    return res.data?.data;
  },

  // 6. System Usage
  getSystemUsage: async (periodMonth) => {
    const res = await api.get('/admin/system-usage', {
      params: periodMonth ? { period_month: periodMonth } : {},
    });
    return res.data?.data;
  },

  // 7. API Usage
  getApiUsage: async (periodMonth) => {
    const res = await api.get('/admin/api-usage', {
      params: periodMonth ? { period_month: periodMonth } : {},
    });
    return res.data?.data;
  },

  // 8. AI Usage
  getAiUsage: async (periodMonth) => {
    const res = await api.get('/admin/ai-usage', {
      params: periodMonth ? { period_month: periodMonth } : {},
    });
    return res.data?.data;
  },

  // 9. Activity Logs
  getAuditLogs: async (params = {}) => {
    const res = await api.get('/admin/audit-logs', { params });
    return res.data?.data || [];
  },

  // Tenant-facing endpoints
  getCurrentSubscription: async () => {
    const res = await api.get('/subscriptions/current');
    return res.data?.data;
  },

  getAvailablePlans: async () => {
    const res = await api.get('/subscriptions/plans');
    return res.data?.data || [];
  },

  upgradeSubscription: async (payload) => {
    const res = await api.post('/subscriptions/upgrade', payload);
    return res.data?.data;
  },
};
