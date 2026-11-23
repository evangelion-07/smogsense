import {
  CityData,
  DetailedHouseholdPreferences,
  TailoredRecommendation,
  HourlyForecastItem,
} from "../lib/types";

/**
 * Deterministic recommendation engine that combines:
 * 1. The atmospheric forecast (hourly PM2.5, PM10, AQI)
 * 2. Household preferences (activity times, commute mode, budget, sensitivities)
 *
 * Adheres strictly to the constraint:
 * "Do not describe a time as completely safe; say when the forecast is lower relative to other available times."
 * Every recommendation includes: action, timing, cost, and shortReason.
 */
export function generateDeterministicRecommendations(
  city: CityData,
  preferences: DetailedHouseholdPreferences
): TailoredRecommendation[] {
  const recommendations: TailoredRecommendation[] = [];
  const forecast = city.hourlyForecast && city.hourlyForecast.length > 0 ? city.hourlyForecast : [];

  // Helper to find relative min and max hours in forecast
  const sortedByAqi = [...forecast].sort((a, b) => a.aqi - b.aqi);
  const relativeLowestHour: HourlyForecastItem = sortedByAqi[0] || {
    hour: "14:00",
    displayTime: "2 PM",
    aqi: Math.max(30, Math.round(city.aqi * 0.75)),
    category: "Moderate",
    pm25: 45,
    advice: "Atmospheric convection creates relatively lower particulate density.",
  };

  const relativeHighestHour: HourlyForecastItem = sortedByAqi[sortedByAqi.length - 1] || {
    hour: "08:00",
    displayTime: "8 AM",
    aqi: Math.max(120, Math.round(city.aqi * 1.25)),
    category: "Severe",
    pm25: 180,
    advice: "Thermal inversion and rush hour traffic peak.",
  };

  const hasAnySensitivity =
    preferences.sensitivities.hasChildren ||
    preferences.sensitivities.hasElderly ||
    preferences.sensitivities.hasAsthmaOrCardiac ||
    preferences.sensitivities.hasPregnancy ||
    preferences.sensitivities.hasAllergiesOrSinus ||
    preferences.sensitivities.hasPets;

  // =========================================================================
  // 1. LOWER-POLLUTION TIME WINDOWS (DETERMINISTIC RULES)
  // =========================================================================

  // Rule 1.1: Early or Mid Morning Activity Preference
  if (preferences.activityTime === "early_morning" || preferences.activityTime === "mid_morning") {
    if (city.aqi > 120) {
      recommendations.push({
        id: "rec-tw-morning-shift",
        category: "time_window",
        categoryLabel: "Lower-Pollution Window",
        action: "Shift outdoor workout or strenuous errands to the afternoon solar convection window",
        timing: `1:00 PM – 3:30 PM (centered near ${relativeLowestHour.displayTime})`,
        cost: "Free (₹0)",
        shortReason: `Forecast model indicates PM2.5 levels are relatively lower near ${relativeLowestHour.displayTime} (predicted AQI ~${relativeLowestHour.aqi}) compared to the severe early morning thermal inversion peak near ${relativeHighestHour.displayTime} (predicted AQI ~${relativeHighestHour.aqi}).`,
        priority: "high",
        badge: "Schedule Shift",
      });
    } else {
      recommendations.push({
        id: "rec-tw-morning-favorable",
        category: "time_window",
        categoryLabel: "Lower-Pollution Window",
        action: "Conduct outdoor physical activities during the early morning relative lull",
        timing: "6:30 AM – 8:00 AM",
        cost: "Free (₹0)",
        shortReason: `Forecast indicates particulate concentrations are relatively lower at this hour compared to the impending daytime vehicular congestion buildup.`,
        priority: "standard",
        badge: "Optimal Timing",
      });
    }
  }

  // Rule 1.2: Afternoon Activity Preference
  if (preferences.activityTime === "afternoon") {
    recommendations.push({
      id: "rec-tw-afternoon-window",
      category: "time_window",
      categoryLabel: "Lower-Pollution Window",
      action: "Align outdoor travel with the daily afternoon boundary-layer expansion",
      timing: `1:30 PM – 4:00 PM (around ${relativeLowestHour.displayTime})`,
      cost: "Free (₹0)",
      shortReason: `Solar heating promotes vertical atmospheric mixing, making this afternoon interval comparatively lower in particulate density than both morning and evening rush hours.`,
      priority: "medium",
      badge: "Atmospheric Mixing",
    });
  }

  // Rule 1.3: Evening or Night Activity Preference
  if (preferences.activityTime === "evening" || preferences.activityTime === "night") {
    if (city.aqi > 150) {
      recommendations.push({
        id: "rec-tw-evening-delay",
        category: "time_window",
        categoryLabel: "Lower-Pollution Window",
        action: "Postpone outdoor transit until after the evening commute exhaust peak dissipates",
        timing: "8:30 PM – 9:45 PM",
        cost: "Free (₹0)",
        shortReason: `Vehicle exhaust and black carbon emissions peak sharply between 5:30 PM and 8:00 PM; exposure is relatively lower once arterial traffic volumes subside later in the evening.`,
        priority: "high",
        badge: "Peak Avoidance",
      });
    } else {
      recommendations.push({
        id: "rec-tw-evening-standard",
        category: "time_window",
        categoryLabel: "Lower-Pollution Window",
        action: "Complete evening walks or cycling before nocturnal boundary inversion descends",
        timing: "5:00 PM – 6:30 PM",
        cost: "Free (₹0)",
        shortReason: `Particulate concentrations remain relatively lower before evening surface cooling traps ground-level emissions overnight.`,
        priority: "standard",
        badge: "Pre-Inversion",
      });
    }
  }

  // Rule 1.4: Sensitivity-triggered exposure duration cap
  if (hasAnySensitivity) {
    const sensitiveName = preferences.sensitivities.hasAsthmaOrCardiac
      ? "respiratory/cardiac"
      : preferences.sensitivities.hasChildren
      ? "pediatric"
      : preferences.sensitivities.hasElderly
      ? "senior"
      : preferences.sensitivities.hasPregnancy
      ? "prenatal"
      : "vulnerable";

    recommendations.push({
      id: "rec-tw-duration-cap",
      category: "time_window",
      categoryLabel: "Lower-Pollution Window",
      action: `Cap continuous outdoor exposure to a maximum of 20 minutes for ${sensitiveName} family members`,
      timing: "Applicable during any mandatory daytime transit",
      cost: "Free (₹0)",
      shortReason: `Even during hours when forecast readings are relatively lower, sub-micron particulates penetrate deep into alveoli; limiting duration strictly limits total cumulative toxic dose.`,
      priority: "high",
      badge: "Exposure Dose Cap",
    });
  }

  // =========================================================================
  // 2. INDOOR ACTIONS (DETERMINISTIC RULES BASED ON BUDGET & SENSITIVITY)
  // =========================================================================

  // Rule 2.1: Zero Budget (Free / ₹0)
  if (preferences.budget === "zero") {
    recommendations.push({
      id: "rec-in-damp-mop",
      category: "indoor_action",
      categoryLabel: "Indoor Action",
      action: "Switch to damp microfiber mopping and seal exterior door thresholds with rolled towels",
      timing: "Morning at 8:30 AM & Evening at 7:00 PM",
      cost: "Free (₹0 / Existing household cloth)",
      shortReason: `Dry broom sweeping resuspends coarse PM10 and settled PM2.5 into breathing height for up to 6 hours; damp mopping traps dust without purchasing equipment.`,
      priority: "high",
      badge: "Zero-Cost Bio-Defense",
    });

    recommendations.push({
      id: "rec-in-timed-ventilation",
      category: "indoor_action",
      categoryLabel: "Indoor Action",
      action: "Perform a brief 15-minute cross-ventilation flush strictly during the lowest-pollution window",
      timing: `1:45 PM – 2:00 PM (during ${relativeLowestHour.displayTime} dispersion window)`,
      cost: "Free (₹0)",
      shortReason: `Replenishes indoor oxygen and vents accumulated CO2 specifically when outdoor atmospheric particulate density is at its daily relative minimum.`,
      priority: "medium",
      badge: "Micro-Ventilation",
    });
  }

  // Rule 2.2: Low Budget (Under ₹500 / $10)
  if (preferences.budget === "low") {
    recommendations.push({
      id: "rec-in-draft-seal",
      category: "indoor_action",
      categoryLabel: "Indoor Action",
      action: "Install self-adhesive foam weatherstripping tape along balcony doors and window tracks",
      timing: "Install during daytime before evening smog sets in",
      cost: "Low Cost (~₹150 - ₹250 / $2 - $4)",
      shortReason: `Up to 50% of ambient fine particulate smog enters apartments through perimeter frame gaps; compression foam tape cuts outdoor smoke infiltration significantly.`,
      priority: "high",
      badge: "Physical Barrier",
    });

    recommendations.push({
      id: "rec-in-n95-multipack",
      category: "indoor_action",
      categoryLabel: "Indoor Action",
      action: "Stock a multi-pack of certified ISI / NIOSH N95 particulate respirators (or KF94 for children)",
      timing: "Immediate / Keep by home entrance",
      cost: "Low Cost (~₹200 - ₹400 for 5-pack)",
      shortReason: `Cloth and surgical masks allow over 70% of sub-micron PM2.5 to bypass edges; certified N95 masks filter 95% of particulates when stepping outside.`,
      priority: "high",
      badge: "Personal Protection",
    });
  }

  // Rule 2.3: Moderate Budget (₹500 - ₹2,500 / $10 - $30)
  if (preferences.budget === "moderate") {
    recommendations.push({
      id: "rec-in-botanical-filters",
      category: "indoor_action",
      categoryLabel: "Indoor Action",
      action: "Arrange a bedroom bio-filter cluster of 3 mature Snake Plants (Sansevieria) and 1 Areca Palm",
      timing: "Permanent living room and bedroom setup",
      cost: "Moderate (~₹600 - ₹1,400 / $8 - $18)",
      shortReason: `Natural bio-filtration metabolizes airborne VOCs and produces nighttime oxygen without electricity, complementing passive draft sealing within your budget.`,
      priority: "medium",
      badge: "Botanical Bio-Defense",
    });

    recommendations.push({
      id: "rec-in-window-mesh-seal",
      category: "indoor_action",
      categoryLabel: "Indoor Action",
      action: "Fit electrostatically charged anti-smog mesh screens over bedroom window sashes",
      timing: "One-time seasonal setup",
      cost: "Moderate (~₹1,200 - ₹2,200 / $15 - $28)",
      shortReason: `Traps coarse road dust and heavy particulates at the window threshold, allowing natural daytime air renewal while blocking large particulate intrusion.`,
      priority: "high",
      badge: "Electrostatic Screen",
    });
  }

  // Rule 2.4: Flexible / High Budget (₹2,500+ / $30+)
  if (preferences.budget === "flexible") {
    recommendations.push({
      id: "rec-in-true-hepa-unit",
      category: "indoor_action",
      categoryLabel: "Indoor Action",
      action: "Deploy a medical-grade True HEPA H13 air purifier sized to your room volume (CADR > 250 m³/h)",
      timing: "Run continuously on Auto; switch to Turbo 30 min prior to bedtime",
      cost: "Flexible (~₹6,500 - ₹14,000 / $80 - $170)",
      shortReason: `Removes 99.97% of airborne PM2.5, soot particles, and aerosolized allergens, guaranteeing sub-15 µg/m³ indoor breathing air regardless of severe outdoor smog.`,
      priority: "high",
      badge: "Medical-Grade Filtration",
    });

    recommendations.push({
      id: "rec-in-pm25-laser-monitor",
      category: "indoor_action",
      categoryLabel: "Indoor Action",
      action: "Place a laser optical particle counter in the living area for real-time indoor PM2.5 monitoring",
      timing: "Active real-time room tracking",
      cost: "Flexible (~₹2,800 - ₹4,500 / $35 - $55)",
      shortReason: `Enables data-driven verification of your home's air filtration efficiency, alerting you instantly if cooking or exterior drafts breach safe thresholds.`,
      priority: "medium",
      badge: "Laser Verification",
    });
  }

  // Rule 2.5: Kitchen and cooking emissions rule (critical for all households, especially with sensitivities)
  recommendations.push({
    id: "rec-in-kitchen-exhaust",
    category: "indoor_action",
    categoryLabel: "Indoor Action",
    action: "Activate kitchen range hood 2 minutes prior to cooking and isolate kitchen doors",
    timing: "During morning and evening meal preparation",
    cost: "Free (₹0)",
    shortReason: `Tempering spices, searing, and frying can generate indoor ultrafine particulate spikes exceeding 500 µg/m³, which linger for hours in unventilated living spaces.`,
    priority: "high",
    badge: "Source Prevention",
  });

  // =========================================================================
  // 3. SUSTAINABLE ALTERNATIVES (COMMUTE MODE & ECO SWAPS)
  // =========================================================================

  // Rule 3.1: Commute Mode - Two Wheeler
  if (preferences.commuteMode === "two_wheeler") {
    recommendations.push({
      id: "rec-sa-two-wheeler-metro",
      category: "sustainable_alternative",
      categoryLabel: "Sustainable Alternative",
      action: "Swap highway two-wheeler transit for Metro rail or clean feeder electric shuttles",
      timing: "Daily morning & evening commute hours",
      cost: "Low cost (~₹30 - ₹60 per ride)",
      shortReason: `Riding an open two-wheeler in stop-and-go congestion results in direct exposure to diesel exhaust and tire wear dust at bumper height; rail transit provides filtered cabin air and zero tailpipe emissions.`,
      priority: "high",
      badge: "Commute Modal Shift",
    });

    recommendations.push({
      id: "rec-sa-two-wheeler-valved-mask",
      category: "sustainable_alternative",
      categoryLabel: "Sustainable Alternative",
      action: "When two-wheeler riding is unavoidable, equip an exhalation-valved N95 respirator under full-face helmet",
      timing: "During any road transit",
      cost: "Low Cost (~₹120 - ₹200)",
      shortReason: `Exhalation valves reduce moisture and breathing resistance during motorcycle riding while the electrostatic filter media blocks roadside black carbon.`,
      priority: "medium",
      badge: "Rider Safety",
    });
  }

  // Rule 3.2: Commute Mode - Walking / Bicycle
  if (preferences.commuteMode === "walking") {
    recommendations.push({
      id: "rec-sa-walking-green-corridor",
      category: "sustainable_alternative",
      categoryLabel: "Sustainable Alternative",
      action: "Reroute walking or cycling routes 50+ meters away from high-density multi-lane arterial roads",
      timing: "During daily walking commutes",
      cost: "Free (₹0)",
      shortReason: `Tree canopies and built buffers act as particulate sinks; empirical studies confirm inhaled black carbon drops by over 50% just 50 meters back from major road corridors.`,
      priority: "high",
      badge: "Green Corridor Routing",
    });
  }

  // Rule 3.3: Commute Mode - Auto-Rickshaw / Open Transit
  if (preferences.commuteMode === "auto_transit") {
    recommendations.push({
      id: "rec-sa-auto-electric-switch",
      category: "sustainable_alternative",
      categoryLabel: "Sustainable Alternative",
      action: "Transition from open-sided three-wheelers to enclosed electric city buses or rapid transit",
      timing: "During morning and evening peak traffic hours",
      cost: "Comparable transit fare (~₹15 - ₹45 per ride)",
      shortReason: `Open-sided auto-rickshaws trap exhaust fumes from adjacent idling commercial diesel trucks directly at passenger breathing level.`,
      priority: "high",
      badge: "Clean Fleet Transition",
    });
  }

  // Rule 3.4: Commute Mode - Private Car / Cab
  if (preferences.commuteMode === "car_cab") {
    recommendations.push({
      id: "rec-sa-car-recirc-carpool",
      category: "sustainable_alternative",
      categoryLabel: "Sustainable Alternative",
      action: "Lock AC to internal recirculation mode and organize a 2-person neighborhood carpool",
      timing: "Turn on recirculation before entering congested intersections and tunnels",
      cost: "Free (₹0 / Saves 50% fuel on carpool)",
      shortReason: `Cabin recirculation prevents sucking toxic outside exhaust directly into vehicle vents; carpooling cuts street-level vehicle emissions by half per commuter.`,
      priority: "medium",
      badge: "Cabin Defense & Carpool",
    });
  }

  // Rule 3.5: Commute Mode - Metro Rail
  if (preferences.commuteMode === "metro_rail") {
    recommendations.push({
      id: "rec-sa-metro-last-mile",
      category: "sustainable_alternative",
      categoryLabel: "Sustainable Alternative",
      action: "Pair Metro transit with shared EV micro-mobility or clean pedestrian walkways for last-mile transit",
      timing: "Station exit to destination",
      cost: "Low (~₹10 - ₹25 per trip)",
      shortReason: `Reinforces a complete zero-tailpipe-emission commute journey while bypassing localized street congestion hot-spots.`,
      priority: "standard",
      badge: "Complete Zero-Emission Trip",
    });
  }

  // Rule 3.6: Universal Domestic Sustainable Swap (Incense / Coils)
  recommendations.push({
    id: "rec-sa-incense-diffuser-swap",
    category: "sustainable_alternative",
    categoryLabel: "Sustainable Alternative",
    action: "Replace burning incense sticks (agarbatti) and mosquito coils with ultrasonic mist diffusers and window insect screens",
    timing: "Evening home routine (6:00 PM – 9:00 PM)",
    cost: preferences.budget === "zero" ? "Free (Use physical screen)" : "Low Cost (~₹350 - ₹650 / $4 - $8)",
    shortReason: `A single burning incense coil releases as much sub-micron PM2.5 and benzene soot as several cigarettes inside a closed room; ultrasonic diffusers release zero combustion particulates.`,
    priority: "high",
    badge: "Combustion Elimination",
  });

  return recommendations;
}
