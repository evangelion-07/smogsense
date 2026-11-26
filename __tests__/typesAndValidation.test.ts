import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SAMPLE_CITIES, INDOOR_TIPS_DATA, SUSTAINABLE_SWAPS_DATA } from "../lib/sampleData";

describe("Static Data & Dataset Integrity", () => {
  it("should have valid sample cities with complete pollutant profiles", () => {
    assert.ok(SAMPLE_CITIES.length >= 4);
    for (const city of SAMPLE_CITIES) {
      assert.ok(city.id);
      assert.ok(city.name);
      assert.ok(city.aqi >= 0);
      assert.equal(city.pollutants.length, 6);
      assert.ok(city.hourlyForecast.length >= 8);
      assert.ok(city.healthWarning.summary);
    }
  });

  it("should provide practical indoor air quality tips with actionable steps", () => {
    assert.ok(INDOOR_TIPS_DATA.length >= 6);
    for (const tip of INDOOR_TIPS_DATA) {
      assert.ok(tip.title);
      assert.ok(tip.description);
      assert.ok(tip.actionableStep);
      assert.ok(tip.impactScore);
    }
  });

  it("should provide clean habit swaps with emissions calculations", () => {
    assert.ok(SUSTAINABLE_SWAPS_DATA.length >= 5);
    for (const swap of SUSTAINABLE_SWAPS_DATA) {
      assert.ok(swap.title);
      assert.ok(swap.currentHabit);
      assert.ok(swap.ecoAlternative);
      assert.ok(swap.difficulty);
    }
  });
});
