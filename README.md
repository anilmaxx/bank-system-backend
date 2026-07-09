# Task3 - Intern Project

A small Node.js/Express backend for user accounts, authentication, accounts, and transactions.

## Prerequisites

- Node.js v14+ and npm
- MongoDB (local or remote)

## Install

```bash
npm install
```

## Environment

Create a `.env` file in the project root with the following variables:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/task3
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

Note: If you want an example file, create `.env.example` with the same keys.

## Run

Start in production:

```bash
npm start
```

Start in development (requires `nodemon`):

```bash
npm run dev
```

## Project Structure

- `src/app.js` - application entry
- `src/routes/` - route definitions
- `src/controllers/` - request handlers
- `src/models/` - Mongoose models
- `src/middleware/` - auth and admin middleware

## API Routes

Base path: `/api`

Authentication routes (`src/routes/authRoutes.js`):
- `POST /api/auth/signup` - register a new user
- `POST /api/auth/login` - login and receive a JWT

User routes (`src/routes/userRouter.js`):
- `GET /api/users` - list all users (requires auth + admin)

Account routes (`src/routes/accountRoutes.js`):
- `POST /api/account/create` - create account (auth)
- `GET /api/account/me` - get accounts for current user (auth)
- `GET /api/account/:id` - get account by id (auth + admin)
- `GET /api/account` - get all accounts (auth + admin)
- `PATCH /api/account/:id/status` - update account status (auth + admin)

Transaction routes (`src/routes/transactionRoutes.js`):
- `POST /api/transactions/deposit` - deposit to account (auth)
- `POST /api/transactions/withdraw` - withdraw from account (auth)
- `POST /api/transactions/transfer` - transfer between accounts (auth)
- `GET /api/transactions` - get transactions for current user (auth)
- `GET /api/transactions/all` - get all transactions (auth + admin)
- `GET /api/transactions/accounts/:accountId` - get transactions by account (auth + admin)

## Example: Register / Login

Register a user:

```bash
curl -X POST http://localhost:3000/api/auth/signup \
	-H "Content-Type: application/json" \
	-d '{"name":"Alice","email":"alice@example.com","password":"password123"}'
```

Login and get a token:

```bash
curl -X POST http://localhost:3000/api/auth/login \
	-H "Content-Type: application/json" \
	-d '{"email":"alice@example.com","password":"password123"}'
```

Use the returned JWT in the `Authorization` header for protected routes:

```
Authorization: Bearer <token>
```

## Models

- `User` - user accounts and credentials
- `Account` - account data and balances
- `Transaction` - debit/credit transaction records

## Notes

- Routes and middleware live under `src/routes` and `src/middleware` respectively.
- If you want, I can add a `.env.example` file or commit these changes for you.

## License

MIT
