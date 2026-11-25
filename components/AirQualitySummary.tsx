"use client";

import React from "react";
import { CityData, AQICategory } from "../lib/types";
import { ShieldAlertIcon, ActivityIcon, MapPinIcon } from "./Icons";

interface AirQualitySummaryProps {
  city: CityData;
}

export function AirQualitySummary({ city }: AirQualitySummaryProps) {
  const availablePollutantCount = city.pollutants.filter((pollutant) => pollutant.value !== null).length;

  const getTheme = (category: AQICategory) => {
    switch (category) {
      case "Good":
        return {
          textColor: "text-emerald-700",
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-200",
          indicatorColor: "bg-emerald-500",
          badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
          label: "Good",
          advice: "The modeled AQI is in its lowest category. Conditions at a specific location may differ.",
        };
      case "Satisfactory":
        return {
          textColor: "text-lime-700",
          bgColor: "bg-lime-50",
          borderColor: "border-lime-200",
          indicatorColor: "bg-lime-500",
          badge: "bg-lime-100 text-lime-800 border-lime-300",
          label: "Satisfactory",
          advice: "This sample category is not a live observation. Check current local readings.",
        };
      case "Moderate":
        return {
          textColor: "text-amber-700",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          indicatorColor: "bg-amber-500",
          badge: "bg-amber-100 text-amber-800 border-amber-300",
          label: "Moderate",
          advice: "People in sensitive groups may wish to check local guidance before strenuous outdoor activity.",
        };
      case "Unhealthy for Sensitive Groups":
      case "Poor":
        return {
          textColor: "text-orange-700",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          indicatorColor: "bg-orange-500",
          badge: "bg-orange-100 text-orange-800 border-orange-300",
          label: category,
          advice: "The modeled AQI is elevated. Check local public-health guidance, especially for sensitive groups.",
        };
      case "Unhealthy":
      case "Very Poor":
        return {
          textColor: "text-rose-700",
          bgColor: "bg-rose-50",
          borderColor: "border-rose-200",
          indicatorColor: "bg-rose-500",
          badge: "bg-rose-100 text-rose-800 border-rose-300",
          label: category,
          advice: "The modeled AQI is elevated. Local readings may differ from this city-grid forecast.",
        };
      case "Very Unhealthy":
      case "Severe":
      case "Hazardous":
      case "Beyond AQI":
      default:
        return {
          textColor: "text-purple-700",
          bgColor: "bg-purple-50",
          borderColor: "border-purple-200",
          indicatorColor: "bg-purple-600",
          badge: "bg-purple-100 text-purple-800 border-purple-300",
          label: category,
          advice: "The modeled AQI is high or beyond the standard scale. Check local public-health guidance.",
        };
    }
  };

  const theme = getTheme(city.category);
  const aqiPercentage = Math.min(100, Math.round((city.aqi / 500) * 100));
  const fetchTime = city.metadata?.fetchedAt || "Latest";
  const sourceName = city.metadata?.sourceName || "Open-Meteo";
  const isUsEpaScale = city.metadata?.aqiStandard.startsWith("US EPA") ?? true;
  const guidanceText = city.metadata?.isModelEstimate
    ? city.healthWarning.summary
    : "This curated sample is for demonstration and is not a live observation. Check current local readings before making activity decisions.";
  const sensitiveGroupText = city.metadata?.isModelEstimate
    ? city.healthWarning.vulnerableGroups
    : "People in sensitive groups should follow local public-health guidance and their clinician's advice.";

  return (
    <section id="summary" className="w-full">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-4 h-4 text-emerald-600 shrink-0" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {city.name}
              <span className="text-slate-400 font-normal text-base sm:text-lg ml-2">
                {city.stateOrRegion}
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Source: <strong className="text-slate-700 font-semibold">{sourceName}</strong></span>
            <span>•</span>
            <span>{fetchTime}</span>
          </div>
        </div>

        {/* Main AQI Hero Display */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left: Big AQI Number & Bar */}
          <div className="md:col-span-6 space-y-3">
            <div className="text-xs uppercase font-semibold tracking-wider text-slate-400">
              Air Quality Index (AQI)
            </div>
            <div className="flex items-baseline gap-3">
              <span className={`text-6xl sm:text-7xl font-black tracking-tight ${theme.textColor}`}>
                {city.aqi}
              </span>
              <span className={`text-xs sm:text-sm font-bold px-3 py-1 rounded-full border ${theme.badge}`}>
                {city.category}
              </span>
            </div>

            {/* Meter Bar */}
            <div className="w-full max-w-md pt-1">
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${theme.indicatorColor}`}
                  style={{ width: `${aqiPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-medium">
                <span>0</span>
                <span>Linear display scale: 0–500 AQI</span>
                <span>500</span>
              </div>
              {isUsEpaScale && city.aqi > 500 && (
                <p className="mt-2 text-[11px] font-medium text-rose-800">
                  Values above 500 are beyond the standard AQI scale.
                </p>
              )}
            </div>
          </div>

          {/* Right: Forecast Context Card */}
          <div className="md:col-span-6 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center gap-2">
              <ShieldAlertIcon className={`w-4 h-4 ${theme.textColor}`} />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Forecast Context
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed font-normal">
              {guidanceText || theme.advice}
            </p>
            {city.healthWarning.vulnerableGroups && (
              <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Sensitive Groups: </span>
                {sensitiveGroupText}
              </div>
            )}
          </div>
        </div>

        {/* Quick Highlights Footer */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <ActivityIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Pollutants available</div>
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                {availablePollutantCount} of {city.pollutants.length}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold">AQI</span>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Standard Scale</div>
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                {city.metadata?.aqiStandard ?? "AQI scale"}
              </div>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold">GPS</span>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Coordinates</div>
              <div className="text-xs sm:text-sm font-mono font-medium text-slate-900">
                {Math.abs(city.coordinates.lat).toFixed(2)}°{city.coordinates.lat >= 0 ? "N" : "S"}, {Math.abs(city.coordinates.lng).toFixed(2)}°{city.coordinates.lng >= 0 ? "E" : "W"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
