# deno-init-readme

Scaffolds a `README.md` file for new Deno modules using interactive prompts.

[![JSR](https://jsr.io/badge/@jaredhall/init-readme)](https://jsr.io/@jaredhall/init-readme)
[![Tests](https://github.com/jaredchall/deno-init-readme/actions/workflows/ci.yml/badge.svg)](https://github.com/jaredchall/deno-init-readme/actions/workflows/ci.yml)

---

## 🦕 Usage

Run the CLI to generate a `README.md` interactively:

```bash
deno run -A jsr:@jaredhall/init-readme
```

You'll be prompted for:
- Project name
- Description
- Whether to include an advanced usage section

---

## ⚙️ Advanced Usage

You can use this module programmatically:

```ts
import { DocumentMaker } from "jsr:@jaredhall/init-readme";

const doc = new DocumentMaker({
  projectName: "my-module",
  projectDescription: "Does something cool.",
});
console.log(doc.makeDoc());
```
