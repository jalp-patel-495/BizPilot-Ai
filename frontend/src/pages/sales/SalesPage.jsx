import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  DollarSign,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  RefreshCw,
  X,
  CreditCard,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import api from '../../services/api';
import { StatCard } from '../../components/common/StatCard';

export const SalesPage = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    order_number: `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    customer_name: '',
    product_name: 'Upteky AI Enterprise Suite',
    amount: 14500,
    payment_method: 'Stripe / Card',
    status: 'COMPLETED',
  });

  const fetchSales = async () => {
    try {
      setLoading(true);
      let url = '/sales';
      if (statusFilter) url += `?status=${statusFilter}`;
      const res = await api.get(url);
      if (res.data?.data) {
        setSales(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load sales:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [statusFilter]);

  const handleRecordSale = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/sales', formData);
      setShowAddModal(false);
      setMessage('Sale recorded successfully!');
      setTimeout(() => setMessage(''), 4000);
      setFormData({
        order_number: `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        customer_name: '',
        product_name: 'Upteky AI Enterprise Suite',
        amount: 14500,
        payment_method: 'Stripe / Card',
        status: 'COMPLETED',
      });
      fetchSales();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to record sale');
    } finally {
      setSubmitting(false);
    }
  };

  // Aggregated Stats
  const totalVolume = sales.reduce((sum, s) => sum + (s.amount || 0), 0);
  const completedDeals = sales.filter((s) => s.status === 'COMPLETED');
  const completedVolume = completedDeals.reduce((sum, s) => sum + (s.amount || 0), 0);
  const avgOrder = completedDeals.length > 0 ? completedVolume / completedDeals.length : 0;
  const pendingCount = sales.filter((s) => s.status === 'PENDING').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShoppingBag className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Sales Ledger & Orders
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Sales Transactions & Orders
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time transaction settlement, closed contract volume, and payment method reconciliations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-glow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Record Sale</span>
          </button>
          <button
            onClick={fetchSales}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 transition"
            title="Refresh Sales"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-400' : ''}`} />
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Gross Sales Volume"
          value={`$${totalVolume.toLocaleString()}`}
          change={18.4}
          trend="up"
          subtext="total transaction volume"
          icon={DollarSign}
          color="indigo"
        />
        <StatCard
          label="Completed Orders"
          value={completedDeals.length.toString()}
          change={15.0}
          trend="up"
          subtext="settled transactions"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          label="Average Deal Size"
          value={`$${avgOrder.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          change={9.2}
          trend="up"
          subtext="per closed won deal"
          icon={TrendingUp}
          color="cyan"
        />
        <StatCard
          label="Pending Settlement"
          value={pendingCount.toString()}
          change={-12.0}
          trend="down"
          subtext="awaiting payment capture"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Filter Tabs */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {[
            { label: 'All Transactions', value: '' },
            { label: 'Completed', value: 'COMPLETED' },
            { label: 'Pending', value: 'PENDING' },
            { label: 'Refunded', value: 'REFUNDED' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === tab.value
                  ? 'bg-brand-600 text-white shadow-glow'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Showing {sales.length} transactions
        </span>
      </div>

      {/* Sales Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Order #</th>
                <th className="px-6 py-4">Customer Account</th>
                <th className="px-6 py-4">Product / Tier</th>
                <th className="px-6 py-4">Payment Method</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading sales records...
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    No sales records found for selected filter.
                  </td>
                </tr>
              ) : (
                sales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4 font-mono font-bold text-brand-400">
                      {s.order_number}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      {s.customer_name}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {s.product_name}
                    </td>
                    <td className="px-6 py-4 text-slate-400 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                      <span>{s.payment_method || 'Stripe / Card'}</span>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-white text-sm">
                      ${s.amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          s.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : s.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Today'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Sale Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">Record New Sale Transaction</h3>
            <p className="text-xs text-slate-400 mb-6">Log order details into the revenue ledger</p>

            <form onSubmit={handleRecordSale} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Order Number</label>
                <input
                  type="text"
                  required
                  value={formData.order_number}
                  onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Customer / Company</label>
                <input
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder="e.g. Apex Financial Solutions"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Product</label>
                  <select
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="Upteky AI Enterprise Suite">Upteky AI Enterprise Suite</option>
                    <option value="Smart Invoicing Pro">Smart Invoicing Pro</option>
                    <option value="AI Lead Pipeline Intelligence">AI Lead Pipeline Intelligence</option>
                    <option value="Customer Support Copilot">Customer Support Copilot</option>
                    <option value="Predictive BI & ML Forecasting">Predictive BI & ML Forecasting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Amount ($)</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Payment Method</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="Corporate Card (Stripe)">Corporate Card (Stripe)</option>
                    <option value="Wire Transfer">Wire Transfer</option>
                    <option value="ACH Debit">ACH Debit</option>
                    <option value="Direct Invoicing">Direct Invoicing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-glow transition flex items-center gap-2"
                >
                  {submitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>Save Transaction</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
