# 🚀 Backend API – README

Welcome to the Backend API documentation. This README provides a complete overview of the API, including authentication, user management, products, and orders. You can directly use this file as your project's `README.md`.

This document provides a complete, production-ready API documentation for the backend system, covering **Authentication, User Profile, Products, and Orders** modules. It is designed to be Swagger-friendly and suitable for real-world use.

---

## 📦 Project Overview

This backend is built using **NestJS**, secured with **JWT authentication**, and supports **role-based access control (USER, ADMIN)**. It integrates **Stripe** for payment processing.

---

## 🌐 Base URL

```
https://technical-assignment-1-g1k1.onrender.com
```

---

## 🔐 Authentication & Authorization

All protected endpoints require a valid JWT access token. Tokens are obtained via the login endpoint and must be sent in the `Authorization` header.

* **Authentication:** JWT Bearer Token
* **Guards Used:**

  * JwtAuthGuard
  * RolesGuard
* **Roles:**

  * USER
  * ADMIN

**Required Header for Protected APIs:**

```
Authorization: Bearer <access_token>
```

---

## 🔑 Auth Module

Handles user registration, login, and password management. (`/auth`)

### 1️⃣ Signup

**POST** `/auth/signup`

Create a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@mail.com",
  "password": "123456"
}
```

---

### 2️⃣ Login

**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**

```json
{
  "email": "john@mail.com",
  "password": "123456"
}
```

---

### 3️⃣ Reset Password (Authenticated)

**POST** `/auth/reset-password`

Allows a logged-in user to change their password.

**Request Body:**

```json
{
  "oldPassword": "123456",
  "newPassword": "new123456"
}
```

---

## 👤 User Profile Module

Manages logged-in user profile information. (`/profile`)

### 1️⃣ Get Profile

**GET** `/profile`

Fetch the logged-in user's profile information.

---

### 2️⃣ Update Profile

**PATCH** `/profile`

Update logged-in user's profile details.

**Request Body:**

```json
{
  "name": "Updated Name",
  "phone": "017xxxxxxxx"
}
```

---

## 📦 Products Module

Provides product management features with admin-only controls and public read access. (`/products`)

### 👑 Admin Only APIs

#### ➕ Create Product

**POST** `/products`

Create a new product (Admin only).

---

#### ✏️ Update Product

**PATCH** `/products/:id`

Update an existing product by ID (Admin only).

---

#### 🗑 Delete Product

**DELETE** `/products/:id`

Delete a product by ID (Admin only).

---

### 👥 User & Admin APIs

#### 📃 Get All Products

**GET** `/products`

Retrieve a list of all products.

---

#### 🔍 Get Product By ID

**GET** `/products/:id`

Retrieve detailed information of a specific product.

---

## 🛒 Orders Module

Handles order placement, payment processing via Stripe, and order lifecycle management. (`/orders`)

### 1️⃣ Create Order (User)

**POST** `/orders`

Place a new order (initial status: `PENDING`).

---

### 2️⃣ Get All Orders (Admin)

**GET** `/orders`

Retrieve all orders (Admin only).

---

### 3️⃣ Get My Orders (User)

**GET** `/orders/my-orders`

Retrieve orders placed by the logged-in user.

---

### 4️⃣ Create Stripe Payment Intent

**POST** `/orders/payment-intent/:orderId`

Create a Stripe payment intent for an order.

---

### 5️⃣ Stripe Webhook

**POST** `/orders/webhook`

Handle Stripe payment events.

**Handled Events:**

* payment_intent.succeeded
* payment_intent.payment_failed

---

### 6️⃣ Cancel Order

**PATCH** `/orders/:orderId/cancel`

Allows a user to cancel a `PENDING` order.

---

## 📤 Common API Response Format

All successful API responses follow the same structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

---

## 🚫 Common Error Responses

Standard HTTP error responses returned by the API.

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Access denied"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

---

## 🧩 Technical Notes

* `@Admin()` → Restricts access to Admin users only
* `@User()` → Restricts access to regular users only
* `@Roles()` → Enables role-based access control
* `handleRequest()` → Ensures a standardized API response format

---

---

## 🛠 Setup & Usage (Quick Start)

1. Install dependencies

```bash
npm install
```

2. Configure environment variables

```env
DATABASE_URL="postgresql://username:password@localhost:5432/yourDB_Name?schema=public"
ADMIN_EMAIL=admin@system.com
ADMIN_PASSWORD=SuperSecure@123
JWT_SECRET=super_secret
JWT_ACCESS_EXPIRES_IN= 7d
JWT_REFRESH_EXPIRES_IN=30
STRIPE_SECRET_KEY= ********************
STRIPE_WEBHOOK_SECRET= *****************
NODE_ENV=development
```

3. Run the application

```bash
npm run start:dev
```

4. Access Swagger API Docs

```
http://localhost:3000/api/docs
```
---

