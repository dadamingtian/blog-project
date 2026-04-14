import jwt from 'jsonwebtoken';
import { env } from '../config/index.js';

export function signAdminToken(admin) {
  return jwt.sign(
    {
      sub: admin.id,
      role: admin.role,
      username: admin.username
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn
    }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}