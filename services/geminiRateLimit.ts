import { createHash } from "node:crypto";

const WINDOW_MS = 10 * 60 * 1000;
const DAILY_WINDOW_MS = 24 * 60 * 60 * 1000;
const DEFAULT_PER_IP_LIMIT = 5;
const DEFAULT_DAILY_LIMIT = 100;
const developmentCounters = new Map<string, { count: number; resetAt: number }>();

const INCREMENT_WINDOWS_SCRIPT = `
local function incrementWindow(key, ttl)
  local count = redis.call("INCR", key)
  if count == 1 then redis.call("PEXPIRE", key, ttl) end
  return { count, redis.call("PTTL", key) }
end

local dailyLimit = tonumber(ARGV[3])
local currentDaily = tonumber(redis.call("GET", KEYS[1]) or "0")
if currentDaily >= dailyLimit then
  return { dailyLimit + 1, redis.call("PTTL", KEYS[1]), 0, 0 }
end
local daily = incrementWindow(KEYS[1], ARGV[1])
local client = incrementWindow(KEYS[2], ARGV[2])
return { daily[1], daily[2], client[1], client[2] }
`;

export interface GeminiRateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

export class GeminiRateLimitUnavailableError extends Error {
  constructor() {
    super("Shared rate limiting is not configured or is temporarily unavailable.");
    this.name = "GeminiRateLimitUnavailableError";
  }
}

function readLimit(name: string, fallback: number, max: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > max) {
    throw new GeminiRateLimitUnavailableError();
  }
  return parsed;
}

function readUpstashConfig(): { url: URL; token: string } {
  const rawUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!rawUrl || rawUrl === "https://your-database.upstash.io" || !token || token === "your_upstash_redis_rest_token_here") {
    throw new GeminiRateLimitUnavailableError();
  }

  try {
    const url = new URL(rawUrl);
    if (
      url.protocol !== "https:" ||
      !url.hostname.endsWith(".upstash.io") ||
      (url.pathname !== "/" && url.pathname !== "") ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) throw new GeminiRateLimitUnavailableError();
    return { url, token };
  } catch {
    throw new GeminiRateLimitUnavailableError();
  }
}

function clientFingerprint(request: Request): string {
  // These headers must be set by a trusted ingress proxy. The global daily cap
  // still protects the provider quota if a caller can spoof a forwarding header.
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientIp = request.headers.get("x-real-ip")?.trim() || forwarded || "unknown-client";
  return createHash("sha256").update(clientIp.slice(0, 128)).digest("hex");
}

function incrementDevelopmentCounter(key: string, windowMs: number, now: number): { count: number; resetAt: number } {
  const previous = developmentCounters.get(key);
  const counter = !previous || previous.resetAt <= now
    ? { count: 1, resetAt: now + windowMs }
    : { count: previous.count + 1, resetAt: previous.resetAt };
  developmentCounters.set(key, counter);
  return counter;
}

function checkDevelopmentRateLimit(
  request: Request,
  perIpLimit: number,
  dailyLimit: number
): GeminiRateLimitResult {
  const now = Date.now();
  for (const [key, counter] of developmentCounters) {
    if (counter.resetAt <= now) developmentCounters.delete(key);
  }

  const day = new Date(now).toISOString().slice(0, 10);
  const dailyKey = `daily:${day}`;
  const currentDaily = developmentCounters.get(dailyKey);
  if (currentDaily && currentDaily.resetAt > now && currentDaily.count >= dailyLimit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((currentDaily.resetAt - now) / 1000)),
    };
  }
  incrementDevelopmentCounter(dailyKey, DAILY_WINDOW_MS, now);
  const client = incrementDevelopmentCounter(`client:${clientFingerprint(request)}`, WINDOW_MS, now);
  return client.count > perIpLimit
    ? { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((client.resetAt - now) / 1000)) }
    : { allowed: true };
}

function asInteger(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
}

export async function checkGeminiRateLimit(request: Request): Promise<GeminiRateLimitResult> {
  const perIpLimit = readLimit("GEMINI_RATE_LIMIT_PER_IP", DEFAULT_PER_IP_LIMIT, 1000);
  const dailyLimit = readLimit("GEMINI_RATE_LIMIT_DAILY", DEFAULT_DAILY_LIMIT, 100_000);
  if (
    process.env.NODE_ENV === "development" &&
    (!process.env.UPSTASH_REDIS_REST_URL?.trim() ||
      process.env.UPSTASH_REDIS_REST_URL.trim() === "https://your-database.upstash.io" ||
      !process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ||
      process.env.UPSTASH_REDIS_REST_TOKEN.trim() === "your_upstash_redis_rest_token_here")
  ) {
    return checkDevelopmentRateLimit(request, perIpLimit, dailyLimit);
  }

  const { url, token } = readUpstashConfig();
  const dailyKey = `smogsense:gemini:daily:${new Date().toISOString().slice(0, 10)}`;
  const clientKey = `smogsense:gemini:client:${clientFingerprint(request)}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        "EVAL",
        INCREMENT_WINDOWS_SCRIPT,
        2,
        dailyKey,
        clientKey,
        DAILY_WINDOW_MS,
        WINDOW_MS,
        dailyLimit,
      ]),
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) throw new GeminiRateLimitUnavailableError();
    const payload: unknown = await response.json();
    if (!payload || typeof payload !== "object" || !("result" in payload) || !Array.isArray(payload.result)) {
      throw new GeminiRateLimitUnavailableError();
    }

    const [dailyCount, dailyTtl, clientCount, clientTtl] = payload.result.map(asInteger);
    if (dailyCount === null || dailyTtl === null || clientCount === null || clientTtl === null) {
      throw new GeminiRateLimitUnavailableError();
    }

    const exceededTtls: number[] = [];
    if (dailyCount > dailyLimit) exceededTtls.push(dailyTtl);
    if (clientCount > perIpLimit) exceededTtls.push(clientTtl);
    if (exceededTtls.length > 0) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil(Math.min(...exceededTtls) / 1000)),
      };
    }
    return { allowed: true };
  } catch {
    throw new GeminiRateLimitUnavailableError();
  }
}
