export interface GitHubIdentity {
  githubId: number;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  email: string | null;
  connectedAt: string;
}

export interface LeaderboardMembership {
  userId: string;
  githubId: number;
  teamId: string;
  optedIn: boolean;
  optedInAt: string | null;
  optedOutAt: string | null;
}

export interface LeaderboardSnapshot {
  id: string;
  teamId: string;
  computedAt: string;
  windowDays: number;
  entries: LeaderboardEntry[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  githubId: number;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  efficiencyScore: number;
  sessionCount: number;
  totalTokens: number;
  totalCostUsd: number;
  averageCacheHitRate: number | null;
  wasteScore: number | null;
  outcomeSuccessRate: number | null;
}

export interface TeamSettings {
  teamId: string;
  teamName: string;
  defaultWindowDays: number;
  createdAt: string;
}

export interface PrivacyPolicy {
  version: string;
  sharedData: string[];
  neverSharedData: string[];
  optInRequired: boolean;
  adminCanOverride: boolean;
}

export const TTM_PRIVACY_POLICY: PrivacyPolicy = {
  version: '1.0.0',
  sharedData: [
    'GitHub username and display name',
    'Avatar URL',
    'Aggregated efficiency score',
    'Session count (not content)',
    'Total tokens and cost (aggregated)',
    'Cache hit rate (aggregated)',
    'Outcome success rate (aggregated)',
  ],
  neverSharedData: [
    'Session content (prompts, responses, code)',
    'File paths or project names',
    'Tool call details',
    'Individual session data',
    'Reset window information',
    'Provider authentication tokens',
  ],
  optInRequired: true,
  adminCanOverride: false,
};
