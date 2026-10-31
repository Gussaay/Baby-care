# Baby care · رعاية الطفل

Organise play for your children and see the skills they build — in **English and Arabic** (full right-to-left layout).
One code base runs as a **website / installable PWA** and as a **native Android app**, using the same stack as Easy Pedia:
Vite + React 18 + Tailwind 3 + Firebase JS SDK + Capacitor 7 + vite-plugin-pwa.

Live site (Firebase project `baby-care-play`): https://baby-care-play.web.app
Android APK: https://baby-care-play.web.app/download/baby-care.apk

## What it does (Module 1 — Toy Box & Skills)

- **Add your real toys**: pick a type, name it, add a photo and age range; suggested skills are pre-ticked across 8 areas.
- **Log play** in seconds: child, toy, minutes, enjoyment (😐 🙂 😍).
- **Skills**: minutes per area/skill for each child (week / month / all), tips for areas that had no play, favourite toy.
- **Family**: several children, language switch, export/import a JSON backup. Data stays on the device.
- Switch language any time with the **English / العربية** button in the header (remembered; first visit follows the phone's language).

## Commands

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # logic tests + check every English string has an Arabic translation
npm run build        # production web build -> dist/
npm run deploy:web   # build + firebase deploy --only hosting
npm run mobile:sync  # build + copy into android/
npm run mobile:open  # open android/ in Android Studio
```

## Files

| Path | Purpose |
|------|---------|
| `src/lib/strings.js` | All interface text, English + Arabic |
| `src/lib/catalogue.js` | Skill areas, skills and toy types (both languages) |
| `src/lib/logic.js` | Pure app logic (tested in `logic.test.js`) |
| `src/lib/i18n.jsx` | Language context: sets `lang`/`dir`, formats ages, minutes, dates |
| `src/lib/store.jsx` | Data in `localStorage` (also reads data saved by the first plain-JS version) |
| `src/pages/*`, `src/components/*` | Screens, forms and UI pieces |
| `android/` | Capacitor Android project (Arabic app name in `values-ar`) |
| `docs/DESIGN.md` | Data model, screens, insights, future modules |

## Publishing (GitHub Actions → Firebase)

`.github/workflows/deploy.yml` runs on every push to the main branch:
tests → web build → **Firebase Hosting live deploy** → Android APK → GitHub Release. Pull requests get a Firebase preview link.

It needs one repository secret: **`FIREBASE_SERVICE_ACCOUNT_BABY_CARE_PLAY`**. Create it once, either:

- on your computer: `npm i -g firebase-tools && firebase login && firebase init hosting:github` (choose `Gussaay/Baby-care`), or
- Firebase console → Project settings → Service accounts → *Generate new private key*, then paste the JSON into
  GitHub → Settings → Secrets and variables → Actions → *New repository secret*.

Until it is added the workflow still builds and tests, and says the secret is missing.
The APK is published as a GitHub Release only once a fixed signing key is set (secrets `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, optional `KEY_PASSWORD`, same as Easy Pedia), because Android refuses updates signed with a different key. Without them each run still builds a test APK (download it from the run's artifacts).
