import { useTranslation } from "react-i18next";
import { Page } from "../types";
import { 
  Sprout, 
  Search, 
  MessageSquare, 
  BarChart3, 
  CloudSun, 
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { motion } from "motion/react";

interface HomeProps {
  onNavigate: (page: Page) => void;
}

export default function HomePage({ onNavigate }: HomeProps) {
  const { t } = useTranslation();
  
  const stats = [
    { name: "Paddy", price: "₹2,340", trend: "up" },
    { name: "Wheat", price: "₹2,510", trend: "up" },
    { name: "Tomato", price: "₹42/kg", trend: "down" },
  ];

  const features = [
    { id: 'scan', icon: <Search size={24} />, label: t('home.disease_scan'), desc: t('scan.upload_desc'), color: "bg-brand-green" },
    { id: 'assistant', icon: <MessageSquare size={24} />, label: t('home.assistant'), desc: t('assistant.call_expert'), color: "bg-brand-leaf" },
    { id: 'analytics', icon: <BarChart3 size={24} />, label: t('home.analytics'), desc: t('analytics.productivity'), color: "bg-brand-dark-green" },
  ];

  return (
    <div className="h-full overflow-y-auto p-8 space-y-8 bg-brand-cream">
      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <h2 className="text-4xl font-black text-brand-dark-green leading-tight">
              {t('home.greeting').split(',')[0]}, <br />
              <span className="text-brand-green">{t('home.greeting').split(',')[1]}</span> 🌾
            </h2>
            <p className="text-brand-earth font-medium">{t('home.tagline')}</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {features.map((f) => (
              <button
                key={f.id}
                onClick={() => onNavigate(f.id as Page)}
                className="flex flex-col items-start p-6 bg-white border-2 border-brand-border rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div className={`${f.color} text-white p-3 rounded-2xl mb-4 group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="font-black text-brand-dark-green uppercase text-xs tracking-widest">{f.label}</h3>
                <p className="text-[10px] text-brand-earth font-bold mt-1 uppercase opacity-60">{f.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar Widgets (Market & Weather) */}
        <aside className="w-full lg:w-80 space-y-6">
          <section className="bg-white p-6 rounded-[2rem] border-2 border-brand-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-earth">{t('home.market_prices')}</h3>
              <TrendingUp size={16} className="text-brand-green" />
            </div>
            <div className="space-y-3">
              {stats.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-brand-ice rounded-xl border border-brand-border">
                  <span className="font-bold text-sm">{item.name}</span>
                  <span className="font-black text-brand-green">{item.price}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-brand-green text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="text-3xl font-black italic">32°C</div>
                <CloudSun className="w-8 h-8 text-brand-sun animate-pulse" />
              </div>
              <div className="text-xs font-bold opacity-80 mt-1 uppercase tracking-wider">Sunny • Mandya, KA</div>
              <div className="mt-4 text-[11px] bg-brand-leaf/40 backdrop-blur-sm p-3 rounded-xl leading-relaxed border border-white/20 font-medium">
                ☀️ {t('home.weather_alert')}
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-brand-sun rounded-full blur-3xl opacity-20"></div>
          </section>
        </aside>
      </section>

      {/* Critical Alerts */}
      <section className="bg-red-50 border-2 border-red-200 p-6 rounded-[2rem] flex items-center gap-4 animate-pulse">
        <div className="bg-red-600 text-white p-3 rounded-2xl shadow-lg">
          <AlertCircle size={24} />
        </div>
        <div>
          <h4 className="font-black text-red-900 text-sm uppercase tracking-tight">{t('home.disease_warning')}</h4>
          <p className="text-xs text-red-700 font-medium">{t('home.disease_warning')} near Mandya. Check your crops!</p>
        </div>
        <button 
          onClick={() => onNavigate('scan')}
          className="ml-auto bg-red-600 text-white px-6 py-2 rounded-xl font-black text-xs uppercase tracking-tight hover:bg-red-700 transition-all"
        >
          {t('home.check_now')}
        </button>
      </section>
    </div>
  );
}
