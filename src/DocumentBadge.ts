export class DocumentBadge {
	constructor(
		readonly altText: string,
		readonly imageUrl: string,
		readonly linkUrl?: string,
	) {}

	toMarkdown(): string {
		const image = `![${this.altText}](${this.imageUrl})`
		return this.linkUrl ? `[${image}](${this.linkUrl})` : image
	}
}
