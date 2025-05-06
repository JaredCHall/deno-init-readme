// deno-lint-ignore-file require-await
import {assertEquals, assertStringIncludes} from '@std/assert'
import { stub } from '@testing/mock'

// Dynamically import to ensure we don't trigger import.meta.main logic
const cliModule = await import('../src/generate-readme-from-user-input.ts')
const { generateReadmeFromUserInput: generateReadmeFromUserInputTest } = cliModule

function makeConfigStub(config: string | Record<string, unknown>) {
	const json = typeof config === 'string' ? config : JSON.stringify(config, null, 2)
	return stub(Deno, 'readTextFile', async () => json)
}

Deno.test('generateReadmeFromUserInput uses config and supports dry-run', async () => {
	Deno.args.splice(0, Deno.args.length, '--dry-run')

	const readStub = makeConfigStub({
		"name": "@example/test-project",
		"description": "A test module.",
		"githubPath": "exampleuser/test-project"
	})

	let output = ''
	const logStub = stub(console, 'log', (msg?: unknown) => {
		if (typeof msg === 'string') output += msg + '\n'
	})

	try {
		const result = await generateReadmeFromUserInputTest()

		assertEquals(result, true)
		assertEquals(
				output.trim(),
				`# test-project

[![jsr](https://img.shields.io/badge/jsr--%40example%2Ftest-project-blue?logo=deno)](https://jsr.io/@example/test-project)
[![Tests](https://github.com/exampleuser/test-project/actions/workflows/ci.yml/badge.svg)](https://github.com/exampleuser/test-project/actions/workflows/ci.yml)

A test module.

## Usage

\`\`\`bash
deno run jsr:@your/module
\`\`\`

## Advanced Usage

\`\`\`typescript
import { YourModule } from "jsr:@your/module";

new YourModule.engage();
\`\`\``.trim(),
		)
	} finally {
		readStub.restore()
		logStub.restore()
		Deno.args.splice(0, Deno.args.length)
	}
})


Deno.test(`generateReadmeFromUserInput handles prompts`, async () => {
	Deno.args.splice(0, Deno.args.length)

	const promptStub = stub(globalThis, 'prompt', (msg?: string) => {
		if (msg?.includes('Description')) return 'Some description'
		if (msg?.includes('GitHub path')) return 'exampleuser/example'
		return null
	})

	const confirmStub = stub(globalThis, 'confirm', (_msg?: string) => undefined as unknown as boolean)

	const statStub = stub<typeof Deno, 'stat'>(
			Deno,
			'stat',
			async (_path) => { throw new Error('Not found') },
	)

	const readStub = makeConfigStub({
		"name": "@example/example"
	})

	let writtenContent = ''
	const writeStub = stub<typeof Deno, 'writeTextFile'>(
			Deno,
			'writeTextFile',
			async (_path, data) => {
				writtenContent = typeof data === 'string' ? data : '[streamed content]'
			},
	)

	try {
		await generateReadmeFromUserInputTest()

		assertEquals(
				writtenContent.startsWith('# '),
				true,
				'Output should have a title header even if blank',
		)
		assertEquals(
				writtenContent.includes('Advanced Usage'),
				true,
				'Advanced usage section should still be present',
		)
		assertEquals(
				writtenContent.includes('Some description'),
				true,
				'Provided description should be in README',
		)

	} finally {
		promptStub.restore()
		confirmStub.restore()
		statStub.restore()
		readStub.restore()
		writeStub.restore()
		Deno.args.splice(0, Deno.args.length)
	}
})


Deno.test('generateReadmeFromUserInput parses deno.json fallback', async () => {
	Deno.args.splice(0, Deno.args.length, '--dry-run')

	const readStub = stub<typeof Deno, 'readTextFile'>(
			Deno,
			'readTextFile',
			async (path: string | URL, _options?: unknown) => {
				if (path === 'deno.jsonc') throw new Error('File not found')
				if (path === 'deno.json') {
					return `{
  "name": "@example/fallback-module",
  "description": "Fallback from deno.jsonc.",
  "githubPath": "fallbackuser/fallback-repo"
}`
				}
				throw new Error('Unexpected file access')
			}
	)


	let output = ''
	const logStub = stub(console, 'log', (msg?: unknown) => {
		if (typeof msg === 'string') output += msg + '\n'
	})

	try {
		const result = await generateReadmeFromUserInputTest()
		assertEquals(result, true)
		assertEquals(output.includes('# fallback-module'), true)
		assertEquals(output.includes('Fallback from deno.jsonc.'), true)
		assertEquals(output.includes('fallbackuser/fallback-repo'), true)
	} finally {
		readStub.restore()
		logStub.restore()
		Deno.args.splice(0, Deno.args.length)
	}
})

Deno.test('generateReadmeFromUserInput shows help and exits', async () => {
	Deno.args.splice(0, Deno.args.length, '--help')

	let output = ''
	const logStub = stub(console, 'log', (msg?: unknown) => {
		if (typeof msg === 'string') output += msg + '\n'
	})

	try {
		const result = await generateReadmeFromUserInputTest()

		assertEquals(result, false)
		assertEquals(
				output.includes('Usage:'),
				true,
				'Should include usage instructions'
		)
		assertEquals(
				output.includes('--help'),
				true,
				'Should list help flag'
		)
	} finally {
		logStub.restore()
		Deno.args.splice(0, Deno.args.length)
	}
})

Deno.test('refuses to overwrite README.md without --force', async () => {
	Deno.args.splice(0, Deno.args.length) // no flags

	const readStub = makeConfigStub({
		"name": "@example/blocked-write",
		"description": "Test",
		"githubPath": "user/repo"
	})
	const statStub = stub(Deno, 'stat', async () => ({ isFile: true } as Deno.FileInfo))

	let output = ''
	const errorStub = stub(console, 'error', (msg?: unknown) => {
		if (typeof msg === 'string') output += msg + '\n'
	})

	try {
		const result = await generateReadmeFromUserInputTest()
		assertEquals(result, false)
		assertEquals(output.includes('README.md already exists'), true)
	} finally {
		readStub.restore()
		statStub.restore()
		errorStub.restore()
		Deno.args.splice(0, Deno.args.length)
	}
})

for (const githubPath of [null, 'not-a-path']) {
	Deno.test(`errors on invalid GitHub path input: ${githubPath}`, async () => {
		Deno.args.splice(0, Deno.args.length)

		const readStub = makeConfigStub({
			"name": "@example/broken-path",
		})
		const promptStub = stub(globalThis, 'prompt', (_msg?: string) => githubPath)

		let output = ''
		const errorStub = stub(console, 'error', (msg?: unknown) => {
			if (typeof msg === 'string') output += msg + '\n'
		})

		try {
			const result = await generateReadmeFromUserInputTest()
			assertEquals(result, false)
			assertEquals(output.includes('Invalid GitHub path'), true)
		} finally {
			readStub.restore()
			promptStub.restore()
			errorStub.restore()
			Deno.args.splice(0, Deno.args.length)
		}
	})
}

Deno.test('errors on empty GitHub path input', async () => {
	Deno.args.splice(0, Deno.args.length)

	const readStub = makeConfigStub({
		"name": "@example/broken-path",
	})
	const promptStub = stub(globalThis, 'prompt', (_msg?: string) => 'not-a-path')

	let output = ''
	const errorStub = stub(console, 'error', (msg?: unknown) => {
		if (typeof msg === 'string') output += msg + '\n'
	})

	try {
		const result = await generateReadmeFromUserInputTest()
		assertEquals(result, false)
		assertEquals(output.includes('Invalid GitHub path'), true)
	} finally {
		readStub.restore()
		promptStub.restore()
		errorStub.restore()
		Deno.args.splice(0, Deno.args.length)
	}
})

Deno.test('errors on malformed name field in deno config', async () => {
	Deno.args.splice(0, Deno.args.length)

	// Provide config missing the required `@scope/module` pattern
	const readStub = makeConfigStub({
		"name": "noscope",
		"githubPath": "user/repo"
	})

	let output = ''
	const errorStub = stub(console, 'error', (msg?: unknown) => {
		if (typeof msg === 'string') output += msg + '\n'
	})

	try {
		const result = await generateReadmeFromUserInputTest()
		assertEquals(result, false)
		assertEquals(output.includes('Missing or malformed "name" field'), true)
	} finally {
		readStub.restore()
		errorStub.restore()
		Deno.args.splice(0, Deno.args.length)
	}
})

Deno.test('returns false and logs error if deno config cannot be parsed', async () => {
	Deno.args.splice(0, Deno.args.length)

	const readStub = stub(Deno, 'readTextFile', async () => {
		throw 'string error'
	})

	let output = ''
	const errorStub = stub(console, 'error', (msg?: unknown) => {
		if (typeof msg === 'string') output += msg + '\n'
	})

	try {
		const result = await generateReadmeFromUserInputTest()
		assertEquals(result, false)
		assertStringIncludes(output, 'Failed to parse deno.json(c)')
	} finally {
		readStub.restore()
		errorStub.restore()
		Deno.args.splice(0, Deno.args.length)
	}
})
