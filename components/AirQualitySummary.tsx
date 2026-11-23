"use client";

import React from "react";
import { CityData, AQICategory } from "../lib/types";
import { AlertTriangleIcon, ShieldAlertIcon, ActivityIcon, WindIcon } from "./Icons";

interface AirQualitySummaryProps {
  city: CityData;
}

export function AirQualitySummary({ city }: AirQualitySummaryProps) {
  const getTheme = (category: AQICategory) => {
    switch (category) {
      case "Good":
        return {
          textColor: "text-emerald-700",
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-200",
          gradientFrom: "from-emerald-50/80",
          gradientTo: "to-white",
          indicatorColor: "bg-emerald-500",
          label: "Good Air Quality",
          description: "Air quality is satisfactory, and air pollution poses little or no risk.",
        };
      case "Satisfactory":
        return {
          textColor: "text-lime-800",
          bgColor: "bg-lime-50",
          borderColor: "border-lime-200",
          gradientFrom: "from-lime-50/80",
          gradientTo: "to-white",
          indicatorColor: "bg-lime-500",
          label: "Satisfactory",
          description: "Minor breathing discomfort to sensitive people may occur.",
        };
      case "Moderate":
        return {
          textColor: "text-amber-800",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          gradientFrom: "from-amber-50/80",
          gradientTo: "to-white",
          indicatorColor: "bg-amber-500",
          label: "Moderate Pollution",
          description: "Breathing discomfort to people with lung disease, asthma, and heart conditions.",
        };
      case "Poor":
        return {
          textColor: "text-orange-800",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          gradientFrom: "from-orange-50/80",
          gradientTo: "to-white",
          indicatorColor: "bg-orange-500",
          label: "Poor / Unhealthy",
          description: "Breathing discomfort to most people on prolonged exposure.",
        };
      case "Very Poor":
        return {
          textColor: "text-rose-800",
          bgColor: "bg-rose-50",
          borderColor: "border-rose-200",
          gradientFrom: "from-rose-50/80",
          gradientTo: "to-white",
          indicatorColor: "bg-rose-500",
          label: "Very Poor",
          description: "Respiratory illness to people on prolonged exposure. Significant impact on sensitive groups.",
        };
      case "Severe":
      default:
        return {
          textColor: "text-purple-800",
          bgColor: "bg-purple-50",
          borderColor: "border-purple-200",
          gradientFrom: "from-purple-50/80",
          gradientTo: "to-white",
          indicatorColor: "bg-purple-600",
          label: "Severe / Hazardous",
          description: "High respiratory risk across the general population, with acute effects for sensitive groups.",
        };
    }
  };

  const theme = getTheme(city.category);
  const aqiPercentage = Math.min(100, Math.round((city.aqi / 500) * 100));

  const isModel = !!city.metadata?.isModelEstimate;
  const standardName = city.metadata?.aqiStandard || "CPCB / WHO Standard Scale";
  const sourceName = city.metadata?.sourceName || "Curated Dataset (Demo)";
  const fetchTime = city.metadata?.fetchedAt || "Latest";

  return (
    <section id="summary" className="w-full">
      <div
        className={`relative overflow-hidden rounded-3xl border ${theme.borderColor} bg-gradient-to-br ${theme.gradientFrom} ${theme.gradientTo} bg-white p-6 sm:p-8 shadow-xs`}
      >
        {/* Source & Fetch Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-6 border-b border-slate-200/80 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-600">
              Source: <strong className="text-emerald-700">{sourceName}</strong>
            </span>
            {isModel ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                Atmospheric Model Forecast
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                Ground Monitor Benchmark
              </span>
            )}
          </div>
          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2">
            <span>Fetch Time: <strong className="text-slate-800">{fetchTime}</strong></span>
            <span>•</span>
            <span className="text-slate-700 font-medium">{city.name}, {city.stateOrRegion}</span>
          </div>
        </div>

        {/* 3-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main AQI Score Display (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-semibold text-slate-500">
                Air Quality Index (AQI)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono border border-slate-200">
                {standardName}
              </span>
            </div>

            <div className="flex items-baseline gap-4 mt-1">
              <div className={`text-6xl sm:text-7xl font-black tracking-tight ${theme.textColor}`}>
                {city.aqi}
              </div>
              <div className="flex flex-col">
                <span className={`text-sm font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${theme.bgColor} ${theme.borderColor} ${theme.textColor}`}>
                  {city.category}
                </span>
                <span className="text-[11px] text-slate-500 mt-1 font-mono">
                  Scale: 0 - 500+
                </span>
              </div>
            </div>

            {/* Meter Bar */}
            <div className="w-full max-w-sm mt-4">
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${theme.indicatorColor}`}
                  style={{ width: `${aqiPercentage}%` }}
                />
              </div>
              {/* Scale reference tags */}
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1.5 px-0.5">
                <span>0 (Good)</span>
                <span>100</span>
                <span>200</span>
                <span>300</span>
                <span>400</span>
                <span>500+ (Severe)</span>
              </div>
            </div>

            {isModel && (
              <p className="text-[11px] text-slate-500 mt-2 font-mono italic">
                * Note: US EPA AQI formula (model forecast, distinct from CPCB NAQI).
              </p>
            )}

            <p className="text-xs sm:text-sm text-slate-600 mt-3.5 leading-relaxed max-w-sm font-normal">
              {theme.description}
            </p>
          </div>

          {/* Quick Context & Pollutant Highlights (3 cols on lg) */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider flex items-center gap-1.5">
                <ActivityIcon className="w-3.5 h-3.5 text-emerald-600" />
                Dominant Pollutant
              </div>
              <div className="text-base font-bold text-slate-900 mt-1">
                {city.dominantPollutant.split("(")[0]}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {city.dominantPollutant.split("(")[1]?.replace(")", "") || "Primary respiratory irritant"}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider flex items-center gap-1.5">
                <WindIcon className="w-3.5 h-3.5 text-sky-600" />
                Grid Location &amp; Coordinates
              </div>
              <div className="text-xs font-semibold text-slate-800 mt-1">
                {city.coordinates.lat.toFixed(3)}°N, {city.coordinates.lng.toFixed(3)}°E
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Region: {city.stateOrRegion}
              </div>
            </div>
          </div>

          {/* Health Advisory Card (4 cols on lg) */}
          <div className="lg:col-span-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlertIcon className={`w-5 h-5 ${theme.textColor} shrink-0`} />
                <h3 className="text-sm font-bold text-slate-900 tracking-wide">
                  {city.healthWarning.title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
                {city.healthWarning.summary}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-start gap-2">
                <AlertTriangleIcon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 leading-normal">
                  <span className="font-semibold text-amber-950">Vulnerable Groups: </span>
                  {city.healthWarning.vulnerableGroups}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
