
import React, { useMemo, useState } from 'react';
import { Transaction, TransactionType, FamilySettings } from './types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, PiggyBank, ArrowDownRight, CreditCard } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  settings: FamilySettings;
}

const YearlyOverview: React.FC<Props> = ({ transactions, settings }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const years = [selectedYear, selectedYear-1];
  const monthNames = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

  const yearlyData = useMemo(() => {
    return monthNames.map((name, m) => {
      const monthIncome = transactions.filter(t => t.type === TransactionType.INCOME && new Date(t.date).getMonth() === m && new Date(t.date).getFullYear() === selectedYear).reduce((s,t)=>s+t.amount, 0);
      const monthExpense = transactions.filter(t => t.type === TransactionType.EXPENSE && new Date(t.date).getMonth() === m && new Date(t.date).getFullYear() === selectedYear).reduce((s,t)=>s+t.amount, 0);
      return { name, Einnahmen: monthIncome, Ausgaben: monthExpense };
    });
  }, [transactions, selectedYear]);

  const annualInterest = (settings.debtAmount || 0) * ((settings.interestRate || 0) / 100);
  const formatter = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-center">
        <h2 className="text-3xl font-black">Berichte</h2>
        <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="p-2 border rounded-xl">
           {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </header>

      {settings.debtAmount > 0 && (
        <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 flex justify-between items-center">
          <div>
            <p className="text-xs uppercase font-bold text-amber-600">Zinskosten Check</p>
            <p className="text-sm font-medium">Euer Kredit kostet euch jährlich ca. {formatter.format(annualInterest)}.</p>
          </div>
          <CreditCard className="text-amber-500" />
        </div>
      )}

      <div className="bg-white p-8 rounded-xl border h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={yearlyData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" fontSize={11} />
            <YAxis fontSize={10} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Einnahmen" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Ausgaben" fill="#fb7185" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const YearCard = ({ title, amount, icon, highlight = false }: any) => (
  <div className={`p-8 rounded-xl border flex items-center justify-between ${highlight ? 'bg-violet-600 text-white' : 'bg-white'}`}>
    <div>
      <p className="text-xs uppercase opacity-70">{title}</p>
      <p className="text-2xl font-black">{amount}</p>
    </div>
    {icon}
  </div>
);

export default YearlyOverview;
