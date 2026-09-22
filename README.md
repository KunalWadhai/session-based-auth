# session-based-auth

Minimal secure authentication service that combines:

- server-side session (`express-session`)
- short-lived access token (JWT)
- rotating refresh token (JWT in secure HTTP-only cookie)

## Security model

- Session cookie (`sid`) is `httpOnly` and `sameSite=strict`.
- Access token is validated with session binding (`sid` + `sub`).
- Refresh token is validated and rotated on every refresh.
- Only a SHA-256 hash of the active refresh token is kept server-side.
- Session is regenerated on login to reduce session fixation risk.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your environment file:

   ```bash
   cp .env.example .env
   ```

3. Set strong secret values in `.env`.

4. Run the server:

   ```bash
   npm start
   ```

## API

- `POST /auth/register`
  - body: `{ "email": "user@example.com", "password": "strongpass" }`
- `POST /auth/login`
  - body: `{ "email": "user@example.com", "password": "strongpass" }`
  - response: `{ accessToken, user }`
  - sets `refreshToken` cookie
- `POST /auth/refresh`
  - requires session + `refreshToken` cookie
  - rotates refresh token and returns new access token
- `GET /auth/me`
  - requires session cookie + `Authorization: ******
- `POST /auth/logout`
  - clears session and refresh token cookie

## Notes

- `MemoryStore` is used by default for simplicity. In production, provide a durable session store (for example Redis).
- Set `NODE_ENV=production` behind HTTPS so secure cookies are enforced.
