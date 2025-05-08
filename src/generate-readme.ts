import { makeBadges, makeModuleSettings, parseDenoConfig } from './helpers.ts'
import { generateReadmeMarkdown } from './core.ts'
import { exists } from '@std/fs/exists'
import {CommandError} from "./errors.ts";

const USAGE = `Usage:
  deno run --allow-read[ --allow-write] mod.ts [options]

Permissions:
  --allow-read      Always required (reads deno.json[c])
  --allow-write     Required unless --dry-run is used

Options:
  --dry-run         Print the README.md to stdout instead of writing to disk
  --force           Overwrite README.md if it already exists
  --help            Show this help message`


interface Injects {
	readFileFn: typeof Deno.readTextFile
	writeFileFn: typeof Deno.writeTextFile
	logFn: typeof console.log
	existsFn: typeof exists
	args: typeof Deno.args
}


/** Generates a README.md file from user input */
export async function generateReadme(injects: Injects = {
	readFileFn: Deno.readTextFile,
	writeFileFn: Deno.writeTextFile,
	logFn: console.log,
	existsFn: exists,
	args: Deno.args,
}): Promise<boolean> {
	const args = new Set(injects.args)
	const dryRun = args.has('--dry-run')
	const force = args.has('--force')
	const help = args.has('--help')

	if (help) {
		injects.logFn(USAGE)
		return false
	}

	const config = await parseDenoConfig(injects.readFileFn)
	const settings = makeModuleSettings(config)
	const badges = makeBadges(settings)
	const markdown = generateReadmeMarkdown(settings, badges)

	if (dryRun) {
		injects.logFn(markdown)
		return true
	}

	if (await injects.existsFn('README.md') && !force) {
		throw new CommandError('README.md already exists. Use --force to overwrite.')
	}

	await injects.writeFileFn('README.md', markdown)
	return true
}
