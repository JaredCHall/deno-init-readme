// deno-lint-ignore-file require-await
import {assertEquals, assertStringIncludes} from '@std/assert'
import { stub } from '@testing/mock'

// Dynamically import to ensure we don't trigger import.meta.main logic
const cliModule = await import('../src/generate-readme.ts')
const { generateReadme: generateReadmeTest } = cliModule

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
		const result = await generateReadmeTest()

		assertEquals(result, true)
		assertEquals(
				output.trim(),
				`# example/test-project

[![jsr](https://img.shields.io/badge/jsr--%40example%2Ftest-project-blue?logo=deno)](https://jsr.io/@example/test-project)
[![GitHub](https://img.shields.io/badge/GitHub-exampleuser/test-project-blue?logo=github)](https://github.com/exampleuser/test-project)

A test module.

## Usage

\`\`\`bash
deno run jsr:@example/test-project
\`\`\`

## Advanced Usage

\`\`\`typescript
import { YourModule } from "jsr:@example/test-project";

new YourModule.engage();
\`\`\``.trim(),
		)
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
		const result = await generateReadmeTest()

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
		const result = await generateReadmeTest()
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
			const result = await generateReadmeTest()
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
		const result = await generateReadmeTest()
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
		const result = await generateReadmeTest()
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
		const result = await generateReadmeTest()
		assertEquals(result, false)
		assertStringIncludes(output, 'Failed to parse deno.json(c)')
	} finally {
		readStub.restore()
		errorStub.restore()
		Deno.args.splice(0, Deno.args.length)
	}
})
