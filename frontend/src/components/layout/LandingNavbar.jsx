import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Menu, X, ArrowRight } from 'lucide-react';

export const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Problem', href: '#problem' },
    { name: 'AI Features', href: '#ai-features' },
    { name: 'Automation', href: '#automation' },
    { name: 'Analytics', href: '#analytics' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-white border-b border-[#E5E5E5] py-3 shadow-subtle'
          : 'bg-white/95 border-b border-[#F0F0F0] py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-[#111111] text-white flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[#111111] text-base tracking-tight">Upteky AI</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#F3F3F3] text-[#111111] border border-[#E5E5E5]">
                SaaS
              </span>
            </div>
            <p className="text-[10px] text-[#8A8A8A]">Business Automation & Analytics</p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-xs font-medium text-[#666666] hover:text-[#111111] transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Link
            to="/login"
            className="px-3.5 py-1.5 text-xs font-medium text-[#111111] hover:bg-[#F7F7F7] border border-[#D9D9D9] rounded-md transition"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#111111] hover:bg-[#262626] text-white font-medium text-xs transition"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-1.5 rounded-md bg-white border border-[#D9D9D9] text-[#666666] hover:text-[#111111]"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E5E5E5] px-6 py-5 space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col space-y-2.5">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-medium text-[#666666] hover:text-[#111111] py-1"
              >
                {link.name}
              </a>
            ))}
          </div>
          <div className="pt-3 border-t border-[#E5E5E5] flex flex-col gap-2">
            <Link
              to="/login"
              className="w-full text-center py-2 rounded-md bg-white border border-[#D9D9D9] text-xs font-medium text-[#111111]"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="w-full text-center py-2 rounded-md bg-[#111111] text-xs font-medium text-white"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
