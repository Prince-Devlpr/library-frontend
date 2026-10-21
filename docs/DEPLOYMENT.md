# DEPLOYMENT & LOCAL SETUP GUIDE
## Library Management System (LMS)

---

## 1. Prerequisites

- **Node.js**: v20+ or v22+
- **PostgreSQL**: v14+ running locally or in Docker
- **Flutter**: v3.24+ for mobile build
- **Razorpay Account**: Key ID & Secret for online payments (test mode supported)
- **Cloudinary Account**: Cloud Name, API Key, API Secret for book covers

---

## 2. Quickstart Execution Guide

### Step 1: Start Backend
```bash
cd c:/library/backend
cp .env.example .env
# Edit .env with your DATABASE_URL and Razorpay/Cloudinary keys
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev
# Backend starts on http://localhost:3000 (API at /api/v1)
# Swagger documentation available at http://localhost:3000/api-docs
```

### Step 2: Start Librarian Portal
```bash
cd c:/library/librarian-web
npm run dev
# Web application starts on http://localhost:5173
```

### Step 3: Start Administrator Console
```bash
cd c:/library/admin-web
npm run dev
# Web application starts on http://localhost:5174
```

### Step 4: Run Member Mobile App
```bash
cd c:/library/member-app
flutter run
```
