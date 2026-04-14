const levels = {
  info: 'INFO',
  warn: 'WARN',
  error: 'ERROR'
};

function stringifyMessage(message) {
  if (typeof message === 'string') {
    return message;
  }
  try {
    return JSON.stringify(message);
  } catch {
    return String(message);
  }
}

function write(level, message, meta) {
  const ts = new Date().toISOString();
  const base = `[${ts}] [${levels[level]}] ${stringifyMessage(message)}`;

  if (typeof meta === 'undefined') {
    // eslint-disable-next-line no-console
    console.log(base);
    return;
  }

  // eslint-disable-next-line no-console
  console.log(base, meta);
}

const logger = {
  info(message, meta) {
    write('info', message, meta);
  },
  warn(message, meta) {
    write('warn', message, meta);
  },
  error(message, meta) {
    write('error', message, meta);
  }
};

export default logger;
