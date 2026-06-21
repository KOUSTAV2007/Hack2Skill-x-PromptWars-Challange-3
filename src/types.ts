export interface FootprintData {
  transportDistance: number; // km/week
  transportType: string;
  flightsPerYear: number;
  electricityBill: number; // kWh/month
  energySource: string;
  heatingType: string;
  dietType: string;
  recyclingHabits: string;
}

export interface SustainableAction {
  id: string;
  title: string;
  category: "Transport" | "Energy" | "Food" | "Waste";
  impactLevel: "High" | "Medium" | "Low";
  co2SavedKg: number; // daily savings
  completed: boolean;
  completedAt: string | null;
}

export interface QuickWin {
  title: string;
  impact: string;
  description: string;
}

export interface LongTermGoal {
  title: string;
  timeframe: string;
  description: string;
}

export interface AIAnalysis {
  summary: string;
  projectedAnnualEmissions: string;
  rating: string;
  primaryDriver: string;
  quickWins: QuickWin[];
  longTermGoals: LongTermGoal[];
}

export interface PromptPreset {
  id: string;
  name: string;
  role: string;
  objective: string;
  constraint: string;
  tone: string;
}
