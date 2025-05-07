import { DocumentMaker } from './DocumentMaker.ts'
import type { ModuleSettings } from './helpers.ts'
import type { DocumentBadge } from './DocumentBadge.ts'

export function generateReadmeMarkdown(
	settings: ModuleSettings,
	badges: DocumentBadge[],
): string {
	const maker = new DocumentMaker()

	return [
		maker.makeTitleSection(`${settings.jsrScope}/${settings.jsrModule}`, settings.description ?? '', badges),
		maker.makeUsageSection(`deno run jsr:${settings.name}`),
		maker.makeAdvancedUsageSection(
			`import { YourModule } from "jsr:${settings.name}";\n\nnew YourModule.engage();`,
		),
	].map((section) => section.toString()).join('\n\n')
}
