import React, { useState } from 'react';
import {
  Bot,
  Send,
  ArrowRight,
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
      text: `Hello ${user?.full_name?.split(' ')[0] || 'there'}! I am your AI Business Copilot. I analyze real-time data across your revenue streams, customer accounts, sales pipeline, and products. What strategic question can I help you with today?`,
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
      'Based on the current billing cycle, total revenue stands at Rs. 1,49,200 (+21.4% YoY). Your monthly sales run-rate is outpacing quota by 108%. The largest growth contributor is the "Upteky AI Enterprise Suite", which contributed Rs. 89,400 with a 92% retention rate.',
    margin:
      'Looking at your product catalog, "Autonomous Customer Support Copilot" delivers an 86.4% gross margin (Rs. 699 price vs Rs. 95 unit server cost). Overall catalog gross margin averages 82.5%, well above the SaaS industry benchmark of 75%.',
    leads:
      'You currently have 26 pending follow-ups requiring attention. In particular, 3 high-ARR opportunities (Apex Financial Solutions - Rs. 48,500, NexusTech - Rs. 32,000, and BioCare Health - Rs. 65,000) have AI scores above 90/100 and have been awaiting contact for over 48 hours.',
    forecast:
      'Our predictive forecasting model projects Q4 revenue between Rs. 3,80,000 and Rs. 4,15,000 based on your current 24.6% lead conversion rate and 14.2-day average deal cycle. Accelerating lead response time by 20% could lift gross revenue by an additional Rs. 34,000.',
  };

  const handleSend = (queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setTyping(true);

    setTimeout(() => {
      let replyText =
        'I examined your current database metrics. Business operations are pacing strongly with a 24.6% lead conversion rate, Rs. 1,49,200 in monthly revenue, and 1,280 active customer accounts. No anomalous attrition detected.';
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
    }, 800);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-lg border border-[#E5E5E5] shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#666666]">
              AI Strategic Advisor
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-[#111111] tracking-tight">
            AI Business Operations Copilot
          </h1>
          <p className="text-xs text-[#666666] mt-1">
            Query your business intelligence data in natural language for deep insights and actionable guidance.
          </p>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-lg border border-[#E5E5E5] shadow-subtle flex flex-col h-[650px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 max-w-2xl ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                  m.sender === 'user'
                    ? 'bg-[#111111] text-white'
                    : 'bg-[#F3F3F3] border border-[#E5E5E5] text-[#111111]'
                }`}
              >
                {m.sender === 'user' ? user?.full_name?.charAt(0) || 'U' : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-3.5 rounded-lg text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#111111] text-white'
                    : 'bg-[#F9FAFB] border border-[#E5E5E5] text-[#111111]'
                }`}
              >
                <p>{m.text}</p>

                {m.suggestions && (
                  <div className="mt-3 pt-3 border-t border-[#EBEBEB] space-y-1.5">
                    <p className="text-[10px] uppercase font-semibold text-[#666666] flex items-center gap-1">
                      <Lightbulb className="w-3 h-3 text-[#111111]" />
                      Suggested Queries:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {m.suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(s)}
                          className="px-2.5 py-1 rounded bg-white border border-[#D9D9D9] hover:bg-[#F3F3F3] text-[11px] text-[#111111] font-medium transition flex items-center gap-1 text-left"
                        >
                          <span>{s}</span>
                          <ArrowRight className="w-3 h-3 text-[#666666]" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <span
                  className={`block text-[9px] mt-2 text-right ${
                    m.sender === 'user' ? 'text-[#8A8A8A]' : 'text-[#8A8A8A]'
                  }`}
                >
                  {m.time}
                </span>
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex gap-3 max-w-xl">
              <div className="w-7 h-7 rounded-md bg-[#F3F3F3] border border-[#E5E5E5] flex items-center justify-center text-[#111111]">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-lg bg-[#F9FAFB] border border-[#E5E5E5] flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#111111] animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#111111] animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#111111] animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-[#666666] ml-1">Analyzing database records...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 bg-white border-t border-[#E5E5E5]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about revenue trends, margin by product, leads, or churn forecast..."
              className="flex-1 px-3 py-2 rounded-md bg-white border border-[#D9D9D9] text-xs text-[#111111] placeholder-[#8A8A8A] focus:outline-none focus:border-[#111111]"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || typing}
              className="btn-primary py-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask Copilot</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
