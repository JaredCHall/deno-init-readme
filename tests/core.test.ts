import { makeBadges, makeModuleSettings } from '../src/helpers.ts'
import { generateReadmeMarkdown } from '../src/core.ts'
import { assertStringIncludes } from '@std/assert'

Deno.test('generateReadmeMarkdown outputs correct format', () => {
	const settings = makeModuleSettings({ name: '@x/y', githubPath: 'x/y' })
	const badges = makeBadges(settings)

	const output = generateReadmeMarkdown(settings, badges)

	assertStringIncludes(output, '# x/y')
	assertStringIncludes(output, '```typescript')
})
