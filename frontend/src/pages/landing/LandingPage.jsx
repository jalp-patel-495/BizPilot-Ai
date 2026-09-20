import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Bot,
  Zap,
  BarChart3,
  ReceiptText,
  Target,
  Clock,
  ChevronDown,
  ChevronUp,
  Star,
  Users,
  Building2,
  Lock,
  Layers,
  Cpu,
  Mail,
  HelpCircle,
  Award,
} from 'lucide-react';
import { LandingNavbar } from '../../components/layout/LandingNavbar';

export const LandingPage = () => {
  const [annualBilling, setAnnualBilling] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? -1 : index);
  };

  const faqs = [
    {
      q: 'How does Upteky AI connect with our existing business tools?',
      a: 'Upteky AI provides out-of-the-box native integrations and robust REST API webhooks for QuickBooks, Xero, Stripe, HubSpot, Salesforce, and email gateways. Setup takes under 5 minutes without code.',
    },
    {
      q: 'What makes the AI lead scoring more accurate than conventional CRMs?',
      a: 'Conventional CRMs use static rules. Upteky AI leverages Scikit-learn gradient boosting trained on real historical deal telemetry and natural language intent extraction to compute precise win probability.',
    },
    {
      q: 'Is our customer data and invoice financial information secure?',
      a: 'Yes. Upteky AI enforces SOC2 Type II compliance, AES-256 encryption at rest, TLS 1.3 in transit, strict multi-tenant isolation, and role-based access control (RBAC) across all tiers.',
    },
    {
      q: 'Can we try all 4 user roles before deploying to our entire team?',
      a: 'Absolutely! Our live interactive demo environment lets you switch between Super Admin, Business Admin, Sales Manager, and Employee personas in one click.',
    },
    {
      q: 'How does automated invoice OCR handling work?',
      a: 'Our Celery-powered asynchronous worker pipeline extracts vendor data, line items, and totals with 99.4% average confidence, automatically routing exceptions to your finance team.',
    },
    {
      q: 'What is your refund and cancellation policy?',
      a: 'You can cancel or adjust your subscription anytime. We offer a 14-day free trial on all plans with no credit card required upfront.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 selection:bg-brand-500 selection:text-white font-sans antialiased overflow-x-hidden">
      <LandingNavbar />

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-6 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-brand-600/25 to-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs font-semibold text-brand-300 shadow-sm animate-pulse-slow">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Next-Gen Autonomous SMB Operations Suite</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Automate Support, Sales & Operations with{' '}
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              Intelligent AI
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed">
            Upteky AI empowers small and medium businesses to eliminate manual busywork.
            Predictive lead scoring, autonomous ticket resolution, instant invoice OCR, and deep Pandas-powered sales analytics—all in one unified SaaS workspace.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 text-white font-bold text-sm shadow-glow transition duration-200"
            >
              <span>Get Started Free — 14 Day Trial</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm transition"
            >
              <span>Live Persona Demo</span>
            </Link>
          </div>

          {/* Social proof metric badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> No credit card required
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> SOC2 Type II Certified
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 4-Tier RBAC Ready
            </span>
          </div>

          {/* Product UI Preview Mockup Card */}
          <div className="mt-12 p-3 sm:p-4 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-2xl backdrop-blur-xl relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-500/20 via-cyan-500/10 to-indigo-500/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition duration-500 -z-10" />
            <div className="rounded-2xl bg-slate-950 border border-slate-800/80 p-5 sm:p-7 text-left space-y-5">
              {/* Header simulation */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-mono text-slate-400">app.upteky.ai/dashboard</span>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live Operations Feed
                </span>
              </div>

              {/* Simulated mini dashboard stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Monthly ARR</p>
                  <p className="text-lg font-bold text-white mt-0.5">$128,450</p>
                  <span className="text-[10px] text-emerald-400 font-semibold">+18.4% YoY</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">AI Lead Win Rate</p>
                  <p className="text-lg font-bold text-brand-300 mt-0.5">28.4%</p>
                  <span className="text-[10px] text-emerald-400 font-semibold">+6.2% vs manual</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Invoices Auto-Parsed</p>
                  <p className="text-lg font-bold text-cyan-400 mt-0.5">384</p>
                  <span className="text-[10px] text-cyan-300 font-semibold">98.9% OCR Acc</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Support Auto-Resolved</p>
                  <p className="text-lg font-bold text-emerald-400 mt-0.5">91.8%</p>
                  <span className="text-[10px] text-slate-400 font-semibold">&lt; 15s avg time</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROBLEM STATEMENT SECTION */}
      <section id="problem" className="py-20 px-6 border-t border-slate-800/60 bg-slate-950/40">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">The SMB Operational Crisis</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Why Growing Businesses Lose Thousands Every Week
            </h2>
            <p className="text-sm text-slate-400">
              Disjointed apps and manual spreadsheets drain team productivity and delay revenue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold">
                01
              </div>
              <h3 className="text-base font-bold text-white">Fragmented SaaS Stacks</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Teams bounce across 8 different disconnected tools, losing critical lead context and causing customer data silos.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                02
              </div>
              <h3 className="text-base font-bold text-white">Slow Response Times</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Customers wait an average of 14 hours for support responses, triggering churn to faster competitors.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold">
                03
              </div>
              <h3 className="text-base font-bold text-white">Manual Invoice Matching</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Finance teams waste 18+ hours per week manually typing line items and cross-verifying purchase orders.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                04
              </div>
              <h3 className="text-base font-bold text-white">Unqualified Sales Leads</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Reps spend 60% of their day chasing cold tire-kickers while high-value enterprise prospects slip away.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. AI FEATURES SECTION */}
      <section id="ai-features" className="py-20 px-6 border-t border-slate-800/60">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center justify-center gap-1.5">
              <Bot className="w-4 h-4" /> Predictive & Natural Language AI
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Smarter Decision Making with Machine Learning
            </h2>
            <p className="text-sm text-slate-400">
              Built on battle-tested Scikit-learn algorithms and modern LLM cognitive adapters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-7 rounded-3xl border border-slate-800 space-y-4 hover:border-brand-500/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">ML Predictive Lead Scoring</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our gradient boosting classification model ranks every inbound opportunity from 0 to 100 with probability estimates, guiding reps to high-converting deals.
              </p>
              <span className="inline-block text-[11px] font-semibold text-brand-400">
                Scikit-Learn GradientBoosting &rarr;
              </span>
            </div>

            <div className="glass-panel p-7 rounded-3xl border border-slate-800 space-y-4 hover:border-cyan-500/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">AI Autonomous Support Copilot</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Resolves tier-1 customer inquiries instantly with empathy and contextual precision. Detects sentiment and escalates high-risk accounts to managers.
              </p>
              <span className="inline-block text-[11px] font-semibold text-cyan-400">
                Sentiment Extraction & Resolution &rarr;
              </span>
            </div>

            <div className="glass-panel p-7 rounded-3xl border border-slate-800 space-y-4 hover:border-emerald-500/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Strategic Executive Observations</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every morning, the AI synthesizes your financial, support, and sales metrics into actionable plain-English executive summaries and recommended actions.
              </p>
              <span className="inline-block text-[11px] font-semibold text-emerald-400">
                Autonomous Diagnostics &rarr;
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. AUTOMATION FEATURES SECTION */}
      <section id="automation" className="py-20 px-6 border-t border-slate-800/60 bg-slate-950/30">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-center gap-1.5">
              <Zap className="w-4 h-4" /> Asynchronous Worker Pipelines
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              End-to-End Hands-Free Automation
            </h2>
            <p className="text-sm text-slate-400">
              Celery task queues and Redis brokers guarantee zero bottleneck delays for high-volume jobs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 w-fit">
                  <ReceiptText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Instant Invoice OCR Extraction</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upload PDF invoices or scan receipts. Our computer vision OCR pipeline parses line items, calculates tax, validates totals, and automatically formats exportable CSVs and ERP entries.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Confidence: 99.4%</span>
                <span className="text-cyan-400 font-semibold">2.4s Avg Execution</span>
              </div>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-slate-800 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 w-fit">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Automated Webhooks & Background Sync</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Trigger actions whenever leads are updated, invoices are paid, or support SLAs are reached. Celery task workers run silently without degrading frontend UI responsiveness.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Broker: Redis</span>
                <span className="text-brand-400 font-semibold">Asynchronous Workers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ANALYTICS SECTION */}
      <section id="analytics" className="py-20 px-6 border-t border-slate-800/60">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-center gap-1.5">
              <BarChart3 className="w-4 h-4" /> Powered by Pandas Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Real-Time Statistical Business Intelligence
            </h2>
            <p className="text-sm text-slate-400">
              Transform raw transactional records into actionable time-series forecasts and pipeline funnels.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase">Forecasting</span>
              <h4 className="text-base font-bold text-white">Rolling Moving Average Projections</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pandas calculates moving average seasonal curves to forecast quota achievement 3 months out.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-brand-400 uppercase">Retention</span>
              <h4 className="text-base font-bold text-white">Multi-Month Cohort Retention</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Monitor subscriber retention against B2B industry benchmarks to detect churn patterns early.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-cyan-400 uppercase">Attribution</span>
              <h4 className="text-base font-bold text-white">Multi-Channel Spend & ROI</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compare CAC and closed revenue across inbound, partner, and organic automation channels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 px-6 border-t border-slate-800/60 bg-slate-950/40">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Fast 3-Step Setup</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              How Upteky AI Supercharges Your Company
            </h2>
            <p className="text-sm text-slate-400">
              Get up and running in under 10 minutes with our self-serve guided onboarding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 relative space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/30 text-brand-400 font-extrabold text-xl flex items-center justify-center">
                1
              </div>
              <h3 className="text-lg font-bold text-white">Connect Your Workspace</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Create your tenant organization and invite team members with granular roles (Super Admin, Business Admin, Sales Manager, Employee).
              </p>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-slate-800 relative space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 font-extrabold text-xl flex items-center justify-center">
                2
              </div>
              <h3 className="text-lg font-bold text-white">Activate AI Automations</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Turn on the Autonomous Support Copilot, enable ML lead scoring, and connect invoice ingest queues with one click.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-slate-800 relative space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-extrabold text-xl flex items-center justify-center">
                3
              </div>
              <h3 className="text-lg font-bold text-white">Scale Revenue Predictably</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Monitor real-time Recharts dashboards and Pandas forecasts as your team closes deals 3x faster without manual bottlenecks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PRICING SECTION */}
      <section id="pricing" className="py-20 px-6 border-t border-slate-800/60">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Predictable Investment</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Transparent Pricing Built for SMB Scale
            </h2>
            <p className="text-sm text-slate-400">
              Select the plan that fits your business velocity. Upgrade or downgrade anytime.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="pt-4 flex items-center justify-center gap-3">
              <span className={`text-xs font-semibold ${!annualBilling ? 'text-white' : 'text-slate-500'}`}>Monthly</span>
              <button
                onClick={() => setAnnualBilling(!annualBilling)}
                className="w-12 h-6 rounded-full bg-slate-800 p-1 relative transition-colors focus:outline-none"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-brand-500 transition-transform ${
                    annualBilling ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`text-xs font-semibold flex items-center gap-1.5 ${annualBilling ? 'text-white' : 'text-slate-500'}`}>
                <span>Annual</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Save 20%
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Starter</h3>
                  <p className="text-xs text-slate-400">For small teams launching operations</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">
                    ${annualBilling ? '39' : '49'}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-slate-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Up to 5 Team Members
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> ML Lead Scoring (1,000/mo)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Invoice OCR (150 docs/mo)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Standard Email Support
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="w-full text-center py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Growth (Featured) */}
            <div className="glass-panel p-8 rounded-3xl border-2 border-brand-500 shadow-glow flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand-500 text-white text-[10px] font-extrabold uppercase tracking-wider">
                Most Popular
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Growth</h3>
                  <p className="text-xs text-slate-400">For accelerating SMBs scaling volume</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">
                    ${annualBilling ? '119' : '149'}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-slate-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Up to 25 Team Members
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Unlimited ML Lead Scoring
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Invoice OCR (1,500 docs/mo)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> AI Support Copilot Agent
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Full 4-Tier RBAC Access
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="w-full text-center py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white shadow-glow transition"
              >
                Start Free 14-Day Trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Enterprise</h3>
                  <p className="text-xs text-slate-400">For multi-entity organizations & compliance</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">
                    ${annualBilling ? '319' : '399'}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-slate-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Unlimited Team Accounts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Custom ML Model Retraining
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Unlimited Invoice OCR
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Dedicated Account Manager & SLA
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Custom ERP / CRM Connectors
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="w-full text-center py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
              >
                Contact Enterprise Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-20 px-6 border-t border-slate-800/60 bg-slate-950/30">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Social Proof</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Trusted by 140+ Growing Businesses
            </h2>
            <p className="text-sm text-slate-400">
              See how operations leaders use Upteky AI to reclaim 20+ hours per week.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-7 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "Upteky AI transformed our lead triage. Our sales reps only focus on accounts with an AI score above 80, and our close rate jumped from 14% to 28% in 60 days."
              </p>
              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-300 font-bold text-xs flex items-center justify-center">
                  SC
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Sophia Chen</p>
                  <p className="text-[10px] text-slate-500">CRO, Apex Financial Solutions</p>
                </div>
              </div>
            </div>

            <div className="glass-panel p-7 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "Our finance team was drowning in vendor invoices every month end. The Celery OCR pipeline parses line items in seconds with zero manual data entry mistakes."
              </p>
              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center">
                  DR
                </div>
                <div>
                  <p className="text-xs font-bold text-white">David Ross</p>
                  <p className="text-[10px] text-slate-500">VP Operations, NexusTech Cloud</p>
                </div>
              </div>
            </div>

            <div className="glass-panel p-7 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "The customer support copilot handles over 90% of routine client questions. It paid for itself in the first two weeks just by reducing ticket backlog."
              </p>
              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center justify-center">
                  HM
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Hannah Meyer</p>
                  <p className="text-[10px] text-slate-500">Operations Director, BioCare Health</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ SECTION */}
      <section id="faq" className="py-20 px-6 border-t border-slate-800/60">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Got Questions?</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Frequently Asked Questions</h2>
            <p className="text-sm text-slate-400">Everything you need to know about the Upteky AI platform.</p>
          </div>

          <div className="space-y-3 pt-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="glass-panel rounded-2xl border border-slate-800 overflow-hidden transition"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-sm font-semibold text-white hover:text-brand-300 transition"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-brand-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. CALL TO ACTION (CTA) SECTION */}
      <section className="py-20 px-6 border-t border-slate-800/60 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-600/20 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-5xl mx-auto glass-panel p-10 sm:p-14 rounded-3xl border border-slate-700/80 text-center relative z-10 space-y-6 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-bold border border-brand-500/20">
            <Award className="w-3.5 h-3.5" /> Fast 14-Day Free Evaluation
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to Automate Your Business Operations?
          </h2>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300">
            Join over 140 high-growth companies saving hundreds of operational hours every month.
            Deploy in minutes with zero disruption to your existing workflow.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 text-white font-bold text-sm shadow-glow transition duration-200"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm transition"
            >
              <span>Sign In with Demo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12 px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Brand column */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 p-0.5 flex items-center justify-center shadow-glow">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-brand-400" />
                  </div>
                </div>
                <span className="font-extrabold text-white text-base tracking-tight">Upteky AI</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Intelligent business automation and predictive analytics platform for small and medium-sized enterprises.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Enterprise SOC2 Type II & GDPR Compliant</span>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Platform</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="#ai-features" className="hover:text-white transition">AI Lead Scoring</a></li>
                <li><a href="#automation" className="hover:text-white transition">Invoice OCR</a></li>
                <li><a href="#ai-features" className="hover:text-white transition">Support Copilot</a></li>
                <li><a href="#analytics" className="hover:text-white transition">Pandas BI Engine</a></li>
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Resources</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing Plans</a></li>
                <li><a href="#faq" className="hover:text-white transition">FAQ Documentation</a></li>
                <li><Link to="/login" className="hover:text-white transition">Role Simulators</Link></li>
              </ul>
            </div>

            {/* Legal & Security */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Security & Legal</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="hover:text-white transition cursor-pointer">Privacy Policy</li>
                <li className="hover:text-white transition cursor-pointer">Terms of Service</li>
                <li className="hover:text-white transition cursor-pointer">Security Safeguards</li>
                <li className="hover:text-white transition cursor-pointer">API Status: 99.99%</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>&copy; 2026 Upteky AI Inc. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>English (US)</span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> All Systems Operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
