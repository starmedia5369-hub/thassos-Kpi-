
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

const AiAssistantChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'مرحباً بك في وحدة التحليل الاستراتيجي لشركة ثاسس. كيف يمكنني مساعدتك في تحليل البيانات أو حل المشكلات اليوم؟ (أنا أحلل ولا أحكم)' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: "أنت المساعد الاستراتيجي الذكي لشركة ثاسس (Thassos). دورك هو تحليل البيانات التشغيلية، تقديم اقتراحات لحل المشكلات، وشرح التقارير. فلسفتك هي 'أنا أحلل ولا أحكم'، بمعنى أنك تقدم المعلومات والحقائق والاحتمالات بموضوعية تامة دون إصدار أحكام إدارية أو قرارات نيابة عن القيادة. لغتك عربية رسمية، سيادية، ومختصرة.",
        }
      });
      
      setMessages(prev => [...prev, { role: 'ai', text: response.text || 'عذراً، لم أتمكن من معالجة الطلب.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'حدث خطأ في الاتصال بالمخدم الذكي.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 left-10 w-20 h-20 bg-brand-accent text-brand-primary rounded-full shadow-5xl z-[1000] flex items-center justify-center text-3xl hover:scale-110 transition-all border-4 border-white animate-bounce-slow"
      >
        🔮
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 left-10 w-[450px] h-[650px] bg-brand-primary rounded-[3rem] shadow-6xl z-[1000] flex flex-col overflow-hidden border-2 border-brand-accent/30 animate-fade-in backdrop-blur-3xl">
      {/* Header */}
      <div className="p-8 bg-brand-accent/10 border-b border-brand-accent/20 flex justify-between items-center">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-brand-accent/20 rounded-2xl flex items-center justify-center text-2xl">🔮</div>
           <div>
              <h3 className="text-white font-black text-lg">المستشار الاستراتيجي</h3>
              <p className="text-[10px] text-brand-accent font-bold uppercase tracking-widest">Logic Analysis Unit</p>
           </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white opacity-50 hover:opacity-100 text-2xl">✕</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-6 rounded-[2rem] text-sm leading-relaxed ${
              m.role === 'user' 
              ? 'bg-brand-accent text-brand-primary font-black rounded-tr-none' 
              : 'bg-white/5 text-white border border-white/10 rounded-tl-none font-medium italic'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 p-4 rounded-full flex gap-2">
              <div className="w-2 h-2 bg-brand-accent rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-brand-accent rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-brand-accent rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-8 bg-black/20 border-t border-white/5">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="اسأل المستشار عن أي بيانات أو مشاكل..."
            className="w-full bg-white/5 border border-white/10 p-5 pr-14 rounded-2xl text-white outline-none focus:border-brand-accent transition-all text-sm font-bold"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-accent text-xl hover:scale-110 transition-all disabled:opacity-20"
          >
            🚀
          </button>
        </div>
        <p className="text-[9px] text-center text-gray-500 mt-4 uppercase font-black tracking-widest">يحلل ولا يحكم • Strategic Data Assistant</p>
      </div>
    </div>
  );
};

export default AiAssistantChat;
