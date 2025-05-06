import { assertEquals } from '@std/assert'
import { stub } from '@testing/mock'

// Dynamically import to ensure we don't trigger import.meta.main logic
const cliModule = await import('../src/generate-readme-from-user-input.ts')
const { generateReadmeFromUserInput: generateReadmeFromUserInputTest } = cliModule

Deno.test('generateReadmeFromUserInput writes a generated README.md', async () => {
	// Stub prompt and confirm
	const promptStub = stub(globalThis, 'prompt', (msg?: string, _defaultValue?: string) => {
		if (msg?.includes('Project name')) return 'test-project'
		if (msg?.includes('Description')) return 'A test module.'
		return null
	})

	const confirmStub = stub(globalThis, 'confirm', (msg?: string) => {
		return !!msg?.includes('advanced')
	})

	let writtenPath = ''
	let writtenContent = ''

	const writeStub = stub<typeof Deno, 'writeTextFile'>(
		Deno,
		'writeTextFile',
		async (path: string | URL, data: string | ReadableStream<string>) => {
			writtenPath = String(path)
			writtenContent = typeof data === 'string' ? data : '[streamed content]'
			await Promise.resolve()
		},
	)

	try {
		await generateReadmeFromUserInputTest()

		assertEquals(writtenPath, 'README.md')
		assertEquals(
			writtenContent,
			`# test-project

A test module.

[![CI](https://example.com/ci.svg)](https://ci.example.com)

# Usage

\`\`\`bash
deno run jsr:@your/module
\`\`\`

# Advanced Usage

\`\`\`bash
deno run jsr:@your/module --with-adv-option
\`\`\``,
		)
	} finally {
		promptStub.restore()
		confirmStub.restore()
		writeStub.restore()
	}
})

Deno.test('generateReadmeFromUserInput handles null/undefined answers', async () => {
	const promptStub = stub(globalThis, 'prompt', (_msg?: string) => null)
	const confirmStub = stub(globalThis, 'confirm', (_msg?: string) => undefined as unknown as boolean)

	let writtenContent = ''
	const writeStub = stub<typeof Deno, 'writeTextFile'>(
		Deno,
		'writeTextFile',
		async (_path, data) => {
			writtenContent = typeof data === 'string' ? data : '[streamed content]'
			await Promise.resolve()
		},
	)

	try {
		await generateReadmeFromUserInputTest()

		// This verifies the fallback strings were used
		assertEquals(
			writtenContent.startsWith('# '),
			true,
			'Title should be empty header',
		)
		assertEquals(
			writtenContent.includes('# Advanced Usage'),
			true,
			'Advanced usage should default to included',
		)
	} finally {
		promptStub.restore()
		confirmStub.restore()
		writeStub.restore()
	}
})
