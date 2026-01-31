
import React, { useState, useRef, useEffect } from 'react';
import { FamilySettings } from './types';
import { getOnboardingResponse } from './gemini';
import { Sparkles, Send } from 'lucide-react';

const OnboardingWizard: React.FC<{ onComplete: (s: FamilySettings) => void }> = ({ onComplete }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await getOnboardingResponse([{ role: 'user', parts: [{ text: "Start" }] }]);
      if(res) setMessages([{ role: 'model', text: res }]);
    })();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!inputText.trim() || loading) return;
    const userMsg = inputText;
    setInputText('');
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    const res = await getOnboardingResponse([...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })), { role: 'user', parts: [{ text: userMsg }] }]);
    const jsonMatch = res?.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      onComplete(JSON.parse(jsonMatch[0]));
    } else if (res) {
      setMessages(prev => [...prev, { role: 'model', text: res }]);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex items-center justify-center p-4 z-[200]">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden h-[80vh] flex flex-col border">
        <div className="p-6 bg-violet-600 text-white font-bold flex gap-2"><Sparkles /> Willkommen bei FamFinance</div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, i) => <div key={i} className={`p-4 rounded-xl ${m.role === 'model' ? 'bg-slate-50' : 'bg-violet-600 text-white'}`}>{m.text}</div>)}
        </div>
        <form onSubmit={handleSend} className="p-6 border-t flex gap-2">
          <input value={inputText} onChange={e => setInputText(e.target.value)} className="flex-1 p-4 bg-slate-50 rounded-xl" placeholder="Antworten..." />
          <button type="submit" className="p-4 bg-violet-600 text-white rounded-xl"><Send /></button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingWizard;
