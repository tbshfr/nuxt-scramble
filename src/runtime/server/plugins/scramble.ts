import { defineNitroPlugin } from "nitropack/runtime";
import { useRuntimeConfig } from "#imports";
import {
  encode,
  createRegex,
  getAllPatterns,
  type ScrambleOptions,
  type ScramblePattern,
} from "../../utils/scramble";

// nitro plugin to transform html on server render
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("render:html", (html, { event: _event }) => {
    const config = useRuntimeConfig();
    const options = config.public.scramble as ScrambleOptions;

    const patterns = getAllPatterns(options);

    if (patterns.length === 0) {
      return;
    }

    html.body = html.body.map((content: string) =>
      transformContent(content, patterns, options),
    );
  });
});

function transformContent(
  content: string,
  patterns: ScramblePattern[],
  options: ScrambleOptions,
): string {
  if (!content || typeof content !== "string") {
    return content;
  }

  const { attribute, className, key } = options;

  // encode manually created tel and mailto links
  content = scrambleHrefAttributes(content, patterns, options);

  for (const pattern of patterns) {
    const regex = createRegex(pattern);

    const matches: Array<{ match: string; index: number }> = [];
    let execResult: RegExpExecArray | null;

    while ((execResult = regex.exec(content)) !== null) {
      matches.push({ match: execResult[0], index: execResult.index });
    }

    for (let i = matches.length - 1; i >= 0; i--) {
      const matchInfo = matches[i];
      if (!matchInfo) continue;
      const { match, index } = matchInfo;
      const beforeMatch = content.substring(0, index);

      const lastOpenTag = beforeMatch.lastIndexOf("<");
      const lastCloseTag = beforeMatch.lastIndexOf(">");

      if (lastOpenTag > lastCloseTag) {
        continue; // dont transform if were inside a tag
      }

      // check if its inside a mailto or tel link
      const hrefMatch = beforeMatch.match(/href=["'][^"']*$/);
      if (hrefMatch) {
        continue;
      }

      // check if already scrambled
      if (beforeMatch.endsWith(`${attribute}="`)) {
        continue;
      }

      const encoded = encode(match, key);
      const placeholder = options.placeholder || "[protected]";
      const replacement = `<span ${attribute}="${encoded}" class="${className}" data-scramble-type="${pattern.name}" aria-hidden="true">${placeholder}</span>`;

      content =
        content.substring(0, index) +
        replacement +
        content.substring(index + match.length);
    }
  }

  return content;
}

function scrambleHrefAttributes(
  content: string,
  patterns: ScramblePattern[],
  options: ScrambleOptions,
): string {
  const { key, placeholder } = options;
  const placeholderText = placeholder || "[protected]";

  const hrefRegex = /href=(["'])(mailto:|tel:)([^"']+)\1/gi;

  return content.replace(hrefRegex, (fullMatch, quote, prefix, value) => {
    const type = prefix.toLowerCase() === "mailto:" ? "email" : "phone";

    const matchingPattern = patterns.find((p) => p.name === type);
    if (!matchingPattern) {
      return fullMatch;
    }

    const encoded = encode(value, key);

    return `href=${quote}#${placeholderText}${quote} data-scramble-href="${encoded}" data-scramble-href-prefix="${prefix}"`;
  });
}
