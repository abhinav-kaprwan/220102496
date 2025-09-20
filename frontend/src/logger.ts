/**
 * Frontend Logger for AffordMed Evaluation Service
 * Logs frontend events to the evaluation service
 */

const EVALUATION_SERVICE_URL = 'http://20.244.56.144/evaluation-service/logs';

// Get the access token from environment variables
const ACCESS_TOKEN = import.meta.env.VITE_ACCESS_TOKEN;

// Allowed values as per AffordMed requirements
const ALLOWED_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];
const ALLOWED_PACKAGES = ['api', 'component', 'hook', 'page', 'style', 'auth', 'config', 'middleware'];

/**
 * Logs an event to the AffordMed evaluation service from frontend
 * @param {string} level - The log level ('debug', 'info', 'warn', 'error', 'fatal')
 * @param {string} packageName - The package/module name
 * @param {string} message - The log message
 * @returns {Promise<void>}
 */
export async function logEvent(level: string, packageName: string, message: string): Promise<void> {
  try {
    // Validation
    if (!ALLOWED_LEVELS.includes(level)) {
      console.error(`Invalid level: ${level}. Allowed: ${ALLOWED_LEVELS.join(', ')}`);
      return;
    }

    if (!ALLOWED_PACKAGES.includes(packageName)) {
      console.error(`Invalid package: ${packageName}. Allowed: ${ALLOWED_PACKAGES.join(', ')}`);
      return;
    }

    if (!ACCESS_TOKEN) {
      console.error('ACCESS_TOKEN not found');
      return;
    }

    // Prepare log payload
    const logPayload = {
      stack: 'frontend',
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
      console.error(`Frontend logging failed: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Response:', errorText);
    } else {
      //console.log(`[FRONTEND LOG SENT] ${level}:${packageName} - ${message}`);
    }

  } catch (error) {
    console.error('Error sending frontend log to evaluation service:', error);
  }
}

/**
 * Creates a frontend logger
 * @param {string} packageName - The package name
 * @returns {Object} Logger object with debug, info, warn, error, fatal methods
 */
export function createLogger(packageName: string) {
  return {
    debug: (message: string) => {
      //console.log(`[DEBUG] ${message}`);
      logEvent('debug', packageName, message);
    },
    info: (message: string) => {
      //console.log(`[INFO] ${message}`);
      logEvent('info', packageName, message);
    },
    warn: (message: string) => {
      console.warn(`[WARN] ${message}`);
      logEvent('warn', packageName, message);
    },
    error: (message: string) => {
      console.error(`[ERROR] ${message}`);
      logEvent('error', packageName, message);
    },
    fatal: (message: string) => {
      console.error(`[FATAL] ${message}`);
      logEvent('fatal', packageName, message);
    }
  };
}

export default { logEvent, createLogger };
