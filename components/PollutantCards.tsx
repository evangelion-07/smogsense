"use client";

import React from "react";
import { PollutantInfo } from "../lib/types";
import { InfoIcon } from "./Icons";

interface PollutantCardsProps {
  pollutants: PollutantInfo[];
}

export function PollutantCards({ pollutants }: PollutantCardsProps) {
  const getBadgeStyle = (category: PollutantInfo["category"]) => {
    switch (category) {
      case "Good":
        return {
          badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
          bar: "bg-emerald-500",
          border: "border-slate-200 hover:border-emerald-300",
        };
      case "Moderate":
        return {
          badge: "bg-amber-50 text-amber-800 border-amber-200",
          bar: "bg-amber-500",
          border: "border-slate-200 hover:border-amber-300",
        };
      case "High":
        return {
          badge: "bg-orange-50 text-orange-800 border-orange-200",
          bar: "bg-orange-500",
          border: "border-slate-200 hover:border-orange-300",
        };
      case "Critical":
      default:
        return {
          badge: "bg-rose-50 text-rose-800 border-rose-200",
          bar: "bg-rose-500",
          border: "border-slate-200 hover:border-rose-300",
        };
    }
  };

  return (
    <section id="pollutants" className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Key Pollutant Concentrations</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-normal border border-slate-200">
              6 Criteria Gases
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time concentration benchmarks measured against World Health Organization (WHO) 24h air guidelines.
          </p>
        </div>
        <div className="text-[11px] text-slate-500 mt-2 sm:mt-0 flex items-center gap-1">
          <InfoIcon className="w-3.5 h-3.5 text-slate-400" />
          <span>Lower is better</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pollutants.map((item) => {
          const style = getBadgeStyle(item.category);
          // Calculate percentage against benchmark. If value = benchmark -> 50%
          const ratio = item.value / item.safeBenchmark;
          const percentage = Math.min(100, Math.round((ratio / 4) * 100)); // 4x benchmark = 100%

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl bg-white border ${style.border} transition-all duration-200 hover:shadow-md flex flex-col justify-between shadow-2xs group`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {item.name}
                    </span>
                    <h3 className="text-xs text-slate-500 font-medium">
                      {item.fullName}
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${style.badge}`}
                  >
                    {item.category}
                  </span>
                </div>

                {/* Primary Metric */}
                <div className="flex items-baseline gap-1.5 my-3">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {item.value}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    {item.unit}
                  </span>
                  <span className="ml-auto text-[11px] font-medium text-slate-500">
                    {ratio > 1 ? (
                      <span className="text-rose-700 font-semibold">{ratio.toFixed(1)}x WHO limit</span>
                    ) : (
                      <span className="text-emerald-700 font-semibold">Safe ({Math.round(ratio * 100)}% of limit)</span>
                    )}
                  </span>
                </div>

                {/* Benchmark Bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
                    style={{ width: `${Math.max(5, percentage)}%` }}
                  />
                </div>

                <div className="text-[10px] font-mono text-slate-500 flex justify-between mb-3">
                  <span>Safe Threshold: {item.benchmarkLabel}</span>
                </div>
              </div>

              {/* Health Impact & Source */}
              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                <p className="text-slate-600 text-[11px] leading-snug">
                  <strong className="text-slate-800 font-semibold">Impact: </strong>
                  {item.healthImpact}
                </p>
                <p className="text-slate-500 text-[10px] leading-snug">
                  <strong className="text-slate-700 font-medium">Source: </strong>
                  {item.source}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
