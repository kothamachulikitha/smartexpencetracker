# 💰 Smart Expense Tracker

A full-stack personal finance management application built with **React**, **Node.js/Express**, and **MongoDB**.

## ✨ Features

- **🔐 JWT Authentication** — Secure signup/login with hashed passwords
- **📊 Dashboard** — Income, expenses, savings, and savings rate at a glance
- **💳 Transaction Management** — Full CRUD with filters, search, and PDF export
- **📁 Categories** — Predefined + custom categories for transactions
- **💰 Budget Management** — Set monthly limits with progress bars and overspending alerts
- **📈 Analytics** — Bar charts, pie charts, and area charts with Recharts
- **🌙 Dark Mode** — Toggle between light and dark themes
- **🤖 AI Insights** — Smart spending tips based on your data
- **📄 PDF Export** — Download transaction reports as PDF

---

## 📂 Project Structure

```
smart-expense-tracker/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── transactionController.js
│   │   └── budgetController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Transaction.js
│   │   └── Budget.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── transactionRoutes.js
│   │   └── budgetRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/index.css
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   ├── Modal.jsx
    │   │   ├── TransactionForm.jsx
    │   │   └── BudgetForm.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── ThemeContext.jsx
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Transactions.jsx
    │   │   ├── Budgets.jsx
    │   │   ├── Analytics.jsx
    │   │   ├── Login.jsx
    │   │   └── Register.jsx
    │   ├── services/api.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** v18+ — [https://nodejs.org](https://nodejs.org)
- **MongoDB** — Local install or [MongoDB Atlas](https://www.mongodb.com/atlas)

### 1. Backend Setup

```bash
cd backend
npm install
```

Edit `.env` if needed:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart-expense-tracker
JWT_SECRET=smartexpensetracker_super_secret_key_2026
```

Start the server:

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:3000` and proxies API calls to the backend.

---

## 🔌 API Endpoints

| Method | Endpoint                  | Description                    | Auth |
| ------ | ------------------------- | ------------------------------ | ---- |
| POST   | `/api/auth/register`      | Register a new user            | No   |
| POST   | `/api/auth/login`         | Login and get JWT token        | No   |
| GET    | `/api/auth/me`            | Get current user profile       | Yes  |
| GET    | `/api/transactions`       | List transactions (filterable) | Yes  |
| GET    | `/api/transactions/summary` | Dashboard summary data       | Yes  |
| POST   | `/api/transactions`       | Add a transaction              | Yes  |
| PUT    | `/api/transactions/:id`   | Update a transaction           | Yes  |
| DELETE | `/api/transactions/:id`   | Delete a transaction           | Yes  |
| GET    | `/api/budgets`            | Get budgets for a month        | Yes  |
| POST   | `/api/budgets`            | Create or update a budget      | Yes  |
| DELETE | `/api/budgets/:id`        | Delete a budget                | Yes  |

---

## 🛠 Tech Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Frontend | React 18, Vite, Recharts, Lucide    |
| Backend  | Node.js, Express.js                 |
| Database | MongoDB, Mongoose                   |
| Auth     | JWT, bcryptjs                       |
| Extras   | jsPDF, react-hot-toast              |
