"use client";

import React, { useState } from "react";
import { INDOOR_TIPS_DATA } from "../lib/sampleData";
import { CheckCircleIcon } from "./Icons";

export function IndoorAirTips() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Tips" },
    { id: "purifier", label: "Air Purifiers" },
    { id: "plants", label: "Houseplants" },
    { id: "ventilation", label: "Ventilation" },
    { id: "cleaning", label: "Cleaning & Dust" },
    { id: "cooking", label: "Kitchen & Cooking" },
  ];

  const filteredTips =
    selectedCategory === "all"
      ? INDOOR_TIPS_DATA
      : INDOOR_TIPS_DATA.filter((t) => t.category === selectedCategory);

  const getImpactBadge = (score: string) => {
    switch (score) {
      case "Essential":
        return "bg-rose-50 text-rose-800 border-rose-200";
      case "High":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "Medium":
      default:
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
    }
  };

  return (
    <section id="indoor" className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Indoor Air Quality Tips</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
              6 Practical Guides
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Practical strategies to keep home air clean and reduce fine particle buildup indoors.
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            aria-pressed={selectedCategory === cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer border ${
              selectedCategory === cat.id
                ? "bg-emerald-600 text-white font-semibold border-emerald-600 shadow-xs"
                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTips.map((tip) => (
          <div
            key={tip.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  {tip.badge}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${getImpactBadge(tip.impactScore)}`}>
                  {tip.impactScore} Impact
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mt-2">
                {tip.title}
              </h3>

              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {tip.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-start gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-800 leading-snug font-medium">
                  <span className="text-emerald-950 font-bold">Action: </span>
                  {tip.actionableStep}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
