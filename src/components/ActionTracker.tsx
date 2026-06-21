import React, { useState, useEffect } from "react";
import { SustainableAction } from "../types";
import { 
  Check, 
  Plus, 
  Trash2, 
  Activity, 
  Leaf, 
  Award, 
  Zap, 
  Car, 
  Utensils, 
  Wrench,
  Sparkles
} from "lucide-react";

interface ActionTrackerProps {
  onActionsChange: (actions: SustainableAction[]) => void;
}

const PRESET_ACTIONS: SustainableAction[] = [
  { id: "act_1", title: "Composed public transit instead of solo car commute", category: "Transport", impactLevel: "High", co2SavedKg: 8.2, completed: false, completedAt: null },
  { id: "act_2", title: "Subbed dinner for a strictly plant-based/vegan meal", category: "Food", impactLevel: "Medium", co2SavedKg: 3.5, completed: false, completedAt: null },
  { id: "act_3", title: "Hung dried a wash load instead of using electric dryer", category: "Energy", impactLevel: "Medium", co2SavedKg: 2.1, completed: false, completedAt: null },
  { id: "act_4", title: "Operated laundry washing cycle on cold setting", category: "Energy", impactLevel: "Low", co2SavedKg: 0.8, completed: false, completedAt: null },
  { id: "act_5", title: "Avoided single-use packaging/plastic by shopping bulk", category: "Waste", impactLevel: "Medium", co2SavedKg: 1.2, completed: false, completedAt: null },
  { id: "act_6", title: "Unplugged phantom charger loads & unused electronics", category: "Energy", impactLevel: "Low", co2SavedKg: 0.5, completed: false, completedAt: null },
];

export default function ActionTracker({ onActionsChange }: ActionTrackerProps) {
  const [actions, setActions] = useState<SustainableAction[]>([]);
  const [customTitle, setCustomTitle] = useState("");
  const [customCategory, setCustomCategory] = useState<"Transport" | "Energy" | "Food" | "Waste">("Energy");
  const [customImpact, setCustomImpact] = useState<"High" | "Medium" | "Low">("Medium");

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("ecosustain_actions");
    if (saved) {
      try {
        setActions(JSON.parse(saved));
      } catch (e) {
        setActions(PRESET_ACTIONS);
      }
    } else {
      setActions(PRESET_ACTIONS);
    }
  }, []);

  // Save changes & lift state
  const updateActionsState = (newActions: SustainableAction[]) => {
    setActions(newActions);
    localStorage.setItem("ecosustain_actions", JSON.stringify(newActions));
    onActionsChange(newActions);
  };

  const handleToggleCompleted = (id: string) => {
    const next = actions.map((act) => {
      if (act.id === id) {
        return {
          ...act,
          completed: !act.completed,
          completedAt: !act.completed ? new Date().toISOString() : null
        };
      }
      return act;
    });
    updateActionsState(next);
  };

  const handleAddCustomAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    let co2Est = 1.0;
    if (customCategory === "Transport") co2Est = customImpact === "High" ? 10.0 : customImpact === "Medium" ? 5.0 : 2.0;
    else if (customCategory === "Energy") co2Est = customImpact === "High" ? 6.0 : customImpact === "Medium" ? 3.0 : 1.0;
    else if (customCategory === "Food") co2Est = customImpact === "High" ? 5.0 : customImpact === "Medium" ? 2.5 : 1.0;
    else if (customCategory === "Waste") co2Est = customImpact === "High" ? 4.0 : customImpact === "Medium" ? 2.0 : 0.5;

    const custom: SustainableAction = {
      id: "cust_" + Date.now(),
      title: customTitle,
      category: customCategory,
      impactLevel: customImpact,
      co2SavedKg: parseFloat(co2Est.toFixed(1)),
      completed: true, // Auto-complete custom entries
      completedAt: new Date().toISOString()
    };

    updateActionsState([...actions, custom]);
    setCustomTitle("");
  };

  const handleDeleteAction = (id: string) => {
    const filtered = actions.filter(act => act.id !== id);
    updateActionsState(filtered);
  };

  const completedActions = actions.filter(a => a.completed);
  const totalSavedCo2 = completedActions.reduce((acc, current) => acc + current.co2SavedKg, 0);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Transport": return <Car className="h-4 w-4 text-zinc-900" />;
      case "Food": return <Utensils className="h-4 w-4 text-zinc-900" />;
      case "Waste": return <Trash2 className="h-4 w-4 text-zinc-900" />;
      default: return <Zap className="h-4 w-4 text-zinc-900" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "High": return "bg-zinc-900 text-[9px] text-lime-400 border-zinc-950";
      case "Medium": return "bg-zinc-100 text-[9px] text-zinc-800 border-zinc-300";
      default: return "bg-zinc-50 text-[9px] text-zinc-400 border-zinc-200";
    }
  };

  return (
    <div id="action_tracker_block" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
      {/* Interactive Actions List */}
      <div id="tracker_list_wrapper" className="lg:col-span-8 bg-white p-6 md:p-10 rounded-3xl border border-zinc-200 shadow-xs space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 pb-5 gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-lime-600 block mb-1">Interactive Logbook</span>
            <h3 id="actions_header_title" className="text-2xl font-black text-zinc-900 tracking-tight uppercase flex items-center gap-2">
              2. Habits Log & Carbon Tracker
            </h3>
            <p className="text-zinc-400 text-xs font-medium mt-1">Surgical logs representing verified lower consumption benchmarks.</p>
          </div>
          <div className="bg-lime-300 border border-zinc-900 py-1.5 px-3.5 rounded-xl text-zinc-950 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <Award className="h-4 w-4 text-zinc-950" />
            <span>{completedActions.length} completed this week</span>
          </div>
        </div>

        <div className="space-y-4">
          {actions.map((act) => (
            <div
              key={act.id}
              className={`flex items-center justify-between p-4.5 rounded-2xl border transition-all ${
                act.completed 
                  ? "bg-zinc-50 border-zinc-300/80 text-zinc-500 shadow-3xs" 
                  : "bg-white border-zinc-200 text-zinc-900 hover:border-zinc-900"
              }`}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0 pr-3">
                <button
                  type="button"
                  onClick={() => handleToggleCompleted(act.id)}
                  className={`h-5 w-5 rounded-md flex items-center justify-center border cursor-pointer transition-all shrink-0 ${
                    act.completed 
                      ? "bg-zinc-900 border-zinc-900 text-lime-400" 
                      : "border-zinc-350 hover:border-zinc-900 bg-white"
                  }`}
                >
                  {act.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                </button>
                
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="p-1 rounded-sm bg-zinc-100 border border-zinc-200 inline-block shrink-0">
                      {getCategoryIcon(act.category)}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-wider border px-2 py-0.5 rounded-full leading-none ${getImpactColor(act.impactLevel)}`}>
                      {act.impactLevel} Impact
                    </span>
                  </div>
                  <p className={`text-xs md:text-sm font-semibold leading-relaxed truncate ${act.completed ? "line-through text-zinc-400" : "text-zinc-900"}`}>
                    {act.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="text-xs font-black text-zinc-900 font-mono">-{act.co2SavedKg} kg</p>
                  <p className="text-[8px] text-zinc-400 uppercase tracking-widest leading-none font-bold mt-0.5">CO2 offset</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteAction(act.id)}
                  className="text-zinc-300 hover:text-zinc-900 p-1.5 rounded-lg hover:bg-zinc-50 transition-all cursor-pointer"
                  title="Remove Action"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          {actions.length === 0 && (
            <div className="text-center py-12 bg-zinc-50 rounded-2xl border border-zinc-200">
              <Activity className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
              <p className="text-xs text-zinc-500 font-medium">No actions tracked. Create a custom template below!</p>
            </div>
          )}
        </div>

        {/* Custom Actions Input Box */}
        <form onSubmit={handleAddCustomAction} className="pt-6 border-t border-zinc-200 space-y-4">
          <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider">Log a Custom Carbon Mitigation Effort</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-6">
              <input
                type="text"
                placeholder="e.g. Recycled a composite circuit board..."
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full text-xs py-3 px-4 rounded-xl border border-zinc-250 text-zinc-800 bg-white placeholder-zinc-400 focus:border-zinc-900 focus:outline-hidden font-medium"
              />
            </div>
            
            <div className="md:col-span-3">
              <select
                value={customCategory}
                onChange={(e: any) => setCustomCategory(e.target.value)}
                className="w-full text-xs py-3 px-3 bg-white border border-zinc-250 rounded-xl text-zinc-800 font-bold uppercase tracking-wider focus:outline-hidden"
              >
                <option value="Transport">Transport</option>
                <option value="Energy">Energy</option>
                <option value="Food">Food</option>
                <option value="Waste">Waste</option>
              </select>
            </div>

            <div className="md:col-span-3 flex gap-2">
              <select
                value={customImpact}
                onChange={(e: any) => setCustomImpact(e.target.value)}
                className="w-full text-xs py-3 px-2 bg-white border border-zinc-250 rounded-xl text-zinc-800 font-bold uppercase tracking-wider focus:outline-hidden"
              >
                <option value="High">High (X-CO2)</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low (Eco-care)</option>
              </select>

              <button
                type="submit"
                className="aspect-square bg-zinc-900 border border-zinc-950 text-lime-400 font-black flex items-center justify-center rounded-xl hover:bg-zinc-800 transition-all cursor-pointer whitespace-nowrap px-4 text-xs"
                title="Add Custom Action"
              >
                <Plus className="h-4 w-4 shrink-0" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Aggregate Score Panel */}
      <div id="tracker_score_panel" className="lg:col-span-4 bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-xs space-y-8">
        <div>
          <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider">Atmospheric saved offsets</h4>
          <p className="text-xs text-zinc-500 font-medium mt-1">Realtime metric output reflecting certified habit compliance.</p>
        </div>

        {/* Saved CO2 Score Gauge */}
        <div className="bg-zinc-900 text-white rounded-3xl p-6 text-center relative overflow-hidden flex flex-col justify-between">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Direct Habits CO2 Savings</span>
          
          <h2 className="text-[72px] sm:text-[84px] leading-none font-black text-lime-400 tracking-tighter font-mono mt-2 flex items-center justify-center gap-1">
            {totalSavedCo2.toFixed(1)}
            <span className="text-xl font-sans font-semibold text-white/50 tracking-normal uppercase">KG</span>
          </h2>
          
          <p className="text-xs text-zinc-300 mt-4 leading-relaxed font-medium bg-zinc-800/80 p-3 rounded-xl border border-zinc-700/60">
            Equals to preserving <span className="font-bold text-lime-400 underline">{(totalSavedCo2 * 4.2).toFixed(0)} phone charges</span> of raw electricity!
          </p>
        </div>

        {/* Milestone Levels */}
        <div className="space-y-4 pt-1">
          <h5 className="font-black text-[10px] text-zinc-400 uppercase tracking-widest">Achieved Eco Badges</h5>
          
          <div className="space-y-3">
            <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
              totalSavedCo2 >= 5 ? "bg-zinc-50 border-zinc-900 text-zinc-900 shadow-3xs" : "bg-zinc-50/20 border-zinc-150 text-zinc-400"
            }`}>
              <span className={`p-1.5 rounded-lg ${totalSavedCo2 >= 5 ? "bg-lime-300 text-zinc-900 border border-zinc-900" : "bg-white text-zinc-300"}`}>
                <Leaf className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-tight leading-normal">Carbon Initiate Badge</p>
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5 block">Threshold met: 5kg CO2 saving</span>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
              totalSavedCo2 >= 15 ? "bg-zinc-50 border-zinc-900 text-zinc-900 shadow-3xs" : "bg-zinc-50/20 border-zinc-150 text-zinc-400"
            }`}>
              <span className={`p-1.5 rounded-lg ${totalSavedCo2 >= 15 ? "bg-lime-350 text-zinc-900 border border-zinc-900" : "bg-white text-zinc-300"}`}>
                <Award className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-tight leading-normal">Climate Tactician</p>
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5 block">Requires 15kg to unlock</span>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
              totalSavedCo2 >= 30 ? "bg-zinc-50 border-zinc-900 text-zinc-900 shadow-3xs" : "bg-zinc-50/20 border-zinc-150 text-zinc-400"
            }`}>
              <span className={`p-1.5 rounded-lg ${totalSavedCo2 >= 30 ? "bg-lime-400 text-zinc-900 border border-zinc-900" : "bg-white text-zinc-300"}`}>
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-tight leading-normal">Zero Carbon Alchemist</p>
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5 block">Requires 30kg of emissions saved</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
