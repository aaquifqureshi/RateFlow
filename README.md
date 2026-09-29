# 💱 RateFlow

RateFlow is a React + TypeScript currency conversion and rate-tracking web application built with Vite.

It combines currency conversion with live comparison, recent exchange-rate movement, and historical exchange-rate charts.

## Features

### Currency Converter
- Convert between supported currencies
- Edit either side of the conversion
- Automatic recalculation
- Currency swap control
- Currency names and flags

### Historical Rate Chart
- 7-day, 15-day, and 30-day views
- Line-chart visualization with Recharts
- Historical data from available trading days
- Dynamic Y-axis range and tick generation
- Handling for insufficient historical data

### Live Compare
- Uses the selected base currency and amount
- Compares against a configurable set of common currencies
- Calculates converted values
- Lets the user select a target currency directly

### Recent Rate Difference
- Current rate
- Previous available rate
- Absolute change
- Percentage change
- Up/down indicator

## External APIs

### ExchangeRate-API
Used for latest exchange rates and live conversion data.

Set the API key with:

```env
VITE_EXCHANGE_API_KEY=your_api_key
```

### Frankfurter API
Used for historical exchange-rate data and recent rate comparisons.

## Architecture

```text
RateFlow/
├── src/
│   ├── components/
│   ├── features/
│   │   ├── converter/
│   │   ├── graph/
│   │   ├── header/
│   │   └── live rates/
│   ├── assets/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
│   └── icons/
├── package.json
└── vite.config.ts
```

High-level data flow:

```text
ExchangeRate-API
       ↓
   App.tsx
       ├── Converter
       ├── Live Compare
       └── Historical Chart
                  ↓
            Frankfurter API
```

## Tech Stack
- React 19
- TypeScript
- Vite 7
- Tailwind CSS 4
- Recharts
- Headless UI
- Heroicons

## Engineering Details

The main application owns the selected currencies, amount, currency list, and latest rates and passes those values into the converter, graph, and live-rate features.

The converter supports bidirectional editing: changing the base amount recalculates the target amount, and changing the target amount recalculates the base amount.

Historical data is requested over a wider date range to account for weekends and holidays, then reduced to the requested number of available trading days.

The asynchronous hooks use cancellation behavior to avoid applying stale responses after a request is no longer relevant.

## Running Locally

```bash
git clone https://github.com/aaquifqureshi/RateFlow.git
cd RateFlow
npm install
```

Create a root `.env` file:

```env
VITE_EXCHANGE_API_KEY=your_exchange_rate_api_key
```

Run the app:

```bash
npm run dev
```

Build:

```bash
npm run build
npm run preview
```

Lint:

```bash
npm run lint
```

## Current Limitations
- Depends on external exchange-rate APIs
- Historical coverage is not available for every currency pair
- Frontend-only; no backend or database
- No saved user history or accounts
- The current client contains a fallback API key and should use environment configuration instead
- Exchange rates are informational and can differ from transaction/settlement rates

## Possible Next Improvements
- Remove the hardcoded API-key fallback
- Add request caching
- Add refresh timestamps
- Add favorite currency pairs
- Add saved conversion history
- Add stronger rate-limit and API error handling
- Add automated tests for conversion and chart utilities

## Project Context

RateFlow was built as a frontend TypeScript project to practice external API integration, shared React state, conversion logic, asynchronous data fetching, and visualization of time-series currency data.