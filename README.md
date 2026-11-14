# TaskFlow — Modern Full-Stack Project Management Web Application

TaskFlow is a professional full-stack project management web application engineered to help teams create projects, organize tasks, assign team members, set deadlines, monitor real-time progress, and streamline work from a single unified dashboard.

---

## 🚀 Key Features

- **Authentication & Security:**
  - Secure user registration and login with bcrypt password hashing.
  - Stateless JWT (JSON Web Token) authentication with HTTP-safe bearer authorization headers.
  - Granular role and membership permission checks ensuring users only access authorized projects.
  - Rate limiting, security headers via Helmet, and sanitized inputs.

- **Main Executive Dashboard:**
  - Real-time KPI statistics: Total Projects, Active Projects, Completed Tasks, and Overdue Tasks.
  - Task status distribution breakdown (*To Do*, *In Progress*, *Review*, *Completed*).
  - Upcoming deadlines widget with overdue indicators.
  - Live activity feed showing team actions and audit logs.
  - Quick action modals for creating projects and tasks anywhere in the workspace.

- **Project Management:**
  - Create, view, edit, and delete projects with confirmation dialogs.
  - Set project start dates and target delivery deadlines.
  - Automatic progress tracking calculated dynamically from database task records.
  - Filter projects by status (*Active*, *Planning*, *On Hold*, *Completed*) and real-time search by name.
  - Manage team membership: Add registered members by email or directory, assign roles, and remove members.

- **Interactive Kanban Task Board & List Views:**
  - Create, edit, and delete tasks with priorities (*Low*, *Medium*, *High*, *Urgent*).
  - Kanban board with HTML5 drag-and-drop support across 4 columns: *To Do*, *In Progress*, *Review*, and *Completed*.
  - Task search, filters by project, priority, assignee ("Assigned to Me", "Unassigned"), and overdue toggle.
  - Quick status dropdown on every card for frictionless status transitions.

- **Team Collaboration & Audit Logging:**
  - Directory of registered team members with roles and workspace joined dates.
  - Live activity audit log capturing project creation, task assignments, and stage transitions.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router v6, Tailwind CSS, Lucide React, date-fns |
| **Backend** | Node.js, Express.js, Mongoose ODM |
| **Database** | MongoDB Atlas (Cloud) / Local MongoDB |
| **Authentication** | JWT (jsonwebtoken), bcryptjs |
| **Security** | Helmet, Express Rate Limit, CORS |
| **Deployment** | Vercel / Netlify (Frontend), Render / Railway (Backend), GitLab (CI/CD) |

---

## 🎨 UI/UX Design Specifications

Adheres strictly to the PRD modern, minimal palette:
- **Background:** Off-white (`#F7F7F2`)
- **Primary Text:** Charcoal (`#242424`)
- **Accent:** Lime green (`#C5F36A`)
- **Secondary Surfaces / Cards:** Clean White (`#FFFFFF`)
- **Typography:** Plus Jakarta Sans / Inter
- Subtle card elevations, micro-animations, and responsive layout across desktop, tablet, and mobile.

---

## 📁 Repository Structure

```
PROJECT_MANAGEMENT/
├── .gitlab-ci.yml              # GitLab CI/CD pipeline definition
├── .gitignore                  # Git ignore rules for node_modules & credentials
├── package.json                # Root package script runner
├── README.md                   # Project documentation
│
├── backend/                    # Node.js + Express API
│   ├── .env.example            # Backend environment template
│   ├── package.json
│   └── src/
│       ├── config/
│       │   └── db.js           # MongoDB connection configuration
│       ├── controllers/
│       │   ├── activityController.js
│       │   ├── authController.js
│       │   ├── dashboardController.js
│       │   ├── projectController.js
│       │   ├── taskController.js
│       │   └── userController.js
│       ├── middleware/
│       │   ├── auth.js         # JWT verification middleware
│       │   └── errorHandler.js # Global error handler
│       ├── models/
│       │   ├── Activity.js     # Activity audit model
│       │   ├── Project.js      # Project model
│       │   ├── Task.js         # Task model
│       │   └── User.js         # User model
│       ├── routes/
│       │   ├── activityRoutes.js
│       │   ├── authRoutes.js
│       │   ├── dashboardRoutes.js
│       │   ├── projectRoutes.js
│       │   ├── taskRoutes.js
│       │   └── userRoutes.js
│       ├── seed.js             # Sample database seeder
│       └── server.js           # Express application entrypoint
│
└── frontend/                   # React + Vite application
    ├── .env.example            # Frontend environment template
    ├── index.html              # HTML shell with Google Fonts
    ├── netlify.toml            # Netlify SPA routing rules
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js      # Custom theme tokens & palette
    ├── vercel.json             # Vercel SPA rewrites
    ├── vite.config.js          # Vite config & dev server proxy
    └── src/
        ├── App.jsx             # Route definitions & protection
        ├── index.css           # Tailwind base styles
        ├── main.jsx            # React root mount
        ├── components/
        │   ├── ActivityFeed.jsx
        │   ├── AssignMemberModal.jsx
        │   ├── ConfirmModal.jsx
        │   ├── CreateProjectModal.jsx
        │   ├── CreateTaskModal.jsx
        │   ├── KanbanBoard.jsx
        │   ├── Layout.jsx
        │   ├── Modal.jsx
        │   ├── Navbar.jsx
        │   ├── ProgressBar.jsx
        │   ├── ProjectCard.jsx
        │   ├── Sidebar.jsx
        │   ├── StatCard.jsx
        │   └── TaskCard.jsx
        ├── context/
        │   ├── AuthContext.jsx
        │   └── ToastContext.jsx
        ├── pages/
        │   ├── Dashboard.jsx
        │   ├── Login.jsx
        │   ├── ProjectDetail.jsx
        │   ├── Projects.jsx
        │   ├── Register.jsx
        │   ├── Settings.jsx
        │   ├── TasksKanban.jsx
        │   └── Team.jsx
        └── services/
            └── api.js          # Fetch API client with JWT interceptor
```

---

## ⚡ Getting Started Locally

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** (Local instance running at `mongodb://127.0.0.1:27017` or a free MongoDB Atlas cloud URI)
- **Git**

### 2. Clone the Repository
```bash
git clone <your-gitlab-repository-url>
cd PROJECT_MANAGEMENT
```

### 3. Backend Setup
1. Open the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Configure your `.env` variables:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://127.0.0.1:27017/taskflow # Or your MongoDB Atlas URI
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   ```
5. *(Optional)* Seed demo data:
   ```bash
   npm run seed
   ```
   *Creates demo accounts, projects, Kanban tasks, and activity logs.*
   - **Default login:** `alex@taskflow.dev`
   - **Default password:** `Password123`

6. Start backend development server:
   ```bash
   npm start
   # Server runs on http://localhost:5000
   ```

### 4. Frontend Setup
1. In a separate terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. For local development, leave `VITE_API_URL` empty to let Vite proxy requests to `http://localhost:5000`:
   ```env
   VITE_API_URL=
   ```
5. Start frontend development server:
   ```bash
   npm run dev
   # App opens on http://localhost:5173
   ```

---

## 🌐 API Reference

### Authentication
- `POST /api/auth/register` — Register a new account (`name`, `email`, `password`)
- `POST /api/auth/login` — Sign in (`email`, `password`)
- `GET /api/auth/me` — Get current user profile *(Protected)*
- `PUT /api/auth/profile` — Update user details or password *(Protected)*

### Projects
- `GET /api/projects` — List accessible projects with dynamic task stats (`?search=&status=`) *(Protected)*
- `GET /api/projects/:id` — Retrieve single project details *(Protected)*
- `POST /api/projects` — Create a project (`name`, `description`, `startDate`, `deadline`, `status`) *(Protected)*
- `PUT /api/projects/:id` — Update project metadata *(Protected)*
- `DELETE /api/projects/:id` — Delete project and cascade delete tasks *(Protected, Owner only)*
- `POST /api/projects/:id/members` — Add registered member by `userId` or `email` *(Protected, Owner only)*
- `DELETE /api/projects/:id/members/:userId` — Remove member from project *(Protected, Owner only)*

### Tasks
- `GET /api/tasks` — List tasks with filters (`?projectId=&assignedTo=&priority=&status=&search=&overdue=true`) *(Protected)*
- `GET /api/tasks/:id` — Get task by ID *(Protected)*
- `POST /api/tasks` — Create new task (`title`, `description`, `projectId`, `assignedTo`, `priority`, `status`, `dueDate`) *(Protected)*
- `PUT /api/tasks/:id` — Update task details *(Protected)*
- `PATCH /api/tasks/:id/status` — Quick status transition for Kanban drag-and-drop (`status`) *(Protected)*
- `DELETE /api/tasks/:id` — Delete task *(Protected)*

### Dashboard & Team
- `GET /api/dashboard` — Aggregated workspace KPIs, recent projects, upcoming deadlines, and activity logs *(Protected)*
- `GET /api/users` — Directory of registered users for member invites and task assignees *(Protected)*
- `GET /api/activities` — Recent audit log events (`?projectId=&limit=`) *(Protected)*
- `GET /api/health` — System status check *(Public)*

---

## ☁️ Production Deployment Guide

### 1. MongoDB Atlas (Cloud Database)
1. Sign in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Create a free **M0 cluster**.
3. Under **Database Access**, create a database user and record the username and password.
4. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) so hosting platforms can connect.
5. In **Database** > **Connect**, choose **Connect your application** and copy the URI string:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/taskflow?retryWrites=true&w=majority`

### 2. Backend Deployment (Render)
1. Sign in to [Render](https://render.com/).
2. Create a **New Web Service** connected to your GitLab repository.
3. Configure the service:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
4. Add the following **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGODB_URI`: `<Your MongoDB Atlas connection URI>`
   - `JWT_SECRET`: `<A strong random secret string>`
   - `CLIENT_URL`: `<Your production frontend URL, e.g. https://your-taskflow.netlify.app>`
5. Click **Create Web Service**. Note the deployed backend URL (e.g. `https://taskflow-api.onrender.com`).

### 3. Frontend Deployment (Netlify or Vercel)

#### Deploying on Netlify:
1. Connect your GitLab repository in [Netlify](https://app.netlify.com/).
2. Set build settings:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Add **Environment Variables**:
   - `VITE_API_URL`: `https://taskflow-api.onrender.com/api` (your deployed backend URL)
4. Deploy the site. SPA redirects are handled automatically via `frontend/netlify.toml`.

#### Deploying on Vercel:
1. Import your GitLab project in [Vercel](https://vercel.com/).
2. Set **Root Directory** to `frontend`.
3. Framework preset: **Vite**.
4. Add Environment Variable:
   - `VITE_API_URL`: `https://taskflow-api.onrender.com/api`
5. Deploy. SPA redirects are handled via `frontend/vercel.json`.

---

## 🦊 GitLab CI/CD Pipeline

The included `.gitlab-ci.yml` file automates validation on every commit:
1. **install_dependencies:** Installs and caches dependencies for backend and frontend.
2. **test_and_lint:** Verifies backend syntax and module imports.
3. **build_frontend:** Compiles the React + Vite production bundle and stores artifacts.

To push to GitLab:
```bash
git remote add origin https://gitlab.com/<username>/taskflow.git
git add .
git commit -m "feat: complete full-stack TaskFlow project management application"
git push -u origin main
```

---

## 🔒 Security Best Practices Implemented

- Passwords are never stored in plaintext — securely salted and hashed with **bcryptjs**.
- Database connection strings and JWT signing secrets are stored exclusively in environment variables.
- Sensitive environment files (`.env`, `.env.local`) are strictly excluded via `.gitignore`.
- Rate limiting prevents brute force attacks on authentication endpoints.
- Authorization middleware enforces project ownership for administrative actions like project deletion and member removal.
