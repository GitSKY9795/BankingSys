# Banking System API

>A simple banking API that supports user auth, accounts, idempotent transactions and an immutable ledger.

## Features

- Authentication: register, login, verify email, logout (JWT + cookie)
- Accounts: create and list user accounts, live balance computed from ledger
- Transactions: idempotent transfers between accounts
- Admin/system-only initial funds endpoint
- Ledger: immutable credit/debit entries for audit

## Prerequisites

- Node.js v18+ (recommended)
- MongoDB (Atlas or local)
- Docker (optional, for running MongoDB locally)

## Quick start

1. Clone the repo

```bash
git clone <repo-url>
cd "Banking System"
```

2. Install dependencies

```bash
npm install
```

3. Create an environment file from the example and set values

```bash
cp .env.example .env
# then edit .env to set MONGODB_URI and JWT_SECRET
```

4. Run (development)

```bash
npm run dev
```

Run (production)

```bash
npm start
```

## Environment variables

Create a `.env` file (see `.env.example`). Important variables:

- `MONGODB_URI` - MongoDB connection string (required)
- `JWT_SECRET` or `JWT_SECRET_KEY` - JWT signing secret (required)
- `PORT` - optional (platforms like Render set this automatically)
- Mail settings (optional): `GOOGLE_USER_EMAIL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`

Example minimal `.env`:

```
MONGODB_URI=mongodb://localhost:27017/banking
JWT_SECRET=replace_this_with_a_secure_secret
PORT=3000
```

## API Endpoints (important)

- `POST /api/auth/register` — register new user
- `POST /api/auth/login` — login; returns `token` and sets cookie
- `POST /api/account` — create account (authenticated)
- `GET /api/account/me` — list user's accounts (includes live `balance`)
- `GET /api/account/balance/:account_id` — account balance
- `POST /api/transaction` — create user-to-user transaction
- `POST /api/transaction/system/initial-funds` — admin-only initial funding

### Idempotency

All transaction endpoints require `idempotencyKey` in the request body. Re-using the same key for retries returns the original transaction instead of creating duplicates.

## Admin / System user setup

The admin (system) check uses the `systemUser` boolean on the user document. To mark a user as system user via `mongosh`:

```js
db.users.updateOne({ email: 'admin@example.com' }, { $set: { systemUser: true } })
```

After updating, re-login to receive a token that will pass the admin middleware.

## Deployment notes (Render)

- Ensure `start` script exists in `package.json` (`npm start` runs `node server.js`).
- Render sets `PORT` automatically — `server.js` uses `process.env.PORT`.
- Build command: `npm install` — Start command: `npm start`.

## Troubleshooting

- `Cannot GET /` on deploy: ensure Render is running the service (Web Service), start command `npm start`, and that the server is listening on `process.env.PORT`.
- `ETIMEDOUT` connecting to MongoDB: check `MONGODB_URI`, Atlas IP whitelist, or run a local MongoDB.
- `403 Forbidden (not an admin user)`: ensure `systemUser: true` on the calling user, then re-login.
- `Balance not updating`: balances are computed from the ledger; use `GET /api/account/me` or `GET /api/account/balance/:id` to view live balance.

## Contributing

Please open issues or PRs with focused changes. Follow the existing code style and keep changes minimal.

## License

Add a `LICENSE` file if you want to specify a license.

---
Created by automation — feel free to edit.
