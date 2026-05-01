# AirServe Pro — Air Conditioning Service Management System

A full-stack web application for managing air conditioning services, bookings, technicians, inventory, and online payments via PayMongo (GCash, Credit/Debit Cards).

---

## 📁 Project Structure

```
airserve-pro/
├── frontend/        → React.js (Vite) — Customer, Admin, Technician portals
├── backend/         → Node.js + Express.js — REST API
├── database/        → MySQL migrations, seeders, schema
└── .vscode/         → VSCode settings and extensions
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- MySQL 8.0+
- npm or yarn

### 1. Clone / Open in VSCode
Open the `airserve-pro` folder in VSCode.

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env        # Fill in your credentials
npm run db:migrate          # Create tables
npm run db:seed             # Insert sample data
npm run dev                 # Starts on http://localhost:5000
```

### 3. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env        # Set VITE_API_URL
npm run dev                 # Starts on http://localhost:5173
```

### 4. Open in Browser
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api

---

## 👥 User Roles

| Role | Default Login | Features |
|------|--------------|----------|
| Customer | customer@demo.com / demo1234 | Book services, shop, track, pay |
| Admin | admin@demo.com / demo1234 | Manage all bookings, reports, staff |
| Technician | tech@demo.com / demo1234 | View tasks, update progress |

---

## 💳 PayMongo (GCash) Setup

1. Sign up at https://dashboard.paymongo.com
2. Get your **Public Key** and **Secret Key** from the dashboard
3. Add to `backend/.env`:
```
PAYMONGO_PUBLIC_KEY=pk_test_xxxx
PAYMONGO_SECRET_KEY=sk_test_xxxx
PAYMONGO_WEBHOOK_SECRET=whsec_xxxx
```
4. For GCash, use payment method type: `gcash`
5. For Cards, use: `card`

---

## 🗄️ Database

MySQL database: `airserve_db`

Main tables:
- `users` — all users (customers, admins, technicians)
- `service_requests` — bookings and jobs
- `diagnostics` — questionnaire answers
- `schedules` — time slots
- `payments` — PayMongo transaction records
- `products` — inventory items
- `orders` — product purchases

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, Vite, Axios, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MySQL 8 + mysql2 |
| Auth | JWT (JSON Web Tokens) |
| Payments | PayMongo API (GCash + Cards) |
| Styling | CSS Modules + custom CSS |

---

## 📞 PayMongo Supported Payment Methods
- **GCash** — Filipino mobile wallet
- **Maya** — Filipino digital bank
- **Credit/Debit Card** — Visa, Mastercard
- **BillEase** — Buy now pay later
