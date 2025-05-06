import { assertEquals, assert } from "@std/assert";
import { DocumentSection } from "../src/DocumentSection.ts";

Deno.test("DocumentSection: trims input and handles undefined/null", () => {
  const section1 = new DocumentSection("  Hello World  ");
  const section2 = new DocumentSection(undefined);
  const section3 = new DocumentSection(null);

  assertEquals(section1.content, "Hello World");
  assertEquals(section2.content, "");
  assertEquals(section3.content, "");
});

Deno.test("DocumentSection: isEmpty() works correctly", () => {
  const empty = new DocumentSection("");
  const nonEmpty = new DocumentSection("Text");

  assert(empty.isEmpty());
  assert(!nonEmpty.isEmpty());
});

Deno.test("DocumentSection: toString() returns the content", () => {
  const section = new DocumentSection("Sample text");
  assertEquals(section.toString(), "Sample text");
});

Deno.test("DocumentSection: concat() with empty sections", () => {
  const empty = new DocumentSection("");
  const nonEmpty = new DocumentSection("Some content");

  assertEquals(empty.concat(nonEmpty).toString(), "Some content");
  assertEquals(nonEmpty.concat(empty).toString(), "Some content");
  assertEquals(empty.concat(empty).toString(), "");
});

Deno.test("DocumentSection: concat() with two non-empty sections", () => {
  const a = new DocumentSection("First");
  const b = new DocumentSection("Second");
  const result = a.concat(b);

  assertEquals(result.toString(), "First\n\nSecond");
});
