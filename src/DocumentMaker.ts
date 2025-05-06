import { DocumentSection } from './DocumentSection.ts'
import type { DocumentBadge } from './DocumentBadge.ts'

/** Creates a README document */
export class DocumentMaker {
	/** makes the title section of a README */
	makeTitleSection(projectName: string, description: string, badges: DocumentBadge[] = []): DocumentSection {
		const titleLine = `# ${projectName}`
		const badgeLine = badges.map((b) => b.toMarkdown()).join('\n')

		const content = [titleLine, badgeLine, description]
			.filter((part) => part.trim().length > 0)
			.join('\n\n')

		return new DocumentSection(content)
	}
	/** makes the usage section of a README */
	makeUsageSection(example: string): DocumentSection {
		return new DocumentSection(`## Usage\n\n\`\`\`bash\n${example}\n\`\`\``)
	}
	/** makes the advanced usage section of a README */
	makeAdvancedUsageSection(example: string): DocumentSection {
		return new DocumentSection(`## Advanced Usage\n\n\`\`\`typescript\n${example}\n\`\`\``)
	}
}
