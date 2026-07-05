function parseCSV(value: string | undefined): string[] {
  if (!value) return []
  return value.split(',').map(s => s.trim()).filter(Boolean)
}

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] || fallback
  if (!value) {
    throw new Error(
      `[FATAL] Required environment variable ${name} is not set. ` +
      `The application cannot start without it. Set it in your environment or .env file.`
    )
  }
  return value
}

export const config = {
  appName: process.env.APP_NAME || process.env.NEXT_PUBLIC_APP_NAME || 'Cyber Guardians Society CTF',
  version: process.env.NEXT_PUBLIC_VERSION || '1.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  debug: process.env.NODE_ENV === 'development',

  jwt: {
    secret: requireEnv('JWT_SECRET'),
    algorithm: 'HS256' as const,
    accessExpireMinutes: parseInt(process.env.ACCESS_TOKEN_EXPIRE_MINUTES || '15', 10),
    refreshExpireDays: parseInt(process.env.REFRESH_TOKEN_EXPIRE_DAYS || '7', 10),
  },

  cookie: {
    secure: process.env.COOKIE_SECURE === 'true',
  },

  get admin() {
    return {
      username: requireEnv('ADMIN_USERNAME'),
      password: requireEnv('ADMIN_PASSWORD'),
      email: process.env.ADMIN_EMAIL || 'admin@cyberguardians.io',
      allowedIPs: parseCSV(process.env.ADMIN_ALLOWED_IPS),
      accessKey: requireEnv('ADMIN_ACCESS_KEY'),
      secretPath: process.env.ADMIN_SECRET_PATH || 'superuser',
      fingerprintEnforced: process.env.ADMIN_FINGERPRINT_ENFORCED !== 'false',
      honeytokenUsernames: parseCSV(process.env.ADMIN_HONEYTOKEN_USERNAMES),
      webhookUrl: process.env.ADMIN_WEBHOOK_URL || '',
    }
  },

  ctf: {
    flagFormat: process.env.FLAG_FORMAT || 'CGS{}',
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
    lockoutDurationSeconds: parseInt(process.env.LOCKOUT_DURATION_SECONDS || '900', 10),
  },

  rateLimit: {
    auth: parseInt(process.env.RATE_LIMIT_AUTH || '5', 10),
    admin: parseInt(process.env.RATE_LIMIT_ADMIN || '30', 10),
    window: parseInt(process.env.RATE_LIMIT_WINDOW || '15', 10),
  },

  limits: {
    maxRequestBodySize: parseInt(process.env.MAX_REQUEST_BODY_SIZE || '102400', 10),
    maxUploadSize: parseInt(process.env.MAX_UPLOAD_SIZE || '52428800', 10),
  },

  security: {
    wafEnabled: process.env.WAF_ENABLED !== 'false',
    botDetectionEnabled: process.env.BOT_DETECTION_ENABLED !== 'false',
    quarantineMinutes: parseInt(process.env.QUARANTINE_MINUTES || '5', 10),
    accountLockoutEnabled: process.env.ACCOUNT_LOCKOUT_ENABLED !== 'false',
    maxFailedSubmissions: parseInt(process.env.MAX_FAILED_SUBMISSIONS || '10', 10),
    submissionCooldownSeconds: parseInt(process.env.SUBMISSION_COOLDOWN_SECONDS || '3', 10),
    maxSubmissionsPerMinute: parseInt(process.env.MAX_SUBMISSIONS_PER_MINUTE || '5', 10),
    jwtRotationInterval: parseInt(process.env.JWT_ROTATION_INTERVAL || '86400', 10),
  },
}
