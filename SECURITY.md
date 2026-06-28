# Security Policy

We take the security of HuddleUp and its users seriously. Thank you for taking the time to disclose responsibly.

---

## Supported Versions

Only the latest minor release of HuddleUp receives security fixes.

| Version | Supported |
|---|---|
| 0.1.x | ✅ |
| < 0.1.0 | ❌ (pre-release; please upgrade) |

---

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Instead, email the maintainer directly:

📧 **[sanand03072005@gmail.com](mailto:sanand03072005@gmail.com?subject=%5BSECURITY%5D%20HuddleUp%20-%20)** with the subject prefix **`[SECURITY] HuddleUp`**.

Include as much detail as you can:

- The affected version(s) of the CLI, VS Code extension, or landing site.
- A clear description of the vulnerability and its potential impact.
- A minimal reproduction (steps, fixture files, or a PoC).
- Your suggested fix, if you have one.
- Whether you'd like to be credited in the public disclosure (and how).

You should expect:

- An **acknowledgement within 72 hours**.
- A **status update within 7 days** — accepted / needs more info / declined with reasoning.
- A **fix and coordinated disclosure** within 30 days for confirmed high-severity issues. Lower-severity issues may roll into the next regular release.

---

## What Counts as a Vulnerability

| In scope | Out of scope |
|---|---|
| Arbitrary code execution via crafted `.huddleup/` files | Bugs without security impact (please file a normal issue) |
| Privilege escalation through the CLI or VS Code extension | Issues in third-party AI tools (report to their projects) |
| Path traversal in adapters or snapshot/restore | Self-inflicted issues caused by editing `~/.claude/` etc. by hand |
| Secret leakage via generated files or history logs | Theoretical attacks requiring an already-compromised machine |
| Supply-chain risk in `huddleup` or `vscode-huddleup` npm packages | Cosmetic / typo issues |

---

## Disclosure Process

1. You report privately via email.
2. We confirm and reproduce.
3. We develop and verify a fix.
4. We coordinate a release date with you.
5. We publish the fix as a patched version (e.g. `0.1.1`) and a GitHub Security Advisory crediting you (with consent).
6. We update `CHANGELOG.md` with a `### Security` entry referencing the advisory.

---

## Hardening Notes for Users

A few HuddleUp-specific reminders:

- **`.huddleup/` is meant to be committed.** Don't paste API keys, OAuth tokens, or PII into `charter.md`, thread notes, or playbook entries — they will be visible to everyone with repo access.
- **Snapshot diffs include staged changes.** Run `git diff --staged` before `huddleup snapshot` if you're unsure what's about to be captured.
- **Generated AI-tool config files** (`CLAUDE.md`, `.cursor/rules/huddleup.mdc`, `AGENTS.md`, `.windsurfrules`) point to `.huddleup/`. Treat them as part of your project's trust boundary — review them in PRs like any other source file.
- **No telemetry.** The CLI does not phone home. The VS Code extension does not phone home. The landing site uses no third-party trackers by default (a Plausible / GA4 snippet, when added, will be documented in `CHANGELOG.md`).

---

## License

This security policy is licensed under the same terms as the rest of HuddleUp — [AGPL-3.0](LICENSE).
