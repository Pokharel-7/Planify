# TaskHub — Team Console

Web admin panel for workspace owners/admins to manage their team: invite members, change roles, and remove people from a workspace.

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` and set `VITE_API_URL` to your backend's address:

- If your backend runs locally on the same machine: `http://localhost:5000/api`
- If you're accessing it from another device on your network, use your machine's LAN IP instead of `localhost` (find it with `ipconfig` on Windows), e.g. `http://192.168.1.71:5000/api`

## Run

```bash
npm run dev
```

Opens at `http://localhost:5173`.

## What it does

- **Login** — `POST /api/auth/login`
- **List your workspaces** — `GET /api/workspaces`
- **View members** — `GET /api/workspaces/:id/members`
- **Invite a member** — `POST /api/workspaces/:id/invites`
- **View/cancel pending invites** — `GET` / `DELETE /api/workspaces/:id/invites/:invitationId`
- **Change a member's role** — `PATCH /api/workspaces/:id/members/:userId`
- **Remove a member** — `DELETE /api/workspaces/:id/members/:userId`

Only workspace owners/admins will see meaningful data — regular members can log in but the console assumes an owner/admin is using it (the backend already enforces permission checks on invite/role/remove actions via `requirePermission` middleware).

## Build for production

```bash
npm run build
```

Outputs static files to `dist/` — deploy to any static host (Vercel, Netlify, Render static site, etc.) and set `VITE_API_URL` to your deployed backend's URL.
