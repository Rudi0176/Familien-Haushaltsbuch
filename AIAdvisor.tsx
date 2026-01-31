
import React, { useState, useRef, useEffect } from 'react';
import { Transaction, FamilySettings } from './types';
import { getFinancialAdvice } from './gemini';
import { Sparkles, Send, Bot, User, Loader2 } from 'lucide-react';

const AIAdvisor: React.FC<{ transactions: Transaction[], settings: FamilySettings }> = ({ transactions, settings }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;
    const userMsg = inputText;
    setInputText('');
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    const context = `Profil: ${settings.familyName}, ${settings.adults} Erw., ${settings.children} Kinder. Ziel: ${settings.monthlySavingsGoal}€.`;
    const res = await getFinancialAdvice([...messages, { role: 'user', text: userMsg }], "Daten analysiert", context);
    setMessages(prev => [...prev, { role: 'model', text: res }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[70vh] max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border">
      <div className="bg-violet-600 p-6 text-white flex items-center gap-3"><Sparkles /><h2 className="font-bold">Finanz-Mentor</h2></div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
             <div className={`p-4 rounded-xl text-sm ${m.role === 'user' ? 'bg-violet-600 text-white' : 'bg-slate-50'}`}>{m.text}</div>
          </div>
        ))}
        {loading && <div className="text-slate-400 italic text-xs">Analysiere Profile...</div>}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSend} className="p-6 border-t flex gap-3">
        <input value={inputText} onChange={e => setInputText(e.target.value)} className="flex-1 p-4 bg-slate-50 rounded-xl" placeholder="Frag mich was..." />
        <button type="submit" className="p-4 bg-violet-600 text-white rounded-xl"><Send /></button>
      </form>
    </div>
  );
};

export default AIAdvisor;
