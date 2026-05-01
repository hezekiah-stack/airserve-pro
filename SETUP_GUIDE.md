# 🚀 AirServe Pro — Setup Guide

Follow these steps to run the system on your computer.

---

## ✅ Step 1 — Install Requirements

Make sure these are installed:
- **Node.js** v18+ → https://nodejs.org
- **MySQL 8.0** → https://dev.mysql.com/downloads/
- **VS Code** → https://code.visualstudio.com

---

## ✅ Step 2 — Open in VS Code

1. Open VS Code
2. Click **File → Open Folder**
3. Select the **airserve-pro** folder
4. Install recommended extensions when prompted

---

## ✅ Step 3 — Setup the Database

1. Open **MySQL Workbench** or any MySQL client
2. Run this file: `database/schema/schema.sql`
3. Then run: `database/seeders/seed.sql`

Or use terminal:
```bash
mysql -u root -p < database/schema/schema.sql
mysql -u root -p airserve_db < database/seeders/seed.sql
```

---

## ✅ Step 4 — Configure Backend

```bash
cd backend
cp .env.example .env
```

Open `.env` and fill in:
```
DB_PASSWORD=your_mysql_password
JWT_SECRET=any_long_random_string
PAYMONGO_SECRET_KEY=sk_test_xxxx   ← from PayMongo dashboard
PAYMONGO_PUBLIC_KEY=pk_test_xxxx   ← from PayMongo dashboard
```

Install and start:
```bash
npm install
npm run dev
```
✅ Backend runs at: http://localhost:5000

---

## ✅ Step 5 — Configure Frontend

```bash
cd frontend
cp .env.example .env
```

Install and start:
```bash
npm install
npm run dev
```
✅ Frontend runs at: http://localhost:5173

---

## ✅ Step 6 — Setup PayMongo (GCash)

1. Go to https://dashboard.paymongo.com
2. Sign up for a free account
3. Go to **Developers → API Keys**
4. Copy your **Test Public Key** and **Test Secret Key**
5. Paste into `backend/.env`

For webhooks (to receive GCash payment confirmations):
1. Go to **Developers → Webhooks**
2. Add URL: `http://your-server.com/api/payments/webhook`
3. Select events: `source.chargeable`, `payment.paid`, `payment.failed`
4. Copy **Webhook Secret** to `backend/.env`

---

## 👤 Demo Accounts

| Role       | Email              | Password  |
|------------|--------------------|-----------|
| Admin      | admin@demo.com     | demo1234  |
| Customer   | customer@demo.com  | demo1234  |
| Technician | tech@demo.com      | demo1234  |

---

## 📁 Project Structure

```
airserve-pro/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── payment/       ← PaymentCheckout (GCash + Card)
│       │   └── shared/        ← AppLayout (sidebar + topnav)
│       ├── context/           ← AuthContext (global login state)
│       ├── pages/
│       │   ├── customer/      ← Dashboard, BookService, MyBookings, Shop
│       │   ├── admin/         ← Dashboard, Bookings, Customers, Inventory, Reports
│       │   ├── technician/    ← Dashboard (task queue)
│       │   └── payment/       ← PaymentSuccess, PaymentFailed
│       ├── styles/            ← All CSS files
│       └── utils/api.js       ← Axios API client
│
├── backend/
│   └── src/
│       ├── controllers/       ← auth, booking, payment logic
│       ├── routes/            ← All API endpoint definitions
│       ├── services/
│       │   └── paymongo.service.js  ← GCash + Card payment integration
│       ├── middleware/        ← JWT auth + role guard
│       └── config/db.js       ← MySQL connection
│
└── database/
    ├── schema/schema.sql      ← All table definitions
    └── seeders/seed.sql       ← Sample data + demo accounts
```

---

## 💳 Payment Flow (GCash via PayMongo)

```
Customer → "Pay with GCash"
    ↓
Backend creates PayMongo Source
    ↓
Returns GCash checkout URL
    ↓
Customer redirected to GCash
    ↓
Customer pays in GCash app
    ↓
PayMongo sends webhook → /api/payments/webhook
    ↓
Backend marks booking as PAID
    ↓
Customer redirected to success page
```

---

## 🛠️ Common Issues

**Backend won't start:**
- Check DB_PASSWORD in `.env`
- Make sure MySQL is running

**"Cannot connect to database":**
- Confirm MySQL is running on port 3306
- Check DB_NAME matches your database

**GCash payment not working:**
- Use real PayMongo test keys (not placeholders)
- Test GCash only works in PayMongo test mode

**Frontend shows blank page:**
- Check `VITE_API_URL` in `frontend/.env`
- Make sure backend is running first

