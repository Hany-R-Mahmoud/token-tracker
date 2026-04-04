const LOW_SIGNAL_PREFIXES = [
  '# AGENTS.md instructions',
  '<environment_context>',
  '<cwd>',
  '<INSTRUCTIONS>',
  '<permissions instructions>',
  'You are Codex',
  'You are ChatGPT',
  'You are OpenCode',
  'You are an AI assistant',
  'Act as',
  'Environment:',
  'Files to read:',
  'Important:',
] as const;

const LOW_SIGNAL_PATTERNS = [
  /^#+\s*(system|developer|assistant|user)\b/i,
  /^<[/a-z_:-]+>$/i,
  /^```[a-z0-9-]*$/i,
  /^current working directory:/i,
  /^working directory:/i,
  /^follow these steps:/i,
  /^before finishing,/i,
  /^run all of these:/i,
  /^must follow/i,
] as const;

const TRANSCRIPT_FILTER_PATTERNS = [
  /^```/,
  /^<[/a-z_:-]+>$/i,
  /^diff --git\b/i,
  /^(index|@@)\b/,
  /^[+\-]{3}\s/,
  /^[+\-][^\-]/,
  /^\s*[{[(][\s\S]*[})\]]\s*$/,
  /^\s*(function|class|interface|type|const|let|var|import|export)\b/,
] as const;

export function deriveBoundedTitle(input: string | null, maxLength = 80): string | null {
  if (!input) {
    return null;
  }

  const candidates = collectTitleCandidates(input);
  const preferred = candidates.find((candidate) => isUsefulPromptText(candidate)) ?? candidates[0] ?? null;

  if (!preferred) {
    return null;
  }

  return preferred.slice(0, maxLength);
}

export function isUsefulPromptText(input: string | null): boolean {
  if (!input) {
    return false;
  }

  const collapsed = normalizeWhitespace(input);
  if (collapsed.length < 8) {
    return false;
  }

  if (LOW_SIGNAL_PREFIXES.some((prefix) => collapsed.startsWith(prefix))) {
    return false;
  }

  return !LOW_SIGNAL_PATTERNS.some((pattern) => pattern.test(collapsed));
}

export function extractUsefulTranscriptSnippet(input: string | null, maxLength = 280): string | null {
  if (!input) {
    return null;
  }

  const candidate = input
    .split(/\r?\n/)
    .map((line) => normalizeWhitespace(line))
    .find((line) => line.length > 0 && isUsefulPromptText(line) && !looksLikeFilteredTranscriptLine(line));

  if (!candidate) {
    return null;
  }

  return candidate.slice(0, maxLength);
}

function collectTitleCandidates(input: string): string[] {
  const lines = input
    .split(/\r?\n/)
    .map((line) => sanitizeCandidate(line))
    .filter((line): line is string => line !== null);

  if (lines.length > 0) {
    return lines;
  }

  const collapsed = sanitizeCandidate(input);
  return collapsed ? [collapsed] : [];
}

function sanitizeCandidate(input: string): string | null {
  const collapsed = normalizeWhitespace(input);
  if (collapsed.length === 0) {
    return null;
  }

  const withoutPrefixes = collapsed
    .replace(/^[-*\d.)\s]+/, '')
    .replace(/^(title|subject|prompt|request|task|goal):\s*/i, '')
    .trim();

  if (withoutPrefixes.length === 0) {
    return null;
  }

  const sentence = withoutPrefixes.split(/(?<=[.!?])\s+/)[0] ?? withoutPrefixes;
  const bounded = sentence.replace(/[\s:;,.!?-]+$/, '').trim();

  if (bounded.length === 0 || looksLikeFilteredTranscriptLine(bounded)) {
    return null;
  }

  return bounded;
}

function looksLikeFilteredTranscriptLine(input: string): boolean {
  return TRANSCRIPT_FILTER_PATTERNS.some((pattern) => pattern.test(input));
}

function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}
