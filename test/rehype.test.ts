import { describe, it, expect } from "vitest";
import rehypeScramble from "../src/runtime/content/rehype";
import {
  decode,
  EMAIL_PATTERN,
  PHONE_PATTERN,
} from "../src/runtime/utils/scramble";

const key = "testkey123";

function run(children: unknown[]) {
  const tree = { type: "root", children: children as never[] };
  rehypeScramble({ key, patterns: [EMAIL_PATTERN, PHONE_PATTERN] })(tree);
  return tree.children as unknown[];
}

const text = (value: string) => ({ type: "text", value });
const el = (tagName: string, properties = {}, children: unknown[] = []) => ({
  type: "element",
  tagName,
  properties,
  children,
});

describe("rehypeScramble", () => {
  it("replaces matches in text with scramble-text nodes", () => {
    const [p] = run([
      el("p", {}, [text("Mail a@b.com or call +1 123-456-7891")]),
    ]);

    expect(JSON.stringify(p)).not.toContain("a@b.com");
    expect(p).toMatchObject({
      children: [
        text("Mail "),
        { tagName: "scramble-text", properties: { type: "email" } },
        text(" or call "),
        { tagName: "scramble-text", properties: { type: "phone" } },
      ],
    });
    const node = (p as { children: { properties: { encoded: string } }[] })
      .children[1]!;
    expect(decode(node.properties.encoded, key)).toBe("a@b.com");
  });

  it("collapses autolinks into a single node", () => {
    const [a] = run([el("a", { href: "mailto:a@b.com" }, [text("a@b.com")])]);

    expect(a).toMatchObject({
      tagName: "scramble-text",
      properties: { type: "email" },
      children: [],
    });
    expect(a).not.toHaveProperty("properties.:link");
  });

  it("keeps custom labels as children and hides the href", () => {
    const [a] = run([el("a", { href: "tel:+43%20123" }, [text("Call us")])]);

    expect(JSON.stringify(a)).not.toContain("+43");
    expect(a).toMatchObject({
      tagName: "scramble-text",
      properties: { type: "phone", ":link": "true" },
      children: [text("Call us")],
    });
    const node = a as { properties: { encoded: string } };
    expect(decode(node.properties.encoded, key)).toBe("+43 123");
  });

  it("disables links for matches inside other links", () => {
    const [a] = run([el("a", { href: "/contact" }, [text("a@b.com")])]);

    expect(a).toMatchObject({
      tagName: "a",
      children: [
        { tagName: "scramble-text", properties: { ":link": "false" } },
      ],
    });
  });

  it("skips code blocks", () => {
    const pre = el("pre", { code: "a@b.com" }, [
      el("code", {}, [text("a@b.com")]),
    ]);
    expect(run([pre])).toEqual([pre]);
  });
});
