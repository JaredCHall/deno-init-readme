import { DocumentMaker } from './DocumentMaker.ts'
import { DocumentBadge } from './DocumentBadge.ts'
import { parse } from '@std/jsonc'
import {DocumentSection} from "./DocumentSection.ts";

const USAGE = `Usage:
  deno run --allow-read[ --allow-write] mod.ts [options]

Permissions:
  --allow-read      Always required (reads deno.json[c])
  --allow-write     Required unless --dry-run is used

Options:
  --dry-run         Print the README.md to stdout instead of writing to disk
  --force           Overwrite README.md if it already exists
  --help            Show this help message`

interface ModuleSettings {
	name: string
	jsrScope: string,
	jsrModule: string,
	description?: string
	githubPath?: string
	githubRepo?: string,
	githubUser?: string,
}


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

function makeBadges(settings: ModuleSettings): DocumentBadge[] {
	const badges = [
		new DocumentBadge(
				'jsr',
				`https://img.shields.io/badge/jsr--%40${settings.jsrScope}%2F${settings.jsrModule}-blue?logo=deno`,
				`https://jsr.io/@${settings.jsrScope}/${settings.jsrModule}`
		)
	];

	if (settings.githubUser && settings.githubRepo) {
		badges.push(
				new DocumentBadge(
						'GitHub',
						`https://img.shields.io/badge/GitHub-${settings.githubUser}/${settings.githubRepo}-blue?logo=github`,
						`https://github.com/${settings.githubUser}/${settings.githubRepo}`
				)
		);
	}

	return badges;
}


function makeModuleSettings(config: Record<string, unknown>): ModuleSettings {
	if (typeof config.name !== 'string' || !config.name.startsWith('@')) {
		throw new Error(
				'Missing or malformed "name" field in deno.json(c). Expected "@scope/module" for JSR modules.'
		);
	}

	const [jsrScope, jsrModule] = config.name.slice(1).split('/');
	const settings: ModuleSettings = {
		name: config.name,
		jsrScope,
		jsrModule
	};

	if (typeof config.description === 'string') {
		settings.description = config.description;
	}

	if (typeof config.githubPath === 'string' && config.githubPath.includes('/')) {
		const [githubUser, githubRepo] = config.githubPath.split('/');
		settings.githubUser = githubUser;
		settings.githubRepo = githubRepo;
		settings.githubPath = config.githubPath;
	}

	return settings;
}

async function parseDenoConfig(): Promise<Record<string, unknown>> {
	try {
		const text = await Deno.readTextFile('deno.jsonc')
				.catch(() => Deno.readTextFile('deno.json'));
		return parse(text) as Record<string, unknown>;
	} catch {
		throw new Error('Failed to read deno.json(c).');
	}
}

async function fileExists(path: string): Promise<boolean> {
	try {
		await Deno.stat(path);
		return true;
	} catch {
		return false;
	}
}