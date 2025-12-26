import { assertEquals } from "@std/assert";

/**
 * Tests for frontmatter tag handling edge cases.
 *
 * These tests verify the defensive handling of malformed frontmatter tags
 * that was added to prevent crashes in lua_directive.ts when toggling
 * markdown syntax rendering (fixes #1389).
 *
 * The actual fix is in lua_directive.ts where we guard against non-string
 * tags with: typeof tag === "string" && tag.startsWith("meta/template")
 */

// Helper that mimics the tag filtering logic in lua_directive.ts
function hasMetaTemplateTag(tags: unknown[]): boolean {
  return tags.some((tag: unknown) =>
    typeof tag === "string" && tag.startsWith("meta/template")
  );
}

Deno.test("Tag filtering - string tags", () => {
  const tags = ["page", "meta/template", "other"];
  assertEquals(hasMetaTemplateTag(tags), true);
});

Deno.test("Tag filtering - no meta/template tag", () => {
  const tags = ["page", "blog", "notes"];
  assertEquals(hasMetaTemplateTag(tags), false);
});

Deno.test("Tag filtering - empty array", () => {
  const tags: unknown[] = [];
  assertEquals(hasMetaTemplateTag(tags), false);
});

Deno.test("Tag filtering - mixed types do not crash", () => {
  // This is the edge case that caused #1389 - non-string values in tags array
  const tags: unknown[] = ["page", null, undefined, 123, { nested: "object" }];
  // Should not throw, should return false since no valid meta/template string
  assertEquals(hasMetaTemplateTag(tags), false);
});

Deno.test("Tag filtering - mixed types with valid meta/template", () => {
  const tags: unknown[] = [null, "meta/template/blog", undefined, 123];
  assertEquals(hasMetaTemplateTag(tags), true);
});

Deno.test("Tag filtering - number that looks like it could be a tag", () => {
  // Ensure numbers don't get coerced to strings
  const tags: unknown[] = [42];
  assertEquals(hasMetaTemplateTag(tags), false);
});
