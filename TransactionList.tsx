
import React, { useState } from 'react';
import { Transaction, TransactionType } from './types';
import { Trash2, Search, RefreshCw, Edit2, Sparkles, PlusCircle } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (t: Transaction) => void;
}

const TransactionList: React.FC<Props> = ({ transactions, onDelete, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyRecurring, setShowOnlyRecurring] = useState(false);
  
  const filtered = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRecurring = showOnlyRecurring ? t.isRecurring : true;
    return matchesSearch && matchesRecurring;
  });

  const formatter = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 mb-6 no-print">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Verlauf</h2>
          <button onClick={() => setShowOnlyRecurring(!showOnlyRecurring)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${showOnlyRecurring ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border'}`}>
            {showOnlyRecurring ? 'Alle' : 'Nur Fixkosten'}
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Suchen..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden min-h-[400px]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center h-full">
            <PlusCircle size={48} className="text-indigo-200 mb-4" />
            <p className="text-slate-500 font-bold">Keine Einträge. Fang jetzt an!</p>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map(t => (
              <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <p className="font-semibold text-sm">{t.description}</p>
                  <p className="text-[10px] text-slate-400 uppercase">{t.category} • {new Date(t.date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className={`font-black ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {t.type === TransactionType.EXPENSE ? '-' : ''}{formatter.format(t.amount)}
                  </p>
                  <div className="flex no-print">
                    <button onClick={() => onEdit(t)} className="p-2 text-slate-300 hover:text-indigo-600"><Edit2 size={16} /></button>
                    <button onClick={() => onDelete(t.id)} className="p-2 text-slate-300 hover:text-rose-600"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
