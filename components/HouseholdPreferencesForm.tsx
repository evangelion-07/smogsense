"use client";

import React from "react";
import {
  DetailedHouseholdPreferences,
  ActivityTimePreference,
  CommuteMode,
  BudgetTier,
  SensitivityPreferences,
} from "../lib/types";
import { SlidersIcon, ClockIcon, HeartPulseIcon } from "./Icons";

interface HouseholdPreferencesFormProps {
  preferences: DetailedHouseholdPreferences;
  onChangePreferences: (updated: DetailedHouseholdPreferences) => void;
}

export function HouseholdPreferencesForm({
  preferences,
  onChangePreferences,
}: HouseholdPreferencesFormProps) {
  const setActivityTime = (time: ActivityTimePreference) => {
    onChangePreferences({ ...preferences, activityTime: time });
  };

  const setCommuteMode = (mode: CommuteMode) => {
    onChangePreferences({ ...preferences, commuteMode: mode });
  };

  const setBudget = (budget: BudgetTier) => {
    onChangePreferences({ ...preferences, budget });
  };

  const toggleSensitivity = (key: keyof SensitivityPreferences) => {
    onChangePreferences({
      ...preferences,
      sensitivities: {
        ...preferences.sensitivities,
        [key]: !preferences.sensitivities[key],
      },
    });
  };

  const activityOptions: { value: ActivityTimePreference; label: string; time: string; desc: string }[] = [
    { value: "early_morning", label: "Early Morning", time: "6:00 AM – 8:00 AM", desc: "Dawn workouts & early routines" },
    { value: "mid_morning", label: "Mid-Morning", time: "8:00 AM – 11:00 AM", desc: "Office commute & market runs" },
    { value: "afternoon", label: "Afternoon", time: "12:00 PM – 4:00 PM", desc: "Daytime errands & routines" },
    { value: "evening", label: "Evening", time: "5:00 PM – 8:00 PM", desc: "Return commute & evening walks" },
    { value: "night", label: "Night", time: "8:00 PM – 11:00 PM", desc: "Post-dinner walks & late transit" },
  ];

  const commuteOptions: { value: CommuteMode; label: string; icon: string; desc: string }[] = [
    { value: "two_wheeler", label: "Two-Wheeler / Bike", icon: "🛵", desc: "Roadside conditions vary by route and traffic." },
    { value: "walking", label: "Walking / Cycling", icon: "🚶", desc: "Conditions vary with route, effort, and traffic." },
    { value: "auto_transit", label: "Auto / Open Bus", icon: "🛺", desc: "Vehicle type and ventilation vary by service." },
    { value: "metro_rail", label: "Metro / Train", icon: "🚇", desc: "Conditions vary between travel, stations, and platforms." },
    { value: "car_cab", label: "Private Car / Cab", icon: "🚗", desc: "Cabin ventilation and traffic can affect conditions." },
  ];

  const budgetOptions: { value: BudgetTier; label: string; range: string; desc: string }[] = [
    { value: "zero", label: "No Added Spend", range: "Free actions", desc: "Schedule changes and cleaning with supplies you already have." },
    { value: "low", label: "Low Cost", range: "Small purchases", desc: "Compare basic supplies or simple gap sealing where appropriate." },
    { value: "moderate", label: "Moderate Cost", range: "Room for upgrades", desc: "Compare air-cleaner sizing, filter costs, and other options." },
    { value: "flexible", label: "Flexible Budget", range: "No fixed limit", desc: "Consider higher-cost options only after comparing performance and upkeep." },
  ];

  const sensitivityOptions: { key: keyof SensitivityPreferences; label: string; sub: string; icon: string }[] = [
    { key: "hasChildren", label: "Children & Infants", sub: "Children may be more sensitive to air pollution.", icon: "👶" },
    { key: "hasElderly", label: "Seniors (65+ years)", sub: "May be more affected by air pollution", icon: "🧓" },
    { key: "hasAsthmaOrCardiac", label: "Asthma / Cardiac", sub: "Respiratory or cardiac condition.", icon: "🫁" },
    { key: "hasAllergiesOrSinus", label: "Allergies / Sinus", sub: "Individual responses to air pollution vary.", icon: "🤧" },
    { key: "hasPregnancy", label: "Pregnancy", sub: "Follow local and clinician guidance", icon: "🤰" },
    { key: "hasPets", label: "Household Pets", sub: "Consider veterinary guidance for a pet with health concerns.", icon: "🐾" },
  ];

  const activeSensitivitiesCount = Object.values(preferences.sensitivities).filter(Boolean).length;

  return (
    <section id="household" aria-labelledby="preferences-heading" className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
        <div>
          <h2 id="preferences-heading" className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Household Preferences &amp; Profile</span>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
              Your Profile
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-2xl">
            Customize your schedule, commute, budget, and family sensitivities to personalize your recommendations.
          </p>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium self-start sm:self-auto">
          <SlidersIcon className="w-4 h-4 text-emerald-600" />
          <span>Real-time recalculation</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">
        {/* Fieldset 1: Preferred Outdoor Activity Time */}
        <fieldset className="border-0 p-0 m-0">
          <legend className="mb-3.5 w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700">
            <span className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-emerald-600" />
              <span>1. Preferred Outdoor Routine Window</span>
            </span>
            <span aria-hidden="true" className="text-xs font-medium text-slate-400 hidden sm:inline">Select a time window</span>
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
            {activityOptions.map((opt) => {
              const isSelected = preferences.activityTime === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setActivityTime(opt.value)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
                    isSelected
                      ? "bg-emerald-50/80 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20"
                      : "bg-slate-50/70 hover:bg-slate-50 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs sm:text-sm font-bold ${isSelected ? "text-emerald-950" : "text-slate-900"}`}>{opt.label}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 block mt-1">{opt.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2.5 leading-snug">{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Fieldset 2: Primary Commute Mode */}
        <fieldset className="border-0 p-0 m-0">
          <legend className="mb-3.5 w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700">
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className="text-base">🚲</span>
              <span>2. Primary Commute &amp; Travel Mode</span>
            </span>
            <span aria-hidden="true" className="text-xs font-medium text-slate-400 hidden sm:inline">Choose your usual mode</span>
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
            {commuteOptions.map((opt) => {
              const isSelected = preferences.commuteMode === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setCommuteMode(opt.value)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex items-start gap-3 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
                    isSelected
                      ? "bg-emerald-50/80 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20"
                      : "bg-slate-50/70 hover:bg-slate-50 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="text-2xl shrink-0 pt-0.5" aria-hidden="true">{opt.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs sm:text-sm font-bold truncate ${isSelected ? "text-emerald-950" : "text-slate-900"}`}>{opt.label}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 ml-1.5" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Fieldset 3: Budget Tier for Interventions */}
        <fieldset className="border-0 p-0 m-0">
          <legend className="mb-3.5 w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700">
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className="text-base">💳</span>
              <span>3. Household Budget for Air Quality Actions</span>
            </span>
            <span aria-hidden="true" className="text-xs font-medium text-slate-400 hidden sm:inline">Filters advice by practical cost</span>
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {budgetOptions.map((opt) => {
              const isSelected = preferences.budget === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setBudget(opt.value)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
                    isSelected
                      ? "bg-emerald-50/80 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20"
                      : "bg-slate-50/70 hover:bg-slate-50 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs sm:text-sm font-bold ${isSelected ? "text-emerald-950" : "text-slate-900"}`}>{opt.label}</span>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {opt.range}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Fieldset 4: Optional Health Sensitivities (Multi-select) */}
        <fieldset className="border-0 p-0 m-0">
          <legend className="mb-3.5 w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700">
            <span className="flex items-center gap-2">
              <HeartPulseIcon className="w-4 h-4 text-rose-500" />
              <span>4. Optional Household Sensitivities ({activeSensitivitiesCount} Selected)</span>
            </span>
            <span aria-hidden="true" className="text-xs font-medium text-slate-500">Select relevant profiles</span>
          </legend>

          <div role="group" aria-label="Household sensitivities" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
            {sensitivityOptions.map((opt) => {
              const isChecked = preferences.sensitivities[opt.key];
              return (
                <button
                  key={opt.key}
                  type="button"
                  role="checkbox"
                  aria-checked={isChecked}
                  onClick={() => toggleSensitivity(opt.key)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
                    isChecked
                      ? "bg-purple-50/90 border-purple-400 shadow-xs ring-1 ring-purple-500/20"
                      : "bg-slate-50/70 hover:bg-slate-50 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl" aria-hidden="true">{opt.icon}</span>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                        isChecked ? "bg-purple-600 text-white" : "border border-slate-300 bg-white"
                      }`}
                    >
                      {isChecked && (
                        <svg className="w-3.5 h-3.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className={`text-xs sm:text-sm font-bold leading-tight ${isChecked ? "text-purple-950" : "text-slate-900"}`}>{opt.label}</div>
                    <div className="text-[11px] text-slate-500 mt-1 leading-snug">{opt.sub}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>
    </section>
  );
}
