export { DocumentSection } from "./src/DocumentSection.ts";
export { DocumentBadge } from "./src/DocumentBadge.ts";
export { DocumentMaker } from "./src/DocumentMaker.ts";

// CLI entry point
if (import.meta.main) {
  const { generateReadme } = await import("./src/generate-readme.ts");

  try {
    await generateReadme();
    console.log('%c✅ README.md generated.', 'color:limegreen');
    Deno.exit(0);
  } catch (err) {
    console.error('%c❌ %s', 'color:indianred', err instanceof Error ? err.message : String(err));
    Deno.exit(1);
  }
}
