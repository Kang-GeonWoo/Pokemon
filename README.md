# Pokémon Showdown Assistant

A comprehensive web application for Pokémon Showdown (Gen 9 Single Battles) featuring Team Building, Battle Assistance, Meta Analysis, and Community sharing.

## Structure
This project is a Monorepo managed with **pnpm workspaces** and **TurboRepo**.

- `apps/web`: Next.js frontend (React, Tailwind CSS)
- `apps/api`: Backend API (Node.js, Express, TypeScript)
- `apps/data-pipeline`: Scripts for fetching/parsing Showdown rules and Smogon stats
- `packages/db`: Prisma ORM and database client
- `packages/shared`: Shared types, Zod schemas, and utilities

## Prerequisites
- Node.js >= 18
- pnpm (install via `npm i -g pnpm`)
- Docker & Docker Compose (for local Postgres)

## Getting Started

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Start Database**
   ```bash
   docker-compose up -d
   ```

3. **Setup Logic Database Schema**
   ```bash
   pnpm db:push
   ```

4. **Run Development Server**
   ```bash
   pnpm dev
   ```
   - Web: http://localhost:3000
   - API: http://localhost:3001

## Data Pipeline
To fetch the latest rules and stats:

```bash
pnpm --filter data-pipeline fetch:rules
pnpm --filter data-pipeline fetch:stats
```

## Features
- **Team Builder**: Import/Export Showdown text, versioning.
- **Battle Assistant**: Manual input + Prediction Engine (Move probability).
- **Meta Stats**: Usage rates, moveset distributions.
- **Community**: Share sets and teams.
