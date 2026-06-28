# Contributing to HuddleUp

First off, thanks for taking the time to contribute!

The following is a set of guidelines for contributing to this project. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Guidelines](#coding-guidelines)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)
- [Questions?](#questions)

---

## Code of Conduct

This project and everyone participating in it is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [sanand03072005@gmail.com](mailto:sanand03072005@gmail.com).

---

## Getting Started

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 9+
- **Git** (for snapshot features)

### One-Time Setup

```bash
# Fork the repository on GitHub first, then:
git clone https://github.com/YOUR_USERNAME/huddleup.git
cd huddleup
npm install
npm run build
```

---

## Development Setup

### Quick Start

```bash
npm run build          # TypeScript compilation
npm run dev            # Watch mode (recompiles on save)
npm test               # Run unit tests
```

### Useful Commands

| Command | Description |
|---|---|
| `npm run build` | One-shot TypeScript compilation |
| `npm run dev` | Watch mode — recompiles on every save |
| `npm test` | Run all unit tests (Vitest) |
| `npx vitest --coverage` | Run tests with coverage report |
| `npx vitest tests/unit/adapters.test.ts` | Run a single test file |
| `npm run build:assets` | Regenerate raster brand assets (PNG/ICO) |

### Testing CLI Commands

```bash
# Test in a temporary project
cd /tmp
npx huddleup init
huddleup thread new "test-feature"
huddleup snapshot
huddleup resume test-feature
```

### Testing Adapters with Fixtures

The project includes realistic AI tool session fixtures in `tests/fixtures/`:

```bash
npx vitest tests/integration/adapters.integration.test.ts
```

### Building the VS Code Extension

```bash
cd vscode-huddleup
npm install
npm run build
npx vsce package    # produces .vsix
```

---

## Project Structure

```
huddleup/
├── bin/                    # CLI entry binary
│   └── huddleup.js
├── src/
│   ├── index.ts            # Main entry
│   ├── cli.ts              # Commander argument parsing
│   ├── commands/           # One file per command
│   │   ├── init.ts
│   │   ├── snapshot.ts
│   │   ├── resume.ts
│   │   ├── sync.ts
│   │   ├── thread.ts
│   │   ├── standup.ts
│   │   ├── handoff.ts
│   │   └── archive.ts
│   ├── adapters/           # Tool-specific integrations
│   │   ├── base.ts         # Adapter interface
│   │   ├── claude-code.ts
│   │   ├── cursor.ts
│   │   ├── codex.ts
│   │   ├── copilot.ts
│   │   ├── windsurf.ts
│   │   └── generic.ts
│   ├── core/               # Core logic
│   │   ├── git.ts
│   │   ├── files.ts
│   │   ├── thread.ts
│   │   ├── snapshot.ts
│   │   ├── charter.ts
│   │   ├── history.ts
│   │   └── markdown.ts
│   ├── templates/          # Default file content
│   ├── prompts/            # Interactive CLI prompts
│   └── utils/              # Shared utilities
├── tests/
│   ├── unit/               # Unit tests
│   ├── fixtures/           # Sample AI session files
│   └── integration/        # Integration tests
├── landing/                # Astro static site
├── vscode-huddleup/        # VS Code extension
├── assets/brand/           # Brand kit
└── docs/                   # Documentation
```

### Architecture Overview

The data flow through the system:

```
AI Tool Session (Claude/Cursor/Windsurf/Codex/Copilot)
    │
    ▼
┌──────────────┐
│  adapter/    │  auto-detect tool, read session files
│  capture()   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  snapshot    │  combine adapter data + git diff + user notes
│  command     │  write to thread file + history log
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  thread.md   │  portable markdown + JSONL snapshot
│  history/    │
└──────┬───────┘
       │  (share via git/Slack/file)
       ▼
┌──────────────┐
│  resume      │  read thread, print briefing,
│  command     │  open files, inject context
└──────────────┘
```

---

## Coding Guidelines

### TypeScript

- **Strict mode** is enabled. Respect `strictNullChecks`, `noImplicitAny`, etc.
- Prefer `const` over `let`; prefer `let` over `var`
- Use TypeScript's built-in types — avoid `any` unless absolutely necessary
- Use `interface` over `type` for object shapes; use `type` for unions and aliases

### Naming Conventions

| Category | Convention | Example |
|---|---|---|
| Files | `kebab-case.ts` | `claude-code.ts`, `getting-started.md` |
| Classes | `PascalCase` | `SnapshotManager` |
| Functions | `camelCase` | `captureSession()`, `detectTool()` |
| Constants | `UPPER_SNAKE_CASE` | `TOKEN_EXHAUSTION_THRESHOLD` |
| Types/Interfaces | `PascalCase` | `AdapterResult`, `SnapshotData` |

### Code Style

- **Tabs** for indentation (1 tab = 2 spaces)
- **Single quotes** for strings
- **Semicolons** required
- **Trailing commas** in multi-line arrays and objects
- **JSDoc** for public APIs and complex logic

### No Emoji in Code or UI

Keep source code, comments, and CLI output free of emoji. Use plain text markers instead.

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npx vitest run --coverage

# Run in watch mode
npx vitest

# Run a specific test file
npx vitest tests/unit/adapters.test.ts
```

### Test Structure

```
tests/
├── unit/                      # Unit tests mirroring src/
│   ├── adapters.test.ts
│   ├── snapshot.test.ts
│   ├── files.test.ts
│   ├── history.test.ts
│   ├── thread.test.ts
│   └── markdown.test.ts
├── fixtures/                  # Realistic AI session JSONL files
│   ├── claude-code-session.jsonl
│   ├── cursor-session.jsonl
│   ├── codex-session.jsonl
│   ├── copilot-session.jsonl
│   └── windsurf-session.jsonl
└── integration/
    └── adapters.integration.test.ts   # Fuzz tests against fixtures
```

### Writing Tests

- Use **Vitest** (the project's test runner)
- Focus on **behavior**, not implementation details
- Test edge cases: empty input, malformed data, missing files
- For adapters, include both detection (positive) and non-detection (negative) test cases

```typescript
import { describe, it, expect } from "vitest";
import { detectTool } from "../src/adapters/base";

describe("detectTool", () => {
  it("detects Claude Code when session directory exists", () => {
    // Test with mocked filesystem
  });
});
```

---

## Pull Request Process

### Before You Submit

1. **Discuss first** — open an [issue](https://github.com/anandsundaramoorthysa/huddleup/issues) for any non-trivial change
2. **Fork the repo** and create your branch from `master`
3. **Install dependencies** with `npm install`
4. **Compile** with `npm run build` — no errors
5. **Test** with `npm test` — all tests pass
6. **Lint** your code (follow the [coding guidelines](#coding-guidelines))

### Step-by-Step

```bash
# 1. Create a branch
git checkout -b feature/your-feature-name

# 2. Make your changes
#    - Keep changes focused on a single concern
#    - Write or update tests
#    - Update documentation if needed

# 3. Verify everything works
npm run build
npm test

# 4. Commit
git add .
git commit -m "feat: brief description of your change"

# 5. Push
git push origin feature/your-feature-name

# 6. Open a Pull Request
#    - Describe your changes in detail
#    - Link any related issues
#    - Include screenshots for CLI output changes
```

### PR Title Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | When to use |
|---|---|
| `feat:` | A new feature |
| `fix:` | A bug fix |
| `docs:` | Documentation only |
| `style:` | Code style changes (formatting, no code change) |
| `refactor:` | Code refactoring |
| `test:` | Adding or updating tests |
| `chore:` | Build, CI, dependencies |

### PR Checklist

- [ ] I have discussed this change in an issue (for non-trivial changes)
- [ ] My code follows the project's coding style
- [ ] I have added/updated tests that prove my fix/feature works
- [ ] All existing and new tests pass
- [ ] I have updated the documentation (README, docs, etc.)
- [ ] My changes generate no new TypeScript errors

### Review Process

1. Maintainers will review your PR within a few days
2. Address any feedback or requested changes
3. Once approved, a maintainer will merge your PR
4. Your contribution will appear in the next release

---

## Release Process

Maintained by project maintainers:

1. Update version in root `package.json`
2. Update `CHANGELOG.md` with the new version and changes
3. Create a GitHub Release with release notes
4. Publish to npm via `npm publish`
5. Tag the release in git

---

## Questions?

- **Open an issue** — [github.com/anandsundaramoorthysa/huddleup/issues](https://github.com/anandsundaramoorthysa/huddleup/issues)
- **Start a discussion** — [github.com/anandsundaramoorthysa/huddleup/discussions](https://github.com/anandsundaramoorthysa/huddleup/discussions)
- **Email** — [sanand03072005@gmail.com](mailto:sanand03072005@gmail.com?subject=About%20HuddleUp)

---

<p align="center">
  <a href="README.md">README</a> ·
  <a href="CODE_OF_CONDUCT.md">Code of Conduct</a> ·
  <a href="https://github.com/anandsundaramoorthysa/huddleup/issues">Issues</a>
</p>
