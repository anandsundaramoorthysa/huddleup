export const SITE = {
  name: 'HuddleUp',
  tagline: 'Hand off your AI coding session in one command.',
  description:
    'HuddleUp is an open-source CLI tool that snapshots your Claude Code, Cursor, Codex, Copilot, or Windsurf session — and lets your teammate resume in one command, in whichever AI tool they use. No re-explaining, no token waste, no midnight Slack messages.',
  url: 'https://huddleup-site.pages.dev',
  repo: 'https://github.com/anandsundaramoorthysa/huddleup',
  npmUrl: 'https://www.npmjs.com/package/huddleup',
  vsCodeUrl:
    'https://marketplace.visualstudio.com/items?itemName=AnandSundaramoorthySa.vscode-huddleup',
  openVsxUrl:
    'https://open-vsx.org/extension/AnandSundaramoorthySa/vscode-huddleup',
  author: 'anandsundaramoorthysa',
  authorUrl: 'https://github.com/anandsundaramoorthysa',
  lang: 'en',
  ogImage: '/images/og-image.png',
  installCommand: 'npm install -g huddleup',
  keywords: [
    'ai coding handoff',
    'cursor session sharing',
    'claude code team',
    'windsurf resume',
    'github copilot session',
    'open-source developer tools',
    'vscode extension',
    'pair programming AI',
    'vibe coding for teams',
    'AGPL OSS cli',
  ],
};

export const NAV = [
  { label: 'Problem', href: '#problem' },
  { label: 'Solution', href: '#solution' },
  { label: 'Features', href: '#features' },
  { label: 'Adapters', href: '#adapters' },
  { label: 'Compare', href: '#compare' },
  { label: 'Quick start', href: '#quick-start' },
  { label: 'FAQ', href: '#faq' },
];

export const PROBLEMS = [
  {
    icon: 'lucide:hourglass',
    title: 'Half-finished features',
    desc: 'Three hours of Claude Code, then you stop. A teammate opens Cursor the next morning — they have no idea what you tried, what failed, what worked.',
  },
  {
    icon: 'lucide:battery-warning',
    title: 'Wasted tokens',
    desc: 'Context dies at 10%. No one captured the plan, the dead ends, the next step. The next session has to re-derive everything from a stale CLAUDE.md.',
  },
  {
    icon: 'lucide:moon',
    title: 'Midnight Slack pings',
    desc: '"Hey, what were you doing yesterday with the auth middleware?" Re-explaining what you tried, at 11 pm, to someone who is also tired.',
  },
];

export const FEATURES = [
  {
    icon: 'lucide:camera',
    title: 'Snapshot in seconds',
    desc: 'Captures git diff, the last AI messages from every detected tool, inferred open files, the active branch, and your one-line note. Writes plain markdown to .huddleup/threads/<name>.md.',
    screenshot: '/images/screenshot-snapshot.png',
    alt: 'Terminal showing the huddleup snapshot command output',
  },
  {
    icon: 'lucide:play',
    title: 'Resume instantly',
    desc: 'Your teammate runs one command and gets a "YOU ARE HERE" briefing, the relevant files reopened, and a context file the AI tool reads on its next prompt. Zero re-explanation.',
    screenshot: '/images/screenshot-resume.png',
    alt: 'Terminal showing the huddleup resume briefing',
  },
  {
    icon: 'lucide:panel-left',
    title: 'VS Code + Cursor companion',
    desc: 'Sidebar panel with Snapshot, Resume, Standup, and New Thread buttons. Every action is also in the command palette. Live on VS Code Marketplace and Open VSX.',
    screenshot: '/images/screenshot-sidebar.png',
    alt: 'VS Code sidebar showing the HuddleUp extension panel',
  },
  {
    icon: 'lucide:layers',
    title: 'Multi-tool capture',
    desc: 'Claude Code, Cursor, Codex CLI, GitHub Copilot, and Windsurf are all auto-detected. detectAllAdapters() merges messages from every tool into a single snapshot — the thread\'s Tools field lists every contributor.',
  },
  {
    icon: 'lucide:shield-check',
    title: 'Token Exhaustion Protocol',
    desc: 'The generated AI-tool config files (CLAUDE.md, .cursor/rules/huddleup.mdc, AGENTS.md, .windsurfrules) tell the AI to auto-run huddleup snapshot at ~10% tokens remaining. Even if a human forgets, the AI doesn\'t.',
  },
  {
    icon: 'lucide:git-branch',
    title: 'Plain markdown + git',
    desc: 'The whole .huddleup/ folder is markdown plus JSONL history. Commit it, paste in Slack, attach to a Linear ticket. No backend, no MCP server, no accounts.',
  },
];

export const ADAPTERS = [
  {
    name: 'Cursor',
    icon: 'lucide:mouse-pointer-2',
    accent: '#22D3EE',
    desc: 'Reads ~/.cursor/{sessions,chats}/ and Cursor\'s workspaceStorage globalStorage on macOS, Linux, and Windows.',
  },
  {
    name: 'Claude Code',
    icon: 'lucide:brackets',
    accent: '#F59E0B',
    desc: 'Reads ~/.claude/projects/<hash>/*.jsonl (modern) and ~/.claude/sessions/*.jsonl (legacy). Generates CLAUDE.md with the Token Exhaustion Protocol.',
  },
  {
    name: 'Windsurf',
    icon: 'lucide:waves',
    accent: '#10B981',
    desc: 'Detects ~/.windsurf/, ~/.codeium/, and the Windsurf/Codeium application data folders across platforms.',
  },
  {
    name: 'GitHub Copilot',
    icon: 'lucide:plane',
    accent: '#8B5CF6',
    desc: 'Reads VS Code globalStorage (github.copilot-chat) for Code, Code Insiders, and Cursor; also ~/.github/copilot/ and ~/.vscode/copilot/.',
  },
  {
    name: 'Codex CLI',
    icon: 'lucide:terminal',
    accent: '#EC4899',
    desc: 'Detects ~/.codex/ and the Codex app data folders on macOS, Linux, and Windows. Parses JSON, JSONL, and plain-log session files.',
  },
  {
    name: 'Custom',
    icon: 'lucide:puzzle',
    accent: '#6366F1',
    desc: 'Add a new adapter in src/adapters/ — implement detect() + capture() and call registerAdapter(). About 80 lines. See docs/adapters.md.',
  },
];

export const COMPARISON = {
  headers: ['Capability', 'CLAUDE.md', '.cursor/rules/', 'Memory Bank', 'HuddleUp'],
  rows: [
    { feature: 'Static project rules', values: [true, true, true, true] },
    { feature: 'Live session state (work-in-progress)', values: [false, false, 'partial', true] },
    { feature: 'Captures last AI messages + git diff', values: [false, false, false, true] },
    { feature: 'Multi-tool merge (Claude + Cursor + Copilot…)', values: [false, false, false, true] },
    { feature: 'Token-exhaustion auto-save', values: [false, false, false, true] },
    { feature: 'Plain markdown + git, no backend', values: [true, true, false, true] },
    { feature: 'Cross-platform (mac/linux/windows)', values: [true, true, 'partial', true] },
    { feature: 'Open source', values: ['convention', 'convention', 'varies', 'AGPL-3.0'] },
  ],
};

export const QUICKSTART_STEPS = [
  {
    label: 'Install',
    code: 'npm install -g huddleup',
    caption: 'Requires Node.js 20+. Also installs the hup short alias.',
  },
  {
    label: 'Initialise',
    code: 'cd your-project\nhuddleup init',
    caption: 'Scaffolds .huddleup/ and generates CLAUDE.md, .cursor/rules/huddleup.mdc, AGENTS.md, .windsurfrules.',
  },
  {
    label: 'Snapshot before a break',
    code: 'huddleup snapshot',
    caption: 'Auto-captures git diff + last AI messages from every detected tool. Asks one question: "where did you leave it?"',
  },
  {
    label: 'Resume (you or a teammate)',
    code: 'huddleup resume streaming-chat-endpoint',
    caption: 'Prints a YOU ARE HERE briefing, opens the inferred files, and injects context into your AI tool.',
  },
];

export const FAQS = [
  {
    q: 'Does HuddleUp send my code anywhere?',
    a: 'No. The CLI runs entirely on your machine. The .huddleup/ folder is plain markdown + JSONL that you commit to your own git repo. There is no backend, no telemetry, and no third-party uploads.',
  },
  {
    q: 'Do I need to install all 5 AI tools?',
    a: 'No. HuddleUp detects whichever tools you have. If you only use Claude Code, only the Claude Code adapter runs. The generic fallback always writes AGENTS.md so any AGENTS.md-respecting tool also picks up your charter.',
  },
  {
    q: 'How is this different from a CLAUDE.md file?',
    a: 'CLAUDE.md (and Cursor Rules, AGENTS.md, .windsurfrules) carry static project conventions. HuddleUp generates those files from a single charter — and adds the missing layer: live, per-session work-in-progress state. CLAUDE.md tells the AI HOW you work; a HuddleUp thread tells it WHAT was just tried and where it ended up.',
  },
  {
    q: 'Does it work with Cursor specifically?',
    a: 'Yes. HuddleUp reads ~/.cursor/{sessions,chats}/ and the Cursor workspaceStorage folders across macOS, Linux, and Windows, and writes .cursor/rules/huddleup.mdc. The VS Code extension also installs in Cursor via Open VSX.',
  },
  {
    q: 'What if an AI tool changes its session file format?',
    a: 'Each adapter is a small isolated file (~80 lines) with its own fuzz tests against captured fixtures. When a format changes you update one file, the tests catch the break, and a patch release ships. Other adapters keep working.',
  },
  {
    q: 'Can I use it without git?',
    a: 'You can run huddleup init and huddleup thread new without git, but the snapshot command embeds git diff and recent commit metadata — so without a git repo, snapshots will be lighter. Recommended: use it inside a git repo.',
  },
  {
    q: 'Is it free for commercial use?',
    a: 'Yes, with caveats. HuddleUp is AGPL-3.0. You can use it inside your company for any purpose. If you fork it and run a modified version as a hosted service, AGPL requires you to publish your changes under AGPL-3.0 as well.',
  },
  {
    q: 'How do I install just the VS Code extension?',
    a: 'Search "HuddleUp" in the VS Code Extensions panel, or visit the Marketplace listing directly. Cursor / VSCodium / Windsurf users can install it from Open VSX. You still need the CLI installed (npm install -g huddleup) for the buttons to do anything.',
  },
  {
    q: 'What is the Token Exhaustion Protocol?',
    a: 'When huddleup init generates the AI tool config files, it embeds an instruction that tells the AI to run huddleup snapshot when its session is near the token limit (default 10% remaining). The AI saves its own context before it gets dropped — so even if the human forgets, the snapshot still happens.',
  },
  {
    q: 'Where do snapshots actually live?',
    a: 'In .huddleup/threads/<thread-name>.md in your repo. Plain markdown with YAML frontmatter. Every snapshot appends a new ## Snapshot block. Archived threads move to .huddleup/threads/_archive/. History events log to .huddleup/history/<date>.jsonl.',
  },
];

export const SOCIAL_BADGES = [
  {
    label: 'npm version',
    img: 'https://img.shields.io/npm/v/huddleup?color=6366F1&label=npm',
    href: 'https://www.npmjs.com/package/huddleup',
  },
  {
    label: 'npm downloads',
    img: 'https://img.shields.io/npm/dm/huddleup?color=6366F1',
    href: 'https://www.npmjs.com/package/huddleup',
  },
  {
    label: 'VS Code Marketplace',
    img: 'https://img.shields.io/visual-studio-marketplace/v/AnandSundaramoorthySa.vscode-huddleup?color=6366F1&label=vs%20code',
    href: 'https://marketplace.visualstudio.com/items?itemName=AnandSundaramoorthySa.vscode-huddleup',
  },
  {
    label: 'Open VSX',
    img: 'https://img.shields.io/open-vsx/v/AnandSundaramoorthySa/vscode-huddleup?color=6366F1&label=open%20vsx',
    href: 'https://open-vsx.org/extension/AnandSundaramoorthySa/vscode-huddleup',
  },
  {
    label: 'GitHub stars',
    img: 'https://img.shields.io/github/stars/anandsundaramoorthysa/huddleup?color=6366F1',
    href: 'https://github.com/anandsundaramoorthysa/huddleup',
  },
  {
    label: 'License: AGPL-3.0',
    img: 'https://img.shields.io/badge/license-AGPL--3.0-6366F1',
    href: 'https://github.com/anandsundaramoorthysa/huddleup/blob/master/LICENSE',
  },
];
