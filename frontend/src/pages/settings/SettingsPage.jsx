import React, { useState } from 'react';
import {
  Building,
  CreditCard,
  Key,
  Shield,
  CheckCircle2,
  Copy,
  ExternalLink,
  Plus,
  RefreshCw,
  Save,
  Check,
  Download,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/adminService';

export const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('organization');
  const [orgName, setOrgName] = useState(user?.organization_name || 'Upteky Technologies Inc.');
  const [timezone, setTimezone] = useState('UTC-05:00 Eastern Time');
  const [currency, setCurrency] = useState('USD ($)');
  const [apiKey, setApiKey] = useState('upt_live_9f88a218ecbc018247b99c68');
  const [copied, setCopied] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('60');

  const [subData, setSubData] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);

  React.useEffect(() => {
    const loadSub = async () => {
      try {
        const [current, plans] = await Promise.all([
          adminService.getCurrentSubscription(),
          adminService.getAvailablePlans(),
        ]);
        setSubData(current);
        setAvailablePlans(plans || []);
      } catch (err) {
        console.error('Error fetching subscription in settings:', err);
      }
    };
    loadSub();
  }, []);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSavedMsg('Settings saved successfully.');
    setTimeout(() => setSavedMsg(''), 4000);
  };

  const tabs = [
    { id: 'organization', label: 'Organization', icon: Building },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
    { id: 'api', label: 'API & Webhooks', icon: Key },
    { id: 'security', label: 'Security & Compliance', icon: Shield },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            Workspace Configuration
          </span>
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Platform & Tenant Settings</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage your organizational parameters, subscription tier, API keys, and compliance protocols.
        </p>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                isActive
                  ? 'bg-brand-600/15 text-brand-300 border border-brand-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Organization */}
      {activeTab === 'organization' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">General Information</h3>
              <p className="text-xs text-slate-400 mt-0.5">Legal entity details and regional defaults.</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
              Tenant ID: {user?.organization_id?.slice(0, 8)}...
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Legal Entity Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Operating Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 transition"
                >
                  <option value="UTC-05:00 Eastern Time">UTC-05:00 Eastern Time (US & Canada)</option>
                  <option value="UTC-08:00 Pacific Time">UTC-08:00 Pacific Time (US & Canada)</option>
                  <option value="UTC+00:00 UTC London">UTC+00:00 UTC London</option>
                  <option value="UTC+05:30 IST Mumbai">UTC+05:30 IST Mumbai</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Reporting Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 transition"
                >
                  <option value="USD ($)">USD - US Dollar ($)</option>
                  <option value="EUR (€)">EUR - Euro (€)</option>
                  <option value="GBP (£)">GBP - British Pound (£)</option>
                  <option value="CAD ($)">CAD - Canadian Dollar ($)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-glow transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Organization Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Billing & Plans */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  Current Subscription: {subData?.plan?.name || user?.organization_plan || 'Business Pro'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {subData?.subscription?.status || 'Active'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Billed {subData?.subscription?.billing_cycle || 'monthly'} (${subData?.subscription?.monthly_price || subData?.plan?.monthly_price || 199}/mo).
                {subData?.subscription?.current_period_end && ` Renews on ${new Date(subData.subscription.current_period_end).toLocaleDateString()}.`}
              </p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition shadow-glow">
              Upgrade Subscription
            </button>
          </div>

          {/* Real-time Usage meters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">Team Member Seats</span>
                <span className="text-slate-400">
                  {subData?.usage?.users?.current ?? 4} / {subData?.usage?.users?.is_unlimited ? '∞' : (subData?.usage?.users?.limit ?? 30)} Used
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full"
                  style={{ width: `${Math.min(100, subData?.usage?.users?.percent ?? 13.3)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500">
                {subData?.usage?.users?.warning ? 'Approaching seat limit' : 'Seats available on this plan'}
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">Monthly AI Requests</span>
                <span className="text-slate-400">
                  {subData?.usage?.ai_requests?.current ?? 340} / {subData?.usage?.ai_requests?.is_unlimited ? '∞' : (subData?.usage?.ai_requests?.limit ?? 2500)} Used
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${Math.min(100, subData?.usage?.ai_requests?.percent ?? 13.6)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500">Copilot & lead scoring quota</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">API Call Volume</span>
                <span className="text-slate-400">
                  {subData?.usage?.api_requests?.current ?? 1240} / {subData?.usage?.api_requests?.is_unlimited ? '∞' : (subData?.usage?.api_requests?.limit ?? 50000)} Used
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full"
                  style={{ width: `${Math.min(100, subData?.usage?.api_requests?.percent ?? 2.5)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500">Resets monthly</p>
            </div>
          </div>

          {/* Payment method */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Payment Method</h3>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-800 text-slate-200">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Visa ending in 4242</p>
                  <p className="text-[10px] text-slate-400">Expires 08/2028 • Default payment card</p>
                </div>
              </div>
              <button className="text-xs text-brand-400 hover:underline font-semibold">
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: API & Webhooks */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">API Authentication Keys</h3>
                <p className="text-xs text-slate-400 mt-0.5">Use these keys to authenticate programmatic REST API calls.</p>
              </div>
              <button
                onClick={() => setApiKey('upt_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition border border-slate-700"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Roll Key</span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Production API Secret Key
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={apiKey}
                  className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-brand-300 focus:outline-none"
                />
                <button
                  onClick={handleCopyKey}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Outbound Webhooks</h3>
            <p className="text-xs text-slate-400">Receive real-time HTTPS webhooks for lead score updates and invoice completions.</p>
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-mono text-cyan-400 font-semibold">https://api.acmepartners.com/webhooks/upteky</span>
                <p className="text-[10px] text-slate-500">Events: lead.scored, invoice.processed, ticket.escalated</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                200 OK (Healthy)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Security & Compliance */}
      {activeTab === 'security' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Compliance & Access Policies</h3>
            <p className="text-xs text-slate-400 mt-0.5">Enterprise safeguards and session security settings.</p>
          </div>

          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div>
                <p className="text-xs font-bold text-white">Enforce Two-Factor Authentication (2FA)</p>
                <p className="text-[11px] text-slate-400">Require all organization users to verify with an authenticator app</p>
              </div>
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div>
                <p className="text-xs font-bold text-white">Inactivity Session Timeout</p>
                <p className="text-[11px] text-slate-400">Automatically terminate inactive sessions</p>
              </div>
              <select
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">60 minutes</option>
                <option value="120">2 hours</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => alert('SOC2 Type II Audit Log bundle dispatched to organization admin email.')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export SOC2 Audit Log Package</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
