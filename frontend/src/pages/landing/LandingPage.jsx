import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Bot,
  Zap,
  BarChart3,
  ReceiptText,
  Target,
  ChevronDown,
  ChevronUp,
  Star,
  Layers,
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
    <div className="min-h-screen bg-white text-[#111111] selection:bg-[#111111] selection:text-white font-sans antialiased overflow-x-hidden">
      <LandingNavbar />

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-6 bg-white border-b border-[#E5E5E5]">
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3F3F3] border border-[#E5E5E5] text-xs font-semibold text-[#111111]">
            <Sparkles className="w-3.5 h-3.5 text-[#111111]" />
            <span>Next-Gen Autonomous SMB Operations Suite</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#111111] leading-[1.12]">
            Automate Support, Sales & Operations with{' '}
            <span className="underline decoration-1 underline-offset-8">Intelligent AI</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#666666] leading-relaxed">
            Upteky AI empowers small and medium businesses to eliminate manual busywork.
            Predictive lead scoring, autonomous ticket resolution, instant invoice OCR, and deep Pandas-powered sales analytics—all in one unified SaaS workspace.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[6px] bg-[#111111] hover:bg-[#222222] text-white font-medium text-sm transition duration-150"
            >
              <span>Get Started Free — 14 Day Trial</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[6px] bg-white hover:bg-[#F7F7F7] border border-[#D9D9D9] text-[#111111] font-medium text-sm transition duration-150"
            >
              <span>Live Persona Demo</span>
            </Link>
          </div>

          {/* Social proof metric badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-[#666666]">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#111111]" /> No credit card required
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#111111]" /> SOC2 Type II Certified
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#111111]" /> 4-Tier RBAC Ready
            </span>
          </div>

          {/* Product UI Preview Mockup Card */}
          <div className="mt-12 p-3 sm:p-4 rounded-[8px] bg-[#FAFAFA] border border-[#E5E5E5] shadow-[0_1px_3px_rgba(0,0,0,0.06)] relative text-left">
            <div className="rounded-[6px] bg-white border border-[#E5E5E5] p-5 sm:p-7 space-y-5">
              {/* Header simulation */}
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5]" />
                  </div>
                  <span className="text-xs font-mono text-[#666666]">app.upteky.ai/dashboard</span>
                </div>
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Operations Feed
                </span>
              </div>

              {/* Simulated mini dashboard stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-[6px] bg-[#FAFAFA] border border-[#E5E5E5]">
                  <p className="text-[10px] text-[#666666] uppercase font-semibold">Monthly ARR</p>
                  <p className="text-xl font-bold text-[#111111] mt-0.5">Rs. 1,28,450</p>
                  <span className="text-[10px] text-emerald-600 font-medium">+18.4% YoY</span>
                </div>
                <div className="p-3.5 rounded-[6px] bg-[#FAFAFA] border border-[#E5E5E5]">
                  <p className="text-[10px] text-[#666666] uppercase font-semibold">AI Lead Win Rate</p>
                  <p className="text-xl font-bold text-[#111111] mt-0.5">28.4%</p>
                  <span className="text-[10px] text-emerald-600 font-medium">+6.2% vs manual</span>
                </div>
                <div className="p-3.5 rounded-[6px] bg-[#FAFAFA] border border-[#E5E5E5]">
                  <p className="text-[10px] text-[#666666] uppercase font-semibold">Invoices Auto-Parsed</p>
                  <p className="text-xl font-bold text-[#111111] mt-0.5">384</p>
                  <span className="text-[10px] text-[#666666] font-medium">98.9% OCR Acc</span>
                </div>
                <div className="p-3.5 rounded-[6px] bg-[#FAFAFA] border border-[#E5E5E5]">
                  <p className="text-[10px] text-[#666666] uppercase font-semibold">Support Auto-Resolved</p>
                  <p className="text-xl font-bold text-[#111111] mt-0.5">91.8%</p>
                  <span className="text-[10px] text-[#666666] font-medium">&lt; 15s avg time</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROBLEM STATEMENT SECTION */}
      <section id="problem" className="py-20 px-6 bg-[#FAFAFA] border-b border-[#E5E5E5]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#666666]">The SMB Operational Crisis</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#111111]">
              Why Growing Businesses Lose Thousands Every Week
            </h2>
            <p className="text-sm text-[#666666]">
              Disjointed apps and manual spreadsheets drain team productivity and delay revenue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-[8px] border border-[#E5E5E5] space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="w-9 h-9 rounded-[6px] bg-[#F3F3F3] border border-[#E5E5E5] flex items-center justify-center text-[#111111] font-bold text-xs">
                01
              </div>
              <h3 className="text-base font-semibold text-[#111111]">Fragmented SaaS Stacks</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Teams bounce across 8 different disconnected tools, losing critical lead context and causing customer data silos.
              </p>
            </div>

            <div className="bg-white p-6 rounded-[8px] border border-[#E5E5E5] space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="w-9 h-9 rounded-[6px] bg-[#F3F3F3] border border-[#E5E5E5] flex items-center justify-center text-[#111111] font-bold text-xs">
                02
              </div>
              <h3 className="text-base font-semibold text-[#111111]">Slow Response Times</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Customers wait an average of 14 hours for support responses, triggering churn to faster competitors.
              </p>
            </div>

            <div className="bg-white p-6 rounded-[8px] border border-[#E5E5E5] space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="w-9 h-9 rounded-[6px] bg-[#F3F3F3] border border-[#E5E5E5] flex items-center justify-center text-[#111111] font-bold text-xs">
                03
              </div>
              <h3 className="text-base font-semibold text-[#111111]">Manual Invoice Matching</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Finance teams waste 18+ hours per week manually typing line items and cross-verifying purchase orders.
              </p>
            </div>

            <div className="bg-white p-6 rounded-[8px] border border-[#E5E5E5] space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="w-9 h-9 rounded-[6px] bg-[#F3F3F3] border border-[#E5E5E5] flex items-center justify-center text-[#111111] font-bold text-xs">
                04
              </div>
              <h3 className="text-base font-semibold text-[#111111]">Unqualified Sales Leads</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Reps spend 60% of their day chasing cold tire-kickers while high-value enterprise prospects slip away.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. AI FEATURES SECTION */}
      <section id="ai-features" className="py-20 px-6 bg-white border-b border-[#E5E5E5]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#666666] flex items-center justify-center gap-1.5">
              <Bot className="w-4 h-4 text-[#111111]" /> Predictive & Natural Language AI
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#111111]">
              Smarter Decision Making with Machine Learning
            </h2>
            <p className="text-sm text-[#666666]">
              Built on battle-tested Scikit-learn algorithms and modern LLM cognitive adapters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-7 rounded-[8px] border border-[#E5E5E5] space-y-4 hover:border-[#111111] transition shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="w-10 h-10 rounded-[6px] bg-[#F3F3F3] border border-[#E5E5E5] flex items-center justify-center text-[#111111]">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#111111]">ML Predictive Lead Scoring</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Our gradient boosting classification model ranks every inbound opportunity from 0 to 100 with probability estimates, guiding reps to high-converting deals.
              </p>
              <span className="inline-block text-xs font-semibold text-[#111111] hover:underline cursor-pointer">
                Scikit-Learn GradientBoosting &rarr;
              </span>
            </div>

            <div className="bg-white p-7 rounded-[8px] border border-[#E5E5E5] space-y-4 hover:border-[#111111] transition shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="w-10 h-10 rounded-[6px] bg-[#F3F3F3] border border-[#E5E5E5] flex items-center justify-center text-[#111111]">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#111111]">AI Autonomous Support Copilot</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Resolves tier-1 customer inquiries instantly with empathy and contextual precision. Detects sentiment and escalates high-risk accounts to managers.
              </p>
              <span className="inline-block text-xs font-semibold text-[#111111] hover:underline cursor-pointer">
                Sentiment Extraction & Resolution &rarr;
              </span>
            </div>

            <div className="bg-white p-7 rounded-[8px] border border-[#E5E5E5] space-y-4 hover:border-[#111111] transition shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="w-10 h-10 rounded-[6px] bg-[#F3F3F3] border border-[#E5E5E5] flex items-center justify-center text-[#111111]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#111111]">Strategic Executive Observations</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Every morning, the AI synthesizes your financial, support, and sales metrics into actionable plain-English executive summaries and recommended actions.
              </p>
              <span className="inline-block text-xs font-semibold text-[#111111] hover:underline cursor-pointer">
                Autonomous Diagnostics &rarr;
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. AUTOMATION FEATURES SECTION */}
      <section id="automation" className="py-20 px-6 bg-[#FAFAFA] border-b border-[#E5E5E5]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#666666] flex items-center justify-center gap-1.5">
              <Zap className="w-4 h-4 text-[#111111]" /> Asynchronous Worker Pipelines
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#111111]">
              End-to-End Hands-Free Automation
            </h2>
            <p className="text-sm text-[#666666]">
              Celery task queues and Redis brokers guarantee zero bottleneck delays for high-volume jobs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[8px] border border-[#E5E5E5] flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="space-y-3">
                <div className="p-2.5 rounded-[6px] bg-[#F3F3F3] border border-[#E5E5E5] text-[#111111] w-fit">
                  <ReceiptText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#111111]">Instant Invoice OCR Extraction</h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Upload PDF invoices or scan receipts. Our computer vision OCR pipeline parses line items, calculates tax, validates totals, and automatically formats exportable CSVs and ERP entries.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E5E5E5] flex items-center justify-between text-xs text-[#666666]">
                <span>Confidence: 99.4%</span>
                <span className="text-[#111111] font-semibold">2.4s Avg Execution</span>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[8px] border border-[#E5E5E5] flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="space-y-3">
                <div className="p-2.5 rounded-[6px] bg-[#F3F3F3] border border-[#E5E5E5] text-[#111111] w-fit">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#111111]">Automated Webhooks & Background Sync</h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Trigger actions whenever leads are updated, invoices are paid, or support SLAs are reached. Celery task workers run silently without degrading frontend UI responsiveness.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E5E5E5] flex items-center justify-between text-xs text-[#666666]">
                <span>Broker: Redis</span>
                <span className="text-[#111111] font-semibold">Asynchronous Workers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ANALYTICS SECTION */}
      <section id="analytics" className="py-20 px-6 bg-white border-b border-[#E5E5E5]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#666666] flex items-center justify-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-[#111111]" /> Powered by Pandas Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#111111]">
              Real-Time Statistical Business Intelligence
            </h2>
            <p className="text-sm text-[#666666]">
              Transform raw transactional records into actionable time-series forecasts and pipeline funnels.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-[8px] border border-[#E5E5E5] space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <span className="text-xs font-semibold text-[#666666] uppercase">Forecasting</span>
              <h4 className="text-base font-semibold text-[#111111]">Rolling Moving Average Projections</h4>
              <p className="text-xs text-[#666666] leading-relaxed">
                Pandas calculates moving average seasonal curves to forecast quota achievement 3 months out.
              </p>
            </div>

            <div className="bg-white p-6 rounded-[8px] border border-[#E5E5E5] space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <span className="text-xs font-semibold text-[#666666] uppercase">Retention</span>
              <h4 className="text-base font-semibold text-[#111111]">Multi-Month Cohort Retention</h4>
              <p className="text-xs text-[#666666] leading-relaxed">
                Monitor subscriber retention against B2B industry benchmarks to detect churn patterns early.
              </p>
            </div>

            <div className="bg-white p-6 rounded-[8px] border border-[#E5E5E5] space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <span className="text-xs font-semibold text-[#666666] uppercase">Attribution</span>
              <h4 className="text-base font-semibold text-[#111111]">Multi-Channel Spend & ROI</h4>
              <p className="text-xs text-[#666666] leading-relaxed">
                Compare CAC and closed revenue across inbound, partner, and organic automation channels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 px-6 bg-[#FAFAFA] border-b border-[#E5E5E5]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#666666]">Fast 3-Step Setup</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#111111]">
              How Upteky AI Supercharges Your Company
            </h2>
            <p className="text-sm text-[#666666]">
              Get up and running in under 10 minutes with our self-serve guided onboarding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[8px] border border-[#E5E5E5] space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="w-10 h-10 rounded-[6px] bg-[#111111] text-white font-bold text-base flex items-center justify-center">
                1
              </div>
              <h3 className="text-lg font-bold text-[#111111]">Connect Your Workspace</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Create your tenant organization and invite team members with granular roles (Super Admin, Business Admin, Sales Manager, Employee).
              </p>
            </div>

            <div className="bg-white p-8 rounded-[8px] border border-[#E5E5E5] space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="w-10 h-10 rounded-[6px] bg-[#111111] text-white font-bold text-base flex items-center justify-center">
                2
              </div>
              <h3 className="text-lg font-bold text-[#111111]">Activate AI Automations</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Turn on the Autonomous Support Copilot, enable ML lead scoring, and connect invoice ingest queues with one click.
              </p>
            </div>

            <div className="bg-white p-8 rounded-[8px] border border-[#E5E5E5] space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="w-10 h-10 rounded-[6px] bg-[#111111] text-white font-bold text-base flex items-center justify-center">
                3
              </div>
              <h3 className="text-lg font-bold text-[#111111]">Scale Revenue Predictably</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Monitor real-time Recharts dashboards and Pandas forecasts as your team closes deals 3x faster without manual bottlenecks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PRICING SECTION */}
      <section id="pricing" className="py-20 px-6 bg-white border-b border-[#E5E5E5]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#666666]">Predictable Investment</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#111111]">
              Transparent Pricing Built for SMB Scale
            </h2>
            <p className="text-sm text-[#666666]">
              Select the plan that fits your business velocity. Upgrade or downgrade anytime.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="pt-4 flex items-center justify-center gap-3">
              <span className={`text-xs font-semibold ${!annualBilling ? 'text-[#111111]' : 'text-[#666666]'}`}>Monthly</span>
              <button
                onClick={() => setAnnualBilling(!annualBilling)}
                className="w-11 h-6 rounded-full bg-[#E5E5E5] p-0.5 relative transition-colors focus:outline-none"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-[#111111] transition-transform ${
                    annualBilling ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`text-xs font-semibold flex items-center gap-1.5 ${annualBilling ? 'text-[#111111]' : 'text-[#666666]'}`}>
                <span>Annual</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Save 20%
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="bg-white p-8 rounded-[8px] border border-[#E5E5E5] flex flex-col justify-between space-y-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-[#111111]">Starter</h3>
                  <p className="text-xs text-[#666666]">For small teams launching operations</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[#111111]">
                    ${annualBilling ? '39' : '49'}
                  </span>
                  <span className="text-xs text-[#666666]">/ month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-[#666666] pt-4 border-t border-[#E5E5E5]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#111111] flex-shrink-0" /> Up to 5 Team Members
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#111111] flex-shrink-0" /> ML Lead Scoring (1,000/mo)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#111111] flex-shrink-0" /> Invoice OCR (150 docs/mo)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#111111] flex-shrink-0" /> Standard Email Support
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="w-full text-center py-2.5 rounded-[6px] bg-white hover:bg-[#F7F7F7] border border-[#D9D9D9] text-xs font-semibold text-[#111111] transition"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Growth (Featured) */}
            <div className="bg-white p-8 rounded-[8px] border-2 border-[#111111] shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#111111] text-white text-[10px] font-bold uppercase tracking-wider">
                Most Popular
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-[#111111]">Growth</h3>
                  <p className="text-xs text-[#666666]">For accelerating SMBs scaling volume</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[#111111]">
                    ${annualBilling ? '119' : '149'}
                  </span>
                  <span className="text-xs text-[#666666]">/ month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-[#666666] pt-4 border-t border-[#E5E5E5]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#111111] flex-shrink-0" /> Up to 25 Team Members
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#111111] flex-shrink-0" /> Unlimited ML Lead Scoring
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#111111] flex-shrink-0" /> Invoice OCR (1,500 docs/mo)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#111111] flex-shrink-0" /> AI Support Copilot Agent
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#111111] flex-shrink-0" /> Full 4-Tier RBAC Access
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="w-full text-center py-2.5 rounded-[6px] bg-[#111111] hover:bg-[#222222] text-xs font-semibold text-white transition"
              >
                Start Free 14-Day Trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-white p-8 rounded-[8px] border border-[#E5E5E5] flex flex-col justify-between space-y-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-[#111111]">Enterprise</h3>
                  <p className="text-xs text-[#666666]">For multi-entity organizations & compliance</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[#111111]">
                    ${annualBilling ? '319' : '399'}
                  </span>
                  <span className="text-xs text-[#666666]">/ month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-[#666666] pt-4 border-t border-[#E5E5E5]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#111111] flex-shrink-0" /> Unlimited Team Accounts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#111111] flex-shrink-0" /> Custom ML Model Retraining
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#111111] flex-shrink-0" /> Unlimited Invoice OCR
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#111111] flex-shrink-0" /> Dedicated Account Manager & SLA
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#111111] flex-shrink-0" /> Custom ERP / CRM Connectors
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="w-full text-center py-2.5 rounded-[6px] bg-white hover:bg-[#F7F7F7] border border-[#D9D9D9] text-xs font-semibold text-[#111111] transition"
              >
                Contact Enterprise Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-20 px-6 bg-[#FAFAFA] border-b border-[#E5E5E5]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#666666]">Social Proof</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#111111]">
              Trusted by 140+ Growing Businesses
            </h2>
            <p className="text-sm text-[#666666]">
              See how operations leaders use Upteky AI to reclaim 20+ hours per week.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-7 rounded-[8px] border border-[#E5E5E5] space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="flex gap-1 text-[#111111]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#111111] text-[#111111]" />
                ))}
              </div>
              <p className="text-xs text-[#666666] leading-relaxed italic">
                "Upteky AI transformed our lead triage. Our sales reps only focus on accounts with an AI score above 80, and our close rate jumped from 14% to 28% in 60 days."
              </p>
              <div className="pt-2 border-t border-[#E5E5E5] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F3F3F3] text-[#111111] font-bold text-xs flex items-center justify-center border border-[#E5E5E5]">
                  SC
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#111111]">Sophia Chen</p>
                  <p className="text-[10px] text-[#666666]">CRO, Apex Financial Solutions</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-7 rounded-[8px] border border-[#E5E5E5] space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="flex gap-1 text-[#111111]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#111111] text-[#111111]" />
                ))}
              </div>
              <p className="text-xs text-[#666666] leading-relaxed italic">
                "Our finance team was drowning in vendor invoices every month end. The Celery OCR pipeline parses line items in seconds with zero manual data entry mistakes."
              </p>
              <div className="pt-2 border-t border-[#E5E5E5] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F3F3F3] text-[#111111] font-bold text-xs flex items-center justify-center border border-[#E5E5E5]">
                  DR
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#111111]">David Ross</p>
                  <p className="text-[10px] text-[#666666]">VP Operations, NexusTech Cloud</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-7 rounded-[8px] border border-[#E5E5E5] space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="flex gap-1 text-[#111111]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#111111] text-[#111111]" />
                ))}
              </div>
              <p className="text-xs text-[#666666] leading-relaxed italic">
                "The customer support copilot handles over 90% of routine client questions. It paid for itself in the first two weeks just by reducing ticket backlog."
              </p>
              <div className="pt-2 border-t border-[#E5E5E5] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F3F3F3] text-[#111111] font-bold text-xs flex items-center justify-center border border-[#E5E5E5]">
                  HM
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#111111]">Hannah Meyer</p>
                  <p className="text-[10px] text-[#666666]">Operations Director, BioCare Health</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ SECTION */}
      <section id="faq" className="py-20 px-6 bg-white border-b border-[#E5E5E5]">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#666666]">Got Questions?</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#111111]">Frequently Asked Questions</h2>
            <p className="text-sm text-[#666666]">Everything you need to know about the Upteky AI platform.</p>
          </div>

          <div className="space-y-3 pt-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-[6px] border border-[#E5E5E5] overflow-hidden transition"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-sm font-semibold text-[#111111] hover:bg-[#F7F7F7] transition"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-[#111111] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#666666] flex-shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-[#666666] leading-relaxed border-t border-[#E5E5E5] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. CALL TO ACTION (CTA) SECTION */}
      <section className="py-20 px-6 bg-[#FAFAFA] border-b border-[#E5E5E5]">
        <div className="max-w-4xl mx-auto bg-white p-10 sm:p-14 rounded-[8px] border border-[#E5E5E5] text-center space-y-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3F3F3] text-[#111111] text-xs font-semibold border border-[#E5E5E5]">
            <Award className="w-3.5 h-3.5" /> Fast 14-Day Free Evaluation
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-[#111111] tracking-tight">
            Ready to Automate Your Business Operations?
          </h2>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#666666]">
            Join over 140 high-growth companies saving hundreds of operational hours every month.
            Deploy in minutes with zero disruption to your existing workflow.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[6px] bg-[#111111] hover:bg-[#222222] text-white font-semibold text-sm transition duration-150"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[6px] bg-white hover:bg-[#F7F7F7] border border-[#D9D9D9] text-[#111111] font-semibold text-sm transition"
            >
              <span>Sign In with Demo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="border-t border-[#E5E5E5] bg-white py-12 px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Brand column */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[6px] bg-[#111111] flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-[#111111] text-base tracking-tight">Upteky AI</span>
              </div>
              <p className="text-xs text-[#666666] leading-relaxed max-w-sm">
                Intelligent business automation and predictive analytics platform for small and medium-sized enterprises.
              </p>
              <div className="flex items-center gap-2 text-xs text-[#666666]">
                <ShieldCheck className="w-4 h-4 text-[#111111]" />
                <span>Enterprise SOC2 Type II & GDPR Compliant</span>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#111111] mb-3">Platform</h4>
              <ul className="space-y-2 text-xs text-[#666666]">
                <li><a href="#ai-features" className="hover:text-[#111111] transition">AI Lead Scoring</a></li>
                <li><a href="#automation" className="hover:text-[#111111] transition">Invoice OCR</a></li>
                <li><a href="#ai-features" className="hover:text-[#111111] transition">Support Copilot</a></li>
                <li><a href="#analytics" className="hover:text-[#111111] transition">Pandas BI Engine</a></li>
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#111111] mb-3">Resources</h4>
              <ul className="space-y-2 text-xs text-[#666666]">
                <li><a href="#how-it-works" className="hover:text-[#111111] transition">How It Works</a></li>
                <li><a href="#pricing" className="hover:text-[#111111] transition">Pricing Plans</a></li>
                <li><a href="#faq" className="hover:text-[#111111] transition">FAQ Documentation</a></li>
                <li><Link to="/login" className="hover:text-[#111111] transition">Role Simulators</Link></li>
              </ul>
            </div>

            {/* Legal & Security */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#111111] mb-3">Security & Legal</h4>
              <ul className="space-y-2 text-xs text-[#666666]">
                <li className="hover:text-[#111111] transition cursor-pointer">Privacy Policy</li>
                <li className="hover:text-[#111111] transition cursor-pointer">Terms of Service</li>
                <li className="hover:text-[#111111] transition cursor-pointer">Security Safeguards</li>
                <li className="hover:text-[#111111] transition cursor-pointer">API Status: 99.99%</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#666666]">
            <p>&copy; 2026 Upteky AI Inc. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>English (US)</span>
              <span>•</span>
              <span className="text-emerald-700 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> All Systems Operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
