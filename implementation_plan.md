# Store Ratings Platform Implementation Plan

This document details the architecture, design, and implementation steps for building the Store Ratings web application. The platform features role-based access control, store and user management, dashboard statistics, rating submissions, and strict form validations.

---

## User Review Required

> [!WARNING]
> **Name Character Constraint**: The requirement specifies that names must be between 20 and 60 characters. This applies to both users (e.g., John Doe will fail validation unless padded/extended) and stores (e.g., "Best Buy" would fail). We will enforce this exactly as requested, but please note that for testing, you must input names that are at least 20 characters long.

## Open Questions

> [!NOTE]
> 1. **Default Administrator Credentials**: We will seed a default administrator user with `admin@ratings.com` and password `Password123!`. Please let us know if you prefer a different default email or password.
> 2. **Authentication Flow**: We plan to use HTTPOnly cookies to store the JWT, which is the most secure method for web clients and prevents XSS token theft. If you prefer localStorage or standard Authorization headers, let us know.

---

## Technical Stack Decisions

### Backend: Express.js + TypeScript + Prisma ORM
- **Express.js with TypeScript**: Fast, widely adopted, and robust. TypeScript provides type-safety across requests, responses, and database queries.
- **Prisma ORM**: Modern database client for MySQL. It simplifies migration management, auto-generates TypeScript types, and offers an intuitive query API.
- **MySQL**: Widely deployed, ACID-compliant relational database (via InnoDB). Well suited for structuring many-to-many relationships (e.g., users rating stores).

### Frontend: React (Vite) + Vanilla CSS
- **React (TypeScript)**: Highly modular and component-driven, ensuring swift state updates and responsive interactions.
- **Vanilla CSS**: Hand-crafted CSS using custom properties (CSS variables) to build a beautiful design system featuring glassmorphism, responsive grid layouts, modern typography, transitions, and hover-glow effects. No third-party utility class frameworks (like Tailwind) are used.
- **Vite**: Ultra-fast build tool for React development.

---

## Database Design (MySQL)

We will use Prisma to manage the database schema. Below is the finalized model structure, including explicit column lengths that map to the validation rules (MySQL/Prisma otherwise defaults `String` columns to `VARCHAR(191)`, which would silently truncate the 400-character address field).

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  NORMAL_USER
  STORE_OWNER
}

model User {
  id        String   @id @default(uuid())
  name      String   @db.VarChar(60)   // Min 20, Max 60 characters (min enforced at app layer)
  email     String   @unique @db.VarChar(191)
  password  String   @db.VarChar(255)  // Hashed password
  address   String   @db.VarChar(400)  // Max 400 characters
  role      Role     @default(NORMAL_USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  ratingsSubmitted Rating[] @relation("UserRatings") // Ratings submitted by this user
  ratingsReceived  Rating[] @relation("StoreRatings") // Ratings received if this user is a STORE_OWNER

  @@index([role])
}

model Rating {
  id           String   @id @default(uuid())
  value        Int      // 1 to 5
  userId       String   // Normal user ID
  storeOwnerId String   // Store Owner user ID
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relations
  user       User @relation("UserRatings", fields: [userId], references: [id], onDelete: Cascade)
  storeOwner User @relation("StoreRatings", fields: [storeOwnerId], references: [id], onDelete: Cascade)

  @@unique([userId, storeOwnerId]) // Prevent duplicate ratings by a single user for a store
  @@index([storeOwnerId])
}
```

> [!NOTE]
> Store Owners and Stores are represented together in the `User` model with `role = STORE_OWNER`. This aligns with the requirement that a Store Owner represents a single store, simplifying the relationship while preserving all requested attributes (Name, Email, Address, and Rating).

> [!NOTE]
> Prisma's `Int` enum values map to a native MySQL `ENUM(...)` column, and `@default(uuid())` generates a UUID string at the application layer (MySQL has no native UUID type prior to 8.0's `UUID()` function support), so no additional configuration is needed for either.

> [!WARNING]
> The `storeOwnerId` foreign key only guarantees the referenced `User` row exists — it does not guarantee that row's `role` is `STORE_OWNER`. This must be validated in the Express route handler before inserting a rating, otherwise a normal user could end up as a rating target.

---

## API Routes Design

### 1. Authentication
* **`POST /api/auth/register`**: Register a new Normal User.
* **`POST /api/auth/login`**: Unified login. Validates credentials and sets a secure HTTPOnly JWT cookie.
* **`GET /api/auth/me`**: Fetches the authenticated user profile details.
* **`PUT /api/auth/update-password`**: Updates user password (available to Normal Users and Store Owners).
* **`POST /api/auth/logout`**: Clears the authentication cookie.

### 2. System Administrator Dashboard & Operations
* **`GET /api/admin/stats`**: Returns statistics: Total Users, Total Stores, and Total Submitted Ratings.
* **`GET /api/admin/users`**: List of all Normal and Admin users. Supports filters: `name`, `email`, `address`, `role`.
* **`GET /api/admin/stores`**: List of all stores (User role `STORE_OWNER`). Supports filters: `name`, `email`, `address`. Computes and includes average ratings.
* **`GET /api/admin/users/:id`**: View detailed attributes of a specific user. If role is `STORE_OWNER`, computes and displays their average rating.
* **`POST /api/admin/users`**: Create a new User (Admin, Normal User, or Store Owner).

### 3. Normal User Operations
* **`GET /api/stores`**: Get all registered stores with Name, Address, overall average rating, and the current user's submitted rating (if any). Supports search by Name and Address.
* **`POST /api/ratings`**: Submit a new rating (1-5) or modify an existing rating for a store.

### 4. Store Owner Operations
* **`GET /api/store-owner/dashboard`**: Returns the average rating of their store and a list of users who have submitted ratings for their store.

---

## Frontend Design & Premium Aesthetics

We will build a high-fidelity visual interface using modern Vanilla CSS.

### Design System & Theme
- **Color Palette**: Dark mode base with neon glassmorphism accents.
  - Deep Navy Blue backdrop: `#0a0f1d`
  - Glass card overlay: `rgba(255, 255, 255, 0.05)` with `backdrop-filter: blur(12px)`
  - Neon Cyan for interactive elements and primary buttons: `#00f2fe` / `#4facfe`
  - Coral Pink for warnings/errors: `#ff0844`
- **Typography**: Using Google Fonts **Outfit** for headings and **Inter** for body text.
- **Micro-animations**: Smooth hover transitions (`transition: transform 0.2s ease, box-shadow 0.2s ease`), animated glowing star selections, and scale-in dashboard loaders.

### Layout Screens
1. **Unified Authentication Page**:
   - Split-pane layout. Left: A rotating neon ratings graphic. Right: Form tabs switching smoothly between Login and Signup.
   - Live validation checkmarks under the Password field (checking length, capital letter, and special character in real-time).
2. **System Admin Dashboard**:
   - Grid cards showing core counts with animated loading states.
   - Split views for "User Directory" and "Store Directory".
   - Modals for adding Users/Stores and displaying details.
3. **Normal User Dashboard**:
   - A clean layout with store cards.
   - Interactive rating stars (1-5) on each store card allowing instant submission/updates with subtle button transitions.
4. **Store Owner Dashboard**:
   - Large hero card highlighting their overall rating.
   - Table displaying all customers who rated them.

---

## Form Validation Rules

We will apply the same validation constraints on both the **React Frontend** and **Express Backend**:

| Field | Rule | Error Message |
|---|---|---|
| **Name** | Minimum 20 characters, Maximum 60 characters | "Name must be between 20 and 60 characters long." |
| **Address** | Maximum 400 characters | "Address cannot exceed 400 characters." |
| **Password** | 8-16 characters, must include at least one uppercase letter and one special character | "Password must be 8-16 characters and contain at least one uppercase letter and one special character." |
| **Email** | Valid email format (regex validation) | "Please enter a valid email address." |

---

## Verification Plan

### Automated Tests
- Run unit tests to verify:
  1. Hashing and validation of passwords during user creation.
  2. Average rating computation logic.
  3. Form validation middleware (invalid name length, invalid password complexity).
- Test execution command: `npm run test` (in backend).

### Manual Verification
- **Role-based Authentication**: Verify that normal users cannot access admin endpoints (`/api/admin/*`) and store owners cannot rate other stores.
- **Search & Filters**: Check that search input fields filter store cards on the fly.
- **Rating modifications**: Test that rating submissions update the average rating on the fly in the Store Owner's dashboard.
- **Migration sanity check**: After running `npx prisma migrate dev`, inspect `prisma/migrations/*/migration.sql` to confirm `role` compiled to a native MySQL `ENUM(...)` column and that `address`/`name`/`password` show the correct `VARCHAR` lengths — this is the fastest way to catch a datasource/provider mismatch before it surfaces as a runtime error.