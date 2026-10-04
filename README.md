# Foodie 🍳 – Phase 2 Premium Recipe Experience

> A luxury culinary discovery, interactive cooking, and meal planning mobile application built with **React Native**, **Expo (SDK 57)**, **TypeScript**, **Expo Router**, **Reanimated**, and **AsyncStorage**.

---

## 📱 Overview

**Foodie** is a next-generation mobile culinary application designed to elevate the home cooking experience. Inspired by editorial design, liquid glassmorphism, and modern tactile mobile interactions, Foodie combines a curated recipe discovery feed, an intelligent recommendation engine, structured ingredient scaling, a distraction-free Cook Mode with automated step timers, and an offline-first shopping list.

---

## ✨ Phase 2 Architecture & Signature Features

### 🌟 M1 – Liquid Glass Design System
- **Dark Atmosphere Palette**: Deep forest green (`#0E1A17`), translucent jade, sage, and mint accents paired with warm peach and coral highlights.
- **Glass UI Components**: High-performance `GlassSurface`, `GlassBar`, `GlassCard`, `GlassChip`, and `GlassIconButton` utilizing `expo-glass-effect` (on supported iOS versions) with automatic fallbacks to `expo-blur` and translucent solid layers.
- **Performance-Conscious Glass Nesting**: Dynamic `GlassNestingContext` enforcing a max blur depth to guarantee smooth frame rates on Android and lower-end hardware.
- **Theme Provider**: Persistent Theme mode support (**Dark**, **Light**, **System**) loaded instantly via AsyncStorage.

### 🧭 M2 – Floating Glass Navigation & Routing
- **Floating Glass Pill Bar**: Sits elevated above the device safe area with edge margins, 44pt touch targets, and a favorites badge.
- **Animated Active Indicator**: Glass circle highlight that smoothly slides and springs across active tabs (`Home`, `Explore`, `Favorites`, `My Food`).
- **Expo Router Tabs**: True native tab navigation with zero back-stack clutter.

### 🏠 M3 – Redesigned Home Feed
- **Atmosphere Gradient**: Full-bleed mint-to-forest gradient backdrop.
- **Time-Aware Editorial Header**: Contextual greeting ("Good morning", "Good afternoon", "Good evening") with user chef name, favorites counter badge, and instant avatar access to Profile.
- **Hero Carousel**: Snapping carousel of signature featured dishes with neighbor-card peeking, cook-time chips, and Reanimated scaling.
- **Editorial Category Tabs**: Text tabs with a sliding underline indicator replacing dated emoji chips.
- **Expandable Search Bar**: Inline glass search overlay bar with quick query clearing.

### 🎴 M4 – Unified Recipe Card System
- **Card Language Hierarchy**:
  - `HeroCard`: Large showcase cards for the carousel with bottom scrim and glass meta strips.
  - `PortraitCard`: Compact, elegant portrait cards for the "Recommended for you" row.
  - `ListCard`: Versatile cards for Explore, Favorites, and My Food with full manage actions.
- **Per-Category Tints**: Subtle category-keyed color palettes (Breakfast = Peach, Salads = Mint, Desserts = Rose, Dinner = Forest, Drinks = Teal).
- **Tactile Feedback**: Spring scale-down on press (`0.97`) with haptic response.
- **Skeleton Shimmer Loading**: `CardSkeleton` shimmer states while recipes load.

### 👨‍🍳 M5 – Detail Screen & Full-Screen Cook Mode
- **Dynamic Servings Scaler**: Live ingredient recalculation for `1x`, `2x`, `3x`, or custom servings with structured quantity and unit formatting.
- **Full-Bleed Media Header**: High-resolution imagery with floating glass back and share controls.
- **Underline Section Tabs**: Tabbed breakdown for *Ingredients*, *Preparation Steps*, and *Nutrition Facts*.
- **Cook Mode (Full-Screen Distraction-Free)**:
  - Step-by-step swipeable cards with step progress tracking.
  - Screen wake lock enabled via `expo-keep-awake`.
  - Automatic timer parsing: Detects countdown cues in step instructions (e.g. "simmer for 10 minutes") and offers a one-tap countdown timer.
  - Progress persistence: Cook progress is saved per-recipe to power "Continue Cooking" on Home.

### ⚡ M6 – Motion & Tactile Haptics
- **Staggered Entrance Transitions**: Cards enter with Reanimated spring stagger (capped at 6 items to protect device memory).
- **Tactile Haptic Feedback**: Light impacts for favorites, tab changes, and timer alerts via `expo-haptics`.
- **Accessibility Reduce Motion & Transparency**: Automatically detects system `isReduceMotionEnabled` and `isReduceTransparencyEnabled` to deactivate heavy animations and blurs.

### 🧠 M7 – Smart Features (100% Local & Offline)
- **Smart Recommendations Engine**: Multi-factor scoring weighting meal time-of-day, user dietary preferences, favorite cuisines, quick prep bonuses, and recent dish synergy.
- **Continue Cooking Row**: Horizontal progress bar on Home letting users resume active dishes right where they left off.
- **Smart Filters Bottom Sheet**: Filter dishes by cook time (15, 30, 45, 60 min), difficulty level, dietary restriction, and calorie threshold with active filter badges.
- **Search Suggestions**: Recent search history and ingredient filter chips.
- **Persistent Shopping List**: Scaled ingredients can be added directly from recipes, duplicate items automatically merge units/quantities, and items can be checked off.

### 👤 M8 – Profile, Onboarding & Quality Assurance
- **Interactive 3-Step Onboarding**:
  1. *Chef Identity*: Name and custom avatar upload (`expo-image-picker`) or curated chef presets.
  2. *Dietary Preferences*: Selection from No Restrictions, Vegetarian, Strict Vegan, Pescatarian, Gluten-Free, and Keto.
  3. *Favorite Cuisines*: Multi-select tags (Italian, Japanese, Mexican, Indian, Mediterranean, Thai, American, French, Moroccan, Chinese).
- **Chef Profile & Settings (`/profile`)**:
  - Avatar management and inline name editing.
  - Live culinary stats: *Cooked Dishes*, *Saved Favorites*, *Custom Recipes*, and *Shopping Items*.
  - Appearance Theme selector: Dark, Light, or System preference.
  - Taste Profile reconfiguration modal.
  - Data reset and testing controls.
- **Accessibility & Contrast**: Minimum 4.5:1 text contrast on every glass surface, 44pt minimum touch targets on all interactive controls, and screen-reader accessibility labels.
- **Branded Assets**: Custom glowing glass mint-and-forest app icon, splash screen, and favicon replacing all default Expo boilerplate files.

---

## 🛠️ Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **React Native (0.86)** | Cross-platform native mobile application core |
| **Expo (SDK 57)** | Toolchain, runtime, and native module ecosystem |
| **TypeScript** | Strict compile-time safety and domain modeling |
| **Expo Router** | File-based typed navigation with nested stacks & tabs |
| **React Native Reanimated** | 60+ FPS native gesture and layout animations |
| **Expo Glass Effect & Blur** | Liquid glass and native blur surface rendering |
| **Expo Image & Image Picker** | Hardware-accelerated image caching and gallery picker |
| **Expo Keep Awake** | Prevents screen sleep during active Cook Mode |
| **Expo Haptics** | Tactile motor vibration feedback |
| **AsyncStorage** | Offline-first persistent local storage |
| **Lucide Icons** | Accessible, minimalist vector iconography |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or newer recommended)
- [Expo Go](https://expo.dev/go) on iOS or Android (or an iOS Simulator / Android Emulator)

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

3. **Start the development server:**
   ```bash
   npx expo start
   ```

4. **Run on your device:**
   - **Android**: Scan the terminal QR code using **Expo Go**.
   - **iOS**: Scan the QR code using the iOS **Camera** app.
   - **Web**: Press `w` in the terminal to open in your browser.

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

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
