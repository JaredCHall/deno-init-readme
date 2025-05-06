import {DocumentSection} from "./DocumentSection.ts";
import {DocumentBadge} from "./DocumentBadge.ts";

/** Properties for the DocumentMaker constructor */
export interface DocumentProperties {
  projectName?: string;
  projectDescription?: string;
  badges?: DocumentBadge[];
  hasTitle?: boolean;
  hasUsage?: boolean;
  hasAdvancedUsage?: boolean;
}
/** Creates a README document */
export class DocumentMaker {

  /** Creates a new DocumentMaker */
  constructor(private props: DocumentProperties
  ) {
    this.props.hasTitle ??= true;
    this.props.hasUsage ??= true;
    this.props.hasAdvancedUsage ??= true;
  }
  /** Creates a README document */
  makeDoc(
  ): string {
    const sections: DocumentSection[] = [];

    if(this.props.hasTitle) {
      sections.push(this.makeTitleSection());
    }
    if(this.props.hasUsage) {
      sections.push(this.makeUsageSection("deno run jsr:@your/module"));
    }
    if(this.props.hasAdvancedUsage) {
      sections.push(this.makeAdvancedUsageSection("deno run jsr:@your/module --with-adv-option"));
    }

    return sections.reduce((acc, section) => acc.concat(section),new DocumentSection('')).toString();
  }

  /** makes the title section of a README */
  makeTitleSection(): DocumentSection {
    const { projectName, projectDescription, badges = [] } = this.props;

    const titleLine = `# ${projectName}`;
    const desc = projectDescription ?? "";
    const badgeLine = badges.map(b => b.toMarkdown()).join(" ");

    const content = [titleLine, desc, badgeLine]
        .filter(part => part.trim().length > 0)
        .join("\n\n");

    return new DocumentSection(content);
  }
  /** makes the usage section of a README */
  makeUsageSection(example: string): DocumentSection {
    return new DocumentSection(`# Usage\n\n\`\`\`bash\n${example}\n\`\`\``);
  }
  /** makes the advanced usage section of a README */
  makeAdvancedUsageSection(example: string): DocumentSection {
    return new DocumentSection(`# Advanced Usage\n\n\`\`\`bash\n${example}\n\`\`\``);
  }

}