import React, { useState, useEffect } from "react";
import { 
  FootprintData, 
  AIAnalysis 
} from "../types";
import { getFallbackAnalyzeResponse } from "../lib/fallback";
import { 
  Car, 
  Plane, 
  Home, 
  Flame, 
  Utensils, 
  Trash2, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  TrendingDown,
  ChevronRight
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip 
} from "recharts";

interface CarbonCalculatorProps {
  onDataChange: (data: FootprintData) => void;
  recentActions: any[];
}

const TRANSPORT_FACTORS: Record<string, number> = {
  car_petrol: 0.21,
  car_diesel: 0.18,
  ev: 0.05,
  public_transport: 0.04,
  bike_walk: 0.0
};

const ENERGY_FACTORS: Record<string, number> = {
  coal_grid: 0.85,
  standard_grid: 0.42,
  green_mix: 0.12,
  solar_renewable: 0.02
};

const HEATING_FACTORS: Record<string, number> = {
  natural_gas: 1500,
  heating_oil: 2800,
  heat_pump: 500,
  none_clean: 0
};

const DIET_FACTORS: Record<string, number> = {
  meat_heavy: 2800,
  balanced: 1800,
  vegetarian: 1100,
  vegan: 750
};

const RECYCLING_FACTORS: Record<string, number> = {
  none: 1000,
  partial: 500,
  strict_zero_waste: 150
};

export default function CarbonCalculator({ onDataChange, recentActions }: CarbonCalculatorProps) {
  const [data, setData] = useState<FootprintData>({
    transportDistance: 120,
    transportType: "car_petrol",
    flightsPerYear: 2,
    electricityBill: 250,
    energySource: "standard_grid",
    heatingType: "natural_gas",
    dietType: "balanced",
    recyclingHabits: "partial"
  });

  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-emit updates up to parent App state
  useEffect(() => {
    onDataChange(data);
  }, [data]);

  // Handle analytical metrics calculation strictly client-side for latency-free display
  const calculateEmissions = () => {
    const weeklyDistance = data.transportDistance;
    const factor = TRANSPORT_FACTORS[data.transportType] || 0;
    const transportEmissions = weeklyDistance * 52 * factor; // kg per year

    const flightEmissions = data.flightsPerYear * 600; // avg 600kg CO2 per flight standard

    const electricityFactor = ENERGY_FACTORS[data.energySource] || 0.42;
    const energyEmissions = data.electricityBill * 12 * electricityFactor;

    const heatingEmissions = HEATING_FACTORS[data.heatingType] || 0;

    const dietEmissions = DIET_FACTORS[data.dietType] || 1800;

    const wasteEmissions = RECYCLING_FACTORS[data.recyclingHabits] || 500;

    const totalKg = transportEmissions + flightEmissions + energyEmissions + heatingEmissions + dietEmissions + wasteEmissions;
    const totalTons = totalKg / 1000;

    return {
      transport: Math.round(transportEmissions),
      flights: Math.round(flightEmissions),
      energy: Math.round(energyEmissions),
      heating: Math.round(heatingEmissions),
      diet: Math.round(dietEmissions),
      waste: Math.round(wasteEmissions),
      total: Number(totalTons.toFixed(1))
    };
  };

  const emissionsBreakdown = calculateEmissions();

  const chartData = [
    { name: "Transport", value: emissionsBreakdown.transport, color: "#18181b" }, // Charcoal
    { name: "Flights", value: emissionsBreakdown.flights, color: "#27272a" },
    { name: "Home Energy", value: emissionsBreakdown.energy, color: "#a3e635" }, // Lime
    { name: "Heating", value: emissionsBreakdown.heating, color: "#d9f99d" }, // Light Lime
    { name: "Diet Choices", value: emissionsBreakdown.diet, color: "#52525b" },
    { name: "Waste & Life", value: emissionsBreakdown.waste, color: "#71717a" }
  ].filter(d => d.value > 0);

  const fetchAIAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ footprintData: data, recentActions })
      });
      if (!response.ok) {
        throw new Error("Analytical endpoint failed to process results.");
      }
      const parsedData = await response.json();
      setAnalysis(parsedData);
    } catch (err: any) {
      console.warn("API/Server unavailable or failed. Initiating high-fidelity local fallback calculations.", err);
      try {
        const localResult = getFallbackAnalyzeResponse(data);
        setAnalysis(localResult);
      } catch (fallbackErr: any) {
        setError("Both remote endpoint and local carbon engine failed to compute the footprint.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getFidelityGrade = (tons: number) => {
    if (tons < 2.5) return { grade: "A+", text: "Exceptional climate guardian! Fits the IPCC 1.5°C threshold.", color: "text-zinc-900 bg-lime-300 border-zinc-900" };
    if (tons < 4.5) return { grade: "B", text: "Healthy consumer footprint. Below developed-nation averages.", color: "text-zinc-900 bg-lime-200 border-zinc-800" };
    if (tons < 7.5) return { grade: "C", text: "Moderate footprint. Opportunities for transition exist.", color: "text-zinc-800 bg-zinc-200 border-zinc-500" };
    if (tons < 11.5) return { grade: "D", text: "High carbon intensity. Substantial potential for direct reduction.", color: "text-zinc-100 bg-zinc-800 border-zinc-900" };
    return { grade: "F", text: "Heavy emission footprint. Requires urgent roadmap optimization.", color: "text-white bg-zinc-900 border-zinc-950" };
  };

  const gradeDetails = getFidelityGrade(emissionsBreakdown.total);

  return (
    <div id="carbon_calc_block" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Parameters Panel */}
      <div id="calc_inputs_wrapper" className="lg:col-span-7 bg-white p-6 md:p-10 rounded-3xl border border-zinc-200/85 space-y-8 shadow-xs">
        <div>
          <span className="text-xs font-black uppercase tracking-[0.2em] text-lime-600 block mb-1">Interactive Input parameters</span>
          <h3 id="panel_header_desc" className="text-2xl font-black text-zinc-900 tracking-tight uppercase flex items-center gap-2">
            1. Carbon Footprint Estimator
          </h3>
          <p className="text-zinc-400 text-xs font-medium mt-1">Adjust dials to deconstruct and formulate raw green baseline values.</p>
        </div>

        <div className="space-y-6">
          {/* Transport Section */}
          <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200/70">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <Car className="h-4 w-4 text-zinc-800" />
                Commute Distance
              </label>
              <span className="text-xs font-mono font-bold bg-zinc-900 text-lime-400 py-0.5 px-2 rounded">{data.transportDistance} km/week</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="500" 
              step="10"
              value={data.transportDistance}
              onChange={(e) => setData({ ...data, transportDistance: parseInt(e.target.value) })}
              className="w-full accent-zinc-900 cursor-pointer"
            />
            <div className="grid grid-cols-5 gap-1 mt-4">
              {Object.keys(TRANSPORT_FACTORS).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setData({ ...data, transportType: key })}
                  className={`text-[10px] py-1.5 border rounded-lg transition-all capitalize whitespace-nowrap overflow-hidden text-ellipsis px-1 font-extrabold tracking-wide uppercase ${
                    data.transportType === key 
                      ? "border-zinc-900 bg-zinc-900 text-lime-400 shadow-2xs" 
                      : "border-zinc-200 bg-white text-zinc-400 hover:text-zinc-900"
                  }`}
                  title={key.replace("_", " ")}
                >
                  {key.split("_").map(w => w === "ev" ? "EV" : w).join(" ")}
                </button>
              ))}
            </div>
          </div>

          {/* Flights Section */}
          <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200/70">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <Plane className="h-4 w-4 text-zinc-800" />
                Air Travel
              </label>
              <span className="text-xs font-mono font-bold bg-zinc-900 text-lime-400 py-0.5 px-2 rounded text-rose-450">{data.flightsPerYear} flights/year</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="15" 
              step="1"
              value={data.flightsPerYear}
              onChange={(e) => setData({ ...data, flightsPerYear: parseInt(e.target.value) })}
              className="w-full accent-zinc-900 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1 px-1">
              <span>0 (Local)</span>
              <span>5 (Frequent)</span>
              <span>15 (Corporate Elite)</span>
            </div>
          </div>

          {/* Energy usage Section */}
          <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200/70">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <Home className="h-4 w-4 text-zinc-800" />
                Electricity Consumption
              </label>
              <span className="text-xs font-mono font-bold bg-zinc-900 text-lime-400 py-0.5 px-2 rounded">{data.electricityBill} kWh/month</span>
            </div>
            <input 
              type="range" 
              min="50" 
              max="1000" 
              step="25"
              value={data.electricityBill}
              onChange={(e) => setData({ ...data, electricityBill: parseInt(e.target.value) })}
              className="w-full accent-zinc-900 cursor-pointer"
            />
            <div className="grid grid-cols-4 gap-1 mt-4">
              {Object.keys(ENERGY_FACTORS).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setData({ ...data, energySource: key })}
                  className={`text-[9px] py-1.5 border rounded-lg transition-all px-1 font-bold uppercase tracking-wider ${
                    data.energySource === key 
                      ? "border-zinc-900 bg-zinc-900 text-lime-400" 
                      : "border-zinc-200 bg-white text-zinc-400 hover:text-zinc-900"
                  }`}
                >
                  {key.split("_").join(" ")}
                </button>
              ))}
            </div>
          </div>

          {/* Home heating & culinary diet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/70">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
                <Flame className="h-3.5 w-3.5 text-zinc-800" />
                Heating Engine
              </label>
              <select
                value={data.heatingType}
                onChange={(e) => setData({ ...data, heatingType: e.target.value })}
                className="w-full text-xs font-bold uppercase tracking-wider bg-white border border-zinc-200 py-2.5 px-3 rounded-xl text-zinc-800 focus:border-zinc-900 focus:outline-hidden"
              >
                <option value="natural_gas">Gas Boiler</option>
                <option value="heating_oil">Heavy Fuel Oil/Coal</option>
                <option value="heat_pump">Eco Heat Pump</option>
                <option value="none_clean">No Heat / Solar</option>
              </select>
            </div>

            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/70">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
                <Utensils className="h-3.5 w-3.5 text-zinc-800" />
                Diet Choice
              </label>
              <select
                value={data.dietType}
                onChange={(e) => setData({ ...data, dietType: e.target.value })}
                className="w-full text-xs font-bold uppercase tracking-wider bg-white border border-zinc-200 py-2.5 px-3 rounded-xl text-zinc-800 focus:border-zinc-900 focus:outline-hidden"
              >
                <option value="meat_heavy">Meat Heavy Options</option>
                <option value="balanced">Balanced / Average</option>
                <option value="vegetarian">Vegetarian Regime</option>
                <option value="vegan">Vegan / Plant-Based</option>
              </select>
            </div>
          </div>

          {/* Lifestyle / Waste reduction */}
          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/70">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
              <Trash2 className="h-3.5 w-3.5 text-zinc-650" />
              Circular Waste index
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(RECYCLING_FACTORS).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setData({ ...data, recyclingHabits: key })}
                  className={`text-xs py-2.5 border rounded-xl transition-all font-bold uppercase tracking-wider ${
                    data.recyclingHabits === key
                      ? "border-zinc-900 bg-zinc-900 text-lime-400"
                      : "border-zinc-200 bg-white text-zinc-400 hover:text-zinc-650"
                  }`}
                >
                  {key === "none" ? "None/Mix" : key === "partial" ? "Mixed Circle" : "Absolute Zero"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="pt-5 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
            Calculated under IPCC 2026 guidelines.
          </div>
          <button
            type="button"
            id="ai_report_trigger_btn"
            disabled={loading}
            onClick={fetchAIAnalysis}
            className="inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-lime-400 border border-zinc-950 font-black uppercase tracking-wider text-xs py-3 px-6 rounded-xl transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin text-lime-400" />
            ) : (
              <Sparkles className="h-4 w-4 text-lime-400 fill-lime-400" />
            )}
            {loading ? "Analyzing variables..." : "Trigger Gemini AI carbon audit"}
          </button>
        </div>
      </div>

      {/* Analytics Visualizers (Bold and Massive text) */}
      <div id="calc_visuals_wrapper" className="lg:col-span-5 space-y-6">
        
        {/* Realtime Carbon Impact Meter - Premium Hero style from theme details */}
        <div className="bg-white p-8 rounded-3xl border border-zinc-200 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-lime-600">Your Annual Footprint</p>
            {/* Massive Swiss / Brutalist Typography */}
            <h1 className="text-[84px] sm:text-[110px] leading-[0.8] font-black tracking-tighter text-zinc-950 font-sans">
              {emissionsBreakdown.total}
              <span className="text-2xl ml-2 font-black text-zinc-400 tracking-normal uppercase">Tons/CO2</span>
            </h1>
            
            <p className="text-zinc-400 font-semibold text-xs leading-relaxed pt-2">
              Your carbon score grade is categorized as <span className="text-zinc-900 underline font-black">{gradeDetails.grade}</span>. {gradeDetails.text}
            </p>
          </div>

          <div className="mt-8 border-t border-zinc-150 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Realtime emission factors</span>
              <span className={`text-xs font-black px-3 py-1 border rounded-lg uppercase tracking-wide leading-none ${gradeDetails.color}`}>
                Grade: {gradeDetails.grade}
              </span>
            </div>

            {/* Minimal dynamic canvas representation */}
            <div className="h-44 mt-2">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="55%"
                      cy="45%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} kg CO2`, 'Impact']} 
                      contentStyle={{ borderRadius: "8px", border: "1px solid #181c20", background: "#18181b", color: "#f4f4f5", fontSize: "11px" }}
                    />
                    <Legend 
                      layout="horizontal" 
                      verticalAlign="bottom" 
                      align="center"
                      iconSize={6}
                      wrapperStyle={{ fontSize: "9px", marginTop: "5px", textTransform: "uppercase", fontWeight: "900" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-400 text-xs">
                  Zero parameters tracked.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Diagnostics Output Box - Slate style with high contrast */}
        {(analysis || error || loading) && (
          <div className="bg-zinc-900 text-zinc-100 p-6 rounded-3xl shadow-md border border-zinc-950 leading-relaxed space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="text-xs font-black text-lime-400 uppercase tracking-[0.15em] flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 fill-lime-400 text-lime-400" />
                Gemini Carbon Strategist
              </span>
              <span className="text-[9px] font-bold bg-zinc-800 text-zinc-400 py-0.5 px-2 rounded-md font-mono border border-zinc-700">
                gemini-3.5-flash
              </span>
            </div>

            {loading && (
              <div className="py-8 text-center flex flex-col items-center gap-3">
                <RefreshCw className="h-6 w-6 animate-spin text-lime-400" />
                <span className="text-xs text-lime-400 font-bold uppercase tracking-wider">Drafting customized climate matrix...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 p-3.5 rounded-lg border border-red-500/20 text-red-200 text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <span>Error logging data: {error}</span>
              </div>
            )}

            {analysis && !loading && (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-zinc-450 uppercase text-[9px] tracking-wider font-extrabold">CO2 Grade Assessment:</span>
                    <span className="font-black text-lime-400 text-lg font-mono">{analysis.rating}</span>
                  </div>
                  <p className="text-zinc-350 leading-relaxed font-medium">{analysis.summary}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-zinc-800 p-3 rounded-xl border border-zinc-750">
                  <div>
                    <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider">Projected Output</p>
                    <p className="font-extrabold font-mono text-lime-300 text-sm">{analysis.projectedAnnualEmissions}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider">Critical Area</p>
                    <p className="font-extrabold text-white text-sm uppercase">{analysis.primaryDriver}</p>
                  </div>
                </div>

                {/* Quick Wins List - Styled using template's green card equivalent blocks (p-6 bg-lime-300) */}
                <div className="space-y-3">
                  <h5 className="font-black text-lime-400 uppercase tracking-widest text-[9px] flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Custom Quick Wins Active
                  </h5>
                  <div className="space-y-2">
                    {analysis.quickWins?.map((win, idx) => (
                      <div key={idx} className="bg-white text-zinc-900 p-3 rounded-xl border border-zinc-950 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-zinc-950 text-xs uppercase tracking-tight">{win.title}</span>
                          <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-lime-300 border border-zinc-900">{win.impact} reduction</span>
                        </div>
                        <p className="text-zinc-500 font-semibold text-[11px] mt-1.5">{win.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Long Term Goals */}
                <div className="space-y-2 pt-3 border-t border-zinc-800">
                  <h5 className="font-black text-zinc-450 uppercase tracking-wider text-[9px] flex items-center gap-1">
                    <TrendingDown className="h-3.5 w-3.5" />
                    Decarbonization Roadmap Goals
                  </h5>
                  <div className="space-y-2.5">
                    {analysis.longTermGoals?.map((goal, idx) => (
                      <div key={idx} className="bg-zinc-800/40 p-2.5 rounded-lg border border-zinc-800">
                        <div className="flex items-center justify-between text-[11px] font-bold text-white uppercase">
                          <span className="flex items-center gap-1 font-extrabold">
                            <ChevronRight className="h-3 w-3 text-lime-400 shrink-0" />
                            {goal.title}
                          </span>
                          <span className="text-[8px] text-lime-300 font-bold font-mono">({goal.timeframe})</span>
                        </div>
                        <p className="text-zinc-400/90 pl-4 mt-1 font-medium leading-normal text-[10px]">{goal.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
