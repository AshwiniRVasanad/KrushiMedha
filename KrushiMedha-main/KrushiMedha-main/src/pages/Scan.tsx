import { useState, useRef, useEffect } from "react";
import { 
  Camera, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  X, 
  Share2, 
  History,
  Leaf,
  Info,
  Mail,
  MessageCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { diagnoseDisease } from "../services/geminiService";
import { DiseaseResult, ScanHistoryItem } from "../types";
import { cn, logActivity, logNotification } from "../lib/utils";

const languageMap: Record<string, string> = {
  en: 'English',
  kn: 'Kannada',
  hi: 'Hindi',
  te: 'Telugu',
  ta: 'Tamil',
  ml: 'Malayalam'
};

export default function ScanPage() {
  const { t, i18n } = useTranslation();
  const currentLanguageName = languageMap[i18n.language] || 'English';
  
  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('krsi_scan_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveToHistory = (scan: DiseaseResult) => {
    const newItem: ScanHistoryItem = {
      ...scan,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
    };
    const updatedHistory = [newItem, ...history].slice(0, 10); // Keep last 10
    setHistory(updatedHistory);
    localStorage.setItem('krsi_scan_history', JSON.stringify(updatedHistory));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startScan = async () => {
    if (!image) return;
    setIsScanning(true);
    setResult(null);
    try {
      const data = await diagnoseDisease(image, currentLanguageName);
      const resultWithImage = { ...data, image };
      setResult(resultWithImage);
      saveToHistory(resultWithImage);

      logActivity({
        type: 'scan_completed',
        title: 'Crop Diagnosis Complete',
        description: `Analyzed photo: ${data.disease} detected`,
        metadata: { disease: data.disease, severity: data.severity }
      });

      logNotification({
        type: 'disease_alert',
        title: 'Disease Detected!',
        message: `Alert: ${data.disease} confirmed in your scan. Severity: ${data.severity}. Please check the Expert Treatment solution in your scan history.`
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsScanning(false);
    }
  };

  const shareViaSMS = () => {
    if (!result) return;
    const message = `KrsiMedha Crop Report:\nDisease: ${result.disease}\nSeverity: ${result.severity}\nSolution: ${result.solution}`;
    window.location.href = `sms:?body=${encodeURIComponent(message)}`;
  };

  const shareViaWhatsApp = () => {
    if (!result) return;
    const text = `*KrsiMedha Crop Disease Report*\n\n*Disease:* ${result.disease}\n*Severity:* ${result.severity}\n*Reason:* ${result.reason}\n\n*Solution:* ${result.solution.replace(/\n/g, ' ')}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareViaEmail = () => {
    if (!result) return;
    const subject = `Crop Diagnosis: ${result.disease}`;
    const body = `KrsiMedha Crop Report\n\nDisease: ${result.disease}\nSeverity: ${result.severity}\nReason: ${result.reason}\n\nSolution:\n${result.solution}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div id="scan-page-root" className="h-full overflow-y-auto p-4 md:p-8 space-y-8 bg-brand-cream">
      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
        
        {/* Upload Container */}
        <div className="flex-1 space-y-6">
          <div id="upload-card" className="bg-white p-6 md:p-10 rounded-[3rem] border-4 border-dashed border-brand-border flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden group shadow-inner">
            <AnimatePresence mode="wait">
              {!image ? (
                <motion.div 
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-6 text-center"
                >
                  <div className="w-32 h-32 bg-brand-ice rounded-[2.5rem] flex items-center justify-center text-brand-green group-hover:scale-110 transition-transform shadow-lg border-2 border-brand-border">
                    <Camera size={64} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-brand-dark-green">{t('scan.diagnose')}</h3>
                    <p className="text-brand-earth text-sm font-medium max-w-xs mx-auto">{t('scan.upload_desc')}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                    <button 
                      id="open-camera-btn"
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex-1 bg-brand-green text-white px-8 py-5 rounded-2xl font-black shadow-xl hover:bg-brand-dark-green transition-all transform hover:-translate-y-1 active:scale-95 uppercase tracking-wide flex items-center justify-center gap-2"
                    >
                      <Camera size={20} />
                      {t('scan.take_photo')}
                    </button>
                    <button 
                      id="select-photo-btn"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 bg-white border-2 border-brand-green text-brand-green px-8 py-5 rounded-2xl font-black shadow-lg hover:bg-brand-ice transition-all transform hover:-translate-y-1 active:scale-95 uppercase tracking-wide"
                    >
                      {t('scan.gallery')}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="preview"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative w-full h-full max-h-[500px] flex items-center justify-center"
                >
                  <img src={image} className="max-w-full max-h-[450px] object-contain rounded-2xl shadow-2xl border-4 border-white" />
                  <button 
                    id="clear-photo-btn"
                    onClick={() => { setImage(null); setResult(null); }}
                    className="absolute top-0 right-0 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-all border-2 border-white"
                  >
                    <X size={24} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            <input type="file" ref={cameraInputRef} onChange={handleImageUpload} accept="image/*" capture="environment" className="hidden" />
          </div>

          {image && !result && (
            <button 
              id="analyze-scan-btn"
              onClick={startScan}
              disabled={isScanning}
              className="w-full bg-brand-green text-white py-6 rounded-[2.5rem] font-black text-xl shadow-2xl flex items-center justify-center gap-4 hover:bg-brand-dark-green transition-all disabled:opacity-50 border-b-4 border-brand-dark-green transform active:translate-y-1"
            >
              {isScanning ? (
                <>
                  <RefreshCw size={28} className="animate-spin" />
                  {t('common.analyzing').toUpperCase()}
                </>
              ) : (
                <>
                  <Search size={28} />
                  {t('scan.start_analysis')}
                </>
              )}
            </button>
          )}
        </div>

        {/* Results Container / Sidebar */}
        <div className="lg:w-[450px] space-y-6">
          <AnimatePresence mode="wait">
            {isScanning && (
              <motion.div 
                key="loading-results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-brand-ice p-8 rounded-[3rem] border-2 border-brand-border space-y-8"
              >
                <div className="flex justify-center gap-3">
                  <div className="w-3 h-3 bg-brand-green rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-3 h-3 bg-brand-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-3 h-3 bg-brand-green rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-brand-dark-green font-black uppercase text-xs tracking-widest">Scanning chlorophyll levels...</p>
                  <p className="text-brand-earth text-[10px] font-bold">Model: KrsiMedha Vision Pro</p>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-4 bg-white/50 rounded-full w-full animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </motion.div>
            )}

            {result ? (
              <motion.div 
                key="analysis-results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 rounded-[3rem] border-2 border-brand-border shadow-2xl space-y-6 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-inner",
                    result.severity === 'Critical' ? "bg-red-100 text-red-600 border-red-200" :
                    result.severity === 'High' ? "bg-orange-100 text-orange-600 border-orange-200" :
                    "bg-green-100 text-green-600 border-green-200"
                  )}>
                    {result.severity} Issue
                  </div>
                  <div className="flex items-center gap-1.5 text-brand-green font-black text-sm">
                    <ShieldCheck size={18} />
                    {result.confidence}% Match
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-brand-dark-green leading-tight">{result.disease}</h3>
                  <div className="flex items-center gap-2 text-brand-earth text-[10px] font-black uppercase tracking-widest opacity-60">
                    <Info size={12} />
                    Verified AI Analysis
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="bg-brand-ice p-5 rounded-3xl border border-brand-border shadow-inner">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-earth mb-2 flex items-center gap-2">
                       <CheckCircle2 size={14} className="text-brand-green" />
                       Visible Symptoms (Reason)
                    </h4>
                    <p className="text-xs text-brand-dark-green font-bold leading-relaxed">{result.reason}</p>
                  </div>

                  <div className="bg-brand-green/5 p-6 rounded-3xl border-2 border-brand-green shadow-sm">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-green mb-3 font-black">Expert Treatment Solution</h4>
                    <div className="space-y-3">
                      {result.solution.split('\n').map((step, idx) => (
                        <div key={idx} className="flex gap-3">
                          <span className="w-5 h-5 rounded-full bg-brand-green text-white text-[10px] flex items-center justify-center shrink-0 font-black">{idx + 1}</span>
                          <p className="text-sm text-brand-dark-green font-medium">{step.replace(/step \d+: /i, '')}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-orange-50 p-6 rounded-3xl border-2 border-orange-200">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-700 mb-2 flex items-center gap-2">
                      <Leaf size={16} />
                      Organic Alternative
                    </h4>
                    <p className="text-sm text-orange-950 font-bold italic leading-relaxed">"{result.organicAlternative}"</p>
                  </div>
                </div>

                <div id="share-options" className="space-y-3 pt-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-earth opacity-60 ml-2">Share Report Via</p>
                  <div className="flex gap-3">
                    <button 
                      id="share-whatsapp-btn"
                      onClick={shareViaWhatsApp}
                      className="flex-1 bg-[#25D366] text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md"
                    >
                      <MessageCircle size={16} />
                      WhatsApp
                    </button>
                    <button 
                      id="share-email-btn"
                      onClick={shareViaEmail}
                      className="flex-1 bg-[#EA4335] text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md"
                    >
                      <Mail size={16} />
                      Gmail
                    </button>
                    <button 
                      id="share-sms-btn"
                      onClick={shareViaSMS}
                      className="flex-1 bg-white border-2 border-brand-border text-brand-earth py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-ice transition-all shadow-md"
                    >
                      <Share2 size={16} />
                      SMS
                    </button>
                  </div>
                </div>

                <div className="flex pt-2">
                  <button 
                    id="new-scan-btn"
                    onClick={() => { setImage(null); setResult(null); }}
                    className="w-full bg-brand-green text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-brand-dark-green transition-all"
                  >
                    Start New Scan
                  </button>
                </div>
              </motion.div>
            ) : !isScanning && (
              <motion.div 
                key="scan-history"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/60 p-8 rounded-[3rem] border-2 border-dashed border-brand-border space-y-6"
              >
                <div className="flex items-center gap-2 text-brand-earth border-b-2 border-brand-border pb-4">
                  <History size={20} />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em]">Recent Scans</h3>
                </div>
                
                {history.length > 0 ? (
                  <div className="space-y-3">
                    {history.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-brand-border shadow-sm hover:translate-x-1 transition-transform cursor-pointer group">
                        <div className="w-12 h-12 bg-brand-ice rounded-xl overflow-hidden border border-brand-border shrink-0">
                          {item.image && <img src={item.image} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-brand-dark-green text-sm truncate">{item.disease}</p>
                          <p className="text-[9px] text-brand-earth font-bold uppercase opacity-60">{item.timestamp}</p>
                        </div>
                        <CheckCircle2 size={16} className="text-brand-green opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 space-y-2 opacity-30">
                    <Info size={32} className="mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No previous scans found</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
