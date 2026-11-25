"use client";

import React, { useState } from "react";
import { InfoIcon, ShieldAlertIcon, ChevronDownIcon } from "./Icons";

export function MethodologySection() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section id="methodology" className="w-full" aria-labelledby="methodology-heading">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <InfoIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 id="methodology-heading" className="text-lg font-bold text-slate-900 tracking-wide">
                Methodology &amp; Data Attribution
              </h2>
              <p className="text-xs text-slate-500">
                Scientific modeling framework, AQI standards comparison, and data provider disclosures.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-controls="methodology-details"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 border border-slate-200 shadow-2xs transition cursor-pointer self-start sm:self-auto focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
          >
            <span>{isExpanded ? "Hide Details" : "Read Full Methodology"}</span>
            <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Quick Highlights Summary (Always Visible) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 font-bold mb-1">
              1. Atmospheric Model vs. Sensors
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Open-Meteo air-quality forecasts use CAMS European or CAMS Global model data, depending on location. They are grid estimates rather than measurements from a nearby ground station.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-bold mb-1">
              2. AQI Scale Distinction
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              The model AQI uses the United States EPA Air Quality Index formula. It must <strong>not</strong> be confused with India&apos;s official Central Pollution Control Board (CPCB) National Air Quality Index (NAQI), which uses distinct sub-index breakpoints.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-mono uppercase tracking-wider text-sky-800 font-bold mb-1">
              3. Relative Exposure Principle
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              SmogSense compares the available hourly model AQI values and identifies a relatively lower forecast hour. This is a comparison within the forecast, not a street-level reading or a guarantee about personal exposure.
            </p>
          </div>
        </div>

        {/* Collapsible Deep Dive (When Expanded) */}
        {isExpanded && (
          <div id="methodology-details" className="mt-6 pt-6 border-t border-slate-100 space-y-6 animate-fadeIn text-xs text-slate-600">
            {/* Breakpoints Table */}
            <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">
                Guideline and Standard References: WHO 2021 and CPCB
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-slate-200 rounded-xl overflow-hidden font-sans">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 text-[11px] font-mono uppercase border-b border-slate-200">
                      <th className="p-2.5">Pollutant</th>
                      <th className="p-2.5">WHO Guideline (period)</th>
                      <th className="p-2.5">CPCB Standard (period)</th>
                      <th className="p-2.5">General health context</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/60">
                      <td className="p-2.5 font-bold text-slate-900">PM2.5</td>
                      <td className="p-2.5 text-emerald-700 font-mono">24h: 15 µg/m³</td>
                      <td className="p-2.5 text-amber-800 font-mono">24h: 60 µg/m³</td>
                      <td className="p-2.5 text-slate-600">Associated with respiratory and cardiovascular effects; responses vary with exposure and person.</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="p-2.5 font-bold text-slate-900">PM10</td>
                      <td className="p-2.5 text-emerald-700 font-mono">24h: 45 µg/m³</td>
                      <td className="p-2.5 text-amber-800 font-mono">24h: 100 µg/m³</td>
                      <td className="p-2.5 text-slate-600">Particle exposure can cause respiratory symptoms; effects vary with exposure and person.</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="p-2.5 font-bold text-slate-900">NO₂</td>
                      <td className="p-2.5 text-emerald-700 font-mono">24h: 25 µg/m³</td>
                      <td className="p-2.5 text-amber-800 font-mono">24h: 80 µg/m³</td>
                      <td className="p-2.5 text-slate-600">Can irritate airways and aggravate existing respiratory conditions.</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="p-2.5 font-bold text-slate-900">SO₂</td>
                      <td className="p-2.5 text-emerald-700 font-mono">24h: 40 µg/m³</td>
                      <td className="p-2.5 text-amber-800 font-mono">24h: 80 µg/m³</td>
                      <td className="p-2.5 text-slate-600">Can cause breathing symptoms, especially for people with asthma.</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="p-2.5 font-bold text-slate-900">CO</td>
                      <td className="p-2.5 text-emerald-700 font-mono">24h: 4.0 mg/m³</td>
                      <td className="p-2.5 text-amber-800 font-mono">8h: 2.0 mg/m³</td>
                      <td className="p-2.5 text-slate-600">At high concentrations, carbon monoxide can reduce oxygen delivery in the body.</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="p-2.5 font-bold text-slate-900">O₃ (8h)</td>
                      <td className="p-2.5 text-emerald-700 font-mono">8h: 100 µg/m³</td>
                      <td className="p-2.5 text-amber-800 font-mono">8h: 100 µg/m³</td>
                      <td className="p-2.5 text-slate-600">Can irritate lungs and aggravate asthma symptoms.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Citations & Sources */}
            <div className="pt-2">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Sources &amp; Citations</h3>
              <ul className="list-disc list-inside space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
                <li>
                  <strong className="text-slate-800">Open-Meteo Air Quality API: </strong>
                  Open-Meteo Air Quality API serving modeled forecasts based on CAMS European and CAMS Global data. Available under the Open Database License (ODbL).
                </li>
                <li>
                  <strong className="text-slate-800">World Health Organization (WHO): </strong>
                  WHO Global Air Quality Guidelines: Particulate matter (PM2.5 and PM10), ozone, nitrogen dioxide, sulfur dioxide and carbon monoxide (Geneva: World Health Organization; 2021).
                </li>
                <li>
                  <strong className="text-slate-800">Central Pollution Control Board (CPCB): </strong>
                  Ministry of Environment, Forest and Climate Change, Government of India: National Ambient Air Quality Standards (NAAQS, 2009) and National Air Quality Index technical report.
                </li>
                <li>
                  <strong className="text-slate-800">Health Advisory Engine: </strong>
                  Synthesizes local atmospheric dispersion forecasts and your household inputs to provide clear, actionable daily wellness guidance.
                </li>
              </ul>
            </div>

            {/* Medical Disclaimer Callout */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <ShieldAlertIcon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-950 leading-relaxed">
                <strong className="text-amber-900 font-semibold">Health &amp; Medical Disclaimer: </strong>
                SmogSense is an informative urban air quality guide. It does not provide medical diagnosis or replace clinical medical advice. Individuals with chronic asthma, COPD, cardiovascular conditions, or pregnancy should consult qualified medical professionals for individualized care.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
