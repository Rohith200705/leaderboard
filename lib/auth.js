const jwt = require('jsonwebtoken');

function getToken(req) {
  const auth = req.headers.get('authorization');
  if (!auth) return null;
  return auth.replace('Bearer ', '');
}

function verifyToken(req) {
  const token = getToken(req);
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

function authMiddleware(req) {
  const user = verifyToken(req);
  if (!user) return null;
  return user;
}

module.exports = { authMiddleware, verifyToken };
