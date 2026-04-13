# Task Management System

Task Management System ek full-stack web app hai jisme user apne tasks, boards, notifications aur profile ko manage kar sakta hai. Project ka frontend React + Vite me bana hai aur backend Express + MongoDB use karta hai.

## Website Par Kya Kya Hai

### 1. Authentication Pages
- `Signup` page: naya account create karne ke liye
- `Login` page: existing user login karne ke liye
- `Forgot Password` page: reset link bhejne ke liye
- `Reset Password` page: token ke through password update karne ke liye

### 2. Dashboard
Dashboard app ka main area hai. Yahan user:
- apne tasks dekh sakta hai
- task create, update, delete kar sakta hai
- task status change kar sakta hai
- task ko board ke andar manage kar sakta hai
- search aur filters use kar sakta hai
- grid, kanban aur calendar view me tasks dekh sakta hai

### 3. Board Management
- naya board create kar sakte ho
- board select karke uske tasks alag dekh sakte ho
- dusre users ko board invite kar sakte ho
- invitation accept/decline kar sakte ho

### 4. Task Features
Har task me ye cheezein ho sakti hain:
- task name
- description
- priority
- status
- due date
- category
- tags
- assignee
- comments
- activity history

### 5. Productivity Features
Dashboard me extra productivity tools bhi diye gaye hain:
- analytics cards
- productivity charts
- Pomodoro widget
- smart suggestions
- notification bell

### 6. Profile Section
- profile details update kar sakte ho
- password change kar sakte ho
- profile picture upload/delete kar sakte ho
- account delete kar sakte ho

## Main Features

- JWT based authentication
- Protected routes
- Board-wise task organization
- Task filtering and sorting
- Grid, Kanban, Calendar views
- Task assignment
- Comment system
- Notification system
- Profile picture upload with Cloudinary
- Responsive UI
- Dark mode toggle in dashboard

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Tailwind CSS
- DaisyUI
- Axios
- React Hook Form
- React Hot Toast
- dnd-kit

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Multer
- Cloudinary
- Nodemailer

## Project Structure

```text
Task-Management-System-2-main/
|-- backend/
|   |-- src/
|   |   |-- config/              # security related config
|   |   |-- controllers/         # business logic and request handlers
|   |   |-- database/            # MongoDB connection setup
|   |   |-- library/             # helper utilities like token, mailer, cloudinary
|   |   |-- middleware/          # auth, validation, upload, error handling
|   |   |-- models/              # Mongoose schemas
|   |   |-- routes/              # API route definitions
|   |   |-- validators/          # request payload validators
|   |   |-- index.js             # backend entry point
|   |-- package.json
|
|-- frontend/
|   |-- public/                  # static public assets
|   |-- src/
|   |   |-- assets/              # frontend assets
|   |   |-- components/          # reusable UI components
|   |   |-- context/             # auth context
|   |   |-- hooks/               # custom hooks
|   |   |-- layouts/             # public/protected layouts
|   |   |-- library/             # API instances and helper files
|   |   |-- pages/               # page level components
|   |   |-- App.jsx              # frontend routes
|   |   |-- main.jsx             # React app bootstrap
|   |   |-- index.css            # global styles
|   |-- package.json
|
|-- package.json                 # root scripts for build and start
|-- README.md
```

## Important Frontend Files

- `frontend/src/App.jsx`:
  app ke saare routes yahan define hain
- `frontend/src/pages/Dashboard.jsx`:
  main dashboard UI, filters, analytics, board selection, task views
- `frontend/src/pages/Login.jsx`, `Signup.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx`:
  authentication related pages
- `frontend/src/pages/Profile.jsx`:
  user profile management
- `frontend/src/components/KanbanBoard.jsx`:
  kanban drag-and-drop task board
- `frontend/src/components/TaskCalendar.jsx`:
  calendar-based task view
- `frontend/src/components/ProductivityCharts.jsx`:
  dashboard analytics charts
- `frontend/src/components/PomodoroWidget.jsx`:
  focus timer widget
- `frontend/src/components/NotificationBell.jsx`:
  notification UI

## Important Backend Files

- `backend/src/index.js`:
  express server start hota hai yahan se
- `backend/src/routes/auth.routes.js`:
  signup, login, password reset, profile APIs
- `backend/src/routes/task.routes.js`:
  task CRUD, task status, assignment, comments
- `backend/src/routes/board.routes.js`:
  board create, fetch, invite, invitations
- `backend/src/routes/notification.routes.js`:
  notifications fetch/read/delete
- `backend/src/models/`:
  user, board, task, notification schemas

## API Modules

Backend me main API areas ye hain:

- `/api/auth`
- `/api/tasks`
- `/api/boards`
- `/api/notifications`

## Installation

### Prerequisites
- Node.js
- npm
- MongoDB database
- Cloudinary account

### Setup

1. Clone project
```bash
git clone <repository-url>
cd Task-Management-System-2-main
```

2. Root se dependencies install/build karo
```bash
npm run build
```

3. `backend` folder ke andar `.env` file banao:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

## Run Project

### Backend
```bash
cd backend
npm run dev
```

### Frontend
```bash
cd frontend
npm run dev
```

### Production
```bash
npm start
```

## Deploy On Vercel

Ye project ab single Vercel project ke through deploy ho sakta hai:
- frontend static build ke form me serve hoga
- backend `api/index.js` ke through Vercel Function ke form me chalega

### Required Environment Variables on Vercel
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=https://your-project-name.vercel.app
NODE_ENV=production
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
VITE_USE_HASH_ROUTER=false
```

### Vercel Notes
- same project me frontend aur backend dono deploy honge
- frontend production me relative `/api/...` routes use karega
- Vercel config root me `vercel.json` file se manage ho rahi hai
- reset-password aur deep links ke liye BrowserRouter use hota hai, isliye `VITE_USE_HASH_ROUTER=false` rakha gaya hai
- backend serverless mode me run karega, isliye uploads ke liye temp files system temp directory me store hoti hain

## Current Route Flow

### Public Routes
- `/home`
- `/signup`
- `/login`
- `/forgot-password`
- `/reset-password/:token`

### Protected Routes
- `/`
- `/dashboard`
- `/profile`

## Notes

- `frontend/dist` build output folder hai
- `node_modules` dependency folders hain, inhe manually edit nahi karna chahiye
- app ka main working logic `frontend/src` aur `backend/src` me hai

## Summary

Ye project ek modern task management website hai jahan user:
- login/signup kar sakta hai
- tasks aur boards manage kar sakta hai
- kanban/calendar/grid views use kar sakta hai
- comments aur assignment kar sakta hai
- notifications dekh sakta hai
- profile aur password manage kar sakta hai

Is README ka purpose ye hai ki project open karte hi samajh aa jaye ki website par kya available hai aur file system me kis folder ka kya role hai.
