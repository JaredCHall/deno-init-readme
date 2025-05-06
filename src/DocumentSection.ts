/** Represents a section of the README document */
export class DocumentSection {
  readonly content: string;

  /** Creates a new DocumentSection */
  constructor(content: string | undefined | null) {
    this.content = (content ?? "").trim();
  }

  isEmpty(): boolean {
    return this.content.length === 0;
  }

  /** Concatenates two DocumentSections */
  concat(other: DocumentSection): DocumentSection {
    if(this.isEmpty()) return other;
    if(other.isEmpty()) return this;
    return new DocumentSection(`${this.content}\n\n${other.content}`);
  }

  /** Converts a DocumentSection to a string */
  toString(): string {
    return this.content;
  }
}
