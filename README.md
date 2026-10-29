# NARSync — Student Mobile App Prototype

NARSync is a centralized attendance monitoring concept for the Related Learning
Experience (RLE) duty of nursing students at Bicol University Polangui. This repository
contains the **student mobile app prototype** only.

The app demonstrates the complete student attendance journey with realistic mock data:

- Demo sign-in
- Assigned RLE group and duty details
- Five-view simulated facial registration
- Group-photo time in and time out flows
- Evidence review, confirmation, and success states
- Searchable and filterable attendance history
- Student profile and attendance preferences

> **Prototype notice:** This build has no backend, database, real authentication, facial
> recognition, camera access, GPS access, notifications, or permanent storage. All student
> details, photos, locations, and timestamps in the attendance flow are demo data.

## Tech stack

- React 19 + Vite
- JavaScript (JSX)
- React Router
- Lucide React icons
- Plain CSS with a shared design system
- Local Plus Jakarta Sans variable font

No UI framework or state-management library is used.

## Getting started

### Requirements

- Node.js 20 or newer
- npm

### Install

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`). The layout is mobile-first
and is centered inside a phone-style frame when viewed on a desktop browser.

### Build and preview

```bash
npm run build
npm run preview
```

### Lint

```bash
npm run lint
```

> On Windows, if `npm` is blocked by the PowerShell execution policy, use `npm.cmd`
> instead, for example `npm.cmd install` and `npm.cmd run dev`.

## Demo account

Authentication is simulated. The credentials are prefilled on the sign-in screen:

| Field | Value |
| --- | --- |
| Student ID | `2022-10345` |
| Password | `narsync` |

The student, coordinator, preceptor, and roster details are fictional.

## Demo walkthrough

1. **Sign in** with the prefilled demo account.
2. On the **Dashboard**, open **Facial registration** and complete the five guided views
   (Front, Left, Right, Up, Down). Use **Fill all five views with demo captures** to speed
   up testing. Finish registration to update the dashboard status.
3. Tap **Time In** to open the simulated camera. Capture a group photo or select a demo
   image, wait for the simulated location check, then continue.
4. **Review** the type, timestamp, simulated GPS, and assigned duty location. Submit and
   confirm in the bottom sheet.
5. The **Success** screen and attendance history update immediately. Return to the
   dashboard.
6. **Time Out** is now enabled because a valid time in exists. Complete the same flow.
7. Open **History** to search records, filter by status, filter by date, and inspect a
   record's details.
8. Open **Profile → Settings** to adjust attendance preferences, reset demo data, or sign
   out.

Prototype controls on the capture screen let you preview the unavailable-GPS error state.

## Screens and routes

| Screen | Route |
| --- | --- |
| Login | `/login` |
| Dashboard | `/dashboard` |
| Duty assignment | `/duty` |
| Facial registration | `/face-registration` |
| Attendance hub | `/attendance` |
| Time in/out camera | `/attendance/:type/capture` |
| Time in/out review | `/attendance/:type/review` |
| Submission success | `/attendance/success/:recordId` |
| Attendance history | `/history` |
| Attendance record details | `/history/:recordId` |
| Profile | `/profile` |
| Settings | `/settings` |

The bottom navigation contains Home, Attendance, History, and Profile. Immersive capture,
review, and success screens hide the navigation to keep attention on the attendance task.

## Project structure

```text
src/
  components/          Reusable UI and app-specific components
    ui/                Button, Badge, Card, Sheet, TextField, etc.
  context/             Session state, attendance, facial registration, toasts
  data/                Fictional student, duty, credentials, and sample records
  pages/               One component per screen
  styles/              Design tokens, shared components, and page styles
  utils/               Date/time formatting and attendance status logic
  App.jsx              Routes and auth guards
  main.jsx             App providers and entry point
```

## Behaviour and data rules

- Group and duty location are read from assigned mock data; students cannot create or
  change them.
- Facial registration becomes available because the demo student already belongs to an
  RLE group.
- Time Out is disabled until a valid Time In exists for the current duty day.
- Attendance status is derived from the actual time in and time out records in React
  state. A time in after 7:15 AM is marked late.
- All state lives in memory. **Reloading the browser resets the session** and returns to
  the login screen. Settings and demo records are not persisted.
- Simulated GPS coordinates are clearly labeled as demo data. The app never requests or
  fabricates a live GPS reading.
- Demonstration selfies/group photos are placeholders. No camera permission or image
  upload is used.

## Out of scope for this phase

- RLE Coordinator and Department Head web dashboards
- Node.js/Express API and PostgreSQL database
- Real facial recognition or liveness detection
- Real geolocation verification
- Notifications, offline sync, and permanent storage
