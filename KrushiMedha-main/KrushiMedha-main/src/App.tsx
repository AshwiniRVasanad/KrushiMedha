/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { 
  Home as HomeIcon,
  Search,
  MessageSquare,
  BarChart3,
  User as UserIcon,
  Sprout,
  Languages
} from "lucide-react";
import { cn } from "./lib/utils";
import { Page } from "../types";
import { useTranslation } from "react-i18next";
import HomePage from "./pages/Home";
import ScanPage from "./pages/Scan";
import AssistantPage from "./pages/Assistant";
import AnalyticsPage from "./pages/Analytics";
import ProfilePage from "./pages/Profile";
import { Logo } from "./components/Logo";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const { t, i18n } = useTranslation();

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'ml', label: 'മലയാളം' },
  ];

  const navItems = [
    { id: 'home', icon: <HomeIcon size={20} />, label: t('nav.home') },
    { id: 'scan', icon: <Search size={20} />, label: t('nav.scan') },
    { id: 'assistant', icon: <MessageSquare size={20} />, label: t('nav.assistant') },
    { id: 'analytics', icon: <BarChart3 size={20} />, label: t('nav.analytics') },
    { id: 'profile', icon: <UserIcon size={20} />, label: t('nav.profile') },
  ] as const;

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage onNavigate={setCurrentPage} />;
      case 'scan': return <ScanPage />;
      case 'assistant': return <AssistantPage />;
      case 'analytics': return <AnalyticsPage />;
      case 'profile': return <ProfilePage />;
      default: return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-6xl mx-auto bg-brand-cream font-sans overflow-hidden text-[#2d3a3a] shadow-2xl border-x border-brand-border">
      {/* Header */}
      <nav className="h-20 bg-white border-b-4 border-brand-border flex items-center justify-between px-8 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg ring-2 ring-brand-ice cursor-pointer overflow-hidden p-1.5" onClick={() => setCurrentPage('home')}>
            <Logo className="w-full h-full" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-brand-dark-green leading-none">KrsiMedha</h1>
            <p className="text-xs text-brand-earth font-bold uppercase tracking-widest mt-1">{t('common.ai_friend')}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex bg-brand-ice rounded-xl p-1 border border-brand-border">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id as Page)}
                className={cn(
                  "px-4 py-2 rounded-lg font-bold text-sm transition-all",
                  currentPage === item.id 
                    ? "bg-white shadow-sm text-brand-green border border-brand-border ring-1 ring-black/5" 
                    : "text-brand-earth hover:text-brand-green"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="relative group">
            <button className="flex items-center gap-2 bg-white border-2 border-brand-border px-3 py-2 rounded-xl text-brand-dark-green font-bold text-sm hover:border-brand-sun transition-all shadow-sm">
              <Languages size={18} className="text-brand-green" />
              <span className="hidden md:inline">{languages.find(l => l.code === i18n.language)?.label || 'Language'}</span>
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border-2 border-brand-border rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className={cn(
                    "w-full px-4 py-3 text-left font-bold text-sm hover:bg-brand-ice transition-all border-b border-brand-border last:border-0",
                    i18n.language === lang.code ? "text-brand-green bg-brand-ice/50" : "text-brand-earth"
                  )}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <div className="w-12 h-12 bg-brand-ice rounded-full border-2 border-brand-border flex items-center justify-center text-brand-green hover:bg-brand-sun hover:text-brand-dark-green transition-all shadow-sm cursor-pointer" onClick={() => setCurrentPage('profile')}>
            <UserIcon size={20} />
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {renderPage()}
      </main>

      {/* Mobile Navigation */}
      <div className="lg:hidden h-16 bg-white border-t-2 border-brand-border flex items-center justify-around px-2 shrink-0 z-20">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id as Page)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 min-w-[64px]",
              currentPage === item.id ? "text-brand-green" : "text-brand-earth"
            )}
          >
            {item.icon}
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
