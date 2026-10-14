import {
  encode,
  createRegex,
  getLinkPrefix,
  type ScramblePattern,
} from "../utils/scramble";

export interface RehypeScrambleOptions {
  key: string;
  patterns: ScramblePattern[];
}

interface HastText {
  type: "text";
  value: string;
}

interface HastElement {
  type: "element";
  tagName: string;
  properties?: Record<string, unknown>;
  children: HastNode[];
}

interface HastParent {
  type: string;
  children: HastNode[];
}

type HastNode = HastText | HastElement | { type: string };

const COMPONENT_TAG = "scramble-text";

// highlighted code blocks keep their raw source in a code prop - scrambling
// the text nodes would not remove it and would break highlighting
const SKIP_TAGS = new Set(["pre", "script", "style", COMPONENT_TAG]);

const LINK_TYPES: ScramblePattern["name"][] = ["email", "phone"];

// rehype plugin for @nuxt/content that replaces matches with <ScrambleText> nodes at parse time
// this keeps the plain values out of the content database and payload, and the
// vdom matches the server html so there are should be no hydration mismatches
export default function rehypeScramble(options: RehypeScrambleOptions) {
  const { key } = options;
  const patterns = options.patterns.map((pattern) => {
    const regex = createRegex(pattern);
    return {
      name: pattern.name,
      regex: regex.global ? regex : new RegExp(regex, `${regex.flags}g`),
    };
  });
  const linkTypes = new Set(
    LINK_TYPES.filter((type) => patterns.some((p) => p.name === type)),
  );

  function scrambleText(
    value: string,
    insideLink: boolean,
  ): HastNode[] | undefined {
    let nodes: (HastText | HastElement)[] = [{ type: "text", value }];
    let changed = false;

    for (const pattern of patterns) {
      nodes = nodes.flatMap((node) => {
        if (node.type !== "text") {
          return [node];
        }

        const parts: (HastText | HastElement)[] = [];
        let lastIndex = 0;

        for (const match of node.value.matchAll(pattern.regex)) {
          if (match[0].length === 0) {
            continue;
          }
          if (match.index > lastIndex) {
            parts.push({
              type: "text",
              value: node.value.slice(lastIndex, match.index),
            });
          }
          // a link inside a link is invalid html
          parts.push(
            createNode(match[0], pattern.name, insideLink ? false : undefined),
          );
          lastIndex = match.index + match[0].length;
        }

        if (parts.length === 0) {
          return [node];
        }

        changed = true;
        if (lastIndex < node.value.length) {
          parts.push({ type: "text", value: node.value.slice(lastIndex) });
        }
        return parts;
      });
    }

    return changed ? nodes : undefined;
  }

  function createNode(
    value: string,
    type: ScramblePattern["name"],
    link?: boolean,
    children: HastNode[] = [],
  ): HastElement {
    const properties: Record<string, unknown> = {
      encoded: encode(value, key),
      type,
    };
    if (link !== undefined) {
      // `:` makes the mdc renderer pass a boolean instead of the string "false"
      properties[":link"] = String(link);
    }
    return { type: "element", tagName: COMPONENT_TAG, properties, children };
  }

  function scrambleLink(element: HastElement): HastElement | undefined {
    const href = element.properties?.href;
    if (typeof href !== "string") {
      return;
    }

    const type = [...linkTypes].find((t) =>
      href.toLowerCase().startsWith(getLinkPrefix(t)!),
    );
    if (!type) {
      return;
    }

    let value = href.slice(getLinkPrefix(type)!.length);
    try {
      value = decodeURIComponent(value);
    } catch {
      // keep the raw value if it is not valid uri encoding
    }

    // autolinks (<mail@example.com> and gfm bare emails) only repeat the address, so
    // render them like any other match and let the autoLink option decide
    if (
      element.children.length === 1 &&
      element.children[0]!.type === "text" &&
      (element.children[0] as HastText).value === value
    ) {
      return createNode(value, type);
    }

    transformChildren(element, true);
    return createNode(value, type, true, element.children);
  }

  function transformChildren(parent: HastParent, insideLink: boolean): void {
    const children: HastNode[] = [];

    for (const child of parent.children) {
      if (child.type === "text") {
        const replaced = scrambleText((child as HastText).value, insideLink);
        children.push(...(replaced ?? [child]));
        continue;
      }

      if (child.type !== "element") {
        children.push(child);
        continue;
      }

      const element = child as HastElement;
      if (SKIP_TAGS.has(element.tagName)) {
        children.push(element);
        continue;
      }

      if (element.tagName === "a") {
        const replaced = scrambleLink(element);
        if (replaced) {
          children.push(replaced);
          continue;
        }
        transformChildren(element, true);
        children.push(element);
        continue;
      }

      transformChildren(element, insideLink);
      children.push(element);
    }

    parent.children = children;
  }

  return (tree: HastParent) => {
    if (patterns.length > 0) {
      transformChildren(tree, false);
    }
  };
}
