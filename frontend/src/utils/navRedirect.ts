/**
 * Safe in-app redirect target after login/register (open redirect guard).
 */
export function sanitizePostAuthRedirect(raw: string | null): string {
  if (!raw || typeof raw !== 'string') return '/lobby';
  const t = raw.trim();
  if (!t.startsWith('/') || t.startsWith('//')) return '/lobby';
  return t;
}
