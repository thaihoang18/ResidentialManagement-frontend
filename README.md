# Residential Management — Frontend

A React + Vite web UI for the Residential Management system.

It provides staff-facing pages (dashboard, households, residents, meetings, temporary stay/leave, user management, profile) and a public meeting check-in page for residents (QR flow).

## Tech Stack

- React (Vite)
- React Router
- Tailwind CSS
- Radix UI primitives (Dialog/Popover/Select/etc.)
- TanStack Table
- Recharts

## Requirements

- Node.js (LTS recommended)
- The backend API running locally or reachable over the network

## Configuration

Create a `.env` file in this folder (`ResidentialManagement-frontend/`) and set the API base URL:

```env
VITE_API_URL=http://localhost:5001
```

The app uses `VITE_API_URL` to call backend endpoints like `${VITE_API_URL}/api/auth`.

## Install

```bash
npm install
```

## Run

- Development:

```bash
npm run dev
```

Vite will print the local URL (commonly `http://localhost:5173`).

- Production build:

```bash
npm run build
```

- Preview the production build:

```bash
npm run preview
```

## App Routes (UI)

These routes are defined in `src/App.jsx`:

- `/login` — staff login
- `/` — dashboard (protected)
- `/meeting` — meetings (protected)
- `/household` — household management (protected; leader/deputy)
- `/resident` — resident management (protected; leader/deputy)
- `/temporary` — temporary stay/leave (protected; leader/deputy)
- `/user` — user management (protected; leader only)
- `/profile` — user profile (protected)

Public:

- `/checkin` — public QR check-in entry point (used by residents)

## Authentication Notes

The frontend stores a lightweight user object in `localStorage` under the key `rm_user`.

- Login calls `POST /api/auth` with `{ email, password_hash }`.
- Authorization in the UI is role-based (`leader`, `deputy`, `officer`) via `ProtectedRoute`.

## Common Issues

- **Blank pages / API errors**: confirm `VITE_API_URL` points to the backend, and the backend is running.
- **CORS**: the backend enables CORS for development; if hosting separately, ensure CORS is configured appropriately.

## License

See `LICENSE`.
