"use client";

import React from "react";
import { GeminiStructuredExplanation, CityData, DetailedHouseholdPreferences } from "../lib/types";
import { SparklesIcon, ClockIcon, ShieldAlertIcon, CheckCircleIcon, LeafIcon, InfoIcon } from "./Icons";

interface GeminiAdvisorCardProps {
  explanation: GeminiStructuredExplanation | null;
  isLoading: boolean;
  error: string | null;
  onGenerate: () => void;
  city: CityData;
  preferences: DetailedHouseholdPreferences;
}

export function GeminiAdvisorCard({
  explanation,
  isLoading,
  error,
  onGenerate,
  city,
  preferences,
}: GeminiAdvisorCardProps) {
  return (
    <div className="w-full bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/30 border border-emerald-200/80 rounded-3xl p-6 sm:p-7 shadow-xs mb-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-100/80">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs shrink-0">
            <SparklesIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                AI Air-Quality Explanation
              </h3>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Tailored for You
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              An optional explanation of {city.name}&apos;s forecast and your selected household routine.
            </p>
          </div>
        </div>

        {/* Generate / Refresh Button */}
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold transition shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
        >
          <SparklesIcon className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          <span>{isLoading ? "Analyzing Air Conditions..." : explanation ? "Refresh Advisory" : "Get Personalized Advisory"}</span>
        </button>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
        If you request an AI explanation, this forecast and your selected household preferences, including optional health sensitivities, are sent to Google Gemini. This is optional; the rule-based recommendations remain available below.
      </p>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="py-10 text-center space-y-3">
          <div className="inline-block w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-sm font-semibold text-slate-800">
            Preparing your personalized advisory...
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Summarizing the available forecast and your selected preferences.
          </p>
        </div>
      )}

      {/* Error Notice */}
      {!isLoading && error && (
        <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <ShieldAlertIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-amber-950">
              Advisory Notice
            </div>
            <p className="text-slate-600 mt-0.5">
              {error}
            </p>
            <div className="mt-1.5 text-[11px] text-slate-500">
              Your standard recommendations below remain active and calculated directly from current forecast levels.
            </div>
          </div>
        </div>
      )}

      {/* Prompt to Generate if not loaded yet */}
      {!isLoading && !error && !explanation && (
        <div className="py-6 text-center space-y-2">
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Click <strong>&quot;Get Personalized Advisory&quot;</strong> to receive actionable routine, commute, and indoor air tips tailored specifically to your {preferences.commuteMode.replace("_", " ")} schedule and household needs.
          </p>
        </div>
      )}

      {/* Structured Personalized Advisory Content */}
      {!isLoading && explanation && (
        <div className="mt-6 space-y-6 animate-fadeIn">
          {/* 1. Summary */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-200/80 shadow-2xs">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 mb-1.5 flex items-center gap-1.5">
              <SparklesIcon className="w-3.5 h-3.5 text-emerald-600" />
              Summary Overview
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
              {explanation.summary}
            </p>
          </div>

          {/* 2. Outdoor Routine */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-sky-200/80 shadow-2xs">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-sky-800 mb-2.5 flex items-center gap-1.5">
              <ClockIcon className="w-3.5 h-3.5 text-sky-600" />
              Outdoor Timing &amp; Commute Advisory
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200">
                <div className="text-[11px] text-sky-800 font-semibold">Recommended Window:</div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                  {explanation.outdoorRoutine.recommendedWindow}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-600 font-semibold">Commute Advice ({preferences.commuteMode.replace("_", " ")}):</div>
                <div className="text-xs text-slate-700 mt-1 leading-relaxed">
                  {explanation.outdoorRoutine.commuteAdvice}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200">
                <div className="text-[11px] text-rose-800 font-semibold">Sensitivity Caution:</div>
                <div className="text-xs text-slate-700 mt-1 leading-relaxed">
                  {explanation.outdoorRoutine.exposureCaution}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Budget-Aligned Indoor Tips & 4. Sustainable Swaps Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Indoor Tips */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 mb-3 flex items-center gap-1.5">
                  <CheckCircleIcon className="w-3.5 h-3.5 text-amber-600" />
                  Indoor Air Quality Steps
                </div>

                <div className="space-y-2.5">
                  {explanation.indoorTips.map((tip, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-amber-50/40 border border-amber-200/70">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                        <span>{tip.title}</span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                          {tip.budgetContext}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {tip.action}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sustainable Swaps */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 mb-3 flex items-center gap-1.5">
                  <LeafIcon className="w-3.5 h-3.5 text-emerald-600" />
                  Recommended Habit Swaps
                </div>

                <div className="space-y-2.5">
                  {explanation.sustainableSwaps.map((swap, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-200/70">
                      <div className="text-xs font-bold text-emerald-900 mb-0.5">
                        {swap.title}
                      </div>
                      <div className="text-xs text-slate-900 font-medium">
                        {swap.swap}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        {swap.rationale}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 5. Health & Data Notes */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <InfoIcon className="w-3.5 h-3.5 text-slate-500" />
              Important Health &amp; Forecast Notes
            </div>
            <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
              {explanation.caveats.map((caveat, idx) => (
                <li key={idx} className="leading-relaxed">
                  {caveat}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
