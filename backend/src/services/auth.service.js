import Admin from '../models/admin.model.js';
import HttpError from '../utils/httpError.js';
import { signAdminToken } from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

function normalizeUsername(username) {
  return String(username || '').trim();
}

export async function loginAdminByPassword({ username, password }) {
  const normalizedUsername = normalizeUsername(username);

  const admin = await Admin.findOne({ username: normalizedUsername }).select('+passwordHash');

  if (!admin) {
    throw new HttpError({
      statusCode: 401,
      message: 'Invalid username or password'
    });
  }

  const matched = await verifyPassword(password, admin.passwordHash);

  if (!matched) {
    throw new HttpError({
      statusCode: 401,
      message: 'Invalid username or password'
    });
  }

  const token = signAdminToken({
    id: admin._id.toString(),
    username: admin.username,
    role: admin.role
  });

  return {
    token,
    admin: admin.toSafeJSON()
  };
}

export async function getAdminProfileById(adminId) {
  const admin = await Admin.findById(adminId);

  if (!admin) {
    throw new HttpError({
      statusCode: 401,
      message: 'Admin not found or removed'
    });
  }

  return admin.toSafeJSON();
}

export async function createAdmin({ username, password, nickname }) {
  const normalizedUsername = normalizeUsername(username);

  const exists = await Admin.findOne({ username: normalizedUsername });
  if (exists) {
    throw new HttpError({
      statusCode: 409,
      message: `Admin username already exists: ${normalizedUsername}`
    });
  }

  const passwordHash = await hashPassword(password);

  const created = await Admin.create({
    username: normalizedUsername,
    passwordHash,
    nickname: (nickname || 'Administrator').trim(),
    role: 'admin'
  });

  return created.toSafeJSON();
}

export async function upsertAdminPassword({ username, password, nickname }) {
  const normalizedUsername = normalizeUsername(username);
  const passwordHash = await hashPassword(password);

  const admin = await Admin.findOne({ username: normalizedUsername });

  if (!admin) {
    const created = await Admin.create({
      username: normalizedUsername,
      passwordHash,
      nickname: (nickname || 'Administrator').trim(),
      role: 'admin'
    });

    return {
      action: 'created',
      admin: created.toSafeJSON()
    };
  }

  admin.passwordHash = passwordHash;
  if (nickname) {
    admin.nickname = nickname.trim();
  }
  await admin.save();

  return {
    action: 'updated',
    admin: admin.toSafeJSON()
  };
}