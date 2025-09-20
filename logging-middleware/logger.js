import 'dotenv/config';

/**
 * AffordMed Evaluation Service Logger
 * Sends logs to the evaluation service as per assessment requirements
 */

const EVALUATION_SERVICE_URL = 'http://20.244.56.144/evaluation-service/logs';
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

// Debug: Check if token is loaded
//console.log('🔑 ACCESS_TOKEN loaded:', ACCESS_TOKEN ? `${ACCESS_TOKEN.substring(0, 20)}...` : 'NOT FOUND');

// Allowed values as per AffordMed requirements (EXACT specification from document)
const ALLOWED_STACKS = ['backend', 'frontend'];
const ALLOWED_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];
const ALLOWED_PACKAGES = {
  backend: ['cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service', 'auth', 'config', 'middleware'],
  frontend: ['api', 'component', 'hook', 'page', 'style', 'auth', 'config', 'middleware']
};

/**
 * Logs an event to the AffordMed evaluation service
 * @param {string} stack - The application stack ('backend' or 'frontend')
 * @param {string} level - The log level ('debug', 'info', 'warn', 'error', 'fatal')
 * @param {string} packageName - The package/module name
 * @param {string} message - The log message
 * @returns {Promise<void>}
 */
export async function logEvent(stack, level, packageName, message) {
  try {
    // Validation
    if (!ALLOWED_STACKS.includes(stack)) {
      console.error(`Invalid stack: ${stack}. Allowed: ${ALLOWED_STACKS.join(', ')}`);
      return;
    }

    if (!ALLOWED_LEVELS.includes(level)) {
      console.error(`Invalid level: ${level}. Allowed: ${ALLOWED_LEVELS.join(', ')}`);
      return;
    }

    if (!ALLOWED_PACKAGES[stack] || !ALLOWED_PACKAGES[stack].includes(packageName)) {
      console.error(`Invalid package: ${packageName} for stack: ${stack}. Allowed: ${ALLOWED_PACKAGES[stack]?.join(', ')}`);
      return;
    }

    if (!ACCESS_TOKEN) {
      console.error('ACCESS_TOKEN not found in environment variables');
      return;
    }

    // Prepare log payload
    const logPayload = {
      stack,
      level,
      package: packageName,
      message,
      timestamp: new Date().toISOString()
    };

    // Send to evaluation service
    const response = await fetch(EVALUATION_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      },
      body: JSON.stringify(logPayload)
    });

    if (!response.ok) {
      console.error(`Logging failed: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Response:', errorText);
    } else {
      //console.log(`[LOG SENT] ${stack}:${level}:${packageName} - ${message}`);
    }

  } catch (error) {
    console.error('Error sending log to evaluation service:', error.message);
  }
}

/**
 * Creates a console logger that also sends to evaluation service
 * @param {string} stack - The application stack
 * @param {string} packageName - The package name
 * @returns {Object} Logger object with debug, info, warn, error, fatal methods
 */
export function createLogger(stack, packageName) {
  return {
    debug: async (message) => {
      //console.log(`[DEBUG] ${message}`);
      await logEvent(stack, 'debug', packageName, message);
    },
    info: async (message) => {
      //console.log(`[INFO] ${message}`);
      await logEvent(stack, 'info', packageName, message);
    },
    warn: async (message) => {
      console.warn(`[WARN] ${message}`);
      await logEvent(stack, 'warn', packageName, message);
    },
    error: async (message) => {
      console.error(`[ERROR] ${message}`);
      await logEvent(stack, 'error', packageName, message);
    },
    fatal: async (message) => {
      console.error(`[FATAL] ${message}`);
      await logEvent(stack, 'fatal', packageName, message);
    }
  };
}

export default { logEvent, createLogger };