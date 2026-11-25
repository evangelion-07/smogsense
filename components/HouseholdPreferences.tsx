"use client";

import React from "react";
import { HouseholdProfile, CityData } from "../lib/types";
import { BabyIcon, UsersIcon, HeartPulseIcon, ActivityIcon, SlidersIcon, ShieldAlertIcon } from "./Icons";

interface HouseholdPreferencesProps {
  preferences: HouseholdProfile;
  onChangePreferences: (updated: HouseholdProfile) => void;
  city: CityData;
}

export function HouseholdPreferences({
  preferences,
  onChangePreferences,
  city,
}: HouseholdPreferencesProps) {
  const toggle = (key: keyof HouseholdProfile) => {
    onChangePreferences({
      ...preferences,
      [key]: !preferences[key],
    });
  };

  const activeCount = Object.values(preferences).filter(Boolean).length;

  const getVulnerabilitySeverity = () => {
    if (["Very Unhealthy", "Hazardous", "Beyond AQI", "Severe"].includes(city.category)) {
      return {
        level: "High AQI category",
        color: "text-rose-700",
        border: "border-rose-200",
        bg: "bg-rose-50",
        text: "This AQI category is high on the selected scale. Check nearby readings and local public-health guidance.",
      };
    }
    if (["Unhealthy", "Unhealthy for Sensitive Groups", "Very Poor", "Poor"].includes(city.category)) {
      return {
        level: "Elevated AQI category",
        color: "text-amber-800",
        border: "border-amber-200",
        bg: "bg-amber-50",
        text: "People who may be more sensitive should check local public-health guidance and follow advice from their clinician.",
      };
    }
    return {
        level: "Lower AQI category",
      color: "text-emerald-700",
      border: "border-emerald-200",
      bg: "bg-emerald-50",
      text: "The modeled AQI is lower, but a city forecast cannot establish conditions at a specific home or an individual's health risk.",
    };
  };

  const severity = getVulnerabilitySeverity();

  const options: {
    key: keyof HouseholdProfile;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    tag: string;
  }[] = [
    {
      key: "hasChildren",
      label: "Children & Infants",
      sublabel: "May be more sensitive to air-pollution exposure",
      icon: <BabyIcon className="w-5 h-5 text-sky-600" />,
      tag: "Sensitivity can vary",
    },
    {
      key: "hasElderly",
      label: "Seniors (65+ years)",
      sublabel: "May be more affected by air pollution",
      icon: <UsersIcon className="w-5 h-5 text-purple-600" />,
      tag: "Sensitivity can vary",
    },
    {
      key: "hasRespiratoryCondition",
      label: "Asthma or heart / lung condition",
      sublabel: "Personalized advice may be important",
      icon: <HeartPulseIcon className="w-5 h-5 text-rose-600" />,
      tag: "Follow clinical guidance",
    },
    {
      key: "isOutdoorAthlete",
      label: "Frequent strenuous outdoor activity",
      sublabel: "Activity duration can affect exposure",
      icon: <ActivityIcon className="w-5 h-5 text-amber-600" />,
      tag: "Activity pattern",
    },
    {
      key: "hasPets",
      label: "Household Pets",
      sublabel: "Ask a veterinarian about pet-specific concerns",
      icon: <span className="text-lg">🐾</span>,
      tag: "Pet considerations",
    },
    {
      key: "isDailyCommuter",
      label: "Regular roadside travel",
      sublabel: "Traffic and route conditions can change exposure",
      icon: <span className="text-lg">🛵</span>,
      tag: "Travel pattern",
    },
  ];

  return (
    <section id="household" className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Household Profile &amp; Preferences</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
              {activeCount} Active {activeCount === 1 ? "Filter" : "Filters"}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Toggle relevant household preferences to update the vulnerability note and Daily Action Plan below.
          </p>
        </div>
        <div className="text-[11px] text-slate-500 mt-2 sm:mt-0 flex items-center gap-1.5">
          <SlidersIcon className="w-3.5 h-3.5 text-emerald-600" />
          <span>Interactive dynamic personalization</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm">
        {/* Profile Toggles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {options.map((opt) => {
            const isChecked = preferences[opt.key];
            return (
              <button
                key={opt.key}
                type="button"
                aria-pressed={isChecked}
                onClick={() => toggle(opt.key)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-start gap-3.5 relative overflow-hidden group ${
                  isChecked
                    ? "bg-emerald-50 border-emerald-500 shadow-xs ring-1 ring-emerald-500/20"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {/* Visual Icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isChecked
                      ? "bg-white border border-emerald-200"
                      : "bg-slate-100 border border-slate-200"
                  }`}
                >
                  {opt.icon}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {opt.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-tight">
                    {opt.sublabel}
                  </p>
                  <span className="inline-block mt-2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {opt.tag}
                  </span>
                </div>

                {/* Checkbox indicator */}
                <div className="absolute top-4 right-4">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                      isChecked
                        ? "bg-emerald-600 text-white"
                        : "border border-slate-300 bg-white"
                    }`}
                  >
                    {isChecked && (
                      <svg className="w-3.5 h-3.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Household Advisory Box */}
        <div className={`mt-5 p-4 rounded-2xl border ${severity.border} ${severity.bg} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
          <div className="flex items-start gap-3">
            <ShieldAlertIcon className={`w-5 h-5 ${severity.color} shrink-0 mt-0.5`} />
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${severity.color}`}>
                  {severity.level}
                </span>
                <span className="text-[11px] text-slate-500">
                  for {city.name} (AQI {city.aqi})
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-0.5 max-w-3xl leading-relaxed">
                {severity.text}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
