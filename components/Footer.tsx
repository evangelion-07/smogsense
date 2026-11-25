"use client";

import React from "react";
import { WindIcon } from "./Icons";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white mt-16 py-12 text-slate-600">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20">
              <WindIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">SmogSense</span>
              <p className="text-xs text-slate-500">Urban Air Quality &amp; Daily Action Guide</p>
            </div>
          </div>

          <nav aria-label="Footer Navigation" className="flex flex-wrap items-center gap-6 text-xs text-slate-600">
            <a href="#summary" className="hover:text-emerald-700 transition focus-visible:outline-none focus-visible:text-emerald-700">AQI Summary</a>
            <a href="#pollutants" className="hover:text-emerald-700 transition focus-visible:outline-none focus-visible:text-emerald-700">Pollutants</a>
            <a href="#forecast" className="hover:text-emerald-700 transition focus-visible:outline-none focus-visible:text-emerald-700">Hourly Forecast</a>
            <a href="#household" className="hover:text-emerald-700 transition focus-visible:outline-none focus-visible:text-emerald-700">Household Profile</a>
            <a href="#recommendations" className="hover:text-emerald-700 transition focus-visible:outline-none focus-visible:text-emerald-700">Advisory</a>
            <a href="#actions" className="hover:text-emerald-700 transition focus-visible:outline-none focus-visible:text-emerald-700">Action Plan</a>
            <a href="#indoor" className="hover:text-emerald-700 transition focus-visible:outline-none focus-visible:text-emerald-700">Indoor Tips</a>
            <a href="#swaps" className="hover:text-emerald-700 transition focus-visible:outline-none focus-visible:text-emerald-700">Habit Swaps</a>
            <a href="#methodology" className="hover:text-emerald-700 transition text-emerald-700 font-semibold focus-visible:outline-none focus-visible:underline">Methodology</a>
          </nav>
        </div>

        {/* Disclaimer & Transparency Note */}
        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
          <p className="max-w-2xl leading-relaxed text-[11px] text-slate-500">
            <strong className="text-slate-800">Data Disclosure: </strong>
            Air quality data is provided by the Open-Meteo API using CAMS European or CAMS Global model forecasts, depending on location. These grid estimates are not readings from a nearby ground sensor. Index values use the US EPA AQI scale and differ from India&apos;s National AQI (NAQI). Recommendations are for general information.
          </p>

          <div className="text-[11px] font-mono text-slate-400 shrink-0">
            SmogSense Urban Air Quality Platform
          </div>
        </div>
      </div>
    </footer>
  );
}
