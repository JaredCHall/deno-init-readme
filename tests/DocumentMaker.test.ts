import { assertStringIncludes } from "@std/assert"
import { DocumentMaker } from "../src/DocumentMaker.ts"
import { DocumentBadge } from "../src/DocumentBadge.ts"

Deno.test("DocumentMaker generates all sections as expected", () => {
	const maker = new DocumentMaker()

	const badges = [
		new DocumentBadge("jsr:@scope/awesome-module", "https://jsr.io/@scope/awesome-module"),
		new DocumentBadge("Tests", "https://github.com/your-org/awesome-module/actions/workflows/ci.yml")
	]

	const titleSection = maker.makeTitleSection("awesome-module", "Does awesome things for Deno users", badges)
	assertStringIncludes(titleSection.toString(), "# awesome-module")
	assertStringIncludes(titleSection.toString(), "Does awesome things for Deno users")
	assertStringIncludes(titleSection.toString(), "![jsr")
	assertStringIncludes(titleSection.toString(), "![Tests")

	const usageSection = maker.makeUsageSection("deno run jsr:@scope/awesome-module")
	assertStringIncludes(usageSection.toString(), "```bash")
	assertStringIncludes(usageSection.toString(), "deno run jsr:@scope/awesome-module")

	const advancedUsageSection = maker.makeAdvancedUsageSection(
			`import { MyModule } from "jsr:@scope/awesome-module";`
	)
	assertStringIncludes(advancedUsageSection.toString(), "```typescript")
	assertStringIncludes(advancedUsageSection.toString(), `import { MyModule }`)
})
