const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');

dotenv.config();

const {
  NODE_ENV = 'development',
  PORT = 3000,
  SESSION_SECRET,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_TTL = '15m',
  REFRESH_TOKEN_TTL = '7d',
} = process.env;

if (!SESSION_SECRET || !ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error(
    'SESSION_SECRET, ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET must be set'
  );
}

const app = express();
const isProduction = NODE_ENV === 'production';

app.set('trust proxy', 1);
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    name: 'sid',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

const usersById = new Map();
const usersByEmail = new Map();

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const issueTokens = (userId, sessionId) => {
  const accessToken = jwt.sign(
    { sub: userId, sid: sessionId, type: 'access' },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );

  const refreshToken = jwt.sign(
    { sub: userId, sid: sessionId, jti: crypto.randomUUID(), type: 'refresh' },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_TTL }
  );

  return {
    accessToken,
    refreshToken,
    refreshTokenHash: hashToken(refreshToken),
  };
};

const safeUser = (user) => ({
  id: user.id,
  email: user.email,
  createdAt: user.createdAt,
});

const regenerateSession = (req) =>
  new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) reject(err);
      else resolve();
    });
  });

const destroySession = (req) =>
  new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) reject(err);
      else resolve();
    });
  });

const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'strict',
  path: '/auth/refresh',
};

const requireSession = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Session not found' });
  }
  return next();
};

const requireAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access token is required' });
  }

  const token = authHeader.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
    if (
      payload.type !== 'access' ||
      payload.sid !== req.session.id ||
      payload.sub !== req.session.userId
    ) {
      return res.status(401).json({ message: 'Invalid access token' });
    }

    req.auth = payload;
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid access token' });
  }
};

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/auth/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password || password.length < 8) {
    return res.status(400).json({
      message: 'email and password are required, password must be at least 8 chars',
    });
  }

  if (usersByEmail.has(email)) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = {
    id: crypto.randomUUID(),
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
    refreshTokenHash: null,
  };

  usersById.set(user.id, user);
  usersByEmail.set(user.email, user.id);

  return res.status(201).json({ user: safeUser(user) });
});

app.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userId = usersByEmail.get(email);
    const user = userId ? usersById.get(userId) : null;

    if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await regenerateSession(req);
    req.session.userId = user.id;

    const { accessToken, refreshToken, refreshTokenHash } = issueTokens(
      user.id,
      req.session.id
    );

    user.refreshTokenHash = refreshTokenHash;

    res.cookie('refreshToken', refreshToken, authCookieOptions);

    return res.json({ accessToken, user: safeUser(user) });
  } catch (err) {
    return next(err);
  }
});

app.post('/auth/refresh', requireSession, (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is required' });
  }

  try {
    const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    if (
      payload.type !== 'refresh' ||
      payload.sid !== req.session.id ||
      payload.sub !== req.session.userId
    ) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = usersById.get(payload.sub);
    if (!user || user.refreshTokenHash !== hashToken(refreshToken)) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const tokens = issueTokens(user.id, req.session.id);
    user.refreshTokenHash = tokens.refreshTokenHash;

    res.cookie('refreshToken', tokens.refreshToken, authCookieOptions);

    return res.json({ accessToken: tokens.accessToken });
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});

app.post('/auth/logout', requireSession, async (req, res, next) => {
  try {
    const user = usersById.get(req.session.userId);
    if (user) {
      user.refreshTokenHash = null;
    }

    await destroySession(req);
    res.clearCookie('sid');
    res.clearCookie('refreshToken', { path: '/auth/refresh' });

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

app.get('/auth/me', requireSession, requireAccessToken, (req, res) => {
  const user = usersById.get(req.session.userId);
  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }

  return res.json({ user: safeUser(user) });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });
}

module.exports = app;
