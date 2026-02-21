# Pokemon Showdown Assistant - Project Requirements

## 1. Project Overview
A comprehensive web application for Pokémon competitive play.
- **Components:** Team Builder, Battle Assistant (Move Prediction), Meta Analysis.
- **Tech Stack:**
    - **Frontend:** Next.js (React), Tailwind CSS, Glassmorphism Design.
    - **Backend:** Express (Node.js), TypeScript.
    - **Database:** PostgreSQL (via Docker), Prisma ORM.
    - **Infrastructure:** TurboRepo, Docker.

## 2. Core Features
### Frontend (Web)
- **Localizaton:** Full Korean support for Pokemon, Moves, Abilities, and Items.
- **Design:** Vibrant Dark Mode with Glassmorphism components.
- **Team Builder (New):** Advanced 6-slot editor with EV/IV sliders, ability/item selection, and Showdown text export/import.
- **Battle Assistant:** Move prediction and opponent tracking during matches.
- **Meta Analysis (New):** Current ranked battle usage statistics, top Pokemon rankings, and detailed usage breakdowns (Moves, Teammates, etc.).
- **Rental Teams (New):** A community gallery where users can submit and vote on successful teams, complete with rental codes.
- **Strategy Guides (New):** Editorial/community guides and tier lists for competitive play.

### Backend (API)
- **Move Prediction:** `/api/predict/moves` (Zod validation).
- **Data Pipeline:** Fetching rules, stats, and localization data from Showdown/PokeAPI.
- **Teams & Stats API (New):** Endpoints to serve Meta Analysis data and Rental Teams.

### Database
- **Schema:** Users, Teams, Battles, UsageStats, Localization (PokemonName, MoveName).

## 3. Implementation Status
- **Completed:** Monorepo setup, Docker DB, Basic Frontend UI, API Skeleton.
- **Pending:** DB Sync, Data Pipeline Logic, Frontend-Backend Integration, Auth.
