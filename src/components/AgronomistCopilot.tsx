import React, { useState } from 'react';
import { FarmZone } from '../types/agriculture';
import { Bot, Send, Sparkles, CornerDownLeft } from 'lucide-react';

interface AgronomistCopilotProps {
  activeZone: FarmZone;
}

export const AgronomistCopilot: React.FC<AgronomistCopilotProps> = ({ activeZone }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: `Hello! I am your AI Agronomist Copilot, continuously synced with **${activeZone.name}** IoT telemetry.\n\nCurrent metrics: **${activeZone.telemetry.soilMoisture}%** Soil Moisture, **${activeZone.telemetry.ambientTemp}°C** Air Temp, **${activeZone.telemetry.humidity}%** RH, and **${activeZone.telemetry.nitrogen} mg/kg** available Nitrogen.\n\nHow can I optimize your crop yield, irrigation valves, or nutrient schedules today?`,
      time: 'Just now',
    },
  ]);

  const quickPrompts = [
    `Optimize irrigation runtime for ${activeZone.crop} given current moisture (${activeZone.telemetry.soilMoisture}%)`,
    `Calculate nutrient fertigation dosage for Nitrogen (${activeZone.telemetry.nitrogen} mg/kg)`,
    `Evaluate disease risk for current humidity (${activeZone.telemetry.humidity}%) & leaf wetness`,
    `Recommend soil pH adjustment to improve phosphorus bioavailability`,
  ];

  const handleSend = async (userText: string) => {
    if (!userText.trim()) return;

    const userMessage = {
      sender: 'user' as const,
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversation((prev) => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const response = await fetch('/api/agronomy-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userText,
          activeZone: {
            id: activeZone.id,
            name: activeZone.name,
            crop: activeZone.crop,
            areaAcres: activeZone.areaAcres,
            growthStage: activeZone.growthStage,
          },
          telemetry: activeZone.telemetry,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch advisory');
      }

      const aiMessage = {
        sender: 'ai' as const,
        text: data.answer || 'Recommendation successfully generated based on current telemetry.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setConversation((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Agronomy advisory error:', err);
      const errorMessage = {
        sender: 'ai' as const,
        text: 'Error generating advisory. Please ensure your query is formulated clearly or retry.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setConversation((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-700 font-mono mb-1 font-semibold">
            <span>AGRONOMIC DECISION SUPPORT</span>
            <span aria-hidden="true">·</span>
            <span>Gemini 3.8 Flash Assistant</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            AI Agronomist Copilot & Irrigation Advisor
          </h2>
        </div>

        <div className="text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
          Telemetry Context: <strong className="text-slate-900">{activeZone.name}</strong> · Moisture: {activeZone.telemetry.soilMoisture}%
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Quick Agronomic Inquiries:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((promptText, i) => (
            <button
              key={i}
              onClick={() => handleSend(promptText)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-emerald-500/50 hover:bg-emerald-50/50 text-slate-700 transition-colors cursor-pointer text-left shadow-2xs"
            >
              {promptText}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2 mb-4 p-4 rounded-xl bg-slate-50 border border-slate-200/90">
        {conversation.map((msg, index) => {
          const isAi = msg.sender === 'ai';
          return (
            <div
              key={index}
              className={`flex gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
            >
              {isAi && (
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl p-4 text-xs leading-relaxed shadow-2xs ${
                  isAi
                    ? 'bg-white border border-slate-200 text-slate-800'
                    : 'bg-emerald-600 text-white font-medium shadow-xs'
                }`}
              >
                <div className="whitespace-pre-line space-y-1">{msg.text}</div>
                <div
                  className={`text-[10px] mt-2 font-mono ${
                    isAi ? 'text-slate-400' : 'text-emerald-100'
                  }`}
                >
                  {msg.time}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-500 flex items-center gap-2 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Analyzing agronomy parameters & calculating recommendation...</span>
            </div>
          </div>
        )}
      </div>

      {/* Query Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(query);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Ask the agronomist about ${activeZone.crop}, drip fertigation, or disease prevention...`}
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <span>Send</span>
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
