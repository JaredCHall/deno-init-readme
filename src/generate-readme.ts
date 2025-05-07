import { fileExists, makeBadges, makeModuleSettings, parseDenoConfig } from './helpers.ts'
import { generateReadmeMarkdown } from './core.ts'

const USAGE = `Usage:
  deno run --allow-read[ --allow-write] mod.ts [options]

Permissions:
  --allow-read      Always required (reads deno.json[c])
  --allow-write     Required unless --dry-run is used

Options:
  --dry-run         Print the README.md to stdout instead of writing to disk
  --force           Overwrite README.md if it already exists
  --help            Show this help message`

/** Generates a README.md file from user input */
export async function generateReadme(): Promise<boolean> {
	const args = new Set(Deno.args)
	const dryRun = args.has('--dry-run')
	const force = args.has('--force')
	const help = args.has('--help')

	if (help) {
		console.log(USAGE)
		return false
	}

	const config = await parseDenoConfig()
	const settings = makeModuleSettings(config)
	const badges = makeBadges(settings)
	const markdown = generateReadmeMarkdown(settings, badges)

	if (dryRun) {
		console.log(markdown)
		return true
	}

	if (await fileExists('README.md') && !force) {
		throw new Error('README.md already exists. Use --force to overwrite.')
	}

	await Deno.writeTextFile('README.md', markdown)
	return true
}
