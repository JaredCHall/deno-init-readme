// deno-lint-ignore-file require-await
import { assertEquals, assertRejects, assertStringIncludes } from '@std/assert'
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
		'name': '@example/test-project',
		'description': 'A test module.',
		'githubPath': 'exampleuser/test-project',
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
			'Should include usage instructions',
		)
		assertEquals(
			output.includes('--help'),
			true,
			'Should list help flag',
		)
	} finally {
		logStub.restore()
		Deno.args.splice(0, Deno.args.length)
	}
})

Deno.test('refuses to overwrite README.md without --force', async () => {
	Deno.args.splice(0, Deno.args.length) // no flags

	const readStub = makeConfigStub({
		'name': '@example/blocked-write',
		'description': 'Test',
		'githubPath': 'user/repo',
	})
	const statStub = stub(Deno, 'stat', async () => ({ isFile: true } as Deno.FileInfo))

	await assertRejects(() => generateReadmeTest(), 'README.md already exists. Use --force to overwrite.')

	readStub.restore()
	statStub.restore()
	Deno.args.splice(0, Deno.args.length)
})

Deno.test('generateReadme writes to README.md when --force is passed', async () => {
	Deno.args.splice(0, Deno.args.length, '--force')

	const statStub = stub(Deno, 'stat', async () => ({ isFile: true } as Deno.FileInfo))
	const readStub = stub(Deno, 'readTextFile', async () =>
		`{
  "name": "@force/write",
  "description": "A forced write test",
  "githubPath": "user/repo"
}`)

	let written = ''
	const writeStub = stub(Deno, 'writeTextFile', async (_path, data) => {
		written = String(data)
	})

	try {
		const result = await generateReadmeTest()
		assertEquals(result, true)
		assertStringIncludes(written, '# force/write')
		assertStringIncludes(written, 'forced write test')
	} finally {
		statStub.restore()
		readStub.restore()
		writeStub.restore()
		Deno.args.splice(0, Deno.args.length)
	}
})
