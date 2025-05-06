import { DocumentMaker } from './DocumentMaker.ts'
import { DocumentBadge } from './DocumentBadge.ts'

/** Generates a README.md file from user input */
export async function generateReadmeFromUserInput(): Promise<void> {
	const name = prompt('Project name:')
	const desc = prompt('Description?')
	const includeAdvanced = confirm('Include advanced usage section?')

	const maker = new DocumentMaker({
		projectName: name ?? '',
		projectDescription: desc ?? '',
		hasAdvancedUsage: includeAdvanced ?? true,
		badges: [
			new DocumentBadge('CI', 'https://example.com/ci.svg', 'https://ci.example.com'),
		],
	})

	const markdown = maker.makeDoc()
	await Deno.writeTextFile('README.md', markdown)
}
