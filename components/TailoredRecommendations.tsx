"use client";

import React, { useState } from "react";
import {
  TailoredRecommendation,
  CityData,
  DetailedHouseholdPreferences,
  RecommendationCategory,
  GeminiStructuredExplanation,
} from "../lib/types";
import { ClockIcon, InfoIcon } from "./Icons";
import { GeminiAdvisorCard } from "./GeminiAdvisorCard";

interface TailoredRecommendationsProps {
  recommendations: TailoredRecommendation[];
  city: CityData;
  preferences: DetailedHouseholdPreferences;
  geminiExplanation: GeminiStructuredExplanation | null;
  isGeminiLoading: boolean;
  geminiError: string | null;
  onGenerateGemini: () => void;
}

export function TailoredRecommendations({
  recommendations,
  city,
  preferences,
  geminiExplanation,
  isGeminiLoading,
  geminiError,
  onGenerateGemini,
}: TailoredRecommendationsProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const filterTabs: { id: string; label: string; category?: RecommendationCategory }[] = [
    { id: "all", label: `All Actions (${recommendations.length})` },
    {
      id: "time_window",
      label: `Lower-Pollution Windows (${recommendations.filter((r) => r.category === "time_window").length})`,
      category: "time_window",
    },
    {
      id: "indoor_action",
      label: `Indoor Steps (${recommendations.filter((r) => r.category === "indoor_action").length})`,
      category: "indoor_action",
    },
    {
      id: "sustainable_alternative",
      label: `Sustainable Habits (${recommendations.filter((r) => r.category === "sustainable_alternative").length})`,
      category: "sustainable_alternative",
    },
  ];

  const filteredRecs =
    selectedFilter === "all"
      ? recommendations
      : recommendations.filter((r) => r.category === selectedFilter);

  const getCategoryTheme = (category: RecommendationCategory) => {
    switch (category) {
      case "time_window":
        return {
          pill: "bg-sky-50 text-sky-800 border-sky-200",
          border: "hover:border-sky-300",
          iconColor: "text-sky-600",
        };
      case "indoor_action":
        return {
          pill: "bg-amber-50 text-amber-800 border-amber-200",
          border: "hover:border-amber-300",
          iconColor: "text-amber-600",
        };
      case "sustainable_alternative":
      default:
        return {
          pill: "bg-emerald-50 text-emerald-800 border-emerald-200",
          border: "hover:border-emerald-300",
          iconColor: "text-emerald-600",
        };
    }
  };

  return (
    <section id="recommendations" className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Household Advisory &amp; Action Guide</span>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
              Personalized Plan
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Clear, actionable steps tailored to {city.name}&apos;s current pollution forecast and your household routine.
          </p>
        </div>
      </div>

      {/* 1. Personalized Advisory Card */}
      <GeminiAdvisorCard
        explanation={geminiExplanation}
        isLoading={isGeminiLoading}
        error={geminiError}
        onGenerate={onGenerateGemini}
        city={city}
        preferences={preferences}
      />

      {/* 2. Air Quality Timing Guidance Note */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs sm:text-sm flex items-start gap-3 shadow-2xs">
        <InfoIcon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed text-xs text-amber-950">
          <span className="font-semibold text-amber-950">Air Quality &amp; Timing Guidance: </span>
          Time window suggestions identify the relatively lowest AQI hour in your selected time range or the available forecast. This comparison does not measure personal exposure; during elevated AQI, follow local public-health guidance.
        </div>
      </div>

      {/* 3. Action Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-pressed={selectedFilter === tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                selectedFilter === tab.id
                  ? "bg-emerald-600 text-white font-bold border-emerald-600 shadow-xs"
                  : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs font-medium text-slate-500">
          Showing {filteredRecs.length} {filteredRecs.length === 1 ? "Action" : "Actions"}
        </span>
      </div>

      {/* 4. Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRecs.map((rec) => {
          const theme = getCategoryTheme(rec.category);

          return (
            <div
              key={rec.id}
              className={`p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-sm transition-all duration-200 ${theme.border} group flex flex-col justify-between`}
            >
              <div>
                {/* Header: Category Pill & Priority Badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${theme.pill}`}>
                    {rec.categoryLabel}
                  </span>
                  {rec.badge && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                      {rec.badge}
                    </span>
                  )}
                </div>

                {/* 1. Action (Title) */}
                <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug mb-3.5">
                  {rec.action}
                </h3>

                {/* 2. Timing & 3. Cost Badges */}
                <div className="space-y-2 mb-4">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-xs">
                    <ClockIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <div className="truncate">
                      <span className="text-slate-500 font-medium">Timing: </span>
                      <strong className="text-slate-800 font-semibold">{rec.timing}</strong>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-xs">
                    <div className="min-w-0 truncate">
                      <span className="text-slate-500 font-medium">Cost: </span>
                      <strong className="text-slate-800 font-semibold">{rec.cost}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Reason */}
              <div className="pt-3.5 border-t border-slate-100 text-xs">
                <p className="text-slate-600 text-xs leading-relaxed">
                  <strong className="text-slate-800 font-semibold">Why this helps: </strong>
                  {rec.shortReason}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
