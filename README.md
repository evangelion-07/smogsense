# SmogSense · Urban Air Quality Assistant
> **Hack2Skill Challenge 6: Urban Air Quality Assistant**

SmogSense is an accessible, responsive, mobile-first web application designed to help urban residents understand local air pollution levels, protect vulnerable family members, plan daily routines around relative pollution lulls, and adopt meaningful sustainable swaps.

Built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, the **Open-Meteo Air Quality API**, and an optional **Server-Side Google Gemini AI Endpoint**.

---

## 🌟 Key Application Features

1. **Global City Search & Presets**
   - Free worldwide geocoding powered by the **Open-Meteo Geocoding API** (no API keys required). Search any city globally (e.g. *Pune, Chicago, Paris, Singapore*).
   - One-click presets for rapid comparison (*New Delhi, Mumbai, Bengaluru, Kolkata, London, New York, Tokyo*).
   - Full support for both **Live Open-Meteo Atmospheric Forecast Models** and **Curated Offline Sample Datasets**.
   - Sample datasets are illustrative and use CPCB-style category labels; they are not live readings for any listed city.

2. **Air Quality Summary & Forecast Context**
   - Color-coded AQI category and scale indicator.
   - Prominently labeled as **US EPA AQI (Atmospheric Model Forecast)** with a dedicated disclaimer clarifying that it is **not India's official CPCB National Air Quality Index (NAQI)**.
   - Shows the number of available pollutant readings and context for household sensitivities.

3. **6 Criteria Pollutant Breakdown Cards**
   - Detailed cards for PM2.5, PM10, NO₂, SO₂, CO, and O₃.
   - Shows hourly estimates alongside **World Health Organization (WHO) 2021 guideline references**. Since their averaging periods differ, the app does not calculate guideline ratios or imply compliance.
   - Includes general health context for each pollutant.

4. **24-Hour Hourly Forecast Chart**
   - Visual timeline displaying the next 24 forecast hours of PM2.5, PM10, and available US AQI. Curated demo data is sampled less frequently and labeled as demo data.
   - Identifies the relatively lower and higher AQI hours within the available forecast; neither is presented as a guarantee about local exposure.
   - Keyboard accessible bar inspection with hourly advice, data source label, and exact fetch timestamp.

5. **Household Preferences & Profile Form**
   - **Activity Times**: Early Morning (6–8 AM), Mid-Morning (8–11 AM), Afternoon (12–4 PM), Evening (5–8 PM), Night (8–11 PM).
   - **Commute Mode**: Two-Wheeler / Bike, Walking / Pedestrian, Auto / Open Bus, Metro Rail / Train, Private Car / Cab (AC).
   - **Budget Tier**: No added spend, low cost, moderate cost, or a flexible budget, without assuming a currency or local price.
   - **Optional Sensitivities**: Children & Infants, Seniors (65+), Asthma / Cardiac / Respiratory, Allergies / Sinus, Pregnancy, Household Pets.

6. **Deterministic Recommendation Rules Engine**
   - Computes tailored recommendations across 3 categories:
     - **Lower-Pollution Time Windows**: Analyzes hourly curve to recommend relative minimum pollution windows.
     - **Indoor Actions**: Calibrated directly to budget tier and sensitivity profiles.
     - **Sustainable Alternatives**: Mode-specific transit swaps and domestic emission reductions.
   - Every recommendation strictly includes: **Action**, **Timing**, **Cost**, and **Short Reason**.
   - **Scientific Phrasing Guardrail**: **Never labels any time as completely safe**; explicitly states when forecasted concentrations are *relatively lower compared to other available daytime hours*.

7. **Server-Side Gemini AI Explanation Endpoint**
   - Next.js API endpoint at `/api/explain-recommendations` using Google Gemini (`gemini-3.8-flash` by default; configurable with `GEMINI_MODEL`) and shared Upstash rate limiting.
   - Explains server-generated rule-based advice from validated air-quality data and user preferences.
   - Returns validated structured JSON: `summary`, `outdoorRoutine`, `indoorTips`, `sustainableSwaps`, and `caveats`.
   - **Guardrails**: The endpoint separates its instructions from JSON input, validates the response structure, and rejects common safety-certainty claims. Generated text can still be imperfect, so treat it as optional educational context.
   - **Resilient Fallback**: If Gemini fails, times out, or the API key is missing, the AI card explains the failure while rule-based recommendations remain available.

8. **Methodology & Data Attribution Section**
   - Explains model estimates versus regulatory ground sensor measurements (e.g. CPCB CAAQMS).
   - Lists WHO 2021 guideline and CPCB standard values with their averaging periods.
   - Educational liability disclaimer.

---

## 🏗️ Architecture & Component Structure

```
smogsense/
├── app/
│   ├── api/
│   │   └── explain-recommendations/
│   │       └── route.ts          # Gemini endpoint with payload validation and shared rate limiting
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
│   ├── SustainableSwaps.tsx      # Urban swaps and a commute-distance scenario
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

Configure a **Google Gemini API key**. Local development uses a small in-process request limit; production also needs an **Upstash Redis REST database** for shared request limits:

```env
# .env.local
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token_here
```

### 🔑 Missing-Key Behavior
- If `GEMINI_API_KEY` is omitted, missing, or left as the placeholder, the endpoint reports that AI text is unavailable.
- Local development uses a per-process fallback limiter when Upstash credentials are omitted. Production fails closed if the shared limiter is missing or unavailable.
- For production, configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for shared rate limiting. Defaults allow 5 requests per client IP per 10 minutes and 100 requests total per UTC day; both limits can be changed with the variables in `.env.example`.
- Rule-based recommendations remain available without Gemini and are calculated locally from the forecast and preferences.
- When a user requests an AI explanation, the app sends the forecast and selected household preferences, including optional sensitivities, to Google Gemini. The AI explanation is optional; avoid selecting preferences you do not want processed by that service.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v20.9.0 or higher (required by the installed Next.js version)
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

- **Accessibility focus**: High-contrast light-theme colors, visible focus states, semantic controls, and responsive layouts.
- **Full Keyboard Operability**: Visible focus rings (`focus-visible:ring-2 focus-visible:ring-emerald-400`) on all interactive buttons, search inputs, tabs, checkboxes, and forecast bars.
- **Semantic HTML & ARIA**:
  - `role="combobox"`, `role="listbox"`, and `role="option"` on city search.
  - `<fieldset>` and `<legend>` on household preference groups.
  - `role="checkbox"` and `aria-checked` on daily action checklist items.
  - `role="progressbar"` with `aria-valuenow` on progress meters.
  - Native landmarks (`<header>`, `<main>`, `<section>`, `<nav>`, `<footer>`).
- **Responsive Layout**: Designed mobile-first for narrow phones, tablets, and wide monitors.

---

## 📖 Methodology & Attribution

- **Open-Meteo Air Quality API**: Modeled air-quality forecasts based on CAMS European or CAMS Global data, depending on location. Available under ODbL.
- **World Health Organization (WHO)**: 2021 Global Air Quality Guidelines for PM2.5, PM10, NO₂, SO₂, CO, and O₃.
- **Central Pollution Control Board (CPCB)**: Ministry of Environment, Forest and Climate Change, Government of India.
- **Google Gemini API**: Optional server-side explanation endpoint. The model can make mistakes; rule-based advice remains available when the service is unavailable.
