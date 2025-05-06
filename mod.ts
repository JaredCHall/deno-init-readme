export { DocumentSection } from "./src/DocumentSection.ts";
export { DocumentBadge } from "./src/DocumentBadge.ts";
export { DocumentMaker, type DocumentProperties } from "./src/DocumentMaker.ts";

// CLI entry point
if (import.meta.main) {
  const { generateReadmeFromUserInput } = await import("./src/generate-readme-from-user-input.ts");
  await generateReadmeFromUserInput()

  Deno.exit(0);
}
