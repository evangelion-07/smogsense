import { CityData, DetailedHouseholdPreferences, TailoredRecommendation } from "../lib/types";

const ACTIVITY_HOURS: Record<DetailedHouseholdPreferences["activityTime"], [number, number]> = {
  early_morning: [6, 8],
  mid_morning: [8, 11],
  afternoon: [12, 16],
  evening: [17, 20],
  night: [20, 23],
};

function createRecommendation(
  recommendation: Omit<TailoredRecommendation, "id"> & { id: string }
): TailoredRecommendation {
  return recommendation;
}

/**
 * Creates practical, deterministic suggestions from the available forecast
 * and user-selected routine. It avoids invented forecast values and medical
 * outcome claims; lower-AQI hours are comparisons within this forecast only.
 */
export function generateDeterministicRecommendations(
  city: CityData,
  preferences: DetailedHouseholdPreferences
): TailoredRecommendation[] {
  const recommendations: TailoredRecommendation[] = [];
  const forecast = city.hourlyForecast ?? [];
  const [startHour, endHour] = ACTIVITY_HOURS[preferences.activityTime];
  const preferredForecast = forecast.filter((item) => {
    const hour = Number(item.hour.slice(0, 2));
    return Number.isFinite(hour) && hour >= startHour && hour <= endHour;
  });
  const consideredHours = preferredForecast.length > 0 ? preferredForecast : forecast;
  const selectedWindow = [...consideredHours].sort((a, b) => a.aqi - b.aqi)[0];
  const sensitivityLabels: Record<keyof DetailedHouseholdPreferences["sensitivities"], string> = {
    hasChildren: "children or infants",
    hasElderly: "older adults",
    hasAsthmaOrCardiac: "respiratory or cardiac conditions",
    hasAllergiesOrSinus: "allergies or sinus conditions",
    hasPregnancy: "pregnancy",
    hasPets: "household pets",
  };
  const selectedSensitivities = (Object.keys(sensitivityLabels) as Array<keyof typeof sensitivityLabels>)
    .filter((key) => preferences.sensitivities[key])
    .map((key) => sensitivityLabels[key]);
  const hasSensitivity = selectedSensitivities.length > 0;

  if (selectedWindow) {
    const preferenceMatch = preferredForecast.length > 0;
    const usesCpcbStyleScale = city.metadata?.aqiStandard.startsWith("CPCB") ?? false;
    const isElevatedCategory = usesCpcbStyleScale
      ? ["Poor", "Very Poor", "Severe"].includes(selectedWindow.category)
      : ["Unhealthy for Sensitive Groups", "Unhealthy", "Very Unhealthy", "Hazardous", "Beyond AQI"].includes(selectedWindow.category);
    recommendations.push(createRecommendation({
      id: "rec-time-relative-low",
      category: "time_window",
      categoryLabel: "Lower-Pollution Window",
      action: preferenceMatch
        ? "If outdoor activity is needed, consider the lowest-AQI hour in your selected time range"
        : "If your schedule is flexible, consider the lowest-AQI hour in the available forecast",
      timing: `Around ${selectedWindow.displayTime}${preferenceMatch ? " (within your selected time range)" : " (outside your selected range, if flexible)"}`,
      cost: "Free",
      shortReason: `The model gives an AQI of ${selectedWindow.aqi} for this hour. It is the lowest value among ${preferenceMatch ? "the forecast hours in your selected range" : "the forecast hours available"}; this comparison does not establish personal exposure or safety.`,
      priority: isElevatedCategory ? "high" : "standard",
      badge: "Forecast Comparison",
    }));
  } else {
    recommendations.push(createRecommendation({
      id: "rec-time-no-forecast",
      category: "time_window",
      categoryLabel: "Lower-Pollution Window",
      action: "Check local air-quality and public-health updates before planning outdoor activity",
      timing: "Hourly forecast unavailable",
      cost: "Free",
      shortReason: "There is not enough hourly data to compare pollution levels across the day.",
      priority: "medium",
      badge: "No Hourly Data",
    }));
  }

  recommendations.push(createRecommendation({
    id: "rec-indoor-dust",
    category: "indoor_action",
    categoryLabel: "Indoor Action",
    action: "Use damp dusting or mopping to avoid stirring settled dust",
    timing: "During regular cleaning",
    cost: "Free if household supplies are available",
    shortReason: "Damp cleaning can reduce the amount of settled dust stirred back into room air.",
    priority: "standard",
    badge: "Low-Cost Step",
  }));

  recommendations.push(createRecommendation({
    id: "rec-indoor-cooking",
    category: "indoor_action",
    categoryLabel: "Indoor Action",
    action: "Use an externally vented kitchen exhaust fan while cooking, if available",
    timing: "During cooking",
    cost: "No added cost if already installed",
    shortReason: "Cooking can add particles to indoor air. Venting outdoors can help remove cooking emissions; follow the appliance instructions.",
    priority: "medium",
    badge: "Source Reduction",
  }));

  if (preferences.budget !== "zero") {
    recommendations.push(createRecommendation({
      id: "rec-indoor-seal-gaps",
      category: "indoor_action",
      categoryLabel: "Indoor Action",
      action: "Inspect doors and windows for gaps and consider removable weatherstripping where needed",
      timing: "When convenient",
      cost: "Varies by product and location",
      shortReason: "Reducing unwanted air leakage may help limit outdoor air entering through obvious gaps. Keep required ventilation and fire-safety needs in mind.",
      priority: "standard",
      badge: "Optional Home Improvement",
    }));
  }

  if (preferences.budget === "moderate" || preferences.budget === "flexible") {
    recommendations.push(createRecommendation({
      id: "rec-indoor-air-cleaner",
      category: "indoor_action",
      categoryLabel: "Indoor Action",
      action: "If considering an air cleaner, compare its clean-air delivery rate with room size and ongoing filter costs",
      timing: "Before purchasing",
      cost: "Varies by device and replacement filters",
      shortReason: "Performance depends on device sizing, placement, room conditions, and filter maintenance. No device can guarantee a particular indoor concentration.",
      priority: "medium",
      badge: "Compare Specifications",
    }));
  }

  if (hasSensitivity) {
    recommendations.push(createRecommendation({
      id: "rec-household-care-plan",
      category: "indoor_action",
      categoryLabel: "Indoor Action",
      action: "Keep existing household care plans and local air-quality alerts easy to access",
      timing: "Before periods of elevated pollution",
      cost: "Free",
      shortReason: `You selected ${selectedSensitivities.join(", ")}. Individual needs vary; use local public-health, veterinary, or clinician guidance as relevant.`,
      priority: "medium",
      badge: "Household Preferences",
    }));
  }

  if (selectedWindow) {
    recommendations.push(createRecommendation({
      id: "rec-indoor-ventilation-check",
      category: "indoor_action",
      categoryLabel: "Indoor Action",
      action: "Compare indoor conditions with nearby outdoor readings before opening windows",
      timing: `The forecast's lowest AQI hour is around ${selectedWindow.displayTime}`,
      cost: "Free",
      shortReason: "A city-grid forecast cannot tell whether a particular home should ventilate; nearby observations and indoor sources also matter.",
      priority: "standard",
      badge: "Check Local Conditions",
    }));
  }

  const commuteSuggestions: Record<DetailedHouseholdPreferences["commuteMode"], { action: string; reason: string }> = {
    two_wheeler: {
      action: "When practical, compare public-transit or shared-ride options for some trips",
      reason: "Changing how trips are made can reduce personal time spent in traffic and may reduce vehicle use; local availability varies.",
    },
    walking: {
      action: "Where practical, choose walking or cycling routes away from busy roads",
      reason: "Pollution can vary near roads. Route conditions and travel time differ by location.",
    },
    auto_transit: {
      action: "When practical, compare enclosed transit options for trips with long waits near traffic",
      reason: "Vehicle type, ventilation, and traffic conditions can affect the air encountered during a trip.",
    },
    metro_rail: {
      action: "For the last mile, look for a route with less time beside busy traffic where practical",
      reason: "Roadside conditions can differ from the wider-area model forecast.",
    },
    car_cab: {
      action: "Consider sharing rides or using public transport when it fits your route",
      reason: "Sharing or changing some trips can reduce the number of vehicle journeys; the result depends on local travel choices.",
    },
  };
  const commuteSuggestion = commuteSuggestions[preferences.commuteMode];
  recommendations.push(createRecommendation({
    id: `rec-commute-${preferences.commuteMode}`,
    category: "sustainable_alternative",
    categoryLabel: "Sustainable Alternative",
    action: commuteSuggestion.action,
    timing: "When planning a trip",
    cost: "Depends on route and local options",
    shortReason: commuteSuggestion.reason,
    priority: hasSensitivity ? "medium" : "standard",
    badge: "Travel Option",
  }));

  recommendations.push(createRecommendation({
    id: "rec-home-combustion",
    category: "sustainable_alternative",
    categoryLabel: "Sustainable Alternative",
    action: "Consider non-combustion alternatives to incense or mosquito coils when suitable",
    timing: "During your home routine",
    cost: "Varies; physical insect screens may be an option",
    shortReason: "Burning products add smoke to indoor air. Choose alternatives that suit your household and local conditions.",
    priority: "standard",
    badge: "Reduce Indoor Smoke",
  }));

  return recommendations;
}
