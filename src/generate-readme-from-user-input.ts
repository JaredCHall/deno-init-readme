import { DocumentMaker } from './DocumentMaker.ts'
import { DocumentBadge } from './DocumentBadge.ts'
import { parse } from '@std/jsonc'

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
export async function generateReadmeFromUserInput(): Promise<boolean> {
	if (Deno.args.includes('--help')) {
		console.log(USAGE)
		return false
	}

	const dryRun = Deno.args.includes('--dry-run')
	const force = Deno.args.includes('--force')

	let scope = ''
	let moduleName = ''
	let githubUser = ''
	let githubRepo = ''
	let description = ''

	try {
		let denoConfigText = ''
		try {
			denoConfigText = await Deno.readTextFile('deno.jsonc')
		} catch {
			denoConfigText = await Deno.readTextFile('deno.json')
		}

		const config = parse(denoConfigText) as Record<string, unknown>

		if (typeof config.name !== 'string' || !config.name.startsWith('@')) {
			throw new Error('❌ Missing or malformed "name" field in deno.json(c) — expected "@scope/module". This is required for JSR modules.\n')
		}
		;[scope, moduleName] = config.name.slice(1).split('/')

		if (typeof config.description === 'string') {
			description = config.description
		}

		if (typeof config.githubPath === 'string' && config.githubPath.includes('/')) {
			[githubUser, githubRepo] = config.githubPath.split('/')
		}
	} catch (err) {
		console.error(`❌ ${err instanceof Error ? err.message : 'Failed to parse deno.json(c).'}`)
		return false
	}

	if (!description) {
		description = prompt('Description?') ?? ''
	}

	if (!githubUser || !githubRepo) {
		const githubPath = prompt('GitHub path (user/repo)?') ?? ''
		if (githubPath.includes('/')) {
			[githubUser, githubRepo] = githubPath.split('/')
		} else {
			console.error('❌ Invalid GitHub path. Expected format: user/repo')
			return false
		}
	}

	const badges = [
		new DocumentBadge(
				'jsr',
				`https://img.shields.io/badge/jsr--%40${scope}%2F${moduleName}-blue?logo=deno`,
				`https://jsr.io/@${scope}/${moduleName}`
		),
		new DocumentBadge(
				'Tests',
				`https://github.com/${githubUser}/${githubRepo}/actions/workflows/ci.yml/badge.svg`,
				`https://github.com/${githubUser}/${githubRepo}/actions/workflows/ci.yml`
		),
	]

	const maker = new DocumentMaker({
		projectName: moduleName,
		projectDescription: description,
		badges,
	})

	const markdown = maker.makeDoc()

	if (dryRun) {
		console.log(markdown)
		return true
	}

	try {
		await Deno.stat('README.md')
		if (!force) {
			console.error('❌ README.md already exists. Use --force to overwrite.')
			return false
		}
	} catch {
		// File does not exist — OK to write
	}

	await Deno.writeTextFile('README.md', markdown)
	console.log('✅ README.md generated.')
	return true
}
