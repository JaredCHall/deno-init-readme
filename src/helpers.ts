import { DocumentBadge } from './DocumentBadge.ts'
import {CommandError} from "./errors.ts";
import { parse } from '@std/jsonc'
import type {ModuleSettings} from "./types.ts";

export function makeModuleSettings(config: Record<string, unknown>): ModuleSettings {
	if (typeof config.name !== 'string' || !config.name.startsWith('@')) {
		throw new Error(
			'Missing or malformed "name" field in deno.json(c). Expected "@scope/module" for JSR modules.',
		)
	}

	const [jsrScope, jsrModule] = config.name.slice(1).split('/')
	const settings: ModuleSettings = {
		name: config.name,
		jsrScope,
		jsrModule,
	}

	if (typeof config.description === 'string') {
		settings.description = config.description
	}

	if (typeof config.githubPath === 'string' && config.githubPath.includes('/')) {
		const [githubUser, githubRepo] = config.githubPath.split('/')
		settings.githubUser = githubUser
		settings.githubRepo = githubRepo
		settings.githubPath = config.githubPath
	}

	return settings
}

export function makeBadges(settings: ModuleSettings): DocumentBadge[] {
	const badges = [
		new DocumentBadge(
			'jsr',
			`https://img.shields.io/badge/jsr--%40${settings.jsrScope}%2F${settings.jsrModule}-blue?logo=deno`,
			`https://jsr.io/@${settings.jsrScope}/${settings.jsrModule}`,
		),
	]

	if (settings.githubUser && settings.githubRepo) {
		badges.push(
			new DocumentBadge(
				'GitHub',
				`https://img.shields.io/badge/GitHub-${settings.githubUser}/${settings.githubRepo}-blue?logo=github`,
				`https://github.com/${settings.githubUser}/${settings.githubRepo}`,
			),
		)
	}

	return badges
}

export async function parseDenoConfig(readFn: typeof Deno.readTextFile = Deno.readTextFile): Promise<Record<string, unknown>> {
	try {
		const text = await readFn('deno.jsonc')
			.catch(() => readFn('deno.json'))
		return parse(text) as Record<string, unknown>
	} catch {
		throw new CommandError('Failed to read deno.json(c).')
	}
}