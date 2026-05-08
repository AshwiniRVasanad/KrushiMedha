import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Phone, 
  PhoneOff, 
  Bot, 
  User, 
  Sprout, 
  MessageSquare,
  X,
  ImageIcon,
  ImagePlus,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Command,
  Globe,
  ArrowDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import { cn, logActivity } from "../lib/utils";
import { chatWithKrsiMedha } from "../services/geminiService";
import { ChatMessage, ChatSession } from "../types";

const languageMap: Record<string, string> = {
  en: 'English',
  kn: 'Kannada',
  hi: 'Hindi',
  te: 'Telugu',
  ta: 'Tamil',
  ml: 'Malayalam'
};

type Mode = 'chat' | 'call';
type CallState = "IDLE" | "DIALING" | "ACTIVE_AI" | "ESCALATING" | "EXPERT_CONNECTED";
type DiagnosisTier = 1 | 2 | 3;

const PROMPT_SUGGESTIONS = [
  "How to get higher tomato yield?",
  "Signs of nitrogen deficiency?",
  "Best time to plant wheat?",
  "Organic pesticides for aphids?"
];

import { Logo } from "../components/Logo";

export default function AssistantPage() {
  const { t, i18n } = useTranslation();
  const currentLanguageName = languageMap[i18n.language] || 'English';
  
  const [mode, setMode] = useState<Mode>('chat');
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('krsi_chat_sessions');
    if (saved) return JSON.parse(saved);
    return [];
  });
  
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => {
    const lastSession = localStorage.getItem('krsi_last_session_id');
    return lastSession || null;
  });

  const [input, setInput] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Call State
  const [callState, setCallState] = useState<CallState>("IDLE");
  const [currentTier, setCurrentTier] = useState<DiagnosisTier>(1);
  const [callDuration, setCallDuration] = useState(0);
  const [expertStatus, setExpertStatus] = useState("AI is ready to listen...");
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [callTranscript, setCallTranscript] = useState<{role: 'user' | 'ai' | 'expert', text: string}[]>([]);
  const [callInput, setCallInput] = useState("");
  
  const recognitionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Get current session
  const currentSession = sessions.find(s => s.id === currentSessionId) || null;
  const messages = currentSession?.messages || [];

  useEffect(() => {
    localStorage.setItem('krsi_chat_sessions', JSON.stringify(sessions));
    if (currentSessionId) {
      localStorage.setItem('krsi_last_session_id', currentSessionId);
    }
  }, [sessions, currentSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const [showScrollDown, setShowScrollDown] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  const handleTranscriptScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 30;
    setShowScrollDown(!isAtBottom);
    setShouldAutoScroll(isAtBottom);
  };

  const scrollToBottom = () => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTo({
        top: transcriptContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    if (shouldAutoScroll) {
      // Delay slightly to allow DOM to update with new content
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [callTranscript, interimTranscript, shouldAutoScroll]);

  useEffect(() => {
    // Load voices for synthesis
    const loadVoices = () => window.speechSynthesis.getVoices();
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Farming Chat",
      messages: [{
        id: "initial",
        role: "model",
        parts: [{ text: "🌾 Namaste! I am your KrsiMedha Assistant. How can I help you with your crops today? I speak multiple languages!" }],
        timestamp: new Date().toISOString(),
      }],
      lastUpdated: new Date().toISOString(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMode('chat');
  };

  // Auto-create session if none exists
  useEffect(() => {
    if (sessions.length === 0) {
      createNewSession();
    } else if (!currentSessionId) {
      setCurrentSessionId(sessions[0].id);
    }
  }, []);

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (currentSessionId === id) {
        setCurrentSessionId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  const clearAllHistory = () => {
    if (window.confirm("Are you sure you want to delete ALL chat history?")) {
      setSessions([]);
      setCurrentSessionId(null);
    }
  };

  const startCall = () => {
    setCallState("DIALING");
    setCurrentTier(1);
    setCallDuration(0);
    setCallTranscript([]);
    
    logActivity({
      type: 'call_expert',
      title: t('assistant.call_expert'),
      description: t('assistant.call_dialing')
    });

    setTimeout(() => {
      setCallState("ACTIVE_AI");
      setExpertStatus("Tier 1: AI Greeting & Triage");
      callTimerRef.current = setInterval(() => setCallDuration(prev => prev + 1), 1000);
      
      // Standard greeting
      const greeting = i18n.language === 'hi' ? "नमस्ते, मैं कृषिमेधा एआई सहायक हूं। मैं आपकी कैसे मदद कर सकता हूं?" :
                       i18n.language === 'kn' ? "ನಮಸ್ಕಾರ, ನಾನು ಕೃಷಿಮೇಧ ಎಐ ಸಹಾಯಕಿ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?" :
                       "Namaste! I am your KrsiMedha AI Assistant. How can I help you with your crops today?";
      
      speak(greeting);
    }, 2000);
  };

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    
    // Stop any existing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to find a suitable voice for the language
    const voices = window.speechSynthesis.getVoices();
    const langCode = i18n.language === 'en' ? 'en-IN' : 
                     i18n.language === 'hi' ? 'hi-IN' : 
                     i18n.language === 'kn' ? 'kn-IN' : 
                     i18n.language === 'te' ? 'te-IN' :
                     i18n.language === 'ta' ? 'ta-IN' :
                     i18n.language === 'ml' ? 'ml-IN' : 'en-IN';
    
    const voice = voices.find(v => v.lang.startsWith(langCode));
    if (voice) utterance.voice = voice;
    utterance.lang = langCode;
    utterance.rate = 0.95;
    utterance.pitch = 1;

    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => {
      setIsAiSpeaking(false);
      setCallTranscript(prev => [...prev, { role: 'ai', text }]);
      // Start listening after AI finishers
      if (callState === "ACTIVE_AI") startListening();
    };

    synthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error("Speech recognition not supported");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = i18n.language === 'en' ? 'en-IN' : 
                       i18n.language === 'hi' ? 'hi-IN' : 
                       i18n.language === 'kn' ? 'kn-IN' : 
                       i18n.language === 'te' ? 'te-IN' :
                       i18n.language === 'ta' ? 'ta-IN' :
                       i18n.language === 'ml' ? 'ml-IN' : 'en-IN';
    
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsUserSpeaking(true);
      setInterimTranscript("");
    };
    recognition.onend = () => setIsUserSpeaking(false);
    
    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInterimTranscript("");
      setCallTranscript(prev => [...prev, { role: 'user', text: transcript }]);
      handleVoiceQuery(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsUserSpeaking(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleVoiceQuery = async (query: string) => {
    setExpertStatus("AI thinking...");
    try {
      const response = await chatWithKrsiMedha(
        `[VOICE CALL CONTEXT] The user is on a phone call. Keep response brief and spoken-friendly. User said: ${query}`,
        callTranscript.map(t => ({ role: t.role === 'user' ? 'user' : 'model', content: t.text })),
        undefined,
        currentLanguageName
      );
      setExpertStatus("AI Responding...");
      speak(response);
    } catch (error) {
      console.error("AI Voice response failed:", error);
      speak("I encountered an error. Please try again or connect to a human expert.");
    }
  };

  const endCall = () => {
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (recognitionRef.current) recognitionRef.current.stop();
    setCallState("IDLE");
    setCurrentTier(1);
    setIsAiSpeaking(false);
    setIsUserSpeaking(false);
  };

  const escalateToExpert = () => {
    setCurrentTier(2);
    setExpertStatus("Tier 2: AI analyzing critical signs...");
    
    logActivity({
      type: 'call_expert',
      title: 'Human Expert Connection',
      description: 'Requesting escalation to human expert Rajesh (8317446773)'
    });

    setTimeout(() => {
      setCallState("ESCALATING");
      setExpertStatus("Connecting to Expert (8317446773)...");
      setTimeout(() => {
        setCallState("EXPERT_CONNECTED");
        setExpertStatus("Expert Rajesh is ready (8317446773)");
        setCurrentTier(3);
        setCallTranscript(prev => [...prev, { role: 'expert', text: "Hello! This is Rajesh from the Hubli center. I've seen your data. How can I help you personally?" }]);
      }, 3000);
    }, 2000);
  };

  const handleRealCall = () => {
    logActivity({
      type: 'call_expert',
      title: 'GSM Call Initiated',
      description: 'Dialing expert Rajesh directly via phone network.'
    });
    window.location.href = 'tel:+918317446773';
  };

  const handleSend = async (textOverride?: string) => {
    const messageText = textOverride || input;
    if (!messageText.trim() && !image) return;
    if (!currentSessionId) return;

    const userMessage: ChatMessage = { 
      id: Date.now().toString(), 
      role: "user", 
      parts: [{ text: messageText }], 
      image: image || undefined, 
      timestamp: new Date().toISOString() 
    };

    // Update current session with user message
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        const isFirstMessage = s.messages.length === 1; // initial bot message is index 0
        return {
          ...s,
          title: isFirstMessage ? messageText.slice(0, 30) + (messageText.length > 30 ? "..." : "") : s.title,
          messages: [...s.messages, userMessage],
          lastUpdated: new Date().toISOString()
        };
      }
      return s;
    }));

    setInput(""); 
    setImage(null); 
    setIsTyping(true);

    try {
      const history = messages.map(m => ({ 
        role: m.role, 
        content: m.parts[0].text 
      }));
      
      const response = await chatWithKrsiMedha(messageText || "Analyze image", history as any, userMessage.image, currentLanguageName);
      
      logActivity({
        type: 'chat_sent',
        title: 'Chat Message Sent',
        description: messageText || 'Sent image to AI Assistant',
        metadata: { hasImage: !!userMessage.image }
      });

      const botMessage: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: "model", 
        parts: [{ text: response }], 
        timestamp: new Date().toISOString() 
      };

      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: [...s.messages, botMessage],
            lastUpdated: new Date().toISOString()
          }
        }
        return s;
      }));
    } catch (error) {
       console.error(error);
    } finally { 
      setIsTyping(false); 
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex h-full bg-white relative overflow-hidden">
      
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-[#042d1b]/40 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -350 }}
              animate={{ x: 0 }}
              exit={{ x: -350 }}
              className="fixed lg:relative z-50 w-80 h-full bg-[#f8fafc] border-r border-slate-200 flex flex-col shadow-2xl lg:shadow-none"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between mb-2">
                   <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Consultancy</h2>
                   <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors">
                     <ChevronLeft size={20} className="text-slate-400" />
                   </button>
                </div>
                <button 
                  onClick={createNewSession}
                  className="w-full flex items-center justify-center gap-3 bg-brand-dark-green text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-[0_15px_30px_rgba(10,51,34,0.2)] hover:bg-[#0a3322] hover:-translate-y-1 transition-all active:scale-95"
                >
                  <Plus size={18} />
                  New Session
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 space-y-3 custom-scrollbar pb-8">
                {sessions.map(session => (
                  <motion.div 
                    key={session.id}
                    onClick={() => {
                      setCurrentSessionId(session.id);
                      if (window.innerWidth < 1024) setIsSidebarOpen(false);
                    }}
                    className={cn(
                      "group p-5 rounded-[2rem] cursor-pointer transition-all border-2 flex items-center justify-between relative overflow-hidden",
                      currentSessionId === session.id 
                        ? "bg-white border-brand-sun shadow-[0_10px_25px_rgba(240,186,22,0.15)] scale-[1.02]" 
                        : "border-transparent hover:bg-white hover:border-slate-100 hover:shadow-lg"
                    )}
                  >
                    {currentSessionId === session.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-sun" />
                    )}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
                        currentSessionId === session.id ? "bg-brand-sun/10 text-brand-sun" : "bg-slate-100 text-slate-400"
                      )}>
                        <MessageSquare size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={cn("text-xs font-black block truncate uppercase tracking-tight", currentSessionId === session.id ? "text-brand-dark-green" : "text-slate-600")}>
                          {session.title}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 mt-1 block">
                          {new Date(session.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => deleteSession(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>

              <div className="p-8 border-t border-slate-100 space-y-6 bg-slate-50/50">
                <button 
                  onClick={clearAllHistory}
                  className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  <Trash2 size={16} />
                  Purge History
                </button>
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                   <div className="w-8 h-8 bg-brand-sun/10 rounded-lg flex items-center justify-center">
                    <Globe size={16} className="text-brand-sun" />
                   </div>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Global Assist Mode</span>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Header */}
        <header className="h-24 border-b border-slate-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-3 hover:bg-slate-50 text-slate-400 hover:text-brand-dark-green rounded-2xl transition-all active:scale-90"
            >
              {isSidebarOpen ? <ChevronLeft size={24} /> : <MessageSquare size={24} />}
            </button>
            <div className="flex bg-slate-100/50 rounded-3xl p-1.5 border border-slate-100 shadow-inner">
              <button 
                onClick={() => setMode('chat')}
                className={cn(
                  "px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3",
                  mode === 'chat' ? "bg-brand-dark-green text-white shadow-[0_5px_15px_rgba(10,51,34,0.3)] scale-105" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Sparkles size={16} />
                Assistant
              </button>
              <button 
                onClick={() => setMode('call')}
                className={cn(
                  "px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3",
                  mode === 'call' ? "bg-brand-sun text-brand-dark-green shadow-[0_5px_15px_rgba(240,186,22,0.3)] scale-105" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Phone size={16} />
                Voice Line
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
               <p className="text-[10px] font-black text-brand-dark-green uppercase tracking-widest">Connect: Online</p>
               <div className="flex items-center justify-end gap-1.5 mt-1">
                 <div className="w-1.5 h-1.5 bg-brand-green rounded-full animate-pulse shadow-[0_0_8px_#22C55E]" />
                 <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">KrsiMedha 2.1</span>
               </div>
             </div>
             <motion.div 
               whileHover={{ scale: 1.05 }}
               className="w-14 h-14 rounded-3xl bg-white border-2 border-slate-100 flex items-center justify-center shadow-md cursor-pointer overflow-hidden p-2"
             >
               <Logo className="w-full h-full" />
             </motion.div>
          </div>
        </header>

        {mode === 'chat' ? (
          <div className="flex-1 flex flex-col min-h-0 bg-[#f8fafc]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 md:px-12 py-12 space-y-12 scrollbar-thin">
              {messages.length <= 1 && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-brand-sun/20 rounded-[3rem] blur-3xl animate-pulse" />
                    <div className="relative w-32 h-32 bg-white rounded-[3.5rem] border-4 border-slate-100 flex items-center justify-center shadow-xl overflow-hidden p-4">
                      <Logo className="w-full h-full" />
                    </div>
                  </div>
                  <div className="max-w-md mx-auto space-y-4">
                    <h2 className="text-4xl font-black text-brand-dark-green tracking-tighter leading-tight uppercase italic">
                      Welcome, <span className="text-slate-400">Farmer</span>
                    </h2>
                    <p className="font-bold text-slate-500 uppercase tracking-widest text-xs bg-white/50 py-3 px-6 rounded-2xl border border-slate-100">
                      Your high-yield digital consultancy starts here.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl px-6">
                    {[
                      { l: "Diagnose Leaf Spot", i: <Sprout size={14} /> },
                      { l: "Soil Treatment Guide", i: <Sparkles size={14} /> },
                      { l: "Market Price Trends", i: <Command size={14} /> },
                      { l: "Irrigation Schedule", i: <Globe size={14} /> }
                    ].map((q, i) => (
                      <button 
                        key={i}
                        onClick={() => handleSend(q.l)}
                        className="bg-white p-5 rounded-3xl border-2 border-slate-100 text-left hover:border-brand-sun hover:shadow-xl transition-all group flex items-center gap-4"
                      >
                        <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-brand-sun/10 group-hover:text-brand-sun flex items-center justify-center text-slate-400 transition-colors">
                          {q.i}
                        </div>
                        <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{q.l}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className={cn(
                    "flex gap-6 w-full", 
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "model" && (
                    <div className="w-12 h-12 rounded-2xl bg-white text-white flex items-center justify-center shrink-0 shadow-[0_10px_20px_rgba(0,0,0,0.05)] border-2 border-slate-100 mt-1 overflow-hidden p-1.5">
                      <Logo className="w-full h-full" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[85%] md:max-w-2xl space-y-3",
                    msg.role === "user" ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "p-8 rounded-[3rem] shadow-[0_4px_30px_rgba(0,0,0,0.03)] text-base md:text-lg border leading-relaxed",
                      msg.role === "user" 
                        ? "bg-brand-dark-green text-white border-[#0a3322] rounded-tr-none shadow-[0_15px_40px_rgba(10,51,34,0.15)] font-bold" 
                        : "bg-white border-slate-100 text-[#1e293b] rounded-tl-none font-medium"
                    )}>
                      {msg.image && (
                        <div className="mb-6 rounded-[2rem] overflow-hidden border-4 border-white/50 shadow-2xl relative group">
                           <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <img src={msg.image} className="w-full h-auto max-h-[400px] object-contain" />
                        </div>
                      )}
                      <div className="markdown-body">
                         <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                      </div>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 px-4 opacity-40",
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}>
                       <span className="text-[10px] font-black uppercase tracking-widest">{msg.role === 'user' ? 'Direct Input' : 'Krsi AI Model'}</span>
                       <div className="w-1 h-1 rounded-full bg-slate-400" />
                       <span className="text-[9px] font-black uppercase tabular-nums">
                         {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <div className="flex gap-4 items-start">
                   <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden p-2 shadow-sm">
                    <Logo className="w-full h-full opacity-50" />
                   </div>
                   <div className="flex gap-2 p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="w-2.5 h-2.5 bg-brand-sun rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2.5 h-2.5 bg-brand-sun rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2.5 h-2.5 bg-brand-sun rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Enhanced Floating Input Bar */}
            <div className="p-8 bg-gradient-to-t from-white via-white to-white/0 bottom-0 sticky z-20">
              <div className="max-w-4xl mx-auto relative">
                {image && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="absolute -top-32 left-0 z-30"
                  >
                    <div className="relative group">
                      <img src={image} alt="Preview" className="w-28 h-28 object-cover rounded-[2rem] border-4 border-white shadow-2xl ring-8 ring-brand-sun/10 transition-transform group-hover:scale-105" />
                      <button 
                        onClick={() => setImage(null)} 
                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 shadow-xl hover:bg-black transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}
                
                <div className="flex items-center gap-4 bg-white p-2 md:p-3 rounded-[3.5rem] border-2 border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl focus-within:border-brand-sun/30 focus-within:shadow-[0_20px_60px_rgba(240,186,22,0.1)] transition-all">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-5 text-slate-400 hover:text-brand-sun hover:bg-brand-sun/5 rounded-[2.5rem] transition-all active:scale-90"
                  >
                    <ImagePlus size={24} />
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  
                  <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about crops, pests, or market prices..."
                    className="flex-1 bg-transparent py-4 text-base md:text-lg font-bold text-slate-700 outline-none placeholder:text-slate-300"
                  />

                  <button 
                    onClick={() => handleSend()}
                    disabled={!input.trim() && !image}
                    className="bg-brand-dark-green text-white p-5 rounded-[2.5rem] shadow-xl disabled:bg-slate-200 disabled:text-slate-400 hover:bg-brand-leaf transition-all hover:scale-105 active:scale-95 shadow-brand-dark-green/20"
                  >
                    <Send size={24} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center p-8 bg-[#042d1b] relative overflow-y-auto custom-scrollbar">
            {/* Audio Visualization background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
              <motion.div 
                animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} 
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-green/20 rounded-full blur-[120px]" 
              />
              <motion.div 
                animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }} 
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-brand-sun/10 rounded-full blur-[140px]" 
              />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-10 w-full max-w-lg my-auto py-12">
              {callState === "IDLE" ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="text-center space-y-10 w-full"
                >
                  <div className="relative mx-auto w-56 h-56">
                    <div className="absolute inset-0 bg-brand-sun/20 rounded-[4.5rem] blur-3xl animate-pulse" />
                    <div className="relative w-full h-full bg-gradient-to-br from-white/10 to-white/5 rounded-[4.5rem] border-4 border-white/20 flex items-center justify-center shadow-2xl z-10 overflow-hidden group p-8">
                      <div className="absolute inset-0 bg-brand-green/10 group-hover:bg-brand-green/20 transition-colors" />
                      <Logo className="w-full h-full relative z-10 drop-shadow-lg" />
                    </div>
                    
                    {/* Decorative Spinning Rings */}
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                      className="absolute -inset-4 border-2 border-dashed border-white/10 rounded-[5rem] pointer-events-none" 
                    />
                    <motion.div 
                      animate={{ rotate: -360 }} 
                      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                      className="absolute -inset-10 border border-white/5 rounded-[6rem] pointer-events-none" 
                    />
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-5xl font-black text-white tracking-tighter leading-tight uppercase italic">
                      Expert <span className="text-brand-sun">Voice</span> Line
                    </h2>
                    <p className="text-brand-ice/50 font-bold uppercase tracking-[0.3em] text-[10px] bg-white/5 py-2 px-4 rounded-full inline-block border border-white/5">
                      Advanced 3-Tier Diagnostic Support
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 max-w-sm mx-auto pt-4">
                    <button 
                      onClick={startCall}
                      className="bg-brand-sun hover:bg-[#ffcf33] text-brand-dark-green px-12 py-7 rounded-[2.5rem] font-black text-2xl shadow-[0_20px_50px_rgba(240,186,22,0.4)] transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-4 group border-b-8 border-[#c99a12] active:border-b-0 active:translate-y-2"
                    >
                      <Phone className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                      START CALL
                    </button>
                    <button 
                      onClick={handleRealCall}
                      className="text-white/40 hover:text-white border-2 border-white/10 px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-white/5 transition-all flex items-center justify-center gap-3 backdrop-blur-sm"
                    >
                      <Phone size={14} />
                      Skip AI • Direct GSM Call
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="w-full flex flex-col items-center gap-8">
                  <div className="w-full text-center">
                    <div className="relative mx-auto w-44 h-44 mb-8">
                      <div className="absolute inset-0 bg-white/5 rounded-[3.5rem] blur-2xl" />
                      <div className="relative w-full h-full bg-gradient-to-br from-white/15 to-white/5 rounded-[3.5rem] flex items-center justify-center border-2 border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.3)] overflow-hidden group">
                        <AnimatePresence>
                          {(isAiSpeaking || isUserSpeaking) && (
                            <motion.div 
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.2, 0.6] }}
                              exit={{ scale: 0.8, opacity: 0 }}
                              transition={{ repeat: Infinity, duration: 2 }}
                              className={cn(
                                "absolute inset-0 rounded-[3.5rem] blur-2xl",
                                isAiSpeaking ? "bg-brand-sun" : "bg-brand-green"
                              )} 
                            />
                          )}
                        </AnimatePresence>
                        <div className="relative z-10">
                          {callState === "EXPERT_CONNECTED" ? (
                            <User className="w-24 h-24 text-brand-sun drop-shadow-[0_0_15px_rgba(240,186,22,0.4)]" />
                          ) : (
                            <Bot className={cn(
                              "w-24 h-24 transition-all duration-700",
                              isAiSpeaking ? "text-brand-sun scale-110 drop-shadow-[0_0_20px_rgba(240,186,22,0.3)]" : "text-white/30"
                            )} />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="h-12 flex items-center justify-center gap-1.5 mb-2">
                       {(isAiSpeaking || isUserSpeaking) ? (
                         <div className="flex gap-1.5 items-end h-10">
                           {[1, 2, 3, 4, 3, 2, 1, 2, 3, 4].map((h, i) => (
                             <motion.div 
                               key={i}
                               animate={{ 
                                 height: [8, h * 7, 8],
                                 backgroundColor: isAiSpeaking ? '#F0BA16' : '#22C55E'
                               }}
                               transition={{ repeat: Infinity, duration: 0.4, delay: i * 0.05 }}
                               className="w-2 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                             />
                           ))}
                         </div>
                       ) : (
                         <div className="flex gap-2 h-1.5">
                           {[1, 2, 3, 4, 5].map((i) => (
                             <div key={i} className="w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                           ))}
                         </div>
                       )}
                    </div>

                    <h3 className="text-5xl font-black text-white italic tracking-tighter mb-4 tabular-nums shadow-sm">{formatTime(callDuration)}</h3>
                    
                    <div className="flex flex-wrap justify-center gap-3 mb-6">
                      <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl shadow-xl">
                        <Globe size={14} className="text-brand-sun" />
                        <span className="text-[11px] font-black text-white uppercase tracking-widest">{currentLanguageName} Mode</span>
                      </div>
                      <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-sun/10 rounded-2xl border border-brand-sun/20 backdrop-blur-xl shadow-xl">
                        <div className="w-2 h-2 rounded-full bg-brand-sun animate-pulse shadow-[0_0_10px_#F0BA16]" />
                        <span className="text-[11px] font-black text-brand-sun uppercase tracking-widest">Tier {currentTier} Diagnosis</span>
                      </div>
                    </div>

                    <div className="bg-black/30 backdrop-blur-md py-2.5 px-8 rounded-2xl inline-block border border-white/10 shadow-lg">
                       <p className="text-brand-ice font-black uppercase tracking-[0.25em] text-[10px]">{expertStatus}</p>
                    </div>
                    
                    {/* Live Transcript / Chat Interface */}
                    <div className="relative mt-10 w-full group">
                      <div 
                        ref={transcriptContainerRef}
                        onScroll={handleTranscriptScroll}
                        className="w-full h-72 bg-[#05110c]/80 rounded-[3rem] border-2 border-white/10 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-4 backdrop-blur-2xl shadow-[inset_0_4px_20px_rgba(0,0,0,0.6)]"
                      >
                        <div className="flex items-center justify-between sticky top-0 z-10 bg-transparent pb-4 mb-2">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xl">
                             <MessageSquare size={14} className="text-brand-sun" />
                             <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">Live Transcript</span>
                          </div>
                        </div>

                        {callTranscript.map((entry, i) => (
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={i} 
                            className={cn(
                              "text-[14px] font-medium leading-relaxed px-6 py-4 rounded-[2rem] max-w-[90%] shadow-2xl relative border",
                              entry.role === 'ai' ? "bg-white/10 text-brand-ice self-start rounded-tl-none border-white/10" : 
                              entry.role === 'expert' ? "bg-brand-sun/10 text-brand-sun self-start rounded-tl-none border-brand-sun/30" :
                              "bg-[#22c55e] text-white self-end rounded-tr-none border-[#16a34a] font-bold"
                            )}
                          >
                            <span className={cn(
                              "font-black uppercase text-[9px] block mb-2 tracking-[0.15em] opacity-70",
                              entry.role === 'user' ? "text-white" : "text-brand-sun"
                            )}>
                              {entry.role === 'ai' ? 'Krsi AI Assistant' : entry.role === 'expert' ? 'Expert Rajesh' : 'You (Voice Input)'}
                            </span>
                            {entry.text}
                          </motion.div>
                        ))}
                        
                        {isUserSpeaking && (
                           <div className="text-[14px] font-black text-brand-green italic p-5 animate-pulse self-end flex items-center gap-4 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-md">
                             <div className="flex gap-1.5 items-center">
                               <div className="w-2 h-2 bg-brand-green rounded-full animate-bounce" />
                               <div className="w-2 h-2 bg-brand-green rounded-full animate-bounce [animation-delay:0.1s]" />
                             </div>
                             Processing Speech...
                           </div>
                        )}
                        <div ref={transcriptEndRef} />
                      </div>

                      <AnimatePresence>
                        {showScrollDown && (
                          <motion.button
                            initial={{ opacity: 0, y: 20, x: '-50%' }}
                            animate={{ opacity: 1, y: 0, x: '-50%' }}
                            exit={{ opacity: 0, y: 20, x: '-50%' }}
                            onClick={scrollToBottom}
                            className="absolute -bottom-6 left-1/2 bg-brand-sun text-brand-dark-green px-6 py-3.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(240,186,22,0.5)] flex items-center gap-2 z-20 border-2 border-brand-dark-green/20 hover:scale-110 active:scale-95 transition-all"
                          >
                            <ArrowDown size={14} className="animate-bounce" />
                            Jump to Bottom
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Chat Text Sync */}
                    <div className="mt-8 w-full flex gap-3 relative">
                       <input 
                         type="text"
                         value={callInput}
                         onChange={(e) => setCallInput(e.target.value)}
                         onKeyDown={e => {
                           if (e.key === 'Enter') {
                             if (!callInput.trim()) return;
                             setCallTranscript(prev => [...prev, { role: 'user', text: callInput }]);
                             handleVoiceQuery(callInput);
                             setCallInput("");
                           }
                         }}
                         placeholder="Sync your voice request with text..."
                         className="w-full bg-[#05110c]/60 border-2 border-white/10 rounded-[2rem] px-8 py-5 text-white text-base font-bold outline-none placeholder:text-white/20 focus:border-brand-sun/50 focus:bg-black/40 transition-all shadow-2xl backdrop-blur-xl"
                       />
                       <button 
                         onClick={() => {
                           if (!callInput.trim()) return;
                           setCallTranscript(prev => [...prev, { role: 'user', text: callInput }]);
                           handleVoiceQuery(callInput);
                           setCallInput("");
                         }}
                         className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-brand-sun text-brand-dark-green rounded-full hover:bg-white transition-all shadow-xl active:scale-90"
                       >
                         <Send size={20} />
                       </button>
                    </div>

                    <div className="mt-12 flex flex-col gap-4 w-full">
                      {callState === "ACTIVE_AI" && (
                        <button 
                          onClick={escalateToExpert} 
                          className="w-full py-5 px-8 rounded-3xl bg-brand-sun/10 border-2 border-brand-sun/30 text-brand-sun font-black uppercase text-xs tracking-[0.25em] hover:bg-brand-sun hover:text-brand-dark-green transition-all group relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-brand-sun opacity-0 group-hover:opacity-10 transition-opacity" />
                          <span className="relative z-10 animate-pulse">Request Human Expert Guidance</span>
                        </button>
                      )}

                      {callState === "EXPERT_CONNECTED" && (
                        <motion.button 
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          onClick={handleRealCall}
                          className="bg-brand-sun hover:bg-[#ffcf33] text-brand-dark-green px-10 py-6 rounded-[2.5rem] font-black text-xl uppercase tracking-tighter flex items-center justify-center gap-4 shadow-[0_20px_50px_rgba(240,186,22,0.4)] transition-all hover:scale-105 border-b-8 border-[#c99a12]"
                        >
                          <Phone size={28} className="animate-bounce" />
                          Transfer to Direct Call
                        </motion.button>
                      )}

                      <button 
                        onClick={endCall}
                        className="bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white px-10 py-5 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] transition-all border-2 border-red-500/30 flex items-center justify-center gap-4 group active:scale-95"
                      >
                        <PhoneOff size={22} className="group-hover:rotate-12 transition-transform" />
                        End Session
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(s: number) {
  const m = Math.floor(s/60);
  const sc = s%60;
  return `${m}:${sc.toString().padStart(2,'0')}`;
}

