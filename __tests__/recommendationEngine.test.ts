import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateDeterministicRecommendations } from "../services/recommendationEngine";
import { SAMPLE_CITIES } from "../lib/sampleData";
import { DetailedHouseholdPreferences } from "../lib/types";

describe("generateDeterministicRecommendations", () => {
  const baseCity = SAMPLE_CITIES[0]; // New Delhi

  const defaultPreferences: DetailedHouseholdPreferences = {
    activityTime: "early_morning",
    commuteMode: "two_wheeler",
    budget: "low",
    sensitivities: {
      hasChildren: true,
      hasElderly: false,
      hasAsthmaOrCardiac: true,
      hasAllergiesOrSinus: false,
      hasPregnancy: false,
      hasPets: false,
    },
  };

  it("should generate a list of tailored recommendations", () => {
    const recs = generateDeterministicRecommendations(baseCity, defaultPreferences);
    assert.ok(recs);
    assert.ok(Array.isArray(recs));
    assert.ok(recs.length >= 4);
  });

  it("should generate commute-specific advice based on commuteMode", () => {
    const recs = generateDeterministicRecommendations(baseCity, {
      ...defaultPreferences,
      commuteMode: "two_wheeler",
    });
    const commuteRec = recs.find((r) => r.id === "rec-commute-two_wheeler");
    assert.ok(commuteRec);
    assert.equal(commuteRec.category, "sustainable_alternative");
    assert.ok(commuteRec.action.includes("transit") || commuteRec.action.includes("shared-ride"));
  });

  it("should address vulnerable sensitivities when selected", () => {
    const recs = generateDeterministicRecommendations(baseCity, defaultPreferences);
    const sensitivityRec = recs.find((r) => r.id === "rec-household-care-plan");
    assert.ok(sensitivityRec);
    assert.ok(
      sensitivityRec.shortReason.includes("children") ||
      sensitivityRec.shortReason.includes("respiratory")
    );
  });

  it("should produce gap sealing recommendation when budget is not zero", () => {
    const recs = generateDeterministicRecommendations(baseCity, {
      ...defaultPreferences,
      budget: "low",
    });
    const sealRec = recs.find((r) => r.id === "rec-indoor-seal-gaps");
    assert.ok(sealRec);
    assert.ok(sealRec.action.includes("weatherstripping") || sealRec.action.includes("gaps"));
  });

  it("should omit seal gaps recommendation when budget is zero", () => {
    const zeroBudgetRecs = generateDeterministicRecommendations(baseCity, {
      ...defaultPreferences,
      budget: "zero",
    });
    const sealRec = zeroBudgetRecs.find((r) => r.id === "rec-indoor-seal-gaps");
    assert.equal(sealRec, undefined);
  });
});
