/** Represents a badge in a README document */
export class DocumentBadge {
	constructor(
		readonly altText: string,
		readonly imageUrl: string,
		readonly linkUrl?: string,
	) {}

	/** Converts a DocumentBadge to a string */
	toMarkdown(): string {
		const image = `![${this.altText}](${this.imageUrl})`
		return this.linkUrl ? `[${image}](${this.linkUrl})` : image
	}
}
