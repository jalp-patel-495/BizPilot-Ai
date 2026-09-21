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

  // 1. Live Chatbot State
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

  // 2. Conversations & Search State
  const [conversations, setConversations] = useState([]);
  const [convLoading, setConvLoading] = useState(false);
  const [convSearch, setConvSearch] = useState('');
  const [convStatusFilter, setConvStatusFilter] = useState('ALL');
  const [selectedConv, setSelectedConv] = useState(null);
  const [convDetailLoading, setConvDetailLoading] = useState(false);
  const [agentReplyText, setAgentReplyText] = useState('');
  const [agentReplying, setAgentReplying] = useState(false);

  // 3. Knowledge Base State
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [chatMessages, activeTab]);

  useEffect(() => {
    if (activeTab === 'conversations') {
      fetchConversations();
    } else if (activeTab === 'kb') {
      fetchKnowledgeBase();
    }
  }, [activeTab, convSearch, convStatusFilter, kbCategoryFilter, kbSearch]);

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

  const quickPrompts = [
    { label: 'Refund Policy', query: 'What is your 30-day refund policy?' },
    { label: 'Pro Tier Pricing', query: 'What features and pricing are in the Upteky AI Core Suite?' },
    { label: 'CRM Webhooks', query: 'How do I connect external CRM and ERP systems via Webhooks?' },
    { label: 'Emergency Contact', query: 'What is your customer support hotline and contact phone number?' },
    { label: 'Request Human Agent', query: 'I need to speak with a human support specialist.' },
    { label: 'Anti-Hallucination Test', query: 'Can you bake a chocolate pizza on Mars?' },
  ];

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
      await api.post(`/conversations/${selectedConv.id}/reply`, {
        message: agentReplyText.trim(),
      });
      setAgentReplyText('');
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

  const getCategoryBadge = (category) => {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200 capitalize">
        {category}
      </span>
    );
  };

  const getConvStatusBadge = (status) => {
    if (status === 'ACTIVE') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Active Chat</span>;
    }
    if (status === 'HANDOFF_REQUESTED') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 text-rose-600" />
          Handoff Requested
        </span>
      );
    }
    if (status === 'RESOLVED') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">Resolved</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">{status}</span>;
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header & Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">AI Customer Support Studio</h1>
          <p className="text-xs text-[#666666] mt-0.5">
            Grounded responses, zero hallucination safeguards, conversational search, and human agent handoff.
          </p>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-2.5">
          <div className="bg-white px-3 py-1.5 rounded-md border border-[#e5e5e5] flex items-center gap-2 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <div>
              <p className="text-[10px] text-[#8a8a8a]">Grounding Confidence</p>
              <p className="text-xs font-semibold text-[#111111]">96.8% High</p>
            </div>
          </div>
          <div className="bg-white px-3 py-1.5 rounded-md border border-[#e5e5e5] flex items-center gap-2 shadow-xs">
            <BookOpen className="w-3.5 h-3.5 text-[#111111]" />
            <div>
              <p className="text-[10px] text-[#8a8a8a]">Knowledge Base</p>
              <p className="text-xs font-semibold text-[#111111]">{kbItems.length || 18} Verified Items</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-1.5 border-b border-[#e5e5e5] pb-2">
        <button
          id="tab-chat"
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition ${
            activeTab === 'chat'
              ? 'bg-[#111111] text-white'
              : 'text-[#666666] hover:text-[#111111] hover:bg-[#f7f7f7]'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>AI Chatbot</span>
        </button>

        <button
          id="tab-conversations"
          onClick={() => setActiveTab('conversations')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition ${
            activeTab === 'conversations'
              ? 'bg-[#111111] text-white'
              : 'text-[#666666] hover:text-[#111111] hover:bg-[#f7f7f7]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Conversations</span>
          {conversations.some((c) => c.status === 'HANDOFF_REQUESTED') && (
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
          )}
        </button>

        <button
          id="tab-kb"
          onClick={() => setActiveTab('kb')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition ${
            activeTab === 'kb'
              ? 'bg-[#111111] text-white'
              : 'text-[#666666] hover:text-[#111111] hover:bg-[#f7f7f7]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Knowledge Base</span>
        </button>
      </div>

      {/* TAB 1: LIVE CHATBOT SIMULATOR */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
          {/* Left panel: Customer context & Quick Prompts */}
          <div className="lg:col-span-1 space-y-4">
            {/* Session Card */}
            <div className="bg-white p-4 rounded-lg border border-[#e5e5e5] space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#111111]" />
                  <span>Customer Session</span>
                </h4>
                <button
                  id="new-chat-btn"
                  onClick={startNewChat}
                  className="text-[11px] font-semibold text-[#111111] hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3 text-[#666666]" />
                  <span>New Chat</span>
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] text-[#666666] block mb-0.5 font-medium">Customer Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-white border border-[#d9d9d9] rounded-md px-2.5 py-1.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#666666] block mb-0.5 font-medium">Customer Email</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-white border border-[#d9d9d9] rounded-md px-2.5 py-1.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              {conversationId && (
                <div className="pt-2 border-t border-[#e5e5e5] text-[10px] text-[#8a8a8a]">
                  <span>ID: </span>
                  <span className="font-mono text-[#111111]">{conversationId.slice(0, 12)}...</span>
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            <div className="bg-white p-4 rounded-lg border border-[#e5e5e5] space-y-2 shadow-xs">
              <h4 className="text-xs font-semibold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#111111]" />
                <span>Test Inquiries</span>
              </h4>
              <p className="text-[11px] text-[#666666]">
                Click any inquiry to test knowledge retrieval, anti-hallucination, or handoff:
              </p>
              <div className="space-y-1 pt-1">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(p.query)}
                    className="w-full text-left p-2 rounded-md bg-[#fafafa] hover:bg-[#f3f3f3] border border-[#e5e5e5] text-[#111111] text-xs transition flex items-center justify-between"
                  >
                    <span className="truncate pr-1">{p.label}</span>
                    <ArrowUpRight className="w-3 h-3 text-[#8a8a8a] flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Human Handoff Banner */}
            <div className="bg-white p-4 rounded-lg border border-[#e5e5e5] space-y-2 shadow-xs">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-[#111111]" />
                <h4 className="text-xs font-semibold text-[#111111]">Need a Human Agent?</h4>
              </div>
              <p className="text-[11px] text-[#666666] leading-relaxed">
                Connect directly with a tier-2 representative if your issue requires tailored handling.
              </p>
              <button
                id="request-handoff-btn"
                onClick={handleManualHandoff}
                disabled={handoffRequested}
                className="w-full py-1.5 px-3 rounded-md bg-white hover:bg-[#f7f7f7] text-[#111111] text-xs font-semibold transition flex items-center justify-center gap-1.5 border border-[#d9d9d9] disabled:opacity-50"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#666666]" />
                <span>{handoffRequested ? 'Handoff Active' : 'Request Human Agent'}</span>
              </button>
            </div>
          </div>

          {/* Right panel: Chat Window */}
          <div className="lg:col-span-3 bg-white rounded-lg border border-[#e5e5e5] flex flex-col h-[620px] shadow-xs overflow-hidden">
            {/* Chat header */}
            <div className="p-3.5 border-b border-[#e5e5e5] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-[#111111] flex items-center justify-center text-white">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-[#111111]">Upteky AI Support Copilot</h3>
                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Online
                    </span>
                  </div>
                  <p className="text-[10px] text-[#666666]">Grounded Knowledge • Zero Hallucination Guard</p>
                </div>
              </div>

              {handoffRequested && (
                <div className="px-2.5 py-0.5 rounded text-rose-700 bg-rose-50 border border-rose-200 text-xs font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-rose-600" />
                  <span>Escalated to Human Agent</span>
                </div>
              )}
            </div>

            {/* Messages body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-white">
              {chatMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] space-y-1`}>
                    <div
                      className={`p-3.5 rounded-lg text-xs leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-[#111111] text-white shadow-xs'
                          : m.sender === 'system'
                          ? 'bg-[#f7f7f7] text-[#111111] border border-[#e5e5e5]'
                          : 'bg-[#fafafa] text-[#111111] border border-[#e5e5e5]'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.content}</p>

                      {m.sender === 'assistant' && (
                        <div className="mt-2.5 pt-2 border-t border-[#e5e5e5] flex flex-wrap items-center justify-between gap-2 text-[10px]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#666666]">Confidence:</span>
                            {m.confidence >= 0.75 ? (
                              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600" />
                                {Math.round(m.confidence * 100)}% Grounded
                              </span>
                            ) : (
                              <span className="font-semibold text-amber-700 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 text-amber-600" />
                                Low ({Math.round(m.confidence * 100)}%)
                              </span>
                            )}
                          </div>

                          {m.sources && m.sources.length > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-[#8a8a8a]">Cited:</span>
                              {m.sources.map((s, sidx) => (
                                <span
                                  key={sidx}
                                  className="px-1.5 py-0.2 rounded bg-white text-[#111111] border border-[#d9d9d9] font-medium"
                                  title={s.title}
                                >
                                  {s.title.length > 20 ? s.title.slice(0, 20) + '...' : s.title}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {m.handoff_offered && !handoffRequested && (
                        <div className="mt-2.5 pt-2 border-t border-[#e5e5e5] flex items-center justify-between bg-white -mx-3.5 -mb-3.5 p-2.5 rounded-b-lg border-t border-[#e5e5e5]">
                          <span className="text-[11px] text-[#111111] font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-[#666666]" />
                            Request human support?
                          </span>
                          <button
                            onClick={handleManualHandoff}
                            className="px-2.5 py-1 rounded bg-[#111111] hover:bg-[#222222] text-white font-semibold text-[11px] transition"
                          >
                            Connect to Human
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 px-1 text-[10px] text-[#8a8a8a]">
                      <span>{m.sender === 'user' ? customerName : m.sender === 'assistant' ? 'Upteky AI' : 'System'}</span>
                      <span>•</span>
                      <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#fafafa] p-3 rounded-lg border border-[#e5e5e5] flex items-center gap-2 text-xs text-[#666666]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#111111] animate-bounce" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#111111] animate-bounce delay-100" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#111111] animate-bounce delay-200" />
                    <span className="text-[11px] text-[#666666]">Searching verified knowledge base...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input footer */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-3 border-t border-[#e5e5e5] bg-white flex items-center gap-2">
              <input
                id="chat-input"
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about refund policies, pricing, APIs, or request human help..."
                className="flex-1 bg-white border border-[#d9d9d9] rounded-md px-3 py-2 text-xs text-[#111111] placeholder:text-[#8a8a8a] focus:outline-none focus:border-[#111111] transition"
              />
              <button
                id="chat-send-btn"
                type="submit"
                disabled={chatLoading || !inputMessage.trim()}
                className="p-2 rounded-md bg-[#111111] hover:bg-[#222222] text-white font-bold transition disabled:opacity-50 shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: CONVERSATIONS & SEARCH */}
      {activeTab === 'conversations' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="bg-white p-3.5 rounded-lg border border-[#e5e5e5] flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 text-[#8a8a8a] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="conversation-search"
                type="text"
                value={convSearch}
                onChange={(e) => setConvSearch(e.target.value)}
                placeholder="Search conversations by name, email, or message text..."
                className="w-full bg-white border border-[#d9d9d9] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#111111] placeholder:text-[#8a8a8a] focus:outline-none focus:border-[#111111]"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full md:w-auto">
              {['ALL', 'ACTIVE', 'HANDOFF_REQUESTED', 'RESOLVED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setConvStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition whitespace-nowrap ${
                    convStatusFilter === st
                      ? 'bg-[#111111] text-white shadow-xs'
                      : 'bg-white text-[#666666] hover:text-[#111111] border border-[#d9d9d9]'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st === 'HANDOFF_REQUESTED' ? 'Handoffs' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations Table */}
          <div className="bg-white rounded-lg border border-[#e5e5e5] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f9fafb] text-[#666666] border-b border-[#e5e5e5] text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Customer</th>
                    <th className="py-3 px-4 font-semibold">Inquiry / Subject</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Messages</th>
                    <th className="py-3 px-4 font-semibold">Last Active</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5]">
                  {convLoading ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-[#8a8a8a]">
                        Loading customer conversations...
                      </td>
                    </tr>
                  ) : conversations.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-[#8a8a8a]">
                        No conversations found matching your search.
                      </td>
                    </tr>
                  ) : (
                    conversations.map((c) => (
                      <tr key={c.id} className="hover:bg-[#f8f8f8] transition">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#111111]">{c.customer_name}</div>
                          <div className="text-[11px] text-[#666666]">{c.customer_email}</div>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-medium text-[#111111] truncate">{c.subject}</div>
                          <div className="text-[11px] text-[#8a8a8a] truncate mt-0.5">{c.last_message}</div>
                        </td>
                        <td className="py-3 px-4">{getConvStatusBadge(c.status)}</td>
                        <td className="py-3 px-4">
                          <span className="font-mono bg-[#f3f3f3] px-2 py-0.5 rounded border border-[#e5e5e5] text-[11px] text-[#111111]">
                            {c.message_count} msgs
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-[#666666]">
                          {new Date(c.updated_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5">
                          <button
                            id="view-transcript-btn"
                            onClick={() => viewConversationDetails(c.id)}
                            className="px-2.5 py-1 rounded-md bg-white hover:bg-[#f7f7f7] text-[#111111] font-semibold text-[11px] transition border border-[#d9d9d9]"
                          >
                            View
                          </button>
                          {c.status !== 'RESOLVED' && (
                            <button
                              onClick={() => handleResolveConversation(c.id)}
                              className="px-2.5 py-1 rounded-md bg-white hover:bg-emerald-50 text-emerald-700 font-semibold text-[11px] transition border border-emerald-200"
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

          {/* Detailed Conversation Inspector Modal */}
          {selectedConv && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-in fade-in duration-150">
              <div className="bg-white w-full max-w-3xl rounded-lg border border-[#e5e5e5] flex flex-col max-h-[85vh] overflow-hidden shadow-xl">
                {/* Header */}
                <div className="p-4 border-b border-[#e5e5e5] flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#111111]">{selectedConv.customer_name}</h3>
                      {getConvStatusBadge(selectedConv.status)}
                    </div>
                    <p className="text-xs text-[#666666] mt-0.5">
                      {selectedConv.customer_email} • Inquiry: <span className="text-[#111111] font-medium">{selectedConv.subject}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedConv.status !== 'RESOLVED' && (
                      <button
                        id="resolve-conv-btn"
                        onClick={() => handleResolveConversation(selectedConv.id)}
                        className="px-3 py-1 rounded-md bg-[#111111] hover:bg-[#222222] text-white font-semibold text-xs transition"
                      >
                        Mark Resolved
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedConv(null)}
                      className="p-1 rounded-md text-[#666666] hover:text-[#111111]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Messages Transcript */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#fafafa]">
                  {selectedConv.messages?.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex ${
                        m.sender === 'user' ? 'justify-start' : m.sender === 'human_agent' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div className="max-w-[80%] space-y-1">
                        <div
                          className={`p-3 rounded-md text-xs leading-relaxed ${
                            m.sender === 'user'
                              ? 'bg-white text-[#111111] border border-[#e5e5e5]'
                              : m.sender === 'human_agent'
                              ? 'bg-[#111111] text-white shadow-xs'
                              : m.sender === 'system'
                              ? 'bg-[#f7f7f7] text-[#111111] border border-[#e5e5e5]'
                              : 'bg-white text-[#111111] border border-[#e5e5e5]'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{m.content}</p>
                          {m.confidence !== undefined && m.sender === 'assistant' && (
                            <div className="mt-2 pt-2 border-t border-[#e5e5e5] text-[10px] text-[#666666] flex items-center gap-2">
                              <span>AI Confidence: <strong className="text-emerald-700">{Math.round(m.confidence * 100)}%</strong></span>
                            </div>
                          )}
                        </div>
                        <div className="text-[10px] text-[#8a8a8a] px-1">
                          <span className="font-medium text-[#666666]">
                            {m.sender === 'user' ? selectedConv.customer_name : m.sender === 'human_agent' ? 'Human Support Agent' : 'Upteky AI'}
                          </span>
                          <span> • {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Human Agent Reply Input Form */}
                <form onSubmit={handleAgentReply} className="p-3 border-t border-[#e5e5e5] bg-white flex items-center gap-2">
                  <input
                    id="agent-reply-input"
                    type="text"
                    value={agentReplyText}
                    onChange={(e) => setAgentReplyText(e.target.value)}
                    placeholder="Reply as human agent to customer..."
                    className="flex-1 bg-white border border-[#d9d9d9] rounded-md px-3 py-2 text-xs text-[#111111] placeholder:text-[#8a8a8a] focus:outline-none focus:border-[#111111]"
                  />
                  <button
                    id="agent-send-reply-btn"
                    type="submit"
                    disabled={agentReplying || !agentReplyText.trim()}
                    className="px-3.5 py-2 rounded-md bg-[#111111] hover:bg-[#222222] text-white font-semibold text-xs transition disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: KNOWLEDGE BASE MANAGER */}
      {activeTab === 'kb' && (
        <div className="space-y-4">
          {/* Category Filter & Search Bar */}
          <div className="bg-white p-4 rounded-lg border border-[#e5e5e5] space-y-3.5 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-[#8a8a8a] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="kb-search"
                  type="text"
                  value={kbSearch}
                  onChange={(e) => setKbSearch(e.target.value)}
                  placeholder="Search knowledge base articles by keyword, title, or content..."
                  className="w-full bg-white border border-[#d9d9d9] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#111111] placeholder:text-[#8a8a8a] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <button
                id="add-kb-btn"
                onClick={openAddKbModal}
                className="px-3.5 py-1.5 rounded-md bg-[#111111] hover:bg-[#222222] text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-xs whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Article</span>
              </button>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#e5e5e5]">
              <span className="text-[11px] font-medium text-[#666666] mr-1">Categories:</span>
              {[
                { id: 'ALL', label: 'All' },
                { id: 'faq', label: 'FAQs' },
                { id: 'product', label: 'Product Info' },
                { id: 'service', label: 'Services' },
                { id: 'company', label: 'Company' },
                { id: 'policy', label: 'Policies' },
                { id: 'contact', label: 'Contact' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setKbCategoryFilter(c.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                    kbCategoryFilter === c.id
                      ? 'bg-[#111111] text-white shadow-xs'
                      : 'bg-white text-[#666666] hover:text-[#111111] border border-[#d9d9d9]'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kbLoading ? (
              <div className="col-span-3 p-10 text-center text-xs text-[#8a8a8a]">
                Loading knowledge base records...
              </div>
            ) : kbItems.length === 0 ? (
              <div className="col-span-3 bg-white p-10 text-center rounded-lg border border-[#e5e5e5] text-[#8a8a8a] text-xs">
                No knowledge articles found. Click "Add Article" to populate business data.
              </div>
            ) : (
              kbItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-lg border border-[#e5e5e5] hover:border-[#111111] transition flex flex-col justify-between space-y-3 shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      {getCategoryBadge(item.category)}
                      <span className="text-[10px] text-[#8a8a8a]">
                        {new Date(item.updated_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#111111] leading-snug">
                      {item.title}
                    </h4>

                    <p className="text-xs text-[#666666] leading-relaxed line-clamp-4 bg-[#fafafa] p-2.5 rounded-md border border-[#e5e5e5]">
                      {item.content}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#e5e5e5] flex items-center justify-between">
                    <div className="text-[10px] text-[#8a8a8a] truncate max-w-[160px]">
                      Tags: <span className="text-[#111111]">{item.keywords || 'None'}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditKbModal(item)}
                        className="p-1 rounded text-[#666666] hover:text-[#111111] hover:bg-[#f7f7f7] transition"
                        title="Edit Article"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteKbItem(item.id)}
                        className="p-1 rounded text-[#8a8a8a] hover:text-rose-600 hover:bg-rose-50 transition"
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
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-in fade-in duration-150">
              <div className="bg-white w-full max-w-lg p-5 rounded-lg border border-[#e5e5e5] space-y-3.5 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-2.5">
                  <h3 className="text-sm font-semibold text-[#111111]">
                    {editingKbItem ? 'Edit Knowledge Article' : 'Add Knowledge Article'}
                  </h3>
                  <button
                    onClick={() => setIsKbModalOpen(false)}
                    className="p-1 rounded text-[#666666] hover:text-[#111111]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveKbItem} className="space-y-3 text-xs">
                  <div>
                    <label className="text-xs font-medium text-[#111111] block mb-1">Category</label>
                    <select
                      value={kbForm.category}
                      onChange={(e) => setKbForm({ ...kbForm, category: e.target.value })}
                      className="w-full bg-white border border-[#d9d9d9] rounded-md px-2.5 py-1.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                    >
                      <option value="faq">FAQs</option>
                      <option value="product">Product Information</option>
                      <option value="service">Services & SLA</option>
                      <option value="company">Company Standards</option>
                      <option value="policy">Policies & Terms</option>
                      <option value="contact">Contact Information</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#111111] block mb-1">Article Title</label>
                    <input
                      type="text"
                      required
                      value={kbForm.title}
                      onChange={(e) => setKbForm({ ...kbForm, title: e.target.value })}
                      placeholder="e.g. 30-Day Money-Back Guarantee"
                      className="w-full bg-white border border-[#d9d9d9] rounded-md px-3 py-1.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#111111] block mb-1">Article Content</label>
                    <textarea
                      required
                      rows={5}
                      value={kbForm.content}
                      onChange={(e) => setKbForm({ ...kbForm, content: e.target.value })}
                      placeholder="Enter verified business knowledge that the AI will use to answer customer questions..."
                      className="w-full bg-white border border-[#d9d9d9] rounded-md px-3 py-1.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#111111] block mb-1">Search Keywords / Tags</label>
                    <input
                      type="text"
                      value={kbForm.keywords}
                      onChange={(e) => setKbForm({ ...kbForm, keywords: e.target.value })}
                      placeholder="e.g. refund, money back, guarantee"
                      className="w-full bg-white border border-[#d9d9d9] rounded-md px-3 py-1.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e5e5e5]">
                    <button
                      type="button"
                      onClick={() => setIsKbModalOpen(false)}
                      className="px-3.5 py-1.5 rounded-md text-[#666666] hover:text-[#111111] text-xs font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-md bg-[#111111] hover:bg-[#222222] text-white text-xs font-semibold shadow-xs"
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
