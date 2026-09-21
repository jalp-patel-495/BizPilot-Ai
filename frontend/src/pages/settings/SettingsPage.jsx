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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#111111] tracking-tight">Platform & Tenant Settings</h1>
        <p className="text-xs text-[#666666] mt-0.5">
          Manage organizational parameters, subscription tier, API keys, and compliance protocols.
        </p>
      </div>

      {savedMsg && (
        <div className="p-3.5 rounded-lg bg-[#f7f7f7] border border-[#e5e5e5] text-xs text-[#111111] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-[#e5e5e5] pb-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition whitespace-nowrap ${
                isActive
                  ? 'bg-[#111111] text-white'
                  : 'text-[#666666] hover:text-[#111111] hover:bg-[#f7f7f7]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Organization */}
      {activeTab === 'organization' && (
        <div className="bg-white p-5 rounded-lg border border-[#e5e5e5] space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
            <div>
              <h3 className="text-sm font-semibold text-[#111111]">General Information</h3>
              <p className="text-xs text-[#666666] mt-0.5">Legal entity details and regional defaults.</p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#f3f3f3] text-[#666666] border border-[#e5e5e5]">
              Tenant ID: {user?.organization_id?.slice(0, 8)}...
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-medium text-[#111111] mb-1">
                Legal Entity Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full bg-white border border-[#d9d9d9] rounded-md px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111] transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">
                  Operating Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-white border border-[#d9d9d9] rounded-md px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111] transition"
                >
                  <option value="UTC-05:00 Eastern Time">UTC-05:00 Eastern Time (US & Canada)</option>
                  <option value="UTC-08:00 Pacific Time">UTC-08:00 Pacific Time (US & Canada)</option>
                  <option value="UTC+00:00 UTC London">UTC+00:00 UTC London</option>
                  <option value="UTC+05:30 IST Mumbai">UTC+05:30 IST Mumbai</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111111] mb-1">
                  Reporting Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-white border border-[#d9d9d9] rounded-md px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111] transition"
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#111111] hover:bg-[#222222] text-white font-semibold text-xs transition shadow-xs"
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
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-lg border border-[#e5e5e5] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#111111]">
                  Current Subscription: {subData?.plan?.name || user?.organization_plan || 'Business Pro'}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {subData?.subscription?.status || 'Active'}
                </span>
              </div>
              <p className="text-xs text-[#666666] mt-0.5">
                Billed {subData?.subscription?.billing_cycle || 'monthly'} (${subData?.subscription?.monthly_price || subData?.plan?.monthly_price || 199}/mo).
                {subData?.subscription?.current_period_end && ` Renews on ${new Date(subData.subscription.current_period_end).toLocaleDateString()}.`}
              </p>
            </div>
            <button className="px-3.5 py-1.5 rounded-md bg-[#111111] hover:bg-[#222222] text-white font-semibold text-xs transition shadow-xs">
              Upgrade Subscription
            </button>
          </div>

          {/* Real-time Usage meters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-[#e5e5e5] space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#111111]">Team Member Seats</span>
                <span className="text-[#666666]">
                  {subData?.usage?.users?.current ?? 4} / {subData?.usage?.users?.is_unlimited ? '∞' : (subData?.usage?.users?.limit ?? 30)}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#e5e5e5] overflow-hidden">
                <div
                  className="h-full bg-[#111111] rounded-full"
                  style={{ width: `${Math.min(100, subData?.usage?.users?.percent ?? 13.3)}%` }}
                />
              </div>
              <p className="text-[10px] text-[#8a8a8a]">
                {subData?.usage?.users?.warning ? 'Approaching seat limit' : 'Seats available on this plan'}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#e5e5e5] space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#111111]">Monthly AI Requests</span>
                <span className="text-[#666666]">
                  {subData?.usage?.ai_requests?.current ?? 340} / {subData?.usage?.ai_requests?.is_unlimited ? '∞' : (subData?.usage?.ai_requests?.limit ?? 2500)}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#e5e5e5] overflow-hidden">
                <div
                  className="h-full bg-[#111111] rounded-full"
                  style={{ width: `${Math.min(100, subData?.usage?.ai_requests?.percent ?? 13.6)}%` }}
                />
              </div>
              <p className="text-[10px] text-[#8a8a8a]">Copilot & lead scoring quota</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[#e5e5e5] space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#111111]">API Call Volume</span>
                <span className="text-[#666666]">
                  {subData?.usage?.api_requests?.current ?? 1240} / {subData?.usage?.api_requests?.is_unlimited ? '∞' : (subData?.usage?.api_requests?.limit ?? 50000)}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#e5e5e5] overflow-hidden">
                <div
                  className="h-full bg-[#111111] rounded-full"
                  style={{ width: `${Math.min(100, subData?.usage?.api_requests?.percent ?? 2.5)}%` }}
                />
              </div>
              <p className="text-[10px] text-[#8a8a8a]">Resets monthly</p>
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-white p-5 rounded-lg border border-[#e5e5e5] space-y-3 shadow-xs">
            <h3 className="text-sm font-semibold text-[#111111]">Payment Method</h3>
            <div className="flex items-center justify-between p-3.5 rounded-md bg-[#fafafa] border border-[#e5e5e5]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-[#f3f3f3] text-[#111111]">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#111111]">Visa ending in 4242</p>
                  <p className="text-[11px] text-[#666666]">Expires 08/2028 • Default payment card</p>
                </div>
              </div>
              <button className="text-xs text-[#111111] font-semibold hover:underline">
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: API & Webhooks */}
      {activeTab === 'api' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-lg border border-[#e5e5e5] space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
              <div>
                <h3 className="text-sm font-semibold text-[#111111]">API Authentication Keys</h3>
                <p className="text-xs text-[#666666] mt-0.5">Use these keys to authenticate programmatic REST API calls.</p>
              </div>
              <button
                onClick={() => setApiKey('upt_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15))}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white hover:bg-[#f7f7f7] text-xs text-[#111111] transition border border-[#d9d9d9]"
              >
                <RefreshCw className="w-3 h-3 text-[#666666]" />
                <span>Roll Key</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#111111]">
                Production API Secret Key
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={apiKey}
                  className="flex-1 bg-[#fafafa] border border-[#d9d9d9] rounded-md px-3 py-1.5 text-xs font-mono text-[#111111] focus:outline-none"
                />
                <button
                  onClick={handleCopyKey}
                  className="px-3.5 py-1.5 rounded-md bg-[#111111] hover:bg-[#222222] text-xs font-semibold text-white transition flex items-center gap-1.5 shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-[#e5e5e5] space-y-3 shadow-xs">
            <h3 className="text-sm font-semibold text-[#111111]">Outbound Webhooks</h3>
            <p className="text-xs text-[#666666]">Receive real-time HTTPS webhooks for lead score updates and invoice completions.</p>
            <div className="p-3 rounded-md bg-[#fafafa] border border-[#e5e5e5] flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-mono text-[#111111] font-medium">https://api.acmepartners.com/webhooks/upteky</span>
                <p className="text-[10px] text-[#8a8a8a]">Events: lead.scored, invoice.processed, ticket.escalated</p>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                200 OK (Healthy)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Security & Compliance */}
      {activeTab === 'security' && (
        <div className="bg-white p-5 rounded-lg border border-[#e5e5e5] space-y-5 shadow-xs">
          <div className="pb-3 border-b border-[#e5e5e5]">
            <h3 className="text-sm font-semibold text-[#111111]">Compliance & Access Policies</h3>
            <p className="text-xs text-[#666666] mt-0.5">Enterprise safeguards and session security settings.</p>
          </div>

          <div className="space-y-3.5 max-w-xl">
            <div className="flex items-center justify-between p-3.5 rounded-md bg-[#fafafa] border border-[#e5e5e5]">
              <div>
                <p className="text-xs font-semibold text-[#111111]">Enforce Two-Factor Authentication (2FA)</p>
                <p className="text-[11px] text-[#666666]">Require all organization users to verify with an authenticator app</p>
              </div>
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#111111] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-md bg-[#fafafa] border border-[#e5e5e5]">
              <div>
                <p className="text-xs font-semibold text-[#111111]">Inactivity Session Timeout</p>
                <p className="text-[11px] text-[#666666]">Automatically terminate inactive sessions</p>
              </div>
              <select
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="bg-white border border-[#d9d9d9] rounded-md px-2.5 py-1.5 text-xs text-[#111111] focus:border-[#111111] focus:outline-none"
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
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-white hover:bg-[#f7f7f7] text-[#111111] font-semibold text-xs border border-[#d9d9d9] transition shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-[#666666]" />
                <span>Export SOC2 Audit Log Package</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
