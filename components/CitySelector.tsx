"use client";

import React, { useState, useEffect, useRef } from "react";
import { CityData, GeocodedCity } from "../lib/types";
import { searchCities, PRESET_CITIES } from "../services/airQualityService";
import {
  MapPinIcon,
  RefreshCwIcon,
  SearchIcon,
  AlertTriangleIcon,
  InfoIcon,
} from "./Icons";

interface CitySelectorProps {
  selectedCity: CityData;
  onSelectPresetCity: (preset: GeocodedCity) => void;
  onSelectSearchResult: (result: GeocodedCity) => void;
  onSelectSampleCity: (cityId: string) => void;
  isLiveApiMode: boolean;
  onToggleApiMode: (live: boolean) => void;
  onRefresh: () => void;
  isLoading: boolean;
  apiError: string | null;
  onClearError: () => void;
}

export function CitySelector({
  selectedCity,
  onSelectPresetCity,
  onSelectSearchResult,
  onSelectSampleCity,
  isLiveApiMode,
  onToggleApiMode,
  onRefresh,
  isLoading,
  apiError,
  onClearError,
}: CitySelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeocodedCity[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModelNote, setShowModelNote] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard escape
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowDropdown(false);
      searchInputRef.current?.blur();
    }
  };

  // Perform search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (query.length < 2) return;

    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);
    setShowDropdown(true);

    try {
      const results = await searchCities(query);
      setSearchResults(results);
    } catch (err: unknown) {
      setSearchError(err instanceof Error ? err.message : "Failed to search cities");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCity = (city: GeocodedCity) => {
    setShowDropdown(false);
    setSearchQuery("");
    setHasSearched(false);
    onSelectSearchResult(city);
  };

  const getAqiBadge = (category: string) => {
    switch (category) {
      case "Good":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Satisfactory":
        return "bg-lime-100 text-lime-800 border-lime-300";
      case "Moderate":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "Poor":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "Very Poor":
        return "bg-rose-100 text-rose-800 border-rose-300";
      case "Severe":
      default:
        return "bg-purple-100 text-purple-800 border-purple-300";
    }
  };

  return (
    <section aria-label="City Selection and Controls" className="w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
      {/* Top Header Row: Current Location & Source Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <MapPinIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {selectedCity.name}
              </h1>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getAqiBadge(selectedCity.category)}`}>
                AQI {selectedCity.aqi} • {selectedCity.category}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5 font-medium">
              <span>{selectedCity.stateOrRegion}</span>
              <span>•</span>
              <span className="font-mono text-[11px]">
                {selectedCity.coordinates.lat.toFixed(2)}°N, {selectedCity.coordinates.lng.toFixed(2)}°E
              </span>
              {selectedCity.metadata?.fetchedAt && (
                <>
                  <span>•</span>
                  <span className="font-mono text-[11px]">Updated {selectedCity.metadata.fetchedAt}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Source Toggle & Refresh */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Mode Switch Tabs */}
          <div role="tablist" aria-label="Data source selection" className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200">
            <button
              role="tab"
              aria-selected={isLiveApiMode}
              onClick={() => onToggleApiMode(true)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
                isLiveApiMode
                  ? "bg-white text-emerald-800 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isLiveApiMode ? "bg-emerald-600" : "bg-slate-300"}`} />
              Live Forecast
            </button>
            <button
              role="tab"
              aria-selected={!isLiveApiMode}
              onClick={() => onToggleApiMode(false)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
                !isLiveApiMode
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Curated Demo
            </button>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            aria-label="Refresh air quality data"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-xs font-medium text-slate-700 border border-slate-200 shadow-2xs transition cursor-pointer disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            title="Refresh air quality data"
          >
            <RefreshCwIcon className={`w-3.5 h-3.5 text-emerald-600 ${isLoading ? "animate-spin" : ""}`} />
            <span>{isLoading ? "Fetching..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Model Estimate Alert Banner (Clean & Subtle Ribbon with Expand toggle) */}
      {isLiveApiMode && (
        <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <InfoIcon className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="leading-snug">
              <strong>Open-Meteo Model Estimates:</strong> Atmospheric dispersion forecast (US EPA scale), not direct ground sensors.
            </span>
          </div>
          <button
            onClick={() => setShowModelNote(!showModelNote)}
            className="text-[11px] font-semibold text-amber-800 hover:text-amber-950 underline shrink-0 cursor-pointer"
          >
            {showModelNote ? "Less" : "Learn more"}
          </button>
        </div>
      )}

      {showModelNote && isLiveApiMode && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed animate-fadeIn">
          Values shown are atmospheric dispersion model forecasts (CAMS / NOAA) at grid resolution. They represent numerical model estimates, <strong>not direct regulatory ground sensor readings</strong>. The AQI shown is on the <strong>US EPA AQI</strong> scale and is <strong>not India’s official CPCB National Air Quality Index (NAQI)</strong>.
        </div>
      )}

      {/* API Error Notification */}
      {apiError && (
        <div role="alert" className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <AlertTriangleIcon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-rose-950">Open-Meteo API Notice: </span>
              {apiError}
            </div>
          </div>
          <button
            onClick={onClearError}
            aria-label="Dismiss error notice"
            className="text-slate-700 hover:text-slate-900 text-xs px-2.5 py-1 rounded bg-white border border-slate-200 shadow-2xs cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search Input & Preset Pills (Spacious 2-tier layout) */}
      <div className="space-y-3.5 pt-1">
        {/* Full-width Search Bar */}
        <div className="relative" ref={searchContainerRef}>
          <form onSubmit={handleSearch} className="relative flex items-center">
            <div className="absolute left-3.5 text-slate-400 pointer-events-none">
              <SearchIcon className="w-4 h-4" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              role="combobox"
              aria-expanded={showDropdown}
              aria-controls="city-search-results"
              aria-label="Search city name worldwide"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowDropdown(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search any worldwide city (e.g. London, Paris, Tokyo, Mumbai, New York)..."
              className="w-full pl-10 pr-28 py-3 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-2xs"
            />
            <button
              type="submit"
              disabled={isSearching || searchQuery.trim().length < 2}
              className="absolute right-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            >
              {isSearching ? "Searching..." : "Search City"}
            </button>
          </form>

          {/* Search Results Dropdown */}
          {showDropdown && (
            <div
              id="city-search-results"
              role="listbox"
              aria-label="City search suggestions"
              className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-64 overflow-y-auto"
            >
              {isSearching && (
                <div className="p-4 text-center text-xs text-slate-600 font-medium">
                  <div className="inline-block w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mb-1" />
                  <div>Searching global geocoding database...</div>
                </div>
              )}

              {searchError && (
                <div role="alert" className="p-3 text-xs text-rose-700 bg-rose-50">
                  {searchError}
                </div>
              )}

              {!isSearching && hasSearched && searchResults.length === 0 && !searchError && (
                <div className="p-4 text-center text-xs text-slate-600">
                  No matching cities found for &quot;{searchQuery}&quot;. Please try another spelling or nearby city.
                </div>
              )}

              {!isSearching && searchResults.length > 0 && (
                <div className="divide-y divide-slate-100">
                  <div className="px-3.5 py-2 text-[10px] font-mono text-slate-500 uppercase bg-slate-50 font-bold">
                    Matching Locations ({searchResults.length})
                  </div>
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      role="option"
                      aria-selected={false}
                      onClick={() => handleSelectCity(result)}
                      className="w-full text-left p-3.5 hover:bg-slate-50 transition flex items-center justify-between group cursor-pointer focus-visible:bg-slate-50 focus-visible:outline-none"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                          {result.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {[result.admin1, result.country].filter(Boolean).join(", ")}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {result.latitude.toFixed(2)}°, {result.longitude.toFixed(2)}°
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Preset City Quick Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mr-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Quick Presets:
          </span>

          {PRESET_CITIES.map((city) => {
            const isSelected = selectedCity.name.toLowerCase().includes(city.name.toLowerCase());

            return (
              <button
                key={city.id}
                aria-pressed={isSelected}
                onClick={() => {
                  if (isLiveApiMode) {
                    onSelectPresetCity(city);
                  } else {
                    onSelectSampleCity(city.id);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer border focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
                  isSelected
                    ? "bg-emerald-600 text-white font-bold border-emerald-600 shadow-xs ring-2 ring-emerald-500/20 scale-102"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                <span>{city.name}</span>
                {isSelected && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : getAqiBadge(selectedCity.category)
                    }`}
                  >
                    AQI {selectedCity.aqi}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
