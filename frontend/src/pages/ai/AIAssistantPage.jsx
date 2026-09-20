import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  Zap,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const AIAssistantPage = () => {
  const { user } = useAuth();
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Hello ${user?.full_name?.split(' ')[0] || 'there'}! I am your Upteky AI Business Copilot. I analyze real-time data across your revenue streams, customer accounts, sales pipeline, and products. What strategic question can I help you with today?`,
      time: 'Just now',
      suggestions: [
        "Analyze this month's revenue trajectory",
        'Which product has the highest profit margin?',
        'List urgent pending lead follow-ups',
        'Forecast next quarter sales based on current velocity',
      ],
    },
  ]);
  const [typing, setTyping] = useState(false);

  const predefinedAnswers = {
    revenue:
      'Based on the current billing cycle, total revenue stands at $149,200 (+21.4% YoY). Your monthly sales run-rate is outpacing quota by 108%. The largest growth contributor is the "Upteky AI Enterprise Suite", which contributed $89,400 with a 92% retention rate.',
    margin:
      'Looking at your product catalog, "Autonomous Customer Support Copilot" delivers an 86.4% gross margin ($699 price vs $95 unit server cost). Overall catalog gross margin averages 82.5%, well above the SaaS industry benchmark of 75%.',
    leads:
      'You currently have 26 pending follow-ups requiring attention. In particular, 3 high-ARR opportunities (Apex Financial Solutions - $48,500, NexusTech - $32,000, and BioCare Health - $65,000) have AI scores above 90/100 and have been awaiting contact for over 48 hours.',
    forecast:
      'Our Scikit-learn predictive forecasting model projects Q4 revenue between $380,000 and $415,000 based on your current 24.6% lead conversion rate and 14.2-day average deal cycle. Accelerating lead response time by 20% could lift gross revenue by an additional $34,000.',
  };

  const handleSend = (queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setTyping(true);

    setTimeout(() => {
      let replyText =
        'I examined your current database metrics. Business operations are pacing strongly with a 24.6% lead conversion rate, $149,200 in monthly revenue, and 1,280 active customer accounts. No anomalous attrition detected.';
      const lower = textToSend.toLowerCase();
      if (lower.includes('revenue') || lower.includes('trajectory') || lower.includes('sales')) {
        replyText = predefinedAnswers.revenue;
      } else if (lower.includes('margin') || lower.includes('profit') || lower.includes('product')) {
        replyText = predefinedAnswers.margin;
      } else if (lower.includes('lead') || lower.includes('follow') || lower.includes('pipeline')) {
        replyText = predefinedAnswers.leads;
      } else if (lower.includes('forecast') || lower.includes('quarter') || lower.includes('velocity')) {
        replyText = predefinedAnswers.forecast;
      }

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: replyText,
        time: 'Just now',
      };
      setMessages((prev) => [...prev, aiMsg]);
      setTyping(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Bot className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              AI Strategic Advisor
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Business Operations Copilot
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Query your business intelligence data in natural language for deep insights and actionable guidance.
          </p>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="glass-panel rounded-3xl border border-slate-800 flex flex-col h-[650px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 max-w-3xl ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xs ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-tr from-brand-600 to-indigo-600 shadow-glow'
                    : 'bg-slate-800 border border-brand-500/30 text-brand-400'
                }`}
              >
                {m.sender === 'user' ? user?.full_name?.charAt(0) || 'U' : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-brand-600 text-white shadow-glow'
                    : 'bg-slate-900 border border-slate-800 text-slate-200'
                }`}
              >
                <p>{m.text}</p>

                {m.suggestions && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                    <p className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3 text-amber-400" />
                      Suggested Business Queries:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {m.suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(s)}
                          className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-brand-500/40 text-[11px] text-slate-300 hover:text-white transition flex items-center gap-1"
                        >
                          <span>{s}</span>
                          <ArrowRight className="w-3 h-3 text-brand-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <span className="block text-[9px] text-slate-400 mt-2 text-right">{m.time}</span>
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex gap-3 max-w-xl">
              <div className="w-9 h-9 rounded-2xl bg-slate-800 border border-brand-500/30 flex items-center justify-center text-brand-400">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-slate-400 ml-1">Analyzing database records...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about revenue trends, margin by product, leads, or churn forecast..."
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || typing}
              className="px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-xs shadow-glow transition flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask Copilot</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
