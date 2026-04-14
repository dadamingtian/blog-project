import { connectDatabase, disconnectDatabase } from '../src/config/db.js';
import { env } from '../src/config/index.js';
import logger from '../src/utils/logger.js';
import { upsertAdminPassword } from '../src/services/auth.service.js';

function parseArg(name) {
  const prefix = `--${name}=`;
  const item = process.argv.find((arg) => arg.startsWith(prefix));
  return item ? item.slice(prefix.length) : '';
}

function parseBoolArg(name) {
  const value = parseArg(name).toLowerCase();
  return value === '1' || value === 'true' || value === 'yes';
}

async function run() {
  const username = parseArg('username') || env.adminInitUsername || 'admin';
  const password = parseArg('password') || env.adminInitPassword || 'Admin@123456';
  const nickname = parseArg('nickname') || env.adminInitNickname || 'Administrator';
  const force = parseBoolArg('force');

  if (password.length < 6) {
    throw new Error('Password length must be at least 6');
  }

  await connectDatabase();

  const result = await upsertAdminPassword({ username, password, nickname });

  if (result.action === 'updated' && !force) {
    logger.warn('Admin existed. Password has been reset. Use --force=true to acknowledge explicitly in automation.');
  }

  logger.info('Admin init finished', {
    action: result.action,
    username: result.admin.username,
    nickname: result.admin.nickname
  });

  await disconnectDatabase();
}

run()
  .then(() => {
    process.exit(0);
  })
  .catch(async (error) => {
    logger.error('Admin init failed', error.message || error);
    try {
      await disconnectDatabase();
    } catch {
      // ignore
    }
    process.exit(1);
  });