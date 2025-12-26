import { assertEquals } from "@std/assert";
import { extractSpaceLuaFromPageText, loadConfig } from "./boot_config.ts";

Deno.test("Test boot config", () => {
  // One block present
  assertEquals(
    extractSpaceLuaFromPageText("Hello\n\n```space-lua\ntest()\n```\nMore"),
    "test()",
  );
  // Two blocks present
  assertEquals(
    extractSpaceLuaFromPageText(
      "Hello\n\n```space-lua\ntest()\n```\nMore\n\n```space-lua\ntest2()\n```",
    ),
    "test()\ntest2()",
  );
  // No lua present
  assertEquals(
    extractSpaceLuaFromPageText("Hello\n\n```lua\ntest()\n```\nMore"),
    "",
  );
});

Deno.test("Test CONFIG lua eval", async () => {
  // Test base case: no config code
  let config = await loadConfig("", {});
  assertEquals(config.values, {});

  // Check a few config sets
  config = await loadConfig(
    `
    config.set {
      option1 = "pete"
    }
    config.set("optionObj.nested", 5)
`,
    {},
  );
  assertEquals(config.values, {
    option1: "pete",
    optionObj: {
      nested: 5,
    },
  });

  // Check random Lua code crap resilience
  config = await loadConfig(
    `
    config.set {
      option1 = "pete"
    }
    slashCommand.define {}
    local shouldSet = true
    if shouldSet then
      config.set("optionObj.nested", 5)
    end
`,
    {},
  );
  assertEquals(config.values, {
    option1: "pete",
    optionObj: {
      nested: 5,
    },
  });
});

Deno.test("Test CONFIG syntax error resilience", async () => {
  // Syntax error in Lua code should not crash, should return empty config
  // This tests fix for #1679
  const config = await loadConfig(
    `
    config.set {
      option1 = "pete"
    -- Missing closing brace causes parse error
`,
    {},
  );
  // Should return empty config instead of throwing
  assertEquals(config.values, {});
});

Deno.test("Test CONFIG partial syntax error", async () => {
  // Even with invalid syntax, the app should boot with empty config
  const config = await loadConfig("this is not valid lua {{{", {});
  assertEquals(config.values, {});
});
