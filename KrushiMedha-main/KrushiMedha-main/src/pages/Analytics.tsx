import { useState, useRef, useEffect } from "react";
import { 
  BarChart3, 
  Sprout, 
  Calendar, 
  Camera, 
  CheckCircle2, 
  CircleDashed,
  ExternalLink,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  History,
  ShoppingCart,
  Share2,
  ArrowRight,
  Sparkles,
  FileText,
  RefreshCw,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn, logActivity, logNotification } from "../lib/utils";
import { Trash2, Trash } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getFertilizerRecommendation, analyzeGrowthProgression, analyzeGrowthStage } from "../services/geminiService";
import { ProductivityStep, Recommendation, ProgressionReport } from "../types";
// @ts-ignore - html2pdf doesn't have standard types
import html2pdf from 'html2pdf.js';

const languageMap: Record<string, string> = {
  en: 'English',
  kn: 'Kannada',
  hi: 'Hindi',
  te: 'Telugu',
  ta: 'Tamil',
  ml: 'Malayalam'
};

const CROP_TIMELINES: Record<string, { label: string; description: string }[]> = {
  Paddy: [
    { label: "Phase 1: Sowing", description: "Freshly sown seedlings in puddled soil" },
    { label: "Phase 2: Germination", description: "Young green shoots emerging" },
    { label: "Phase 3: Tillering", description: "Dense cluster of shoots forming" },
    { label: "Phase 4: Panicle Initiation", description: "Internal development of flowers" },
    { label: "Phase 5: Heading", description: "Flower heads emerging from sheath" },
    { label: "Phase 6: Maturity", description: "Golden grains ready for harvest" },
  ],
  Wheat: [
    { label: "Phase 1: Sowing", description: "Early sprouting after sowing" },
    { label: "Phase 2: Crown Root", description: "Secondary root system developing" },
    { label: "Phase 3: Tillering", description: "Multiple stems branching out" },
    { label: "Phase 4: Jointing", description: "Stem elongation and node formation" },
    { label: "Phase 5: Flowering", description: "Pollination and grain filling" },
    { label: "Phase 6: Harvest", description: "Dry, golden stalks ready" },
  ],
  Tomato: [
    { label: "Phase 1: Seedling", description: "Young plants after transplanting" },
    { label: "Phase 2: Vegetative", description: "Fast leaf and stem growth" },
    { label: "Phase 3: Flowering", description: "Yellow blossoms appearing" },
    { label: "Phase 4: Fruit Set", description: "Small green tomatoes forming" },
    { label: "Phase 5: Ripening", description: "Fruits turning red and juicy" },
    { label: "Phase 6: Final Harvest", description: "Full crop of ripe tomatoes" },
  ],
  Maize: [
    { label: "Phase 1: Sowing", description: "Seed placement in prepared furrows" },
    { label: "Phase 2: Germination", description: "Sprouts emerging with two leaves" },
    { label: "Phase 3: Vegetative", description: "Rapid stalk and leaf development" },
    { label: "Phase 4: Tasseling", description: "Pollen-bearing flowers forming at top" },
    { label: "Phase 5: Silking", description: "Ears forming with silks ready for pollination" },
    { label: "Phase 6: Maturity", description: "Dry husks and hard kernels ready" },
  ]
};

export default function AnalyticsPage() {
  const { t, i18n } = useTranslation();
  const currentLanguageName = languageMap[i18n.language] || 'English';
  
  const [activeTab, setActiveTab] = useState<'productivity' | 'fertilizer'>('productivity');
  const [selectedCrop, setSelectedCrop] = useState("Paddy");
  const [steps, setSteps] = useState<ProductivityStep[]>([]);
  const [progressionReport, setProgressionReport] = useState<ProgressionReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showFullReport, setShowFullReport] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (showFullReport) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showFullReport]);

  const [farmerDetails, setFarmerDetails] = useState({
    name: "Ramesh Kumar",
    village: "Malleshwaram",
    district: "Mandya",
    state: "Karnataka",
    variety: "IR-64",
    farmSize: "5 acres",
    soilType: "Clay Loam"
  });

  const [fertCrop, setFertCrop] = useState("Paddy");
  const [fertImage, setFertImage] = useState<string | null>(null);
  const [isAnalyzingFert, setIsAnalyzingFert] = useState(false);
  const [fertRec, setFertRec] = useState<Recommendation | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeStepIdRef = useRef<number | null>(null);

  // Initialize or Reset steps when crop changes
  useEffect(() => {
    const saved = localStorage.getItem(`krsi_steps_${selectedCrop}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration: Ensure labels use "Phase" instead of "Month"
      const migrated = parsed.map((s: any) => ({
        ...s,
        label: s.label.replace(/Month\s?(\d+)/i, 'Phase $1')
      }));
      setSteps(migrated);
    } else {
      const initialSteps: ProductivityStep[] = CROP_TIMELINES[selectedCrop].map((t, i) => ({
        id: i + 1,
        label: t.label,
        description: t.description,
        status: 'pending'
      }));
      setSteps(initialSteps);
    }
    setProgressionReport(null);
  }, [selectedCrop]);

  useEffect(() => {
    if (steps.length > 0) {
      localStorage.setItem(`krsi_steps_${selectedCrop}`, JSON.stringify(steps));
    }
  }, [steps, selectedCrop]);

  const handleStepUploadClick = (id: number) => {
    activeStepIdRef.current = id;
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeStepIdRef.current !== null) {
      const stepId = activeStepIdRef.current;
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        // Show local immediately
        setSteps(prev => prev.map(s => 
          s.id === stepId 
            ? { ...s, status: 'completed', image: base64, date: new Date().toLocaleDateString(), detectionText: "AI is analyzing growth..." } 
            : s
        ));

        // Get AI analysis
        const currentStep = steps.find(s => s.id === stepId);
        if (currentStep) {
          const detection = await analyzeGrowthStage(base64, selectedCrop, currentStep.label, currentLanguageName);
          setSteps(prev => prev.map(s => 
            s.id === stepId ? { ...s, detectionText: detection } : s
          ));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteStepImage = (id: number) => {
    if (window.confirm("Delete this photo? This will reset the step.")) {
      setSteps(prev => prev.map(s => 
        s.id === id 
          ? { ...s, status: 'pending', image: undefined, date: undefined, detectionText: undefined } 
          : s
      ));
      setProgressionReport(null);
    }
  };

  const generateReport = async () => {
    const images = steps.map(s => s.image).filter((img): img is string => !!img);
    if (images.length < 6) return;
    
    setIsGeneratingReport(true);
    try {
      const report = await analyzeGrowthProgression(images, selectedCrop, currentLanguageName);
      setProgressionReport(report);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleFertAnalysis = async () => {
    if (!fertImage) return;
    setIsAnalyzingFert(true);
    try {
      const result = await getFertilizerRecommendation(fertImage, fertCrop, currentLanguageName);
      setFertRec(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzingFert(false);
    }
  };

  const [isEditingDetails, setIsEditingDetails] = useState(false);

  const handleWhatsAppShare = () => {
    if (!progressionReport) return;
    const text = `*Krismedha AI - Crop Growth Analytics Report*\n\n` +
      `🌾 *Crop:* ${selectedCrop}\n` +
      `👨‍🌾 *Farmer:* ${farmerDetails.name}\n` +
      `📊 *Growth Rate:* ${progressionReport.growthRate}\n` +
      `✅ *Yield Prediction:* ${progressionReport.yieldPrediction}\n` +
      `📅 *Expected Harvest:* ${progressionReport.expectedHarvestDate}\n\n` +
      `Generated by Krismedha AI`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('printable-report');
    if (!element) {
      setShowFullReport(true);
      return;
    }

    setIsExporting(true);
    document.body.classList.add('is-exporting');
    
    // Configure PDF options
    const opt = {
      margin: 0,
      filename: `Krismedha_Report_${selectedCrop}_${new Date().toLocaleDateString()}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        scrollX: 0,
        scrollY: 0,
        logging: false,
        onclone: (clonedDoc: Document) => {
          // Manual sweep of the cloned document to remove oklab references
          const elements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < elements.length; i++) {
            const el = elements[i] as HTMLElement;
            const style = window.getComputedStyle(el);
            // If color or background-color uses oklch/oklab, force it to HEX
            if (style.color.includes('okl') || style.backgroundColor.includes('okl')) {
              el.style.color = '#1b4332';
              if (el.classList.contains('bg-brand-sun')) {
                el.style.backgroundColor = '#fbbf24';
              }
            }
          }
        }
      },
      jsPDF: { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const }
    };

    try {
      await html2pdf().from(element).set(opt).save();
      
      logActivity({
        type: 'report_download',
        title: 'Report Downloaded',
        description: `Downloaded ${selectedCrop} growth report as PDF`,
        metadata: { crop: selectedCrop }
      });

      logNotification({
        type: 'crop_update',
        title: 'Report Generated',
        message: `Success: The ${selectedCrop} growth and fertilizer recommendations report has been saved to your device.`
      });
    } catch (error) {
      console.error("PDF generation failed:", error);
      window.print();
    } finally {
      setIsExporting(false);
      document.body.classList.remove('is-exporting');
    }
  };

  const triggerPrintRequest = () => {
    window.print();
  };

  const allStepsCompleted = steps.every(s => s.status === 'completed');

  return (
    <div className="h-full flex flex-col bg-brand-cream overflow-hidden">
      {/* Sub-Header Tabs */}
      <div className="p-4 md:p-6 border-b border-brand-border flex flex-wrap gap-4 bg-white shrink-0">
        <button 
          onClick={() => setActiveTab('productivity')}
          className={cn(
            "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border-2",
            activeTab === 'productivity' ? "bg-brand-green text-white border-brand-green shadow-lg" : "text-brand-earth border-transparent hover:bg-brand-ice"
          )}
        >
          <BarChart3 size={16} />
          {t('analytics.productivity')}
        </button>
        <button 
          onClick={() => setActiveTab('fertilizer')}
          className={cn(
            "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border-2",
            activeTab === 'fertilizer' ? "bg-brand-green text-white border-brand-green shadow-lg" : "text-brand-earth border-transparent hover:bg-brand-ice"
          )}
        >
          <Sprout size={16} />
          {t('analytics.fertilizer')}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin">
        {activeTab === 'productivity' ? (
          <div className="max-w-5xl mx-auto space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left space-y-1">
                <h2 className="text-3xl font-black text-brand-dark-green">Crop Progression</h2>
                <p className="text-brand-earth font-bold text-sm">Visualize your farming journey step-by-step</p>
              </div>
              
              <div className="flex bg-brand-ice p-1 rounded-2xl border-2 border-brand-border">
                {Object.keys(CROP_TIMELINES).map(c => (
                  <button 
                    key={c}
                    onClick={() => setSelectedCrop(c)}
                    className={cn(
                      "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      selectedCrop === c ? "bg-white text-brand-green shadow-sm" : "text-brand-earth hover:text-brand-green"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-8">
                <div className="relative">
                  <div className="absolute left-8 top-0 bottom-0 w-1 bg-brand-border hidden md:block opacity-50" />
                  
                  <div className="space-y-8 relative">
                    {steps.map((step, i) => (
                      <motion.div 
                        key={step.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col md:flex-row gap-6"
                      >
                        <div className={cn(
                          "w-16 h-16 rounded-[1.5rem] shrink-0 flex items-center justify-center border-4 shadow-xl z-10 transition-all",
                          step.status === 'completed' ? "bg-brand-green border-white text-white scale-110" : "bg-white border-brand-border text-brand-earth"
                        )}>
                          <span className="font-black text-xl">{step.id}</span>
                        </div>
                        
                        <div className={cn(
                          "flex-1 bg-white p-6 rounded-[2.5rem] border-2 shadow-sm relative group transition-all",
                          step.status === 'completed' ? "border-brand-green bg-brand-ice/20 outline outline-4 outline-brand-green/5" : "border-brand-border"
                        )}>
                          <div className="flex justify-between items-start gap-4">
                            <div className="min-w-0">
                              <h4 className="font-black text-brand-dark-green uppercase text-[10px] tracking-[0.2em]">{step.label}</h4>
                              <p className="text-sm text-brand-earth font-bold mt-1">{step.description}</p>
                              {step.date && <p className="text-[9px] text-brand-green font-black mt-3 flex items-center gap-1"><CheckCircle2 size={12}/> SNAPSHOT SAVED: {step.date}</p>}
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleStepUploadClick(step.id)}
                                className={cn(
                                  "shrink-0 p-4 rounded-2xl transition-all shadow-md active:scale-95 border-2",
                                  step.status === 'completed' ? "bg-white border-brand-green text-brand-green" : "bg-brand-green text-white border-brand-leaf hover:bg-brand-dark-green"
                                )}
                              >
                                <Camera size={24} />
                              </button>
                              {step.status === 'completed' && (
                                <button 
                                  onClick={() => deleteStepImage(step.id)}
                                  className="p-4 rounded-2xl bg-white border-2 border-red-200 text-red-500 hover:bg-red-50 transition-all shadow-md active:scale-95"
                                >
                                  <Trash2 size={24} />
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {step.image && (
                            <div className="mt-6 space-y-4">
                              <div className="aspect-video rounded-3xl overflow-hidden border-2 border-white shadow-lg">
                                <img src={step.image} className="w-full h-full object-cover" />
                              </div>
                              <div className="bg-brand-green/5 border-2 border-dashed border-brand-green/20 p-4 rounded-2xl">
                                <h5 className="text-[9px] font-black uppercase text-brand-green tracking-widest mb-1 flex items-center gap-2">
                                  <Sparkles size={12} /> AI Instant Observation
                                </h5>
                                <p className="text-xs text-brand-dark-green font-bold leading-relaxed whitespace-pre-line">
                                  {step.detectionText || "Analyzing symptoms and growth patterns..."}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {/* Generation Control */}
                <div className={cn(
                  "sticky top-8 p-8 rounded-[3rem] border-2 transition-all space-y-6",
                  allStepsCompleted ? "bg-brand-green text-white border-brand-leaf shadow-2xl" : "bg-white/60 border-brand-border border-dashed"
                )}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Sparkles size={24} className={allStepsCompleted ? "text-brand-sun" : "text-brand-earth"} />
                      <h3 className="text-lg font-black uppercase tracking-widest italic">AI Harvest Report</h3>
                    </div>
                    <p className={cn("text-xs font-bold leading-relaxed", allStepsCompleted ? "text-white/80" : "text-brand-earth/60")}>
                      Complete all 6 phases of snapshots to generate a comprehensive growth progression report powered by Gemini AI.
                    </p>
                  </div>

                  {!progressionReport && (
                    <button 
                      onClick={generateReport}
                      disabled={!allStepsCompleted || isGeneratingReport}
                      className={cn(
                        "w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3",
                        allStepsCompleted 
                          ? "bg-brand-sun text-brand-dark-green hover:bg-white active:scale-95" 
                          : "bg-brand-ice text-brand-earth/30 cursor-not-allowed"
                      )}
                    >
                      {isGeneratingReport ? (
                        <>
                          <RefreshCw size={20} className="animate-spin" />
                          Analyzing Seasons...
                        </>
                      ) : (
                        <>
                          <FileText size={20} />
                          Generate Report
                        </>
                      )}
                    </button>
                  )}

                  {progressionReport && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                      <div className="space-y-4 pt-4 border-t border-white/20">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/10 p-3 rounded-xl border border-white/20">
                            <p className="text-[8px] font-black uppercase opacity-60">Growth Rate</p>
                            <p className="text-xs font-black">{progressionReport.growthRate}</p>
                          </div>
                          <div className="bg-white/10 p-3 rounded-xl border border-white/20">
                            <p className="text-[8px] font-black uppercase opacity-60">Health Trend</p>
                            <p className="text-xs font-black">{progressionReport.healthTrend}</p>
                          </div>
                        </div>
                        <div className="bg-brand-dark-green/30 p-4 rounded-xl border border-white/10">
                          <p className="text-[8px] font-black uppercase text-brand-sun mb-1">Yield Prediction</p>
                          <p className="text-lg font-black">{progressionReport.yieldPrediction}</p>
                        </div>
                        <p className="text-[10px] leading-relaxed italic font-medium">"{progressionReport.summary}"</p>
                      </div>

                      <div className="flex flex-col gap-3">
                        <button 
                          onClick={() => setShowFullReport(true)}
                          className="w-full py-4 bg-brand-sun text-brand-dark-green font-black rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:bg-white transition-all uppercase tracking-widest text-xs"
                        >
                          <FileText size={18} />
                          Open Full Summary Report
                        </button>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={handleWhatsAppShare}
                            className="py-3 bg-white/10 hover:bg-white text-white hover:text-brand-dark-green font-black rounded-xl border border-white/20 flex items-center justify-center gap-2 transition-all uppercase tracking-widest text-[9px]"
                          >
                            <Share2 size={14} />
                            WhatsApp
                          </button>
                          <button 
                            onClick={handleDownloadPDF}
                            className="py-3 bg-white/10 hover:bg-white text-white hover:text-brand-dark-green font-black rounded-xl border border-white/20 flex items-center justify-center gap-2 transition-all uppercase tracking-widest text-[9px]"
                          >
                            <FileText size={14} />
                            PDF
                          </button>
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          if (window.confirm("Start a new season? Progress will be cleared.")) {
                            setSteps([]);
                            setProgressionReport(null);
                            localStorage.removeItem(`krsi_steps_${selectedCrop}`);
                          }
                        }}
                        className="w-full py-3 text-[10px] font-black uppercase text-white/40 hover:text-white transition-all underline decoration-brand-sun"
                      >
                        Reset Journey
                      </button>
                    </motion.div>
                  )}
                </div>

                <div className="p-8 bg-white rounded-[3rem] border-2 border-brand-border space-y-4 shadow-sm">
                   <h4 className="text-[10px] font-black uppercase text-brand-earth tracking-widest border-b-2 border-brand-ice pb-2">Season Stats</h4>
                   <div className="space-y-3">
                      <div className="flex justify-between items-center">
                         <span className="text-xs font-bold text-brand-earth">Steps Completed</span>
                         <span className="text-xs font-black text-brand-green">{steps.filter(s => s.status === 'completed').length} / 6</span>
                      </div>
                      <div className="w-full h-2 bg-brand-ice rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand-green transition-all duration-500" 
                          style={{ width: `${(steps.filter(s => s.status === 'completed').length / 6) * 100}%` }}
                        />
                      </div>
                   </div>
                </div>
              </div>
            </div>

            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onFileChange} />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Analysis Inputs */}
              <div className="space-y-6">
                <section className="bg-white p-8 rounded-[3rem] border-2 border-brand-border shadow-sm space-y-6">
                  <h3 className="text-xl font-black text-brand-dark-green uppercase text-xs tracking-widest border-b-2 border-brand-ice pb-4">Crop Analysis</h3>
                  
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-brand-earth">Select Current Crop</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Paddy', 'Wheat', 'Tomato', 'Maize'].map(c => (
                        <button 
                          key={c}
                          onClick={() => setFertCrop(c)}
                          className={cn(
                            "py-3 rounded-xl text-xs font-bold transition-all border-2",
                            fertCrop === c ? "bg-brand-green text-white border-brand-green" : "bg-brand-ice text-brand-earth border-transparent"
                          )}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-brand-earth">Upload Sample Image</label>
                    <div 
                      onClick={() => document.getElementById('fert-photo')?.click()}
                      className="h-48 bg-brand-ice rounded-[2rem] border-4 border-dashed border-brand-border flex flex-col items-center justify-center cursor-pointer hover:bg-brand-cream transition-all overflow-hidden relative"
                    >
                      {fertImage ? (
                        <img src={fertImage} className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Camera size={32} className="text-brand-earth mb-2" />
                          <span className="text-xs font-bold text-brand-earth uppercase">Click to capture sample</span>
                        </>
                      )}
                    </div>
                    <input id="fert-photo" type="file" hidden accept="image/*" onChange={e => {
                      const file = e.target.files?.[0];
                      if(file) {
                        const r = new FileReader();
                        r.onloadend = () => setFertImage(r.result as string);
                        r.readAsDataURL(file);
                      }
                    }} />
                  </div>

                  <button 
                    onClick={handleFertAnalysis}
                    disabled={!fertImage || isAnalyzingFert}
                    className="w-full bg-brand-green text-white py-5 rounded-2xl font-black shadow-xl hover:bg-brand-dark-green transition-all flex items-center justify-center gap-2 uppercase tracking-wide disabled:opacity-50"
                  >
                    {isAnalyzingFert ? (
                      <>
                        <RefreshCw size={20} className="animate-spin" />
                        Analyzing...
                      </>
                    ) : "Calculate Recommendation"}
                  </button>
                </section>
              </div>

              {/* Analysis Result */}
              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  {fertRec ? (
                    <motion.section 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white p-8 rounded-[3rem] border-2 border-brand-border shadow-xl space-y-6"
                    >
                      <div className="flex items-center gap-3 text-brand-green">
                        <CheckCircle2 size={32} />
                        <div>
                          <h4 className="font-black text-brand-dark-green leading-none">Analysis Complete</h4>
                          <p className="text-[10px] text-brand-earth font-bold uppercase tracking-widest mt-1">Growth Index: 88%</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-brand-ice p-4 rounded-xl">
                          <p className="text-[10px] font-black uppercase text-brand-earth">Current Growth Stage</p>
                          <p className="font-bold text-brand-dark-green">{fertRec.growthStage}</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                          <p className="text-[10px] font-black uppercase text-orange-800">Identified Issues</p>
                          <p className="font-bold text-orange-950 text-sm">{fertRec.issue}</p>
                        </div>
                      </div>

                      <div className="bg-brand-green text-white p-6 rounded-2xl shadow-lg space-y-3 relative overflow-hidden">
                        <div className="relative z-10">
                          <h5 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Recommended Application</h5>
                          <h4 className="text-xl font-black">{fertRec.fertilizer}</h4>
                          <div className="mt-4 flex gap-2">
                             <a 
                               href={fertRec.link} 
                               target="_blank" 
                               className="flex-1 bg-white text-brand-green py-3 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 hover:bg-brand-sun hover:text-brand-dark-green transition-all"
                             >
                               <ShoppingCart size={14} />
                               Purchase Link
                             </a>
                          </div>
                        </div>
                        <Sprout className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 rotate-12" />
                      </div>

                      <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
                         <AlertTriangle size={16} className="text-red-600 animate-pulse" />
                         <span className="text-[10px] font-black uppercase text-red-900">SMS Alert sent: Fertilizer step updated in Plot B</span>
                      </div>
                    </motion.section>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-4 bg-white/40 rounded-[3rem] border-2 border-dashed border-brand-border border-opacity-30">
                       <Sprout size={48} className="text-brand-earth opacity-20" />
                       <p className="text-brand-earth font-bold text-sm">Upload a photo to see <br /> detailed growth analysis and <br /> fertilizer steps.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}
      </div>
      {showFullReport && progressionReport && (
        <div className="modal-overlay print-container">
          <div className="w-full max-w-4xl px-4 py-8 md:py-12 flex flex-col items-center">
            <div className="w-full flex justify-end mb-4 gap-2 md:gap-4 no-print sticky top-0 z-[60] py-2">
               <button 
                 onClick={handleDownloadPDF}
                 disabled={isExporting}
                 className="bg-brand-sun text-brand-dark-green px-4 md:px-6 py-3 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest flex items-center gap-2 shadow-xl hover:bg-white transition-all active:scale-95 disabled:opacity-50"
               >
                 {isExporting ? <RefreshCw size={14} className="animate-spin" /> : <Download size={18} />}
                 {isExporting ? "Saving..." : "Save PDF"}
               </button>
               <button 
                 onClick={triggerPrintRequest}
                 className="bg-white text-brand-dark-green px-4 md:px-6 py-3 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest flex items-center gap-2 shadow-xl hover:bg-brand-sun transition-all active:scale-95"
               >
                 <FileText size={18} />
                 Print
               </button>
               <button 
                 onClick={() => setShowFullReport(false)}
                 className="bg-white/10 hover:bg-white text-white hover:text-brand-dark-green p-3 rounded-xl md:rounded-2xl transition-all border border-white/20 shadow-xl no-print"
               >
                 <ArrowRight size={24} className="rotate-180" />
               </button>
            </div>

            <div className="w-full flex justify-center pb-20">
              <motion.div 
                id="printable-report"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden text-brand-dark-green"
              >
            {/* Header with ASCII Box */}
            <div className="p-8 md:p-12 text-center border-b-8 border-brand-sun bg-brand-ice/20">
               <div className="font-mono text-[10px] md:text-[12px] leading-tight mb-8 text-brand-dark-green whitespace-pre overflow-x-auto">
{`╔═══════════════════════════════════════════════════════════════════════════════╗
║                       KRISMEDHA - CROP GROWTH ANALYTICS REPORT                 ║
║                              Generated: ${new Date().toLocaleDateString()}                                 ║
╚═══════════════════════════════════════════════════════════════════════════════╝`}
               </div>

               {/* Farmer Details Table */}
               <div className="max-w-2xl mx-auto border-2 border-brand-dark-green/10 rounded-2xl p-6 bg-white shadow-sm text-left font-mono relative">
                  <button 
                    onClick={() => setIsEditingDetails(!isEditingDetails)}
                    className="absolute top-4 right-4 text-[10px] uppercase font-black text-brand-green no-print"
                  >
                    {isEditingDetails ? "Save" : "Edit"}
                  </button>
                  <p className="text-center font-black mb-4 border-b pb-2 tracking-widest text-[10px] uppercase">FARMER & CROP DETAILS</p>
                  
                  {isEditingDetails ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {Object.entries(farmerDetails).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <label className="opacity-40 uppercase text-[9px]">{key}</label>
                          <input 
                            type="text" 
                            className="w-full border-b border-brand-border focus:border-brand-green outline-none"
                            value={value}
                            onChange={(e) => setFarmerDetails(prev => ({ ...prev, [key]: e.target.value }))}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 text-[10px] md:text-xs">
                       <p><span className="opacity-40 uppercase text-[9px]">Name:</span> {farmerDetails.name}</p>
                       <p><span className="opacity-40 uppercase text-[9px]">Variety:</span> {farmerDetails.variety}</p>
                       <p><span className="opacity-40 uppercase text-[9px]">Village:</span> {farmerDetails.village}</p>
                       <p><span className="opacity-40 uppercase text-[9px]">Farm Size:</span> {farmerDetails.farmSize}</p>
                       <p><span className="opacity-40 uppercase text-[9px]">District:</span> {farmerDetails.district}</p>
                       <p><span className="opacity-40 uppercase text-[9px]">Soil Type:</span> {farmerDetails.soilType}</p>
                       <p><span className="opacity-40 uppercase text-[9px]">State:</span> {farmerDetails.state}</p>
                       <p><span className="opacity-40 uppercase text-[9px]">Crop Type:</span> {selectedCrop}</p>
                    </div>
                  )}
               </div>
            </div>

            {/* Growth Timeline */}
            <div className="p-8 md:p-12 space-y-16">
               <section>
                  <div className="text-center mb-10">
                     <h2 className="text-2xl font-black uppercase tracking-widest inline-block border-b-4 border-brand-sun">GROWTH TIMELINE (6 PHASES)</h2>
                  </div>
                  
                  <div className="space-y-12">
                    {steps.map((step, i) => (
                      <div key={step.id} className="relative">
                         <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="w-full md:w-56 shrink-0 space-y-4">
                               <div className="aspect-square rounded-[2rem] overflow-hidden border-4 border-brand-ice shadow-xl">
                                  <img src={step.image} className="w-full h-full object-cover" />
                               </div>
                               <div className="text-center">
                                  <p className="text-[10px] font-black uppercase opacity-40">Phase {step.id}</p>
                                  <p className="font-bold text-xs italic">Taken: {step.date}</p>
                               </div>
                            </div>
                            
                            <div className="flex-1 space-y-6">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-brand-green text-white flex items-center justify-center font-black">
                                     {step.id}
                                  </div>
                                  <div>
                                     <h3 className="text-xl font-black text-brand-dark-green">{step.label}</h3>
                                     <p className="text-xs font-bold text-brand-earth">{step.description}</p>
                                  </div>
                               </div>

                               <div className="bg-brand-ice/20 p-6 rounded-[2rem] border-2 border-brand-border space-y-4">
                                  <div>
                                     <h5 className="text-[10px] font-black uppercase text-brand-green tracking-widest flex items-center gap-2 mb-2">
                                        <Sparkles size={12} /> AI Instant Observation
                                     </h5>
                                     <p className="text-xs font-medium italic">"{step.detectionText}"</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-brand-border/50">
                                     <div>
                                        <p className="text-[9px] font-black uppercase opacity-40">Health Status</p>
                                        <p className="text-sm font-black text-brand-green">{progressionReport.phaseDetails[i]?.healthStatus || "EXCELLENT"}</p>
                                     </div>
                                     <div>
                                        <p className="text-[9px] font-black uppercase opacity-40">Est. Height</p>
                                        <p className="text-sm font-black text-brand-dark-green">{progressionReport.phaseDetails[i]?.height || "10-15 cm"}</p>
                                     </div>
                                  </div>
                                  <div>
                                     <p className="text-[9px] font-black uppercase opacity-40 mb-2">Detailed Observations</p>
                                     <ul className="text-xs font-bold space-y-1">
                                        {(progressionReport.phaseDetails[i]?.observations || []).map((obs, idx) => (
                                          <li key={idx} className="flex gap-2"><span>•</span> {obs}</li>
                                        ))}
                                     </ul>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                    ))}
                  </div>
               </section>

               {/* Comparison & Graph Section */}
               <section className="bg-brand-dark-green text-white rounded-[3.5rem] p-8 md:p-12 space-y-12">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-black italic border-b-2 border-white/20 inline-block pb-1">SIDE-BY-SIDE COMPARISON</h2>
                    <p className="text-brand-sun font-black uppercase tracking-widest text-[10px]">Phase 1 (Initial) vs Phase 6 (Maturity)</p>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-12 items-center justify-center font-sans">
                     <div className="text-center space-y-4">
                        <div className="w-56 h-56 rounded-[2.5rem] border-4 border-white/20 overflow-hidden shadow-2xl mx-auto hover:scale-105 transition-all">
                           <img src={steps[0].image} className="w-full h-full object-cover" />
                        </div>
                        <div className="bg-white/10 py-2 px-4 rounded-full font-black text-[10px] uppercase tracking-widest">Phase 1: Starting Point</div>
                     </div>
                     <ArrowRight size={48} className="text-brand-sun opacity-40 hidden md:block animate-pulse" />
                     <div className="text-center space-y-4">
                        <div className="w-56 h-56 rounded-[2.5rem] border-4 border-white/20 overflow-hidden shadow-2xl mx-auto hover:scale-105 transition-all">
                           <img src={steps[5].image} className="w-full h-full object-cover" />
                        </div>
                        <div className="bg-brand-sun py-2 px-4 rounded-full font-black text-[10px] uppercase tracking-widest text-brand-dark-green">Phase 6: Final Harvest</div>
                     </div>
                  </div>

                  <div className="bg-black/30 p-8 md:p-10 rounded-[3rem] border border-white/10 font-mono">
                     <p className="text-xs font-black uppercase text-brand-sun mb-6 italic tracking-widest">📊 GROWTH PROGRESSION: Height (cm)</p>
                     <div className="relative h-64 border-l-2 border-b-2 border-white/20 ml-8 mb-4">
                        {[120, 100, 80, 60, 40, 20, 0].map((v, i) => (
                           <div key={v} className="absolute w-full border-t border-white/5" style={{ bottom: `${(v/120)*100}%` }}>
                              <span className="absolute -left-10 -top-2 opacity-40 text-[10px] whitespace-nowrap">{v}┤</span>
                           </div>
                        ))}
                        <div className="absolute inset-0 flex justify-between items-end px-8 pb-4">
                           {[15, 35, 55, 75, 95, 110].map((h, i) => (
                              <div key={i} className="flex flex-col items-center gap-2 group">
                                 <div 
                                    className="w-4 h-4 bg-brand-sun rounded-full shadow-[0_0_15px_rgba(244,204,66,0.6)] group-hover:scale-150 transition-all cursor-crosshair mb-2"
                                    style={{ marginBottom: `${(h/120)*200}px` }} 
                                 />
                                 <span className="text-[9px] font-black text-brand-sun">Phase {i+1}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </section>

               {/* Final Summary Report */}
               <section className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-2xl font-black uppercase tracking-[0.2em] inline-block border-b-4 border-brand-ice pb-1">FINAL ANALYTICS SUMMARY</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="bg-brand-ice/20 p-8 rounded-[3rem] border-2 border-brand-border space-y-4 shadow-sm">
                        <h4 className="text-[10px] font-black uppercase text-brand-green tracking-widest">📈 GROWTH RATE</h4>
                        <div className="space-y-1">
                           <p className="text-2xl font-black leading-tight">{progressionReport.growthRate}</p>
                        </div>
                     </div>
                     <div className="bg-brand-ice/20 p-8 rounded-[3rem] border-2 border-brand-border space-y-4 shadow-sm">
                        <h4 className="text-[10px] font-black uppercase text-brand-sun tracking-widest">💚 HEALTH TREND</h4>
                        <div className="space-y-1">
                           <p className="text-2xl font-black leading-tight">{progressionReport.healthTrend} 📈</p>
                        </div>
                     </div>
                     <div className="bg-brand-sun p-8 rounded-[3rem] shadow-2xl space-y-4">
                        <h4 className="text-[10px] font-black uppercase text-brand-dark-green tracking-widest opacity-60">🌾 YIELD PREDICTION</h4>
                        <div className="space-y-1">
                           <p className="text-3xl font-black text-brand-dark-green leading-tight">{progressionReport.yieldPrediction}</p>
                           <p className="text-[10px] font-black text-brand-dark-green mt-2 border-t border-brand-dark-green/10 pt-2 uppercase">Revenue Est: {progressionReport.estimatedRevenue}</p>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                     <div className="space-y-6">
                        <h3 className="font-black text-xs uppercase tracking-widest text-brand-green flex items-center gap-1">
                           <CheckCircle2 size={16} /> WHAT WENT WELL
                        </h3>
                        <div className="bg-brand-ice/10 border-2 border-brand-border p-6 rounded-[2rem] space-y-3">
                           {(progressionReport.whatWentWell || []).map((item, idx) => (
                             <p key={idx} className="text-sm font-bold flex gap-3 text-brand-dark-green"><span className="text-brand-green">•</span> {item}</p>
                           ))}
                        </div>
                     </div>
                     <div className="space-y-6">
                        <h3 className="font-black text-xs uppercase tracking-widest text-orange-600 flex items-center gap-1">
                           <AlertTriangle size={16} /> AREAS FOR IMPROVEMENT
                        </h3>
                        <div className="bg-orange-50/50 border-2 border-orange-100 p-6 rounded-[2rem] space-y-3">
                           {(progressionReport.areasForImprovement || []).map((item, idx) => (
                             <p key={idx} className="text-sm font-bold flex gap-3 text-orange-950"><span className="text-orange-600">•</span> {item}</p>
                           ))}
                        </div>
                     </div>
                  </div>
               </section>

               {/* Readiness Checklist */}
               <section className="bg-brand-ice/20 p-10 rounded-[4rem] border-4 border-brand-border space-y-8">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <h2 className="text-xl font-black uppercase tracking-widest text-brand-dark-green">HARVEST READINESS CHECKLIST</h2>
                    <div className="bg-brand-dark-green text-white px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest shadow-lg">
                       EXPECTED: {progressionReport.expectedHarvestDate}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {(progressionReport.harvestChecklist || []).map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-center bg-white p-5 rounded-3xl border-2 border-brand-border">
                           <div className="w-6 h-6 rounded-lg bg-brand-green flex items-center justify-center text-white shrink-0">
                              <CheckCircle2 size={16} />
                           </div>
                           <span className="text-sm font-black opacity-80 text-brand-dark-green">{item}</span>
                        </div>
                     ))}
                  </div>
               </section>
            </div>

            <div className="bg-brand-dark-green text-white p-12 text-center space-y-8">
               <div className="font-mono text-[10px] md:text-sm leading-tight mb-8 whitespace-pre overflow-x-auto text-brand-sun">
{`╔═══════════════════════════════════════════════════════════════════════════════╗
║                         REPORT GENERATED BY KRISMEDHA AI                       ║
║                         🌾 Empowering Farmers with AI 🌱                       ║
╚═══════════════════════════════════════════════════════════════════════════════╝`}
               </div>
               
               <div className="flex justify-center gap-8 flex-wrap no-print">
                  <button 
                    onClick={handleWhatsAppShare}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white text-xs font-black px-8 py-4 rounded-2xl hover:text-brand-dark-green transition-all uppercase tracking-widest border border-white/20"
                  >
                     <Share2 size={18} /> Share to WhatsApp
                  </button>
                  <button 
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 bg-brand-sun text-brand-dark-green text-xs font-black px-8 py-4 rounded-2xl hover:bg-white transition-all uppercase tracking-widest shadow-xl"
                  >
                     <FileText size={18} /> Download PDF
                  </button>
               </div>
            </div>
          </motion.div>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
