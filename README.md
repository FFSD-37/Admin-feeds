# Feeds Admin

This repository contains:

* **Server**: Node.js backend
* **Client**: React.js frontend

---

## 📦 Prerequisites

* Node.js (v16+ recommended)
* npm

---

## 🚀 How to Run the Project

### 1️⃣ Run Backend (Server)

```bash
cd Feeds-admin
npm install
npm run dev
```

> Server will start in development mode.

---

### 2️⃣ Run Frontend (Client)

```bash
cd Feeds-admin-client
npm install
npm start
```

> React app will start on `http://localhost:3000`

---

## ✅ Notes

* Make sure backend is running before using the client
* Copy `.env-example` to `.env` inside the server folder and update required values

## Middleware Architecture

## Middleware Used in the Project

This project uses a well-structured middleware architecture in Express.js. Below is a clear categorization of all middlewares used in `index.js`.

---

### 1. Application-level Middleware

These middlewares run for **every incoming request** before it reaches the routes.

* `cors({ origin: "http://localhost:5173", credentials: true })`
* `express.json()`
* `cookieParser()`
* `bodyParser.urlencoded({ extended: true })`

---

### 2. Router-level Middleware

These are route-specific middlewares mounted using `express.Router()`.

* `/home` → Home routes
* `/auth` → Authentication routes
* `/user` → User management routes
* `/feedback` → Feedback routes
* `/report` → Report routes
* `/payment` → Payment routes
* `/channel` → Channel routes
* `/setting` → Admin settings routes

---

### 3. Third-party Middleware

These middlewares are installed via **npm packages**.

* `cors`
* `cookie-parser`
* `body-parser`
* `dotenv`

---

### 4. Built-in Middleware (Express)

These middlewares are provided directly by Express.

* `express.json()`

---

### 5. Custom Middleware

These middlewares are written specifically for this application.

* `ErrorHandler` → Centralized global error-handling middleware

---

This structure ensures clean separation of concerns, centralized error handling, and scalable request processing across the application.
