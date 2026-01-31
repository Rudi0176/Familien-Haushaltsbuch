
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Category, FamilySettings } from './types.ts';
import Dashboard from './components/Dashboard.tsx';
import TransactionForm from './components/TransactionForm.tsx';
import TransactionList from './components/TransactionList.tsx';
import AIAdvisor from './components/AIAdvisor.tsx';
import YearlyOverview from './components/YearlyOverview.tsx';
import Settings from './components/Settings.tsx';
import OnboardingWizard from './components/OnboardingWizard.tsx';
import { LayoutDashboard, PlusCircle, History, Sparkles, BarChart3, ChevronRight, Settings as SettingsIcon } from 'lucide-react';

const DEFAULT_CATEGORIES: Category[] = [
  'Lebensmittel', 'Miete/Wohnen', 'Mobilität', 'Freizeit', 
  'Versicherungen', 'Gehalt', 'Kleidung', 'Gesundheit', 
  'Bildung', 'Sparen', 'Sonstiges', 'Haustiere'
];

const DEFAULT_SETTINGS: FamilySettings = {
  familyName: 'Müller',
  adults: 2,
  children: 2,
  monthlySavingsGoal: 500,
  financialFocus: 'Notgroschen aufbauen',
  housingSituation: 'Miete',
  petCount: 0,
  carCount: 1,
  publicTransportSubCount: 0,
  debtAmount: 0,
  interestRate: 0
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'add' | 'ai' | 'annual' | 'settings'>('dashboard');
  
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('family_budget_onboarding_done') === 'true';
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('family_budget_data');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.map((t: any) => ({
        ...t,
        id: String(t.id || Math.random().toString(36).substr(2, 9) + Date.now())
      })) : [];
    } catch (e) {
      return [];
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('family_budget_categories');
    if (!saved) return DEFAULT_CATEGORIES;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : DEFAULT_CATEGORIES;
    } catch (e) {
      return DEFAULT_CATEGORIES;
    }
  });

  const [settings, setSettings] = useState<FamilySettings>(() => {
    const saved = localStorage.getItem('family_budget_settings');
    if (!saved) return DEFAULT_SETTINGS;
    try {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    localStorage.setItem('family_budget_data', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('family_budget_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('family_budget_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('family_budget_onboarding_done', String(hasCompletedOnboarding));
  }, [hasCompletedOnboarding]);

  const handleOnboardingComplete = (finalSettings: FamilySettings) => {
    setSettings(finalSettings);
    setHasCompletedOnboarding(true);
  };

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...t,
      id: String(Date.now() + Math.random().toString(36).substr(2, 5))
    };
    setTransactions(prev => [newTransaction, ...prev]);
    setActiveTab('dashboard');
  };

  const updateTransaction = (id: string, updatedData: Omit<Transaction, 'id'>) => {
    setTransactions(prev => prev.map(t => String(t.id) === String(id) ? { ...updatedData, id } : t));
    setEditingTransaction(null);
    setActiveTab('dashboard');
  };

  const deleteTransaction = (id: string) => {
    if (!id) return;
    setTransactions(prev => prev.filter(t => String(t.id) !== String(id)));
  };

  const startEdit = (t: Transaction) => {
    setEditingTransaction(t);
    setActiveTab('add');
  };

  const cancelEdit = () => {
    setEditingTransaction(null);
    setActiveTab('dashboard');
  };

  const addCategory = (name: string) => {
    if (!name || categories.includes(name)) return;
    setCategories(prev => [...prev, name]);
  };

  if (!hasCompletedOnboarding) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen flex bg-[#f8fafc]">
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-[260px] bg-[#1e293b] text-slate-300 z-50 border-r border-slate-800 shadow-2xl no-print">
        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-violet-500/20">€</div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">FamFinance</h1>
        </div>
        
        <div className="flex-1 px-4 space-y-1 mt-4">
          <NavButton active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setEditingTransaction(null); }} icon={<LayoutDashboard size={20}/>} label="Dashboard" />
          <NavButton active={activeTab === 'add'} onClick={() => setActiveTab('add')} icon={<PlusCircle size={20}/>} label={editingTransaction ? "Bearbeiten" : "Buchen"} />
          <NavButton active={activeTab === 'history'} onClick={() => { setActiveTab('history'); setEditingTransaction(null); }} icon={<History size={20}/>} label="Verlauf" />
          <NavButton active={activeTab === 'annual'} onClick={() => setActiveTab('annual')} icon={<BarChart3 size={20}/>} label="Berichte" />
          
          <div className="pt-6 pb-2 px-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Premium Features</p>
          </div>
          <NavButton 
            active={activeTab === 'ai'} 
            onClick={() => { setActiveTab('ai'); setEditingTransaction(null); }} 
            icon={<Sparkles size={20} className={activeTab === 'ai' ? 'text-yellow-400' : 'text-violet-400'}/>} 
            label="KI Spar-Berater" 
            special={true}
          />
        </div>

        <div className="p-6 border-t border-slate-800 space-y-4">
          <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon size={20}/>} label="Einstellungen" />
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">{settings.familyName[0]}</div>
            <div>
              <p className="text-xs font-bold text-white">Familie {settings.familyName}</p>
              <p className="text-[10px] text-slate-400">{settings.adults + settings.children} Pers. | {settings.carCount} PKW</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-[260px] min-h-screen">
        <div className="max-w-6xl mx-auto p-4 md:p-10 pb-24 md:pb-10">
          {activeTab === 'dashboard' && (
            <Dashboard 
              transactions={transactions} 
              onEdit={startEdit} 
              onDelete={deleteTransaction}
              settings={settings}
            />
          )}
          {activeTab === 'add' && (
            <TransactionForm 
              categories={categories}
              onAdd={addTransaction} 
              onUpdate={updateTransaction}
              onAddCategory={addCategory}
              editData={editingTransaction}
              onCancel={cancelEdit}
            />
          )}
          {activeTab === 'history' && (
            <TransactionList 
              transactions={transactions} 
              onDelete={deleteTransaction} 
              onEdit={startEdit}
            />
          )}
          {activeTab === 'annual' && (
            <YearlyOverview transactions={transactions} settings={settings} />
          )}
          {activeTab === 'ai' && <AIAdvisor transactions={transactions} settings={settings} />}
          {activeTab === 'settings' && (
            <Settings settings={settings} onUpdate={setSettings} />
          )}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center pt-3 pb-6 px-4 z-50 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.1)] no-print">
        <MobileNavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={24}/>} />
        <MobileNavButton active={activeTab === 'add'} onClick={() => setActiveTab('add')} icon={<PlusCircle size={24}/>} />
        <MobileNavButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={24}/>} />
        <MobileNavButton active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} icon={<Sparkles size={24}/>} />
        <MobileNavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon size={24}/>} />
      </nav>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label, special = false }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, special?: boolean }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between group px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-violet-600/15 text-white shadow-sm ring-1 ring-violet-500/30' 
        : 'hover:bg-slate-800 text-slate-400 hover:text-slate-100'
    }`}
  >
    <div className="flex items-center gap-3">
      <span className={`transition-colors ${active ? (special ? 'text-violet-400' : 'text-violet-400') : 'text-slate-500 group-hover:text-slate-300'}`}>
        {icon}
      </span>
      <span className={`text-sm font-semibold ${active ? 'text-white' : ''}`}>{label}</span>
    </div>
    {active && <ChevronRight size={14} className="text-violet-400" />}
  </button>
);

const MobileNavButton = ({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: React.ReactNode }) => (
  <button 
    onClick={onClick}
    className={`p-3 rounded-2xl transition-all ${active ? 'bg-violet-100 text-violet-600 scale-105' : 'text-slate-400'}`}
  >
    {icon}
  </button>
);

export default App;
