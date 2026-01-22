export interface ScramblePattern {
  name: "email" | "phone" | "custom";
  pattern: string;
  // regex flags (default: 'gi')
  flags?: string;
}

export interface ScrambleOptions {
  enabled: boolean;
  defaultPatterns: boolean;
  patterns: ScramblePattern[];
  attribute: string;
  className: string;
  key: string;
  autoLink: boolean;
  placeholder: string;
}

export const EMAIL_PATTERN: ScramblePattern = {
  name: "email",
  pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
  flags: "gi",
};

export const PHONE_PATTERN: ScramblePattern = {
  name: "phone",
  pattern:
    "(?:\\+?\\d{1,3}[-.\\s]?)?(?:\\(?\\d{2,4}\\)?[-.\\s]?)?\\d{3,4}[-.\\s]?\\d{3,4}",
  flags: "g",
};

// generate a random key for XOR encoding
// called once at build time
export function generateKey(length = 16): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// returns a hex string that doesnt look like base64
export function encode(text: string, key: string): string {
  const result: string[] = [];
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result.push(charCode.toString(16).padStart(2, "0"));
  }
  return result.join("");
}

export function decode(encoded: string, key: string): string {
  const result: string[] = [];
  for (let i = 0; i < encoded.length; i += 2) {
    const charCode =
      Number.parseInt(encoded.substring(i, i + 2), 16) ^
      key.charCodeAt((i / 2) % key.length);
    result.push(String.fromCharCode(charCode));
  }
  return result.join("");
}

export function createRegex(pattern: ScramblePattern): RegExp {
  return new RegExp(pattern.pattern, pattern.flags || "gi");
}

export function getAllPatterns(options: ScrambleOptions): ScramblePattern[] {
  const patterns: ScramblePattern[] = [];

  if (options.defaultPatterns) {
    patterns.push(EMAIL_PATTERN, PHONE_PATTERN);
  }

  patterns.push(...options.patterns);

  return patterns;
}

export function getLinkPrefix(type: ScramblePattern["name"]): string | null {
  switch (type) {
    case "email":
      return "mailto:";
    case "phone":
      return "tel:";
    default:
      return null;
  }
}

export function normalizePhone(phone: string): string {
  return phone.replace(/[\s().-]/g, "");
}

export function hasMatches(text: string, patterns: ScramblePattern[]): boolean {
  for (const pattern of patterns) {
    const regex = createRegex(pattern);
    if (regex.test(text)) {
      return true;
    }
  }
  return false;
}
