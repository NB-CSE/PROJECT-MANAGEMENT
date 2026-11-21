# 📊 TaskFlow — Modern Enterprise Project Management Tool

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:181717,50:242424,100:C5F36A&height=200&section=header&text=TaskFlow&fontSize=50&fontColor=ffffff&fontAlignY=38&desc=Full-Stack%20Project%20Management%20%26%20Kanban%20Platform&descAlignY=58&descSize=16" width="100%" />
</p>

<p align="center">
  <a href="https://nb-cse.github.io/PROJECT-MANAGEMENT/">
    <img src="https://img.shields.io/badge/Live_Demo-TaskFlow_Platform-C5F36A?style=for-the-badge&logo=vercel&logoColor=black" />
  </a>
  <a href="https://github.com/NB-CSE/PROJECT-MANAGEMENT">
    <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white" />
  </a>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Database-MongoDB_&_In--Memory-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</p>

---

## 🌟 Overview

**TaskFlow** is a modern, high-performance project management web application built to streamline team workflows, task scheduling, and delivery tracking. Inspired by platforms like Linear, Jira, and Monday.com, TaskFlow brings interactive Kanban drag-and-drop boards, subtask checklists, tag taxonomies, velocity burnup charts, and automated progress calculations together in a sleek, accessible user interface.

### 🌐 Live Platform Access
- **Live Application:** [https://nb-cse.github.io/PROJECT-MANAGEMENT/](https://nb-cse.github.io/PROJECT-MANAGEMENT/)
- **Demo Account:** `alex@taskflow.dev` / `Password123` *(One-click auto-fill available on login)*

---

## ⚡ Core Features

### 1. 📋 Interactive Kanban Board & Workflow Engine
- **4-Stage Pipeline:** Seamlessly move items between `To Do`, `In Progress`, `Review`, and `Completed`.
- **HTML5 Drag & Drop:** Native, responsive card dragging with visual drop zones.
- **Quick Status Changer:** Instant dropdown on each card for rapid mobile touch interaction.
- **Dual View Modes:** Toggle between visual **Kanban Board** and compact tabular **List View**.

### 2. ✅ Subtasks Checklist & Interactive Progress
- **Embedded Subtasks:** Break down complex tasks into bite-sized actionable items.
- **Instant Checkbox Toggles:** Check off subtasks directly from the task card or quick-view drawer.
- **Real-Time Calculation:** Visual progress meter and fraction indicators (e.g. `2/3 checklist done`).

### 3. 🏷️ Tagging System & Advanced Backlog Filters
- Multi-dimensional filtering by:
  - **Category:** Full-Stack Web App, AI & HealthTech, E-Commerce, Frontend Engineering.
  - **Tags:** `#Frontend`, `#Backend`, `#UI/UX`, `#Feature`, `#Bug`, `#DevOps`, `#Testing`, `#AI/ML`.
  - **Urgency / Priority:** `Urgent`, `High`, `Medium`, `Low`.
  - **Assignee:** Assigned to Me, Specific Colleague, or Unassigned.
  - **Deadlines:** Instant toggle for Overdue tasks with color-coded warning badges.

### 4. 📈 Executive Analytics & Productivity Velocity
- **7-Day Delivery Velocity Chart:** Real-time visual comparison of completed vs created tasks day-by-day.
- **Priority Urgency Index:** Interactive workload distribution meter.
- **Team Capacity Matrix:** Tracks assigned active vs completed tasks per team member.
- **One-Click CSV Export:** Export complete project rosters, tasks, assignees, and deadlines to CSV.
- **Demo Data Restoration:** 1-click reset to seed data for testing and demonstrations.

### 5. 👥 Team Collaboration & Member Directory
- **Team Roster:** View member roles, direct email contact, and individual workload.
- **Role Permissions:** Project Lead, Lead Architect, Backend Engineer, Product Designer, DevOps & QA.
- **Team Member Invitation Modal:** Instantly onboard new teammates to the workspace.
- **Activity Stream:** Live audit log tracking status transitions, project creations, and member assignments.

---

## 🏗️ Architecture & Technology Stack

```
TaskFlow Platform
 ├── Frontend (React 18 + Vite + Tailwind CSS)
 │    ├── Context Providers (AuthContext, ToastContext)
 │    ├── Hybrid Storage Adapter (LocalStorage MockStore + REST API Client)
 │    ├── Components (KanbanBoard, TaskCard, TaskDetailModal, StatCard, etc.)
 │    └── Pages (Dashboard, Projects, ProjectDetail, TasksKanban, Team, Settings)
 │
 └── Backend (Node.js + Express)
      ├── Architecture: MVC Pattern with RESTful API
      ├── Database: MongoDB (Mongoose) + Automatic In-Memory Store Fallback
      ├── Authentication: JWT (JSON Web Tokens) + Bcrypt Password Hashing
      └── Endpoints: /api/auth, /api/projects, /api/tasks, /api/dashboard, /api/users
```

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or pnpm
- MongoDB *(Optional — an automatic in-memory database runs if MongoDB is not present)*

### 1. Clone Repository
```bash
git clone https://github.com/NB-CSE/PROJECT-MANAGEMENT.git
cd PROJECT-MANAGEMENT
```

### 2. Run Backend
```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:5050
```

### 3. Run Frontend
```bash
cd ../frontend
npm install
npm run dev
# Frontend runs on http://localhost:5174
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | User authentication & JWT generation |
| `POST` | `/api/auth/register` | Register new user profile |
| `GET` | `/api/dashboard` | Aggregated analytics, velocity data, and activity feed |
| `GET` | `/api/projects` | List projects with status, search, and category filters |
| `POST` | `/api/projects` | Create a new project workspace |
| `GET` | `/api/projects/:id` | Fetch project details with nested tasks |
| `PUT` | `/api/projects/:id` | Update project parameters, deadlines, or members |
| `DELETE` | `/api/projects/:id` | Permanently remove project and cascade delete tasks |
| `GET` | `/api/tasks` | Filter tasks by project, priority, tag, or status |
| `POST` | `/api/tasks` | Create task with subtasks, tags, and deadline |
| `PATCH` | `/api/tasks/:id/status`| Quick transition across Kanban workflow stages |
| `DELETE` | `/api/tasks/:id` | Delete a task |
| `GET` | `/api/users` | List team directory and assigned workload |
| `POST` | `/api/users` | Add / invite new team member |

---

## 👤 Author

**Naresh Behra**
- **GitHub:** [@NB-CSE](https://github.com/NB-CSE)
- **Portfolio:** [nb-cse.github.io/PORTFOLIO](https://nb-cse.github.io/PORTFOLIO/)
- **LinkedIn:** [naresh-b25269381](https://www.linkedin.com/in/naresh-b25269381)

---

<p align="center">
  ⭐ Built with passion for high-performance software engineering.
</p>
