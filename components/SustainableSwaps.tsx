"use client";

import React, { useState } from "react";
import { SUSTAINABLE_SWAPS_DATA } from "../lib/sampleData";
import { SparklesIcon } from "./Icons";

export function SustainableSwaps() {
  const [commuteDistanceKm, setCommuteDistanceKm] = useState<number>(15);
  const [activeSwapIds, setActiveSwapIds] = useState<Record<string, boolean>>({});

  const toggleSwap = (id: string) => {
    setActiveSwapIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Show scenario activity only; emissions and personal exposure need local,
  // vehicle-specific inputs that this demo does not collect.
  const isTransitActive = !!activeSwapIds["swap-1"];
  const selectedSwapCount = Object.values(activeSwapIds).filter(Boolean).length;
  const monthlyCommuteDistanceKm = isTransitActive ? commuteDistanceKm * 2 * 22 : 0;

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
              <span>Lower-Emission Travel &amp; Home Habits</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
              Eco Swaps
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
              Compare practical alternatives. Estimated emissions and personal exposure depend on local conditions and the choices being compared.
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
              Monthly Commute Scenario
              </h3>
            </div>
            <p className="text-xs text-slate-600 max-w-xl">
              Set a one-way commute distance. The travel distance below assumes 22 round trips per month when transit is selected; it does not estimate emissions or health effects.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <span className="text-xs font-mono text-slate-500">One-way distance:</span>
              <div className="flex items-center gap-2">
                {[5, 15, 25, 40].map((dist) => (
                  <button
                    key={dist}
                    type="button"
                    aria-pressed={commuteDistanceKm === dist}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
            <div className="p-4 rounded-2xl bg-white border border-emerald-200 text-center min-w-[130px] shadow-2xs">
              <div className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">
                Transit Commute Distance
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-0.5">
                {monthlyCommuteDistanceKm} <span className="text-xs font-normal text-slate-600">km/mo</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sky-200 text-center min-w-[130px] shadow-2xs">
              <div className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">
                Selected Swaps
              </div>
              <div className="text-2xl sm:text-3xl font-black text-sky-700 mt-0.5">
                {selectedSwapCount} <span className="text-xs font-normal text-slate-600">of {SUSTAINABLE_SWAPS_DATA.length}</span>
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
                    type="button"
                    onClick={() => toggleSwap(swap.id)}
                    aria-pressed={isAdopted}
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

              {/* Scenario note */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">
                  Possible impact: <strong className="text-emerald-700">{swap.impactNote}</strong>
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
