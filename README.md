# Insight Analytics Dashboard

A full-stack data visualization dashboard built for the Blackcoffer Data Visualization Dashboard test assignment. It reads insight records (intensity, likelihood, relevance, topic, sector, region, country, etc.) from MongoDB through a REST API and renders them as an interactive, filterable analytics dashboard.


<p align="center">
  <a href="https://blackcoffer-insight-dashboard.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/Live-Demo-success?style=for-the-badge" alt="Live Demo">
  </a>
</p>

## Overview

The dataset (`jsondata.json`, 1000 records) is a set of research insights — short predictions/observations (e.g. about energy, economic growth, policy) each scored on intensity, likelihood, and relevance, and tagged with topic, sector, region, country, PESTLE category, and source. This app seeds that data into MongoDB, serves it through an Express API with server-side filtering and aggregation, and visualizes it in a React dashboard.

## Features

- 8 interactive charts (trend, volume, scatter, and 5 categorical breakdowns) driven entirely by server-side MongoDB aggregation
- KPI cards (total insights, avg intensity/likelihood/relevance) that update with every filter change
- Multi-select filters for Country, Region, Topic, Sector, PESTLE, Source, and End Year — all combinable
- City and SWOT filters shown, disabled, with a tooltip explaining why (see "Known data limitations" below)
- Paginated, sortable insights table with a detail modal linking to the original source
- Loading, empty, and error states throughout — no filter or chart silently does nothing
- Responsive layout, dark analytics-console visual theme

## Tech stack

**Frontend:** React 18, Vite, Tailwind CSS, Recharts, Axios
**Backend:** Node.js, Express, Mongoose
**Database:** MongoDB (Atlas for deployment)
**Deployment target:** Vercel (frontend) + Render/Railway (backend) + MongoDB Atlas

## Architecture

```
jsondata.json  →  MongoDB Atlas (blackcoffer_dashboard.insights)
                        ↓
               Node.js + Express REST API
             (server-side filtering + aggregation)
                        ↓
                React + Vite dashboard
```

Filtering and chart aggregation both happen in MongoDB via the API — the frontend never downloads the raw collection and reduces it in the browser. This keeps the KPI numbers, charts, and table always in sync with each other and with whatever filters are active.

## Dataset

`data/jsondata.json` — 1000 records, 17 fields, single consistent schema, no duplicate records. Key characteristics (see full breakdown further down):

| Field | % populated | Notes |
|---|---|---|
| source | 99.9% | 403 unique sources |
| relevance | 99.9% | range 1–7 |
| intensity | 96.2% | range 1–96, not a clean 1–10 scale |
| likelihood | 96.2% | range 1–4 |
| topic | 90.7% | 97 unique topics |
| pestle | 90.7% | 9 unique categories |
| sector | 77.1% | 18 unique sectors |
| region | 54.7% | 23 unique regions |
| country | 35.0% | 56 unique countries |
| start_year | 31.0% | range 2016–2050 |
| end_year | 25.8% | range 2016–2200 |
| impact | 3.4% | too sparse to chart; shown only in the detail modal |
| added / published | ~100% / 92.6% | full date-time strings, used for the volume-over-time chart |

### Known data limitations

- **City**: the source dataset has no `city` field anywhere. The City filter is shown in the UI, disabled, with a tooltip explaining this — it is not implemented as a working filter because there is no data to filter on, and no city value is fabricated.
- **SWOT**: the source dataset has no SWOT field or classification. Same treatment as City — shown disabled with an explanatory tooltip rather than invented.
- **Impact**: only 34 of 1000 records have a non-empty `impact` value (all either 2, 3, or 4). It's surfaced in the insight detail modal when present but is not used for any chart or KPI, since a chart built on 3.4% coverage would misrepresent the dataset.
- **Missing-value handling**: for topic/sector/region/pestle, missing values are grouped into an explicit "Not Specified" bucket in the relevant chart rather than hidden — several of these fields are missing in 20–65% of records, so hiding them would be more misleading than showing them. The one exception is the Top Countries chart, where records with no country are excluded outright (a ranking of "top countries" with a 65%-share "Unknown" bar isn't a meaningful ranking) — the excluded count is never silently dropped from the total record count elsewhere.
- **Year fields**: `start_year` and `end_year` are both sparse and only overlap in 118 records. The "Intensity by year" trend chart uses `start_year` (the more semantically relevant field for "what year does this insight concern"), which means it only reflects ~31% of records — this is disclosed in the chart's caption. The "Insights volume over time" chart uses the `added` timestamp instead (>99% populated) specifically so there's at least one temporal view of the full dataset.

## Project structure

```
project-root/
├── client/          React + Vite dashboard
├── server/          Express API + Mongoose models
├── data/            jsondata.json (source data, read only by the seed script)
├── README.md
└── .gitignore
```

## Installation

Prerequisites: Node.js 18+, npm, a MongoDB Atlas account (free tier is enough), Git.

```bash
git clone <your-repo-url>
cd project-root

cd server
npm install

cd ../client
npm install
```

## Database setup (MongoDB Atlas)

1. Create a free account/cluster at https://www.mongodb.com/cloud/atlas.
2. In **Database Access**, create a database user with a username/password.
3. In **Network Access**, add your current IP (or `0.0.0.0/0` for development only).
4. In **Database → Connect → Drivers**, copy the connection string. It looks like:
   `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority`
5. Append a database name to it: `.../blackcoffer_dashboard?retryWrites=true&w=majority`

## Environment variables

**server/.env** (copy from `server/.env.example`):
```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/blackcoffer_dashboard?retryWrites=true&w=majority
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

**client/.env** (copy from `client/.env.example`):
```
VITE_API_URL=http://localhost:5000/api
```

Never put the MongoDB URI or any secret in the client `.env` — only the backend talks to the database.

## Seed the database

```bash
cd server
npm run seed
```

This reads `data/jsondata.json`, converts empty strings to `null`, casts numeric fields, parses date strings, and inserts all 1000 records into the `insights` collection. It's safe to re-run — it clears the collection first, so you never end up with duplicate imports.

Expected output: `Seed complete: inserted 1000 of 1000 records.`

## Running locally

```bash
# Terminal 1 - backend
cd server
npm run dev
# API listening on http://localhost:5000

# Terminal 2 - frontend
cd client
npm run dev
# Dashboard on http://localhost:5173
```

## API documentation

Base URL: `http://localhost:5000/api`

| Endpoint | Description |
|---|---|
| `GET /insights` | Paginated, filtered list of records. Query params: `country, region, topic, sector, pestle, source` (comma-separated for multi-select), `start_year, end_year` (comma-separated years or `unspecified`), `page, limit, sortBy, sortDir` |
| `GET /insights/filters` | Distinct values for every filterable field, computed live from the collection. Also reports `city` and `swot` as `{ available: false, reason }`. |
| `GET /insights/kpis` | Filter-aware totals and averages (nulls excluded from averages) |
| `GET /insights/aggregate?groupBy=topic&metric=count` | Generic aggregation for bar/donut charts. `groupBy` ∈ `topic, sector, region, country, pestle, start_year`. `metric` ∈ `count, avgIntensity, avgLikelihood, avgRelevance` |
| `GET /insights/timeseries?basis=start_year` | Time series data. `basis` ∈ `start_year, added` |
| `GET /insights/scatter` | Raw likelihood/relevance/intensity points, capped at 1000 |
| `GET /health` | Health check |

Example:
```
GET /api/insights?country=India&sector=Energy&page=1&limit=25
GET /api/insights/aggregate?groupBy=topic&metric=count&region=Northern%20America
```

### Example Postman requests

- `GET http://localhost:5000/api/health` → `{ "status": "ok", ... }`
- `GET http://localhost:5000/api/insights/filters` → distinct filter values
- `GET http://localhost:5000/api/insights/kpis` → `{ "total": 1000, "avgIntensity": 10.24, "avgLikelihood": 3.17, "avgRelevance": 2.73, ... }` (these exact numbers are the expected values for the full, unseeded dataset — useful to sanity-check your seed worked correctly)
- `GET http://localhost:5000/api/insights?sector=Energy&country=United%20States%20of%20America`

## Testing checklist

- [ ] `npm run seed` reports 1000 of 1000 inserted
- [ ] `GET /api/health` returns `status: ok`
- [ ] `GET /api/insights/kpis` returns `total: 1000`, `avgIntensity ≈ 10.24`, `avgLikelihood ≈ 3.17`, `avgRelevance ≈ 2.73`
- [ ] `GET /api/insights/filters` returns non-empty arrays for country/region/topic/sector/pestle/source, and `city`/`swot` as `{ available: false }`
- [ ] Single filter (e.g. `?sector=Energy`) changes KPI totals, all charts, and the table
- [ ] Multiple combined filters (`?sector=Energy&country=India&pestle=Economic`) narrow results further, consistently across KPIs/charts/table
- [ ] A filter combination with no matches shows the empty state, not a blank screen or a crash
- [ ] Pagination (`Next`/`Previous`) works and resets to page 1 when filters change
- [ ] Clicking a table row opens the modal with full record detail and a working source link
- [ ] Killing the backend and reloading the frontend shows the error state, not a silent failure
- [ ] Dashboard is usable on a mobile-width viewport

## Screenshots

_Add screenshots here before sharing this README — e.g. the full dashboard, the filter bar with an active multi-select open, and the insight detail modal._

```
![Dashboard overview](./docs/screenshot-overview.png)
![Filters in use](./docs/screenshot-filters.png)
![Insight detail modal](./docs/screenshot-modal.png)
```

## Deployment

**MongoDB:** already on Atlas from the setup step above — no separate deployment step, just make sure Network Access allows connections from your backend host (or `0.0.0.0/0`).

**Backend (Render example):**
1. Push this repo to GitHub.
2. On Render: New → Web Service → connect the repo, root directory `server`.
3. Build command: `npm install`. Start command: `npm start`.
4. Add environment variables: `MONGODB_URI`, `PORT` (Render sets this automatically, but Express reads `process.env.PORT` either way), `CLIENT_ORIGIN` = your deployed Vercel URL.
5. Deploy, then note the public API URL (e.g. `https://your-api.onrender.com`).

**Frontend (Vercel):**
1. On Vercel: New Project → import the repo, root directory `client`.
2. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
3. Add environment variable: `VITE_API_URL=https://your-api.onrender.com/api`.
4. Deploy.

**CORS:** the backend's `CLIENT_ORIGIN` env var must exactly match your deployed frontend URL, or the browser will block API calls.

**Common issues:**
- 500 errors right after deploy → usually `MONGODB_URI` missing/wrong, or Atlas Network Access hasn't been updated to allow the new host.
- CORS errors in the browser console → `CLIENT_ORIGIN` on the backend doesn't match the frontend's actual deployed URL.
- Charts show "No records match the current filters" everywhere → seed script hasn't been run against the Atlas cluster the deployed backend is pointed at (seeding is a local action against whatever `MONGODB_URI` you run it with).

## Future improvements

- Server-side full-text search on `title`/`insight` for the table
- CSV export of the currently filtered result set
- Saved filter presets
- Swap Recharts for D3.js on the scatter chart specifically, for finer control over bubble collision/legend behavior

## Final assignment requirement checklist

| Assignment requirement | Implemented? | Where |
|---|---|---|
| Use the given JSON data, no fabrication | ✅ | `server/seed/seed.js`, all controllers |
| MongoDB database from the JSON | ✅ | `server/models/Insight.js`, `server/seed/seed.js` |
| API to get data from MongoDB | ✅ | `server/routes/insightRoutes.js`, `server/controllers/insightController.js` |
| Dashboard reads from MongoDB via API | ✅ | `client/src/api/insights.js` (no hardcoded data in frontend) |
| Intensity visualized | ✅ | Intensity-by-year chart, scatter bubble size, table, modal |
| Likelihood visualized | ✅ | Scatter chart, table, modal |
| Relevance visualized | ✅ | Scatter chart, KPI card, table, modal |
| Year visualized | ✅ | Intensity-by-year (start_year), volume-over-time (added) |
| Country visualized | ✅ | Top Countries chart, table, modal |
| Topic visualized | ✅ | Insights-by-topic chart, table, modal |
| Region visualized | ✅ | Insights-by-region chart, table, modal |
| City visualized | ⚠️ | Not possible — no `city` field in source data. Documented, not fabricated. |
| End Year filter | ✅ | FilterBar, incl. "Not specified" bucket |
| Topic filter | ✅ | FilterBar |
| Sector filter | ✅ | FilterBar |
| Region filter | ✅ | FilterBar |
| PESTLE filter | ✅ | FilterBar |
| Source filter | ✅ | FilterBar |
| SWOT filter | ⚠️ | Not possible — no SWOT field in source data. Shown disabled with explanation, not fabricated. |
| Country filter | ✅ | FilterBar |
| City filter | ⚠️ | Shown disabled with explanation — see above |
| Interactive charts | ✅ | Recharts, tooltips, legends, responsive |
| Creative additional visualization | ✅ | Volume-over-time chart using `added` date, chosen specifically to cover the ~70% of records missing start/end year |
