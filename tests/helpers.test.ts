// deno-lint-ignore-file require-await
import { makeBadges, makeModuleSettings, parseDenoConfig } from '../src/helpers.ts'
import { assertArrayIncludes, assertEquals, assertRejects, assertThrows } from '@std/assert'
import {CommandError} from "../src/errors.ts";

Deno.test('makeModuleSettings throws on malformed name', () => {
	assertThrows(
		() => makeModuleSettings({ name: 'invalid' }),
		Error,
		'Missing or malformed "name" field',
	)
})

Deno.test('makeModuleSettings parses valid input', () => {
	const config = {
		name: '@cool/module',
		description: 'A neat module',
		githubPath: 'octocat/neat',
	}

	const settings = makeModuleSettings(config)

	assertEquals(settings.name, '@cool/module')
	assertEquals(settings.jsrScope, 'cool')
	assertEquals(settings.jsrModule, 'module')
	assertEquals(settings.description, 'A neat module')
	assertEquals(settings.githubUser, 'octocat')
	assertEquals(settings.githubRepo, 'neat')
	assertEquals(settings.githubPath, 'octocat/neat')
})

Deno.test('makeBadges returns jsr and GitHub badges when info is present', () => {
	const settings = makeModuleSettings({
		name: '@org/lib',
		githubPath: 'foo/bar',
	})

	const badges = makeBadges(settings).map((b) => b.toMarkdown())

	assertEquals(badges.length, 2)
	assertArrayIncludes(badges, [
		`[![jsr](https://img.shields.io/badge/jsr--%40org%2Flib-blue?logo=deno)](https://jsr.io/@org/lib)`,
		`[![GitHub](https://img.shields.io/badge/GitHub-foo/bar-blue?logo=github)](https://github.com/foo/bar)`,
	])
})

Deno.test('makeBadges returns only jsr badge when GitHub info is absent', () => {
	const settings = makeModuleSettings({
		name: '@org/lib',
	})

	const badges = makeBadges(settings).map((b) => b.toMarkdown())

	assertEquals(badges.length, 1)
	assertEquals(
		badges[0],
		`[![jsr](https://img.shields.io/badge/jsr--%40org%2Flib-blue?logo=deno)](https://jsr.io/@org/lib)`,
	)
})

Deno.test('parseDenoConfig falls back to deno.json if deno.jsonc is missing', async () => {
	const mockReadFn: typeof Deno.readTextFile = async (path: string | URL): Promise<string> => {
		if (path === 'deno.jsonc') throw new Error('no jsonc')
		if (path === 'deno.json') return `{"name": "@fallback/module"}`
		throw new Error('Unexpected file path')
	}

	const config = await parseDenoConfig(mockReadFn)
	assertEquals(config.name, '@fallback/module')
})

Deno.test('parseDenoConfig throws if deno.json and deno.jsonc are missing', async () => {
	const mockReadFn: typeof Deno.readTextFile = async (): Promise<string> => {
		throw new Error('no jsonc')
	}

	await assertRejects(() => parseDenoConfig(mockReadFn), CommandError, 'Failed to read deno.json(c).')
})
