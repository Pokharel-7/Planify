# Planify Mobile

React Native (Expo SDK 54) mobile app for Planify, matching the design system
and data model of the existing Planify web app (Next.js) and backend (Express/MongoDB).

## Status

### Built and functional (real UI, real navigation, real interactions)
- **Auth**: Splash, Onboarding, Welcome, Login, Register, Forgot Password, OTP, Reset Password,
  Password Changed, Google Sign-In (wired to real `/api/auth/*`, Google needs your credentials)
- **Home Dashboard**: stats, weekly progress, today's tasks/meetings, recent projects, activity feed
- **Tasks**: filterable list + Kanban, Task Detail (subtasks, comments, attachments), Create Task
- **Projects**: grid list, Project Detail (Overview/Tasks/Members/Files tabs)
- **Calendar**: month grid + day agenda
- **Notifications**: filterable feed, mark-all-read
- **Chat**: conversation list (DM + group, unread badges, online status), chat screen with
  bubbles, typing indicator, composer
- **Time Tracking**: running timer (start/pause/stop), daily/weekly/monthly summary, history
- **Reports**: completed vs pending chart, per-project progress breakdown
- **Subscription & Billing**: current plan, plan comparison/upgrade UI, billing history/invoices
- **Team**: members list, member profile (assigned tasks, stats)
- **Admin**: dashboard (stats, MRR), manage users list
- **Profile & Settings**: edit profile, change password, notification/appearance/language
  settings, logout
- **System/error screens**: 404 Not Found, 500 Server Error, No Internet, Maintenance, Access Denied
- **Component library**: Button, Input, Checkbox, Switch rows, SearchBar, OTP input, Avatar/
  AvatarStack, Badge/Chip, StatCard, TaskCard, ProjectCard, EmptyState, Skeleton/Shimmer,
  Snackbar, SectionHeader, ScreenContainer

### Data — now split between live and mock
**Wired to your real backend** (loading states, pull-to-refresh, error + empty states, no
silent mock fallback):
- Workspace context — auto-selects the user's first workspace after login (`GET /workspaces`)
- **Notifications** — full CRUD against `/notifications`, `/notifications/:id/read`, `/notifications/read-all`
- **Projects List & Detail** — `GET /workspaces/:id/spaces`, `GET /spaces/:id`
- **Team Members** — `GET /workspaces/:id/members`
- **Subscription** (current plan only) — `GET /subscription/info`

**Still on mock seed data** (`src/data/mockData.ts`):
- Home Dashboard, Tasks (list/kanban/detail), Calendar, Chat, Time Tracking history,
  Reports, Admin, Billing plans/invoices, Member Profile

**Why not everything**: your backend models tasks under a nested
`workspace → space → list → task` hierarchy with no single "all my tasks" endpoint —
wiring Tasks/Dashboard properly means either adding a list-selection flow or a new
aggregation endpoint, which is a bigger, separate piece of work rather than a drop-in swap.
Chat, Time Tracking history, Reports, Admin, and Billing plans/invoices need their own
endpoint investigation the same way Notifications/Projects/Team just got.


### Not yet built
- Recurring tasks, task history, labels/tags management, advanced filters/sort modal
- Weekly/daily calendar views, create-event flow
- Role/permission management UI, invite-member flow (buttons exist, no working form)
- Voice messages, message search, chat file/media sharing
- Yearly reports, exportable reports
- Payment flow (Stripe/eSewa checkout), plan downgrade flow
- Bottom sheets / action sheets / dropdown-select component (used inline instead)
- Push notification handling (Firebase Messaging), deep linking

## Getting started

```bash
npm install --legacy-peer-deps
npx expo start
```

Set your backend URL in `app.json` under `expo.extra.apiUrl` (use your machine's LAN IP,
not `localhost`, when testing on a physical device via Expo Go), or via `EXPO_PUBLIC_API_URL`.

## Google Sign-In setup

The backend (`Workspace-backend`) already fully supports Google login via Firebase —
`POST /api/auth/google` verifies a Firebase ID token and returns a session, no backend
changes needed. It just requires `FIREBASE_SERVICE_ACCOUNT` to be set in the backend's `.env`.

On mobile, fill in `app.json -> expo.extra`:
1. **`firebase`** — same values as the web app's `NEXT_PUBLIC_FIREBASE_*` env vars.
2. **`google.webClientId`** — from Google Cloud Console → Credentials → OAuth 2.0 Client IDs.
3. **`google.iosClientId`** / **`google.androidClientId`** — only needed for standalone builds.

Until filled in with real values, "Continue with Google" shows a clear inline message
instead of crashing.

## Folder structure

```
src/
  components/ui/     Reusable design-system primitives
  components/cards/  Domain components (TaskCard, ProjectCard, StatCard, Avatar, Badge...)
  navigation/         RootNavigator, AuthNavigator, MainStackNavigator, MainTabNavigator
  screens/auth/       Full authentication flow
  screens/main/       All dashboard/task/project/chat/billing/admin screens
  screens/system/     404 / 500 / network / maintenance / access-denied screens
  services/           API client (axios), authService, firebase
  hooks/              useGoogleAuth
  store/              Zustand auth store (mirrors web app's role/permission model)
  data/               Seed/mock data used until live endpoints are wired
  theme/              Colors, typography, spacing/radius/shadow tokens
  types/              Shared domain types (Task, Project, Member, ...)
```

## Design tokens

White background, near-black text, light-blue primary accent (#4F9DFF) — no
dark mode, per the Planify brand spec. See `src/theme/colors.ts`.
