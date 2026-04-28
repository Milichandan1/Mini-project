# Voyage Travel Website

Voyage is a production-ready travel website built with React, Vite, Tailwind CSS, Framer Motion, Node.js, Express, MongoDB Atlas, and JWT authentication. It includes destination search and filters, animated cards, booking validation, user dashboard, dark/light mode, contact form email integration, SEO metadata, lazy images, loading skeletons, and Google Maps embeds.

## Screenshot

![Voyage travel website homepage](docs/screenshots/voyage-travel-home.png)

## Folder Structure

```text
.
├── client
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── src
│       ├── App.tsx
│       ├── main.tsx
│       ├── styles.css
│       └── lib
│           ├── api.ts
│           └── types.ts
├── server
│   ├── package.json
│   └── src
│       ├── app.js
│       ├── index.js
│       ├── config
│       │   ├── db.js
│       │   └── env.js
│       ├── controllers
│       │   ├── authController.js
│       │   ├── bookingController.js
│       │   ├── contactController.js
│       │   └── destinationController.js
│       ├── data
│       │   └── destinations.js
│       ├── middleware
│       │   └── auth.js
│       ├── models
│       │   ├── Booking.js
│       │   ├── ContactMessage.js
│       │   └── User.js
│       ├── routes
│       │   └── index.js
│       └── utils
│           └── jwt.js
├── .env.example
├── render.yaml
├── package.json
└── README.md
```

## Environment Setup

Create `server/.env`:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/voyage-travel
JWT_SECRET=replace_with_a_long_random_secret
RESEND_API_KEY=re_replace_with_resend_key
CONTACT_EMAIL_TO=owner@example.com
CONTACT_EMAIL_FROM=Voyage <onboarding@resend.dev>
```

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Email delivery uses the Resend HTTP API when `RESEND_API_KEY` and `CONTACT_EMAIL_TO` are set. Contact messages are still accepted if email is not configured.

## Local Development

```bash
npm install
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000/api`

Health check: `http://localhost:5000/api/health`

## Deployment

### MongoDB Atlas

1. Create a MongoDB Atlas project and cluster.
2. Add a database user.
3. Allow network access from Render, or use `0.0.0.0/0` for a quick demo.
4. Copy the connection string into `MONGODB_URI`.

### Backend on Render

1. Push this repository to GitHub.
2. In Render, create a new Web Service from the repo.
3. Set root directory to `server`.
4. Build command: `npm install`.
5. Start command: `npm start`.
6. Add environment variables from `server/.env`.
7. Copy the Render API URL, for example `https://voyage-travel-api.onrender.com/api`.

### Frontend on Vercel

1. Import the same GitHub repository into Vercel.
2. Set root directory to `client`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Add `VITE_API_BASE_URL=https://your-render-service.onrender.com/api`.
6. Deploy and copy the Vercel live URL.

## GitHub

Create a repository under your account, then run:

```bash
git remote set-url origin https://github.com/Milichandan1/voyage-travel-website.git
git add .
git commit -m "Build full-stack travel website"
git push -u origin main
```

## API Overview

```text
GET    /api/health
GET    /api/destinations
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/bookings
GET    /api/bookings
POST   /api/contact
```

Protected routes require:

```text
Authorization: Bearer <token>
```
