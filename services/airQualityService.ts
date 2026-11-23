import { CityData, AQICategory, PollutantInfo, HourlyForecastItem, GeocodedCity } from "../lib/types";

// Raw response interfaces from Open-Meteo Air Quality API
export interface OpenMeteoAirQualityResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current?: {
    time: string;
    interval?: number;
    us_aqi?: number;
    european_aqi?: number;
    pm10?: number;
    pm2_5?: number;
    carbon_monoxide?: number;
    nitrogen_dioxide?: number;
    sulphur_dioxide?: number;
    ozone?: number;
  };
  current_units?: Record<string, string>;
  hourly?: {
    time: string[];
    us_aqi?: (number | null)[];
    european_aqi?: (number | null)[];
    pm10?: (number | null)[];
    pm2_5?: (number | null)[];
    carbon_monoxide?: (number | null)[];
    nitrogen_dioxide?: (number | null)[];
    sulphur_dioxide?: (number | null)[];
    ozone?: (number | null)[];
  };
  hourly_units?: Record<string, string>;
}

// Preset cities available for quick 1-click selection
export const PRESET_CITIES: GeocodedCity[] = [
  { id: "delhi", name: "New Delhi", country: "India", admin1: "Delhi", latitude: 28.6139, longitude: 77.209 },
  { id: "mumbai", name: "Mumbai", country: "India", admin1: "Maharashtra", latitude: 19.076, longitude: 72.8777 },
  { id: "bengaluru", name: "Bengaluru", country: "India", admin1: "Karnataka", latitude: 12.9716, longitude: 77.5946 },
  { id: "kolkata", name: "Kolkata", country: "India", admin1: "West Bengal", latitude: 22.5726, longitude: 88.3639 },
  { id: "london", name: "London", country: "United Kingdom", admin1: "England", latitude: 51.5074, longitude: -0.1278 },
  { id: "newyork", name: "New York", country: "United States", admin1: "New York", latitude: 40.7128, longitude: -74.006 },
  { id: "tokyo", name: "Tokyo", country: "Japan", admin1: "Tokyo", latitude: 35.6762, longitude: 139.6503 },
];

/**
 * Searches cities using Open-Meteo Geocoding API
 * Free, no API key required
 */
export async function searchCities(query: string, timeoutMs: number = 6000): Promise<GeocodedCity[]> {
  const clean = query.trim();
  if (clean.length < 2) return [];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      clean
    )}&count=6&language=en&format=json`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`Geocoding server responded with HTTP ${res.status}`);
    }

    const json = await res.json();
    if (!json.results || !Array.isArray(json.results) || json.results.length === 0) {
      return [];
    }

    return json.results.map((r: Record<string, unknown>, idx: number) => ({
      id: `${String(r.id || idx)}-${String(r.name).toLowerCase()}`,
      name: String(r.name || "Unknown"),
      country: String(r.country || ""),
      admin1: r.admin1 ? String(r.admin1) : undefined,
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
      timezone: r.timezone ? String(r.timezone) : undefined,
    }));
  } catch (err: unknown) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("City search timed out. Please check your internet connection.");
    }
    throw err;
  }
}

/**
 * Fetches real-time model forecast air quality from Open-Meteo
 */
export async function fetchAirQualityFromOpenMeteo(
  lat: number,
  lng: number,
  timeoutMs: number = 8000
): Promise<OpenMeteoAirQualityResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat.toFixed(
      4
    )}&longitude=${lng.toFixed(
      4
    )}&current=us_aqi,european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi,european_aqi&timezone=auto&forecast_days=2`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`Open-Meteo API returned HTTP ${res.status}: ${res.statusText}`);
    }

    const data: OpenMeteoAirQualityResponse = await res.json();
    return data;
  } catch (err: unknown) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Connection to Open-Meteo timed out. Please check your network or try again.");
    }
    throw err;
  }
}

/**
 * Categorize US AQI value into standard categories
 * US EPA Breakpoints:
 * 0 - 50: Good
 * 51 - 100: Moderate
 * 101 - 150: Unhealthy for Sensitive Groups (Mapped to Poor)
 * 151 - 200: Unhealthy (Mapped to Poor)
 * 201 - 300: Very Unhealthy (Mapped to Very Poor)
 * 301+: Hazardous (Mapped to Severe)
 */
export function categorizeUsAqi(aqi: number): AQICategory {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 200) return "Poor";
  if (aqi <= 300) return "Very Poor";
  return "Severe";
}

/**
 * Converts Open-Meteo raw response into the dashboard's unified CityData format
 */
export function transformOpenMeteoData(
  raw: OpenMeteoAirQualityResponse,
  city: GeocodedCity
): CityData {
  const current = raw.current;
  const aqiVal = Math.round(current?.us_aqi ?? current?.european_aqi ?? 50);
  const category = categorizeUsAqi(aqiVal);

  const pm25Val = Math.round((current?.pm2_5 ?? 15) * 10) / 10;
  const pm10Val = Math.round((current?.pm10 ?? 30) * 10) / 10;
  const no2Val = Math.round((current?.nitrogen_dioxide ?? 20) * 10) / 10;
  const so2Val = Math.round((current?.sulphur_dioxide ?? 10) * 10) / 10;
  // Open-Meteo CO is often in µg/m³; standard ppm / mg/m³ is value / 1000
  const coRaw = current?.carbon_monoxide ?? 500;
  const coVal = Math.round((coRaw > 100 ? coRaw / 1000 : coRaw) * 10) / 10;
  const o3Val = Math.round((current?.ozone ?? 40) * 10) / 10;

  // Criteria Pollutants mapping
  const pollutants: PollutantInfo[] = [
    {
      id: "pm25",
      name: "PM2.5",
      fullName: "Fine Inhalable Particles (<2.5 µm)",
      value: pm25Val,
      unit: "µg/m³",
      safeBenchmark: 15,
      benchmarkLabel: "WHO 24h: 15 µg/m³",
      category: pm25Val <= 15 ? "Good" : pm25Val <= 35 ? "Moderate" : pm25Val <= 75 ? "High" : "Critical",
      healthImpact: "Deep lung penetration, systemic bloodstream inflammation",
      source: "Model forecast: vehicular exhaust, biomass smoke, regional dispersion",
    },
    {
      id: "pm10",
      name: "PM10",
      fullName: "Coarse Dust Particles (<10 µm)",
      value: pm10Val,
      unit: "µg/m³",
      safeBenchmark: 45,
      benchmarkLabel: "WHO 24h: 45 µg/m³",
      category: pm10Val <= 45 ? "Good" : pm10Val <= 100 ? "Moderate" : pm10Val <= 200 ? "High" : "Critical",
      healthImpact: "Upper respiratory irritation, sinus congestion and throat dryness",
      source: "Model forecast: surface dust, construction silt, windborne particulates",
    },
    {
      id: "no2",
      name: "NO₂",
      fullName: "Nitrogen Dioxide",
      value: no2Val,
      unit: "µg/m³",
      safeBenchmark: 25,
      benchmarkLabel: "WHO 24h: 25 µg/m³",
      category: no2Val <= 25 ? "Good" : no2Val <= 50 ? "Moderate" : no2Val <= 100 ? "High" : "Critical",
      healthImpact: "Airway hyper-reactivity and increased bronchial inflammation",
      source: "Model forecast: traffic fleet combustion and thermal power generation",
    },
    {
      id: "so2",
      name: "SO₂",
      fullName: "Sulfur Dioxide",
      value: so2Val,
      unit: "µg/m³",
      safeBenchmark: 40,
      benchmarkLabel: "WHO 24h: 40 µg/m³",
      category: so2Val <= 40 ? "Good" : so2Val <= 80 ? "Moderate" : "High",
      healthImpact: "Eye stinging and mucous membrane irritation",
      source: "Model forecast: industrial fuel burning and refinery plumes",
    },
    {
      id: "co",
      name: "CO",
      fullName: "Carbon Monoxide",
      value: coVal,
      unit: "mg/m³",
      safeBenchmark: 4.0,
      benchmarkLabel: "WHO 24h: 4.0 mg/m³",
      category: coVal <= 4.0 ? "Good" : coVal <= 9.0 ? "Moderate" : "High",
      healthImpact: "Interferes with blood oxygen carrying capacity",
      source: "Model forecast: incomplete vehicle combustion in traffic corridors",
    },
    {
      id: "o3",
      name: "O₃",
      fullName: "Ground-Level Ozone",
      value: o3Val,
      unit: "µg/m³",
      safeBenchmark: 100,
      benchmarkLabel: "WHO 8h: 100 µg/m³",
      category: o3Val <= 100 ? "Good" : o3Val <= 140 ? "Moderate" : "High",
      healthImpact: "Oxidative stress on alveolar tissue during sunny daylight",
      source: "Model forecast: photochemical reaction between NOx and VOCs",
    },
  ];

  // Identify dominant pollutant by highest ratio over safe benchmark
  const dominant = [...pollutants].sort((a, b) => b.value / b.safeBenchmark - a.value / a.safeBenchmark)[0];

  // Process hourly forecast
  const hourly: HourlyForecastItem[] = [];
  if (raw.hourly && raw.hourly.time && raw.hourly.time.length > 0) {
    const times = raw.hourly.time;
    const usAqis = raw.hourly.us_aqi || [];
    const pm25s = raw.hourly.pm2_5 || [];
    const pm10s = raw.hourly.pm10 || [];

    // Find current hour index or start from 0
    const nowIso = new Date().toISOString().substring(0, 13); // "YYYY-MM-DDTHH"
    let startIndex = times.findIndex((t) => t.startsWith(nowIso));
    if (startIndex < 0) startIndex = 0;

    // Pick 10-12 hourly steps across next 24h (every 2 hours)
    for (let i = startIndex; i < Math.min(times.length, startIndex + 24); i += 2) {
      const timeStr = times[i];
      const hourPart = timeStr.split("T")[1] || "12:00";
      const hourNum = parseInt(hourPart.split(":")[0], 10);
      const displayTime =
        hourNum === 0
          ? "12 AM"
          : hourNum < 12
          ? `${hourNum} AM`
          : hourNum === 12
          ? "12 PM"
          : `${hourNum - 12} PM`;

      const hAqi = Math.round(usAqis[i] ?? 50);
      const hPm25 = Math.round((pm25s[i] ?? 15) * 10) / 10;
      const hPm10 = Math.round((pm10s[i] ?? 30) * 10) / 10;
      const hCategory = categorizeUsAqi(hAqi);

      // Hourly advice
      let advice = "Atmospheric conditions remain standard.";
      if (hAqi > 200) {
        advice = "High model particulate spike. Avoid outdoor cardio; seal windows.";
      } else if (hAqi > 100) {
        advice = "Moderate particulate accumulation. Sensitive groups should wear masks.";
      } else {
        advice = "Model predicts favorable dispersion; safe for outdoor ventilation.";
      }

      const isPeakHour = hAqi >= 180 || (hourNum >= 7 && hourNum <= 9) || (hourNum >= 19 && hourNum <= 21);

      hourly.push({
        hour: hourPart,
        displayTime,
        aqi: hAqi,
        category: hCategory,
        pm25: hPm25,
        pm10: hPm10,
        advice,
        isPeakHour,
      });
    }
  }

  // Health Warning text based on model AQI
  const healthWarning =
    aqiVal > 200
      ? {
          title: "Model Alert: Severe Particulate Burden",
          summary:
            "Atmospheric dispersion models project high particulate concentrations. Airway mucosal irritation and reduced lung capacity are predicted across the urban grid.",
          vulnerableGroups:
            "Children, elderly individuals, and those with respiratory conditions should remain indoors with active HEPA air purification.",
        }
      : aqiVal > 100
      ? {
          title: "Model Alert: Moderate Pollution Conditions",
          summary:
            "Atmospheric models indicate elevated particulates. Individuals with pre-existing cardiopulmonary illness may experience mild symptoms during prolonged outdoor exertion.",
          vulnerableGroups:
            "Sensitive individuals and outdoor commuters should use fitted masks and avoid heavy arterial traffic corridors.",
        }
      : {
          title: "Model Alert: Favorable Atmospheric Quality",
          summary:
            "Numerical simulation indicates low boundary-layer particulate entrapment with healthy urban air dispersion.",
          vulnerableGroups:
            "Conditions are favorable for outdoor recreation, athletics, and home natural cross-ventilation.",
        };

  const fetchTimestamp = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return {
    id: city.id,
    name: city.name,
    country: city.country,
    stateOrRegion: city.admin1 || city.country,
    coordinates: {
      lat: city.latitude,
      lng: city.longitude,
    },
    aqi: aqiVal,
    category,
    dominantPollutant: `${dominant.name} (${dominant.fullName})`,
    lastUpdated: `Model Forecast (${fetchTimestamp})`,
    metadata: {
      sourceName: "Open-Meteo Air Quality API (Forecast/Model)",
      isModelEstimate: true,
      aqiStandard: "US EPA AQI (Model Estimate)",
      fetchedAt: fetchTimestamp,
      modelInfo:
        "Values are generated from atmospheric chemistry dispersion models (CAMS / NOAA GFS) at grid resolution. Note: This US AQI is a numerical model forecast and differs from India's official CPCB CAAQMS sensor-based National AQI (NAQI).",
    },
    weather: {
      temperature: 24,
      condition: "Open-Meteo Model Grid",
      humidity: 60,
      windSpeed: 8.5,
      windDirection: "WNW",
      pressure: 1013,
    },
    healthWarning,
    pollutants,
    hourlyForecast: hourly,
  };
}
