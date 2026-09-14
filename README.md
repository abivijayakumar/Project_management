# Pulse | Full-Stack MERN Project Management System

Pulse is an enterprise-grade, secure, and responsive Project Management System built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). Designed following clean architecture principles, it provides robust multi-tenant authorization, real-time analytics, automated data cascade strategies, and end-to-end automated test suites.

---

## Table of Contents
1. [Key Features](#key-features)
2. [Technology Stack](#technology-stack)
3. [Architecture & System Design](#architecture--system-design)
4. [Entity Relationship & Data Modeling](#entity-relationship--data-modeling)
5. [Security & Multi-Tenant Isolation](#security--multi-tenant-isolation)
6. [Folder Structure](#folder-structure)
7. [Getting Started & Installation](#getting-started--installation)
8. [Database Setup (Atlas & Local)](#database-setup)
9. [Environment Variables](#environment-variables)
10. [API Documentation](#api-documentation)
11. [Automated Testing](#automated-testing)
12. [Docker & Containerized Deployment](#docker--containerized-deployment)
13. [Interview Architecture Talking Points](#interview-architecture-talking-points)

---

## Key Features

- **Robust Authentication**: Secure registration, login, and token expiration handling using JWT and bcrypt password hashing (10 salt rounds).
- **Multi-Tenant Ownership & Strict Authorization**: Every project is strictly bound to its creator (`userId`). Every task is bound to a project (`projectId`). User A cannot read, edit, delete, or inject tasks into User B's projects.
- **Cascading Deletion Strategy**: Controlled application-level cleanup ensures that deleting a project cleans up all associated child tasks immediately (`Task.deleteMany({ projectId })`).
- **Telemetry & Aggregated Dashboard**: High-speed analytics computing total projects, active projects, total tasks, completed tasks, and completion rate for the authenticated user via MongoDB aggregation.
- **Search & Multi-Dimensional Filtering**: Search projects and tasks by name (with RegEx sanitization preventing ReDoS), filter by status (`Not Started`, `In Progress`, `Completed`), and filter by priority (`Low`, `Medium`, `High`).
- **Responsive UI/UX**: Custom modern design system featuring glassmorphic navigation, reactive cards, priority badges, loading skeletons, and interactive modal dialogs.
- **Enterprise Security**: Helmet HTTP headers, CORS whitelisting, brute-force rate limiting on auth endpoints, and centralized error handling that preserves error status codes while preventing stack trace leaks.

---

## Technology Stack

### Frontend
- **React.js (v18)**: Component-driven UI library
- **Vite (v5)**: High-speed build tool and dev server
- **React Router (v6)**: Client-side routing with `ProtectedRoute` guards
- **Axios**: HTTP client with request/response interceptors for JWT injection and 401 handling
- **Context API (`AuthContext`)**: Global authentication state and session recovery
- **Lucide React**: Lightweight icon library
- **Vanilla Modern CSS**: Custom design system with CSS custom properties, responsive grids, and micro-interactions

### Backend
- **Node.js & Express.js**: RESTful API server with clean architectural separation
- **JWT (`jsonwebtoken`)**: Stateless token-based authentication
- **bcryptjs**: One-way salt hashing for passwords
- **express-validator**: Schema and input validation middleware
- **Helmet**: Secures Express apps by setting various HTTP headers
- **CORS**: Cross-Origin Resource Sharing configuration
- **express-rate-limit**: Brute-force protection for authentication endpoints
- **Morgan**: Structured HTTP request logger

### Database & Testing
- **MongoDB & Mongoose ODM (v8)**: Document database with schema enforcement, compound indexes, and aggregation pipelines
- **MongoDB Atlas**: Cloud database support
- **mongodb-memory-server**: Embedded database for 100% offline, zero-dependency automated test execution
- **Jest & Supertest**: End-to-end integration and security test suites

---

## Architecture & System Design

Pulse adheres to **Clean Layered Architecture** on the backend:

```
[ HTTP Request ]
       │
       ▼
[ Security Middlewares ] (Helmet, CORS, Rate Limit, Express JSON)
       │
       ▼
[ Route Definitions ] (authRoutes, projectRoutes, taskRoutes, dashboardRoutes)
       │
       ▼
[ Validation Middleware ] (express-validator)
       │
       ▼
[ Auth Middleware ] (JWT verification & req.user extraction)
       │
       ▼
[ Controller Layer ] (Request unpacking & HTTP response formatting)
       │
       ▼
[ Service Layer ] (Domain logic, ownership verification, cascading operations)
       │
       ▼
[ Mongoose Models ] (User, Project, Task schemas & indexes)
       │
       ▼
[ MongoDB Database ]
```

---

## Entity Relationship & Data Modeling

Although MongoDB is a NoSQL document database, data relationships are defined using **MongoDB `ObjectId` references** with bidirectional integrity enforced at the service layer:

```
┌──────────────────────────────────────┐
│                User                  │
├──────────────────────────────────────┤
│ _id: ObjectId (PK)                   │
│ fullName: String                     │
│ email: String (Indexed, Unique)      │
│ password: String (Hashed, Excluded)  │
│ createdAt: Date                      │
│ updatedAt: Date                      │
└──────────────────┬───────────────────┘
                   │
                   │ 1 : N (Owns)
                   ▼
┌──────────────────────────────────────┐
│               Project                │
├──────────────────────────────────────┤
│ _id: ObjectId (PK)                   │
│ userId: ObjectId (FK -> User._id)    │
│ name: String                         │
│ description: String                  │
│ status: 'Not Started'|'In Progress'| │
│         'Completed'                  │
│ startDate: Date                      │
│ endDate: Date                        │
│ createdAt: Date                      │
│ updatedAt: Date                      │
└──────────────────┬───────────────────┘
                   │
                   │ 1 : N (Contains)
                   ▼
┌──────────────────────────────────────┐
│                 Task                 │
├──────────────────────────────────────┤
│ _id: ObjectId (PK)                   │
│ projectId: ObjectId (FK -> Project)  │
│ name: String                         │
│ description: String                  │
│ priority: 'Low' | 'Medium' | 'High'  │
│ status: 'Pending' | 'In Progress' |  │
│         'Completed'                  │
│ dueDate: Date                        │
│ createdAt: Date                      │
│ updatedAt: Date                      │
└──────────────────────────────────────┘
```

### MongoDB Indexes
- **User Collection**:
  - `{ email: 1 }` (unique lookup index)
- **Project Collection**:
  - `{ userId: 1, status: 1 }` (compound index for user-filtered status queries)
  - `{ userId: 1, name: 1 }` (compound index for user-scoped project search)
  - `{ userId: 1, createdAt: -1 }` (for recent project sorting)
- **Task Collection**:
  - `{ projectId: 1, status: 1 }` (compound index for project task status queries)
  - `{ projectId: 1, priority: 1 }` (compound index for task priority ordering)
  - `{ projectId: 1, dueDate: 1 }` (for upcoming deadline indexing)

---

## Security & Multi-Tenant Isolation

### 1. Never Trust Frontend IDs
The application **never trusts a `userId` supplied in the request body or query parameter**. The authenticated user ID is extracted strictly from the cryptographically verified JWT payload inside `authMiddleware.js`:
```javascript
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = await User.findById(decoded.id).select('-password');
```

### 2. Strict Project & Task Ownership Checks
Before modifying, reading, or deleting any project or task:
1. The project or task is fetched.
2. The service verifies `project.userId.toString() === req.user._id.toString()`.
3. If unequal, a `403 Forbidden` response is returned immediately.

### 3. Query Sanitization & Safe RegEx
To prevent Regular Expression Denial of Service (ReDoS) attacks, user search terms are escaped before passing to Mongoose queries:
```javascript
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
```

### 4. Rate Limiting
Authentication endpoints (`/api/auth/register`, `/api/auth/login`) are capped at 30 requests per 15-minute window per IP to eliminate credential-stuffing and brute-force password guessing.

---

## Folder Structure

```
Assignment/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # Database connection logic
│   │   ├── controllers/
│   │   │   ├── authController.js     # Auth request handlers
│   │   │   ├── projectController.js  # Project request handlers
│   │   │   ├── taskController.js     # Task request handlers
│   │   │   └── dashboardController.js# Telemetry request handlers
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # JWT Bearer token protection
│   │   │   ├── errorMiddleware.js    # Centralized error handler
│   │   │   └── validationMiddleware.js# express-validator evaluation
│   │   ├── models/
│   │   │   ├── User.js               # User Mongoose model
│   │   │   ├── Project.js            # Project Mongoose model
│   │   │   └── Task.js               # Task Mongoose model
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # /api/auth routes
│   │   │   ├── projectRoutes.js      # /api/projects routes
│   │   │   ├── taskRoutes.js         # /api/tasks routes
│   │   │   └── dashboardRoutes.js    # /api/dashboard routes
│   │   ├── services/
│   │   │   ├── authService.js        # Auth business logic
│   │   │   ├── projectService.js     # Project logic & cascade cleanup
│   │   │   ├── taskService.js        # Task logic & project verification
│   │   │   └── dashboardService.js   # Aggregation pipeline analytics
│   │   ├── validators/
│   │   │   ├── authValidator.js      # Auth validation rules
│   │   │   ├── projectValidator.js   # Project validation rules
│   │   │   └── taskValidator.js      # Task validation rules
│   │   └── utils/
│   │       ├── generateToken.js      # JWT generator
│   │       └── sanitize.js           # Safe regex utility
│   ├── tests/
│   │   ├── setup.js                  # In-memory Mongo setup
│   │   ├── auth.test.js              # Auth test suite
│   │   ├── projects.test.js          # Projects test suite
│   │   ├── tasks.test.js             # Tasks test suite
│   │   └── security.test.js          # Ownership isolation test suite
│   ├── app.js                        # Express application setup
│   ├── server.js                     # Server entrypoint
│   ├── Dockerfile                    # Backend Docker container
│   ├── .env.example                  # Environment variable template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Top navigation bar
│   │   │   ├── Sidebar.jsx           # Sidebar drawer
│   │   │   ├── ProjectCard.jsx       # Project preview card
│   │   │   ├── TaskCard.jsx          # Task preview card
│   │   │   ├── StatusBadge.jsx       # Status indicator badge
│   │   │   ├── PriorityBadge.jsx     # Priority indicator badge
│   │   │   ├── LoadingSpinner.jsx    # Loading spinner
│   │   │   └── ConfirmDialog.jsx     # Modal confirmation
│   │   ├── pages/
│   │   │   ├── Login.jsx             # User login
│   │   │   ├── Register.jsx          # User registration
│   │   │   ├── Dashboard.jsx         # Analytics dashboard
│   │   │   ├── Projects.jsx          # Projects catalog & filters
│   │   │   ├── ProjectDetails.jsx    # Project view & embedded tasks
│   │   │   ├── CreateProject.jsx     # Project creation form
│   │   │   ├── EditProject.jsx       # Project editing form
│   │   │   ├── Tasks.jsx             # Task manager & filters
│   │   │   ├── CreateTask.jsx        # Task creation form
│   │   │   └── EditTask.jsx          # Task editing form
│   │   ├── services/
│   │   │   ├── api.js                # Axios client with interceptors
│   │   │   ├── authService.js        # Auth API endpoints
│   │   │   ├── projectService.js     # Project API endpoints
│   │   │   ├── taskService.js        # Task API endpoints
│   │   │   └── dashboardService.js   # Dashboard API endpoint
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # React Auth context
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx    # Route authentication guard
│   │   ├── hooks/
│   │   │   └── useDebounce.js        # Search input debouncer
│   │   ├── utils/
│   │   │   └── formatDate.js        # Date utilities
│   │   ├── index.css                 # Design system styles
│   │   ├── App.jsx                   # Application layout & routes
│   │   └── main.jsx                  # React DOM root
│   ├── Dockerfile                    # Frontend Docker container
│   └── package.json
│
├── docker-compose.yml                # Multi-container orchestration
└── README.md                         # Full documentation
```

---

## Getting Started & Installation

### Prerequisites
- **Node.js**: v18.x or v20+
- **npm**: v9+
- **MongoDB**: Local MongoDB instance OR MongoDB Atlas connection string (Note: Automated tests run out-of-the-box with embedded in-memory MongoDB without requiring an external DB).

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env if you have a custom MongoDB Atlas connection string
npm run dev
```
The backend will run on `http://localhost:5000`.

### 2. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
The frontend will start at `http://localhost:5173`.

---

## Database Setup

### Option A: MongoDB Atlas (Recommended for Cloud / Production)
1. Navigate to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free M0 cluster.
2. In **Database Access**, create a database user and password.
3. In **Network Access**, whitelist your IP or add `0.0.0.0/0`.
4. Click **Connect** -> **Connect your application** -> Copy connection URI.
5. Paste the URI into `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/project_management?retryWrites=true&w=majority
   ```

### Option B: Local MongoDB
Ensure your local MongoDB daemon is running:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/project_management
```

---

## Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/project_management
JWT_SECRET=super_secret_jwt_key_project_management_2026_dev
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## API Documentation

All protected endpoints require the HTTP header:
`Authorization: Bearer <token>`

### Authentication Endpoints
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT | Public |
| `POST` | `/api/auth/logout` | Invalidate client session | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Private |

### Project Endpoints
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/projects` | Get user projects (`?search=&status=`) | Private |
| `GET` | `/api/projects/:id` | Get project details & child tasks | Private |
| `POST` | `/api/projects` | Create new project | Private |
| `PUT` | `/api/projects/:id` | Update project (name, status, dates) | Private |
| `DELETE` | `/api/projects/:id` | Cascade delete project & its tasks | Private |

### Task Endpoints
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/tasks` | Get user tasks (`?search=&status=&priority=&projectId=`) | Private |
| `GET` | `/api/tasks/:id` | Get task details | Private |
| `POST` | `/api/tasks` | Create task inside owned project | Private |
| `PUT` | `/api/tasks/:id` | Update task or toggle completion | Private |
| `DELETE` | `/api/tasks/:id` | Delete task | Private |

### Dashboard Endpoint
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | Aggregated user metrics | Private |

#### Sample Dashboard Response
```json
{
  "success": true,
  "data": {
    "totalProjects": 5,
    "totalTasks": 24,
    "completedTasks": 12,
    "pendingTasks": 8,
    "projectsInProgress": 3
  }
}
```

---

## Automated Testing

Pulse includes 35 comprehensive automated tests running with Jest, Supertest, and `mongodb-memory-server`.

To run all tests:
```bash
cd backend
npm test
```

### Test Coverage Highlights
- `tests/security.test.js`: Validates multi-tenant isolation. Verifies User B cannot view, modify, or delete User A's projects or tasks, and that dashboards never cross-contaminate.
- `tests/auth.test.js`: Verifies registration, password hashing, duplicate email rejection, login authentication, and JWT route guards.
- `tests/projects.test.js`: Verifies project CRUD, status filtering, search regex, and cascade deletion of child tasks.
- `tests/tasks.test.js`: Verifies task creation, completion toggles, and multi-parameter filtering.

---

## Docker & Containerized Deployment

To spin up the full stack (MongoDB + Express Backend + React/Nginx Frontend) with one command:

```bash
docker-compose up --build
```

- **Frontend**: Accessible at `http://localhost:8080`
- **Backend API**: Accessible at `http://localhost:5000`
- **MongoDB**: Running on port `27017`

---

## Interview Architecture Talking Points

1. **Why Layered Architecture?**
   Separating Routes, Controllers, Services, Models, and Middlewares prevents bloated routes, keeps business rules decoupled from transport protocols (HTTP/Express), and allows seamless unit testing.

2. **Why Application-Level Cascade Deletes?**
   In MongoDB, document relationships lack native SQL foreign key constraints. We perform a controlled atomic cleanup in `projectService.deleteProject`:
   ```javascript
   await Task.deleteMany({ projectId: project._id });
   await project.deleteOne();
   ```
   This ensures zero orphaned tasks remain in the database.

3. **Why Never Trust Frontend User IDs?**
   An attacker can alter payloads in browser dev tools or Postman. By reading `req.user._id` exclusively from the cryptographically signed JWT in middleware, identity spoofing is mathematically eliminated.
