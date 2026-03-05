export interface DocGuide {
  href: string;
  title: string;
  description: string;
  audience: string;
}

export const DOC_GUIDES: DocGuide[] = [
  {
    href: "/docs/developer-workflows",
    title: "Developer Workflows",
    description: "Fast task-first usage guide for daily debugging and operations.",
    audience: "Human user",
  },
  {
    href: "/docs/automation-url-contract",
    title: "Automation URL Contract",
    description: "Query schema, validation rules, and deterministic link patterns.",
    audience: "Agent and automation",
  },
  {
    href: "/docs/ai-palette-usage",
    title: "AI Palette Usage",
    description: "Prompt patterns, reliability notes, and safe operational flow.",
    audience: "AI-assisted input",
  },
  {
    href: "/docs/agent-skill",
    title: "Agent Skill",
    description: "Skill file that teaches AI coding agents to use datetime-helper accurately.",
    audience: "Agent integration",
  },
];
