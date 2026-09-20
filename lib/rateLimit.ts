// Crude per-instance limiter. On serverless each instance has its own map, so
// this trims casual abuse but is NOT a real quota guard — see README.

type Limiter = { hit: (key: string) => boolean };

export function createRateLimiter(
  maxRequests: number,
  windowMs: number
): Limiter {
  const hits = new Map<string, number[]>();

  return {
    /** Records a hit and returns true when the key is over its limit. */
    hit(key) {
      const now = Date.now();
      const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      recent.push(now);
      hits.set(key, recent);
      if (hits.size > 5000) hits.clear(); // bound memory on a long-lived instance
      return recent.length > maxRequests;
    },
  };
}

export function clientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
