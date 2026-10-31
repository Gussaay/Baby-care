# Play Organiser 🧸

A simple app to help families organise play for their children.

## Module 1 — Toy Box & Skills

- **Add your real toys**: pick a type (blocks, puzzle, book…), name it, add a photo and age range.
- **Link toys to skills**: each type pre-selects suggested skills across 8 areas
  (fine motor, gross motor, language, thinking, social-emotional, senses, creativity, numbers & shapes); change them with a tap.
- **Track use**: the **▶ Log play** button records child, toy, minutes and enjoyment (😐 🙂 😍) in seconds.
- **See skills**: minutes per area/skill for each child (week / month / all), with tips for areas that had no play
  and the toys you own that help — plus "not played in 14+ days" toys to rotate back in.
- **Family**: several children; export/import a JSON backup.

## Run

No install or build needed — open `index.html` in a browser (or serve the folder, e.g. `npx serve .`).
Data is stored on the device (`localStorage`). Click **try with sample data** to explore.

## Files

| File | Purpose |
|------|---------|
| `index.html` | App shell |
| `styles.css` | Styling (mobile-first, light/dark) |
| `data.js` | Skill catalogue and toy types with suggested skills |
| `app.js` | App logic: toys, play log, skills dashboard, storage |
| `docs/DESIGN.md` | Design: data model, screens, insights, future modules |

## Deploy to Firebase Hosting

Project: `baby-care-play` → https://baby-care-play.web.app

**From your computer (once):**

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only hosting
```

**Automatically from GitHub:** `.github/workflows/firebase-deploy.yml` deploys on every push to
`main` (or this branch). It needs a repository secret `FIREBASE_SERVICE_ACCOUNT_BABY_CARE_PLAY`
— the easiest way to create it is `firebase init hosting:github` on your computer, or paste a
service-account JSON key (Firebase console → Project settings → Service accounts) into
GitHub → Settings → Secrets and variables → Actions.
