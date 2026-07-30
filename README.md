# RatingSphere - Store Ratings & Reviews Platform

RatingSphere is a premium, full-stack web application designed for submitting, managing, and tracking verified store ratings. It implements a secure, role-based authentication flow with HTTPOnly cookies, interactive rating selectors, detailed dashboards, and strict validation checks.

The app features a **modern dark-mode glassmorphism theme** built entirely with Vanilla CSS.

---

## 🚀 Tech Stack

- **Backend**: Express.js + TypeScript + Prisma ORM
- **Database**: PostgreSQL
- **Frontend**: React (Vite) + TypeScript
- **Styling**: Vanilla CSS (Hand-crafted theme variables, custom scrollbars, animations, and glow effects)
- **Icons**: Lucide React
- **Testing**: Postman

---

## 🛠️ Key Features

### 1. Role-Based Dashboards
- **System Administrator**:
  - Stat cards showing total user count, store count, and submitted reviews.
  - Filterable list of normal and admin users (filter by Name, Email, Address, Role).
  - Filterable list of stores displaying computed average ratings (filter by Name, Email, Address).
  - Modals to view full details of any user/store.
  - Form modal to add new users and stores.
- **Normal User**:
  - Live search bar to filter registered stores by Name and Address.
  - Store listings displaying overall average ratings.
  - Interactive star rating picker (1-5) on cards to submit or instantly modify feedback.
  - Password update settings modal.
- **Store Owner**:
  - Large analytics card showing overall average store rating.
  - Table of all customers who have rated their store with dates, emails, and ratings.
  - Password update settings modal.

### 2. Form Validations
The application strictly enforces validation criteria on both the client (React forms) and server (Express validator middlewares):
- **Name**: Must be between `20` and `60` characters.
- **Address**: Must not exceed `400` characters.
- **Password**: Must be `8` to `16` characters long and contain at least one uppercase letter and one special character.
- **Email**: Must follow standard email formatting.

---

## 📂 Project Structure

```
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma   # DB schemas & models
│   │   └── seed.ts         # Database seed script
│   └── src/
│       ├── config/         # DB connections
│       ├── controllers/    # Route controllers
│       ├── middleware/     # Auth checks, validation middleware
│       ├── routes/         # Express routes mapping
│       ├── index.ts        # App entry point
│       └── index.spec.ts   # Integration test suite
└── frontend/
    ├── src/
    │   ├── components/     # Reusable UI widgets (StarRating, PasswordModal, StatsCard, Navbar)
    │   ├── pages/          # App Views (Login, AdminDashboard, NormalUserDashboard, StoreOwnerDashboard)
    │   ├── utils/          # API client fetch configurations and Auth contexts
    │   ├── index.css       # Core glassmorphic theme styling variables
    │   ├── main.tsx        # React entrypoint
    │   └── App.tsx         # Dashboard router controller
    └── index.html          # Shell layout (SEO metadata tags)
```

---

## ⚙️ Local Setup Instructions

### Prerequisites
Make sure you have Node.js (v18+) and PostgreSQL installed and running on your machine.

### 1. Database Configuration
In PostgreSQL, create a database named `store_ratings_db`. Ensure your local connection credentials are set up.

### 2. Backend Setup
1. Open the `/backend` folder:
   ```bash
   cd backend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Configure the environment variables in a `.env` file:
   ```env
   DATABASE_URL="postgresql://<username>:<password>@localhost:5432/store_ratings_db?schema=public"
   JWT_SECRET="your-super-secret-key"
   PORT=5001
   NODE_ENV="development"
   ```
4. Run migrations and seed default data:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will listen on port `5001`.*

### 3. Frontend Setup
1. Open the `/frontend` folder:
   ```bash
   cd ../frontend
   ```
2. Install packages:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173/`.*

---

## 🔑 Seeding / Testing Credentials

The database seeding initializes the platform with the following demo credentials (all seeded names satisfy the 20-60 character validations):

| Role | Email | Password | Name |
|---|---|---|---|
| **System Administrator** | `admin@ratings.com` | `Password123!` | `System Administrator Admin` |
| **Store Owner (Coffee)** | `coffee@ratings.com` | `Password123!` | `Gourmet Coffee Roasters & Cafe` |
| **Store Owner (Tech)** | `tech@ratings.com` | `Password123!` | `SuperTech Gadget World Store` |
| **Normal User** | `alex@ratings.com` | `Password123!` | `Alexander Graham Bell Harrison` |
| **Normal User** | `elizabeth@ratings.com` | `Password123!` | `Elizabeth Cady Stanton Smith` |

---

## 🧪 Testing

To run the backend integration and validation tests:
```bash
cd backend
npm run test
```