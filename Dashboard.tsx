
import React, { useMemo, useState } from 'react';
import { Transaction, TransactionType, FamilySettings } from './types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, PieChart as PieIcon, ChevronLeft, ChevronRight, FileText, Target, ShieldCheck, AlertCircle, Printer, X } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  settings: FamilySettings;
}

const Dashboard: React.FC<Props> = ({ transactions, onEdit, onDelete, settings }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [showReport, setShowReport] = useState(false);

  const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

  const changeMonth = (offset: number) => {
    setViewDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + offset);
      return d;
    });
  };

  const currentMonthTransactions = useMemo(() => {
    const targetMonth = viewDate.getMonth();
    const targetYear = viewDate.getFullYear();
    const startOfCurrentMonth = new Date(targetYear, targetMonth, 1);
    const endOfCurrentMonth = new Date(targetYear, targetMonth + 1, 0);

    return transactions.filter(t => {
      const tDate = new Date(t.date);
      if (t.isRecurring) {
        const startedBeforeOrThisMonth = tDate <= endOfCurrentMonth;
        let activeThisMonth = startedBeforeOrThisMonth;
        if (t.endDate) {
          const endDate = new Date(t.endDate);
          activeThisMonth = startedBeforeOrThisMonth && endDate >= startOfCurrentMonth;
        }
        return activeThisMonth;
      }
      return tDate.getMonth() === targetMonth && tDate.getFullYear() === targetYear;
    });
  }, [transactions, viewDate]);

  const stats = useMemo(() => {
    const income = currentMonthTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = currentMonthTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [currentMonthTransactions]);

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    currentMonthTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [currentMonthTransactions]);

  const savingsProgress = Math.min(100, Math.max(0, (stats.balance / (settings.monthlySavingsGoal || 1)) * 100));
  const recommendedEmergencyFund = stats.expense > 0 ? stats.expense * 3 : 3000;
  const formatter = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
  const COLORS = ['#7c3aed', '#10b981', '#f59e0b', '#fb7185', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  if (showReport) {
    return (
      <div className="fixed inset-0 bg-white z-[100] overflow-y-auto animate-in slide-in-from-bottom-10 duration-500">
        <div className="max-w-4xl mx-auto p-10 space-y-12">
          <div className="flex justify-between items-center border-b pb-8 no-print">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg">€</div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Finanzbericht</h2>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-xl hover:bg-black transition-all"><Printer size={18} /> Jetzt Drucken</button>
              <button onClick={() => setShowReport(false)} className="p-3 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-all"><X size={24} /></button>
            </div>
          </div>
          <div className="space-y-12 text-center">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Übersicht: Familie {settings.familyName}</h1>
            <p className="text-slate-500 font-bold text-lg uppercase tracking-widest">{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</p>
            <div className="grid grid-cols-3 gap-8">
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100"><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Saldo</p><p className={`text-3xl font-black ${stats.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatter.format(stats.balance)}</p></div>
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100"><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Einnahmen</p><p className="text-3xl font-black text-slate-900">{formatter.format(stats.income)}</p></div>
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100"><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Ausgaben</p><p className="text-3xl font-black text-slate-900">{formatter.format(stats.expense)}</p></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Eure Finanzen</h2>
          <p className="text-slate-500 font-medium mt-1">Überblick für {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white rounded-[12px] shadow-sm border border-slate-200 p-1">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-50 rounded-lg transition-all"><ChevronLeft size={20} /></button>
            <div className="px-6 font-bold text-slate-700 min-w-[120px] text-center">{monthNames[viewDate.getMonth()]}</div>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-50 rounded-lg transition-all"><ChevronRight size={20} /></button>
          </div>
          <button onClick={() => setShowReport(true)} className="p-3.5 bg-white border border-slate-200 text-slate-600 rounded-[12px] font-bold shadow-sm hover:border-violet-300 hover:text-violet-600 transition-all active:scale-95"><FileText size={20} /></button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 no-print">
        <StatCard title="Saldo" amount={formatter.format(stats.balance)} icon={<Wallet className="text-violet-600" />} textColor={stats.balance >= 0 ? "text-emerald-600" : "text-rose-500"} />
        <StatCard title="Einnahmen" amount={formatter.format(stats.income)} icon={<TrendingUp className="text-emerald-500" />} />
        <StatCard title="Ausgaben" amount={formatter.format(stats.expense)} icon={<TrendingDown className="text-rose-500" />} />
        <div className="bg-white p-6 rounded-[12px] shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
             <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Sparziel-Tracker</p>
             <Target size={14} className="text-violet-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-xl font-black text-slate-900 tracking-tighter">{savingsProgress.toFixed(0)}%</span>
              <span className="text-[10px] text-slate-400 font-bold">Ziel: {settings.monthlySavingsGoal}€</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-violet-600 transition-all duration-1000" style={{ width: `${savingsProgress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 no-print">
        <div className="lg:col-span-2 bg-white p-8 rounded-[12px] shadow-sm border border-slate-100 flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-800 tracking-tight">Kategorien-Analyse</h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ausgaben</span>
          </div>
          <div className="flex-1 w-full" style={{ height: '320px' }}>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" fontSize={11} width={80} />
                  <Tooltip contentStyle={{ borderRadius: '12px' }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                    {categoryData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center text-slate-300 italic">Noch keine Daten vorhanden</div>}
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[12px] shadow-xl text-white space-y-4">
            <div className="flex items-center gap-3"><AlertCircle size={20} /><h3 className="font-bold">Mentor Tipp</h3></div>
            <p className="text-sm">Basierend auf euren Ausgaben sollte euer Notgroschen idealerweise bei <span className="font-black underline">{formatter.format(recommendedEmergencyFund)}</span> liegen.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, amount, icon, textColor = "text-slate-900" }: any) => (
  <div className="bg-white p-6 rounded-[12px] shadow-sm border border-slate-100 flex items-center justify-between group">
    <div>
      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">{title}</p>
      <p className={`text-xl font-black ${textColor}`}>{amount}</p>
    </div>
    <div className="p-3 bg-slate-50 rounded-xl">{icon}</div>
  </div>
);

export default Dashboard;
