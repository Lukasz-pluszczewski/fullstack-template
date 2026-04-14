// ------------------------------
// 1) Blacklisted key patterns
// ------------------------------
// Add/adjust as needed; keep these fairly strict to reduce false positives.
const KEY_BLACKLIST: RegExp[] = [
  // common secret key names
  /\b(api[_-]?key|api[_-]?token|access[_-]?token|refresh[_-]?token)\b/i,
  /\b(auth[_-]?token|bearer[_-]?token|session[_-]?secret)\b/i,
  /\b(jwt[_-]?(secret|private|public)?|signing[_-]?secret)\b/i,
  /\b(client[_-]?secret|oauth[_-]?secret)\b/i,
  /\b(secret|password|pass|passwd|pwd|pin)\b/i,
  /\b(private[_-]?key|public[_-]?key)\b/i,
  /\b(encrypt(ion)?[_-]?key|crypto[_-]?key|kms[_-]?key)\b/i,
  /\b(webhook[_-]?secret|hook[_-]?secret)\b/i,

  // DB / infra
  /\b(database[_-]?url|db[_-]?url|dsn)\b/i,
  /\b(pg(password|user)?|mongo(db)?[_-]?uri|redis[_-]?(url|password))\b/i,
  /\b(aws[_-]?(secret|access)[_-]?key|gcp[_-]?service[_-]?account|azure[_-]?client[_-]?secret)\b/i,

  // vendor-ish tokens
  /\b(stripe[_-]?(secret|webhook)[_-]?key)\b/i,
  /\b(sentry[_-]?(dsn|auth[_-]?token))\b/i,
  /\b(sendgrid[_-]?api[_-]?key|mailgun[_-]?api[_-]?key)\b/i,
  /\b(slack[_-]?(bot[_-]?token|signing[_-]?secret))\b/i,
  /\b(twilio[_-]?auth[_-]?token)\b/i,
  /\b(vercel[_-]?token|netlify[_-]?auth[_-]?token|npm[_-]?token)\b/i,
];

// Some keys are *explicitly* not secrets even if they contain “key” etc.
const KEY_ALLOWLIST: RegExp[] = [
  /\b(monkey|donkey|turkey)\b/i, // silly but real false positives happen
  /\b(keyboard|keyframes|keypoint|keynote)\b/i,
  /\b(public[_-]?key(_?id)?|kid)\b/i, // KID isn't secret; public key id isn't secret
  /\b(analytics|telemetry|tracking)[_-]?(key|id)\b/i, // often public
  /\b(client[_-]?id)\b/i, // usually public
  /\b(project[_-]?id|tenant[_-]?id|org[_-]?id)\b/i, // usually public
];

// ------------------------------
// 2) Value heuristics
// ------------------------------
// Token-ish / credential-ish formats (keep conservative).
const VALUE_PATTERNS: RegExp[] = [
  // PEM blocks
  /-----BEGIN (RSA |EC |DSA |OPENSSH |)?PRIVATE KEY-----/i,
  /-----BEGIN CERTIFICATE-----/i,

  // JWT
  /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,

  // Stripe-like
  /\bsk_(live|test)_[0-9a-zA-Z]{16,}\b/,
  /\brk_(live|test)_[0-9a-zA-Z]{16,}\b/,
  /\bwhsec_[0-9a-zA-Z]{16,}\b/,

  // GitHub tokens (classic + fine-grained + app)
  /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/,

  // Slack tokens
  /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/,

  // AWS access key id (not sufficient alone but suspicious)
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bASIA[0-9A-Z]{16}\b/,

  // Google API key often starts with AIza
  /\bAIza[0-9A-Za-z\-_]{20,}\b/,

  // Generic "Bearer ..."
  /^\s*Bearer\s+[A-Za-z0-9\-._~+/]+=*\s*$/i,

  // Basic auth "user:pass" (very heuristic; only flag when it looks like an actual password)
  /^[^:\s]{2,}:[^\s]{6,}$/,

  // Common connection string structures that embed passwords
  /^\s*(postgres(ql)?|mysql|mongodb(\+srv)?|redis|mssql):\/\/.+@/i,
];

// High-entropy-ish base64 / hex blobs (heuristic)
const BASE64ISH = /^[A-Za-z0-9+/]{32,}={0,2}$/;
const HEXISH = /^[a-f0-9]{32,}$/i;

const isProbablyEnvKey = (k: string) => /^[A-Z0-9_]+$/.test(k);

const normalizeKey = (k: string) =>
  (k ?? '')
    .toString()
    .trim()
    .replace(/[\s.]+/g, '_')
    .replace(/__+/g, '_');

const keyLooksSecret = (rawKey: string): boolean => {
  const k = normalizeKey(rawKey);
  if (!k) return false;

  // Allowlist takes precedence to reduce false positives.
  if (KEY_ALLOWLIST.some(rx => rx.test(k))) return false;

  // Blacklist match
  if (KEY_BLACKLIST.some(rx => rx.test(k))) return true;

  // Extra heuristics for keys:
  // - env-like uppercase with SECRET/TOKEN/PASSWORD etc.
  if (
    isProbablyEnvKey(k)
    && /\b(SECRET|TOKEN|PASSWORD|PASS|PRIVATE|KEY|CREDENTIAL|SIGNING)\b/.test(k)
    && !/\b(PUBLIC|CLIENT_ID|PROJECT_ID|TENANT_ID|ORG_ID)\b/.test(k)
  ) {
    return true;
  }

  // - endswith patterns
  if (/(^|_)(SECRET|TOKEN|PASSWORD|PRIVATE_KEY|ACCESS_KEY)(_?ID)?$/.test(k))
    return !/(^|_)(PUBLIC|CLIENT)(_?ID)?$/.test(k);

  return false;
};

// Estimate "entropy" by counting unique chars; cheap and decent for heuristics.
const uniqueCharRatio = (s: string) => {
  if (!s) return 0;
  const set = new Set(s.split(''));
  return set.size / s.length;
};

const looksLikeSecretString = (s: string): boolean => {
  const str = (s ?? '').toString().trim();
  if (!str) return false;

  // Ignore common safe-ish values
  // (tune to your ecosystem; keep minimal)
  if (
    /^(true|false|null|undefined|development|production|test|staging)$/i.test(
      str
    )
  )
    return false;

  // If it matches known secret formats
  if (VALUE_PATTERNS.some(rx => rx.test(str))) return true;

  // Looks like URL with embedded creds
  if (/^[a-z]+:\/\/[^/\s]+:[^@\s]+@/i.test(str)) return true;

  // High-entropy-ish blobs:
  // base64/hex longer strings are suspicious, especially with high unique ratio.
  const len = str.length;
  const ucr = uniqueCharRatio(str);

  if (len >= 40 && ucr >= 0.35 && (BASE64ISH.test(str) || HEXISH.test(str)))
    return true;

  // Generic long token: mix of char classes and not obviously a sentence
  const hasLower = /[a-z]/.test(str);
  const hasUpper = /[A-Z]/.test(str);
  const hasDigit = /[0-9]/.test(str);
  const hasSymbol = /[^A-Za-z0-9]/.test(str);

  // If it’s long and "token-y"
  if (len >= 24 && ucr >= 0.35 && hasDigit && (hasLower || hasUpper)) {
    // If it also has symbols, even more likely a token
    if (hasSymbol) return true;

    // Avoid flagging normal UUIDs too aggressively (but still sometimes secrets)
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        str
      );
    if (!isUUID) return true;
  }

  return false;
};

const looksLikeSecretNumber = (n: number): boolean => {
  // Usually secrets aren't numbers, but PINs / OTP seeds / numeric passwords exist.
  // Keep conservative: only flag long-ish integers.
  if (!Number.isFinite(n)) return false;
  const s = String(Math.trunc(n));
  return s.length >= 6; // 6+ digit PINs / codes could be sensitive
};

const looksLikeSecret = (v: any): boolean => {
  if (v == null) return false;

  if (typeof v === 'string') return looksLikeSecretString(v);
  if (typeof v === 'number') return looksLikeSecretNumber(v);
  if (typeof v === 'boolean') return false;
  if (typeof v === 'bigint') return String(v).length >= 10;
  if (v instanceof Date) return false;

  if (Array.isArray(v)) return v.some(x => looksLikeSecret(x));

  // Buffers / Uint8Array etc.
  if (
    typeof Buffer !== 'undefined'
    && (Buffer.isBuffer(v) || v instanceof Uint8Array)
  ) {
    // Treat binary blobs as sensitive if large enough.
    const len = (v as any).length ?? 0;
    return len >= 16;
  }

  if (typeof v === 'object') {
    // Inspect object keys and values recursively.
    // Limit recursion depth to avoid pathological structures.
    const seen = new Set<any>();
    const walk = (obj: any, depth: number): boolean => {
      if (!obj || typeof obj !== 'object') return looksLikeSecret(obj);
      if (seen.has(obj)) return false;
      seen.add(obj);
      if (depth <= 0) return false;

      for (const [k, val] of Object.entries(obj)) {
        if (keyLooksSecret(k)) return true;
        if (looksLikeSecret(val)) return true;
        if (val && typeof val === 'object' && walk(val, depth - 1)) return true;
      }
      return false;
    };

    return walk(v, 4);
  }

  // Functions / symbols etc.
  return false;
};

export const detectSecret = (
  name: string,
  value: any,
  {
    secretlist = [],
    ignorelist = [],
  }: {
    secretlist?: (string | RegExp)[];
    ignorelist?: (string | RegExp)[];
  } = {}
): false | { key: boolean; value: boolean } => {
  if (
    secretlist.some(rx => (rx instanceof RegExp ? rx.test(name) : rx === name))
  )
    return { key: true, value: true };
  if (
    ignorelist.some(rx => (rx instanceof RegExp ? rx.test(name) : rx === name))
  )
    return false;

  const keyFlag = keyLooksSecret(name);
  const valueFlag = looksLikeSecret(value);

  if (!keyFlag && !valueFlag) return false;
  return { key: keyFlag, value: valueFlag };
};

export const formatSecret = (value: any): string => {
  if (typeof value !== 'string' && typeof value !== 'number') return value;
  const stringified = String(value);
  return `${stringified.slice(0, 5)}...${stringified.slice(-5)}`;
};
