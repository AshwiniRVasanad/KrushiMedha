export type Page = 'home' | 'scan' | 'assistant' | 'analytics' | 'profile';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  parts: { text: string }[];
  timestamp: string;
  image?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastUpdated: string;
}

export interface DiseaseResult {
  disease: string;
  confidence: number;
  reason: string;
  solution: string;
  organicAlternative: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  timestamp?: string;
  image?: string;
}

export interface ScanHistoryItem extends DiseaseResult {
  id: string;
}

export interface ProductivityStep {
  id: number;
  label: string;
  description: string;
  status: 'pending' | 'completed';
  image?: string;
  date?: string;
  detectionText?: string;
}

export interface ProgressionReport {
  growthRate: string;
  healthTrend: string;
  yieldPrediction: string;
  summary: string;
  estimatedRevenue: string;
  whatWentWell: string[];
  areasForImprovement: string[];
  harvestChecklist: string[];
  expectedHarvestDate: string;
  phaseDetails: {
    height: string;
    healthStatus: string;
    observations: string[];
  }[];
}

export interface Recommendation {
  crop: string;
  growthStage: string;
  issue: string;
  fertilizer: string;
  link: string;
}

export interface AppActivity {
  id: string;
  type: 'report_download' | 'chat_sent' | 'call_expert' | 'scan_completed';
  title: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

export interface AppNotification {
  id: string;
  type: 'weather' | 'crop_update' | 'market' | 'disease_alert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
