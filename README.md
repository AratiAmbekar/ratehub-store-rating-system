# RateHub - Store Ratings & Reviews Platform

RateHub is a full-stack web application for submitting, managing, and tracking store ratings. It implements secure role-based authentication using HTTPOnly cookies, interactive rating features, dashboards, and strict validation checks.

The application features a modern dark-mode glassmorphism UI built with custom Vanilla CSS.

---

## 🚀 Tech Stack

- **Backend**: Express.js + TypeScript + Prisma ORM  
- **Database**: MySQL  
- **Frontend**: React (Vite) + TypeScript  
- **Styling**: Vanilla CSS (custom themes, animations, UI effects)  
- **Icons**: Lucide React  
- **Testing**: Postman  

---

## 🛠️ Key Features

### Role-Based Dashboards
- **System Administrator**
  - View total users, stores, and ratings
  - Filter users and stores
  - Add new users and stores
  - View detailed information via modals  

- **Normal User**
  - Search and browse stores
  - View average ratings
  - Submit and update ratings (1–5 stars)
  - Update password  

- **Store Owner**
  - View average rating analytics
  - See users who rated their store
  - Update password  

---

### Form Validation
Validation is enforced on both client and server:

- **Name**: 20–60 characters  
- **Address**: Max 400 characters  
- **Password**: 8–16 characters, at least one uppercase and one special character  
- **Email**: Standard format validation  

---

## 📂 Project Structure

```

├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── index.ts
│       └── index.spec.ts
└── frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── utils/
│   ├── index.css
│   ├── main.tsx
│   └── App.tsx
└── index.html

````

---

## ⚙️ Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- MySQL installed and running

---

### 1. Database Setup
Create a MySQL database:

```sql
CREATE DATABASE store_ratings_db;
````

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
DATABASE_URL="mysql://<username>:<password>@localhost:3306/store_ratings_db"
JWT_SECRET="your-secret-key"
PORT=5001
NODE_ENV="development"
```

Run migrations:

```bash
npx prisma migrate dev --name init
```

Start backend:

```bash
npm run dev
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Demo Credentials

| Role        | Email                                                 | Password     |
| ----------- | ----------------------------------------------------- | ------------ |
| Admin       | [admin@ratings.com](mailto:admin@ratings.com)         | Password123! |
| Store Owner | [coffee@ratings.com](mailto:coffee@ratings.com)       | Password123! |
| Store Owner | [tech@ratings.com](mailto:tech@ratings.com)           | Password123! |
| User        | [alex@ratings.com](mailto:alex@ratings.com)           | Password123! |
| User        | [elizabeth@ratings.com](mailto:elizabeth@ratings.com) | Password123! |

---

## 🧪 Testing

APIs were tested and validated using Postman to ensure correct request-response handling, authentication, and error scenarios.

---

## 💡 Highlights

* Secure authentication using **HTTPOnly cookies**
* Role-based access control (RBAC)
* Clean REST API design
* Optimized database queries using Prisma
* Real-time rating updates and analytics dashboards
