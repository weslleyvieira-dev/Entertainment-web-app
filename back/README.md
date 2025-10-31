<h1 align="center" style="font-weight: bold;">Backend - Entertainment Web App</h1>

<p align="center">
REST API for authentication, user management, lists, and TMDB integration.
</p>

<p align="center">
  <a href="#technologies">Technologies</a> •
  <a href="#prerequisites">Prerequisites</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#run">Run</a> •
  <a href="#api-docs">API Docs</a> •
  <a href="#author">Author</a>
</p>

<h2 id="technologies">💻 Technologies</h2>

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- Nodemailer
- Swagger

<h2 id="prerequisites">📦 Prerequisites</h2>

- Node.js 18+
- PostgreSQL 13+
- TMDB account and Read Access Token (Bearer)
- Google OAuth2 credentials (for Nodemailer)

<h2 id="getting-started">🚀 Getting Started</h2>

Install:

```sh
cd /back
npm install
```

<h3>🔐 Environment</h3>

Create a `.env` file in `/back`:

```env
# Database
DATABASE_URL=          # Database connection string

# Auth
SECRET=                # JWT secret key

# Integrations
TMDB_TOKEN=            # TMDB API Access Token (Bearer)

# Email (Gmail OAuth2)
GOOGLE_USER=           # Google OAuth user email
GOOGLE_CLIENT_ID=      # Google OAuth client ID
GOOGLE_CLIENT_SECRET=  # Google OAuth client secret
GOOGLE_REFRESH_TOKEN=  # Google OAuth refresh token

# KV
KV_REST_API_URL=       # Upstash KV REST URL
KV_REST_API_TOKEN=     # Upstash KV REST token
```

<h3>🗄️ Database</h3>

Generate Prisma client and apply migrations:

```sh
npx prisma generate
npx prisma migrate deploy
```

<h2 id="run">🏃 Run</h2>

Development:

```sh
npm run dev
```

Production:

```sh
npm start
```

<h3 id="api-docs">📚 API Documentation</h3>

Start the server and open http://localhost:3000/docs.

<h2 id="author">👤 Author</h2>

- [Linkedin](https://www.linkedin.com/in/weslleyvieira-dev/)
- [Portfolio](https://portfolio-weslleyvieira-projects.vercel.app/)
