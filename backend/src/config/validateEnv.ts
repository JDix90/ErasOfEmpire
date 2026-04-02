/**
 * Fail fast in production when secrets are missing or left at dev defaults.
 */
const DEV_ACCESS = 'dev_access_secret_change_in_production';
const DEV_REFRESH = 'dev_refresh_secret_change_in_production';

export function validateProductionEnv(): void {
  if (process.env.NODE_ENV !== 'production') return;

  const missing: string[] = [];
  if (!process.env.JWT_ACCESS_SECRET?.trim()) missing.push('JWT_ACCESS_SECRET');
  if (!process.env.JWT_REFRESH_SECRET?.trim()) missing.push('JWT_REFRESH_SECRET');

  if (missing.length > 0) {
    throw new Error(
      `[config] Production requires: ${missing.join(', ')}. Set strong secrets in the environment.`,
    );
  }

  if (
    process.env.JWT_ACCESS_SECRET === DEV_ACCESS ||
    process.env.JWT_REFRESH_SECRET === DEV_REFRESH
  ) {
    throw new Error(
      '[config] Production cannot use default dev JWT secrets. Set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET.',
    );
  }

  if (process.env.POSTGRES_PASSWORD === 'chronopass') {
    console.warn(
      '[config] Warning: POSTGRES_PASSWORD matches docker default. Use a unique password in production.',
    );
  }
}
