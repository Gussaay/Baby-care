# Baby care (Play Organiser) — Design

A simple app that helps families organise play for their children.
The app is built as modules; this document covers **Module 1: Toy Box & Skills**.

## Goals of Module 1

1. **Register real toys** the family already owns (name, photo, type, age range).
2. **Link each toy to specific developmental skills** (e.g. a shape sorter → fine motor, shape recognition, problem solving).
3. **Track use**: log each play session (which toy, which child, how long, how engaged).
4. **Show the picture**: which skills each child is practising, which are neglected, and which toys are gathering dust.

## Users

| User | Need |
|------|------|
| Parent / caregiver | Quickly add toys, log play in under 10 seconds, see what to offer next |
| Child (with parent) | Pick a toy from photos, tap ⭐ to say how much they liked it |

## Core concepts (data model)

```
Child      { id, name, birthDate, color }
Skill      { id, name, domainId }                  – built-in catalogue (editable later)
Domain     { id, name, icon }                      – Fine motor, Gross motor, Language, Thinking,
                                                     Social-emotional, Senses, Creativity, Numbers
Toy        { id, name, type, emoji, photo?, minAge, maxAge, skillIds[], notes, createdAt, archived }
PlaySession{ id, toyId, childId, date, minutes, enjoyment(1-3), note }
```

* A **Toy ↔ Skill** link is many-to-many (`toy.skillIds`).
* A **PlaySession** credits its minutes to every skill linked to the toy. This is how
  "skill practice time" is calculated — no extra input needed from the parent.
* **Toy types** (Blocks, Puzzle, Ball, Book, Play dough …) carry *suggested skills*, so picking
  "Puzzle" pre-ticks *Problem solving, Fine motor, Shape recognition*. Parents can adjust.

## Screens

1. **Toys** – photo grid of the family's toys, with skill chips and "last played".
   Filters: by skill domain, by "not played in 14 days". Tap a toy → details & history.
2. **Add / edit toy** – three steps on one form: *What is it?* (type picker → name/photo),
   *Who is it for?* (age range), *What does it teach?* (skill chips, pre-ticked from type).
3. **Log play** – big floating "▶ Log play" button: pick child → pick toy → minutes
   (quick buttons 5 / 10 / 15 / 30) → enjoyment 😐 🙂 😍. Done.
4. **Skills** – for the selected child and period (week / month): minutes per domain
   and skill, highlighting skills with **no practice**, each with "toys you own that help".
5. **Children** – add children, see age; the selected child filters every screen.

## Insights (rule-based, no AI needed)

* **Neglected skill**: a domain with 0 minutes in the period → suggest owned toys linked to it.
* **Forgotten toy**: not played for 14+ days → "rotate it back in".
* **Favourite**: highest average enjoyment.
* **Age fit**: toy outside the child's age range is flagged.

## Technical choices

* React + Vite web app, also shipped as a native Android app with Capacitor (same stack as Easy Pedia).
  Installable as a PWA and works offline.
* **Bilingual**: English and Arabic. All text lives in `src/lib/strings.js`; the catalogue carries
  `{ en, ar }` names. Arabic switches the page to `dir="rtl"`; layouts use logical (start/end) spacing.
* Data stored on the device (`localStorage`) with **Export / Import JSON** for backup. A backend
  (shared family account, sync with Firebase) is a later module.
* Photos are resized to 320px in the browser before saving to keep storage small.
* Firebase project `baby-care-play`: Hosting + Analytics.

## Future modules

* **Module 2 – Play plans**: weekly plan that rotates toys to cover all domains.
* **Module 3 – Activities without toys**: games and routines linked to the same skills.
* **Module 4 – Milestones**: age-based milestones mapped to the same skill catalogue.
* **Module 5 – Family sharing**: multiple caregivers, cloud sync.
