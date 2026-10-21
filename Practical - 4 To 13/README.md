# ITUE301 Practicals 4 & 5

## Practical 4: REST API with Express

The in-memory implementation is in [`practical-4/server.js`](./practical-4/server.js).
It demonstrates:

- `GET /tasks`
- `GET /tasks/:id`
- `POST /tasks`
- `PUT /tasks/:id`
- `DELETE /tasks/:id`
- request logging with method, URL, and timestamp
- validation and a final global error handler
- `200`, `201`, `400`, and `404` responses

Run it with:

```bash
npm install
npm run practical4
```

## Practical 5: MongoDB, authentication, and protected routes

The MongoDB implementation is in [`practical-5/server.js`](./practical-5/server.js).
It adds:

- MongoDB persistence through Mongoose
- registration with bcrypt password hashing
- JWT login
- authentication middleware for task routes
- per-user task access
- reusable task validation middleware
- CORS, 404 handling, and global error handling

Copy `.env.example` to `.env`, set `MONGODB_URI` and `JWT_SECRET`, then run:

```bash
npm install
npm start
```

The API listens on `http://localhost:5000` by default.
