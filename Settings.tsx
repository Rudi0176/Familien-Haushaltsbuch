
import React from 'react';
import { FamilySettings } from './types';
import { Users, Target, Home, CreditCard } from 'lucide-react';

interface Props {
  settings: FamilySettings;
  onUpdate: (s: FamilySettings) => void;
}

const Settings: React.FC<Props> = ({ settings, onUpdate }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onUpdate({
      ...settings,
      [name]: (name === 'familyName' || name === 'financialFocus' || name === 'housingSituation') ? value : Number(value)
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <h2 className="text-3xl font-black">Einstellungen</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white p-8 rounded-xl border space-y-4">
          <div className="flex items-center gap-2"><Users size={20} /><h3 className="font-bold">Familie</h3></div>
          <input type="text" name="familyName" value={settings.familyName} onChange={handleChange} className="w-full p-3 bg-slate-50 border rounded-xl" />
          <div className="grid grid-cols-2 gap-4">
            <input type="number" name="adults" min="1" value={settings.adults} onChange={handleChange} className="w-full p-3 bg-slate-50 border rounded-xl" />
            <input type="number" name="children" min="0" value={settings.children} onChange={handleChange} className="w-full p-3 bg-slate-50 border rounded-xl" />
          </div>
        </section>

        <section className="bg-white p-8 rounded-xl border space-y-4">
          <div className="flex items-center gap-2"><Target size={20} /><h3 className="font-bold">Ziele</h3></div>
          <input type="number" name="monthlySavingsGoal" value={settings.monthlySavingsGoal} onChange={handleChange} className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="Sparziel €" />
        </section>

        <section className="bg-white p-8 rounded-xl border space-y-4">
          <div className="flex items-center gap-2"><CreditCard size={20} /><h3 className="font-bold">Kredite</h3></div>
          <input type="number" name="debtAmount" value={settings.debtAmount} onChange={handleChange} className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="Restschuld €" />
          <input type="number" name="interestRate" step="0.1" value={settings.interestRate} onChange={handleChange} className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="Zins %" />
        </section>
      </div>
    </div>
  );
};

export default Settings;
