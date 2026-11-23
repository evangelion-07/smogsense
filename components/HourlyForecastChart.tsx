"use client";

import React, { useState } from "react";
import { HourlyForecastItem, AQICategory, CityData } from "../lib/types";
import { ClockIcon, AlertTriangleIcon, SparklesIcon } from "./Icons";

interface HourlyForecastChartProps {
  forecast: HourlyForecastItem[];
  city?: CityData;
}

export function HourlyForecastChart({ forecast, city }: HourlyForecastChartProps) {
  const [selectedHour, setSelectedHour] = useState<HourlyForecastItem>(
    forecast.find((f) => f.isPeakHour) || forecast[2] || forecast[0]
  );

  // Keep selectedHour synced if forecast changes
  React.useEffect(() => {
    if (forecast && forecast.length > 0) {
      setSelectedHour(forecast.find((f) => f.isPeakHour) || forecast[0]);
    }
  }, [forecast]);

  const getBarColor = (category: AQICategory) => {
    switch (category) {
      case "Good":
        return "bg-emerald-500 hover:bg-emerald-400";
      case "Satisfactory":
        return "bg-lime-500 hover:bg-lime-400";
      case "Moderate":
        return "bg-amber-500 hover:bg-amber-400";
      case "Poor":
        return "bg-orange-500 hover:bg-orange-400";
      case "Very Poor":
        return "bg-rose-500 hover:bg-rose-400";
      case "Severe":
      default:
        return "bg-purple-600 hover:bg-purple-500";
    }
  };

  const getTextColor = (category: AQICategory) => {
    switch (category) {
      case "Good":
        return "text-emerald-700";
      case "Satisfactory":
        return "text-lime-700";
      case "Moderate":
        return "text-amber-700";
      case "Poor":
        return "text-orange-700";
      case "Very Poor":
        return "text-rose-700";
      case "Severe":
      default:
        return "text-purple-700";
    }
  };

  if (!forecast || forecast.length === 0) {
    return (
      <section id="forecast" className="w-full p-8 text-center bg-white border border-slate-200 rounded-3xl">
        <p className="text-slate-600 text-sm">No hourly forecast data available.</p>
      </section>
    );
  }

  // Find lowest and highest AQI points
  const lowestPoint = [...forecast].sort((a, b) => a.aqi - b.aqi)[0];
  const highestPoint = [...forecast].sort((a, b) => b.aqi - a.aqi)[0];

  // Max AQI for relative bar height calculation
  const maxAqi = Math.max(...forecast.map((f) => f.aqi), 100);

  const sourceName = city?.metadata?.sourceName || "Curated Dataset";
  const fetchTime = city?.metadata?.fetchedAt || "Latest";
  const aqiStandard = city?.metadata?.aqiStandard || "AQI Standard";

  return (
    <section id="forecast" aria-labelledby="forecast-heading" className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4">
        <div>
          <h2 id="forecast-heading" className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>24-Hour Pollution &amp; AQI Forecast</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal border border-slate-200">
              PM2.5 &bull; PM10 &bull; {aqiStandard.split("(")[0]}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Hourly projection from <strong>{sourceName}</strong> (Updated: {fetchTime}).
          </p>
        </div>
        <div className="text-[11px] text-slate-500 mt-2 sm:mt-0 flex items-center gap-1.5">
          <ClockIcon className="w-3.5 h-3.5 text-emerald-600" />
          <span>Click any bar to inspect hourly levels &amp; advice</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs">
        {/* Source and Model disclaimer chip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Forecast Source:</span>
            <span className="text-emerald-700 font-semibold">{sourceName}</span>
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Grid Forecast &bull; Timestamp: {fetchTime}
          </div>
        </div>

        {/* Quick Highlights: Best Window vs Peak Window */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <SparklesIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-emerald-800 uppercase tracking-wider font-semibold">
                Relatively Lower Pollution Window
              </div>
              <div className="text-xs text-slate-700 mt-0.5">
                <strong className="text-slate-900">{lowestPoint.displayTime}</strong> (Forecast AQI {lowestPoint.aqi}, PM2.5 {lowestPoint.pm25} µg/m³)
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 shrink-0">
              <AlertTriangleIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-rose-800 uppercase tracking-wider font-semibold">
                Forecasted Peak Pollution Window
              </div>
              <div className="text-xs text-slate-700 mt-0.5">
                <strong className="text-slate-900">{highestPoint.displayTime}</strong> (Forecast AQI {highestPoint.aqi}, PM2.5 {highestPoint.pm25} µg/m³)
              </div>
            </div>
          </div>
        </div>

        {/* Hourly Bar Timeline Chart */}
        <div className="relative">
          <div
            tabIndex={0}
            role="region"
            aria-label="Hourly forecast bar timeline"
            className="overflow-x-auto pb-4 focus-visible:ring-1 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-xl"
          >
            <div className="min-w-[620px] flex items-end justify-between gap-3 h-52 px-2 pt-6">
              {forecast.map((item) => {
                const heightPercent = Math.max(16, Math.round((item.aqi / maxAqi) * 100));
                const isSelected = selectedHour.hour === item.hour;
                const barColor = getBarColor(item.category);

                return (
                  <button
                    key={item.hour}
                    type="button"
                    aria-label={`Inspect forecast for ${item.displayTime}: AQI ${item.aqi}, PM2.5 ${item.pm25} micrograms per cubic meter`}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedHour(item)}
                    className="flex-1 flex flex-col items-center h-full justify-end group focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-xl cursor-pointer"
                  >
                    {/* Peak badge tag */}
                    {item.isPeakHour && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 mb-1">
                        Peak
                      </span>
                    )}

                    {/* Value on top of bar */}
                    <span
                      className={`text-[10px] font-mono font-bold mb-1 transition-opacity ${
                        isSelected ? "text-slate-900" : "text-slate-500 group-hover:text-slate-800"
                      }`}
                    >
                      {item.aqi}
                    </span>

                    {/* Bar Pillar */}
                    <div className="w-full max-w-[34px] bg-slate-100 rounded-t-xl p-0.5 flex flex-col justify-end h-full">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-300 ${barColor} ${
                          isSelected ? "ring-2 ring-emerald-600 shadow-md" : "opacity-85 group-hover:opacity-100"
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    {/* Time Label */}
                    <span
                      className={`mt-2 text-[11px] font-medium transition-colors ${
                        isSelected ? "text-emerald-700 font-bold" : "text-slate-500 group-hover:text-slate-800"
                      }`}
                    >
                      {item.displayTime}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Hour Details Box: Explicitly shows PM2.5, PM10 & AQI */}
        <div className="mt-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-center shrink-0 shadow-2xs">
              <div className="text-[10px] uppercase text-slate-500 font-mono">Hour</div>
              <div className="text-base font-bold text-slate-900">{selectedHour.displayTime}</div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-bold text-slate-900">
                  AQI: <span className={getTextColor(selectedHour.category)}>{selectedHour.aqi}</span> ({selectedHour.category})
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono font-medium">
                  PM2.5: {selectedHour.pm25} µg/m³
                </span>
                {selectedHour.pm10 !== undefined && (
                  <span className="text-xs px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-300 font-mono font-medium">
                    PM10: {selectedHour.pm10} µg/m³
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                {selectedHour.advice}
              </p>
            </div>
          </div>

          <div className="text-right text-xs font-mono text-slate-500 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-200">
            <div>Source: {city?.metadata?.isModelEstimate ? "Atmospheric Grid Model" : "Sample Data"}</div>
            <div>Updated: {fetchTime}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
