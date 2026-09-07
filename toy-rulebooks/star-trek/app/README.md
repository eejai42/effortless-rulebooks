# Star Trek Explorer App

A simple web app for exploring Star Trek TV series, seasons, and episodes from the Effortless rulebook data.

## Requirements

- Node.js 14+
- PostgreSQL database initialized from `../postgres-bootstrap/reset-rulebook-db.sh`

## Setup

1. Install dependencies:
```bash
npm install
```

2. Ensure the Postgres database is running:
```bash
cd ../postgres-bootstrap
./reset-rulebook-db.sh
```

3. Start the app:
```bash
npm start
```

The app will be available at `http://localhost:3000`.

## API Endpoints

- `GET /api/series` - List all TV series
- `GET /api/series/:serieId` - Get details for a specific series
- `GET /api/series/:serieId/seasons` - Get seasons for a series
- `GET /api/seasons/:seasonId/episodes` - Get episodes for a season
- `GET /api/episodes/:episodeId` - Get details for a specific episode
- `GET /api/people` - List crew members
- `GET /api/health` - Health check

## Environment

The app reads the database connection string from `../postgres-bootstrap/.env`. Make sure this file exists and contains:

```
DATABASE_URL=postgresql://postgres@localhost:5432/erb_star_trek
```

## Features

- Browse all Star Trek series
- View season and episode details
- See series statistics (total seasons, episodes)
- Dark-themed UI with responsive design
