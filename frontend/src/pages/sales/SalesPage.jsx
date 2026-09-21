import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  DollarSign,
  Plus,
  CheckCircle2,
  Clock,
  RefreshCw,
  X,
  CreditCard,
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

  const totalVolume = sales.reduce((sum, s) => sum + (s.amount || 0), 0);
  const completedDeals = sales.filter((s) => s.status === 'COMPLETED');
  const completedVolume = completedDeals.reduce((sum, s) => sum + (s.amount || 0), 0);
  const avgOrder = completedDeals.length > 0 ? completedVolume / completedDeals.length : 0;
  const pendingCount = sales.filter((s) => s.status === 'PENDING').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-lg border border-[#E5E5E5] shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#666666]">
              Sales Ledger & Orders
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-[#111111] tracking-tight">
            Sales Transactions & Orders
          </h1>
          <p className="text-xs text-[#666666] mt-1">
            Real-time transaction settlement, closed contract volume, and payment method reconciliations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>Record Sale</span>
          </button>
          <button
            onClick={fetchSales}
            className="btn-secondary"
            title="Refresh Sales"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#111111]' : ''}`} />
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
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
        />
        <StatCard
          label="Completed Orders"
          value={completedDeals.length.toString()}
          change={15.0}
          trend="up"
          subtext="settled transactions"
          icon={CheckCircle2}
        />
        <StatCard
          label="Average Deal Size"
          value={`$${avgOrder.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          change={9.2}
          trend="up"
          subtext="per closed won deal"
          icon={TrendingUp}
        />
        <StatCard
          label="Pending Settlement"
          value={pendingCount.toString()}
          change={-12.0}
          trend="down"
          subtext="awaiting payment capture"
          icon={Clock}
        />
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-lg border border-[#E5E5E5] shadow-subtle flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 rounded-md bg-[#F3F3F3] border border-[#E5E5E5]">
          {[
            { label: 'All Transactions', value: '' },
            { label: 'Completed', value: 'COMPLETED' },
            { label: 'Pending', value: 'PENDING' },
            { label: 'Refunded', value: 'REFUNDED' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition ${
                statusFilter === tab.value
                  ? 'bg-white text-[#111111] shadow-subtle border border-[#D9D9D9] font-semibold'
                  : 'text-[#666666] hover:text-[#111111]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-[#8A8A8A]">
          Showing {sales.length} transactions
        </span>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-lg border border-[#E5E5E5] shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#111111]">
            <thead className="bg-[#F9FAFB] text-[#666666] font-medium border-b border-[#E5E5E5]">
              <tr>
                <th className="px-5 py-3">Order #</th>
                <th className="px-5 py-3">Customer Account</th>
                <th className="px-5 py-3">Product / Tier</th>
                <th className="px-5 py-3">Payment Method</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0F0]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#8A8A8A]">
                    <div className="w-6 h-6 border-2 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading sales records...
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#8A8A8A]">
                    No sales records found for selected filter.
                  </td>
                </tr>
              ) : (
                sales.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F9FAFB] transition">
                    <td className="px-5 py-3 font-mono font-medium text-[#111111]">
                      {s.order_number}
                    </td>
                    <td className="px-5 py-3 font-semibold text-[#111111]">
                      {s.customer_name}
                    </td>
                    <td className="px-5 py-3 text-[#666666]">
                      {s.product_name}
                    </td>
                    <td className="px-5 py-3 text-[#666666]">
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-[#8A8A8A]" />
                        <span>{s.payment_method || 'Stripe / Card'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-semibold text-[#111111]">
                      ${s.amount?.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                          s.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : s.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#8A8A8A]">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white w-full max-w-lg p-6 rounded-lg border border-[#E5E5E5] shadow-modal relative text-[#111111]">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-[#8A8A8A] hover:text-[#111111]"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-semibold text-[#111111] mb-0.5">Record New Sale Transaction</h3>
            <p className="text-xs text-[#666666] mb-5">Log order details into the revenue ledger</p>

            <form onSubmit={handleRecordSale} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">Order Number</label>
                <input
                  type="text"
                  required
                  value={formData.order_number}
                  onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs font-mono text-[#111111] focus:border-[#111111] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">Customer / Company</label>
                <input
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder="e.g. Apex Financial Solutions"
                  className="w-full px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">Product</label>
                  <select
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
                  >
                    <option value="Upteky AI Enterprise Suite">Upteky AI Enterprise Suite</option>
                    <option value="Smart Invoicing Pro">Smart Invoicing Pro</option>
                    <option value="AI Lead Pipeline Intelligence">AI Lead Pipeline Intelligence</option>
                    <option value="Customer Support Copilot">Customer Support Copilot</option>
                    <option value="Predictive BI & ML Forecasting">Predictive BI & ML Forecasting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">Amount ($)</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">Payment Method</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
                  >
                    <option value="Corporate Card (Stripe)">Corporate Card (Stripe)</option>
                    <option value="Wire Transfer">Wire Transfer</option>
                    <option value="ACH Debit">ACH Debit</option>
                    <option value="Direct Invoicing">Direct Invoicing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
                  >
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EBEBEB]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
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
