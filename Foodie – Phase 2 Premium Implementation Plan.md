# Foodie – Phase 2: Premium Redesign & Feature Plan

October 4, 2026 · Built from your current codebase (Expo 57, Expo Router, TypeScript, AsyncStorage) and the yoga-app reference image

## 1. Where the app stands today

I read through the project before planning. The things that matter for this phase:

- **Light, flat, hardcoded styling.** Colors such as `#FF6B35`, `#F9FAFB` and `#1F2937` are written directly inside every screen and component. There is no theme file, so a redesign today means editing about 3,800 lines by hand. This is the first thing to fix.
- **`app.json` is locked to light mode** (`userInterfaceStyle: "light"`) and the root layout uses a dark status bar. The reference design is dark-first, so both need to change.
- **`expo-glass-effect` is already installed but unused.** `expo-image`, `react-native-reanimated` 4 and `gesture-handler` are also installed and unused. The recipe cards use React Native's basic `Image`.
- **The bottom nav pushes a new screen on every tap** (`router.push`), so tapping Home, Favorites, Home, Favorites builds up a stack instead of switching tabs. It also means every tab remounts. A real tab layout fixes this and is needed for the floating glass bar.
- **Two navigation systems coexist**: Expo Router, plus a custom `AppNavigationProvider` in `App.tsx` for Expo Snack. This works, but it limits what you can do with transitions. See the decision in section 7.
- **Ingredients are plain strings** (`string[]`). Features like "scale servings" and "shopping list" need structured quantities, so there is a small data migration inside Module 5.
- The seed data is 16 recipes. For a premium feel, photography matters as much as UI, so the images are part of this plan too.

## 2. Design direction: translating the reference to food

The reference gets its premium feel from five repeatable ideas. Here is how each maps to Foodie:

- **Gradient atmosphere instead of a flat white page.** The home screen fades from soft sage-mint at the top into near-black green at the bottom. Foodie's home does the same, with the hero dish sitting on the mint area.
- **Frosted glass for every control.** Menu, bell, avatar, back, info, the tab bar and the player bar are all translucent circles or pills with a thin light border. In Foodie: menu, favorites, avatar, back, share, servings control and the tab bar.
- **One big hero card with a glass caption strip.** The yoga card has a duration chip top-left, a bookmark top-right and a glass strip at the bottom with the title and a play button. In Foodie: cook-time chip, favorite button, dish name with a **Start cooking** button.
- **Text-only category tabs with a thin underline** instead of emoji pills. This looks calmer and more editorial.
- **A glass control bar on the detail screen** (the `1x` chip, slider and volume). In Foodie this becomes a servings multiplier and a step-progress bar in Cook Mode.

One warning from the reference itself: the light greeting text on the mint background is hard to read. In Foodie, use dark text on mint areas and light text on dark areas.

## 3. Palette and tokens

I sampled the main colors from your image and eyeballed the rest, so treat them as a starting point. The mint, teal, peach and dark values below are sampled; the others are tuned by eye.

**Fresh greens (the signature of the reference)**

- `mint-300` `#C3EBC5` – hero card, light surfaces (sampled)
- `sage-500` `#8CC9A8` – top-of-screen gradient start (eyeballed)
- `teal-400` `#49B0A1` – glow at the bottom of the hero card (sampled)
- `forest-700` `#1B2B2F` – dark screen base (sampled)
- `forest-900` `#0E1A17` – deepest background and text on mint (eyeballed)

**Warm food accents (the reference's peach cards)**

- `peach-300` `#F0B79F` – recommended-card tint (sampled)
- `peach-200` `#FCBFA4` – lighter peach highlight (sampled)
- `coral-500` `#F08A6A` – primary action, replaces the current `#FF6B35` (eyeballed)
- `saffron-400` `#F2B65A` – calories, ratings, small highlights (new)

**Text and glass**

- Text on dark `#F3F7F4`, muted text on dark `#9DB3AA`, text on mint `#0E1A17`
- Glass fill `rgba(255,255,255,0.14)`, glass border `rgba(255,255,255,0.28)`, blur intensity 30–50

The pairing logic: **greens say fresh and herbal, peach and coral say warm and appetizing**. Greens carry the structure and warm colors carry the food and the calls to action. Avoid adding blue or purple.

## 4. Module overview

Each module is shippable on its own and leaves the app working. Effort: **S** ≈ half a day, **M** ≈ 1–2 days, **L** ≈ 3–5 days.

- **M0 Foundation** (S–M) – theme tokens, fonts, dependencies, dark mode
- **M1 Glass UI kit** (M) – reusable glass components with fallbacks
- **M2 Floating tab bar and navigation** (M) – real tabs, glass pill nav
- **M3 Home redesign** (L) – gradient header, hero carousel, tabs, recommended row
- **M4 Recipe card system** (M) – card variants, image handling, skeletons
- **M5 Detail screen and Cook Mode** (L) – the biggest feature module
- **M6 Motion and haptics** (M) – animation, transitions, tactile feedback
- **M7 Smart features** (M–L) – recommendations, continue cooking, filters, shopping list
- **M8 Profile, onboarding, polish and QA** (M–L) – personalization, accessibility, performance

**Dependencies:** M0 → M1 → (M2, M4) → M3 → M5 → M6. M7 needs M4 and M5. M8 runs alongside the end. Do not start M3 before M0 and M1 are done, or you will restyle everything twice.

## 5. Module details

### M0 – Foundation (tokens, fonts, dark mode)

**Goal:** one source of truth for color, type, spacing and radius, so the rest of the work is fast.

**Tasks**

- Create `theme/tokens.ts` with the palette above, plus spacing (4/8/12/16/24), radii (12/20/28/pill), and shadow presets.
- Create `theme/ThemeProvider.tsx` and a `useTheme()` hook. Start dark-first. Support a light variant later via the same tokens.
- Install: `npx expo install expo-blur expo-linear-gradient expo-haptics expo-keep-awake` and `@expo-google-fonts/manrope`. Using `npx expo install` pins versions that match your SDK.
- Load Manrope in the root layout and hold the splash screen until fonts are ready. Define a type scale (display 32, title 22, body 15, caption 12). Optionally add Fraunces for dish names only, for a restaurant-menu feel.
- Set `userInterfaceStyle` to `"automatic"` or `"dark"` in `app.json`, change the status bar to light content, and set the stack's `contentStyle` to the dark base color.
- Replace hardcoded hex values with tokens screen by screen. Do this mechanically with search and replace.
- Swap `Image` for `expo-image` with a fade transition and caching.

**Done when:** no raw hex colors remain outside `theme/`, the app boots dark, and fonts load without a flash.

### M1 – Glass UI kit

**Goal:** build the glass look once, correctly, with graceful fallbacks.

**Components (in `components/ui/`)**

- `GlassSurface` – the base. It picks the best available implementation: `GlassView` from `expo-glass-effect` on iOS versions that support it, `BlurView` from `expo-blur` elsewhere, and a plain translucent `View` when blur is unavailable or the user has Reduce Transparency enabled (check `AccessibilityInfo.isReduceTransparencyEnabled`).
- `GlassIconButton` – 44pt circle for menu, back, bell, share.
- `GlassChip` – small pill for the time chip and filters; has a white variant like the "30 min" chip in the reference.
- `GlassBar` – wide pill for the servings control and the tab bar.
- `GradientBackground` – wraps `expo-linear-gradient` with the mint-to-forest preset used on Home.

**Details that make glass look expensive**

- A 1px border that is brighter on top than on the bottom (simulates a light edge).
- A very faint inner gradient on the fill, not a flat tint.
- Soft, large, low-opacity shadows. Avoid hard Android elevation shadows on glass.
- Never stack more than two blur layers on screen at once. Blur is the main performance cost, especially on Android.

**Done when:** a throwaway preview screen shows every glass component over both a bright photo and the dark background, and each remains readable.

### M2 – Floating tab bar and real navigation

**Goal:** the glass pill nav from the reference, built on proper tabs.

**Tasks**

- Move Home, Explore, Favorites and My Food into an Expo Router `(tabs)` group with a custom `tabBar` component. Detail, add and edit screens stay as stack screens above it.
- Build the floating bar: it sits above the safe area with side margins, uses `GlassBar`, shows four icons, and highlights the active tab with a larger glass circle (as in the reference). Keep the favorites count badge.
- **Where does "Add Recipe" go?** The reference has no center action. Suggested: a floating glass `+` button inside My Food, and a quick-add option in the header menu. Decide this before building.
- Add bottom padding to every scroll view so content is not hidden behind the floating bar.
- Optional: hide the bar slightly while scrolling down and show it on scroll up.

**Done when:** tapping tabs switches instantly without growing the back stack, and the bar looks right over light and dark content.

### M3 – Home redesign

**Goal:** match the reference layout.

**Layout, top to bottom**

- Gradient background (sage to forest) behind the whole screen.
- Header row: glass menu button on the left, glass favorites button and avatar on the right.
- Time-aware greeting: "Good evening" plus the user's name, then a large headline such as "What are you craving today?" with the thin leading dash from the reference.
- **Hero carousel** of 3–5 featured recipes: snapping cards with a peek of the neighbours, a cook-time chip, a favorite button and a glass caption strip with the dish name and a Start cooking button. Center card scales up slightly while neighbours shrink and fade (Reanimated).
- **Recommended for you** row with a "See all" link: smaller portrait cards tinted with `peach` gradients, each showing time, name and a small subtitle (cuisine or "Started" progress).
- **Category tabs:** replace the emoji chips with text tabs and an animated underline that slides to the selected category. Keep the scrollable row.
- Search moves into Explore, or becomes a glass search button in the header that opens a search overlay. Keeping a full text field on Home competes with the hero.

**Done when:** Home looks like the left phone in the reference, scrolls at a steady frame rate, and category filtering still works.

### M4 – Recipe card system

**Goal:** one consistent card language with several sizes.

- `HeroCard` (carousel), `PortraitCard` (recommended row), `ListCard` (Explore, Favorites, My Food, with edit/delete actions).
- Each card has: image with a bottom gradient scrim, glass time chip, glass favorite button, title and one subtle metadata line. Drop the colored difficulty pills, which look busy; show difficulty as small text or dots.
- Per-category tint: a gradient overlay color keyed to the category (breakfast = peach, salads = mint, desserts = rose, and so on) so the feed feels art-directed.
- Press animation: scale to 0.97 with a spring.
- Image loading: blurhash placeholder and fade-in; skeleton shimmer cards while data loads, instead of the spinner.
- **Photography:** the single biggest factor in looking premium. Use consistent, moody, top-down or 45° food photos with similar lighting. Ideally, use dish cutouts (transparent PNGs) over tinted gradients to echo the silhouette-on-color style of the reference. Without good images, the glass UI will look hollow.

**Done when:** every list in the app uses these cards, and no screen still shows the old white card.

### M5 – Detail screen and Cook Mode

**Goal:** the second phone in the reference, turned into the app's signature feature.

**Detail screen**

- Full-bleed hero image with glass back and share buttons.
- Below the hero, a glass control bar: the `1x` chip becomes a **servings scaler** (1x, 2x, 3x, or exact servings) that recalculates ingredient amounts live.
- Tabbed content with the underline style: Ingredients, Steps, Nutrition.
- Sticky glass **Start cooking** button at the bottom.

**Data migration for scaling**

- Change `ingredients: string[]` to `{ quantity?: number; unit?: string; name: string }[]` in `types/recipe.ts`.
- Write a small parser that converts existing strings such as "2 cups flour" into the structured form, falling back to `{ name: rawString }` when it cannot parse. Run it once on the seed data and on stored user recipes so nothing breaks.
- Update `RecipeForm` so new ingredients can be entered with quantity and unit, or still as free text.

**Cook Mode (full screen)**

- One step per page with large readable text and swipe or tap to advance.
- A slim progress bar at the top and a glass bottom bar with Previous, Next and a timer button.
- Automatic timer suggestion: detect phrases like "simmer for 10 minutes" in step text and offer a one-tap countdown.
- Keep the screen awake using `expo-keep-awake`, and add a light haptic tap when moving between steps and when a timer ends.
- Save progress per recipe so the home screen can show "Continue cooking" and the "Started" badge seen in the reference.

**Done when:** a user can pick a recipe, scale it to 3x, enter Cook Mode, run a timer, leave, and resume on the same step later.

### M6 – Motion and haptics

**Goal:** make it feel alive without being slow.

- Screen entry: staggered fade-and-rise for cards (Reanimated `entering` animations, 40–60 ms stagger, capped at the first 6 items).
- Hero image transition from card to detail. Shared element transitions in Reanimated are still experimental, so treat this as a stretch goal and fall back to a simple fade if it misbehaves on your SDK.
- Favorite heart: spring pop plus a light haptic.
- Category underline slide, tab bar active-circle slide, and pull-to-refresh with a branded indicator.
- Respect the system Reduce Motion setting by turning off all non-essential animations.
- Use haptics sparingly: favorite, step change, timer finished, and destructive confirmations only.

**Done when:** the app feels smooth on a mid-range Android phone, not only on a new iPhone.

### M7 – Smart features (all local, no backend)

- **Recommended for you:** score recipes by favorite categories, recently viewed, time of day (breakfast in the morning, dinner in the evening) and cooking time. A simple weighted score stored locally is enough to start.
- **Continue cooking and recently viewed:** a horizontal row on Home powered by the Cook Mode progress.
- **Filters sheet:** a glass bottom sheet with cook-time slider, difficulty, diet (vegetarian, non-vegetarian), and calorie range. Show an active-filter count on the filter button.
- **Search upgrade:** recent searches, suggestions from ingredients, and highlighted matches.
- **Shopping list:** add a recipe's ingredients (scaled to the chosen servings) to a persistent list, merge duplicates such as the same ingredient from two recipes, and check items off.
- **Later, optional:** weekly meal planner, personal notes and ratings per recipe, share-as-image of a recipe card, nutrition ring.

**Done when:** a first-time user opening the app sees a sensible Recommended row, and a returning user sees Continue cooking.

### M8 – Profile, onboarding, polish and QA

- **Onboarding (3 short screens):** name, optional avatar (you already have `expo-image-picker`), diet preference and favorite cuisines. This feeds the greeting and recommendations.
- **Profile screen:** avatar, name, theme toggle (dark, light, system), stats (recipes cooked, favorites), and the My Food entry.
- **Accessibility:** minimum 4.5:1 text contrast on every glass surface, 44pt touch targets, labels on all icon-only buttons, support for large text sizes, and the Reduce Transparency and Reduce Motion fallbacks.
- **Performance:** limit simultaneous blur views, set `windowSize` and `getItemLayout` on lists where possible, resize images to the displayed size, and test on a low-end Android device.
- **Branding:** new app icon and splash screen in the mint-and-forest palette, replacing the default Expo assets still in the project (`expo-logo`, `react-logo`, `tutorial-web`).
- **Cleanup:** remove unused assets and dependencies, update the README to describe the new features.

## 6. Suggested order of work

- **Sprint 1:** M0, M1, M2. At the end the app already looks different (dark, glass tab bar) even before screens are redesigned.
- **Sprint 2:** M4, M3. Home and cards match the reference.
- **Sprint 3:** M5. Detail screen and Cook Mode.
- **Sprint 4:** M6, then the first half of M7 (recommendations, continue cooking, filters).
- **Sprint 5:** shopping list, M8 and QA.

If you only have time for a quick win, do M0, M1 and M2 first, then the Home screen from M3. That gives most of the visual change.

## 7. Decisions and risks to settle early

- **Navigation approach.** If you still need the Expo Snack version, glass and shared-element transitions will be limited there, because Snack does not behave like a real native build. Recommendation: treat Expo Router in a native dev build as the main target and keep Snack as a simplified fallback, or drop it once the Coursera submission no longer needs it.
- **Liquid glass availability.** `expo-glass-effect` only renders the real effect on newer iOS versions. Everything else must fall back to blur or translucency, which is why `GlassSurface` in M1 matters. Verify its behavior on your installed SDK version before building on it.
- **Blur performance on Android.** Blur is costly there. Keep the number of blurred surfaces low and test early, not at the end.
- **Photography and licensing.** Decide where the new food images come from (your own photos, licensed stock, or generated imagery you have rights to) before M4. Poor or inconsistent images will undermine everything else.
- **Data migration safety.** The ingredient structure change in M5 touches saved user recipes. Write the parser defensively and test with recipes created under the old format before releasing.
- **Scope.** The plan is large. M7's optional items (meal planner, ratings, share-as-image) are the first things to cut if time runs short.

## 8. Next step

I can start with M0 and M1 directly on your project: set up the theme tokens, install the packages, and build the glass components so you can see the look on a preview screen. Tell me whether to begin there, and whether Add Recipe should move into My Food or stay in the tab bar.
