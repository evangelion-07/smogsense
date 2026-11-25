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
    const isUsEpaScale = city.metadata?.aqiStandard.startsWith("US EPA") ?? true;
    const isSevere = isUsEpaScale
      ? city.category === "Hazardous" || city.category === "Beyond AQI"
      : city.category === "Severe";
    const isPoor = isUsEpaScale
      ? ["Unhealthy for Sensitive Groups", "Unhealthy", "Very Unhealthy"].includes(city.category)
      : ["Poor", "Very Poor"].includes(city.category);
    const isModerate = isUsEpaScale
      ? city.category === "Moderate"
      : ["Satisfactory", "Moderate"].includes(city.category);
    const isGood = city.category === "Good";

    const list: DailyAction[] = [];

    // --- MORNING (6 AM - 10 AM) ---
    if (isSevere || isPoor) {
      list.push({
        id: "act-m1",
        timeSlot: "Morning (6 AM - 10 AM)",
        title: "Review local readings before ventilating",
        description:
          "The modeled AQI is elevated. Check nearby readings before ventilating, and follow local public-health guidance.",
        type: "ventilation",
        urgency: "urgent",
      });
      list.push({
        id: "act-m2",
        timeSlot: "Morning (6 AM - 10 AM)",
        title: "Consider a well-fitting particulate respirator outdoors",
        description:
          "If you choose to wear a respirator, use a certified model that fits well. Follow local guidance and consider individual health needs.",
        type: "mask",
        urgency: "urgent",
      });
    } else if (isModerate) {
      list.push({
        id: "act-m1-mod",
        timeSlot: "Morning (6 AM - 10 AM)",
        title: "Check local readings before a morning walk",
        description:
          "The forecast is elevated. Sensitive people may wish to reduce prolonged or strenuous outdoor activity and avoid busy roads where practical.",
        type: "exercise",
        urgency: "recommended",
      });
    } else {
      list.push({
        id: "act-m1-good",
        timeSlot: "Morning (6 AM - 10 AM)",
        title: "Review local readings before outdoor activity or ventilation",
        description:
          "The modeled AQI is " + city.aqi + ". This is a forecast estimate, not a guarantee of conditions at your location; check nearby readings before planning activity.",
        type: "ventilation",
        urgency: "normal",
      });
    }

    if (preferences.hasChildren && (isSevere || isPoor)) {
      list.push({
        id: "act-m-child",
        timeSlot: "Morning (6 AM - 10 AM)",
        title: "Check local school guidance",
        description:
          "Check school and local public-health guidance. Ask the school about reducing strenuous outdoor activity when local conditions are elevated.",
        type: "health",
        urgency: "urgent",
        householdSpecificTag: "Children",
      });
    }

    if (preferences.hasElderly && (isSevere || isPoor)) {
      list.push({
        id: "act-m-elderly",
        timeSlot: "Morning (6 AM - 10 AM)",
        title: "Adjust outdoor plans using local readings",
        description:
          "When local readings are elevated, consider a lower-exertion indoor alternative and follow the person's clinician guidance.",
        type: "health",
        urgency: "urgent",
        householdSpecificTag: "Seniors",
      });
    }

    if (preferences.isOutdoorAthlete && !isGood) {
      list.push({
        id: "act-m-athlete",
        timeSlot: "Morning (6 AM - 10 AM)",
        title: "Consider moving strenuous exercise indoors",
        description:
          "Consider moving strenuous exercise indoors when local readings are elevated. Indoor filtration may help reduce particles when used and maintained as directed.",
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
        title: "Check conditions before ventilating",
        description:
          "Ventilate when nearby outdoor readings are lower than indoor conditions, if known. The forecast alone cannot determine the best window-opening time for a specific home.",
        type: "ventilation",
        urgency: "recommended",
      });
    } else if (isGood) {
      list.push({
        id: "act-a1-good",
        timeSlot: "Afternoon (11 AM - 4 PM)",
        title: "Check local conditions before ventilating",
        description: "Use nearby outdoor readings and indoor conditions to decide when to ventilate.",
        type: "ventilation",
        urgency: "normal",
      });
    }

    if (preferences.hasRespiratoryCondition) {
      list.push({
        id: "act-a-resp",
        timeSlot: "Afternoon (11 AM - 4 PM)",
        title: "Follow the existing respiratory care plan",
        description:
          "Follow the person's existing care plan and clinician guidance. Keep prescribed medication available as directed.",
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
        title: "Use an available air cleaner as directed",
        description:
          "If available, run and maintain the air purifier according to its manufacturer instructions. Its effect depends on the room, device, and filter.",
        type: "purifier",
        urgency: "urgent",
      });
      list.push({
        id: "act-e2",
        timeSlot: "Evening (5 PM - 8 PM)",
        title: "Wet-Mop Hard Floors; Avoid Dry Sweeping",
        description:
          "Damp dusting or mopping can reduce the amount of settled dust stirred back into the air.",
        type: "health",
        urgency: "recommended",
      });
    } else {
      list.push({
        id: "act-e1-good",
        timeSlot: "Evening (5 PM - 8 PM)",
        title: "Check local readings before outdoor activity",
        description:
          "Check local readings before outdoor leisure; a lower modeled AQI does not guarantee risk-free air at a specific location.",
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

              <ul aria-label={`Actions for ${slot}`} className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {slotActions.map((act) => {
                  const isDone = !!completedIds[act.id];

                  return (
                    <li key={act.id}>
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={isDone}
                        onClick={() => toggleComplete(act.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-start gap-3 group focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
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
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
