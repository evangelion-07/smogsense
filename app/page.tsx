"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { SAMPLE_CITIES } from "../lib/sampleData";
import {
  CityData,
  DetailedHouseholdPreferences,
  GeocodedCity,
  HouseholdProfile,
  GeminiStructuredExplanation,
} from "../lib/types";
import {
  fetchAirQualityFromOpenMeteo,
  transformOpenMeteoData,
  PRESET_CITIES,
} from "../services/airQualityService";
import { generateDeterministicRecommendations } from "../services/recommendationEngine";
import { Navbar, DashboardTab } from "../components/Navbar";
import { CitySelector } from "../components/CitySelector";
import { AirQualitySummary } from "../components/AirQualitySummary";
import { PollutantCards } from "../components/PollutantCards";
import { HourlyForecastChart } from "../components/HourlyForecastChart";
import { HouseholdPreferencesForm } from "../components/HouseholdPreferencesForm";
import { TailoredRecommendations } from "../components/TailoredRecommendations";
import { DailyActionPlan } from "../components/DailyActionPlan";
import { IndoorAirTips } from "../components/IndoorAirTips";
import { SustainableSwaps } from "../components/SustainableSwaps";
import { MethodologySection } from "../components/MethodologySection";
import { Footer } from "../components/Footer";
import { ActivityIcon, SparklesIcon, CheckCircleIcon, LeafIcon, InfoIcon } from "../components/Icons";

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<CityData>(SAMPLE_CITIES[0]);
  const [activeGeocodedCity, setActiveGeocodedCity] = useState<GeocodedCity>(PRESET_CITIES[0]);
  const [isLiveApiMode, setIsLiveApiMode] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  // Detailed Household Preferences Form State
  const [preferences, setPreferences] = useState<DetailedHouseholdPreferences>({
    activityTime: "early_morning",
    commuteMode: "two_wheeler",
    budget: "low",
    sensitivities: {
      hasChildren: true,
      hasElderly: false,
      hasAsthmaOrCardiac: true,
      hasAllergiesOrSinus: false,
      hasPregnancy: false,
      hasPets: true,
    },
  });

  // Server-side Gemini AI Explanation State
  const [geminiExplanation, setGeminiExplanation] = useState<GeminiStructuredExplanation | null>(null);
  const [isGeminiLoading, setIsGeminiLoading] = useState<boolean>(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);

  // Deterministic Recommendations generated purely from forecast + preferences
  const recommendations = useMemo(() => {
    return generateDeterministicRecommendations(selectedCity, preferences);
  }, [selectedCity, preferences]);

  // Backward compatible mapping for DailyActionPlan checklist
  const simpleProfile: HouseholdProfile = useMemo(() => ({
    hasChildren: preferences.sensitivities.hasChildren,
    hasElderly: preferences.sensitivities.hasElderly,
    hasRespiratoryCondition: preferences.sensitivities.hasAsthmaOrCardiac,
    isOutdoorAthlete: preferences.activityTime === "early_morning" || preferences.activityTime === "evening",
    hasPets: preferences.sensitivities.hasPets,
    isDailyCommuter:
      preferences.commuteMode === "two_wheeler" ||
      preferences.commuteMode === "walking" ||
      preferences.commuteMode === "auto_transit",
  }), [preferences]);

  // Fetch live air quality from Open-Meteo for a given geocoded city
  const fetchForCity = useCallback(async (city: GeocodedCity) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const rawData = await fetchAirQualityFromOpenMeteo(city.latitude, city.longitude);
      const transformed = transformOpenMeteoData(rawData, city);
      setSelectedCity(transformed);
      setActiveGeocodedCity(city);
      setNotice(`Updated forecast for ${city.name} from Open-Meteo`);
      setTimeout(() => setNotice(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to reach air quality service";
      setApiError(msg);
      const sampleFallback = SAMPLE_CITIES.find(
        (c) => c.name.toLowerCase() === city.name.toLowerCase()
      );
      if (sampleFallback) {
        setSelectedCity(sampleFallback);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // On mount, load initial city (New Delhi) from Open-Meteo
  useEffect(() => {
    if (isLiveApiMode) {
      fetchForCity(PRESET_CITIES[0]);
    }
  }, [fetchForCity, isLiveApiMode]);

  // Call Server-Side Gemini Endpoint
  const handleGenerateGeminiExplanation = async () => {
    setIsGeminiLoading(true);
    setGeminiError(null);

    try {
      const res = await fetch("/api/explain-recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          city: selectedCity,
          preferences,
          deterministicRecommendations: recommendations,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Service returned status ${res.status}`);
      }

      const data = await res.json();
      setGeminiExplanation(data.explanation);
      setNotice("Personalized advisory updated for your household");
      setTimeout(() => setNotice(null), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load personalized advisory.";
      setGeminiError(message);
    } finally {
      setIsGeminiLoading(false);
    }
  };

  // Handle Preset City Selection
  const handleSelectPresetCity = (preset: GeocodedCity) => {
    setGeminiExplanation(null);
    fetchForCity(preset);
  };

  // Handle City Search Result Selection
  const handleSelectSearchResult = (result: GeocodedCity) => {
    setGeminiExplanation(null);
    fetchForCity(result);
  };

  // Handle Sample City Selection (when in sample demo mode)
  const handleSelectSampleCity = (cityId: string) => {
    setGeminiExplanation(null);
    const found = SAMPLE_CITIES.find((c) => c.id === cityId) || SAMPLE_CITIES[0];
    setSelectedCity(found);
    setNotice(`Switched to curated dataset for ${found.name}`);
    setTimeout(() => setNotice(null), 3000);
  };

  // Toggle between Live Open-Meteo API and Curated Sample Data
  const handleToggleApiMode = (live: boolean) => {
    setIsLiveApiMode(live);
    setApiError(null);
    setGeminiExplanation(null);
    if (live) {
      fetchForCity(activeGeocodedCity);
    } else {
      const sampleMatch =
        SAMPLE_CITIES.find((c) => c.name.toLowerCase() === activeGeocodedCity.name.toLowerCase()) ||
        SAMPLE_CITIES[0];
      setSelectedCity(sampleMatch);
      setNotice(`Switched to offline demo mode`);
      setTimeout(() => setNotice(null), 3000);
    }
  };

  // Refresh handler
  const handleRefresh = () => {
    setGeminiExplanation(null);
    if (isLiveApiMode) {
      fetchForCity(activeGeocodedCity);
    } else {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setNotice(`Readings refreshed for ${selectedCity.name}`);
        setTimeout(() => setNotice(null), 2500);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 selection:bg-emerald-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-10">
        {/* Real-time Notice Toast */}
        {notice && (
          <div role="status" aria-live="polite" className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm text-center font-semibold shadow-xs animate-fadeIn">
            {notice}
          </div>
        )}

        {/* 1. Global City Search & Controls */}
        <CitySelector
          selectedCity={selectedCity}
          onSelectPresetCity={handleSelectPresetCity}
          onSelectSearchResult={handleSelectSearchResult}
          onSelectSampleCity={handleSelectSampleCity}
          isLiveApiMode={isLiveApiMode}
          onToggleApiMode={handleToggleApiMode}
          onRefresh={handleRefresh}
          isLoading={isLoading}
          apiError={apiError}
          onClearError={() => setApiError(null)}
        />

        {/* 2. Sleek Dashboard View Navigator (Clean, Minimalist SVG Icons) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-2 sm:p-2.5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <nav aria-label="Dashboard view navigation" className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                activeTab === "overview"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
              }`}
            >
              <ActivityIcon className={`w-4 h-4 ${activeTab === "overview" ? "text-white" : "text-emerald-600"}`} />
              <span>Overview &amp; Forecast</span>
            </button>

            <button
              onClick={() => setActiveTab("advisor")}
              className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                activeTab === "advisor"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
              }`}
            >
              <SparklesIcon className={`w-4 h-4 ${activeTab === "advisor" ? "text-white" : "text-purple-600"}`} />
              <span>Personalized Advisory</span>
            </button>

            <button
              onClick={() => setActiveTab("actions")}
              className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                activeTab === "actions"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
              }`}
            >
              <CheckCircleIcon className={`w-4 h-4 ${activeTab === "actions" ? "text-white" : "text-emerald-600"}`} />
              <span>Daily Action Plan</span>
            </button>

            <button
              onClick={() => setActiveTab("lifestyle")}
              className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                activeTab === "lifestyle"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
              }`}
            >
              <LeafIcon className={`w-4 h-4 ${activeTab === "lifestyle" ? "text-white" : "text-teal-600"}`} />
              <span>Living &amp; Swaps</span>
            </button>

            <button
              onClick={() => setActiveTab("methodology")}
              className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                activeTab === "methodology"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
              }`}
            >
              <InfoIcon className={`w-4 h-4 ${activeTab === "methodology" ? "text-white" : "text-slate-500"}`} />
              <span>Data Sources</span>
            </button>
          </nav>

          {/* Toggle Full Page Scroll vs Focused View */}
          <button
            onClick={() => setActiveTab(activeTab === "all" ? "overview" : "all")}
            className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition cursor-pointer self-start lg:self-auto border ${
              activeTab === "all"
                ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            {activeTab === "all" ? "Exit Full View" : "Show All Views"}
          </button>
        </div>

        {/* VIEW 1: Overview & Forecast (AQI Summary, 24h Timeline, Criteria Pollutants) */}
        {(activeTab === "overview" || activeTab === "all") && (
          <div className="space-y-8 sm:space-y-10 animate-fadeIn">
            {activeTab === "all" && (
              <div className="pt-4 border-t border-slate-200 flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Live Air Quality &amp; Forecast</span>
              </div>
            )}
            <AirQualitySummary city={selectedCity} />
            <HourlyForecastChart forecast={selectedCity.hourlyForecast} city={selectedCity} />
            <PollutantCards pollutants={selectedCity.pollutants} />
          </div>
        )}

        {/* VIEW 2: Personalized Advisory (Household Profile + Recommendations) */}
        {(activeTab === "advisor" || activeTab === "all") && (
          <div className="space-y-8 sm:space-y-10 animate-fadeIn">
            {activeTab === "all" && (
              <div className="pt-6 border-t border-slate-200 flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Household Profile &amp; Recommendations</span>
              </div>
            )}
            <HouseholdPreferencesForm
              preferences={preferences}
              onChangePreferences={(p) => {
                setPreferences(p);
                if (geminiExplanation) setGeminiExplanation(null);
              }}
            />
            <TailoredRecommendations
              recommendations={recommendations}
              city={selectedCity}
              preferences={preferences}
              geminiExplanation={geminiExplanation}
              isGeminiLoading={isGeminiLoading}
              geminiError={geminiError}
              onGenerateGemini={handleGenerateGeminiExplanation}
            />
          </div>
        )}

        {/* VIEW 3: Daily Action Plan */}
        {(activeTab === "actions" || activeTab === "all") && (
          <div className="space-y-8 sm:space-y-10 animate-fadeIn">
            {activeTab === "all" && (
              <div className="pt-6 border-t border-slate-200 flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Daily Action Checklist</span>
              </div>
            )}
            <DailyActionPlan city={selectedCity} preferences={simpleProfile} />
          </div>
        )}

        {/* VIEW 4: Indoor Air Quality & Sustainable Swaps */}
        {(activeTab === "lifestyle" || activeTab === "all") && (
          <div className="space-y-8 sm:space-y-10 animate-fadeIn">
            {activeTab === "all" && (
              <div className="pt-6 border-t border-slate-200 flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Indoor Air &amp; Habit Swaps</span>
              </div>
            )}
            <IndoorAirTips />
            <SustainableSwaps />
          </div>
        )}

        {/* VIEW 5: Methodology, Standards & Citations */}
        {(activeTab === "methodology" || activeTab === "all") && (
          <div className="space-y-8 sm:space-y-10 animate-fadeIn">
            {activeTab === "all" && (
              <div className="pt-6 border-t border-slate-200 flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Data Sources &amp; Methodology</span>
              </div>
            )}
            <MethodologySection />
          </div>
        )}
      </main>

      {/* Bottom Footer */}
      <Footer />
    </div>
  );
}
