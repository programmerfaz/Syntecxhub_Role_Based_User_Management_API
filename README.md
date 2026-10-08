# Syntecxhub_Role_Based_User_Management_API

This is my Week 4 Project 1 for the Syntecxhub Backend Development internship.

I built a Role-Based User Management API using Node.js, Express, and MongoDB. Users sign up and log in with JWT. Each user has a role (`user` or `admin`). Admin routes are protected by middleware that reads the role from the JWT. An admin can list users, block or unblock them, and promote or demote them. Those actions are saved in an audit log.

## How it works

- `server.js` starts the server and connects to MongoDB
- `app.js` sets up Express and the routes
- `routes` maps each URL to a controller function
- `controllers/authController.js` has signup, login, and getMe
- `controllers/adminController.js` has the admin user management and audit log logic
- `models/userModel.js` defines the user (username, email, password, role, isBlocked)
- `models/auditLogModel.js` stores who did what, and when
- `middleware/authMiddleware.js` checks the JWT
- `middleware/roleMiddleware.js` checks the role from the JWT and only lets admins through
- `middleware` also handles errors and unknown routes

Signup always creates a `user`. Only an admin can promote someone. A blocked user cannot log in, and an existing token is rejected on the next request. After a promotion, that person needs to log in again so the new role is written into their token.

## Setup

1. Run `npm install`
2. Add your values in a `.env` file:

```
PORT=3000
MONGO_URI=your_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d
```

3. Run `npm run seed` to create the sample admin and user
4. Run `npm start`

### Seed accounts

- Admin: `admin@syntecxhub.com` / `Admin@123`
- User: `fazil@syntecxhub.com` / `User@123`

## Endpoints

- `POST /api/auth/signup` — create a user (role is always `user`)
- `POST /api/auth/login` — login and receive a JWT that includes the role
- `GET /api/auth/me` — get the current user (requires JWT)
- `GET /api/admin/users` — list users (admin only)
- `GET /api/admin/users/:id` — get one user (admin only)
- `PATCH /api/admin/users/:id/block` — block a user (admin only)
- `PATCH /api/admin/users/:id/unblock` — unblock a user (admin only)
- `PATCH /api/admin/users/:id/promote` — promote a user to admin (admin only)
- `PATCH /api/admin/users/:id/demote` — demote an admin to user (admin only)
- `GET /api/admin/audit-logs` — list audit logs (admin only)

### Auth header

```
Authorization: Bearer <your_token>
```

### User list filters

```
GET /api/admin/users?role=admin
GET /api/admin/users?role=user
GET /api/admin/users?isBlocked=true
```

### Audit log filters

All of these are optional and can be combined:

```
GET /api/admin/audit-logs?action=USER_BLOCKED
GET /api/admin/audit-logs?user=<adminId>
GET /api/admin/audit-logs?target=<userId>
GET /api/admin/audit-logs?startDate=2026-10-01&endDate=2026-10-31
```

Actions stored in the log: `USER_BLOCKED`, `USER_UNBLOCKED`, `USER_PROMOTED`, `USER_DEMOTED`.

I tested everything using Postman.
