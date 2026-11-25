"use client";

import React from "react";
import { PollutantInfo } from "../lib/types";

interface PollutantCardsProps {
  pollutants: PollutantInfo[];
  isModelEstimate: boolean;
}

export function PollutantCards({ pollutants, isModelEstimate }: PollutantCardsProps) {
  return (
    <section id="pollutants" className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Key Air Pollutants
          </h2>
          <p className="text-xs text-slate-400">
            {isModelEstimate ? "Hourly model estimates" : "Illustrative hourly sample values"}. WHO guideline periods differ and are not directly comparable to a single hour.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {pollutants.map((item) => {
          return (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition duration-150 hover:shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-base font-bold text-slate-900">
                      {item.name}
                    </span>
                    <div className="text-[11px] text-slate-400">
                      {item.fullName}
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-slate-50 text-slate-600 border-slate-200">
                    Hourly value
                  </span>
                </div>

                {/* Primary Metric */}
                <div className="flex items-baseline gap-1.5 my-2.5">
                  <span className={`text-2xl font-black ${item.value === null ? "text-slate-400" : "text-slate-900"}`}>
                    {item.value === null ? "Unavailable" : item.value}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {item.unit}
                  </span>
                </div>

                <div className="text-[10px] text-slate-500">
                  WHO guideline reference: {item.guidelineLabel}
                </div>
              </div>

              {/* Health Impact */}
              <div className="pt-2.5 mt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                {HEALTH_CONTEXT[item.id]}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const HEALTH_CONTEXT: Record<PollutantInfo["id"], string> = {
  pm25: "Fine particles can reach deep into the lungs. Effects vary with exposure and individual susceptibility.",
  pm10: "Particle exposure can affect breathing. Effects vary with exposure and individual susceptibility.",
  no2: "Can irritate airways and aggravate existing respiratory conditions.",
  so2: "Can cause breathing symptoms, especially for people with asthma during exertion.",
  co: "At high concentrations, inhaled carbon monoxide can reduce oxygen delivery in the body.",
  o3: "Can irritate the lungs and aggravate asthma symptoms.",
};
