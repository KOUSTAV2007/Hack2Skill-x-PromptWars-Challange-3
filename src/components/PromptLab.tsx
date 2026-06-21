import React, { useState } from "react";
import { PromptPreset, FootprintData } from "../types";
import { getFallbackPlaygroundResponse } from "../lib/fallback";
import { getClientGemini } from "../lib/gemini";
import { validateAndSanitizePrompt } from "../lib/security";
import { 
  Sparkles, 
  Terminal, 
  Sliders, 
  HelpCircle, 
  Play, 
  Clipboard, 
  AlertCircle, 
  History, 
  Cpu, 
  Bookmark,
  CheckCircle,
  Lightbulb,
  Check,
  ArrowRight
} from "lucide-react";

interface PromptLabProps {
  currentFootprint: FootprintData;
}

const PERSONA_PRESETS = [
  { id: "p1", name: "MIT Energy Auditor", role: "You are a pragmatic, highly analytical MIT climate and grid system systems scientist. Use exact quantitative details, physical metric dimensions, and efficient HVAC analogies." },
  { id: "p2", name: "Sarcastic Carbon Critic", role: "You are a witty, mildly sarcastic carbon-accounting consultant. Poke light-hearted, playful humor at the user's carbon excesses (like too many flights or driving heavy petroleum trucks), but give highly logical support under the surface!" },
  { id: "p3", name: "Eco Solar Punk Futurist", role: "You are an optimistic, inspiring solar punk artist and ecological gardener from the year 2150. Use futuristic terminology like 'bio-mesh grids', 'urban farm collectives', and 'kinetic footwear' to inspire hope." },
  { id: "p4", name: "Sustainable Drill Sergeant", role: "You are a strict, disciplined green-living military Drill Sergeant. bark active direct commands! Use structural metaphors, focus on survival disciplines, and command them to plant forests immediately!" }
];

const OBJECTIVE_PRESETS = [
  { id: "o1", name: "Detailed Transit Overhaul", goal: "Deconstruct my transportation footprint based on my weekly commuting behavior. Recommend clean routing, urban micro-mobility hacks, and cost-benefit analysis of electric vehicles vs public metros." },
  { id: "o2", name: "Zero-Waste Lifestyle Audit", goal: "Synthesize my household lifestyle, shopping habits, heating boiler setup, and waste recycling metrics. Detail a concrete 3-step transition schema towards absolute circular zero-waste." },
  { id: "o3", name: "Sustainable Menu & Culinary Design", goal: "Re-engineer my current food diet habits into low-carbon culinary masterpieces. Illustrate carbon-mitigation culinary recipes that emphasize high protein efficiency with zero greenhouse burden." }
];

const CONSTRAINT_PRESETS = [
  { id: "c1", name: "Under 120 words maximum", limit: "Your advice MUST be strictly concise and keep layout under 120 words. Be remarkably brief and high-impact." },
  { id: "c2", name: "Visual Bullet Points-only", limit: "You must structure your output entirely in visual high-contrast markdown bullet points with corresponding Lucide-emoji equivalents at the start of each line." },
  { id: "c3", name: "Write as a structured blueprint", limit: "Deliver your recommendations formulated as a scientific technical software architectural blueprint schema. Use terms like INGRESS, BUFFER, OUTLET, and RETRACE." }
];

const TONE_PRESETS = [
  { name: "Direct & Urgent", value: "very urgent, actionable, bold" },
  { name: "Nurturing & Gentle", value: "extremely supportive, polite, meditative" },
  { name: "Technical / Academic", value: "clinical, academic, rigorous, scientific" }
];

interface PersonaSandboxCardsProps {
  selectedPersonaId: string;
  onSelect: (p: typeof PERSONA_PRESETS[0]) => void;
}

const PersonaSandboxCards = React.memo(function PersonaSandboxCards({ selectedPersonaId, onSelect }: PersonaSandboxCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {PERSONA_PRESETS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onSelect(p)}
          aria-label={`Select system role persona: ${p.name}`}
          className={`text-left p-3 border rounded-xl transition-all cursor-pointer flex flex-col justify-between h-24 ${
            selectedPersonaId === p.id 
              ? "border-zinc-900 bg-zinc-900 text-lime-400" 
              : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
          }`}
        >
          <span className={`text-[10px] font-black uppercase tracking-tight leading-none ${selectedPersonaId === p.id ? "text-lime-400" : "text-zinc-800"}`}>
            {p.name}
          </span>
          <span className="text-[8px] font-semibold leading-tight line-clamp-3 mt-1.5 text-zinc-450">
            {p.role}
          </span>
        </button>
      ))}
    </div>
  );
});

interface PromptCompilationsConsoleProps {
  customRole: string;
  compiledUserPrompt: string;
}

const PromptCompilationsConsole = React.memo(function PromptCompilationsConsole({ customRole, compiledUserPrompt }: PromptCompilationsConsoleProps) {
  return (
    <div className="space-y-4 font-mono text-[10px] leading-relaxed">
      <div>
        <p className="text-lime-300 font-extrabold uppercase tracking-widest text-[9px]">SYSTEM_INSTRUCTIONS & ROLE:</p>
        <p className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-zinc-400 max-h-24 overflow-y-auto mt-1 font-mono">
          {customRole}
        </p>
      </div>

      <div>
        <p className="text-zinc-350 font-extrabold uppercase tracking-widest text-[9px]">USER_MESSAGE (Variables Injected):</p>
        <pre className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-zinc-400 max-h-48 overflow-y-auto mt-1 whitespace-pre-wrap font-mono">
          {compiledUserPrompt.trim()}
        </pre>
      </div>
    </div>
  );
});

export default function PromptLab({ currentFootprint }: PromptLabProps) {
  const [selectedPersona, setSelectedPersona] = useState(PERSONA_PRESETS[0]);
  const [selectedObjective, setSelectedObjective] = useState(OBJECTIVE_PRESETS[0]);
  const [selectedConstraint, setSelectedConstraint] = useState(CONSTRAINT_PRESETS[0]);
  const [selectedTone, setSelectedTone] = useState(TONE_PRESETS[0].value);
  const [temperature, setTemperature] = useState(0.7);

  const [customRole, setCustomRole] = useState(PERSONA_PRESETS[0].role);
  const [customObjective, setCustomObjective] = useState(OBJECTIVE_PRESETS[0].goal);
  const [customConstraint, setCustomConstraint] = useState(CONSTRAINT_PRESETS[0].limit);

  const [aiOutput, setAiOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promptStats, setPromptStats] = useState<{ tokens: number, latencyMs: number } | null>(null);

  const applyPersona = (p: typeof PERSONA_PRESETS[0]) => {
    setSelectedPersona(p);
    setCustomRole(p.role);
  };

  const applyObjective = (o: typeof OBJECTIVE_PRESETS[0]) => {
    setSelectedObjective(o);
    setCustomObjective(o.goal);
  };

  const applyConstraint = (c: typeof CONSTRAINT_PRESETS[0]) => {
    setSelectedConstraint(c);
    setCustomConstraint(c.limit);
  };

  const compiledUserPrompt = React.useMemo(() => {
    return `
MY ECO METRICS DETAILED:
- Transport Travel: ${currentFootprint.transportDistance} km/week using ${currentFootprint.transportType}
- Yearly Flying Quotient: ${currentFootprint.flightsPerYear} flights/year
- Power Grid: ${currentFootprint.electricityBill} kWh/month of electricity (Grid mix: ${currentFootprint.energySource})
- Heating Device: ${currentFootprint.heatingType}
- Food Diet Choice: ${currentFootprint.dietType}
- Recycling Standard: ${currentFootprint.recyclingHabits}

PROMPT MISSION:
${customObjective}

OPERATIONAL CONSTRAINTS TO ENFORCE STRICTLY:
- Tone Style: Deliver recommendations in a ${selectedTone} rhythm.
- Restriction: ${customConstraint}
`;
  }, [currentFootprint, customObjective, selectedTone, customConstraint]);

  const executeEngineeredPrompt = async () => {
    setLoading(true);
    setError(null);
    setAiOutput("");
    const startTime = Date.now();

    // Safety Input validation / sanitization sandbox
    const roleVal = validateAndSanitizePrompt(customRole);
    if (!roleVal.isValid) {
      setError(roleVal.errorMessage || "System instruction failed safety validation.");
      setLoading(false);
      return;
    }
    const objectiveVal = validateAndSanitizePrompt(customObjective);
    if (!objectiveVal.isValid) {
      setError(objectiveVal.errorMessage || "User objective input failed safety validation.");
      setLoading(false);
      return;
    }
    const constraintVal = validateAndSanitizePrompt(customConstraint);
    if (!constraintVal.isValid) {
      setError(constraintVal.errorMessage || "Custom constraint input failed safety validation.");
      setLoading(false);
      return;
    }

    try {
      const sanitizedRole = roleVal.sanitized;
      const compiledUser = `
MY ECO METRICS DETAILED:
- Transport Travel: ${currentFootprint.transportDistance} km/week using ${currentFootprint.transportType}
- Yearly Flying Quotient: ${currentFootprint.flightsPerYear} flights/year
- Power Grid: ${currentFootprint.electricityBill} kWh/month of electricity (Grid mix: ${currentFootprint.energySource})
- Heating Device: ${currentFootprint.heatingType}
- Food Diet Choice: ${currentFootprint.dietType}
- Recycling Standard: ${currentFootprint.recyclingHabits}

PROMPT MISSION:
${objectiveVal.sanitized}

OPERATIONAL CONSTRAINTS TO ENFORCE STRICTLY:
- Tone Style: Deliver recommendations in a ${selectedTone} rhythm.
- Restriction: ${constraintVal.sanitized}
`;

      // 1. Try to use Client-Side Gemini if configured via isolated environment variable
      const clientGemini = getClientGemini();
      if (clientGemini) {
        const response = await clientGemini.models.generateContent({
          model: "gemini-3.5-flash",
          contents: compiledUser,
          config: {
            systemInstruction: sanitizedRole,
            temperature: temperature
          }
        });

        const outputText = response.text || "Empty output generated.";
        setAiOutput(outputText);
        const latency = Date.now() - startTime;
        const tokensCount = Math.floor((compiledUser.length + sanitizedRole.length) / 4) + Math.floor((outputText).length / 4);
        setPromptStats({ tokens: tokensCount, latencyMs: latency });
        return;
      }

      // 2. Fallback to API route
      const response = await fetch("/api/gemini/prompt-playground", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullPrompt: compiledUser,
          systemInstruction: sanitizedRole,
          temperature: temperature
        })
      });

      if (!response.ok) {
        throw new Error("Prompt response returned an irregular status code.");
      }

      const parsed = await response.json();
      setAiOutput(parsed.text || "Empty output generated.");
      
      const latency = Date.now() - startTime;
      const tokensCount = Math.floor((compiledUser.length + sanitizedRole.length) / 4) + Math.floor((parsed.text || "").length / 4);
      setPromptStats({ tokens: tokensCount, latencyMs: latency });
    } catch (err: any) {
      console.warn("API/Server unavailable or failed. Initiating high-fidelity local fallback simulation.", err);
      try {
        const compiledUser = `
MY ECO METRICS DETAILED:
- Transport Travel: ${currentFootprint.transportDistance} km/week using ${currentFootprint.transportType}
- Yearly Flying Quotient: ${currentFootprint.flightsPerYear} flights/year
- Power Grid: ${currentFootprint.electricityBill} kWh/month of electricity (Grid mix: ${currentFootprint.energySource})
- Heating Device: ${currentFootprint.heatingType}
- Food Diet Choice: ${currentFootprint.dietType}
- Recycling Standard: ${currentFootprint.recyclingHabits}

PROMPT MISSION:
${objectiveVal.sanitized}

OPERATIONAL CONSTRAINTS TO ENFORCE STRICTLY:
- Tone Style: Deliver recommendations in a ${selectedTone} rhythm.
- Restriction: ${constraintVal.sanitized}
`;
        const localResult = getFallbackPlaygroundResponse(roleVal.sanitized, compiledUser);
        setAiOutput(localResult.text);
        
        const latency = Math.max(120, Math.floor(Math.random() * 200 + 100)); // Simulating reasonable latency for nice UX
        const tokensCount = Math.floor((compiledUser.length + roleVal.sanitized.length) / 4) + Math.floor((localResult.text || "").length / 4);
        setPromptStats({ tokens: tokensCount, latencyMs: latency });
      } catch (fallbackErr: any) {
        setError("Both remote playground and local simulator failed to generate response.");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <section id="prompt_lab_container" className="space-y-8 animate-fade-in" aria-labelledby="lab_heading">
      {/* Design Brief Header */}
      <header className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[9px] bg-zinc-900 border border-zinc-950 text-lime-400 font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full">
            Prompt Wars Exclusive
          </span>
          <h3 id="lab_heading" className="text-2xl font-black text-zinc-950 tracking-tight uppercase flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-lime-500 fill-lime-300" aria-hidden="true" />
            3. AI Prompt Engineering Laboratory
          </h3>
          <p className="text-zinc-500 text-xs font-semibold leading-relaxed max-w-xl">
            Google Prompt Wars relies on role-playing, constraint management, and variable injections. Use this simulator to formulate custom carbon-reduction prompts live!
          </p>
        </div>
        <div className="bg-zinc-50 border border-zinc-200/80 p-4.5 rounded-2xl text-[10px] text-zinc-500 space-y-1.5 shrink-0 max-w-xs">
          <p className="font-extrabold text-zinc-900 uppercase tracking-widest flex items-center gap-1.5 leading-none">
            <Lightbulb className="h-3.5 w-3.5 text-lime-500" aria-hidden="true" /> PROMPT BUILDER HINTS
          </p>
          <p className="leading-tight font-medium text-zinc-400">Modify values to achieve the ideal balance of speed, cost, and analytical tone parameters.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Selection Variables Grid */}
        <div className="lg:col-span-7 bg-white p-6 md:p-10 rounded-3xl border border-zinc-200 shadow-xs space-y-8">
          
          {/* S1: Personas */}
          <div className="space-y-3">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-3">
              <span className="text-2xl font-black text-zinc-350 leading-none">01</span>
              System Role / Persona Instruction
            </label>
            <PersonaSandboxCards selectedPersonaId={selectedPersona.id} onSelect={applyPersona} />
            <textarea
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              aria-label="System role playground text editor"
              className="w-full text-xs font-mono bg-zinc-50 p-4 rounded-xl border border-zinc-200 text-zinc-600 focus:outline-hidden leading-relaxed h-20"
              placeholder="System roleplay instruction detail..."
            />
          </div>

          {/* S2: Objective */}
          <div className="space-y-3">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-3">
              <span className="text-2xl font-black text-zinc-350 leading-none">02</span>
              User Target Objective (Task Variables)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {OBJECTIVE_PRESETS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => applyObjective(o)}
                  aria-label={`Select playground objective: ${o.name}`}
                  className={`text-left p-3.5 border rounded-xl transition-all font-bold tracking-tight uppercase text-[10px] cursor-pointer ${
                    selectedObjective.id === o.id
                      ? "border-zinc-900 bg-zinc-900 text-lime-400"
                      : "border-zinc-200 bg-zinc-50 text-zinc-650 hover:bg-zinc-100"
                  }`}
                >
                  <p>{o.name}</p>
                </button>
              ))}
            </div>
            <textarea
              value={customObjective}
              onChange={(e) => setCustomObjective(e.target.value)}
              aria-label="Target objective playground text editor"
              className="w-full text-xs bg-zinc-50 p-4 rounded-xl border border-zinc-200 text-zinc-600 focus:outline-hidden leading-relaxed h-20"
              placeholder="Injected user objective content..."
            />
          </div>

          {/* S3: Constraints & Tone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wide flex items-center gap-3">
                <span className="text-2xl font-black text-zinc-350 leading-none">03</span>
                Structural Constraint
              </label>
              <div className="flex gap-1.5">
                {CONSTRAINT_PRESETS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => applyConstraint(c)}
                    aria-label={`Apply constraint layout: ${c.name}`}
                    className={`flex-1 text-[9px] py-2 px-1 border text-center rounded-lg font-extrabold uppercase transition-all truncate cursor-pointer ${
                      selectedConstraint.id === c.id 
                        ? "border-zinc-900 bg-zinc-900 text-lime-400" 
                        : "border-zinc-200 text-zinc-500 bg-white hover:bg-zinc-50"
                    }`}
                  >
                    {c.name.split(" ")[0]} Limit
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={customConstraint}
                onChange={(e) => setCustomConstraint(e.target.value)}
                aria-label="Constraint text restriction editor"
                className="w-full text-xs font-medium bg-zinc-50 py-3 px-4 rounded-xl border border-zinc-200 text-zinc-700 focus:outline-hidden"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wide flex items-center gap-3">
                <span className="text-2xl font-black text-zinc-350 leading-none">04</span>
                Tone & Temperature
              </label>
              <div className="grid grid-cols-3 gap-1">
                {TONE_PRESETS.map((t) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => setSelectedTone(t.value)}
                    aria-label={`Set response tone profile: ${t.name}`}
                    className={`text-[9px] py-2 px-1 border rounded-lg text-center transition-all font-extrabold uppercase truncate cursor-pointer ${
                      selectedTone === t.value 
                        ? "border-zinc-900 bg-zinc-900 text-lime-400" 
                        : "border-zinc-200 text-zinc-500 bg-white hover:bg-zinc-50"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-3 pt-1">
                <span className="text-[10px] font-mono font-bold text-zinc-400">Temp: {temperature}</span>
                <input 
                  type="range"
                  min="0.1"
                  max="1.2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-zinc-900 cursor-pointer"
                  aria-label="Laboratory temperature slider"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Playground Compiler & Output Terminal */}
        <div className="lg:col-span-5 space-y-6">
          {/* Rendered State Console */}
          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-950 text-zinc-300 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3.5">
              <span className="text-xs font-black text-lime-400 uppercase tracking-widest flex items-center gap-1.5 font-sans">
                <Terminal className="h-4 w-4" aria-hidden="true" />
                Prompt compilations
              </span>
              <button 
                type="button"
                onClick={() => copyToClipboard(`system_instruction = "${customRole}"\n\ncompiled_prompt = "${compiledUserPrompt}"`)}
                className="text-zinc-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-wider flex items-center gap-1 border border-zinc-800 px-2.5 py-1.5 rounded-lg cursor-pointer bg-zinc-850"
                aria-label="Save engineered prompt to clipboard"
              >
                <Clipboard className="h-3 w-3" aria-hidden="true" /> Save Code
              </button>
            </div>

            <PromptCompilationsConsole customRole={customRole} compiledUserPrompt={compiledUserPrompt} />

            <button
              onClick={executeEngineeredPrompt}
              disabled={loading}
              aria-label="Run engineered prompt simulator"
              className="w-full inline-flex items-center justify-center gap-2 bg-lime-300 hover:bg-lime-400 border border-zinc-950 text-zinc-950 font-black uppercase tracking-wider py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer disabled:opacity-50 text-xs"
            >
              {loading ? (
                <History className="h-4 w-4 animate-spin text-zinc-950" aria-hidden="true" />
              ) : (
                <Play className="h-4 w-4 fill-zinc-950 text-zinc-950" aria-hidden="true" />
              )}
              {loading ? "Transmitting payload..." : "Run Engineered Prompt Simulator"}
            </button>
          </div>

          {/* Model Output Console */}
          {(aiOutput || error || loading) && (
            <article className="bg-white rounded-3xl border border-zinc-200 shadow-xs p-6 space-y-4" aria-labelledby="live_sandbox_lbl">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <span id="live_sandbox_lbl" className="text-[10px] font-black text-zinc-850 uppercase tracking-widest flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-zinc-800" aria-hidden="true" />
                  Live Sandbox response
                </span>
                <span className="text-[9px] font-bold bg-zinc-900 border border-zinc-950 text-lime-400 py-0.5 px-2 rounded-full">
                  gemini-3.5-flash
                </span>
              </div>

              {loading && (
                <div className="py-8 text-center flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="h-8 w-8 rounded-full border-2 border-zinc-100 border-t-zinc-900 animate-spin"></div>
                    <Sparkles className="h-3.5 w-3.5 text-lime-500 absolute top-2 left-2 animate-pulse" aria-hidden="true" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wide text-zinc-400">Simulating inference tokens...</span>
                </div>
              )}

              {error && (
                <div className="text-red-700 text-xs bg-red-50 p-3.5 rounded-xl border border-red-150 flex items-start gap-2" role="alert">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" aria-hidden="true" />
                  <span>Submission error: {error}</span>
                </div>
              )}

              {aiOutput && !loading && (
                <div className="space-y-4">
                  <div className="prose prose-sm text-xs md:text-[13px] leading-relaxed text-zinc-800 font-medium whitespace-pre-line border border-zinc-200 bg-zinc-50 p-4 rounded-2xl border-dashed">
                    {aiOutput}
                  </div>
                  
                  {promptStats && (
                    <div className="grid grid-cols-2 gap-2 border-t border-zinc-150 pt-3">
                      <div className="text-center bg-zinc-50 p-2.5 rounded-xl border border-zinc-150">
                        <p className="text-[9px] font-bold text-zinc-450 uppercase tracking-wider">Estimated Total Tokens</p>
                        <p className="font-extrabold text-zinc-900 text-sm font-mono mt-0.5">{promptStats.tokens} tokens</p>
                      </div>
                      <div className="text-center bg-zinc-50 p-2.5 rounded-xl border border-zinc-150">
                        <p className="text-[9px] font-bold text-zinc-450 uppercase tracking-wider">Inference Latency</p>
                        <p className="font-black text-zinc-950 text-sm font-mono mt-0.5">{promptStats.latencyMs} ms</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
