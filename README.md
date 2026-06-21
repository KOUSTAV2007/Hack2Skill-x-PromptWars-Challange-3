# EcoSustain Carbon Prompt Lab 🧪🌱

Welcome to **EcoSustain Carbon Prompt Lab**, a high-fidelity carbon calculations laboratory and interactive AI Prompt Engineering playground designed for environmental strategy, decarbonization, and rapid variable simulation. This solution is tailor-made for the **Google Prompt Wars** hackathon.

---

## 🌍 1. Chosen Vertical

Our chosen vertical is **Sustainability & Climate Action (Decarbonization Tech)**. 

While simple carbon calculators only display static feedback, and generic prompt builders lack real context, **EcoSustain** bridges this gap. It operates as a full-stack intelligence dashboard where real-life lifestyle statistics (commute, diet, and utilities) are calculated instantly under IPCC guidelines, logged as active daily habits, and then compiled dynamically as live data injections into a structured **Prompt Engineering Laboratory** powered by **Google Gemini**.

---

## ⚙️ 2. Approach & Logic

EcoSustain uses a high-performance **Full-Stack layout** backed by a **Swiss-Modern "Bold Typography" design theme** (featuring heavy zinc backgrounds, massive display headlines, high negative space, and lime-green accents).

### Core Architecture Logic:
* **The Estimator Engine (`/src/components/CarbonCalculator.tsx`)**: Integrates reactive input sliders for commute distance, air travel frequency, power bills, heating types, and diet choices. It outputs dynamic annualized metrics instantly without layout lag, assigning an environmental tier grade from `A+` to `F` according to cumulative IPCC carbon thresholds.
* **The Logbook Tracker (`/src/components/ActionTracker.tsx`)**: Logs completed carbon-saving actions, instantly caching points to award active dynamic badges (e.g., *Carbon Initiate*, *Climate Tactician*, *Zero Carbon Alchemist*) to gamify offset benchmarks.
* **The Prompt Engineering Lab (`/src/components/PromptLab.tsx`)**: Modeled directly after the high-stakes constraints of standard Prompt Engineering challenges (like Google Prompt Wars). It enables users to:
  * Select roleplay personas (expert consultants, survivalists, strictly analytical systems) to test performance models.
  * Adjust strict structural token limits (e.g., Short/Medium/Long formats) and precise temperature configurations.
  * **Inject Real-Time State**: Your local carbon baseline statistics, habits, and objectives are compiled as code blocks and injected into the dynamic request payload.
  * **Server-Authoritative API Route**: Coordinates with a server-side route running `@google/genai` to safe-guard sensitive Gemini parameters and proxy responses cleanly.

---

## 🚀 3. How the Solution Works

1. **Parameters Input**: The user inputs baseline environmental metrics, generating an annual carbon footprint profile (e.g., `12.4 Tons CO2`).
2. **Habit Logging**: The user checks off clean habits (e.g., *Meat-free lunch*, *Eco-mode heating*), accumulating offline carbon-saved points (`KG`) tracked across real-time session stores.
3. **Prompt Composition**: In the laboratory, the user chooses pre-constructed prompt templates targeting custom action plans. The frontend compiles these into standard Markdown roleplay frames, showing exactly how variables are encapsulated.
4. **Execution Sim**: Upon clicking **Run Engineered Prompt Simulator**, the Express backend compiles instructions, queries `gemini-3.5-flash` using correct SDK parameter mappings, and returns real-time diagnostic text alongside approximate latency measurements (`ms`) and calculated token counts.

---

## 📝 4. Made Assumptions

To ensure accurate calculations and reliable simulation within client-sandbox constraints, the following structured assumptions were implemented:

* **Carbon Coefficients (IPCC Averages)**:
  * Public transport is estimated at `0.04 kg/km`, private auto commutes at `0.18 kg/km`, and flight multipliers set at a static `600 kg CO2 / trip` average.
  * Energy source conversions use fixed multipliers (Coal/Gas: ~`0.72 kg/kWh`, Solar/Wind green contracts: ~`0.05 kg/kWh`).
* **Conversion and Estimation logic**:
  * Weekly habits are tracked based on localized household activities. Phone charge equivalent savings are modeled at a static `4.2 charges / kg CO2`.
  * Token telemetry utilizes standard heuristic modeling (`1 token = ~4 characters`) to instantly calculate payload metrics in the playground console and feedback terminals.
