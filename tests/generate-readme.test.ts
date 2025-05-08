// deno-lint-ignore-file require-await
import { assertEquals, assertRejects, assertStringIncludes } from '@std/assert'
import { generateReadme } from '../src/generate-readme.ts'
import {CommandError} from "../src/errors.ts";

function serializeConfig(config: Record<string, unknown>) {
	return JSON.stringify(config, null, 2)
}

Deno.test('generateReadmeFromUserInput uses config and supports dry-run', async () => {

	let output = ''
	const result = await generateReadme({
		readFileFn: async () => serializeConfig({
			'name': '@example/test-project',
			'description': 'A test module.',
			'githubPath': 'exampleuser/test-project',
		}),
		writeFileFn: async (): Promise<void> => {},
		logFn: (msg?: unknown) => {console.log('wtf');if (typeof msg === 'string') output += msg + '\n'},
		existsFn: async () => false,
		args: ['--dry-run'],
	})

	console.log(output)

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
})

Deno.test('generateReadmeFromUserInput shows help and exits', async () => {

	let output = ''
	const result = await generateReadme({
		readFileFn: async () => '',
		writeFileFn: async (): Promise<void> => {},
		logFn: (msg?: unknown) => {if (typeof msg === 'string') output += msg + '\n'},
		existsFn: async () => false,
		args: ['--help'],
	})

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
})

Deno.test('refuses to overwrite README.md without --force', async () => {
	await assertRejects(() => generateReadme({
		readFileFn: async () => serializeConfig({
			'name': '@example/blocked-write',
			'description': 'Test',
			'githubPath': 'user/repo',
		}),
		writeFileFn: async (): Promise<void> => {},
		logFn: () => {},
		existsFn: async () => true,
		args: [],
	}), CommandError, 'README.md already exists. Use --force to overwrite.')
})

Deno.test('generateReadme writes to README.md when --force is passed', async () => {
	let written = ''
		const result = await generateReadme({
			readFileFn: async () => serializeConfig({
				"name": "@force/write",
				"description": "A forced write test",
				"githubPath": "user/repo"
			}),
			writeFileFn: async (path, data): Promise<void> => {
				if(path !== 'README.md') throw new Error('Unexpected file path: README.md; got: ' + path)
				written = String(data)
			},
			existsFn: async () => false,
			logFn: () => {},
			args: ['--force'],
		})
		assertEquals(result, true)
		assertStringIncludes(written, '# force/write')
		assertStringIncludes(written, 'forced write test')

})
