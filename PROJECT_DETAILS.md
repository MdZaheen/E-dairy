# 📘 Online Work Diary Maintenance System

> A role-based web application that digitizes the traditional staff work diary system, allowing staff to submit daily work entries, HODs to approve them, and administrators to manage and monitor records efficiently.

---

## 🎯 Purpose

Replace the **manual staff work diary system** (physical registers) with a **secure, structured, and digital solution** for colleges, universities, schools, and educational institutions.

### Problems Solved

| Manual System Problem        | Digital Solution                  |
| ---------------------------- | --------------------------------- |
| Staff write work in registers| Data stored in MongoDB database   |
| Hard to track workload       | Automated workload tracking       |
| Difficult to generate reports| Automatic report generation       |
| Risk of data loss            | Persistent cloud-based storage    |
| Time-consuming approvals     | Automated approval workflow       |

---

## 👥 User Roles & Features

### 👤 Staff
- Log in securely (JWT-based authentication)
- Enter daily work details (subject handled, hours taken, type of work, etc.)
- View previous entries
- Track monthly workload

### 🧑‍💼 HOD (Head of Department)
- View diary entries of staff in their department
- Approve or reject submitted entries
- Add remarks
- Monitor staff workload

### 🏢 Admin
- Manage users (add staff, assign roles)
- Manage departments
- View all records
- Generate reports

---

## 🛠️ Technology Stack (Backend)

| Component              | Technology                              |
| ---------------------- | --------------------------------------- |
| **Runtime**            | Node.js                                 |
| **Framework**          | Express.js (REST API)                   |
| **Database**           | MongoDB (NoSQL)                         |
| **ODM**                | Mongoose                                |
| **Authentication**     | JWT (JSON Web Token)                    |
| **Password Security**  | bcryptjs                                |
| **Env Configuration**  | dotenv                                  |
| **HTTP Logger**        | morgan                                  |
| **CORS**               | cors                                    |
| **Dev Tool**           | nodemon (auto-restart on file changes)  |

---

## 📁 Project Structure

```
e-dairy/
├── src/
│   ├── config/          # Database connection, app config
│   ├── controllers/     # Route handler logic
│   ├── middleware/       # Auth middleware, error handler, validators
│   ├── models/          # Mongoose schemas (User, DiaryEntry, Department)
│   ├── routes/          # Express route definitions
│   ├── utils/           # Helper functions (token generation, etc.)
│   └── server.js        # App entry point
├── .env.example         # Environment variable template
├── .gitignore           # Git ignored files/folders
├── package.json         # Project metadata & dependencies
└── PROJECT_DETAILS.md   # This file
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (local or Atlas cloud instance)

### Installation
```bash
# 1. Install dependencies (already done)
npm install

# 2. Create .env file from template
cp .env.example .env

# 3. Update .env with your values
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/e-dairy
# JWT_SECRET=your_secret_key
# JWT_EXPIRES_IN=7d

# 4. Start development server
npm run dev

# 5. Start production server
npm start
```

---

## 📊 Planned Database Models

| Model          | Description                                        |
| -------------- | -------------------------------------------------- |
| **User**       | Staff, HOD, Admin — with role-based access          |
| **DiaryEntry** | Daily work log (subject, hours, work type, status)  |
| **Department** | Department info linked to HOD and staff members     |

---

## 🔐 API Architecture (Planned)

| Route Prefix       | Purpose                        | Auth Required |
| ------------------- | ------------------------------ | ------------- |
| `/api/auth`         | Login, Register, Token refresh | No (Public)   |
| `/api/users`        | User CRUD, role management     | Admin only    |
| `/api/diary`        | Create, read, update entries   | Staff / HOD   |
| `/api/departments`  | Department management          | Admin only    |
| `/api/reports`      | Generate workload reports      | HOD / Admin   |

---

## 🏫 Target Audience

- Colleges
- Universities
- Schools
- Educational Institutions

---

## 📝 License

ISC
