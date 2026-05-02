# TaskFlow — Team Task Manager

A full-stack team task management application with role-based access control (Admin/Member), built with Node.js + Express + MongoDB (backend) and React + Vite (frontend).

---

## Architecture

```
task-manager/
├── backend/       → Node.js + Express + MongoDB REST API
└── frontend/      → React + Vite SPA
```

```
Client (React SPA :5173)
        ↕  HTTP + cookies (Vite proxy in dev)
  Express Server (:8000)
        ↕
  MongoDB Atlas
```

---

## Features

- **Authentication** — Register, Login, Logout with JWT (HTTP-only cookies + refresh token rotation)
- **Project Management** — Create projects, view all your projects
- **Team Management** — Add/remove members, assign Admin or Member roles
- **Task Management** — Create, assign, filter, and delete tasks
- **Role-Based Access Control**
  - `Admin` — Full access: create/delete tasks, manage members, update everything
  - `Member` — Can view tasks and update task status only
- **Dashboard** — Live stats: total, todo, in-progress, completed, overdue tasks
- **Overdue Detection** — Tasks past due date highlighted in red

---

## Quick Start (Local)

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)

### 1. Backend

```bash
cd backend
npm install
cp .env.sample .env
# Fill in your MONGODB_URI and generate secrets (see below)
npm run dev
# Server runs on http://localhost:8000
```

**Generate secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Run 3 times — use outputs for `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

> Vite proxies `/api` to `http://localhost:8000` automatically.

---

## Environment Variables

### Backend `.env`
```env
PORT=8000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net
DB_NAME=task_manager
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=<generated>
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=<generated>
REFRESH_TOKEN_EXPIRY=7d
NODE_ENV=development
```

---

## API Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | Public | Register |
| POST | `/api/v1/auth/login` | Public | Login |
| POST | `/api/v1/auth/logout` | Auth | Logout |
| GET | `/api/v1/auth/me` | Auth | Current user |
| POST | `/api/v1/auth/refresh-token` | Public | Refresh tokens |
| GET | `/api/v1/health` | Public | Health check |
| POST | `/api/v1/projects` | Auth | Create project |
| GET | `/api/v1/projects` | Auth | My projects |
| GET | `/api/v1/projects/:id` | Member | Project detail |
| DELETE | `/api/v1/projects/:id` | Admin | Delete project |
| POST | `/api/v1/projects/:id/members` | Admin | Add member by email |
| DELETE | `/api/v1/projects/:id/members/:uid` | Admin | Remove member |
| PATCH | `/api/v1/projects/:id/members/:uid/role` | Admin | Change member role |
| GET | `/api/v1/projects/:id/dashboard` | Member | Stats |
| POST | `/api/v1/projects/:id/tasks` | Admin | Create task |
| GET | `/api/v1/projects/:id/tasks` | Member | List tasks (filter by status/priority) |
| GET | `/api/v1/projects/:id/tasks/:tid` | Member | Get task |
| PATCH | `/api/v1/projects/:id/tasks/:tid` | Member | Update task |
| DELETE | `/api/v1/projects/:id/tasks/:tid` | Admin | Delete task |

---

## Deployment (Railway)

### Backend on Railway
1. Push `backend/` to GitHub
2. New Railway project → Deploy from GitHub
3. Set all env vars (same as `.env` but `NODE_ENV=production`, `CORS_ORIGIN=<your-frontend-url>`)
4. Railway auto-detects Node.js and runs `npm start`

### Frontend on Vercel
1. Push `frontend/` to GitHub
2. Import on Vercel
3. Set `VITE_API_URL=https://your-railway-backend.up.railway.app/api/v1`
4. Update `frontend/src/api/axios.js` baseURL to use `import.meta.env.VITE_API_URL`

---

## Security
- Passwords hashed with bcrypt (12 rounds)
- JWT stored in HTTP-only cookies (XSS-safe)
- Refresh token rotation on every refresh
- CORS restricted to frontend origin
- Role checks on every protected route
- Members cannot escalate their own permissions

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Node.js, Express.js, MongoDB, Mongoose |
| Auth | JWT (access + refresh tokens), bcrypt |
| Frontend | React 18, Vite, React Router v6 |
| HTTP | Axios with auto-refresh interceptor |
| Deployment | Railway (backend), Vercel (frontend) |
