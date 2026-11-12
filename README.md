# CineVerse 🎬

A movie discovery app: browse movies and actors, watch trailers, and share reviews.
Backend built with **Node.js, Express and MongoDB**, serving a DaisyUI + Tailwind frontend.

## Features

- **Auth**: register (with optional avatar), login, logout, OTP-based password reset
- **Sessions**: cookie-based sessions stored in MongoDB (httpOnly cookie)
- **Movies**: CRUD, search by title, filter by actor, poster upload
- **Actors**: CRUD, multiple photos, filmography
- **Reviews**: rate movies from 0 to 10, edit or delete your own reviews
- **Middleware**: authentication, authorization (owner or admin), schema validation (Zod), file upload (Multer)

## Tech stack

Node.js · Express · MongoDB Atlas · Mongoose · Zod · Multer · bcryptjs · Nodemailer

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file (see `.env.example`):
   ```
   MONGO_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/movies
   SESSION_SECRET=change-me
   MAIL_USER=your.email@gmail.com
   MAIL_PASS=your-gmail-app-password
   ```
   `MAIL_USER` and `MAIL_PASS` are optional. Without them the OTP is printed in the server console.
3. Run the app:
   ```bash
   npm start
   ```
4. Open http://localhost:3000/home.html

The first registered user becomes an **admin**.

## API overview

| Area | Endpoints |
| --- | --- |
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/forgot-password`, `POST /auth/reset-password` |
| Movies | `GET /api/movies`, `GET /api/movies/:id`, `POST /api/movies`, `PATCH /api/movies/:id`, `DELETE /api/movies/:id` |
| Actors | `GET /api/actors`, `GET /api/actors/:id`, `POST /api/actors`, `PATCH /api/actors/:id`, `DELETE /api/actors/:id` |
| Reviews | `POST /api/movies/:movieId/reviews`, `GET /api/reviews/my`, `PATCH /api/reviews/:id`, `DELETE /api/reviews/:id` |

Creating movies and actors requires login. Editing or deleting requires being the owner or an admin.

## Project structure

```
db/                   MongoDB connection
models/               Mongoose models (User, Session, Actor, Movie, Review)
middleware/           checkAuth, validateBody, validateObjectId, upload
routes/               auth, movie, actor, review, pages
validation-schemas/   Zod schemas
utils/                helpers (permissions, email)
pages/                frontend (HTML, JS, CSS)
uploads/              uploaded images
```