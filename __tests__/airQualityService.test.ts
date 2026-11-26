import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { transformOpenMeteoData, PRESET_CITIES, OpenMeteoAirQualityResponse } from "../services/airQualityService";

describe("airQualityService", () => {
  it("should provide predefined preset cities with valid coordinates", () => {
    assert.ok(PRESET_CITIES.length >= 5);
    for (const city of PRESET_CITIES) {
      assert.ok(city.name);
      assert.ok(city.latitude >= -90 && city.latitude <= 90);
      assert.ok(city.longitude >= -180 && city.longitude <= 180);
    }
  });

  it("should correctly transform raw Open-Meteo response into CityData structure", () => {
    const mockOpenMeteo: OpenMeteoAirQualityResponse = {
      latitude: 28.61,
      longitude: 77.23,
      generationtime_ms: 0.5,
      utc_offset_seconds: 19800,
      timezone: "Asia/Kolkata",
      timezone_abbreviation: "IST",
      elevation: 216,
      current: {
        time: "2026-11-26T00:00",
        us_aqi: 215,
        pm10: 240,
        pm2_5: 165,
        nitrogen_dioxide: 45,
        sulphur_dioxide: 12,
        carbon_monoxide: 1200,
        ozone: 30,
      },
      hourly: {
        time: [
          "2026-11-26T00:00",
          "2026-11-26T01:00",
          "2026-11-26T02:00",
          "2026-11-26T03:00",
        ],
        us_aqi: [180, 195, 210, 215],
        pm2_5: [130, 145, 160, 165],
        pm10: [200, 210, 230, 240],
      },
    };

    const targetCity = PRESET_CITIES[0];
    const transformed = transformOpenMeteoData(mockOpenMeteo, targetCity);

    assert.equal(transformed.name, targetCity.name);
    assert.equal(transformed.aqi, 215);
    assert.equal(transformed.category, "Very Unhealthy");
    assert.equal(transformed.pollutants.length, 6);
    assert.equal(transformed.hourlyForecast.length, 4);
    assert.equal(transformed.metadata?.isModelEstimate, true);
    assert.equal(transformed.pollutants[0].name, "PM2.5");
    assert.equal(transformed.pollutants[0].value, 165);
  });

  it("should handle edge cases with missing pollutant readings gracefully", () => {
    const minimalResponse: OpenMeteoAirQualityResponse = {
      latitude: 51.5,
      longitude: -0.12,
      generationtime_ms: 0.2,
      utc_offset_seconds: 0,
      timezone: "Europe/London",
      timezone_abbreviation: "GMT",
      elevation: 15,
      current: {
        time: "2026-11-26T12:00",
        us_aqi: 40,
      },
      hourly: {
        time: ["2026-11-26T12:00"],
        us_aqi: [40],
        pm2_5: [10],
      },
    };

    const targetCity = PRESET_CITIES[4]; // London
    const transformed = transformOpenMeteoData(minimalResponse, targetCity);

    assert.equal(transformed.name, "London");
    assert.equal(transformed.aqi, 40);
    assert.equal(transformed.category, "Good");
    assert.ok(transformed.pollutants);
  });
});
