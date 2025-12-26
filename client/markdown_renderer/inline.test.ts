import { assertEquals } from "@std/assert";
import {
  extractTransclusion,
  parseDimensionFromAlias,
} from "./inline.ts";

Deno.test("parseDimensionFromAlias - basic alias", () => {
  const result = parseDimensionFromAlias("my image");
  assertEquals(result, { alias: "my image", dimension: undefined });
});

Deno.test("parseDimensionFromAlias - alias with dimensions", () => {
  const result = parseDimensionFromAlias("my image|100x200");
  assertEquals(result, {
    alias: "my image",
    dimension: { width: 100, height: 200 },
  });
});

Deno.test("parseDimensionFromAlias - width only", () => {
  const result = parseDimensionFromAlias("alt text|300");
  assertEquals(result, {
    alias: "alt text",
    dimension: { width: 300 },
  });
});

Deno.test("parseDimensionFromAlias - dimensions without alias", () => {
  const result = parseDimensionFromAlias("100x200");
  assertEquals(result, {
    alias: "",
    dimension: { width: 100, height: 200 },
  });
});

Deno.test("parseDimensionFromAlias - empty string", () => {
  const result = parseDimensionFromAlias("");
  assertEquals(result, { alias: "", dimension: undefined });
});

Deno.test("extractTransclusion - no details returns full markdown", () => {
  const markdown = "# Hello\n\nSome content";
  const result = extractTransclusion(markdown, undefined);
  assertEquals(result, markdown);
});

Deno.test("extractTransclusion - non-header details returns null", () => {
  const markdown = "# Hello\n\nSome content";
  const result = extractTransclusion(markdown, { type: "pos", pos: 5 });
  assertEquals(result, null);
});

Deno.test("extractTransclusion - header extraction", () => {
  const markdown = `# First

Content under first

## Second

Content under second

## Third

Content under third`;

  const result = extractTransclusion(markdown, {
    type: "header",
    header: "Second",
  });
  assertEquals(result, "## Second\n\nContent under second\n\n");
});

Deno.test("extractTransclusion - header at end of document", () => {
  const markdown = `# First

Content

## Last

Final content`;

  const result = extractTransclusion(markdown, {
    type: "header",
    header: "Last",
  });
  assertEquals(result, "## Last\n\nFinal content");
});

Deno.test("extractTransclusion - header not found", () => {
  const markdown = "# Hello\n\nSome content";
  const result = extractTransclusion(markdown, {
    type: "header",
    header: "NonExistent",
  });
  assertEquals(result, null);
});
