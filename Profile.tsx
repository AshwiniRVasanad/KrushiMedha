import { useState, useEffect } from "react";
import { 
  MapPin, 
  Phone, 
  User, 
  Sprout, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  Edit2, 
  BarChart3, 
  Languages,
  Activity,
  Download,
  MessageSquare,
  PhoneCall,
  Zap,
  History
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { cn, logNotification } from "../lib/utils";
import { AppActivity, AppNotification } from "../types";

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const [activities, setActivities] = useState<AppActivity[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isSmsEnabled, setIsSmsEnabled] = useState(() => {
    return localStorage.getItem('krsi_sms_enabled') === 'true';
  });
  const [showNotifications, setShowNotifications] = useState(false);

  const loadActivities = () => {
    const saved = localStorage.getItem('krsi_activities');
    if (saved) {
      setActivities(JSON.parse(saved));
    }
  };

  const loadNotifications = () => {
    const saved = localStorage.getItem('krsi_notifications');
    if (saved) {
      const data = JSON.parse(saved);
      setNotifications(data);
    } else {
      // Sample initial alerts if empty
      const initial: AppNotification[] = [
        {
          id: 'w1',
          type: 'weather',
          title: 'Heat Wave Warning',
          message: 'Temperature expected to rise to 42°C in Mandya. Increase irrigation for Paddy by 20%.',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: true
        },
        {
          id: 'm1',
          type: 'market',
          title: 'Market Price Alert',
          message: 'Paddy prices in your local Mandya APMC increased by ₹120/quintal. Current: ₹2,460.',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          read: true
        }
      ];
      setNotifications(initial);
      localStorage.setItem('krsi_notifications', JSON.stringify(initial));
    }
  };

  useEffect(() => {
    loadActivities();
    loadNotifications();
    
    // Listen for activity logged events
    window.addEventListener('krsi_activity_logged', loadActivities);
    window.addEventListener('krsi_notifications_updated', loadNotifications);
    return () => {
      window.removeEventListener('krsi_activity_logged', loadActivities);
      window.removeEventListener('krsi_notifications_updated', loadNotifications);
    };
  }, []);

  const toggleSms = () => {
    const newState = !isSmsEnabled;
    setIsSmsEnabled(newState);
    localStorage.setItem('krsi_sms_enabled', String(newState));
    
    if (newState) {
      logNotification({
        type: 'crop_update',
        title: 'SMS System Activated',
        message: 'You will now receive automatic alerts for weather, market prices, and crop health.'
      });
    }
  };

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'ml', label: 'മലയാളം' },
  ];
  
  const farmDetails = [
    { label: t('profile.total_area'), value: "4.5 Acres" },
    { label: t('profile.primary_crop'), value: "Paddy (KRS-21)" },
    { label: t('profile.soil_type'), value: "Red Loamy" },
    { label: t('profile.water_source'), value: "Borewell + Canal" },
  ];

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('krsi_notifications', JSON.stringify(updated));
  };

  const clearNotifs = () => {
    setNotifications([]);
    localStorage.setItem('krsi_notifications', JSON.stringify([]));
  };

  return (
    <div className="h-full overflow-y-auto p-8 bg-brand-cream relative">
      <AnimatePresence>
        {showNotifications && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            className="absolute top-24 left-8 right-8 md:left-auto md:right-32 md:w-96 bg-white rounded-[2.5rem] shadow-2xl border-2 border-brand-border z-50 p-6 max-h-[70vh] flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-brand-dark-green uppercase tracking-tight">{t('profile.notif_center')}</h3>
              <div className="flex gap-2">
                <button 
                  onClick={markAllRead}
                  className="text-[10px] font-bold text-brand-green uppercase hover:underline"
                >
                  {t('common.mark_read')}
                </button>
                <button 
                  onClick={clearNotifs}
                  className="text-[10px] font-bold text-red-500 uppercase hover:underline"
                >
                  {t('common.clear')}
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div key={n.id} className={cn(
                    "p-4 rounded-2xl border-2 transition-all group",
                    n.read ? "bg-white border-brand-ice" : "bg-brand-sun/10 border-brand-sun"
                  )}>
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          n.type === 'weather' ? "bg-amber-500" :
                          n.type === 'disease_alert' ? "bg-red-500" :
                          n.type === 'market' ? "bg-brand-green" : "bg-blue-500"
                        )}></div>
                        <h4 className="text-sm font-black text-brand-dark-green leading-tight">{n.title}</h4>
                      </div>
                      <span className="text-[10px] font-bold text-brand-earth opacity-40">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-brand-earth font-medium leading-relaxed opacity-80">
                      {n.message}
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-brand-ice rounded-full flex items-center justify-center mx-auto opacity-40 mb-4">
                    <Activity size={32} />
                  </div>
                  <p className="text-sm font-bold text-brand-earth opacity-40 uppercase tracking-widest">{t('profile.no_activity')}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* User Card */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white p-8 rounded-[3rem] border-2 border-brand-border shadow-sm flex flex-col items-center">
            <div className="w-32 h-32 bg-brand-ice rounded-[2.5rem] border-4 border-brand-green flex items-center justify-center text-brand-green shadow-xl relative group overflow-hidden">
               <User size={64} strokeWidth={1} />
               <button className="absolute inset-0 bg-brand-dark-green/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                 <Edit2 size={24} />
               </button>
               
               {/* Notification Bell */}
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="absolute top-2 right-2 w-8 h-8 bg-brand-sun rounded-xl flex items-center justify-center text-brand-dark-green shadow-md hover:scale-110 transition-all z-20"
                >
                  <Activity size={16} />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                  )}
                </button>
            </div>
            <h2 className="text-2xl font-black text-brand-dark-green mt-6">Rajesh Kumar</h2>
            <p className="text-brand-earth font-bold text-xs uppercase tracking-widest mt-1">Premium Farmer ID: #8821</p>
            
            <div className="w-full mt-8 space-y-4 pt-8 border-t border-brand-ice">
              <div className="flex items-center gap-3 text-brand-earth">
                <MapPin size={18} className="text-brand-green" />
                <span className="text-sm font-bold">Mandya, Karnataka</span>
              </div>
              <div className="flex items-center gap-3 text-brand-earth">
                <Phone size={18} className="text-brand-green" />
                <span className="text-sm font-bold">+91 98XXX-XX901</span>
              </div>
              <div className="flex items-center gap-3 text-brand-earth">
                <ShieldCheck size={18} className="text-brand-green" />
                <span className="text-sm font-bold">{t('profile.verified_account')}</span>
              </div>
            </div>
          </section>

          <button className="w-full flex items-center justify-center gap-2 py-4 bg-brand-ice text-brand-earth rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-brand-border hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all">
            <LogOut size={16} />
            {t('profile.logout')}
          </button>
        </div>

        {/* Farm & Settings */}
        <div className="lg:col-span-2 space-y-8">
          {/* SMS Alert Toggle System */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-brand-dark-green text-white p-8 rounded-[3rem] shadow-xl relative overflow-hidden"
          >
            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <PhoneCall size={20} className="text-brand-sun" />
                  </div>
                  <h3 className="font-black italic text-xl uppercase tracking-tight">{t('profile.sms_alerts')}</h3>
                </div>
                <button 
                  onClick={toggleSms}
                  className={cn(
                    "w-14 h-8 rounded-full transition-all relative flex items-center px-1 shadow-inner",
                    isSmsEnabled ? "bg-brand-sun" : "bg-white/20"
                  )}
                >
                  <div 
                    className={cn(
                      "w-6 h-6 rounded-full shadow-md transform transition-transform duration-300",
                      isSmsEnabled ? "translate-x-6 bg-brand-dark-green" : "translate-x-0 bg-white"
                    )}
                  />
                </button>
              </div>
              <p className="text-sm font-medium opacity-80 leading-relaxed max-w-sm">
                {t('profile.sms_desc')}
              </p>
            </div>
            <Zap size={140} className="absolute -right-8 -bottom-8 text-white/5 rotate-12" />
          </motion.section>

          <section className="bg-white p-8 rounded-[3rem] border-2 border-brand-border shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-earth">{t('profile.portfolio')}</h3>
              <Sprout size={20} className="text-brand-green" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {farmDetails.map((detail, i) => (
                <div key={i} className="bg-brand-ice p-6 rounded-3xl border border-brand-border">
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-earth opacity-60 mb-1">{detail.label}</p>
                  <p className="text-lg font-black text-brand-dark-green leading-none">{detail.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-brand-green text-white rounded-[2rem] shadow-lg relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <h4 className="font-black italic text-xl">KrsiMedha Premium</h4>
                <p className="text-xs font-medium opacity-80 leading-relaxed">Your subscription is active until Dec 2026. <br /> You have priority access to experts.</p>
                <div className="pt-2">
                  <button className="bg-white text-brand-green px-6 py-2 rounded-xl text-[10px] font-black uppercase shadow-md">{t('profile.manage_plan')}</button>
                </div>
              </div>
              <BarChart3 size={80} className="absolute -right-4 -bottom-4 text-white/10 rotate-12" />
            </div>
          </section>

          <section className="bg-white p-8 rounded-[3rem] border-2 border-brand-border shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-earth">{t('profile.system_settings')}</h3>
              <Settings size={20} className="text-brand-earth" />
            </div>
            
            <div className="space-y-8">
              {/* Language Preference Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-earth opacity-60">
                  <Languages size={14} className="text-brand-green" />
                  {t('common.language')}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => i18n.changeLanguage(lang.code)}
                      className={cn(
                        "px-4 py-3 rounded-2xl font-black text-[11px] uppercase tracking-wider transition-all border-2 flex items-center justify-center text-center",
                        i18n.language === lang.code 
                          ? "bg-brand-sun border-brand-sun text-brand-dark-green shadow-lg scale-[1.02]" 
                          : "bg-brand-ice border-transparent text-brand-earth hover:border-brand-border active:scale-95"
                      )}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Other settings */}
              <div className="space-y-4 pt-4 border-t border-brand-ice">
                {[
                  { key: 'notifications', label: t('profile.notifications') },
                  { key: 'privacy', label: t('profile.privacy') },
                  { key: 'version', label: t('profile.version') }
                ].map((setting) => (
                  <div key={setting.key} className="flex justify-between items-center text-sm font-bold text-brand-earth border-b border-brand-ice pb-4 cursor-pointer hover:text-brand-green group hover:translate-x-1 transition-all last:border-0 last:pb-0">
                    <span>{setting.label}</span>
                    <div className="w-8 h-8 bg-brand-ice rounded-xl flex items-center justify-center group-hover:bg-brand-sun group-hover:text-brand-dark-green transition-all">→</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-[3rem] border-2 border-brand-border shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-earth">{t('profile.activity_log')}</h3>
              <Activity size={20} className="text-brand-green" />
            </div>

            <div className="space-y-6">
              {activities.length > 0 ? (
                activities.slice(0, 10).map((activity) => (
                  <div key={activity.id} className="flex gap-4 group">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-all group-hover:scale-110",
                      activity.type === 'report_download' ? "bg-blue-50 text-blue-600" :
                      activity.type === 'chat_sent' ? "bg-brand-ice text-brand-green" :
                      activity.type === 'call_expert' ? "bg-amber-50 text-amber-600" :
                      "bg-brand-sun/20 text-brand-dark-green"
                    )}>
                      {activity.type === 'report_download' && <Download size={18} />}
                      {activity.type === 'chat_sent' && <MessageSquare size={18} />}
                      {activity.type === 'call_expert' && <PhoneCall size={18} />}
                      {activity.type === 'scan_completed' && <Zap size={18} />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-black text-brand-dark-green leading-tight">{activity.title}</h4>
                        <span className="text-[10px] font-bold text-brand-earth opacity-40">
                          {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-brand-earth font-medium leading-tight opacity-70">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-brand-ice rounded-full flex items-center justify-center mx-auto opacity-40">
                    <History size={32} />
                  </div>
                  <p className="text-sm font-bold text-brand-earth opacity-40 uppercase tracking-widest">{t('profile.no_activity')}</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
