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
