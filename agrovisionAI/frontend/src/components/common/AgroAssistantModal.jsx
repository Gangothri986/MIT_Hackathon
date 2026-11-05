import React, { useState } from 'react';
import { Bot, X, Send, Sparkles, Sprout, ShieldAlert, Thermometer, CheckCircle2 } from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'How does GDD predict tomato flowering?',
  'What are the immediate protocols for Early Blight?',
  'How will 28mm rainfall affect the chilli crop in Plot C?',
  'Explain the 6 developmental growth stages in AgroVision AI.',
];

const BOT_KNOWLEDGE_BASE = {
  gdd: `Growing Degree Days (GDD) quantify thermal heat accumulation driving plant development. For tomato (Base Temp = 10°C):
• GDD = ((T_max + T_min) / 2) - T_base
• Tomato requires ~400 GDD for vegetative closure, ~650 GDD to initiate flowering, and ~1400 GDD for complete fruit ripening. In standard weather conditions (~16.5 GDD/day), plants reach the next milestone approximately 4 to 8 days from now.`,

  blight: `Early Blight fungal protocol:
1. Sanitation: Prune lower diseased leaves with clean shears. Do not leave infected leaves on the soil.
2. Bio-fungicide: Apply Trichoderma or Bacillus subtilis spray during evening hours.
3. Chemical treatment: If disease spots spread, rotate with Mancozeb 75% WP @ 2.5 g/L or Azoxystrobin @ 1 ml/L.
4. Moisture Management: Avoid overhead watering; keep leaves dry so fungal spores cannot germinate.`,

  rainfall: `Impact of 28mm forecasted rain on Chilli (Plot C):
• Chilli plants are sensitive to standing water around roots (hypoxia), which can cause flower drop.
• Action: Open side drainage furrows so excess water drains out within 3-4 hours. Pause automatic watering until the soil dries.`,

  stages: `AgroVision AI monitors six discrete crop growth stages:
1. Seedling: Emergence of first leaves and root anchorage.
2. Vegetative Growth: Rapid stem branching and leaf canopy expansion.
3. Bud Formation: Tiny flower buds appear on branch tips.
4. Flowering: Open blossom pollination.
5. Fruit Formation: Young fruit swelling and seed fill.
6. Maturity / Harvesting: Color change, softening, and peak harvest readiness.`,
};

export default function AgroAssistantModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am AgroBot, your AI Farming Assistant. Ask me anything regarding plant growth stages, disease symptoms, GDD calculations, or upcoming weather risks.',
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = (textToSend = input) => {
    const text = textToSend.trim();
    if (!text) return;

    const userMsg = {
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      const lower = text.toLowerCase();
      if (lower.includes('gdd') || lower.includes('degree') || lower.includes('thermal')) {
        reply = BOT_KNOWLEDGE_BASE.gdd;
      } else if (lower.includes('blight') || lower.includes('disease') || lower.includes('fungal')) {
        reply = BOT_KNOWLEDGE_BASE.blight;
      } else if (lower.includes('rain') || lower.includes('water') || lower.includes('chilli')) {
        reply = BOT_KNOWLEDGE_BASE.rainfall;
      } else if (lower.includes('stage') || lower.includes('growth') || lower.includes('six')) {
        reply = BOT_KNOWLEDGE_BASE.stages;
      } else {
        reply = `For optimal crop yield in ${text.slice(0, 30)}, maintain soil moisture between 30-35% and monitor your plant growth milestones. Consider scheduling any foliar fertilizer sprays during early morning (07:00-09:00) before midday heat sets in.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[580px] max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#0B241B] text-white flex items-center justify-between border-b border-[#164433]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#16A36A] to-[#0B3B26] flex items-center justify-center text-[#B7E46A] shadow">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-sm tracking-tight text-white">AgroBot Farming Assistant</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-800/80 text-emerald-200 font-mono">AI Guide</span>
              </div>
              <p className="text-xs text-emerald-300/80">Crop health & agronomy questions answered</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-[#123B2A] transition-colors"
            title="Close Assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 overflow-x-auto flex items-center gap-2 text-xs no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">Suggested:</span>
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#F7F8F2]/50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-[#123B2A] text-[#B7E46A] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-2xs ${
                  m.sender === 'user'
                    ? 'bg-[#16A36A] text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none whitespace-pre-line'
                }`}
              >
                <p>{m.text}</p>
                <div
                  className={`mt-1 text-[10px] ${
                    m.sender === 'user' ? 'text-emerald-100 text-right' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-[#123B2A] text-[#B7E46A] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 text-xs text-slate-500 rounded-tl-none flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse delay-150" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse delay-300" />
                <span className="ml-1 text-[11px]">Consulting crop knowledge base...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about growth stages, leaf diseases, GDD, or watering..."
              className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition-all text-slate-900"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 rounded-xl bg-[#123B2A] text-white hover:bg-[#16A36A] disabled:opacity-40 transition-colors shadow-sm"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span>Powered by AgroVision AI Knowledge Base</span>
            <span>Simple Smart Farming</span>
          </div>
        </div>
      </div>
    </div>
  );
}
