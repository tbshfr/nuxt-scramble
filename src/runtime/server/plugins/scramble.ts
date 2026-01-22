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

    if (!options?.enabled) {
      return;
    }

    const patterns = getAllPatterns(options);

    if (patterns.length === 0) {
      return;
    }

    html.body = html.body.map((content: string) =>
      transformContent(content, patterns, options.attribute, options.className),
    );
  });
});

function transformContent(
  content: string,
  patterns: ScramblePattern[],
  attribute: string,
  className: string,
): string {
  if (!content || typeof content !== "string") {
    return content;
  }

  const result = content.replace(/(?<=>)([^<]+)(?=<)/g, (match) =>
    transformTextNode(match, patterns, attribute, className),
  );

  return result;
}

function transformTextNode(
  text: string,
  patterns: ScramblePattern[],
  attribute: string,
  className: string,
): string {
  let result = text;

  for (const pattern of patterns) {
    const regex = createRegex(pattern);

    result = result.replace(regex, (match) => {
      // skip if already inside a scrambled element
      const encoded = encode(match);
      return `<span ${attribute}="${encoded}" class="${className}" data-scramble-type="${pattern.name}"></span>`;
    });
  }

  return result;
}
