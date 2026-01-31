
import React, { useState, useEffect, useRef } from 'react';
import { Transaction, TransactionType, Category } from './types';
import { RefreshCw, X, Plus, Check, ChevronDown, Camera, Loader2, Sparkles, CheckCircle2, Star } from 'lucide-react';
import { analyzeReceipt } from './gemini';

interface Props {
  categories: Category[];
  onAdd: (t: Omit<Transaction, 'id'>) => void;
  onUpdate: (id: string, t: Omit<Transaction, 'id'>) => void;
  onAddCategory: (name: string) => void;
  editData: Transaction | null;
  onCancel: () => void;
}

const TransactionForm: React.FC<Props> = ({ categories, onAdd, onUpdate, onAddCategory, editData, onCancel }) => {
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>(categories[0] || 'Sonstiges');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResultCount, setScanResultCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const favorites = ['Lebensmittel', 'Mobilität', 'Freizeit', 'Wohnen'].filter(f => categories.includes(f));

  useEffect(() => {
    if (editData) {
      setType(editData.type);
      setAmount(editData.amount.toString());
      setDescription(editData.description);
      setCategory(editData.category);
      setDate(editData.date);
      setIsRecurring(editData.isRecurring);
    }
  }, [editData]);

  const handleAddNewCategory = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setCategory(newCategoryName.trim());
      setNewCategoryName('');
      setIsAddingNewCategory(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanning(true);
    setScanResultCount(null);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        const results = await analyzeReceipt(base64String, categories);
        if (results) {
          setScanResultCount(results.length);
          const last = results[results.length - 1];
          setAmount(last.amount.toString());
          setDescription(last.description);
          setCategory(last.category);
        }
        setIsScanning(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setIsScanning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    const data = { type, amount: parseFloat(amount), description, category, date, isRecurring };
    if (editData) onUpdate(editData.id, data); else onAdd(data);
    setAmount(''); setDescription('');
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-10 rounded-[12px] shadow-lg border border-slate-100">
      <div className="flex justify-between items-start mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{editData ? 'Anpassen' : 'Neue Buchung'}</h2>
        {!editData && (
          <button onClick={() => fileInputRef.current?.click()} disabled={isScanning} className="p-3 bg-slate-50 rounded-2xl border-2 border-dashed text-slate-400">
            {isScanning ? <Loader2 className="animate-spin" /> : <Camera size={24} />}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} className="w-full text-2xl font-black p-4 bg-slate-50 border-2 rounded-xl" placeholder="0,00€" />
        <div className="flex gap-2 mb-2">
            {favorites.map(fav => (
              <button key={fav} type="button" onClick={() => setCategory(fav)} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border ${category === fav ? 'bg-violet-600 text-white' : 'bg-white text-slate-500'}`}>
                {fav}
              </button>
            ))}
        </div>
        <input type="text" required value={description} onChange={e => setDescription(e.target.value)} className="w-full p-4 bg-slate-50 border-2 rounded-xl" placeholder="Beschreibung" />
        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-4 bg-slate-50 border-2 rounded-xl">
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <button type="submit" className="w-full py-5 bg-violet-600 text-white rounded-xl font-black">Abschließen</button>
      </form>
    </div>
  );
};

export default TransactionForm;
