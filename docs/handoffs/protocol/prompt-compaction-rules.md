# Prompt Compaction Rules

This file exists to reduce token/context waste in Codex-to-OpenCode and
OpenCode-to-Codex handoffs.

## Problem

Large prompt sections have been repeated across phases with only small changes.
That causes:

- unnecessary token burn
- stale copies drifting out of sync
- contradictory instructions between prompt versions
- larger context windows spent on workflow text instead of the real task

## Rule

Stable instructions must live in files. Phase prompts should reference those
files instead of re-copying them.

## Stable Content That Must Be File-Backed

- execution baseline
- reporting baseline
- handoff archive rules
- phase research cornerstone
- phase spec / tasks / quickstart

## Content That Should Stay Inline In A Prompt

- the current mission
- what is in scope for this pass
- what is explicitly out of scope for this pass
- the immediate gaps or blockers to resolve
- any acceptance nuance unique to the phase

## Good Prompt Pattern

Use:

- a short opening sentence for the mission
- a short read-first file list
- a short list of phase-specific rules
- a short list of validation expectations
- references to the stable baseline files

Do not use:

- repeated generic agent lists when they already live in a shared baseline
- repeated long report templates when a shared reporting file exists
- repeated archive and naming instructions when those already live in docs

## OpenCode Reporting Rule

If OpenCode sends a correction pass or final report, it should reference the
reporting baseline and only add the phase-specific status delta.

## Codex Prompting Rule

If Codex sends a new implementation or correction prompt, it should reference:

- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-execution-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-reporting-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/README.md`

Then keep the prompt focused on the actual phase task.
