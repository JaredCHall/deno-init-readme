# deno-init-readme

Scaffolds a `README.md` file for new Deno modules using interactive prompts or pre-filled config.

[![jsr](https://img.shields.io/badge/jsr-%40jaredhall%2Finit--readme-blue?logo=deno)](https://jsr.io/@jaredhall/init-readme)
[![Tests](https://github.com/jaredchall/deno-init-readme/actions/workflows/ci.yml/badge.svg)](https://github.com/jaredchall/deno-init-readme/actions/workflows/ci.yml)

---

## 🦕 Usage

Run the CLI to generate a `README.md`:

```bash
deno run --allow-read --allow-write jsr:@jaredhall/init-readme
```

If your `deno.json` or `deno.jsonc` includes the following fields:

```jsonc
{
  "name": "@your_scope/your_module",
  "description": "A helpful module",
  "githubPath": "youruser/yourrepo"
}
```

…the CLI will use them automatically. Otherwise, you'll be prompted to provide missing fields interactively.

### Command Help

```text
Usage:
  deno run --allow-read[ --allow-write] mod.ts [options]

Permissions:
  --allow-read      Always required (reads deno.json[c])
  --allow-write     Required unless --dry-run is used

Options:
  --dry-run         Print the README.md to stdout instead of writing to disk
  --force           Overwrite README.md if it already exists
  --help            Show this help message
```

---

## ⚙️ Programmatic Usage

You can also use this module to generate README content directly:

```ts
import { DocumentMaker } from "jsr:@jaredhall/init-readme";

const doc = new DocumentMaker({
  projectName: "my-module",
  projectDescription: "Does something cool.",
});
console.log(doc.makeDoc());
```

## 📦 Requirements

To use this generator, your project must include a valid `name` field in either `deno.json` or `deno.jsonc`:

```jsonc
{
  "name": "@your-scope/your-module"
}
```
This name is required for modules intended to be published on jsr.io, and is used to display the module name in the README title and generate the correct JSR badge and import URL.