import React, { useState, useEffect } from 'react';
import {
  Layers,
  DollarSign,
  Plus,
  Search,
  CheckCircle2,
  Package,
  TrendingUp,
  RefreshCw,
  X,
  Tag,
  ArrowUpRight,
} from 'lucide-react';
import api from '../../services/api';
import { StatCard } from '../../components/common/StatCard';

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    sku: `UPT-SKU-${Math.floor(100 + Math.random() * 900)}`,
    category: 'Software',
    price: 999,
    cost: 150,
    status: 'ACTIVE',
    description: '',
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      if (res.data?.data) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/products', formData);
      setShowAddModal(false);
      setMessage('Product added to catalog successfully!');
      setTimeout(() => setMessage(''), 4000);
      setFormData({
        name: '',
        sku: `UPT-SKU-${Math.floor(100 + Math.random() * 900)}`,
        category: 'Software',
        price: 999,
        cost: 150,
        status: 'ACTIVE',
        description: '',
      });
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  // Aggregated Stats
  const totalItems = products.length;
  const totalUnits = products.reduce((sum, p) => sum + (p.units_sold || 0), 0);
  const totalRevenue = products.reduce((sum, p) => sum + (p.revenue || 0), 0);
  const avgMargin =
    products.length > 0
      ? (
          products.reduce((sum, p) => {
            const margin = p.price > 0 ? ((p.price - (p.cost || 0)) / p.price) * 100 : 80;
            return sum + margin;
          }, 0) / products.length
        ).toFixed(1)
      : '82.5';

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Layers className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Product & Subscription Catalog
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Products & Service Tiers
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage software SKUs, pricing schedules, unit cost structures, and sales performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-glow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
          <button
            onClick={fetchProducts}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 transition"
            title="Refresh Products"
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
          label="Catalog SKUs"
          value={totalItems.toString()}
          change={8.0}
          trend="up"
          subtext="active product lines"
          icon={Package}
          color="teal"
        />
        <StatCard
          label="Total Units Sold"
          value={totalUnits.toLocaleString()}
          change={22.4}
          trend="up"
          subtext="cumulative licenses"
          icon={TrendingUp}
          color="cyan"
        />
        <StatCard
          label="Gross Product Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          change={26.1}
          trend="up"
          subtext="all-time catalog yield"
          icon={DollarSign}
          color="indigo"
        />
        <StatCard
          label="Average Gross Margin"
          value={`${avgMargin}%`}
          change={3.2}
          trend="up"
          subtext="software profitability"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Products Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Product Name & SKU</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price / Mo</th>
                <th className="px-6 py-4">Cost</th>
                <th className="px-6 py-4">Margin %</th>
                <th className="px-6 py-4">Units Sold</th>
                <th className="px-6 py-4">Revenue</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading products catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    No products in catalog.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const marginPct = p.price > 0 ? (((p.price - (p.cost || 0)) / p.price) * 100).toFixed(0) : 80;
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-6 py-4 font-semibold text-white">
                        <div>
                          <p className="font-bold text-white text-xs">{p.name}</p>
                          <p className="text-[10px] font-mono text-brand-400">{p.sku}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-white">
                        ${p.price?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        ${p.cost?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-400">
                        {marginPct}%
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-semibold">
                        {p.units_sold || 0}
                      </td>
                      <td className="px-6 py-4 font-extrabold text-white text-sm">
                        ${(p.revenue || (p.price * (p.units_sold || 1))).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">Add Product or Service Tier</h3>
            <p className="text-xs text-slate-400 mb-6">Create a new SKU in the product catalog</p>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Autonomous Customer Support AI"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">SKU Code</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="Subscription">Subscription</option>
                    <option value="Software">Software</option>
                    <option value="Operations">Operations</option>
                    <option value="Sales AI">Sales AI</option>
                    <option value="Support">Support</option>
                    <option value="Analytics">Analytics</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Retail Price ($)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Unit Cost ($)</label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key features and specifications..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
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
                  <span>Save Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
