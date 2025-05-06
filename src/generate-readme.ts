import { DocumentMaker } from './DocumentMaker.ts'
import { DocumentSection } from "./DocumentSection.ts";
import { makeBadges, makeModuleSettings, parseDenoConfig, fileExists } from './helpers.ts'

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
	if (Deno.args.includes('--help')) {
		console.log(USAGE)
		return false
	}

	const dryRun = Deno.args.includes('--dry-run')
	const force = Deno.args.includes('--force')

	const config = await parseDenoConfig()
	const settings = makeModuleSettings(config)
	const badges = makeBadges(settings)
	const maker = new DocumentMaker()

	const markdown = [
		maker.makeTitleSection(settings.jsrScope + '/' + settings.jsrModule, settings.description ?? "", badges),
		maker.makeUsageSection(`deno run jsr:${settings.name}`),
		maker.makeAdvancedUsageSection(`import { YourModule } from "jsr:${settings.name}";\n\nnew YourModule.engage();`)
	].reduce(
			(section, carry) => section.concat(carry),
			new DocumentSection('')
	).toString()

	if (dryRun) {
		console.log(markdown)
		return true
	}

	if(await fileExists('README.md') && !force){
		throw new Error('README.md already exists. Use --force to overwrite.')
	}

	await Deno.writeTextFile('README.md', markdown)
	return true
}