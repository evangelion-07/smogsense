"use client";

import React, { useState } from "react";
import { SUSTAINABLE_SWAPS_DATA } from "../lib/sampleData";
import { SparklesIcon } from "./Icons";

export function SustainableSwaps() {
  const [commuteDistanceKm, setCommuteDistanceKm] = useState<number>(15);
  const [activeSwapIds, setActiveSwapIds] = useState<Record<string, boolean>>({
    "swap-1": true,
    "swap-2": true,
    "swap-3": true,
  });

  const toggleSwap = (id: string) => {
    setActiveSwapIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Calculate simulated monthly savings
  // Standard petrol car emits ~180g CO2/km and ~0.08g PM2.5/km in urban stop-and-go
  const isTransitActive = !!activeSwapIds["swap-1"];
  const isIncenseSwapActive = !!activeSwapIds["swap-3"];
  const isSolarActive = !!activeSwapIds["swap-4"];

  const monthlyDays = 22; // working days
  const roundTripKm = commuteDistanceKm * 2;

  // Monthly CO2 saved (kg)
  const commuteCo2SavedKg = isTransitActive
    ? Math.round((roundTripKm * 0.18 * monthlyDays * 0.75) * 10) / 10
    : 0;
  const solarCo2SavedKg = isSolarActive ? 100 : 0;
  const totalCo2SavedKg = Math.round((commuteCo2SavedKg + solarCo2SavedKg) * 10) / 10;

  // Monthly PM2.5 prevented from local air (grams)
  const commutePm25SavedGrams = isTransitActive
    ? Math.round((roundTripKm * 0.12 * monthlyDays) * 10) / 10
    : 0;
  const indoorSmokeSavedGrams = isIncenseSwapActive ? 35 : 0;
  const totalPmSavedGrams = Math.round((commutePm25SavedGrams + indoorSmokeSavedGrams) * 10) / 10;

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "High Impact":
        return "bg-rose-50 text-rose-800 border-rose-200";
      case "Medium":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "Easy":
      default:
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
    }
  };

  return (
    <section id="swaps" className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Clean Air Habits &amp; Environmental Impact</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
              Eco Swaps
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Simple everyday choices that lower city emissions and reduce your exposure to traffic exhaust.
          </p>
        </div>
      </div>

      {/* Interactive Savings Simulator Box */}
      <div className="mb-6 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/60 border border-emerald-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                Your Simulated Monthly Clean Air Impact
              </h3>
            </div>
            <p className="text-xs text-slate-600 max-w-xl">
              Adjust your daily one-way commute distance to estimate emissions averted by switching to clean rapid transit and home habits:
            </p>

            <div className="flex items-center gap-4 pt-2">
              <span className="text-xs font-mono text-slate-500">One-way distance:</span>
              <div className="flex items-center gap-2">
                {[5, 15, 25, 40].map((dist) => (
                  <button
                    key={dist}
                    onClick={() => setCommuteDistanceKm(dist)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer border ${
                      commuteDistanceKm === dist
                        ? "bg-emerald-600 text-white font-bold border-emerald-600 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {dist} km
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Impact Stats */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="p-4 rounded-2xl bg-white border border-emerald-200 text-center min-w-[130px] shadow-2xs">
              <div className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">
                CO₂ Averted
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-0.5">
                {totalCo2SavedKg} <span className="text-xs font-normal text-slate-600">kg/mo</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sky-200 text-center min-w-[130px] shadow-2xs">
              <div className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">
                PM2.5 Prevented
              </div>
              <div className="text-2xl sm:text-3xl font-black text-sky-700 mt-0.5">
                {totalPmSavedGrams} <span className="text-xs font-normal text-slate-600">g/mo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Swaps Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SUSTAINABLE_SWAPS_DATA.map((swap) => {
          const isAdopted = !!activeSwapIds[swap.id];

          return (
            <div
              key={swap.id}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between shadow-2xs ${
                isAdopted
                  ? "bg-white border-emerald-300 shadow-xs ring-1 ring-emerald-500/20"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${getDifficultyBadge(swap.difficulty)}`}>
                    {swap.difficulty}
                  </span>
                  <button
                    onClick={() => toggleSwap(swap.id)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition cursor-pointer border ${
                      isAdopted
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900"
                    }`}
                  >
                    {isAdopted ? "✓ Adopted in Plan" : "+ Add to My Habits"}
                  </button>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-2">
                  {swap.title}
                </h3>

                {/* Habit Comparison Block */}
                <div className="space-y-2 mb-3">
                  <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200 flex items-start gap-2">
                    <span className="text-rose-700 text-xs font-bold shrink-0 mt-0.5">From:</span>
                    <span className="text-xs text-rose-950">{swap.currentHabit}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-2">
                    <span className="text-emerald-700 text-xs font-bold shrink-0 mt-0.5">To:</span>
                    <span className="text-xs text-emerald-950">{swap.ecoAlternative}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {swap.description}
                </p>
              </div>

              {/* Emissions Benefit Footnote */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">
                  Benefit: <strong className="text-emerald-700">{swap.emissionsSaved}</strong>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {swap.airQualityBenefit}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
