# Walkthrough: UI/UX Overhaul & Onboarding

## 1. Summary of Changes
- **Battle Assistant UI**:
    - Replaced raw HTML with **Glassmorphism Design System** components.
    - Used `Card`, `Button`, `Input` from `components/ui`.
    - Implemented a responsive **Grid Layout** for opponent slots.
    - Added **Visual Feedback** for predictions (Progress bars, Color coding).
- **Onboarding / User Manual**:
    - Added a collapsible **Instruction Card** at the top of the page.
    - Explained the workflow: "Input -> Predict -> Lock/Ban".
- **Components Created**:
    - `Input`: Glass-styled text input.
    - `InstructionCard`: Info box with steps.
    - `Button` (verified): Includes variants like `ghost`, `secondary`.

## 2. Localization (Korean) update
- **Database**: Added `PokemonName` and `MoveName` tables.
- **Data Pipeline**: Created `fetch-korean-names.ts` to fetch official names from PokeAPI.
- **Frontend**:
    - Default display is now in **Korean**.
    - Input supports **Korean (e.g., '타부자고')** and **English IDs (e.g., 'gholdengo')**.
    - Dual-language support for moves and pokemon names in predictions.

## 3. Verification
- **Visual Check**:
    - Open `http://localhost:3000/battle-assistant`.
    - Check if the title has a gradient effect.
    - Verify that "Slot 1/2/3" inputs are inside glass cards.
    - Verify buttons have hover effects.
- **Functional Check**:
    - Input "타부자고" or "gholdengo" in Slot 1.
    - Click "분석 및 예측 시작".
    - Verify loading state (spinner on buttons).
    - Check if results appear with progress bars and Korean names (e.g., "지진").

## 4. Dev Notes
- API endpoint is set to `http://localhost:3001`. Ensure `apps/api` is running.
- If buttons are unresponsive, check browser console for network errors (CORS or Connection Refused).
