# Phase 10: i18n -- Trilingual Support

## Context Links
- [Plan Overview](./plan.md)
- [Current i18n Config](/Users/khoilq/Documents/DeveloperZone/mekongsmile/src/services/i18n/config.ts)
- [Language Enum](/Users/khoilq/Documents/DeveloperZone/mekongsmile/src/services/i18n/language-enum.ts)
- [Middleware](/Users/khoilq/Documents/DeveloperZone/mekongsmile/src/middleware.ts)

## Overview
- **Priority:** P3
- **Status:** completed
- **Effort:** 3h
- **Description:** Extend i18n from vi/en to en/vi/zh (English primary, Vietnamese, Chinese). Update translation files, middleware, and language switcher. WordPress content is English-only; i18n applies to UI strings and static labels.

## Completion Summary
- 60 Chinese locale files created in `public/locales/zh/`
- English and Vietnamese fallbacks configured
- i18n middleware updated for trilingual routing
- Noto Sans SC font added to layout for Chinese character support

## Key Insights
- Existing i18n infrastructure is mature: i18next + `getServerTranslation()` + cookie-based language detection
- Current fallback is `vi` -- change to `en` (English primary for international tourists)
- `INTERNATIONAL_ROUTING_ENABLED` env var controls URL-based language routing (e.g., `/en/tours/` vs `/tours/`)
- Current middleware strips language prefix when routing disabled -- keep this for now, enable later
- WP content is English-only -- no WPML/Polylang on backend. i18n is for UI chrome only.
- Chinese (`zh`) translation files need creation from scratch

## Requirements

### Functional
- UI strings available in English (default), Vietnamese, Chinese
- Language switcher in header
- Language preference saved in cookie
- Correct `lang` attribute on `<html>` tag

### Non-Functional
- Translation files kept small -- only UI strings, not content
- Missing translations fall back to English

## Related Code Files

### Modify
- `src/services/i18n/language-enum.ts` -- add `zh`
- `src/services/i18n/config.ts` -- change fallback to `en`
- `src/middleware.ts` -- add `zh` to language handling
- `src/app/layout.tsx` -- ensure `lang` attribute updates

### Create
- `public/locales/zh/common.json` -- Chinese UI translations
- `public/locales/zh/home.json`
- `public/locales/zh/tours.json`
- (mirror all existing en/*.json files for zh)

### Keep
- `public/locales/en/*.json` -- English translations (update for tour context)
- `public/locales/vi/*.json` -- Vietnamese translations (update for tour context)
- `src/services/i18n/store-language-provider.tsx`

## Implementation Steps

### 1. Update language enum
```ts
export enum ELanguages {
  "en" = "English",
  "vi" = "Tieng Viet",
  "zh" = "Chinese",
}
```

### 2. Change fallback language
In `config.ts`, fallback changes from `vi` to `en` automatically once enum order changes or set explicitly.

### 3. Update English translation files
Replace ferry-specific strings with tour-site strings:
- "Search schedules" -> "Explore Tours"
- "Book ticket" -> "Book Now"
- "Ferry operators" -> remove
- Add: "Duration", "Price from", "Destinations", "Why Choose Us", etc.

### 4. Create Chinese translation files
Copy English JSON files, translate keys to Chinese. Structure:
```json
// public/locales/zh/common.json
{
  "nav.home": "home",
  "nav.tours": "tours",
  "nav.blog": "blog",
  "nav.about": "about",
  "nav.contact": "contact",
  "book_now": "book now",
  "price_from": "price from",
  "duration": "duration",
  "load_more": "load more"
}
```
(Actual Chinese translations to be provided by content team)

### 5. Update Vietnamese translations
Same structure as English, translate to Vietnamese. Remove ferry-specific terms.

### 6. Language switcher component
Adapt existing language switcher (if any) or create simple dropdown:
```tsx
"use client";
const languages = [
  { code: "en", label: "EN" },
  { code: "vi", label: "VI" },
  { code: "zh", label: "ZH" },
];
```

### 7. Middleware update
Add `zh` to accepted languages list. Middleware already uses `acceptLanguage.languages([...languages])` from config -- should auto-detect Chinese browsers.

## Todo List
- [x] Update `language-enum.ts` with `zh` (already done in Phase 1)
- [x] Change fallback language to `en` (already done in Phase 1)
- [x] Update English translation files (remove ferry terms, add tour terms)
- [x] Create Chinese translation file stubs (60 files, full translations)
- [x] Update Vietnamese translation files
- [x] Add/update language switcher in header
- [x] Test language switching via cookie
- [x] Test `<html lang="">` updates correctly
- [x] Verify fallback to English for missing translations

## Success Criteria
- Language switcher shows EN/VI/ZH options
- UI labels change when language is switched
- Cookie persists language preference
- Missing Chinese translations fall back to English
- `<html lang="zh">` when Chinese selected

## Risk Assessment
- **Chinese translations quality** -- stub files with English fallback initially; real translations from content team later
- **Right-to-left not needed** -- Chinese is LTR, no bidi concerns
- **Font support** -- Inter font supports Latin + Vietnamese but NOT Chinese. Need to add Chinese font (e.g., Noto Sans SC) or use system font fallback for `zh` locale.

## Next Steps
-> Phase 11: Cleanup & Polish
