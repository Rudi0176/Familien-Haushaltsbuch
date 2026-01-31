
export enum TransactionType {
  INCOME = 'Einnahme',
  EXPENSE = 'Ausgabe'
}

export type Category = string;

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: Category;
  type: TransactionType;
  isRecurring: boolean;
  endDate?: string;
}

export interface FamilySettings {
  familyName: string;
  adults: number;
  children: number;
  monthlySavingsGoal: number;
  financialFocus: string; 
  housingSituation: string;
  petCount: number;
  carCount: number;
  publicTransportSubCount: number;
  // Neue Felder für das Onboarding
  debtAmount: number;
  interestRate: number;
}

export interface BudgetGoal {
  category: Category;
  limit: number;
}
