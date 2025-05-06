import { assertEquals } from '@std/assert'
import { DocumentMaker } from '../src/DocumentMaker.ts'
import { DocumentBadge } from '../src/DocumentBadge.ts'

Deno.test('DocumentMaker: full document with all sections', () => {
	const doc = new DocumentMaker({
		projectName: 'my-cool-module',
		projectDescription: 'This is a great module!',
		badges: [
			new DocumentBadge('CI', 'https://example.com/ci.svg', 'https://ci.example.com'),
			new DocumentBadge('Coverage', 'https://example.com/coverage.svg'),
		],
	})

	const output = doc.makeDoc()

	assertEquals(
		output,
		`# my-cool-module

[![CI](https://example.com/ci.svg)](https://ci.example.com)
![Coverage](https://example.com/coverage.svg)

This is a great module!

## Usage

\`\`\`bash
deno run jsr:@your/module
\`\`\`

## Advanced Usage

\`\`\`typescript
import { YourModule } from "jsr:@your/module";

new YourModule.engage();
\`\`\``,
	)
})

Deno.test('DocumentMaker: only title section', () => {
	const doc = new DocumentMaker({
		projectName: 'title-only',
		hasUsage: false,
		hasAdvancedUsage: false,
	})

	const output = doc.makeDoc()
	assertEquals(output, `# title-only`)
})

Deno.test('DocumentMaker: usage and advanced usage without title', () => {
	const doc = new DocumentMaker({
		hasTitle: false,
	})

	const output = doc.makeDoc()
	assertEquals(
		output,
		`## Usage

\`\`\`bash
deno run jsr:@your/module
\`\`\`

## Advanced Usage

\`\`\`typescript
import { YourModule } from "jsr:@your/module";

new YourModule.engage();
\`\`\``,
	)
})
