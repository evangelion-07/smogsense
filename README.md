# SmogSense · Urban Air Quality Assistant
> **Hack2Skill Challenge 6: Urban Air Quality Assistant**

SmogSense is an accessible, responsive, mobile-first web application designed to help urban residents understand local air pollution levels, protect vulnerable family members, plan daily routines around relative pollution lulls, and adopt meaningful sustainable swaps.

Built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, the **Open-Meteo Air Quality API**, and a grounded **Server-Side Google Gemini AI Endpoint**.

---

## 🌟 Key Application Features

1. **Global City Search & Presets**
   - Free worldwide geocoding powered by the **Open-Meteo Geocoding API** (no API keys required). Search any city globally (e.g. *Pune, Chicago, Paris, Singapore*).
   - One-click presets for rapid comparison (*New Delhi, Mumbai, Bengaluru, Kolkata, London, New York, Tokyo*).
   - Full support for both **Live Open-Meteo Atmospheric Forecast Models** and **Curated Offline Sample Datasets**.

2. **Air Quality Summary & Health Risk Gauges**
   - Color-coded AQI dials and progress bars.
   - Prominently labeled as **US EPA AQI (Atmospheric Model Forecast)** with a dedicated disclaimer clarifying that it is **not India's official CPCB National Air Quality Index (NAQI)**.
   - Highlights dominant criteria pollutants (PM2.5, PM10, NO₂, SO₂, CO, O₃) and targeted advisories for vulnerable demographics.

3. **6 Criteria Pollutant Breakdown Cards**
   - Detailed cards for PM2.5, PM10, NO₂, SO₂, CO, and O₃.
   - Benchmark ratios evaluated directly against **World Health Organization (WHO) 2021 guidelines**.
   - Specific descriptions of physiological health vectors and urban source origins.

4. **24-Hour Hourly Forecast Chart**
   - Visual timeline displaying predicted hourly PM2.5, PM10, and available US AQI.
   - Clear identification of the **Safest Relative Window** vs. the **Worst Smog Peak Window**.
   - Keyboard accessible bar inspection with hourly advice, data source label, and exact fetch timestamp.

5. **Household Preferences & Profile Form**
   - **Activity Times**: Early Morning (6–8 AM), Mid-Morning (8–11 AM), Afternoon (12–4 PM), Evening (5–8 PM), Night (8–11 PM).
   - **Commute Mode**: Two-Wheeler / Bike, Walking / Pedestrian, Auto / Open Bus, Metro Rail / Train, Private Car / Cab (AC).
   - **Budget Tier**: Zero / Free (₹0), Low Cost (<₹500 / $10), Moderate (₹500–₹2,500 / $10–$30), Flexible (₹2,500+ / $30+).
   - **Optional Sensitivities**: Children & Infants, Seniors (65+), Asthma / Cardiac / Respiratory, Allergies / Sinus, Pregnancy, Household Pets.

6. **Deterministic Recommendation Rules Engine**
   - Computes tailored recommendations across 3 categories:
     - **Lower-Pollution Time Windows**: Analyzes hourly curve to recommend relative minimum pollution windows.
     - **Indoor Actions**: Calibrated directly to budget tier and sensitivity profiles.
     - **Sustainable Alternatives**: Mode-specific transit swaps and domestic emission reductions.
   - Every recommendation strictly includes: **Action**, **Timing**, **Cost**, and **Short Reason**.
   - **Scientific Phrasing Guardrail**: **Never labels any time as completely safe**; explicitly states when forecasted concentrations are *relatively lower compared to other available daytime hours*.

7. **Server-Side Gemini AI Explanation Endpoint**
   - Next.js dynamic API endpoint at `/api/explain-recommendations` using Google Gemini (`gemini-2.5-flash`).
   - Personalizes and explains the rule-based advice using **only** the provided air-quality data and user preferences.
   - Returns validated structured JSON: `summary`, `outdoorRoutine`, `indoorTips`, `sustainableSwaps`, and `caveats`.
   - **Strict Guardrails**: The model does not invent AQI readings, does not claim to calculate official AQI, and does not invent precise health or emissions statistics.
   - **Resilient Fallback**: If Gemini fails, times out, or the API key is missing, the app automatically falls back to verified deterministic rule recommendations.

8. **Methodology & Data Attribution Section**
   - Deep dive comparing numerical atmospheric models vs. physical regulatory ground sensors (e.g. CPCB CAAQMS).
   - Table of comparative standards (WHO 2021 vs. India CPCB vs. US EPA).
   - Educational liability disclaimer.

---

## 🏗️ Architecture & Component Structure

```
smogsense/
├── app/
│   ├── api/
│   │   └── explain-recommendations/
│   │       └── route.ts          # Server-side Gemini AI endpoint with runtime validation
│   ├── layout.tsx                # HTML shell, metadata, sans-serif font stack
│   ├── page.tsx                  # Main dashboard coordinator & state management
│   └── globals.css               # Tailwind CSS v4 setup
├── components/
│   ├── Navbar.tsx                # Sticky navigation with jump anchors & a11y focus rings
│   ├── CitySelector.tsx          # City search combobox, presets, and source switcher
│   ├── AirQualitySummary.tsx     # AQI meter, category badge, and model disclaimer
│   ├── PollutantCards.tsx        # 6 criteria pollutant cards with WHO benchmark ratios
│   ├── HourlyForecastChart.tsx   # 24h interactive timeline chart with keyboard access
│   ├── HouseholdPreferencesForm.tsx # Accessible fieldsets for activity, commute, budget, sensitivities
│   ├── TailoredRecommendations.tsx  # Deterministic cards & Gemini AI advisor integration
│   ├── GeminiAdvisorCard.tsx     # Validated structured AI explanation display with error fallback
│   ├── DailyActionPlan.tsx       # Time-blocked interactive checklist with progress bar
│   ├── IndoorAirTips.tsx         # Category-filtered bio-defense and ventilation tips
│   ├── SustainableSwaps.tsx      # Urban swaps with interactive monthly emissions calculator
│   ├── MethodologySection.tsx    # Scientific methodology, standards table & citations
│   ├── Footer.tsx                # Attributions, data disclosures & navigation
│   └── Icons.tsx                 # Zero-dependency, lightweight SVG icons
├── lib/
│   ├── types.ts                  # Domain models & TypeScript interfaces
│   └── sampleData.ts             # Curated sample datasets for resilient offline demos
├── services/
│   ├── airQualityService.ts      # Open-Meteo Air Quality & Geocoding API client
│   └── recommendationEngine.ts   # Deterministic recommendation rule generator
├── .env.example                  # Environment variable template
├── .env.local                    # Local environment secrets (GEMINI_API_KEY)
└── package.json                  # Next.js 16, React 19, Tailwind CSS 4
```

---

## ⚙️ Environment Variables Setup

Create a `.env.local` file in the `smogsense/` directory (you can copy `.env.example`):

```bash
cp .env.example .env.local
```

Configure your **Google Gemini API Key**:

```env
# .env.local
GEMINI_API_KEY=your_gemini_api_key_here
```

### 🔑 Missing-Key Behavior
- If `GEMINI_API_KEY` is omitted, missing, or left as the placeholder, the server-side endpoint detects this immediately and returns a clean fallback payload.
- The UI gracefully notifies the user that the Gemini key is not configured and **displays the full set of verified deterministic rule-based recommendations**, ensuring the application remains completely functional without crashing.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.18.0 or higher
- **npm** or **pnpm**

### 2. Installation
Navigate into the `smogsense` directory and install dependencies:

```powershell
cd "c:\Users\sathe\OneDrive\Desktop\Projects\Virtual Prompt Wars\smogsense"
npm install
```

### 3. Start Development Server
```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```powershell
npm run build
npm run start
```

---

## ♿ Accessibility & Mobile Optimization

- **WCAG AA Compliance**: High-contrast, crisp light-theme design (`text-slate-900`, `text-slate-800`, `text-slate-600` on `bg-white` and `bg-slate-50`).
- **Full Keyboard Operability**: Visible focus rings (`focus-visible:ring-2 focus-visible:ring-emerald-400`) on all interactive buttons, search inputs, tabs, checkboxes, and forecast bars.
- **Semantic HTML & ARIA**:
  - `role="combobox"`, `role="listbox"`, and `role="option"` on city search.
  - `<fieldset>` and `<legend>` on household preference groups.
  - `role="checkbox"` and `aria-checked` on daily action checklist items.
  - `role="progressbar"` with `aria-valuenow` on progress meters.
  - Native landmarks (`<header>`, `<main>`, `<section>`, `<nav>`, `<footer>`).
- **Responsive Layout**: Designed mobile-first. Tested across narrow mobile viewports (320px–375px), tablets (768px), and wide monitors (1280px+).

---

## 📖 Methodology & Attribution

- **Open-Meteo Air Quality API**: Free open-access atmospheric forecast data derived from Copernicus Atmosphere Monitoring Service (CAMS) and NOAA Global Forecast System (GFS). Available under ODbL.
- **World Health Organization (WHO)**: 2021 Global Air Quality Guidelines for PM2.5, PM10, NO₂, SO₂, CO, and O₃.
- **Central Pollution Control Board (CPCB)**: Ministry of Environment, Forest and Climate Change, Government of India.
- **Google DeepMind Gemini**: Gemini 2.5 Flash model used via server-side endpoint for explanatory personalizations with strict zero-hallucination grounding guardrails.
