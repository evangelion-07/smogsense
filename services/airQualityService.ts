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
    if (!res.ok) {
      throw new Error(`Geocoding server responded with HTTP ${res.status}`);
    }

    const json = await res.json();
    if (!json.results || !Array.isArray(json.results) || json.results.length === 0) {
      return [];
    }

    return json.results.flatMap((r: Record<string, unknown>, idx: number) => {
      const name = typeof r.name === "string" ? r.name.trim() : "";
      const latitude = Number(r.latitude);
      const longitude = Number(r.longitude);
      if (!name || !Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
        return [];
      }
      return [{
        id: `${String(r.id || idx)}-${name.toLowerCase()}`,
        name,
        country: typeof r.country === "string" ? r.country : "",
        admin1: typeof r.admin1 === "string" ? r.admin1 : undefined,
        latitude,
        longitude,
        timezone: typeof r.timezone === "string" ? r.timezone : undefined,
      }];
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("City search timed out. Please check your internet connection.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
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
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Categorize US AQI value into standard categories
 * US EPA Breakpoints:
 * 0 - 50: Good
 * 51 - 100: Moderate
 * 101 - 150: Unhealthy for Sensitive Groups
 * 151 - 200: Unhealthy
 * 201 - 300: Very Unhealthy
 * 301 - 500: Hazardous; above 500: Beyond AQI
 */
export function categorizeUsAqi(aqi: number): AQICategory {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  if (aqi <= 500) return "Hazardous";
  return "Beyond AQI";
}

function finiteRounded(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.round(value * 10) / 10
    : null;
}

/**
 * Converts Open-Meteo raw response into the dashboard's unified CityData format
 */
export function transformOpenMeteoData(
  raw: OpenMeteoAirQualityResponse,
  city: GeocodedCity
): CityData {
  const current = raw.current;
  if (typeof current?.us_aqi !== "number" || !Number.isFinite(current.us_aqi) || current.us_aqi < 0 || current.us_aqi > 1000) {
    throw new Error("The forecast did not include a valid US AQI reading.");
  }
  const aqiVal = Math.round(current.us_aqi);
  const category = categorizeUsAqi(aqiVal);

  const pm25Val = finiteRounded(current?.pm2_5);
  const pm10Val = finiteRounded(current?.pm10);
  const no2Val = finiteRounded(current?.nitrogen_dioxide);
  const so2Val = finiteRounded(current?.sulphur_dioxide);
  const coRaw = finiteRounded(current?.carbon_monoxide);
  const coUnit = raw.current_units?.carbon_monoxide?.toLowerCase().replace("μ", "µ");
  const coVal = coRaw === null
    ? null
    : coUnit?.includes("µg") || coUnit?.includes("ug")
      ? Math.round((coRaw / 1000) * 10) / 10
      : coUnit?.includes("mg")
        ? coRaw
        : null;
  const o3Val = finiteRounded(current?.ozone);

  // Criteria Pollutants mapping
  const pollutants: PollutantInfo[] = [
    {
      id: "pm25",
      name: "PM2.5",
      fullName: "Fine Inhalable Particles (<2.5 µm)",
      value: pm25Val,
      unit: "µg/m³",
      guidelineLabel: "WHO 24h: 15 µg/m³",
      source: "Model forecast: vehicular exhaust, biomass smoke, regional dispersion",
    },
    {
      id: "pm10",
      name: "PM10",
      fullName: "Coarse Dust Particles (<10 µm)",
      value: pm10Val,
      unit: "µg/m³",
      guidelineLabel: "WHO 24h: 45 µg/m³",
      source: "Model forecast: surface dust, construction silt, windborne particulates",
    },
    {
      id: "no2",
      name: "NO₂",
      fullName: "Nitrogen Dioxide",
      value: no2Val,
      unit: "µg/m³",
      guidelineLabel: "WHO 24h: 25 µg/m³",
      source: "Model forecast: traffic fleet combustion and thermal power generation",
    },
    {
      id: "so2",
      name: "SO₂",
      fullName: "Sulfur Dioxide",
      value: so2Val,
      unit: "µg/m³",
      guidelineLabel: "WHO 24h: 40 µg/m³",
      source: "Model forecast: industrial fuel burning and refinery plumes",
    },
    {
      id: "co",
      name: "CO",
      fullName: "Carbon Monoxide",
      value: coVal,
      unit: "mg/m³",
      guidelineLabel: "WHO 24h: 4.0 mg/m³",
      source: "Model forecast: incomplete vehicle combustion in traffic corridors",
    },
    {
      id: "o3",
      name: "O₃",
      fullName: "Ground-Level Ozone",
      value: o3Val,
      unit: "µg/m³",
      guidelineLabel: "WHO 8h: 100 µg/m³",
      source: "Model forecast: photochemical reaction between NOx and VOCs",
    },
  ];

  // Process hourly forecast
  const hourly: HourlyForecastItem[] = [];
  if (raw.hourly && raw.hourly.time && raw.hourly.time.length > 0) {
    const times = raw.hourly.time;
    const usAqis = raw.hourly.us_aqi || [];
    const pm25s = raw.hourly.pm2_5 || [];
    const pm10s = raw.hourly.pm10 || [];

    // The API's hourly strings use its requested local timezone. Align against
    // its own current.time value rather than comparing them to browser UTC.
    const currentHour = current?.time?.slice(0, 13);
    let startIndex = currentHour ? times.findIndex((time) => time >= currentHour) : -1;
    if (startIndex < 0) startIndex = times.length;

    // Keep one point per forecast hour for a true next-24-hour view.
    for (let i = startIndex; i < Math.min(times.length, startIndex + 24); i += 1) {
      const aqiValue = usAqis[i];
      const pm25Value = pm25s[i];
      if (typeof aqiValue !== "number" || !Number.isFinite(aqiValue) || typeof pm25Value !== "number" || !Number.isFinite(pm25Value)) {
        continue;
      }
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

      const hAqi = Math.round(aqiValue);
      const hPm25 = Math.round(pm25Value * 10) / 10;
      const hPm10 = finiteRounded(pm10s[i]);
      const hCategory = categorizeUsAqi(hAqi);

      // Hourly advice
      let advice = "Atmospheric conditions remain standard.";
      if (hAqi > 200) {
        advice = "The forecast is elevated. Consider reducing strenuous outdoor activity and check local guidance.";
      } else if (hAqi > 100) {
        advice = "The forecast is elevated; sensitive groups may wish to limit prolonged outdoor exertion.";
      } else {
        advice = "The forecast is relatively lower than higher-AQI hours in this forecast; it does not establish personal safety.";
      }

      hourly.push({
        timestamp: timeStr,
        hour: hourPart,
        displayTime,
        aqi: hAqi,
        category: hCategory,
        pm25: hPm25,
        ...(hPm10 !== null ? { pm10: hPm10 } : {}),
        advice,
      });
    }
  }

  // Health Warning text based on model AQI
  const healthWarning =
    aqiVal > 200
      ? {
          title: "Elevated Model AQI",
          summary:
            "The modeled AQI is elevated for this forecast period. Forecasts describe modeled outdoor conditions and cannot predict an individual's symptoms.",
          vulnerableGroups:
            "People in sensitive groups can consult local public-health guidance and follow advice from their clinician.",
        }
      : aqiVal > 100
      ? {
          title: "Elevated Model AQI",
          summary:
            "The modeled AQI is above the lower forecast bands. It is a grid estimate and may not match conditions at a specific street or building.",
          vulnerableGroups:
            "People in sensitive groups may wish to limit prolonged or strenuous outdoor activity and follow local guidance.",
        }
      : {
          title: "Relatively Lower Model AQI",
          summary:
            "The modeled AQI is in a lower band for this forecast. A lower model estimate does not mean that outdoor air is risk-free.",
          vulnerableGroups:
            "Check local observations and public-health guidance, especially if someone in your household is sensitive to air pollution.",
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
    lastUpdated: `Model Forecast (${fetchTimestamp})`,
    metadata: {
      sourceName: "Open-Meteo Air Quality API (Forecast/Model)",
      isModelEstimate: true,
      aqiStandard: "US EPA AQI (Model Estimate)",
      fetchedAt: fetchTimestamp,
      modelInfo:
        "Values are Open-Meteo air-quality forecasts based on CAMS European or CAMS Global model data, depending on location. This US AQI is a numerical model forecast and differs from India's official CPCB National AQI (NAQI).",
    },
    healthWarning,
    pollutants,
    hourlyForecast: hourly,
  };
}
