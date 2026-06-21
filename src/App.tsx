import React, { useState } from "react";
import CarbonCalculator from "./components/CarbonCalculator";
import ActionTracker from "./components/ActionTracker";
import PromptLab from "./components/PromptLab";
import { FootprintData, SustainableAction } from "./types";
import { 
  Leaf, 
  Activity, 
  Sparkles, 
  TrendingDown, 
  LineChart, 
  Award,
  Globe,
  Clock,
  HelpCircle,
  Flame,
  ArrowRight
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"calculator" | "habits" | "promptlab">("calculator");
  
  // App state sync
  const [footprint, setFootprint] = useState<FootprintData>({
    transportDistance: 120,
    transportType: "car_petrol",
    flightsPerYear: 2,
    electricityBill: 250,
    energySource: "standard_grid",
    heatingType: "natural_gas",
    dietType: "balanced",
    recyclingHabits: "partial"
  });

  const [actions, setActions] = useState<SustainableAction[]>([]);

  // Simple static calculation for general dashboard view
  const completedActions = actions.filter(a => a.completed);
  const totalSavedCo2 = completedActions.reduce((acc, cr) => acc + cr.co2SavedKg, 0);

  return (
    <div id="ecosustain_main_dashboard" className="min-h-screen bg-zinc-50 flex flex-col justify-between font-sans antialiased text-zinc-900">
      
      {/* Navigation Header inline with Bold Typography theme (CARBON.IO / ECOSUSTAIN) */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo Group */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-lime-400 rounded-full flex items-center justify-center text-zinc-900 border border-zinc-900 shadow-sm" aria-hidden="true">
                <Leaf className="w-4.5 h-4.5 text-zinc-900 stroke-[2.5]" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-zinc-900 flex items-center gap-1.5 leading-none">
                  ECOSUSTAIN <span className="text-[9px] font-black tracking-[0.1em] text-zinc-900 bg-lime-300 border border-zinc-900 py-0.5 px-2 rounded-full">v2.1</span>
                </h1>
                <p className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-[0.15em] mt-0.5">Prompt Engineering Lab</p>
              </div>
            </div>

            {/* Live Metrics Row (Desktop only) */}
            <div className="hidden md:flex items-center gap-6 text-xs">
              <div className="text-right border-r border-zinc-200 pr-5">
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-black flex items-center gap-1 justify-end">
                  <Activity className="h-3 w-3 text-zinc-950" aria-hidden="true" /> Habits Tracker
                </span>
                <span className="text-xs font-extrabold text-zinc-800 tracking-tight">{completedActions.length} completed</span>
              </div>
              <div className="text-right pr-1">
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-black flex items-center gap-1 justify-end">
                  <Sparkles className="h-3 w-3 text-lime-600 fill-lime-400 mt-0.5" aria-hidden="true" /> Offset Credit
                </span>
                <span className="text-xs font-black text-zinc-950 font-mono">-{totalSavedCo2.toFixed(1)} KG/CO2</span>
              </div>
            </div>

            {/* Hackathon Badge */}
            <div className="bg-zinc-900 border border-zinc-950 rounded-xl py-1.5 px-3.5 shadow-sm text-white">
              <div className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-lime-400 animate-spin-slow" aria-hidden="true" />
                <div className="text-left leading-none">
                  <p className="text-[9px] text-lime-400 font-extrabold uppercase tracking-[0.15em] leading-none">Google Prompt Wars</p>
                  <p className="text-[8px] text-zinc-400 font-medium mt-0.5">Hack2Skill Exclusive</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* Bento Overview Banner - Refined in Black Bold Theme */}
        <div className="bg-zinc-900 text-white rounded-[32px] p-6 sm:p-10 relative overflow-hidden shadow-sm border border-zinc-950 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-lime-450/10 rounded-full blur-3xl transform translate-x-24 -translate-y-24"></div>
          
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 text-[10px] font-black text-lime-400 uppercase tracking-[0.2em] bg-zinc-800 py-1 px-3 rounded-full border border-zinc-700">
              <Globe className="h-3.5 w-3.5" aria-hidden="true" />
              Empowering Climate Action with Generative AI
            </span>
            
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tighter leading-[1.1] uppercase">
              Measure, Optimise, & Engineer Your Climate Path.
            </h2>
            
            <p className="text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed">
              Analyze your current ecological carbon footprint, log impactful daily habits, and experiment with advanced prompt engineering parameters in the Prompt Lab to draft custom decarbonization blueprint plans using Google Gemini models.
            </p>
          </div>

          <div className="shrink-0 relative z-10 bg-zinc-800 border border-zinc-700/80 p-5 rounded-2xl text-center min-w-[200px]">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Offline Saved</p>
            <p className="text-4xl font-black text-lime-400 font-mono mt-1 pr-1">{totalSavedCo2.toFixed(1)}<span className="text-xs uppercase font-sans font-medium text-white/60 ml-1">kg</span></p>
            <div className="mt-3 text-[10px] font-black uppercase tracking-widest text-zinc-150 flex items-center justify-center gap-1">
              built by Koustav Mukherjee
            </div>
          </div>
        </div>

        {/* Tab Selection Area */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-zinc-200 pb-3">
          
          {/* Navigation Tabs - Bold typography styling */}
          <div className="flex border border-zinc-200 p-1 bg-zinc-100/80 rounded-2xl md:max-w-xl w-full gap-1" role="tablist">
            <button
              onClick={() => setActiveTab("calculator")}
              aria-selected={activeTab === "calculator"}
              role="tab"
              aria-label="Switch to Carbon Footprint Estimator Tab"
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "calculator"
                  ? "bg-zinc-900 text-lime-400 shadow-xs border border-zinc-950"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-white/40"
              }`}
            >
              <TrendingDown className="h-4 w-4 shrink-0" aria-hidden="true" />
              1. Estimator
            </button>
            <button
              onClick={() => setActiveTab("habits")}
              aria-selected={activeTab === "habits"}
              role="tab"
              aria-label="Switch to Sustainability Habits Log Tab"
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "habits"
                  ? "bg-zinc-900 text-lime-400 shadow-xs border border-zinc-950"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-white/40"
              }`}
            >
              <Activity className="h-4 w-4 shrink-0" aria-hidden="true" />
              2. Habits Log
            </button>
            <button
              onClick={() => setActiveTab("promptlab")}
              aria-selected={activeTab === "promptlab"}
              role="tab"
              aria-label="Switch to AI Prompt Lab Tab"
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "promptlab"
                  ? "bg-zinc-900 text-lime-400 shadow-xs border border-zinc-950"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-white/40"
              }`}
            >
              <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
              3. AI Prompt Lab
            </button>
          </div>

          <div className="text-xs text-zinc-500 font-extrabold uppercase tracking-wide md:text-right">
            Active Context: <span className="text-zinc-900 underline font-black cursor-default bg-lime-300 px-2 py-0.5 rounded ml-1 border border-zinc-900 text-[10px]">H2S PROMPT WARS SANDBOX</span>
          </div>
        </div>

        {/* Tab Content Rendering with animations-like states */}
        <div className="transition-all duration-300">
          {activeTab === "calculator" && (
            <CarbonCalculator 
              onDataChange={setFootprint} 
              recentActions={actions.filter(a => a.completed)}
            />
          )}

          {activeTab === "habits" && (
            <ActionTracker 
              onActionsChange={setActions}
            />
          )}

          {activeTab === "promptlab" && (
            <PromptLab 
              currentFootprint={footprint}
            />
          )}
        </div>

      </main>

      {/* Footer Design */}
      <footer className="bg-white border-t border-zinc-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center space-y-4">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400 font-bold tracking-wider">
            <p className="flex items-center gap-2 text-zinc-500 uppercase text-[10px]">
              <Leaf className="h-4 w-4 text-zinc-900 shrink-0" aria-hidden="true" />
              © 2026 EcoSustain Carbon Prompt Lab. Built with Antigravity & Google Gemini.
            </p>
            <div className="flex items-center gap-4 text-[10px]">
              <span className="text-zinc-900 font-black flex items-center gap-1 uppercase">
                <Award className="h-3.5 w-3.5 text-zinc-950" aria-hidden="true" /> built by Koustav Mukherjee
              </span>
            </div>
          </div>

          <p className="text-[10px] text-zinc-400 border-t border-zinc-150 pt-4 leading-relaxed max-w-4xl mx-auto font-medium">
            EcoSustain leverages the standard Google @google/genai TypeScript interface to trigger real-time system reasoning instructions, managing variables dynamically inside strict computational limits. Perfect for prompt crafting, few-shot conditioning, and negative limit test-beds.
          </p>

        </div>
      </footer>

    </div>
  );
}
