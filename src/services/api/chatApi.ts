import { apiFetch, delay } from './apiHelper';
import { AI_CHAT_RESPONSES } from '../../mocks/mockResponses';

export interface ChatApiResult {
  response: string;
  suggestedFollowUps: string[];
  sessionId?: string;
  language?: string;
  detectedLanguage?: string;
  intent?: string;
  isOffline?: boolean;
}

export const chatApi = {
  async sendMessage(
    question: string,
    options?: {
      language?: string;
      sessionId?: string;
      userId?: string;
      animalContext?: { id: string; tag: string; name: string };
    }
  ): Promise<ChatApiResult> {
    const selectedLang = options?.language || 'en';
    const sessionId = options?.sessionId;
    const userId = options?.userId;
    const animalContext = options?.animalContext;
    const isOffline = !navigator.onLine;

    // Enhance prompt with animal context if provided
    let messageToSend = question;
    if (animalContext) {
      messageToSend = `[Animal Context: ${animalContext.name} (Tag: ${animalContext.tag})] ${question}`;
    }

    if (!isOffline) {
      // Call real FastAPI backend at POST /api/v1/chat
      const result = await apiFetch<{
        success: boolean;
        reply: string;
        language?: string;
        detected_language?: string;
        intent?: string;
        module?: string;
        session_id?: string;
        metadata?: {
          suggested_questions?: string[];
          intent_confidence?: number;
        };
      }>('/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: messageToSend,
          language: selectedLang,
          session_id: sessionId || undefined,
          user_id: userId || undefined,
        }),
      });

      if (result && result.reply) {
        return {
          response: result.reply,
          suggestedFollowUps: result.metadata?.suggested_questions || [
            'How do I test my feed quality?',
            'Is my corn silage safe for cattle?',
            'Recommend daily ration for my lactating cow',
          ],
          sessionId: result.session_id,
          language: result.language,
          detectedLanguage: result.detected_language,
          intent: result.intent,
          isOffline: false,
        };
      }
    }

    // Explicit Offline Rule-Based Fallback (Only when offline)
    await delay(300);
    const q = question.toLowerCase();

    if (animalContext && (q.includes('this animal') || q.includes('she') || q.includes('her') || q.includes(animalContext.tag.toLowerCase()))) {
      return {
        response: `[Offline Mode] Regarding **${animalContext.name} (${animalContext.tag})**:
• **Lactation & Nutrition:** Ensure 60% green fodder and 40% dry matter with balanced mineral supplementation.
• **Health Routine:** Keep vaccination schedules updated and maintain clean stall bedding.

*Guidance generated via offline rules. Connect to internet for live AI consultation.*`,
        suggestedFollowUps: [
          `When is ${animalContext.name}'s next vaccination?`,
          `Recommend feed ration for ${animalContext.name}`,
        ],
        isOffline: true,
      };
    }

    const matched = AI_CHAT_RESPONSES.find((r) => r.match(q));
    if (matched) {
      return {
        response: `[Offline Mode] ${matched.response}`,
        suggestedFollowUps: [
          'How do I test feed quality?',
          'Is my corn silage safe to feed?',
        ],
        isOffline: true,
      };
    }

    return {
      response: `[Offline Mode] In dairy cattle management, maintaining high-energy dry matter intake (60% quality green fodder, 30% dry roughage, and 10% balanced concentrate pellets) alongside 24/7 ad-libitum clean drinking water is vital for optimal milk production and rumen health.

Connect to the internet to chat live with Dairy Nova AI.`,
      suggestedFollowUps: [
        'How do I test feed quality?',
        'Is my corn silage safe to feed?',
      ],
      isOffline: true,
    };
  },
};
