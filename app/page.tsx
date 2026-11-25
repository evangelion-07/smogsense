"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  const activeGeocodedCityRef = useRef(activeGeocodedCity);
  const [isLiveApiMode, setIsLiveApiMode] = useState<boolean>(true);
  const [liveModeRefreshKey, setLiveModeRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const cityRequestId = useRef(0);

  // Detailed Household Preferences Form State
  const [preferences, setPreferences] = useState<DetailedHouseholdPreferences>({
    activityTime: "early_morning",
    commuteMode: "two_wheeler",
    budget: "low",
    sensitivities: {
      hasChildren: false,
      hasElderly: false,
      hasAsthmaOrCardiac: false,
      hasAllergiesOrSinus: false,
      hasPregnancy: false,
      hasPets: false,
    },
  });

  // Server-side Gemini AI Explanation State
  const [geminiExplanation, setGeminiExplanation] = useState<GeminiStructuredExplanation | null>(null);
  const [isGeminiLoading, setIsGeminiLoading] = useState<boolean>(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);
  const geminiRequestId = useRef(0);

  // Deterministic Recommendations generated purely from forecast + preferences
  const recommendations = useMemo(() => {
    return generateDeterministicRecommendations(selectedCity, preferences);
  }, [selectedCity, preferences]);

  // Backward compatible mapping for DailyActionPlan checklist
  const simpleProfile: HouseholdProfile = useMemo(() => ({
    hasChildren: preferences.sensitivities.hasChildren,
    hasElderly: preferences.sensitivities.hasElderly,
    hasRespiratoryCondition: preferences.sensitivities.hasAsthmaOrCardiac,
    isOutdoorAthlete: false,
    hasPets: preferences.sensitivities.hasPets,
    isDailyCommuter: false,
  }), [preferences]);

  // Fetch live air quality from Open-Meteo for a given geocoded city
  const fetchForCity = useCallback(async (city: GeocodedCity) => {
    const requestId = ++cityRequestId.current;
    try {
      const rawData = await fetchAirQualityFromOpenMeteo(city.latitude, city.longitude);
      const transformed = transformOpenMeteoData(rawData, city);
      if (requestId !== cityRequestId.current) return;
      setSelectedCity(transformed);
      setActiveGeocodedCity(city);
      activeGeocodedCityRef.current = city;
      setNotice(`Updated forecast for ${city.name}`);
      setTimeout(() => setNotice(null), 3000);
    } catch (err: unknown) {
      if (requestId !== cityRequestId.current) return;
      const msg = err instanceof Error ? err.message : "Unable to reach air quality service";
      setApiError(`Could not load a forecast for ${city.name}: ${msg}`);
    } finally {
      if (requestId === cityRequestId.current) setIsLoading(false);
    }
  }, []);

  // Load the active city on mount and when the user switches back to live mode.
  useEffect(() => {
    if (!isLiveApiMode) return;

    const city = activeGeocodedCityRef.current;
    const requestId = ++cityRequestId.current;
    void (async () => {
      try {
        const rawData = await fetchAirQualityFromOpenMeteo(city.latitude, city.longitude);
        const transformed = transformOpenMeteoData(rawData, city);
        if (requestId !== cityRequestId.current) return;
        setSelectedCity(transformed);
        setActiveGeocodedCity(city);
        setNotice(`Updated forecast for ${city.name}`);
        setTimeout(() => setNotice(null), 3000);
      } catch (err: unknown) {
        if (requestId !== cityRequestId.current) return;
        const msg = err instanceof Error ? err.message : "Unable to reach air quality service";
        setApiError(`Could not load a forecast for ${city.name}: ${msg}`);
      } finally {
        if (requestId === cityRequestId.current) setIsLoading(false);
      }
    })();
  }, [isLiveApiMode, liveModeRefreshKey]);

  // Call Server-Side Gemini Endpoint
  const handleGenerateGeminiExplanation = async () => {
    const requestId = ++geminiRequestId.current;
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
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Service returned status ${res.status}`);
      }

      const data: unknown = await res.json();
      if (requestId !== geminiRequestId.current) return;
      if (!data || typeof data !== "object" || !("explanation" in data) || !data.explanation) {
        const error = "The advisory service did not return a usable explanation.";
        throw new Error(error);
      }
      setGeminiExplanation(data.explanation as GeminiStructuredExplanation);
      setNotice("Personalized advisory updated for your household");
      setTimeout(() => setNotice(null), 3000);
    } catch (err: unknown) {
      if (requestId !== geminiRequestId.current) return;
      const message = err instanceof Error ? err.message : "Failed to load personalized advisory.";
      setGeminiError(message);
    } finally {
      if (requestId === geminiRequestId.current) setIsGeminiLoading(false);
    }
  };

  // Handle Preset City Selection
  const handleSelectPresetCity = (preset: GeocodedCity) => {
    setIsLoading(true);
    setApiError(null);
    setActiveGeocodedCity(preset);
    activeGeocodedCityRef.current = preset;
    geminiRequestId.current += 1;
    setGeminiExplanation(null);
    setGeminiError(null);
    setIsGeminiLoading(false);
    fetchForCity(preset);
  };

  // Handle City Search Result Selection
  const handleSelectSearchResult = (result: GeocodedCity) => {
    if (!isLiveApiMode) {
      setNotice(`Switch to Live mode to load a forecast for ${result.name}`);
      setTimeout(() => setNotice(null), 3000);
      return;
    }
    setIsLoading(true);
    setApiError(null);
    setActiveGeocodedCity(result);
    activeGeocodedCityRef.current = result;
    geminiRequestId.current += 1;
    setGeminiExplanation(null);
    setGeminiError(null);
    setIsGeminiLoading(false);
    fetchForCity(result);
  };

  // Handle Sample City Selection (when in sample demo mode)
  const handleSelectSampleCity = (cityId: string) => {
    cityRequestId.current += 1;
    setIsLoading(false);
    geminiRequestId.current += 1;
    setGeminiExplanation(null);
    setGeminiError(null);
    setIsGeminiLoading(false);
    const found = SAMPLE_CITIES.find((c) => c.id === cityId) || SAMPLE_CITIES[0];
    setSelectedCity(found);
    const matchingPreset = PRESET_CITIES.find((city) => city.id === found.id);
    if (matchingPreset) {
      setActiveGeocodedCity(matchingPreset);
      activeGeocodedCityRef.current = matchingPreset;
    }
    setNotice(`Switched to dataset for ${found.name}`);
    setTimeout(() => setNotice(null), 3000);
  };

  // Toggle between Live Open-Meteo API and Curated Sample Data
  const handleToggleApiMode = (live: boolean) => {
    setIsLiveApiMode(live);
    setIsLoading(live);
    setApiError(null);
    setGeminiExplanation(null);
    setGeminiError(null);
    geminiRequestId.current += 1;
    setIsGeminiLoading(false);
    if (!live) {
      cityRequestId.current += 1;
      setIsLoading(false);
      const sampleMatch =
        SAMPLE_CITIES.find((c) => c.name.toLowerCase() === activeGeocodedCity.name.toLowerCase()) ||
        SAMPLE_CITIES[0];
      setSelectedCity(sampleMatch);
      setNotice(`Switched to offline demo mode`);
      setTimeout(() => setNotice(null), 3000);
    } else {
      cityRequestId.current += 1;
      setLiveModeRefreshKey((key) => key + 1);
    }
  };

  // Refresh handler
  const handleRefresh = () => {
    geminiRequestId.current += 1;
    setGeminiExplanation(null);
    setGeminiError(null);
    setIsGeminiLoading(false);
    if (isLiveApiMode) {
      setIsLoading(true);
      setApiError(null);
      fetchForCity(activeGeocodedCity);
    } else {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setNotice(`Readings refreshed for ${selectedCity.name}`);
        setTimeout(() => setNotice(null), 2000);
      }, 400);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-800 selection:bg-emerald-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        isModelEstimate={selectedCity.metadata?.isModelEstimate ?? false}
        onSelectTab={setActiveTab}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Real-time Notice Toast */}
        {notice && (
          <div role="status" aria-live="polite" className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm text-center font-medium shadow-xs">
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

        {/* 2. Sleek Dashboard View Navigator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
          <nav aria-label="Dashboard views" className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveTab("overview")}
              aria-pressed={activeTab === "overview"}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "overview"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300"
              }`}
            >
              <ActivityIcon className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("advisor")}
              aria-pressed={activeTab === "advisor"}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "advisor"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300"
              }`}
            >
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>Health Advisory</span>
            </button>

            <button
              onClick={() => setActiveTab("actions")}
              aria-pressed={activeTab === "actions"}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "actions"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300"
              }`}
            >
              <CheckCircleIcon className="w-3.5 h-3.5" />
              <span>Daily Plan</span>
            </button>

            <button
              onClick={() => setActiveTab("lifestyle")}
              aria-pressed={activeTab === "lifestyle"}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "lifestyle"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300"
              }`}
            >
              <LeafIcon className="w-3.5 h-3.5" />
              <span>Clean Habits</span>
            </button>

            <button
              onClick={() => setActiveTab("methodology")}
              aria-pressed={activeTab === "methodology"}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "methodology"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300"
              }`}
            >
              <InfoIcon className="w-3.5 h-3.5" />
              <span>Data Sources</span>
            </button>
          </nav>

          {/* Toggle Full Page Scroll vs Focused View */}
          <button
            onClick={() => setActiveTab(activeTab === "all" ? "overview" : "all")}
            aria-pressed={activeTab === "all"}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 underline self-start sm:self-auto cursor-pointer"
          >
            {activeTab === "all" ? "Show focused tabs" : "View all sections on one page"}
          </button>
        </div>

        {/* VIEW 1: Overview & Forecast (AQI Summary, Criteria Pollutants, 24h Timeline) */}
        {(activeTab === "overview" || activeTab === "all") && (
          <div className="space-y-6 sm:space-y-8">
            <AirQualitySummary city={selectedCity} />
            <PollutantCards
              pollutants={selectedCity.pollutants}
              isModelEstimate={selectedCity.metadata?.isModelEstimate ?? false}
            />
            <HourlyForecastChart forecast={selectedCity.hourlyForecast} city={selectedCity} />
          </div>
        )}

        {/* VIEW 2: Personalized Advisory (Household Profile + Recommendations) */}
        {(activeTab === "advisor" || activeTab === "all") && (
          <div className="space-y-6 sm:space-y-8">
            <HouseholdPreferencesForm
              preferences={preferences}
              onChangePreferences={(p) => {
                setPreferences(p);
                geminiRequestId.current += 1;
                setGeminiExplanation(null);
                setGeminiError(null);
                setIsGeminiLoading(false);
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
          <div className="space-y-6 sm:space-y-8">
            <DailyActionPlan
              key={`${selectedCity.id}-${selectedCity.aqi}-${JSON.stringify(simpleProfile)}`}
              city={selectedCity}
              preferences={simpleProfile}
            />
          </div>
        )}

        {/* VIEW 4: Indoor Air Quality & Sustainable Swaps */}
        {(activeTab === "lifestyle" || activeTab === "all") && (
          <div className="space-y-6 sm:space-y-8">
            <IndoorAirTips />
            <SustainableSwaps />
          </div>
        )}

        {/* VIEW 5: Methodology, Standards & Citations */}
        {(activeTab === "methodology" || activeTab === "all") && (
          <div className="space-y-6 sm:space-y-8">
            <MethodologySection />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
