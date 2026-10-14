import { defineNitroPlugin } from "nitropack/runtime";
import { useRuntimeConfig } from "#imports";
import {
  encode,
  createRegex,
  getAllPatterns,
  type ScrambleOptions,
  type ScramblePattern,
} from "../../utils/scramble";

interface CompiledPattern {
  name: ScramblePattern["name"];
  regex: RegExp;
}

const HREF_REGEX = /href=(["'])(mailto:|tel:)([^"']+)\1/gi;

// nitro plugin to transform html on server render
export default defineNitroPlugin((nitroApp) => {
  const options = useRuntimeConfig().public.scramble as ScrambleOptions;

  // matchAll needs the g flag, and a non-global regex would only ever replace the first match
  const patterns: CompiledPattern[] = getAllPatterns(options).map((pattern) => {
    const regex = createRegex(pattern);
    return {
      name: pattern.name,
      regex: regex.global ? regex : new RegExp(regex, `${regex.flags}g`),
    };
  });

  if (patterns.length === 0) {
    return;
  }

  nitroApp.hooks.hook("render:html", (html) => {
    html.body = html.body.map((content: string) =>
      transformContent(content, patterns, options),
    );
  });
});

function transformContent(
  content: string,
  patterns: CompiledPattern[],
  options: ScrambleOptions,
): string {
  if (!content || typeof content !== "string") {
    return content;
  }

  const { attribute, className, key } = options;
  const placeholder = options.placeholder || "[protected]";
  const scrambledMarker = `${attribute}="`;

  // encode manually created tel and mailto links
  content = scrambleHrefAttributes(content, patterns, key, placeholder);

  for (const pattern of patterns) {
    const parts: string[] = [];
    let lastIndex = 0;

    for (const execResult of content.matchAll(pattern.regex)) {
      const match = execResult[0];
      const index = execResult.index;

      if (shouldSkip(content, index, scrambledMarker)) {
        continue;
      }

      const encoded = encode(match, key);
      parts.push(
        content.slice(lastIndex, index),
        `<span ${attribute}="${encoded}" class="${className}" data-scramble-type="${pattern.name}" aria-hidden="true">${placeholder}</span>`,
      );
      lastIndex = index + match.length;
    }

    if (parts.length > 0) {
      parts.push(content.slice(lastIndex));
      content = parts.join("");
    }
  }

  return content;
}

// looks backwards from the match without copying the prefix of the document
function shouldSkip(
  content: string,
  index: number,
  scrambledMarker: string,
): boolean {
  if (index === 0) {
    return false;
  }

  const before = index - 1;

  // dont transform if were inside a tag
  if (content.lastIndexOf("<", before) > content.lastIndexOf(">", before)) {
    return true;
  }

  // inside an href value: the closest preceding quote opens `href="` / `href='`
  const lastQuote = Math.max(
    content.lastIndexOf('"', before),
    content.lastIndexOf("'", before),
  );
  if (lastQuote >= 5 && content.startsWith("href=", lastQuote - 5)) {
    return true;
  }

  // check if already scrambled
  return content.endsWith(scrambledMarker, index);
}

function scrambleHrefAttributes(
  content: string,
  patterns: CompiledPattern[],
  key: string,
  placeholder: string,
): string {
  const hasEmail = patterns.some((p) => p.name === "email");
  const hasPhone = patterns.some((p) => p.name === "phone");

  if (!hasEmail && !hasPhone) {
    return content;
  }

  return content.replace(HREF_REGEX, (fullMatch, quote, prefix, value) => {
    const isEmail = prefix.toLowerCase() === "mailto:";

    if (isEmail ? !hasEmail : !hasPhone) {
      return fullMatch;
    }

    const encoded = encode(value, key);

    return `href=${quote}#${placeholder}${quote} data-scramble-href="${encoded}" data-scramble-href-prefix="${prefix}"`;
  });
}
