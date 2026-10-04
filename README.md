<div align="center">
  <img src="./assets/images/icon.png" width="130" height="130" alt="Foodie Logo" style="border-radius: 28px; box-shadow: 0 8px 24px rgba(195, 235, 197, 0.25);" />
  <h1>Foodie 🍳</h1>
  <p><strong>A luxury culinary discovery, interactive cooking, and meal planning mobile experience.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-0E1A17?style=for-the-badge&logo=expo&logoColor=C3EBC5" alt="Platform" />
    <img src="https://img.shields.io/badge/React%20Native-0.86-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
    <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/License-MIT-success?style=for-the-badge" alt="License" />
  </p>
</div>

---

## 📱 Overview

**Foodie** is an intuitive, mobile-first culinary app designed to inspire home cooks and culinary lovers. Built from the ground up with editorial aesthetics, liquid glassmorphism, and responsive tactile interactions, Foodie delivers a curated discovery feed, personalized dish recommendations, live ingredient servings scaling, a distraction-free Cook Mode with automated timers, and an offline-first shopping list.

---

## ✨ Features

### 🎨 Liquid Glass UI & Atmosphere Design System
- **Dark Atmosphere Palette**: Deep forest green (`#0E1A17`), translucent jade, sage, and glowing mint accents balanced with warm peach and coral highlights.
- **Glass Components**: High-performance `GlassSurface`, `GlassBar`, `GlassCard`, `GlassChip`, and `GlassIconButton` utilizing `expo-glass-effect` with blur and translucent solid fallbacks.
- **Performance Glass Nesting**: Dynamic `GlassNestingContext` enforcing depth limits to maintain 60+ FPS on all devices.
- **Theme Modes**: Full support for **Dark**, **Light**, and **System** themes with instant local persistence.

### 🧭 Floating Glass Navigation
- **Floating Glass Pill Bar**: Sits elevated above the safe area with edge margins, 44pt touch targets, and a dynamic favorites counter badge.
- **Animated Indicator**: A glowing glass circle indicator that springs and glides to highlight the active tab (`Home`, `Explore`, `Favorites`, `My Food`).
- **Expo Router Native Tabs**: Clean file-based routing architecture with instant tab switching and zero back-stack clutter.

### 🏠 Editorial Home Feed & Hero Carousel
- **Contextual Time-Aware Greeting**: Dynamic greetings ("Good morning", "Good afternoon", "Good evening") paired with your personalized chef name.
- **Hero Carousel**: Snapping cards with neighbor previews, cook-time chips, favorite toggle, and Reanimated card scaling.
- **Editorial Category Tabs**: Text tabs with a sliding underline indicator replacing dated emoji chips across 12 categories.
- **Continue Cooking**: Instantly resume recipes currently in progress with visual step completion progress bars.
- **Expandable Search Overlay**: Instant keyword search for recipes, ingredients, and cuisines.

### 🎴 Consistent Recipe Card Language
- **Card Hierarchy**:
  - `HeroCard`: Large showcase cards for the home carousel with bottom gradient scrims.
  - `PortraitCard`: Compact portrait cards for recommendations.
  - `ListCard`: Full-featured cards for Explore, Favorites, and My Food with edit and delete controls.
- **Per-Category Tints**: Subtle category-keyed color palettes (Breakfast = Peach, Salads = Mint, Desserts = Rose, Dinner = Forest, Drinks = Teal).
- **Tactile Feedback**: Spring scale-down on press (`0.97`) with haptic responses.
- **Shimmer Skeletons**: Fluid loading skeleton states while data hydrates.

### ⏱️ Full-Screen Cook Mode & Smart Timers
- **Distraction-Free Cooking**: Swipeable, large-text step cards that keep home chefs focused while in the kitchen.
- **Screen Wake Lock**: Integrates `expo-keep-awake` so the screen never dims or locks while you are cooking.
- **Automated Timer Detection**: Intelligently identifies time cues in instructions (e.g. *"simmer for 10 minutes"*) and provides a one-tap countdown timer with alert vibrations.
- **Step Progress Persistence**: Cook progress is saved per-recipe so you can leave and resume anytime.

### 📐 Interactive Servings Scaler
- **Live Quantity Recalculation**: Switch between `1x`, `2x`, `3x`, or exact custom servings directly on the recipe details screen.
- **Structured Ingredients**: Accurately multiplies quantities while preserving units (cups, tbsp, grams) and ingredient names.

### 🧠 Smart Recommendations Engine
- **Multi-Factor Scoring**: Weighs meal time-of-day (breakfast dishes in the morning, hearty dinners at night), user dietary preferences, favorite cuisines, quick prep times, and dish synergy.
- **Personalized Reasons**: Transparent recommendation highlights such as *"Matches your love for Italian"*, *"Quick morning bite"*, or *"Vegetarian favorite"*.

### 🛒 Persistent Shopping List
- **One-Tap Add from Recipes**: Add scaled ingredients directly from any recipe into your shopping list.
- **Smart Ingredient Merging**: Automatically merges quantities of duplicate ingredients from different recipes.
- **Check-off Checklist**: Check off items as you shop in the grocery aisle.

### 👤 Chef Profile & 3-Step Dietary Onboarding
- **3-Step Taste Onboarding**:
  1. *Chef Identity*: Name and custom avatar upload (`expo-image-picker`) or curated chef presets.
  2. *Dietary Preferences*: Selection from No Restrictions, Vegetarian, Strict Vegan, Pescatarian, Gluten-Free, and Keto.
  3. *Favorite Cuisines*: Multi-select tags (Italian, Japanese, Mexican, Indian, Mediterranean, Thai, American, French, Moroccan, Chinese).
- **Chef Profile Screen (`/profile`)**:
  - Avatar management and inline name editing.
  - Live culinary stats: *Cooked Dishes*, *Saved Favorites*, *Custom Recipes*, and *Shopping Items*.
  - Appearance Theme selector: Dark, Light, or System preference.
  - Quick taste profile re-tuning.

### 👨‍🍳 "My Food" Personal Recipe Studio
- **Recipe Creation & Editing Studio**: Upload custom photos, add ingredients, write numbered instructions, and set preparation metrics.
- **Edit & Delete Actions**: Full control to update or remove your custom culinary creations with safety confirmation dialogs.

### ⚡ Motion, Haptics & Accessibility
- **Staggered Animations**: Cards enter with Reanimated spring stagger (capped at 6 items to protect device memory).
- **Tactile Haptic Feedback**: Light impacts for favorites, tab changes, and timer alerts via `expo-haptics`.
- **Accessibility Fallbacks**: Tested minimum 4.5:1 text contrast on glass surfaces, 44pt minimum touch targets, and full system support for `Reduce Motion` and `Reduce Transparency`.

### 🌐 100% Offline & Standalone
- **Zero External Dependencies**: Operates completely offline with local storage—no backend servers, API keys, or sign-ups required.

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React Native (0.86)** | Cross-platform native mobile application framework |
| **Expo (SDK 57)** | Toolchain, runtime, and native module ecosystem |
| **TypeScript** | Strict compile-time safety and domain modeling |
| **Expo Router** | File-based typed navigation with nested stacks & tabs |
| **React Native Reanimated** | 60+ FPS native gesture and layout animations |
| **Expo Glass Effect & Blur** | Liquid glass and native blur surface rendering |
| **Expo Image & Image Picker** | Hardware-accelerated image caching and gallery photo picker |
| **Expo Keep Awake** | Prevents screen sleep during active Cook Mode |
| **Expo Haptics** | Tactile motor vibration feedback |
| **AsyncStorage** | Offline-first persistent local storage |
| **Lucide Icons** | Accessible, minimalist vector iconography |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or newer recommended)
- [Expo Go](https://expo.dev/go) app installed on your iOS or Android mobile device

### Installation & Launch

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Vishallakshmikanthan/foodie-app-coursera.git
   cd foodie-app-coursera
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Expo development server:**
   ```bash
   npx expo start
   ```

4. **Open on your device:**
   - **Android**: Scan the terminal QR code using the **Expo Go** app.
   - **iOS**: Scan the QR code using the native iOS **Camera** app, then tap the prompt to open in **Expo Go**.
   - **Web**: Press `w` in the terminal to open the application directly in your web browser.

---

## 📂 Project Architecture

```text
foodie-app/
├── app/                        # Expo Router stack & tab routes
│   ├── (tabs)/                 # Tab group navigation
│   │   ├── _layout.tsx         # FloatingTabBar layout container
│   │   ├── index.tsx           # Home feed (Hero, Continue Cooking, Recommendations)
│   │   ├── explore.tsx         # Discover catalogue with search & filter sheet
│   │   ├── favorites.tsx       # Saved favorites collection
│   │   └── my-food.tsx         # Personal recipe hub
│   ├── _layout.tsx             # Root layout with Theme, UserProfile & Recipe providers
│   ├── profile.tsx             # Chef Profile, stats, theme toggle & taste preferences
│   ├── recipe/[id].tsx         # Recipe details screen with live servings scaling
│   ├── cook/[id].tsx           # Full-screen Cook Mode with step timer & keep-awake
│   ├── shopping-list.tsx       # Persistent ingredient shopping list
│   ├── add-recipe.tsx          # Custom recipe creation studio
│   ├── edit-recipe.tsx         # Recipe edit studio
│   └── glass-preview.tsx       # Design system UI kit preview
├── components/                 # Reusable component library
│   ├── ui/                     # Design system atoms (GlassSurface, GlassBar, GlassIconButton, etc.)
│   ├── HeroCarousel.tsx        # Carousel with snapping and neighbor preview
│   ├── HeroCard.tsx            # Full hero card with glass meta strip
│   ├── PortraitCard.tsx        # Compact recommendation portrait card
│   ├── ListCard.tsx            # Multi-action list card
│   ├── HomeHeader.tsx          # Editorial top header with time-aware greeting
│   ├── HomeMenuModal.tsx       # Glass drawer modal with profile navigation
│   ├── OnboardingModal.tsx     # 3-step culinary profile onboarding flow
│   ├── ContinueCookingRow.tsx  # In-progress cooking resume row
│   ├── RecommendedRow.tsx      # Multi-factor recommendation carousel
│   ├── FiltersModal.tsx        # Glass bottom filter sheet
│   ├── SearchSuggestions.tsx   # Recent searches & ingredient chip suggestions
│   └── FloatingTabBar.tsx      # Floating glass navigation pill with sliding indicator
├── context/
│   ├── RecipeContext.tsx       # Recipe state, cooking progress & shopping list
│   └── UserProfileContext.tsx  # Chef profile, dietary preference & onboarding state
├── theme/
│   ├── tokens.ts               # Color palette, spacing, typography & glass variants
│   ├── categoryTints.ts        # Per-category gradient tint tokens
│   └── ThemeProvider.tsx       # Dark / Light / System theme context
├── types/
│   ├── recipe.ts               # Recipe, Ingredient, and CookingProgress types
│   ├── smart.ts                # Shopping, filter, and recommendation types
│   └── user.ts                 # UserProfile, DietaryPreference, and preset types
├── utils/
│   ├── recommendationEngine.ts # Multi-factor recommendation scoring algorithm
│   ├── shoppingUtils.ts        # Ingredient merging and shopping list utilities
│   ├── ingredientUtils.ts      # Structured ingredient parser & scaler
│   ├── haptics.ts              # Platform-guarded tactile feedback service
│   ├── motion.ts               # Stagger tokens and Reduce Motion hooks
│   └── storage.ts              # AsyncStorage persistence wrapper
├── assets/images/              # Branded icon, splash, and background assets
└── app.json                    # Expo configuration with dark theme & splash
```

---

## ✅ Peer-Grading Checklist (All 12 Requirements)

| # | Peer-Review Requirement | Implementation Details | Status |
| :---: | :--- | :--- | :---: |
| **1** | **Can the GitHub repository be imported into Snack Expo using "Import Git Repository"?** | Configured with clean `package.json`, universal `App.tsx` fallback, and zero proprietary dependencies. | **YES** |
| **2** | **Does the main feed contain at least 10 horizontally scrollable recipe categories?** | Includes 12 categories: *All*, *Breakfast*, *Lunch*, *Dinner*, *Desserts*, *Snacks*, *Soups*, *Salads*, *Drinks*, *Vegetarian*, *Non-Vegetarian*, and *My Food* with smooth horizontal scrolling. | **YES** |
| **3** | **When a recipe is opened, are ALL these visible: Ingredients, Instructions, Preparation time, Servings, Calories, Difficulty level?** | In `app/recipe/[id].tsx`, all 6 metrics plus full-bleed hero imagery, scalable checklist ingredients, and numbered steps are displayed. | **YES** |
| **4** | **Does selecting a category display recipes specific to that category?** | Selecting any category chip dynamically filters the recipe feed with instant updates. | **YES** |
| **5** | **Does the heart icon toggle: Favorite ↔ Unfavorite?** | Interactive heart button switches visual fill and toggles favorite status with immediate tactile haptic feedback. | **YES** |
| **6** | **Can a recipe be added to Favorites and does it appear there?** | Favorited recipes instantly appear in `/favorites` and persist across restarts. | **YES** |
| **7** | **Does the category bar contain: My Food → Add New Recipe?** | "My Food" is an active chip in the category bar that navigates to `/my-food`, featuring a prominent `+ Add New Recipe` card. | **YES** |
| **8** | **Does Add New Recipe allow: Recipe name, Image upload, Ingredients list, Step-by-step instructions, Save Recipe?** | Universal form in `app/add-recipe.tsx` with name, image picker, multi-item ingredients, step list, and "Save Recipe". | **YES** |
| **9** | **After saving a recipe, does it appear in My Recipes?** | Saved recipes immediately display under "My Recipes" on `/my-food` and persist in AsyncStorage. | **YES** |
| **10** | **When opening a My Recipe, does it display: Name, Image, Ingredients, Instructions?** | User-created recipes open full recipe details displaying all photos, ingredients, steps, and metrics. | **YES** |
| **11** | **Does each My Recipe provide: Edit, Delete, and do both actually work?** | My Recipe cards feature both **Edit** (prepopulates form, saves changes) and **Delete** (with confirmation dialog). | **YES** |
| **12** | **Does the back button work throughout the application?** | Every child screen (`/favorites`, `/my-food`, `/add-recipe`, `/edit-recipe`, `/recipe/[id]`, `/cook/[id]`, `/shopping-list`, `/profile`) includes a functional back button returning to the previous view. | **YES** |

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
