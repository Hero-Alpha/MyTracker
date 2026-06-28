# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-06-28

## User Preferences

- No emojis anywhere — use react-icons (Feather set) instead
- 100% inline styles on all components — Tailwind classes are unreliable in this project
- Dark theme throughout (#030712 bg, #111827 cards, #1f2937 borders)
- Terse responses — no trailing summaries, no narration
- No TypeScript — JavaScript only

## Key Learnings

- **Stack:** Vite + React (JS), Node/Express, MongoDB Atlas, Gemini 2.0 Flash
- **Auth:** JWT in httpOnly cookies; `protect` middleware sets `req.userId`
- **Nutrition math:** Mifflin-St Jeor BMR in `nutrition.service.js`; targets auto-recalculated on `PUT /api/profile` when all required fields present
- **Food logging:** Nutrition snapshot stored at log time so edits to food don't affect history
- **Supplements:** Treated as Food with `category: 'supplement'` — reuses all meal logging logic
- **Inline styles only:** Tailwind classes were not reliably applying; switched to 100% inline styles on every component
- **User model enums:**
  - `goal`: `'lose_weight'` | `'maintain'` | `'gain_muscle'` (NOT 'lose' or 'gain')
  - `activityLevel`: `'sedentary'` | `'light'` | `'moderate'` | `'active'` | `'very_active'` (NOT 'lightly_active' etc.)
  - Always read `User.js` enum values before building any form that submits to `/api/profile`
- **Sidebar nav:** Shared `Sidebar.jsx` component, hamburger on every page header
- **Date handling:** Dates stored as UTC midnight; compare with `.toISOString().substring(0, 10)`

## Do-Not-Repeat

- [2026-06-28] Used wrong goal enum values (`'lose'`, `'gain'`) — User model expects `'lose_weight'`, `'gain_muscle'`. Always check `src/models/User.js` enums before writing frontend forms.
- [2026-06-28] Used wrong activityLevel values (`'lightly_active'`, `'moderately_active'`, `'extremely_active'`) — model uses `'light'`, `'moderate'`, `'active'`, `'very_active'`. Match nutrition.service.js ACTIVITY_MULTIPLIERS keys exactly.
- [2026-06-28] Added 401 redirect in axios interceptor — caused infinite reload when `/api/auth/me` legitimately returned 401 (unauthenticated). Never add 401 redirect to the interceptor; AuthContext handles unauthenticated state.

## Decision Log

- **Supplements as Food category:** Avoids a separate model; reuses search, logging, and nutrition snapshot logic. Food.category = 'supplement'.
- **Nutrition snapshot at log time:** Each meal item stores nutrition values at the moment of logging — historical data is unaffected by later food edits.
- **JWT in httpOnly cookies:** Prevents XSS access to token; `withCredentials: true` on axios.
- **Sidebar over top nav:** User requested hamburger sidebar instead of header tabs for navigation between Dashboard / Analytics / Goals / AI Review.
