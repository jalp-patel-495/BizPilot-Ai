import React, { useState, useEffect } from 'react';
import {
  Layers,
  DollarSign,
  Plus,
  CheckCircle2,
  Package,
  TrendingUp,
  RefreshCw,
  X,
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
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-lg border border-[#E5E5E5] shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#666666]">
              Product & Subscription Catalog
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-[#111111] tracking-tight">
            Products & Service Tiers
          </h1>
          <p className="text-xs text-[#666666] mt-1">
            Manage software SKUs, pricing schedules, unit cost structures, and sales performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
          <button
            onClick={fetchProducts}
            className="btn-secondary"
            title="Refresh Products"
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
          label="Catalog SKUs"
          value={totalItems.toString()}
          change={8.0}
          trend="up"
          subtext="active product lines"
          icon={Package}
        />
        <StatCard
          label="Total Units Sold"
          value={totalUnits.toLocaleString()}
          change={22.4}
          trend="up"
          subtext="cumulative licenses"
          icon={TrendingUp}
        />
        <StatCard
          label="Gross Product Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          change={26.1}
          trend="up"
          subtext="all-time catalog yield"
          icon={DollarSign}
        />
        <StatCard
          label="Average Gross Margin"
          value={`${avgMargin}%`}
          change={3.2}
          trend="up"
          subtext="software profitability"
          icon={CheckCircle2}
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-[#E5E5E5] shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#111111]">
            <thead className="bg-[#F9FAFB] text-[#666666] font-medium border-b border-[#E5E5E5]">
              <tr>
                <th className="px-5 py-3">Product Name & SKU</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price / Mo</th>
                <th className="px-5 py-3">Cost</th>
                <th className="px-5 py-3">Margin %</th>
                <th className="px-5 py-3">Units Sold</th>
                <th className="px-5 py-3">Revenue</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0F0]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-[#8A8A8A]">
                    <div className="w-6 h-6 border-2 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading products catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-[#8A8A8A]">
                    No products in catalog.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const marginPct = p.price > 0 ? (((p.price - (p.cost || 0)) / p.price) * 100).toFixed(0) : 80;
                  return (
                    <tr key={p.id} className="hover:bg-[#F9FAFB] transition">
                      <td className="px-5 py-3 font-semibold text-[#111111]">
                        <div>
                          <p className="font-semibold text-[#111111] text-xs">{p.name}</p>
                          <p className="text-[10px] font-mono text-[#8A8A8A] font-normal">{p.sku}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#F3F3F3] text-[#111111] border border-[#E5E5E5]">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-semibold text-[#111111]">
                        ${p.price?.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-[#666666]">
                        ${p.cost?.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 font-medium text-emerald-800">
                        {marginPct}%
                      </td>
                      <td className="px-5 py-3 text-[#111111]">
                        {p.units_sold || 0}
                      </td>
                      <td className="px-5 py-3 font-semibold text-[#111111]">
                        ${(p.revenue || (p.price * (p.units_sold || 1))).toLocaleString()}
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white w-full max-w-lg p-6 rounded-lg border border-[#E5E5E5] shadow-modal relative text-[#111111]">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-[#8A8A8A] hover:text-[#111111]"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-semibold text-[#111111] mb-0.5">Add Product or Service Tier</h3>
            <p className="text-xs text-[#666666] mb-5">Create a new SKU in the product catalog</p>

            <form onSubmit={handleCreateProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Autonomous Customer Support AI"
                  className="w-full px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs font-mono text-[#111111] focus:border-[#111111] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">Retail Price ($)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#111111] mb-1">Unit Cost ($)</label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key features and specifications..."
                  className="w-full px-3 py-1.5 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] placeholder-[#8A8A8A] focus:border-[#111111] focus:outline-none"
                />
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
