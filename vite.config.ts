import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

function geminiDevServerPlugin(): Plugin {
  return {
    name: 'gemini-dev-server-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/chat' && req.method === 'POST') {
          let bodyStr = '';
          req.on('data', (chunk) => {
            bodyStr += chunk;
          });
          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');
            try {
              const body = bodyStr ? JSON.parse(bodyStr) : {};
              const apiKey = process.env.GEMINI_API_KEY;

              if (!apiKey) {
                res.statusCode = 503;
                res.end(
                  JSON.stringify({
                    success: false,
                    error:
                      'Server-side GEMINI_API_KEY is not configured. Please set GEMINI_API_KEY in your server environment.',
                  })
                );
                return;
              }

              const { message, history = [], language = 'en', animalContext, sessionId } = body;

              const LANGUAGE_NAMES: Record<string, string> = {
                en: 'English',
                ta: 'Tamil (தமிழ்)',
                hi: 'Hindi (हिन्दी)',
                te: 'Telugu (తెలుగు)',
                kn: 'Kannada (ಕನ್ನಡ)',
                ml: 'Malayalam (മലയാളം)',
                bn: 'Bengali (বাংলা)',
                mr: 'Marathi (मराठी)',
                gu: 'Gujarati (ગુજરાતી)',
                pa: 'Punjabi (ਪੰਜਾਬੀ)',
                or: 'Odia (ଓଡ଼ିଆ)',
                as: 'Assamese (অসমীয়া)',
                ur: 'Urdu (اردو)',
                sa: 'Sanskrit (संस्कृतम्)',
                ne: 'Nepali (नेपाली)',
                kok: 'Konkani (कोंकणी)',
                ks: 'Kashmiri (کٲشُر)',
                sd: 'Sindhi (سنڌي)',
                mai: 'Maithili (मैथिली)',
                mni: 'Manipuri (মৈতৈলোন্)',
                tanglish: 'Tanglish (Tamil in English Script)',
              };

              const targetLanguageName = LANGUAGE_NAMES[language] || language;

              const systemPrompt = `You are Dairy Nova AI, an expert, empathetic, and highly specialized dairy cattle and buffalo advisory intelligence assistant created for Indian dairy farmers and cooperative officers.

CORE DOMAIN KNOWLEDGE & EXPERTISE:
1. Dairy Cattle & Buffalo Health:
   - Indigenous zebu cow breeds (Gir, Sahiwal, Red Sindhi, Tharparkar, Kankrej, Ongole, Kangayam, Rathi, Punganur, Vechur, etc.) and crossbreeds (HF Cross, Jersey Cross).
   - Indian buffalo breeds (Murrah, Nili-Ravi, Jaffarabadi, Surti, Mehsana, Bhadawari, Banni, etc.).
   - Common diseases & signs: Foot & Mouth Disease (FMD), Mastitis (clinical & subclinical), Hemorrhagic Septicemia (HS), Black Quarter (BQ), Theileriosis, Babesiosis, Lumpy Skin Disease (LSD), Brucellosis, Ketosis, Milk Fever (Hypocalcemia), Bloat/Acidosis.
   - Vaccination protocols and booster schedules.
2. Scientific Nutrition & Feed Management (ICAR-NIANP & NRC standards):
   - High-energy green fodders (Super Napier CO-5, Maize, Sorghum, Lucerne/Alfalfa, Berseem, Cowpea, Hybrid Napier).
   - Dry roughage (Paddy straw, Wheat straw, Ragi straw) and Urea Ammoniation treatment.
   - Concentrate formulation: Balanced cattle feed pellets, bypass protein, mustard cake, cottonseed cake, mineral mixture (50g/day), and common salt.
   - Dry Matter (DM), Crude Protein (CP), and Total Digestible Nutrients (TDN) balancing according to lactation stage and body weight.
3. Silage Fermentation & Quality Control:
   - Optimal silage pH (3.8 - 4.2 for corn/sorghum silage).
   - Moisture management (65-70% optimal, avoid >75% effluent loss or clostridial/butyric spoilage).
   - Temperature monitoring (<30°C optimal; >40°C indicates aerobic spoilage / yeast mould).
   - Mycotoxins (Aflatoxin B1/M1) prevention and safe bunker packing/anaerobic sealing.
4. Milk Production & Farm Operations:
   - Milking hygiene, clean milk production, California Mastitis Test (CMT), post-milking teat dipping.
   - Peak yield management, dry period management, transition feeding (3 weeks pre & post calving).
   - Heat/estrus detection (standing heat, AM-PM insemination rule), artificial insemination, and pregnancy care.

CRITICAL RESPONSE GUIDELINES:
1. DIRECTNESS & RELEVANCE: Answer the user's exact question directly and practically. Avoid generic or repetitive boilerplate.
2. CONTEXT AWARENESS: Utilize multi-turn conversation history and any provided animal context (e.g. tag ID, breed, daily yield).
3. FARMER-FRIENDLY TONE: Keep advice practical, actionable, easy to understand, and respectful of traditional dairy farming wisdom.
4. LANGUAGE ADHERENCE: ALWAYS respond in the user's selected language. If Tamil is selected, respond completely in natural, accurate Tamil. If Hindi, respond in Hindi. If Tanglish, respond in Tanglish.
5. VETERINARY SAFETY: For severe symptoms (high fever >40°C, acute mastitis, downer cow, bloody diarrhea, respiratory distress), provide immediate first-aid guidance and clearly advise urgent physical examination by a certified veterinarian. Never provide false certainty on life-threatening conditions.`;

              const contents: any[] = [];
              let systemContextText = `${systemPrompt}\n\nIMPORTANT LANGUAGE INSTRUCTION: The user has chosen ${targetLanguageName} (${language}). You MUST write your entire response in ${targetLanguageName}.`;

              if (animalContext) {
                systemContextText += `\n\nACTIVE CATTLE CONTEXT: The user is currently inspecting Cattle Name: "${animalContext.name || 'Cattle'}", Tag ID: "${animalContext.tag || 'N/A'}", Species/Breed: "${animalContext.type || ''} ${animalContext.breed || ''}", Daily Yield: ${animalContext.dailyMilkYieldL || 'N/A'} L/day, Weight: ${animalContext.weightKg || 'N/A'} kg, Health: ${animalContext.healthStatus || 'Healthy'}. If the user's query relates to their animal, refer to this specific cattle context appropriately.`;
              }

              for (const item of (history || []).slice(-8)) {
                contents.push({
                  role: item.sender === 'user' ? 'user' : 'model',
                  parts: [{ text: item.text }],
                });
              }

              const currentUserText = contents.length === 0
                ? `${systemContextText}\n\nUser Question:\n${message}`
                : `[System Note: Maintain response in ${targetLanguageName}]\n${message}`;

              contents.push({
                role: 'user',
                parts: [{ text: currentUserText }],
              });

              const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash'];
              let replyText = '';
              let lastError: any = null;

              for (const model of modelsToTry) {
                try {
                  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
                  const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      contents,
                      generationConfig: {
                        temperature: 0.4,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                      },
                    }),
                  });

                  if (!response.ok) {
                    const errJson: any = await response.json().catch(() => ({}));
                    throw new Error(errJson?.error?.message || `Gemini API error ${response.status}`);
                  }

                  const data: any = await response.json();
                  replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                  if (replyText) break;
                } catch (e) {
                  lastError = e;
                }
              }

              if (!replyText) {
                throw new Error(lastError?.message || 'Failed to generate response from Gemini AI.');
              }

              const suggested_questions = [
                language === 'ta' ? 'தீவன ஊட்டச்சத்து விகிதம் என்ன?' : language === 'hi' ? 'दैनिक आहार अनुपात क्या होना चाहिए?' : 'What is the optimal daily ration formula?',
                language === 'ta' ? 'அடுத்த தடுப்பூசி எப்போது செலுத்த வேண்டும்?' : language === 'hi' ? 'अगला टीकाकरण कब दे सकते हैं?' : 'When is the next vaccination booster due?',
                language === 'ta' ? 'சைலேஜ் தரம் பரிசோதிப்பது எப்படி?' : language === 'hi' ? 'साइलेज की गुणवत्ता कैसे जांचें?' : 'How do I test my silage fermentation quality?',
              ];

              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  success: true,
                  reply: replyText.trim(),
                  suggested_questions,
                  session_id: sessionId || `sess_${Date.now()}`,
                  language,
                })
              );
            } catch (err: any) {
              res.statusCode = 500;
              res.end(
                JSON.stringify({
                  success: false,
                  error: err?.message || 'Internal Server Error during Gemini chat processing.',
                })
              );
            }
          });
          return;
        }

        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Load server-side environment variables into process.env for local development middleware
  Object.assign(process.env, env);

  return {
    plugins: [react(), geminiDevServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      open: true,
    },
  };
});
