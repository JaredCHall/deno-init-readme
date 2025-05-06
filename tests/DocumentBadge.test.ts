import { assertEquals } from "@std/assert";
import { DocumentBadge } from "../src/DocumentBadge.ts";

Deno.test("DocumentBadge: toMarkdown() without link", () => {
  const badge = new DocumentBadge("Build Status", "https://example.com/build.svg");
  const expected = "![Build Status](https://example.com/build.svg)";
  assertEquals(badge.toMarkdown(), expected);
});

Deno.test("DocumentBadge: toMarkdown() with link", () => {
  const badge = new DocumentBadge(
      "Coverage",
      "https://example.com/coverage.svg",
      "https://example.com/coverage"
  );
  const expected = "[![Coverage](https://example.com/coverage.svg)](https://example.com/coverage)";
  assertEquals(badge.toMarkdown(), expected);
});
