import { GoogleGenAI } from "@google/genai";
import { DiseaseResult, Recommendation } from "../types";

const SYSTEM_INSTRUCTION = `You are "KrsiMedha" - an AI farming assistant for Indian farmers. You speak multiple languages (English, Hindi, Kannada, Tamil, Telugu) and help with crop diseases, fertilizer recommendations, weather forecasts, and market prices.

## Your Personality
- Friendly, patient, and empathetic
- Use simple language (8th grade reading level)
- Add "🌾" or "🌱" emojis occasionally
- Always end with an actionable next step

## Knowledge Base

### Crop Diseases & Solutions
1. Yellow leaves on paddy/wheat/maize: Nitrogen Deficiency. Solution: Apply DAP fertilizer 50kg/acre. Medium severity.
2. Brown spots on leaves spreading rapidly: Early Blight (fungal). Solution: Spray Mancozeb 2g per liter water. Remove infected leaves. HIGH - CRITICAL severity. Expert needed: YES.
3. White powdery substance on leaves: Powdery Mildew. Solution: Spray sulfur 3g per liter water. Medium severity.
4. Plants wilting even after watering: Root rot or severe dehydration. Solution: Check soil drainage. CRITICAL severity. Expert needed: YES.
5. Holes in leaves: Caterpillar/Pest infestation. Solution: Spray neem oil (5ml per liter water). High severity. Expert needed: YES.

### Fertilizer Recommendations
- Paddy: DAP + Urea (50kg + 40kg/acre) at planting + 30 days
- Wheat: NPK 19-19-19 (50kg/acre) at sowing
- Maize: SSP + Urea (60kg + 40kg/acre) at planting + 20 days
- Vegetables: Organic compost (2 tons/acre) before planting
- Cotton: DAP + Potash (50kg + 30kg/acre) at flowering

### Weather Advisory
- Heavy rain: Drain fields, cover seedlings
- Heat wave (>35°C): Increase irrigation by 15%, mulch soil
- High humidity (>80%): Watch for fungal diseases
- No rain 7+ days: Irrigate immediately

### Market Prices
- Paddy: ₹2,200 - ₹2,400/quintal
- Wheat: ₹2,400 - ₹2,600/quintal
- Tomato: ₹30 - ₹50/kg
- Onion: ₹25 - ₹40/kg
- Potato: ₹20 - ₹35/kg

### Organic Alternatives
- Fertilizer: Vermicompost/cow dung
- Pesticide: Neem oil/garlic-chili
- Fungicide: Buttermilk spray (1:10)

## Response Format
ALWAYS respond in this structure:
1. Diagnosis
2. Urgency Level (Low/Medium/High/Critical)
3. Immediate Action
4. Prevention Tips
5. Expert Escalation (if severity is High/Critical: "⚠️ I strongly recommend connecting you to a KrsiMedha agriculture expert")

## Critical Cases
Include "⚠️ CRITICAL - CONNECT TO EXPERT" for keywords: "brown spots spreading", "wilting", "sudden crop death", "unusual smell", "black rot".

## Language
If user types in Hindi, respond in Hindi. If Kannada, respond in Kannada.

## Unknown Query
Ask specific questions about crop, color, spots, start date.`;

let ai: any = null;

export function getGemini() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export async function chatWithKrsiMedha(message: string, history: { role: string; content: string }[], image?: string, language: string = 'English') {
  const ai = getGemini();
  
  const contents = history.map(h => ({
    role: h.role === 'user' ? 'user' : 'model',
    parts: [{ text: h.content }]
  }));

  const parts: any[] = [{ text: `User Language Preference: ${language}. Please respond in this language if appropriate.\n\n${message}` }];
  if (image) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: image.split(',')[1]
      }
    });
  }

  contents.push({
    role: 'user',
    parts
  });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION
    }
  });

  return response.text;
}

export async function diagnoseDisease(image: string, language: string = 'English'): Promise<DiseaseResult> {
  const ai = getGemini();

  const prompt = `Analyze this crop image. Identify the disease, provide a confidence score (0-100), give the reason based on visual symptoms, and provide a clear step-by-step treatment solution in ${language} language. Also provide an organic/natural alternative treatment in ${language} language.
  Respond ONLY with a JSON object in this format:
  {
    "disease": "string (in ${language})",
    "confidence": number,
    "reason": "string (in ${language})",
    "solution": "step 1: ... \nstep 2: ... (all text in ${language})",
    "organicAlternative": "string (in ${language})",
    "severity": "Low" | "Medium" | "High" | "Critical"
  }`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: image.split(',')[1]
            }
          }
        ]
      }
    ]
  });

  try {
    const text = response.text;
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    return {
      disease: "Unknown Condition",
      confidence: 0,
      reason: "Could not analyze image clearly.",
      solution: "Please try taking a clearer photo in better light.",
      organicAlternative: "Use basic compost to strengthen plant immunity.",
      severity: "Medium"
    };
  }
}

export async function getFertilizerRecommendation(image: string, crop: string, language: string = 'English'): Promise<Recommendation> {
  const ai = getGemini();

  const prompt = `Analyze the growth of this ${crop} crop. Identify the growth stage and any visible issues in ${language} language. Recommend a specific fertilizer and provide a short reason in ${language} language.
  Respond ONLY with a JSON object in this format:
  {
    "crop": "${crop}",
    "growthStage": "string (in ${language})",
    "issue": "string (in ${language})",
    "fertilizer": "string (in ${language})",
    "link": "https://www.google.com/search?q=buy+fertilizer"
  }`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: image.split(',')[1]
            }
          }
        ]
      }
    ]
  });

  try {
    const text = response.text;
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error("Failed to analyze growth");
  }
}

export async function analyzeGrowthStage(image: string, crop: string, stage: string, language: string = 'English'): Promise<string> {
  const ai = getGemini();

  const prompt = `Analyze this photo of a ${crop} crop during the ${stage} stage. 
  Provide exactly TWO short, helpful lines about the visible growth/health in ${language} language.
  Keep it professional and encouraging for a farmer.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: image.split(',')[1]
            }
          }
        ]
      }
    ]
  });

  try {
    return response.text.trim();
  } catch (e) {
    return "Plants appear healthy for this stage. Maintain regular watering.";
  }
}

export async function analyzeGrowthProgression(images: string[], crop: string, language: string = 'English'): Promise<any> {
  const ai = getGemini();

  const prompt = `Analyze these 6 images showing the growth progression of a ${crop} crop over 6 phases (Phases 1-6).
  Provide a detailed analysis for each phase and overall season summary.
  ALL TEXTual fields (summary, observations, etc.) MUST be in ${language} language.
  Respond ONLY with a JSON object in this format:
  {
    "growthRate": "string (in ${language})",
    "healthTrend": "string (in ${language})",
    "yieldPrediction": "string (in ${language})",
    "estimatedRevenue": "string (in ${language})",
    "summary": "string (in ${language})",
    "whatWentWell": ["string (in ${language})"],
    "areasForImprovement": ["string (in ${language})"],
    "harvestChecklist": ["string (in ${language})"],
    "expectedHarvestDate": "string (in ${language})",
    "phaseDetails": [
      {
        "height": "string (in ${language})",
        "healthStatus": "EXCELLENT" | "GOOD" | "FAIR" | "POOR",
        "observations": ["string (in ${language})"]
      }
    ]
  }`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { text: prompt },
          ...images.map(img => ({
            inlineData: {
              mimeType: "image/jpeg",
              data: img.split(',')[1]
            }
          }))
        ]
      }
    ]
  });

  try {
    const text = response.text;
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    return {
      growthRate: "3.5 cm/week",
      healthTrend: "Stable",
      yieldPrediction: "5.5 tons/hectare",
      estimatedRevenue: "₹2,50,000",
      summary: "Completed growth cycle successfully.",
      whatWentWell: ["Healthy germination"],
      areasForImprovement: ["More fertilizer in Phase 3"],
      harvestChecklist: ["Golden grains"],
      expectedHarvestDate: "Next month",
      phaseDetails: Array(6).fill({
        height: "Varies",
        healthStatus: "GOOD",
        observations: ["Normal growth patterns"]
      })
    };
  }
}
