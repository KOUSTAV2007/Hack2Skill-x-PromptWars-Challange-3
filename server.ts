import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy initialization of GenAI client
let _ai: GoogleGenAI | null = null;
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  if (!_ai) {
    _ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return _ai;
}

// Factors for fallback local calculations
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

// Fallback Carbon Analysis Generator
function getFallbackAnalyzeResponse(footprintData: any) {
  const data = footprintData || {
    transportDistance: 120,
    transportType: "car_petrol",
    flightsPerYear: 2,
    electricityBill: 250,
    energySource: "standard_grid",
    heatingType: "natural_gas",
    dietType: "balanced",
    recyclingHabits: "partial"
  };

  const transportEmissions = (Number(data.transportDistance) || 0) * 52 * (TRANSPORT_FACTORS[data.transportType] || 0.18);
  const flightEmissions = (Number(data.flightsPerYear) || 0) * 600;
  const electricityFactor = ENERGY_FACTORS[data.energySource] || 0.42;
  const energyEmissions = (Number(data.electricityBill) || 0) * 12 * electricityFactor;
  const heatingEmissions = HEATING_FACTORS[data.heatingType] || 0;
  const dietEmissions = DIET_FACTORS[data.dietType] || 1800;
  const wasteEmissions = RECYCLING_FACTORS[data.recyclingHabits] || 500;

  const totalKg = transportEmissions + flightEmissions + energyEmissions + heatingEmissions + dietEmissions + wasteEmissions;
  const totalTons = totalKg / 1000;

  const categories = [
    { name: "Transport & Commute", value: transportEmissions },
    { name: "Air Travel", value: flightEmissions },
    { name: "Home Electricity", value: energyEmissions },
    { name: "Heating Fuels", value: heatingEmissions },
    { name: "Dietary Habits", value: dietEmissions },
    { name: "Waste Disposal", value: wasteEmissions }
  ];
  categories.sort((a, b) => b.value - a.value);
  const primaryDriver = categories[0].name;

  let rating = "C";
  if (totalTons < 2.5) rating = "A+";
  else if (totalTons < 4.5) rating = "B";
  else if (totalTons < 7.5) rating = "C";
  else if (totalTons < 11.5) rating = "D";
  else rating = "F";

  let summary = "";
  if (primaryDriver === "Transport & Commute") {
    summary = `Your primary carbon driver is transit from weekly commuting (${data.transportDistance} km using ${data.transportType}). Reducing car journeys, combining trips, or switching to carpooling or public options will significantly lower your footprint.`;
  } else if (primaryDriver === "Air Travel") {
    summary = `Your annual flights are the largest contributor to your greenhouse gas emissions, representing ${flightEmissions.toFixed(0)} kg of carbon offset requirements. Consider utilizing train travel for middle-distance routes or carbon offsetting verified tickets.`;
  } else if (primaryDriver === "Home Electricity" || primaryDriver === "Heating Fuels") {
    summary = `Your household energy patterns are currently the main source of emissions. Upgrading to high-efficiency devices, enrolling in a green utility bundle, or maintaining a heat pump will create a direct drop in impact metric points.`;
  } else if (primaryDriver === "Dietary Habits") {
    summary = `Your diet choice (${data.dietType}) represents a high percentage of your overall emissions. Introducing plant-based days, or making localized grocery purchases, serves as an easy transition to a lower threshold.`;
  } else {
    summary = `Your aggregate footprint calculates to ${totalTons.toFixed(1)} tons CO2e annually. Your key area of friction lies in waste and general consumption drivers. Transitioning to direct waste recycling loops represents your most secure path downward.`;
  }

  summary = `${summary}`;

  const quickWins = [];
  const longTermGoals = [];

  if (data.transportType && data.transportType.includes("car")) {
    quickWins.push({
      title: "Work-commute carpool",
      impact: "High",
      description: "Share rides 2 days a week to save up to 350 kg CO2 annually."
    });
    longTermGoals.push({
      title: "Transition to Hybrid or Electric Vehicle",
      timeframe: "1-2 years",
      description: "Replace combustion engines with an EV, shrinking weekly commute emissions by 80%."
    });
  } else {
    quickWins.push({
      title: "Optimize Route Travel",
      impact: "Low",
      description: "Plan and combine multiple stops into a single continuous journey to preserve fuel variables."
    });
  }

  if (Number(data.electricityBill) > 150) {
    quickWins.push({
      title: "Audit Energy Phantom Loads",
      impact: "Medium",
      description: "Disconnect standby devices and electronics to reduce constant power usage by 10%."
    });
  }
  if (data.energySource === "standard_grid" || data.energySource === "coal_grid") {
    quickWins.push({
      title: "Unenroll from Coal Utilities",
      impact: "High",
      description: "Switch to a renewable solar/wind mix option on your current utility bill supplier."
    });
    longTermGoals.push({
      title: "Rooftop Solar Array Provisioning",
      timeframe: "3-5 years",
      description: "Install dynamic residential solar cells with storage battery banks to isolate standard grid demand."
    });
  }

  if (data.dietType === "meat_heavy" || data.dietType === "balanced") {
    quickWins.push({
      title: "Adopt Meat-Free Mondays",
      impact: "Medium",
      description: "Transitioning to plant-based diet lunches once a week cancels around 150 kg CO2 / year."
    });
  }
  if (data.dietType !== "vegan") {
    longTermGoals.push({
      title: "Gradual Vegetarian/Vegan Shift",
      timeframe: "6 months",
      description: "Slowly increase vegetarian rations to permanently lower diet carbon friction."
    });
  }

  if (data.heatingType === "natural_gas" || data.heatingType === "heating_oil") {
    quickWins.push({
      title: "Reduce Thermostat by 1.5°C",
      impact: "Medium",
      description: "Lower heater setting during sleep cycles to trim annual thermal fuel burn by 15%."
    });
    longTermGoals.push({
      title: "High-Efficiency Aerothermal Heat Pump",
      timeframe: "2-3 years",
      description: "Install a low-draw aerothermal heat pump to replace legacy fossil fuel boilers."
    });
  }

  if (quickWins.length === 0) {
    quickWins.push({
      title: "Sustain Current Low Habits",
      impact: "Low",
      description: "Your baseline is pristine! Conduct quarterly compliance checks to secure your level."
    });
  }
  if (longTermGoals.length === 0) {
    longTermGoals.push({
      title: "Community Decarbonization Advocate",
      timeframe: "Continuous",
      description: "Promote municipal climate action programs to scale localized clean energy transitions."
    });
  }

  return {
    summary,
    projectedAnnualEmissions: `${totalTons.toFixed(1)} tons CO2e/year`,
    rating,
    primaryDriver,
    quickWins: quickWins.slice(0, 3),
    longTermGoals: longTermGoals.slice(0, 2)
  };
}

// Fallback Playground Simulator
function getFallbackPlaygroundResponse(systemInstruction: string, fullPrompt: string) {
  const instruction = (systemInstruction || "").toLowerCase();
  const prompt = (fullPrompt || "").toLowerCase();

  // Extract variables if possible
  const transportMatch = fullPrompt.match(/Transport Travel:\s*([^\n]+)/i);
  const powerMatch = fullPrompt.match(/Power Grid:\s*([^\n]+)/i);
  const dietMatch = fullPrompt.match(/Food Diet Choice:\s*([^\n]+)/i);

  const transportStr = transportMatch ? transportMatch[1].trim() : "moderate commute";
  const powerStr = powerMatch ? powerMatch[1].trim() : "average grid";
  const dietStr = dietMatch ? dietMatch[1].trim() : "balanced";

  let isConstraintLimit = prompt.includes("under 120 words");
  let isConstraintBullet = prompt.includes("bullet points");

  let bodyText = "";

  if (instruction.includes("energy auditor") || instruction.includes("mit")) {
    if (isConstraintLimit) {
      bodyText = `[MIT Sandbox Simulation]
AUDIT VERDICT: Commute metrics represent active variables.
1. TRANSIT COEFFICIENTS: Your transit profile of ${transportStr} represents moderate density. Switch to public options or EVs for carbon minimization.
2. DIETARY SINKS: Transitioning your ${dietStr} menu to legumes decreases daily greenhouse factors by 35%.
3. POWER INGRESS: Powered by ${powerStr}. Recommend installing 3.2kW photovoltaic panel arrays.`;
    } else if (isConstraintBullet) {
      bodyText = `[MIT Sandbox Simulation]
* 🚥 Commute Overhead: Travel of ${transportStr} is a high-yield reduction target. Choose clean fuel vectors.
* 🥗 Protein Ingress: Elevate carbon efficiency of your ${dietStr} habits by introducing vertical agricultural products.
* 🔌 Energy Outflow: Relying on ${powerStr} has standard coefficient buffers. Target lower draw rates.`;
    } else {
      bodyText = `[MIT Sandbox Simulation]
SYSTEM CONFIG BLUEPRINT:
========================
INGRESS NODES:
- INPUT_TRANSIT: ${transportStr}
- INPUT_DIET: ${dietStr}
- INPUT_POWER: ${powerStr}

RETRACE REMEDIAL SCHEMAS:
1. TRANSIT_BYPASS: Swap high-friction vehicles for public rapid hubs.
2. NUTRIENT_BUFFER: Supplement standard rations to isolate agricultural intensity.
3. CONSTRAIN_GRID: Deploy micro-generation cells to offset general utility reliance.`;
    }
  } else if (instruction.includes("sarcastic") || instruction.includes("critic")) {
    if (isConstraintLimit) {
      bodyText = `[Sarcastic Critic Sandbox Simulation]
Oh, look at you! Commuting ${transportStr} and eating a ${dietStr} diet while pretending to lead the green revolution!
1. The Commute: Traveling ${transportStr}? Your local bicycle group is dry-crying. Get carbon-efficient!
2. The Plate: Your diet is ${dietStr}. Cows are currently throwing a festival in your honor. Introduce plant days!
3. The Plug: Sourcing energy from ${powerStr}? The coal plant manager says you're his absolute hero. Switch to a green mix contract!`;
    } else if (isConstraintBullet) {
      bodyText = `[Sarcastic Critic Sandbox Simulation]
* 🚗 Walking must have gone out of style because you commute ${transportStr}. Try walking or metro transit!
* 🍔 That ${dietStr} menu is amazing, provided you want the polar ice caps to melt faster. Switch to salads!
* 🔌 Sourcing electricity from ${powerStr}? Let's unplug those phantom chargers before you power down the entire city list!`;
    } else {
      bodyText = `[Sarcastic Critic Simulation]
EMERGENCY CRITIQUE WORKBOOK:
============================
1. INGRESS VEHICULAR SINKS: Running a commute of ${transportStr}. Walk more, or prepare to be roasted!
2. CONSTRAINING ENERGY OVERHEAD: Sourced by ${powerStr}. Retrace your utility feed or turn off the lights!
3. AUDITING PROTEIN LOADS: Running ${dietStr} menu options. Add a spinach-and-lentils buffer immediately.`;
    }
  } else if (instruction.includes("solar punk") || instruction.includes("punk") || instruction.includes("futurist")) {
    if (isConstraintLimit) {
      bodyText = `[Solar Punk Sandbox Simulation]
Warm greetings from our lush future eco-commune in the year 2150!
1. KINETIC HARVESTS: Your commute travel (${transportStr}) is a perfect candidate for clean micro-mobility grids or shared solar trams.
2. BOTANICAL FEEDBACK: Integrate your diet (${dietStr}) into local vertical food arrays, maximizing community soil nutrition.
3. HARVESTING THE WIND: Move from standard grid inputs (${powerStr}) into organic photobioreactors and micro wind catchers on your rooftop.`;
    } else if (isConstraintBullet) {
      bodyText = `[Solar Punk Sandbox Simulation]
* 🍇 Botanical Abundance: Transition your ${dietStr} menu into seasonal community kitchen crop harvesting.
* 🚲 Clean Currents: Convert commute travels (${transportStr}) to kinetic micro-grids and shared bicycle corridors.
* ☀️ Skyward Collectors: Leverage photovoltaic ivy instead of pulling dirty electricity from standard grid ${powerStr}.`;
    } else {
      bodyText = `[Solar Punk Simulation]
RESTORE COEXISTENCE ARCHITECTURE [YEAR 2150]:
=============================================
1. INGRESS ENERGY HARVESTS: Swap reliance on ${powerStr} with community-directed smart wind arrays.
2. ECO COMMUNITY TRANSIT: Commute loop (${transportStr}) transitions to clean bicycle loops and mass solar rails.
3. BOTANICAL BUFFER OUTLETS: Your diet (${dietStr}) is paired with localized cooperative greenhouse crops.`;
    }
  } else if (instruction.includes("sergeant") || instruction.includes("drill")) {
    if (isConstraintLimit) {
      bodyText = `[Drill Sergeant Sandbox Simulation]
ATTENTION, DRY-LANDER! YOU'RE REPORTING A HIGH-CO2 BASELINE!
1. DOUBLE-TIME TO THE METRO: Commuting ${transportStr}? INSUBORDINATION! March, bike, or take the sky-train! 
2. UNPLUG THE DRAW: Running heating and electricity on ${powerStr}? Disconnect those phantom appliances right now, Soldier!
3. VEGGIE DRILL: Your diet of ${dietStr} is slow! Deploy leafy green rations on Wednesdays! Dismissed!`;
    } else if (isConstraintBullet) {
      bodyText = `[Drill Sergeant Sandbox Simulation]
* 🪖 Transit Patrol: Commuting is ${transportStr}! March 3 miles or book a public travel ticket! No lazy excuses!
* 🪖 Diet Rationing: Replace ${dietStr} meat with green vegetable components! Maintain high muscle index!
* 🪖 Energy Command: Power source is ${powerStr}! Cut demand by 30% today! Fire at will!`;
    } else {
      bodyText = `[Drill Sergeant Simulation]
TACTICAL CARBON COMPLIANCE ORDER:
===================================
1. INGRESS STRAT_GRID MANEUVERS: Cut energy waste on grid ${powerStr} or prepare for extra pushups!
2. TRANSIT DEFENSE DEPOT: Re-locate ${transportStr} commute tasks into shared carpool buffers.
3. NUTRITIONAL COMPLIANCE DETACHMENT: Swap ${dietStr} fuel mixtures for immediate zero-carbon veggie soup!`;
    }
  } else {
    if (isConstraintLimit) {
      bodyText = `[Sandbox AI Coach Simulation]
Your metrics suggest high potential for direct climate optimization:
1. Commute Focus: Commuting ${transportStr} is prime for public metro solutions.
2. Power Optimization: Grid source ${powerStr} should be switched to wind/solar renewable credits.
3. Diet Habits: The diet selection of ${dietStr} is best rounded with local organic greens.`;
    } else if (isConstraintBullet) {
      bodyText = `[Sandbox AI Coach Simulation]
* 🌱 Lifestyle Audit: Your diet choice is ${dietStr}. Try introducing vegan lunches.
* 🌱 Commuting Metrics: Traveling ${transportStr} can be optimized via mass transit.
* 🌱 Renewable Mix: Transition from ${powerStr} grid to green certified solar/wind mixes.`;
    } else {
      bodyText = `[Sandbox AI Coach Simulation]
SUSTAINABILITY INSTRUCTIONS ARCHITECTURE:
=========================================
1. COMMUTE INGRESS: Integrate transit nodes representing ${transportStr} into shared transport loops.
2. NUTRIENT BUFFER: Support diet (${dietStr}) with plant-based alternatives to lower emissions.
3. POWER OUTLET: Route utility feeds away from standard grid ${powerStr} to eco-mix options.`;
    }
  }

  return { text: bodyText };
}

// API Endpoint 1: Analyze Carbon Footprint
app.post("/api/gemini/analyze", async (req, res) => {
  const { footprintData, recentActions } = req.body;

  try {
    const aiClient = getGenAIClient();
    if (!aiClient) {
      console.log("Gemini API Key is not set or placeholder. Using high-fidelity local fallback.");
      const fallback = getFallbackAnalyzeResponse(footprintData);
      return res.json(fallback);
    }
    
    const userPrompt = `
Analyze this user's carbon footprint data and recent sustainability actions, and output a highly personalized, supportive, and structured road map.

FOOTPRINT PARAMETERS:
- Weekly Commute: ${footprintData.transportDistance} km using ${footprintData.transportType}
- Yearly Flights: ${footprintData.flightsPerYear} flights
- Electricity Usage: ${footprintData.electricityBill} kWh per month (Source: ${footprintData.energySource})
- Heating System: ${footprintData.heatingType}
- Dictated Diet: ${footprintData.dietType}
- Recycling Habits: ${footprintData.recyclingHabits} (Waste index)

COMPLETED GREEN ACTIONS RECENTLY:
${recentActions && recentActions.length > 0 
  ? recentActions.map((a: any) => `- ${a.title} (Impact Score: ${a.impactLevel})`).join('\n') 
  : "None logged this week."}

You MUST follow this exact JSON structure for your response. Do not output anything outside of the JSON block:
{
  "summary": "A 2-3 sentence engaging analysis of their primary carbon drivers.",
  "projectedAnnualEmissions": "e.g., 5.4 tons CO2e/year",
  "rating": "A-F grade based on their current habits compared to global developed world averages (approx 8.0 tons CO2e)",
  "primaryDriver": "The biggest area of emission (e.g., Transport, Diet, Housing)",
  "quickWins": [
    {
      "title": "Actionable title",
      "impact": "High/Medium/Low",
      "description": "Short explanation of how to execute and saved CO2 estimation"
    }
  ],
  "longTermGoals": [
    {
      "title": "Long term structural change",
      "timeframe": "Timeframe description",
      "description": "What they should plan or invest in"
    }
  ]
}
`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Error analyzing footprint, falling back to local simulation:", error);
    try {
      const fallback = getFallbackAnalyzeResponse(footprintData);
      res.json(fallback);
    } catch (fallbackError) {
      res.status(500).json({ error: "Failed to analyze footprint due to double crash." });
    }
  }
});

// API Endpoint 2: Prompt Playground and Crafting Wars Simulation
app.post("/api/gemini/prompt-playground", async (req, res) => {
  const { fullPrompt, systemInstruction, temperature } = req.body;

  try {
    const aiClient = getGenAIClient();
    if (!aiClient) {
      console.log("Gemini API Key is not set or placeholder. Using creative playground local fallback.");
      const fallback = getFallbackPlaygroundResponse(systemInstruction, fullPrompt);
      return res.json(fallback);
    }

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: fullPrompt,
      config: {
        systemInstruction: systemInstruction || "You are a supportive and witty green-living coach.",
        temperature: temperature || 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in Prompt Playground, falling back to local simulation:", error);
    try {
      const fallback = getFallbackPlaygroundResponse(systemInstruction, fullPrompt);
      res.json(fallback);
    } catch (fallbackError) {
      res.status(500).json({ error: "Failed to generate playground output." });
    }
  }
});

// Setup Vite & static assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
