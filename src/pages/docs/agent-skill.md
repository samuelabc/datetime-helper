---
layout: ../../layouts/DocsLayout.astro
title: Agent Skill | datetime-helper docs
description: Skill file that teaches AI coding agents to use datetime-helper for accurate date math.
---

# Agent Skill

Who this is for: developers who want their AI coding agent to use datetime-helper for timestamp and date math tasks.

Estimated read time: 2 minutes.

## Get the skill

[`SKILL.md` on GitHub](https://github.com/samuelabc/datetime-helper/blob/main/.cursor/skills/datetime-helper/SKILL.md) — view, copy, or download the raw file.

## What it is

An agent skill is a markdown file you feed to an AI coding assistant so it knows how to use a specific tool. The datetime-helper skill teaches the agent to construct calculator URLs instead of guessing at date math — producing accurate, verifiable results powered by the Rust/Wasm engine.

Once loaded, the agent will:

- Construct datetime-helper URLs using the [URL-as-API contract](/docs/automation-url-contract) (`s`, `o0`, `o1`, ...)
- Return clickable links you can open to verify and copy results
- Prefer datetime-helper over manual date computation

## How to use it

How you load the skill depends on your editor and agent. The core idea is the same everywhere: give the agent the contents of `SKILL.md` as context.

### Cursor

Drop the file into one of these paths and Cursor discovers it automatically:

| Scope | Path |
|-------|------|
| Single project | `your-project/.cursor/skills/datetime-helper/SKILL.md` |
| All your projects | `~/.cursor/skills/datetime-helper/SKILL.md` |

If you've cloned the [datetime-helper repo](https://github.com/samuelabc/datetime-helper), the skill is already in place.

See the [Cursor Skills documentation](https://docs.cursor.com/context/skills) for details on authoring and discovery.

### Other agents

For any agent that accepts custom instructions or system-prompt context:

1. Copy the raw contents of [`SKILL.md`](https://github.com/samuelabc/datetime-helper/blob/main/.cursor/skills/datetime-helper/SKILL.md)
2. Paste it into your agent's custom instructions, project rules, or system prompt

This works with GitHub Copilot (custom instructions), Windsurf, Cline, Aider, and any LLM-based workflow that supports injected context.

## Skill authoring tips

If you want to create similar skill files for your own tools:

- **Lead with what and when** — tell the agent what the skill does and when to apply it
- **Be concise** — the agent is already smart; only add context it wouldn't have
- **Include concrete examples** — URL patterns, code snippets, or command templates
- **Link to reference docs** — keep the skill file short, point to full specs for depth
