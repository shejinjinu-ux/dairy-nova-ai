import React, { useState, useEffect, useRef } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { chatApi } from '../../services/api/chatApi';
import { ChatMessage, Animal } from '../../types';
import { AIThinkingState } from '../../components/ai/AIThinkingState';
import { VoiceInput } from '../../components/common/VoiceInput';
import { ReadAloudButton } from '../../components/common/ReadAloudButton';
import { SourceTag } from '../../components/common/SourceTag';
import {
  ArrowLeft,
  Sparkles,
  Send,
  User,
  RefreshCw,
  X,
  Volume2,
  ShieldAlert,
  Bot,
} from 'lucide-react';

export const DairyNovaAIChatScreen: React.FC = () => {
  const { goBack, chatAnimalContext } = useAppData();
  const { language, t } = useLanguage();
  const { user } = useAuth();

  const [sessionId, setSessionId] = useState<string>(() => `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: `Hello! I am Dairy Nova AI, your 24/7 personal dairy assistant. I can help you analyze herd health telemetry, calculate fodder ration formulations, interpret silage sensor data, forecast milk yields, and verify disease symptoms.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowUps: [
        "How is my animal's health?",
        'Which vaccinations are due this week?',
        'Is my corn silage safe?',
        'Why has milk production decreased?',
      ],
    },
  ]);

  const [inputText, setInputText] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [activeAnimalContext, setActiveAnimalContext] = useState<Animal | null>(chatAnimalContext);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      animalContext: activeAnimalContext
        ? {
            id: activeAnimalContext.id,
            tag: activeAnimalContext.tagId,
            name: activeAnimalContext.name,
          }
        : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    try {
      const result = await chatApi.sendMessage(text, {
        language,
        sessionId,
        userId: user?.id,
        animalContext: activeAnimalContext
          ? {
              id: activeAnimalContext.id,
              tag: activeAnimalContext.tagId,
              name: activeAnimalContext.name,
            }
          : undefined,
      });

      if (result.sessionId) {
        setSessionId(result.sessionId);
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: result.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: result.suggestedFollowUps,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: err?.message || 'Connecting to Dairy Nova AI… If the AI service is waking up, please wait a moment and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 h-full relative">
      
      {/* Full-screen AI Header */}
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center active:scale-95 transition hover:bg-slate-200"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-teal-600 to-dairy-600 text-white flex items-center justify-center shadow-md shadow-teal-600/30">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                Dairy Nova AI
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h1>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                Online • AI Herd Specialist
              </span>
            </div>
          </div>
        </div>

        <SourceTag source="AI Screening" />
      </header>

      {/* Pre-loaded Animal Context Banner */}
      {activeAnimalContext && (
        <div className="bg-teal-50 dark:bg-teal-950/70 px-4 py-2 border-b border-teal-200 dark:border-teal-800 flex items-center justify-between text-xs shrink-0 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            <span className="text-teal-900 dark:text-teal-200 font-semibold">
              Active Context: <strong>{activeAnimalContext.name} ({activeAnimalContext.tagId})</strong> • {activeAnimalContext.breed}
            </span>
          </div>
          <button
            onClick={() => setActiveAnimalContext(null)}
            className="text-teal-600 hover:text-teal-800 dark:text-teal-300 p-0.5"
            title="Clear animal context"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs custom-scrollbar">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1 animate-fadeIn`}
            >
              <div className={`flex items-start gap-2 max-w-[88%] sm:max-w-[82%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs shadow-sm ${
                  isUser
                    ? 'bg-dairy-600 text-white'
                    : 'bg-gradient-to-tr from-teal-600 to-dairy-600 text-white'
                }`}>
                  {isUser ? <User size={14} /> : <Bot size={15} />}
                </div>

                {/* Message Bubble */}
                <div className={`p-3.5 rounded-3xl space-y-2 leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-dairy-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/80 dark:border-slate-800'
                }`}>
                  <p className="whitespace-pre-line text-xs font-normal">{msg.text}</p>

                  {/* Read Aloud button for AI messages */}
                  {!isUser && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
                      <ReadAloudButton textToRead={msg.text} size="sm" />
                      <span className="text-[9px] text-slate-400 font-mono">{msg.timestamp}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Timestamp for user */}
              {isUser && (
                <span className="text-[9px] text-slate-400 font-mono pr-9">{msg.timestamp}</span>
              )}

              {/* Suggested Follow-up Chips */}
              {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pl-9 pt-1">
                  {msg.suggestedFollowUps.map((chip, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(chip)}
                      className="px-2.5 py-1 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/70 dark:hover:bg-teal-900 text-teal-800 dark:text-teal-300 text-[11px] font-semibold border border-teal-200 dark:border-teal-800 active:scale-95 transition text-left"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Thinking State */}
        {isThinking && <AIThinkingState message="Dairy Nova AI is analyzing herd telemetry..." />}

        <div ref={messagesEndRef} />
      </div>

      {/* Safety Callout */}
      <div className="px-4 py-1.5 bg-slate-100 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 text-slate-500 text-[10px] flex items-center justify-center gap-1.5 shrink-0">
        <ShieldAlert size={12} className="text-amber-500" />
        <span>{t.aiSafetyDisclaimer}</span>
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <VoiceInput
            onTranscript={(transcript) =>
              setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript))
            }
          />

          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask Dairy Nova AI about animals, feed, milk..."
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isThinking}
            className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-dairy-600 hover:from-teal-500 hover:to-dairy-500 disabled:opacity-40 text-white flex items-center justify-center shadow-md shadow-teal-600/30 active:scale-95 transition shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

    </div>
  );
};
