# CodeArena — Code. Compete. Conquer.

> A gamified coding challenge platform built on the **MEAN Stack** (MongoDB, Express.js, Angular, Node.js) with Monaco Editor, sandboxed code execution, real-time 1v1 coding battles, dynamic XP & leveling system, streak tracking, achievements, and global leaderboards.

---

## 1. Project Overview

**CodeArena** is designed to sharpen algorithmic problem solving in a high-stakes, competitive, and rewarding environment. Every submission is analyzed against test cases in an isolated sandbox, awarding XP and updating streaks in real-time. Developers can battle head-to-head in 1v1 Arena Duels, track their progress with charts, unlock milestone achievements, and compete for top ranks on the global leaderboard.

---

## 2. Key Features

- **Gamified Progression**:
  - Algorithmic XP engine: Beginner (20 XP), Easy (50 XP), Medium (100 XP), Hard (200 XP), Expert (500 XP).
  - Dynamic level calculations: Level 1 to Level 10+ based on algorithmic milestones.
  - Active Daily Streak system with continuous activity tracking.
- **Monaco Code Editor**:
  - Full IDE experience with syntax highlighting, line numbers, dark theme, copy, reset, and font sizing.
  - Multi-language support: JavaScript, Python, Java, C++, and C.
- **Sandboxed Code Execution**:
  - Secure child-process runner with timeout limits (2500ms), memory limits, and isolated test case execution.
  - `POST /api/submissions/run` for non-destructive sample test runs.
  - `POST /api/submissions/submit` for comprehensive public and hidden test case verification.
- **1v1 Coding Battle Arena**:
  - Create or join battle rooms with unique room codes.
  - Real-time opponent tracking, test case completion race, countdown timers, and victory awards.
- **Global & Tiered Leaderboards**:
  - Filter by Global, Weekly, and Monthly rankings.
  - Computed from live MongoDB metrics (XP, solved count, streak).
- **Interactive User Dashboard & Analytics**:
  - Solved problems breakdown by difficulty and category.
  - Interactive progress chart (powered by Chart.js).
  - Daily challenge retrieval (`GET /api/problems/daily`).
  - Recent submissions list with execution times and memory metrics.
- **Admin Dashboard**:
  - User management: search, filter by role, view statistics, promote/demote roles, delete accounts.
  - Problem creation & editing with multiple test cases, hidden cases, starter code, constraints, and hints.
  - Submissions monitor across all users and languages.
  - System statistics (total users, acceptance rate, total battles).
- **Animated Background**:
  - Reusable background with floating particles, connecting grid, and code tokens (`< >`, `{ }`, `[ ]`, `const`, `function`, `if`, `=>`, `0101`).

---

## 3. Tech Stack

- **Frontend**: Angular 17+ / Reactive Forms / RxJS / Monaco Editor / Chart.js / Tailwind CSS / Lucide Icons
- **Backend**: Node.js / Express.js / Mongoose / JWT / Bcryptjs / Helmet / Express-Rate-Limit / CORS
- **Database**: MongoDB (Database name: `codearena`)
- **Code Execution**: Sandboxed Subprocess Runner / Judge0 compatible integration

---

## 4. Architecture

```text
       [ Angular Client / Web App ]
                   │
                   ▼  (HttpClient with AuthInterceptor)
       [ Express.js REST API Server ]
                   │
       ┌───────────┴───────────┐
       ▼                       ▼
[ MongoDB Database ]   [ Sandboxed Execution ]
(Mongoose Models)     (Node/Python Isolated Runner)
- Users                - Public & Hidden Tests
- Problems             - Time & Memory Limits
- Submissions          - Stdout/Stderr capture
- Battles
- Achievements
- Notifications
```

---

## 5. Folder Structure

```text
CodeArena/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── config.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── problemController.js
│   │   │   ├── submissionController.js
│   │   │   ├── leaderboardController.js
│   │   │   ├── achievementController.js
│   │   │   ├── battleController.js
│   │   │   ├── notificationController.js
│   │   │   └── adminController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── admin.js
│   │   │   ├── errorHandler.js
│   │   │   └── rateLimiter.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Problem.js
│   │   │   ├── Submission.js
│   │   │   ├── Achievement.js
│   │   │   ├── UserAchievement.js
│   │   │   ├── Battle.js
│   │   │   ├── BattleParticipant.js
│   │   │   └── Notification.js
│   │   ├── routes/
│   │   ├── services/
│   │   │   ├── executionService.js
│   │   │   ├── gamificationService.js
│   │   │   └── streakService.js
│   │   ├── utils/
│   │   └── app.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── core/
│   │       │   ├── guards/
│   │       │   ├── interceptors/
│   │       │   ├── models/
│   │       │   └── services/
│   │       ├── features/
│   │       │   ├── landing/
│   │       │   ├── dashboard/
│   │       │   ├── challenges/
│   │       │   ├── problem-detail/
│   │       │   ├── battle/
│   │       │   ├── leaderboard/
│   │       │   ├── profile/
│   │       │   └── admin/
│   │       └── shared/
│   ├── angular.json
│   └── package.json
│
├── server.ts             # Unified full-stack development & production server
└── README.md
```

---

## 6. Environment Variables

### Backend (`.env`)
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/codearena
JWT_SECRET=super_secret_jwt_key_replace_in_production
CLIENT_URL=http://localhost:4200
JUDGE0_URL=
NODE_ENV=development
```

### Frontend (`src/environments/environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

---

## 7. API Endpoints

### Authentication
- `POST /api/auth/register`: Create a new user account.
- `POST /api/auth/login`: Authenticate and receive JWT token.
- `POST /api/auth/logout`: Log out user.
- `GET /api/auth/me`: Get current authenticated user profile.

### Problems
- `GET /api/problems`: Filter by category, difficulty, language, and search.
- `GET /api/problems/daily`: Retrieve today's daily challenge.
- `GET /api/problems/:id`: Retrieve problem details and starter code.

### Code Submissions & Sandbox
- `POST /api/submissions/run`: Test code against public test cases.
- `POST /api/submissions/submit`: Validate against all test cases, award XP, update streaks.
- `GET /api/submissions`: User submission history.

### Battles
- `POST /api/battles`: Create a 1v1 battle arena.
- `GET /api/battles`: List open and active battles.
- `GET /api/battles/:id`: Retrieve battle status and participants.
- `POST /api/battles/:id/join`: Join a battle room.
- `POST /api/battles/:id/submit`: Submit battle code.

### Leaderboard & Achievements
- `GET /api/leaderboard`: Rank users globally, weekly, or monthly.
- `GET /api/achievements`: All available badges.
- `GET /api/users/achievements`: User's unlocked badges.

### Admin
- `GET /api/admin/users`: Search, filter, and inspect users.
- `PUT /api/admin/users/:id`: Change user role or bio.
- `DELETE /api/admin/users/:id`: Delete a user account.
- `GET /api/admin/problems`: Manage coding challenges.
- `POST /api/admin/problems`: Create new algorithmic challenge.
- `PUT /api/admin/problems/:id`: Update challenge metadata.
- `DELETE /api/admin/problems/:id`: Remove challenge.
- `GET /api/admin/statistics`: Overview metrics.

---

## 8. Development Accounts (Seed Data)

To seed development data:
```bash
npm run seed
```

Default credentials:
- **Admin**:
  - Email: `admin@codearena.dev`
  - Password: `AdminPass123!`
- **Member**:
  - Email: `alex@codearena.dev`
  - Password: `CoderPass123!`

---

## 9. Running the Application

### Option A: Unified Dev Server (Interactive Preview)
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the application.

### Option B: Separate Backend & Frontend
#### Run Backend
```bash
cd backend
npm install
npm run dev
```
#### Run Frontend
```bash
cd frontend
npm install
ng serve
```
Open [http://localhost:4200](http://localhost:4200) to access the Angular application.
