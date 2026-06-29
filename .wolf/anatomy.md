# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-06-29T04:50:36.004Z
> Files: 71 tracked | Anatomy hits: 0 | Misses: 0

## ./

- `CLAUDE.md` — OpenWolf (~57 tok)

## .claude/

- `settings.json` (~441 tok)

## .claude/rules/

- `openwolf.md` (~313 tok)

## MyTracker/

- `.gitignore` — Git ignore rules (~8 tok)

## MyTracker/client/

- `.gitignore` — Git ignore rules (~68 tok)
- `.oxlintrc.json` (~66 tok)
- `index.html` — MyTracker (~207 tok)
- `package-lock.json` — npm lock file (~20654 tok)
- `package.json` — Node.js package manifest (~188 tok)
- `README.md` — Project documentation (~253 tok)
- `vite.config.js` (~347 tok)

## MyTracker/client/public/

- `favicon.svg` (~88 tok)

## MyTracker/client/src/

- `App.css` — Styles: 8 rules, 6 media queries (~826 tok)
- `App.jsx` — ProtectedRoute (~544 tok)
- `index.css` — Styles: 1 rules (~88 tok)
- `main.jsx` (~66 tok)

## MyTracker/client/src/context/

- `AuthContext.jsx` — AuthContext (~342 tok)

## MyTracker/client/src/features/analytics/

- `Analytics.jsx` — C (~3364 tok)

## MyTracker/client/src/features/auth/

- `Login.jsx` — C — renders form (~1411 tok)
- `Register.jsx` — C — renders form (~1474 tok)

## MyTracker/client/src/features/dashboard/

- `Dashboard.jsx` — C (~7849 tok)

## MyTracker/client/src/features/goals/

- `GoalsPage.jsx` — C (~3120 tok)

## MyTracker/client/src/features/nutrition/

- `LogFoodModal.jsx` — C (~2579 tok)
- `SupplementModal.jsx` — C (~3896 tok)

## MyTracker/client/src/features/profile/

- `ProfileSetup.jsx` — STEPS (~1989 tok)

## MyTracker/client/src/features/review/

- `AIReviewPage.jsx` — C (~3310 tok)

## MyTracker/client/src/features/workout/

- `LogWorkoutModal.jsx` — C (~3658 tok)
- `MeasurementsModal.jsx` — C (~1419 tok)
- `WeightModal.jsx` — C (~793 tok)

## MyTracker/client/src/shared/components/

- `Button.jsx` — VARIANTS (~196 tok)
- `Card.jsx` — Card (~58 tok)
- `Input.jsx` — Input (~183 tok)
- `MiniCalendar.jsx` — C (~1293 tok)
- `Sidebar.jsx` — C (~880 tok)

## MyTracker/client/src/shared/hooks/

- `useIsMobile.js` — Declares useIsMobile (~123 tok)

## MyTracker/client/src/shared/services/

- `api.js` — Declares api (~67 tok)

## MyTracker/server/

- `.gitignore` — Git ignore rules (~6 tok)
- `package.json` — Node.js package manifest (~124 tok)

## MyTracker/server/src/

- `db.js` — Declares mongoose (~88 tok)
- `index.js` — API routes: GET (1 endpoints) (~510 tok)

## MyTracker/server/src/controllers/

- `analytics.controller.js` — DailyLog: getAnalytics (~625 tok)
- `auth.controller.js` — bcrypt: signToken, register, login, logout, me (~622 tok)
- `foods.controller.js` — Food: search, createFood, getUserFoods (~419 tok)
- `logs.controller.js` — DailyLog: normalizeDate, getLog, addMealItem + 4 more (~1239 tok)
- `measurements.controller.js` — BodyMeasurement: getMeasurements, getLatest, addMeasurement (~355 tok)
- `profile.controller.js` — User: getProfile, updateProfile (~495 tok)
- `review.controller.js` — DailyLog: getLatestReview, generateReview (~1109 tok)
- `supplements.controller.js` — Food: parseLabel, saveSupplement, getUserSupplements (~500 tok)
- `workouts.controller.js` — WorkoutTemplate: getTemplates, createTemplate, updateTemplate, deleteTemplate (~385 tok)

## MyTracker/server/src/middleware/

- `auth.js` — Declares jwt (~120 tok)
- `rateLimiter.js` — Declares rateLimit (~233 tok)

## MyTracker/server/src/models/

- `AIReview.js` — Declares mongoose (~187 tok)
- `BodyMeasurement.js` — Declares mongoose (~200 tok)
- `DailyLog.js` — Declares mongoose (~582 tok)
- `Food.js` — Declares mongoose (~382 tok)
- `User.js` — Declares mongoose (~348 tok)
- `WeightLog.js` — Declares mongoose (~124 tok)
- `WorkoutSession.js` — Declares mongoose (~205 tok)
- `WorkoutTemplate.js` — Declares mongoose (~198 tok)

## MyTracker/server/src/routes/

- `analytics.js` — API routes: GET (1 endpoints) (~68 tok)
- `auth.js` — API routes: POST, GET (4 endpoints) (~110 tok)
- `foods.js` — API routes: GET, POST (3 endpoints) (~130 tok)
- `logs.js` — API routes: GET, POST, DELETE (6 endpoints) (~194 tok)
- `measurements.js` — API routes: GET, POST (3 endpoints) (~114 tok)
- `profile.js` — API routes: GET, PUT (2 endpoints) (~90 tok)
- `review.js` — API routes: GET, POST (2 endpoints) (~112 tok)
- `supplements.js` — API routes: POST, GET (3 endpoints) (~234 tok)
- `workouts.js` — API routes: GET, POST, PUT, DELETE (4 endpoints) (~132 tok)

## MyTracker/server/src/seeds/

- `foods.seed.js` — Declares mongoose (~6308 tok)

## MyTracker/server/src/services/

- `gemini.service.js` — genAI: extractJSON, parseSupplementLabel, generateWeeklyReview (~937 tok)
- `nutrition.service.js` — ACTIVITY_MULTIPLIERS: calculateBMR, calculateDailyTargets, computeMealTotals, computeDayTotals, computeItemNutrition (~641 tok)
