export type AQICategory =
  | "Good"
  | "Satisfactory"
  | "Moderate"
  | "Poor"
  | "Very Poor"
  | "Severe";

export interface AirQualityMetadata {
  sourceName: "Open-Meteo Air Quality API (Forecast/Model)" | "Curated Sample Dataset (Demo)";
  isModelEstimate: boolean;
  aqiStandard: "US EPA AQI (Model Estimate)" | "CPCB / WHO Standard Scale";
  fetchedAt: string; // ISO or human readable timestamp
  modelInfo?: string;
}

export interface PollutantInfo {
  id: "pm25" | "pm10" | "no2" | "so2" | "co" | "o3";
  name: string;
  fullName: string;
  value: number;
  unit: string;
  safeBenchmark: number; // WHO or standard safe limit
  benchmarkLabel: string;
  category: "Good" | "Moderate" | "High" | "Critical";
  healthImpact: string;
  source: string;
}

export interface HourlyForecastItem {
  hour: string; // e.g. "06:00", "09:00"
  displayTime: string; // e.g. "6 AM", "9 AM"
  aqi: number;
  category: AQICategory;
  pm25: number;
  pm10?: number;
  temperature?: number;
  advice: string;
  isPeakHour?: boolean;
}

export interface CityData {
  id: string;
  name: string;
  country: string;
  stateOrRegion: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  aqi: number;
  category: AQICategory;
  dominantPollutant: string;
  lastUpdated: string;
  metadata?: AirQualityMetadata;
  weather: {
    temperature: number; // in °C
    condition: string;
    humidity: number; // in %
    windSpeed: number; // in km/h
    windDirection: string;
    pressure: number; // in hPa
  };
  healthWarning: {
    title: string;
    summary: string;
    vulnerableGroups: string;
  };
  pollutants: PollutantInfo[];
  hourlyForecast: HourlyForecastItem[];
}

export interface GeocodedCity {
  id: string;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

// --- Detailed Household Preferences Form Types ---
export type ActivityTimePreference =
  | "early_morning" // 6 AM - 8 AM
  | "mid_morning"   // 8 AM - 11 AM
  | "afternoon"     // 12 PM - 4 PM
  | "evening"       // 5 PM - 8 PM
  | "night";        // 8 PM - 11 PM

export type CommuteMode =
  | "two_wheeler"   // Two-Wheeler / Motorcycle / Scooter
  | "walking"       // Walking / Bicycle
  | "auto_transit"  // Auto-Rickshaw / Open Bus
  | "metro_rail"    // Metro / Train
  | "car_cab";      // Private Car / Cab (AC)

export type BudgetTier =
  | "zero"          // Zero / Free (₹0)
  | "low"           // Low Cost (Under ₹500 / $10)
  | "moderate"      // Moderate (₹500 - ₹2,500 / $10-$30)
  | "flexible";     // Flexible / High (₹2,500+ / $30+)

export interface SensitivityPreferences {
  hasChildren: boolean;
  hasElderly: boolean;
  hasAsthmaOrCardiac: boolean;
  hasAllergiesOrSinus: boolean;
  hasPregnancy: boolean;
  hasPets: boolean;
}

export interface DetailedHouseholdPreferences {
  activityTime: ActivityTimePreference;
  commuteMode: CommuteMode;
  budget: BudgetTier;
  sensitivities: SensitivityPreferences;
}

// Backward-compatible simple profile (used across legacy tips/toggles if needed)
export interface HouseholdProfile {
  hasChildren: boolean;
  hasElderly: boolean;
  hasRespiratoryCondition: boolean;
  isOutdoorAthlete: boolean;
  hasPets: boolean;
  isDailyCommuter: boolean;
}

// --- Tailored Recommendation Types ---
export type RecommendationCategory =
  | "time_window"
  | "indoor_action"
  | "sustainable_alternative";

export interface TailoredRecommendation {
  id: string;
  category: RecommendationCategory;
  categoryLabel: "Lower-Pollution Window" | "Indoor Action" | "Sustainable Alternative";
  action: string;
  timing: string;
  cost: string;
  shortReason: string;
  priority: "high" | "medium" | "standard";
  badge?: string;
}

// --- Gemini Structured Explanation Types ---
export interface GeminiStructuredExplanation {
  summary: string;
  outdoorRoutine: {
    recommendedWindow: string;
    commuteAdvice: string;
    exposureCaution: string;
  };
  indoorTips: Array<{
    title: string;
    action: string;
    budgetContext: string;
  }>;
  sustainableSwaps: Array<{
    title: string;
    swap: string;
    rationale: string;
  }>;
  caveats: string[];
}

export interface DailyAction {
  id: string;
  timeSlot: "Morning (6 AM - 10 AM)" | "Afternoon (11 AM - 4 PM)" | "Evening (5 PM - 8 PM)" | "Night (9 PM - 6 AM)";
  title: string;
  description: string;
  type: "ventilation" | "mask" | "exercise" | "commute" | "purifier" | "health";
  urgency: "normal" | "recommended" | "urgent";
  householdSpecificTag?: string;
}

export interface IndoorTip {
  id: string;
  title: string;
  category: "purifier" | "plants" | "ventilation" | "cleaning" | "cooking";
  description: string;
  impactScore: "High" | "Medium" | "Essential";
  actionableStep: string;
  badge: string;
}

export interface SustainableSwap {
  id: string;
  title: string;
  description: string;
  currentHabit: string;
  ecoAlternative: string;
  emissionsSaved: string; // e.g. "2.4 kg CO2 / trip"
  airQualityBenefit: string;
  difficulty: "Easy" | "Medium" | "High Impact";
  category: "transport" | "home" | "energy" | "community";
}
