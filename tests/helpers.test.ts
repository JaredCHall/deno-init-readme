// deno-lint-ignore-file require-await
import { fileExists, makeBadges, makeModuleSettings, parseDenoConfig } from '../src/helpers.ts'
import { assertArrayIncludes, assertEquals, assertRejects, assertThrows } from '@std/assert'
import { stub } from '@testing/mock'

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

Deno.test('fileExists returns true if file exists', async () => {
	const statStub = stub(Deno, 'stat', async () => ({ isFile: true } as Deno.FileInfo))
	try {
		const result = await fileExists('README.md')
		assertEquals(result, true)
	} finally {
		statStub.restore()
	}
})

Deno.test('fileExists returns false if file does not exist', async () => {
	const statStub = stub(Deno, 'stat', async () => {
		throw new Error('Not found')
	})
	try {
		const result = await fileExists('README.md')
		assertEquals(result, false)
	} finally {
		statStub.restore()
	}
})

Deno.test('parseDenoConfig falls back to deno.json if deno.jsonc is missing', async () => {
	const stubReadTextFile = stub<typeof Deno, 'readTextFile'>(
		Deno,
		'readTextFile',
		async (path: string | URL) => {
			if (path === 'deno.jsonc') throw new Error('no jsonc')
			if (path === 'deno.json') return `{"name": "@fallback/module"}`
			throw new Error('Unexpected file path')
		},
	)

	try {
		const config = await parseDenoConfig()
		assertEquals(config.name, '@fallback/module')
	} finally {
		stubReadTextFile.restore()
	}
})

Deno.test('parseDenoConfig throws if deno.json and deno.jsonc are missing', async () => {
	const stubReadTextFile = stub<typeof Deno, 'readTextFile'>(
		Deno,
		'readTextFile',
		async (_path: string | URL) => {
			throw new Error('no jsonc')
		},
	)

	await assertRejects(() => parseDenoConfig(), Error, 'Failed to read deno.json(c).')

	stubReadTextFile.restore()
})
