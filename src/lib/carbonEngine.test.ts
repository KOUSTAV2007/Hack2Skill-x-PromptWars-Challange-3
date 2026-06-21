import { describe, it, expect } from "vitest";
import { 
  getFallbackAnalyzeResponse, 
  TRANSPORT_FACTORS, 
  ENERGY_FACTORS, 
  HEATING_FACTORS, 
  DIET_FACTORS, 
  RECYCLING_FACTORS 
} from "./fallback";

describe("Carbon Calculation Engine Fallback Tests", () => {
  it("computes baseline average footprint correctly", () => {
    const baselineData = {
      transportDistance: 120, // km/week
      transportType: "car_petrol", // 0.21 kg/km
      flightsPerYear: 2, // 600 kg/flight
      electricityBill: 250, // kWh/month
      energySource: "standard_grid", // 0.42 kg/kWh
      heatingType: "natural_gas", // 1500 kg
      dietType: "balanced", // 1800 kg
      recyclingHabits: "partial" // 500 kg
    };

    const result = getFallbackAnalyzeResponse(baselineData);

    // Calculations:
    // Transport: 120 * 52 * 0.21 = 1310.4
    // Flights: 2 * 600 = 1200
    // Energy: 250 * 12 * 0.42 = 1260
    // Heating: 1500
    // Diet: 1800
    // Waste: 500
    // Total KG: 1310.4 + 1200 + 1260 + 1500 + 1800 + 500 = 7570.4 kg = 7.5704 tons
    
    expect(result.rating).toBe("D");
    expect(result.primaryDriver).toBe("Dietary Habits"); // 1800 is max
    expect(result.projectedAnnualEmissions).toBe("7.6 tons CO2e/year");
    expect(result.quickWins.length).toBeGreaterThan(0);
    expect(result.longTermGoals.length).toBeGreaterThan(0);
  });

  it("handles low carbon footprints gracefully (Eco-Champions)", () => {
    const pristineData = {
      transportDistance: 10,
      transportType: "bike_walk", // 0.0
      flightsPerYear: 0,
      electricityBill: 50,
      energySource: "solar_renewable", // 0.02
      heatingType: "none_clean", // 0
      dietType: "vegan", // 750
      recyclingHabits: "strict_zero_waste" // 150
    };

    const result = getFallbackAnalyzeResponse(pristineData);

    // Calculations:
    // Transport: 10 * 52 * 0 = 0
    // Flights: 0
    // Energy: 50 * 12 * 0.02 = 12
    // Heating: 0
    // Diet: 750
    // Waste: 150
    // Total KG: 912 kg = 0.912 tons
    
    expect(result.rating).toBe("A+");
    expect(result.primaryDriver).toBe("Dietary Habits"); // 750 is max
    expect(result.projectedAnnualEmissions).toBe("1.0 tons CO2e/year");
  });

  it("handles high carbon offenders correctly", () => {
    const highOffenderData = {
      transportDistance: 500,
      transportType: "car_diesel", // 0.18
      flightsPerYear: 10, // 10 * 600 = 6000
      electricityBill: 800,
      energySource: "coal_grid", // 0.85
      heatingType: "heating_oil", // 2800
      dietType: "meat_heavy", // 2800
      recyclingHabits: "none" // 1000
    };

    const result = getFallbackAnalyzeResponse(highOffenderData);
    
    // Transport: 500 * 52 * 0.18 = 4680
    // Flights: 6000
    // Energy: 800 * 12 * 0.85 = 8160
    // Heating: 2800
    // Diet: 2800
    // Waste: 1000
    // Total: 4680+6000+8160+2800+2800+1000 = 25440 kg = 25.44 tons
    expect(result.rating).toBe("F");
    expect(result.primaryDriver).toBe("Home Electricity"); // 8160 is max
  });

  it("handles empty or missing parameters through defaults", () => {
    const result = getFallbackAnalyzeResponse(null);
    expect(result.projectedAnnualEmissions).toBeDefined();
    expect(result.rating).toBeDefined();
  });

  it("exposes matching factor maps correctly", () => {
    expect(TRANSPORT_FACTORS.car_petrol).toBe(0.21);
    expect(ENERGY_FACTORS.solar_renewable).toBe(0.02);
    expect(HEATING_FACTORS.natural_gas).toBe(1500);
    expect(DIET_FACTORS.vegan).toBe(750);
    expect(RECYCLING_FACTORS.strict_zero_waste).toBe(150);
  });
});
