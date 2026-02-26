# Task Manager API

A REST API built with Node.js, Express, and MongoDB Atlas. It handles user authentication with JWT, role-based access control, and full task management. A lightweight Vanilla JS frontend is included for testing without needing Postman.

---

## Stack

- Node.js + Express
- MongoDB Atlas via Mongoose
- JWT + bcryptjs for authentication
- Joi for request validation
- Morgan for HTTP logging
- Swagger UI for API documentation

---

## Getting Started

### Install dependencies

```bash
npm install
```

### Environment variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

### Run the server

```bash
# Development
npm run dev

# Production
npm start
```

Server starts at `http://localhost:5000`

---

## Project Structure

```
├── config/db.js
├── controllers/
│   ├── authController.js
│   └── taskController.js
├── middleware/
│   ├── auth.js           # JWT verification
│   ├── authorize.js      # Role-based access
│   ├── errorHandler.js   # Global error handling
│   └── validate.js       # Joi schema validation
├── models/
│   ├── User.js
│   └── Task.js
├── routes/
│   ├── auth.js
│   └── tasks.js
├── utils/generateToken.js
├── public/               # Vanilla JS frontend
└── server.js
```

---

## API Reference

### Authentication

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/v1/auth/register` | No | Register a new user |
| POST | `/api/v1/auth/login` | No | Login and receive a JWT |
| GET | `/api/v1/auth/me` | Yes | Get logged-in user profile |

### Tasks

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/v1/tasks` | Yes | List tasks |
| POST | `/api/v1/tasks` | Yes | Create a task |
| GET | `/api/v1/tasks/:id` | Yes | Get a single task |
| PUT | `/api/v1/tasks/:id` | Yes | Update a task |
| DELETE | `/api/v1/tasks/:id` | Yes | Delete a task |

GET /tasks supports optional query filters: `?status=todo` and `?priority=high`

### Swagger UI

Full interactive documentation available at `/api-docs` once the server is running.

---

## Roles

| Role | Access |
|------|--------|
| user | Can only view and manage their own tasks |
| admin | Can view and manage all tasks across users |

Role is set at registration. Defaults to `user` if not specified.

---

## Security

**Password handling** — Passwords are hashed using bcrypt with a salt round of 10 before being stored. The raw password is never saved or returned in any response.

**JWT authentication** — Tokens are signed with a secret key stored in environment variables and expire after 7 days. Every protected route verifies the token before processing the request.

**Input validation** — All incoming request bodies are validated using Joi before reaching the controller. This prevents malformed data from hitting the database and gives callers clear, structured error messages when validation fails. Validation catches issues like missing required fields, invalid email formats, short passwords, and unsupported enum values.

**Ownership checks** — On every task read, update, or delete, the API checks whether the requesting user owns the task. Admins bypass this check. If a non-admin tries to access someone else's task, the request is rejected with a 403.

**Error handling** — All async errors are caught by a wrapper function and forwarded to a centralized error handler. This prevents unhandled promise rejections from crashing the server, and ensures error responses always follow the same JSON format.

**Password field protection** — The password field on the User model has `select: false`, meaning it is excluded from all database queries by default and never included in API responses.

---

## Scalability

**Stateless authentication** — Because authentication is handled entirely through JWTs, the server holds no session state. This means multiple instances of the API can run simultaneously behind a load balancer without any session-sharing complexity.

**Modular structure** — The codebase is organized so that adding a new resource (for example, notes or projects) requires only three files: a model, a controller, and a route file. One line in `server.js` registers the new route. Nothing else needs to change.

**Database** — MongoDB Atlas handles replication and failover automatically. For high-read workloads, a Redis caching layer can be added in front of the database to cache frequently accessed data like task lists.

**Horizontal scaling** — The API can be containerized with Docker and deployed behind a load balancer (NGINX or AWS ALB). Since there is no shared local state, scaling out is straightforward.

**Logging** — Morgan logs every HTTP request with method, path, status code, and response time. For production, this can be replaced with a structured logger like Winston and shipped to a log aggregator.

Made by Harsh Pathak