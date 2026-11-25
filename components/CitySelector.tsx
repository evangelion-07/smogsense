"use client";

import React, { useState, useEffect, useRef } from "react";
import { CityData, GeocodedCity } from "../lib/types";
import { SAMPLE_CITIES } from "../lib/sampleData";
import { searchCities, PRESET_CITIES } from "../services/airQualityService";
import {
  RefreshCwIcon,
  SearchIcon,
  AlertTriangleIcon,
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
  const [activeOptionIndex, setActiveOptionIndex] = useState(-1);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchRequestId = useRef(0);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setActiveOptionIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCity = (city: GeocodedCity) => {
    setShowDropdown(false);
    setSearchQuery("");
    setSearchResults([]);
    setSearchError(null);
    setHasSearched(false);
    setActiveOptionIndex(-1);
    searchRequestId.current += 1;
    onSelectSearchResult(city);
  };

  // Handle keyboard escape
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setShowDropdown(false);
      setActiveOptionIndex(-1);
    } else if (e.key === "ArrowDown" && searchResults.length > 0) {
      e.preventDefault();
      setShowDropdown(true);
      setActiveOptionIndex((current) => (current + 1) % searchResults.length);
    } else if (e.key === "ArrowUp" && searchResults.length > 0) {
      e.preventDefault();
      setShowDropdown(true);
      setActiveOptionIndex((current) => current <= 0 ? searchResults.length - 1 : current - 1);
    } else if (e.key === "Enter" && showDropdown && activeOptionIndex >= 0) {
      e.preventDefault();
      const selected = searchResults[activeOptionIndex];
      if (selected) handleSelectCity(selected);
    }
  };

  // Perform search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (query.length < 2) return;

    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);
    setHasSearched(true);
    setShowDropdown(true);
    setActiveOptionIndex(-1);
    const requestId = ++searchRequestId.current;

    try {
      const results = await searchCities(query);
      if (requestId !== searchRequestId.current) return;
      setSearchResults(results);
    } catch (err: unknown) {
      if (requestId !== searchRequestId.current) return;
      setSearchError(err instanceof Error ? err.message : "Failed to search cities");
      setSearchResults([]);
    } finally {
      if (requestId === searchRequestId.current) setIsSearching(false);
    }
  };

  return (
    <section aria-label="City Search" className="w-full space-y-3">
      {/* Search Input Row with Live / Demo & Refresh Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search Bar */}
        <div className="relative flex-1" ref={searchContainerRef}>
          <form onSubmit={handleSearch} className="relative flex items-center">
            <div className="absolute left-3.5 text-slate-400 pointer-events-none">
              <SearchIcon className="w-4 h-4" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              role="combobox"
              aria-expanded={showDropdown && !isSearching && searchResults.length > 0}
              aria-controls={showDropdown && searchResults.length > 0 ? "city-search-results" : undefined}
              aria-activedescendant={activeOptionIndex >= 0 ? `city-option-${activeOptionIndex}` : undefined}
              aria-autocomplete="list"
              aria-busy={isSearching}
              aria-label="Search city worldwide"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchRequestId.current += 1;
                setIsSearching(false);
                setSearchResults([]);
                setSearchError(null);
                setHasSearched(false);
                setActiveOptionIndex(-1);
                setShowDropdown(false);
              }}
              onFocus={() => {
                if (searchResults.length > 0) setShowDropdown(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search any city worldwide (e.g. London, Tokyo, Delhi, New York)..."
              className="w-full pl-10 pr-24 py-2.5 bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition shadow-xs"
            />
            <button
              type="submit"
              disabled={isSearching || searchQuery.trim().length < 2}
              className="absolute right-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl text-xs font-semibold transition cursor-pointer disabled:cursor-not-allowed"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </form>

          {/* Search Results Dropdown */}
          {showDropdown && (
            <div
              className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden"
            >
              {isSearching && (
                <div role="status" className="p-4 text-center text-xs text-slate-500">
                  <div className="inline-block w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mb-1" />
                  <div>Searching locations...</div>
                </div>
              )}

              {searchError && (
                <div role="alert" className="p-3 text-xs text-rose-700 bg-rose-50">
                  {searchError}
                </div>
              )}

              {!isSearching && hasSearched && searchResults.length === 0 && !searchError && (
                <div role="status" className="p-4 text-center text-xs text-slate-500">
                  No cities found for &quot;{searchQuery}&quot;.
                </div>
              )}

              {!isSearching && searchResults.length > 0 && (
                <div
                  id="city-search-results"
                  role="listbox"
                  aria-label="City suggestions"
                  className="max-h-60 overflow-y-auto divide-y divide-slate-100"
                >
                  {searchResults.map((result, index) => (
                    <button
                      key={result.id}
                      id={`city-option-${index}`}
                      role="option"
                      aria-selected={activeOptionIndex === index}
                      tabIndex={-1}
                      onMouseEnter={() => setActiveOptionIndex(index)}
                      onClick={() => handleSelectCity(result)}
                      className="w-full text-left p-3 hover:bg-slate-50 transition flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <span className="text-xs font-semibold text-slate-900">
                          {result.name}
                        </span>
                        <span className="text-xs text-slate-400 ml-1.5">
                          {[result.admin1, result.country].filter(Boolean).join(", ")}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {result.latitude.toFixed(2)}°, {result.longitude.toFixed(2)}°
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mode Switch & Refresh */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <div className="inline-flex rounded-xl p-0.5 bg-slate-100 border border-slate-200">
            <button
              onClick={() => onToggleApiMode(true)}
              aria-pressed={isLiveApiMode}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${
                isLiveApiMode
                  ? "bg-white text-emerald-800 font-semibold shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Live
            </button>
            <button
              onClick={() => onToggleApiMode(false)}
              aria-pressed={!isLiveApiMode}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${
                !isLiveApiMode
                  ? "bg-white text-slate-900 font-semibold shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Demo
            </button>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            aria-label="Refresh data"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 border border-slate-200 transition cursor-pointer disabled:opacity-50 shadow-2xs"
            title="Refresh air quality data"
          >
            <RefreshCwIcon className={`w-3.5 h-3.5 text-emerald-600 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{isLoading ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Preset Cities Pill Bar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-slate-400 font-medium mr-1">Popular:</span>
        {PRESET_CITIES.filter((city) => isLiveApiMode || SAMPLE_CITIES.some((sample) => sample.id === city.id)).map((city) => {
          const isSelected = selectedCity.name.toLowerCase().includes(city.name.toLowerCase());
          return (
            <button
              key={city.id}
              onClick={() => {
                if (isLiveApiMode) {
                  onSelectPresetCity(city);
                } else {
                  onSelectSampleCity(city.id);
                }
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer border ${
                isSelected
                  ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                  : "bg-white hover:bg-slate-100/80 text-slate-700 border-slate-200"
              }`}
            >
              {city.name}
            </button>
          );
        })}
      </div>

      {/* API Error Notification */}
      {apiError && (
        <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangleIcon className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{apiError}</span>
          </div>
          <button
            onClick={onClearError}
            className="text-xs font-medium text-rose-700 hover:text-rose-900 underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}
    </section>
  );
}
