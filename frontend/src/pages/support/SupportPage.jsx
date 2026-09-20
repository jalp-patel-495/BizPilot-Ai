import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  ThumbsUp,
  Search,
  Plus,
  Trash2,
  Edit3,
  User,
  ShieldCheck,
  HelpCircle,
  FileText,
  Phone,
  Building2,
  BookOpen,
  RefreshCw,
  X,
  ArrowUpRight,
  Check,
  Flame,
  MessageCircle,
  ExternalLink,
  Layers,
  ChevronRight,
  Headphones,
  UserCheck,
} from 'lucide-react';
import api from '../../services/api';
import { StatusBadge } from '../../components/common/Badge';

export const SupportPage = () => {
  // Navigation tabs: 'chat', 'conversations', 'kb'
  const [activeTab, setActiveTab] = useState('chat');

  // ==========================================
  // 1. Live Chatbot State
  // ==========================================
  const [conversationId, setConversationId] = useState(null);
  const [customerName, setCustomerName] = useState('Samantha Wright');
  const [customerEmail, setCustomerEmail] = useState('samantha@wrightventures.com');
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'assistant',
      content: 'Hello! I am the Upteky AI Customer Support Copilot, grounded directly in our verified company knowledge base. How can I assist your business workflows today?',
      confidence: 1.0,
      sources: [],
      handoff_offered: false,
      created_at: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [handoffRequested, setHandoffRequested] = useState(false);
  const messagesEndRef = useRef(null);

  // ==========================================
  // 2. Conversations & Search State
  // ==========================================
  const [conversations, setConversations] = useState([]);
  const [convLoading, setConvLoading] = useState(false);
  const [convSearch, setConvSearch] = useState('');
  const [convStatusFilter, setConvStatusFilter] = useState('ALL');
  const [selectedConv, setSelectedConv] = useState(null);
  const [convDetailLoading, setConvDetailLoading] = useState(false);
  const [agentReplyText, setAgentReplyText] = useState('');
  const [agentReplying, setAgentReplying] = useState(false);

  // ==========================================
  // 3. Knowledge Base State
  // ==========================================
  const [kbItems, setKbItems] = useState([]);
  const [kbLoading, setKbLoading] = useState(false);
  const [kbCategoryFilter, setKbCategoryFilter] = useState('ALL');
  const [kbSearch, setKbSearch] = useState('');
  const [isKbModalOpen, setIsKbModalOpen] = useState(false);
  const [editingKbItem, setEditingKbItem] = useState(null);
  const [kbForm, setKbForm] = useState({
    category: 'faq',
    title: '',
    content: '',
    keywords: '',
    is_active: true,
  });

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [chatMessages, activeTab]);

  // Load conversations when tab active
  useEffect(() => {
    if (activeTab === 'conversations') {
      fetchConversations();
    } else if (activeTab === 'kb') {
      fetchKnowledgeBase();
    }
  }, [activeTab, convSearch, convStatusFilter, kbCategoryFilter, kbSearch]);

  // ==========================================
  // Chat Actions
  // ==========================================
  const handleSendMessage = async (textToSend) => {
    const query = typeof textToSend === 'string' ? textToSend : inputMessage;
    if (!query || !query.trim() || chatLoading) return;

    setInputMessage('');
    const userMsg = {
      sender: 'user',
      content: query.trim(),
      created_at: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatLoading(true);

    try {
      const res = await api.post('/chat', {
        message: query.trim(),
        conversation_id: conversationId,
        customer_name: customerName,
        customer_email: customerEmail,
      });

      const data = res.data;
      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
      }

      if (data.status === 'HANDOFF_REQUESTED') {
        setHandoffRequested(true);
      }

      const botMsg = {
        sender: 'assistant',
        content: data.message,
        confidence: data.confidence,
        sources: data.sources || [],
        handoff_offered: data.handoff_offered,
        status: data.status,
        created_at: data.created_at || new Date().toISOString(),
      };

      setChatMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          content: 'Unable to contact the AI engine. Please verify the backend service is operational.',
          confidence: 0.0,
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleManualHandoff = async () => {
    if (!conversationId) {
      // Trigger via chat message
      handleSendMessage('I would like to request human support handoff.');
      return;
    }
    try {
      await api.post(`/conversations/${conversationId}/handoff`);
      setHandoffRequested(true);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'system',
          content: 'Your conversation has been flagged for human support. A dedicated specialist has been notified.',
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error('Handoff error:', err);
    }
  };

  const startNewChat = () => {
    setConversationId(null);
    setHandoffRequested(false);
    setChatMessages([
      {
        sender: 'assistant',
        content: 'Hello! I am the Upteky AI Customer Support Copilot, grounded directly in our verified company knowledge base. How can I assist your business workflows today?',
        confidence: 1.0,
        sources: [],
        handoff_offered: false,
        created_at: new Date().toISOString(),
      },
    ]);
  };

  // Quick inquiry prompt chips
  const quickPrompts = [
    { label: 'Refund Policy', query: 'What is your 30-day refund policy?' },
    { label: 'Pro Tier Pricing', query: 'What features and pricing are in the Upteky AI Core Suite?' },
    { label: 'CRM Webhooks', query: 'How do I connect external CRM and ERP systems via Webhooks?' },
    { label: 'Emergency Contact', query: 'What is your customer support hotline and contact phone number?' },
    { label: 'Request Human Agent', query: 'I need to speak with a human support specialist.' },
    { label: 'Anti-Hallucination Test', query: 'Can you bake a chocolate pizza on Mars?' },
  ];

  // ==========================================
  // Conversations Actions
  // ==========================================
  const fetchConversations = async () => {
    try {
      setConvLoading(true);
      const params = {};
      if (convSearch) params.search = convSearch;
      if (convStatusFilter && convStatusFilter !== 'ALL') params.status = convStatusFilter;

      const res = await api.get('/conversations', { params });
      if (res.data?.data) {
        setConversations(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setConvLoading(false);
    }
  };

  const viewConversationDetails = async (id) => {
    try {
      setConvDetailLoading(true);
      const res = await api.get(`/conversations/${id}`);
      if (res.data?.data) {
        setSelectedConv(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching details:', err);
    } finally {
      setConvDetailLoading(false);
    }
  };

  const handleAgentReply = async (e) => {
    e.preventDefault();
    if (!agentReplyText.trim() || !selectedConv || agentReplying) return;

    setAgentReplying(true);
    try {
      const res = await api.post(`/conversations/${selectedConv.id}/reply`, {
        message: agentReplyText.trim(),
      });
      setAgentReplyText('');
      // Refresh details
      viewConversationDetails(selectedConv.id);
      fetchConversations();
    } catch (err) {
      console.error('Error posting agent reply:', err);
    } finally {
      setAgentReplying(false);
    }
  };

  const handleResolveConversation = async (id) => {
    try {
      await api.post(`/conversations/${id}/resolve`);
      if (selectedConv && selectedConv.id === id) {
        viewConversationDetails(id);
      }
      fetchConversations();
    } catch (err) {
      console.error('Error resolving conversation:', err);
    }
  };

  // ==========================================
  // Knowledge Base Actions
  // ==========================================
  const fetchKnowledgeBase = async () => {
    try {
      setKbLoading(true);
      const params = {};
      if (kbCategoryFilter && kbCategoryFilter !== 'ALL') params.category = kbCategoryFilter;
      if (kbSearch) params.search = kbSearch;

      const res = await api.get('/knowledge-base', { params });
      if (res.data?.data) {
        setKbItems(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching knowledge base:', err);
    } finally {
      setKbLoading(false);
    }
  };

  const openAddKbModal = () => {
    setEditingKbItem(null);
    setKbForm({
      category: 'faq',
      title: '',
      content: '',
      keywords: '',
      is_active: true,
    });
    setIsKbModalOpen(true);
  };

  const openEditKbModal = (item) => {
    setEditingKbItem(item);
    setKbForm({
      category: item.category,
      title: item.title,
      content: item.content,
      keywords: item.keywords || '',
      is_active: item.is_active,
    });
    setIsKbModalOpen(true);
  };

  const handleSaveKbItem = async (e) => {
    e.preventDefault();
    try {
      if (editingKbItem) {
        await api.put(`/knowledge-base/${editingKbItem.id}`, kbForm);
      } else {
        await api.post('/knowledge-base', kbForm);
      }
      setIsKbModalOpen(false);
      fetchKnowledgeBase();
    } catch (err) {
      console.error('Error saving KB item:', err);
    }
  };

  const handleDeleteKbItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this knowledge base article?')) return;
    try {
      await api.delete(`/knowledge-base/${id}`);
      fetchKnowledgeBase();
    } catch (err) {
      console.error('Error deleting KB item:', err);
    }
  };

  // Category badge formatting
  const getCategoryBadge = (category) => {
    const config = {
      faq: { label: 'FAQ', bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
      product: { label: 'Product Info', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
      service: { label: 'Service & SLA', bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
      company: { label: 'Company Info', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
      policy: { label: 'Official Policy', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
      contact: { label: 'Contact Details', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    };
    const c = config[category?.toLowerCase()] || { label: category, bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
    return <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${c.bg}`}>{c.label}</span>;
  };

  // Status badge formatting
  const getConvStatusBadge = (status) => {
    if (status === 'ACTIVE') {
      return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active Chat</span>;
    }
    if (status === 'HANDOFF_REQUESTED') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Handoff Requested
        </span>
      );
    }
    if (status === 'RESOLVED') {
      return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">Resolved</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">{status}</span>;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header & Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" />
              Phase 5: Autonomous Customer Support & Knowledge Studio
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">AI Customer Support Studio</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Grounded responses, zero hallucination anti-guessing safeguards, conversational search, and human agent handoff.
          </p>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-3">
          <div className="glass-panel px-3.5 py-2 rounded-xl border border-slate-800 flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <p className="text-[10px] text-slate-400">Grounding Confidence</p>
              <p className="text-xs font-bold text-white">96.8% High</p>
            </div>
          </div>
          <div className="glass-panel px-3.5 py-2 rounded-xl border border-slate-800 flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-brand-400" />
            <div>
              <p className="text-[10px] text-slate-400">Knowledge Base</p>
              <p className="text-xs font-bold text-white">{kbItems.length || 18} Verified Items</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          id="tab-chat"
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'chat'
              ? 'bg-brand-600 text-white shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>AI Chatbot Simulator</span>
        </button>

        <button
          id="tab-conversations"
          onClick={() => setActiveTab('conversations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'conversations'
              ? 'bg-brand-600 text-white shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Conversations & Search</span>
          {conversations.some((c) => c.status === 'HANDOFF_REQUESTED') && (
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
          )}
        </button>

        <button
          id="tab-kb"
          onClick={() => setActiveTab('kb')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'kb'
              ? 'bg-brand-600 text-white shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Knowledge Base Manager</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LIVE CHATBOT SIMULATOR */}
      {/* ========================================================================= */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Left panel: Customer context & Quick Prompts */}
          <div className="lg:col-span-1 space-y-4">
            {/* Session Card */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-brand-400" />
                  <span>Customer Session</span>
                </h4>
                <button
                  id="new-chat-btn"
                  onClick={startNewChat}
                  className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>New Chat</span>
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">Customer Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">Customer Email</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {conversationId && (
                <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                  <span>Conv ID: </span>
                  <span className="font-mono text-slate-300">{conversationId.slice(0, 12)}...</span>
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Inquiries</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Click any inquiry to test knowledge retrieval, anti-hallucination refusal, or human handoff:
              </p>
              <div className="space-y-1.5 pt-1">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(p.query)}
                    className="w-full text-left p-2 rounded-xl bg-slate-950/60 hover:bg-brand-500/15 border border-slate-800/80 hover:border-brand-500/30 text-slate-300 hover:text-white text-xs transition group flex items-center justify-between"
                  >
                    <span className="truncate pr-1">{p.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-brand-400 transition flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Human Handoff Banner */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white">Need a Human Specialist?</h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Connect directly with a tier-2 representative at any time if your issue requires tailored handling.
              </p>
              <button
                id="request-handoff-btn"
                onClick={handleManualHandoff}
                disabled={handoffRequested}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-700 disabled:opacity-50"
              >
                <UserCheck className="w-3.5 h-3.5 text-brand-400" />
                <span>{handoffRequested ? 'Handoff Active' : 'Request Human Agent'}</span>
              </button>
            </div>
          </div>

          {/* Right panel: Chat Window */}
          <div className="lg:col-span-3 glass-panel rounded-3xl border border-slate-800 flex flex-col h-[650px] shadow-2xl overflow-hidden">
            {/* Chat header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 p-0.5 shadow-glow flex items-center justify-center">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <Bot className="w-5 h-5 text-brand-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-tight">Upteky AI Support Copilot</h3>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Online
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Grounded Knowledge • Zero Hallucination • Model Upteky-v1</p>
                </div>
              </div>

              {handoffRequested && (
                <div className="px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-1.5 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Escalated to Human Agent</span>
                </div>
              )}
            </div>

            {/* Messages body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {chatMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] space-y-1.5`}>
                    <div
                      className={`p-4 rounded-2xl text-xs leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-tr-xs shadow-md'
                          : m.sender === 'system'
                          ? 'bg-amber-500/10 text-amber-200 border border-amber-500/30 rounded-xl'
                          : 'bg-slate-950/90 text-slate-200 border border-slate-800 rounded-tl-xs shadow-lg'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.content}</p>

                      {/* Assistant confidence and sources pill */}
                      {m.sender === 'assistant' && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                          {/* Confidence Tag */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">Confidence:</span>
                            {m.confidence >= 0.75 ? (
                              <span className="font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                <Check className="w-3 h-3" />
                                {Math.round(m.confidence * 100)}% Grounded
                              </span>
                            ) : (
                              <span className="font-bold text-amber-400 flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                <AlertCircle className="w-3 h-3" />
                                Low Confidence ({Math.round(m.confidence * 100)}%)
                              </span>
                            )}
                          </div>

                          {/* Sources */}
                          {m.sources && m.sources.length > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400">Cited:</span>
                              {m.sources.map((s, sidx) => (
                                <span
                                  key={sidx}
                                  className="px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20 font-medium"
                                  title={s.title}
                                >
                                  {s.title.length > 25 ? s.title.slice(0, 25) + '...' : s.title}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Handoff Offered Action */}
                      {m.handoff_offered && !handoffRequested && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between bg-amber-500/5 -mx-4 -mb-4 p-3 rounded-b-2xl border-t border-amber-500/20">
                          <span className="text-[11px] text-amber-300 font-medium flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Would you like human support?
                          </span>
                          <button
                            onClick={handleManualHandoff}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition shadow-sm"
                          >
                            Connect to Human Agent
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 px-1 text-[10px] text-slate-500">
                      <span>{m.sender === 'user' ? customerName : m.sender === 'assistant' ? 'Upteky AI Copilot' : 'System'}</span>
                      <span>•</span>
                      <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-2 text-xs text-slate-400 shadow-md">
                    <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce delay-100" />
                    <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce delay-200" />
                    <span className="text-[11px] font-medium text-slate-300">Evaluating business knowledge base...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input footer */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2">
              <input
                id="chat-input"
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about refund policies, pricing, APIs, emergency contacts, or request a human..."
                className="flex-1 bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition"
              />
              <button
                id="chat-send-btn"
                type="submit"
                disabled={chatLoading || !inputMessage.trim()}
                className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition disabled:opacity-50 shadow-glow"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CONVERSATIONS & SEARCH */}
      {/* ========================================================================= */}
      {activeTab === 'conversations' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="conversation-search"
                type="text"
                value={convSearch}
                onChange={(e) => setConvSearch(e.target.value)}
                placeholder="Search conversations by customer name, email, subject, or message text..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              {['ALL', 'ACTIVE', 'HANDOFF_REQUESTED', 'RESOLVED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setConvStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                    convStatusFilter === st
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st === 'HANDOFF_REQUESTED' ? 'Handoffs' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations Grid & Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Customer</th>
                    <th className="py-3 px-4 font-semibold">Inquiry / Subject</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Messages</th>
                    <th className="py-3 px-4 font-semibold">Last Active</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {convLoading ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-500">
                        Loading customer conversations...
                      </td>
                    </tr>
                  ) : conversations.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-500">
                        No conversations found matching your search.
                      </td>
                    </tr>
                  ) : (
                    conversations.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{c.customer_name}</div>
                          <div className="text-[11px] text-slate-400">{c.customer_email}</div>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-medium text-slate-200 truncate">{c.subject}</div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">{c.last_message}</div>
                        </td>
                        <td className="py-3 px-4">{getConvStatusBadge(c.status)}</td>
                        <td className="py-3 px-4">
                          <span className="font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
                            {c.message_count} msgs
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-400">
                          {new Date(c.updated_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            id="view-transcript-btn"
                            onClick={() => viewConversationDetails(c.id)}
                            className="px-2.5 py-1 rounded-lg bg-brand-600/20 hover:bg-brand-600/40 text-brand-300 font-semibold text-[11px] transition border border-brand-500/30"
                          >
                            View Transcript
                          </button>
                          {c.status !== 'RESOLVED' && (
                            <button
                              onClick={() => handleResolveConversation(c.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold text-[11px] transition border border-emerald-500/30"
                            >
                              Resolve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Conversation Inspector Modal / Slide-over */}
          {selectedConv && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
              <div className="glass-panel w-full max-w-3xl rounded-3xl border border-slate-800 flex flex-col max-h-[85vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{selectedConv.customer_name}</h3>
                      {getConvStatusBadge(selectedConv.status)}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedConv.customer_email} • Inquiry: <span className="text-slate-300 font-medium">{selectedConv.subject}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedConv.status !== 'RESOLVED' && (
                      <button
                        id="resolve-conv-btn"
                        onClick={() => handleResolveConversation(selectedConv.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                      >
                        Mark Resolved
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedConv(null)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Messages Transcript */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-950/50">
                  {selectedConv.messages?.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex ${
                        m.sender === 'user' ? 'justify-start' : m.sender === 'human_agent' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div className="max-w-[85%] space-y-1">
                        <div
                          className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                            m.sender === 'user'
                              ? 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-xs'
                              : m.sender === 'human_agent'
                              ? 'bg-brand-600 text-white rounded-tr-xs shadow-md'
                              : m.sender === 'system'
                              ? 'bg-amber-500/10 text-amber-200 border border-amber-500/30'
                              : 'bg-indigo-950/40 text-slate-200 border border-indigo-500/20 rounded-tl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{m.content}</p>
                          {m.confidence !== undefined && m.sender === 'assistant' && (
                            <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center gap-2">
                              <span>AI Confidence: <strong className="text-emerald-400">{Math.round(m.confidence * 100)}%</strong></span>
                            </div>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 px-1">
                          <span className="font-semibold text-slate-400">
                            {m.sender === 'user' ? selectedConv.customer_name : m.sender === 'human_agent' ? 'Human Support Agent' : 'Upteky AI'}
                          </span>
                          <span> • {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Human Agent Reply Input Form */}
                <form onSubmit={handleAgentReply} className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2">
                  <input
                    id="agent-reply-input"
                    type="text"
                    value={agentReplyText}
                    onChange={(e) => setAgentReplyText(e.target.value)}
                    placeholder="Reply as human agent (this will post directly to customer transcript)..."
                    className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
                  />
                  <button
                    id="agent-send-reply-btn"
                    type="submit"
                    disabled={agentReplying || !agentReplyText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition disabled:opacity-50 flex items-center gap-1.5 shadow-glow"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Reply</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: KNOWLEDGE BASE MANAGER */}
      {/* ========================================================================= */}
      {activeTab === 'kb' && (
        <div className="space-y-6">
          {/* Category Filter & Search Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="kb-search"
                  type="text"
                  value={kbSearch}
                  onChange={(e) => setKbSearch(e.target.value)}
                  placeholder="Search knowledge base articles by keyword, title, or content..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <button
                id="add-kb-btn"
                onClick={openAddKbModal}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-glow whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Add Knowledge Article</span>
              </button>
            </div>

            {/* 6 Category Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 mr-1">Categories:</span>
              {[
                { id: 'ALL', label: 'All Categories' },
                { id: 'faq', label: 'FAQs' },
                { id: 'product', label: 'Product Info' },
                { id: 'service', label: 'Services & SLA' },
                { id: 'company', label: 'Company Info' },
                { id: 'policy', label: 'Policies' },
                { id: 'contact', label: 'Contact Info' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setKbCategoryFilter(c.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                    kbCategoryFilter === c.id
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/80'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {kbLoading ? (
              <div className="col-span-3 p-12 text-center text-xs text-slate-500">
                Loading knowledge base records...
              </div>
            ) : kbItems.length === 0 ? (
              <div className="col-span-3 glass-panel p-12 text-center rounded-2xl border border-slate-800 text-slate-400 text-xs">
                No knowledge articles found. Click "Add Knowledge Article" to populate business data.
              </div>
            ) : (
              kbItems.map((item) => (
                <div
                  key={item.id}
                  className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-brand-500/30 transition flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      {getCategoryBadge(item.category)}
                      <span className="text-[10px] text-slate-500">
                        Updated {new Date(item.updated_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white leading-snug group-hover:text-brand-300 transition">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-4 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
                      {item.content}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="text-[10px] text-slate-500 truncate max-w-[180px]">
                      Tags: <span className="text-slate-400">{item.keywords || 'None'}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditKbModal(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title="Edit Article"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteKbItem(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete Article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add / Edit Modal */}
          {isKbModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
              <div className="glass-panel w-full max-w-xl p-6 rounded-3xl border border-slate-800 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white">
                    {editingKbItem ? 'Edit Knowledge Article' : 'Add Knowledge Article'}
                  </h3>
                  <button
                    onClick={() => setIsKbModalOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveKbItem} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                    <select
                      value={kbForm.category}
                      onChange={(e) => setKbForm({ ...kbForm, category: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                    >
                      <option value="faq">FAQs (Frequently Asked Questions)</option>
                      <option value="product">Product Information & Specs</option>
                      <option value="service">Services & SLA</option>
                      <option value="company">Company Information & Standards</option>
                      <option value="policy">Policies & Terms</option>
                      <option value="contact">Contact Information</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Article Title</label>
                    <input
                      type="text"
                      required
                      value={kbForm.title}
                      onChange={(e) => setKbForm({ ...kbForm, title: e.target.value })}
                      placeholder="e.g. 30-Day Money-Back Satisfaction Guarantee"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Article Content</label>
                    <textarea
                      required
                      rows={5}
                      value={kbForm.content}
                      onChange={(e) => setKbForm({ ...kbForm, content: e.target.value })}
                      placeholder="Enter verified business knowledge that the AI will use to answer customer questions..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Search Keywords / Tags</label>
                    <input
                      type="text"
                      value={kbForm.keywords}
                      onChange={(e) => setKbForm({ ...kbForm, keywords: e.target.value })}
                      placeholder="e.g. refund, money back, cancellation, guarantee"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsKbModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-glow"
                    >
                      {editingKbItem ? 'Save Changes' : 'Create Article'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
