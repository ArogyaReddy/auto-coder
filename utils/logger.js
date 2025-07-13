const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const levelStr = `[${level.toUpperCase()}]`;
    
    let formatted = `${colors.dim}${timestamp}${colors.reset} ${levelStr} ${message}`;
    
    if (data) {
      formatted += `\n${JSON.stringify(data, null, 2)}`;
    }
    
    return formatted;
  }

  info(message, data = null) {
    const formatted = this.formatMessage('info', `${colors.blue}${message}${colors.reset}`, data);
    console.log(formatted);
  }

  success(message, data = null) {
    const formatted = this.formatMessage('success', `${colors.green}${message}${colors.reset}`, data);
    console.log(formatted);
  }

  warn(message, data = null) {
    const formatted = this.formatMessage('warn', `${colors.yellow}${message}${colors.reset}`, data);
    console.warn(formatted);
  }

  error(message, data = null) {
    const formatted = this.formatMessage('error', `${colors.red}${message}${colors.reset}`, data);
    console.error(formatted);
  }

  debug(message, data = null) {
    if (this.logLevel === 'debug') {
      const formatted = this.formatMessage('debug', `${colors.magenta}${message}${colors.reset}`, data);
      console.log(formatted);
    }
  }

  log(message, data = null) {
    console.log(message, data || '');
  }
}

const logger = new Logger();

module.exports = { logger, Logger };
