"use client";

import React, { useState } from "react";
import { CityData, HouseholdProfile, DailyAction } from "../lib/types";
import { ClockIcon } from "./Icons";

interface DailyActionPlanProps {
  city: CityData;
  preferences: HouseholdProfile;
}

export function DailyActionPlan({ city, preferences }: DailyActionPlanProps) {
  // Generate tailored actions based on AQI and preferences
  const getActions = (): DailyAction[] => {
    const isSevere = city.aqi > 300;
    const isPoor = city.aqi > 200;
    const isModerate = city.aqi > 100;
    const isGood = city.aqi <= 100;

    const list: DailyAction[] = [];

    // --- MORNING (6 AM - 10 AM) ---
    if (isSevere || isPoor) {
      list.push({
        id: "act-m1",
        timeSlot: "Morning (6 AM - 10 AM)",
        title: "Morning Smog Inversion: Windows Strictly Sealed",
        description:
          "Nocturnal cold air keeps heavy particulates trapped at ground level. Keep all balcony doors and windows tightly shut.",
        type: "ventilation",
        urgency: "urgent",
      });
      list.push({
        id: "act-m2",
        timeSlot: "Morning (6 AM - 10 AM)",
        title: "Mandatory N95 / FFP2 Respirator for Commute",
        description:
          "Surgical and cloth masks fail to filter sub-micron PM2.5. Wear a snug-fitting N95 respirator during morning transit.",
        type: "mask",
        urgency: "urgent",
      });
    } else if (isModerate) {
      list.push({
        id: "act-m1-mod",
        timeSlot: "Morning (6 AM - 10 AM)",
        title: "Light Morning Walk in Vegetated Parks Only",
        description:
          "Moderate particulate levels present. Avoid busy road sides; prefer dense green spaces with high tree density.",
        type: "exercise",
        urgency: "recommended",
      });
    } else {
      list.push({
        id: "act-m1-good",
        timeSlot: "Morning (6 AM - 10 AM)",
        title: "Optimal Window for Outdoor Jogging & Full Ventilation",
        description:
          "Air quality is clean (AQI " + city.aqi + "). Open all doors and windows to purge indoor CO2 and enjoy outdoor cardio.",
        type: "ventilation",
        urgency: "normal",
      });
    }

    if (preferences.hasChildren && (isSevere || isPoor)) {
      list.push({
        id: "act-m-child",
        timeSlot: "Morning (6 AM - 10 AM)",
        title: "Pediatric School Transit Advisory",
        description:
          "Ensure school transport has closed windows. Provide child-sized KF94/N95 masks and request indoor physical education sessions.",
        type: "health",
        urgency: "urgent",
        householdSpecificTag: "Children",
      });
    }

    if (preferences.hasElderly && (isSevere || isPoor)) {
      list.push({
        id: "act-m-elderly",
        timeSlot: "Morning (6 AM - 10 AM)",
        title: "Cancel Early Morning Park Walk",
        description:
          "Winter morning cold air combined with peak particulates causes acute bronchospasm and elevates stroke risk. Substitute with indoor hallway walking.",
        type: "health",
        urgency: "urgent",
        householdSpecificTag: "Seniors",
      });
    }

    if (preferences.isOutdoorAthlete && !isGood) {
      list.push({
        id: "act-m-athlete",
        timeSlot: "Morning (6 AM - 10 AM)",
        title: "Shift Cardio Indoors with HEPA Purifier",
        description:
          "Running outdoors today will deposit high particulate mass deep into alveolar sacs. Use an indoor treadmill or stationary bike with air filtration.",
        type: "exercise",
        urgency: isSevere ? "urgent" : "recommended",
        householdSpecificTag: "Athletes",
      });
    }

    // --- AFTERNOON (11 AM - 4 PM) ---
    if (isSevere || isPoor) {
      list.push({
        id: "act-a1",
        timeSlot: "Afternoon (11 AM - 4 PM)",
        title: "Brief Solar Ventilation Flushing (15 Mins)",
        description:
          "Between 1:30 PM and 3:00 PM, vertical solar convection temporarily lifts ground particulates. Crack opposite windows for 15 minutes, then reseal and boost purifiers.",
        type: "ventilation",
        urgency: "recommended",
      });
    } else if (isGood) {
      list.push({
        id: "act-a1-good",
        timeSlot: "Afternoon (11 AM - 4 PM)",
        title: "Solar Disinfection & Natural Air Turnover",
        description: "Keep cross-ventilation open to maintain indoor air fresh and dry.",
        type: "ventilation",
        urgency: "normal",
      });
    }

    if (preferences.hasRespiratoryCondition) {
      list.push({
        id: "act-a-resp",
        timeSlot: "Afternoon (11 AM - 4 PM)",
        title: "Hydration & Peak Flow Monitoring",
        description:
          "Maintain airway mucosal hydration with warm fluids and steam inhalation. Ensure rescue inhalers are readily accessible at work or home.",
        type: "health",
        urgency: "recommended",
        householdSpecificTag: "Respiratory Sensitive",
      });
    }

    // --- EVENING (5 PM - 8 PM) & NIGHT (9 PM - 6 AM) ---
    if (isSevere || isPoor) {
      list.push({
        id: "act-e1",
        timeSlot: "Night (9 PM - 6 AM)",
        title: "Activate HEPA Air Purifier in Sleeping Quarters",
        description:
          "Run air purifier in sleep mode at least 45 minutes before bedtime to scrub ambient PM2.5 down below 15 µg/m³ for restorative sleep.",
        type: "purifier",
        urgency: "urgent",
      });
      list.push({
        id: "act-e2",
        timeSlot: "Evening (5 PM - 8 PM)",
        title: "Wet-Mop Hard Floors; Avoid Dry Sweeping",
        description:
          "Dry brooms re-suspend toxic dust particles into breathing zones. Use a damp microfiber mop to capture settled heavy metals and fly ash.",
        type: "health",
        urgency: "recommended",
      });
    } else {
      list.push({
        id: "act-e1-good",
        timeSlot: "Evening (5 PM - 8 PM)",
        title: "Evening Stroll & Leisurely Outdoor Gathering",
        description:
          "Clean urban air provides safe outdoor leisure. Ideal window for community park visits.",
        type: "exercise",
        urgency: "normal",
      });
    }

    return list;
  };

  const actions = getActions();
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>({});

  const toggleComplete = (id: string) => {
    setCompletedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const completedCount = actions.filter((a) => completedIds[a.id]).length;
  const progressPercent = Math.round((completedCount / (actions.length || 1)) * 100);

  const getUrgencyBadge = (urgency: DailyAction["urgency"]) => {
    switch (urgency) {
      case "urgent":
        return "bg-rose-50 text-rose-800 border-rose-200";
      case "recommended":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "normal":
      default:
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
    }
  };

  const timeSlots = ["Morning (6 AM - 10 AM)", "Afternoon (11 AM - 4 PM)", "Evening (5 PM - 8 PM)", "Night (9 PM - 6 AM)"] as const;

  return (
    <section id="actions" aria-labelledby="action-plan-heading" className="w-full">
      {/* Header and Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 gap-4">
        <div>
          <h2 id="action-plan-heading" className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Daily Action Plan</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
              Checklist ({completedCount}/{actions.length})
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Step-by-step checklist tailored to current air conditions and your family&apos;s routine.
          </p>
        </div>

        {/* Progress Metric */}
        <div className="w-full sm:w-48" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label="Daily action plan progress">
          <div className="flex justify-between text-[11px] text-slate-500 font-mono mb-1">
            <span>Daily Progress</span>
            <span className="text-emerald-700 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {timeSlots.map((slot) => {
          const slotActions = actions.filter((a) => a.timeSlot === slot);
          if (slotActions.length === 0) return null;

          return (
            <div
              key={slot}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs"
            >
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                <ClockIcon className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 tracking-wide">{slot}</h3>
              </div>

              <div role="list" aria-label={`Actions for ${slot}`} className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {slotActions.map((act) => {
                  const isDone = !!completedIds[act.id];

                  return (
                    <div
                      key={act.id}
                      role="checkbox"
                      aria-checked={isDone}
                      tabIndex={0}
                      onClick={() => toggleComplete(act.id)}
                      onKeyDown={(e) => {
                        if (e.key === " " || e.key === "Enter") {
                          e.preventDefault();
                          toggleComplete(act.id);
                        }
                      }}
                      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-start gap-3 group focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
                        isDone
                          ? "bg-emerald-50/50 border-emerald-200 opacity-75"
                          : "bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {/* Checkbox Icon */}
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          isDone
                            ? "bg-emerald-600 text-white"
                            : "border border-slate-300 bg-white group-hover:border-slate-400"
                        }`}
                      >
                        {isDone && (
                          <svg className="w-3.5 h-3.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24" aria-hidden="true">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className={`text-xs font-bold ${
                              isDone ? "text-slate-400 line-through" : "text-slate-900 group-hover:text-emerald-700"
                            }`}
                          >
                            {act.title}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${getUrgencyBadge(
                              act.urgency
                            )}`}
                          >
                            {act.urgency}
                          </span>
                          {act.householdSpecificTag && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                              {act.householdSpecificTag}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs leading-relaxed ${
                            isDone ? "text-slate-400 line-through" : "text-slate-600"
                          }`}
                        >
                          {act.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
