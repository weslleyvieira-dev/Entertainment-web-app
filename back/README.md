# Backend - Entertainment Web App

REST API for authentication, user management, and bookmarks.

## Technologies

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- Nodemailer
- Swagger

## Getting Started

> All commands below should be run from the `/back` directory.

### Configuration

Create a `.env` file with the following variables:

```
DATABASE_URL=          # Database connection string
SECRET=                # JWT secret key
GOOGLE_USER=           # Google OAuth user email
GOOGLE_CLIENT_ID=      # Google OAuth client ID
GOOGLE_CLIENT_SECRET=  # Google OAuth client secret
GOOGLE_REFRESH_TOKEN=  # Google OAuth refresh token
```

### Installation

```sh
npm install
```

### Migrations

```sh
npx prisma migrate deploy
```

### Running the server

Development mode:

```sh
npm run dev
```

Production mode:

```sh
npm start
```

## API Documentation

Access [http://localhost:3000/docs](http://localhost:3000/docs) after starting the server.

## Author

- [Linkedin](https://www.linkedin.com/in/weslleyvieira-dev/)
- [Portfolio](https://portfolio-weslleyvieira-projects.vercel.app/)
