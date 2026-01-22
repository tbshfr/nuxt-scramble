export interface ScramblePattern {
  name: string;
  pattern: string;
  flags?: string;
}

export interface ScrambleOptions {
  enabled: boolean;
  defaultPatterns: boolean;
  patterns: ScramblePattern[];
  attribute: string;
  className: string;
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

export function encode(text: string): string {
  if (typeof Buffer !== "undefined") {
    // in node
    return Buffer.from(text, "utf-8").toString("base64");
  }
  // in browser
  return btoa(
    encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(Number.parseInt(p1, 16)),
    ),
  );
}

export function decode(encoded: string): string {
  if (typeof Buffer !== "undefined") {
    // in node
    return Buffer.from(encoded, "base64").toString("utf-8");
  }
  // in browser
  return decodeURIComponent(
    atob(encoded)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join(""),
  );
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

export function scrambleText(
  text: string,
  patterns: ScramblePattern[],
  attribute: string,
  className: string,
): string {
  let result = text;

  for (const pattern of patterns) {
    const regex = createRegex(pattern);
    result = result.replace(regex, (match) => {
      const encoded = encode(match);
      return `<span ${attribute}="${encoded}" class="${className}" data-scramble-type="${pattern.name}"></span>`;
    });
  }

  return result;
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
