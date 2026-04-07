import type { ExternalWindowSnapshot, ActiveContextMatch, ProviderWindowMatcher, MatchConfidence } from './window-context.js';

export class CodexMatcher implements ProviderWindowMatcher {
  public readonly provider = 'codex' as const;

  private readonly codexAppNames = ['codex', 'codex alpha'];
  private readonly codexProcessPatterns = ['codex'];

  match(snapshot: ExternalWindowSnapshot): ActiveContextMatch {
    const appName = snapshot.appName?.toLowerCase() ?? '';
    const processPath = snapshot.processPath?.toLowerCase() ?? '';
    const title = snapshot.title ?? '';

    const appMatch = this.codexAppNames.some(name => appName.includes(name));
    const pathMatch = this.codexProcessPatterns.some(pattern => processPath.includes(pattern));

    if (appMatch || pathMatch) {
      const { confidence, reason, sessionId } = this.deriveSessionMatch(title, snapshot.externalWindowId);

      return {
        key: {
          provider: 'codex',
          externalWindowId: snapshot.externalWindowId,
        },
        providerSessionId: sessionId,
        provider: 'codex',
        confidence,
        reason,
      };
    }

    return {
      key: null,
      providerSessionId: null,
      provider: null,
      confidence: 'none' as MatchConfidence,
      reason: 'Window does not match Codex app identity',
    };
  }

  private deriveSessionMatch(title: string, windowId: string): { confidence: MatchConfidence; reason: string; sessionId: string | null } {
    const hasSessionId = /\b[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b/i.test(title);
    
    if (hasSessionId) {
      const match = title.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
      return {
        confidence: 'high' as MatchConfidence,
        reason: 'Matched Codex window with session UUID in title',
        sessionId: match?.[1] ?? null,
      };
    }

    if (title.length > 0) {
      return {
        confidence: 'medium' as MatchConfidence,
        reason: 'Matched Codex window but no explicit session ID in title',
        sessionId: null,
      };
    }

    return {
      confidence: 'low' as MatchConfidence,
      reason: 'Matched Codex process but no identifiable session context',
      sessionId: null,
    };
  }
}

export class OpenCodeMatcher implements ProviderWindowMatcher {
  public readonly provider = 'opencode' as const;

  private readonly opencodeAppNames = ['opencode'];
  private readonly opencodeProcessPatterns = ['opencode'];

  match(snapshot: ExternalWindowSnapshot): ActiveContextMatch {
    const appName = snapshot.appName?.toLowerCase() ?? '';
    const processPath = snapshot.processPath?.toLowerCase() ?? '';
    const title = snapshot.title ?? '';

    const appMatch = this.opencodeAppNames.some(name => appName.includes(name));
    const pathMatch = this.opencodeProcessPatterns.some(pattern => processPath.includes(pattern));

    if (appMatch || pathMatch) {
      const { confidence, reason, sessionId } = this.deriveSessionMatch(title, snapshot.externalWindowId);

      return {
        key: {
          provider: 'opencode',
          externalWindowId: snapshot.externalWindowId,
        },
        providerSessionId: sessionId,
        provider: 'opencode',
        confidence,
        reason,
      };
    }

    return {
      key: null,
      providerSessionId: null,
      provider: null,
      confidence: 'none' as MatchConfidence,
      reason: 'Window does not match OpenCode app identity',
    };
  }

  private deriveSessionMatch(title: string, windowId: string): { confidence: MatchConfidence; reason: string; sessionId: string | null } {
    const hasSessionId = /\b[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b/i.test(title);
    
    if (hasSessionId) {
      const match = title.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
      return {
        confidence: 'high' as MatchConfidence,
        reason: 'Matched OpenCode window with session UUID in title',
        sessionId: match?.[1] ?? null,
      };
    }

    if (title.length > 0) {
      return {
        confidence: 'medium' as MatchConfidence,
        reason: 'Matched OpenCode window but no explicit session ID in title',
        sessionId: null,
      };
    }

    return {
      confidence: 'low' as MatchConfidence,
      reason: 'Matched OpenCode process but no identifiable session context',
      sessionId: null,
    };
  }
}

export class ClaudeMatcher implements ProviderWindowMatcher {
  public readonly provider = 'claude' as const;

  match(snapshot: ExternalWindowSnapshot): ActiveContextMatch {
    return {
      key: null,
      providerSessionId: null,
      provider: null,
      confidence: 'none' as MatchConfidence,
      reason: 'Claude matcher not yet implemented - interface placeholder',
    };
  }
}

export class CursorMatcher implements ProviderWindowMatcher {
  public readonly provider = 'cursor' as const;

  match(snapshot: ExternalWindowSnapshot): ActiveContextMatch {
    return {
      key: null,
      providerSessionId: null,
      provider: null,
      confidence: 'none' as MatchConfidence,
      reason: 'Cursor matcher not yet implemented - interface placeholder',
    };
  }
}

export function createAllMatchers(): ProviderWindowMatcher[] {
  return [
    new CodexMatcher(),
    new OpenCodeMatcher(),
    new ClaudeMatcher(),
    new CursorMatcher(),
  ];
}

export function findMatchingProvider(snapshot: ExternalWindowSnapshot): ActiveContextMatch | null {
  const matchers = createAllMatchers();
  
  for (const matcher of matchers) {
    const match = matcher.match(snapshot);
    if (match.confidence !== 'none') {
      return match;
    }
  }

  return null;
}