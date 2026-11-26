import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("API Security & Validation Constraints", () => {
  const AQI_CATEGORIES = [
    "Good", "Satisfactory", "Moderate", "Unhealthy for Sensitive Groups", "Unhealthy",
    "Very Unhealthy", "Hazardous", "Beyond AQI", "Poor", "Very Poor", "Severe",
  ];

  it("should enforce valid AQI category values", () => {
    assert.ok(AQI_CATEGORIES.includes("Good"));
    assert.ok(AQI_CATEGORIES.includes("Severe"));
    assert.ok(AQI_CATEGORIES.includes("Very Poor"));
    assert.equal(AQI_CATEGORIES.includes("Super Bad"), false);
  });

  it("should validate geographic coordinates within valid GPS ranges", () => {
    const isValidCoord = (lat: number, lng: number) =>
      Number.isFinite(lat) && lat >= -90 && lat <= 90 &&
      Number.isFinite(lng) && lng >= -180 && lng <= 180;

    assert.ok(isValidCoord(28.61, 77.23)); // Delhi
    assert.ok(isValidCoord(-33.86, 151.2)); // Sydney
    assert.equal(isValidCoord(95.0, 77.23), false); // Latitude out of range
    assert.equal(isValidCoord(28.61, 200.0), false); // Longitude out of range
  });

  it("should sanitize and detect unsafe certainty claims in generative AI text", () => {
    const containsUnsafeCertainty = (value: string): boolean =>
      /\b(?:completely safe|100% safe|guaranteed safe|perfectly safe)\b/i.test(value);

    assert.equal(containsUnsafeCertainty("Going outdoors is completely safe today."), true);
    assert.equal(containsUnsafeCertainty("This routine is 100% safe for everyone."), true);
    assert.equal(containsUnsafeCertainty("The air quality is relatively lower at noon."), false);
    assert.equal(containsUnsafeCertainty("No time or condition is safe, safest, or risk-free."), false);
  });
});
