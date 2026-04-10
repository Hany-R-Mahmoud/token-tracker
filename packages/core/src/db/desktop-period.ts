export type DesktopPeriodId = '1h' | '1d' | '7d' | '1m' | 'all';

export type DesktopPeriodKind = 'relative_hours' | 'relative_days' | 'all_time';

export interface DesktopPeriod {
  id: DesktopPeriodId;
  label: string;
  kind: DesktopPeriodKind;
  amount: number | null;
}

export const DESKTOP_PERIODS: DesktopPeriod[] = [
  { id: '1h', label: '1hr', kind: 'relative_hours', amount: 1 },
  { id: '1d', label: '1 day', kind: 'relative_days', amount: 1 },
  { id: '7d', label: '7 days', kind: 'relative_days', amount: 7 },
  { id: '1m', label: '1 month', kind: 'relative_days', amount: 30 },
  { id: 'all', label: 'All', kind: 'all_time', amount: null },
];

export function getDesktopPeriod(id: DesktopPeriodId): DesktopPeriod | undefined {
  return DESKTOP_PERIODS.find((p) => p.id === id);
}

export function periodIdToDays(id: DesktopPeriodId): number {
  const period = getDesktopPeriod(id);
  if (!period || period.kind === 'all_time') return 36500;
  if (period.kind === 'relative_hours') return 0;
  return period.amount ?? 30;
}

export function periodIdToHours(id: DesktopPeriodId): number {
  const period = getDesktopPeriod(id);
  if (!period || period.kind === 'all_time') return 36500 * 24;
  if (period.kind === 'relative_hours') return period.amount ?? 1;
  if (period.kind === 'relative_days') return (period.amount ?? 1) * 24;
  return 36500 * 24;
}

export function daysToPeriodId(days: number): DesktopPeriodId {
  if (days === 0) return '1h';
  if (days === 1) return '1d';
  if (days === 7) return '7d';
  if (days >= 30 && days < 60) return '1m';
  return 'all';
}

export function formatPeriodLabel(id: DesktopPeriodId): string {
  const period = getDesktopPeriod(id);
  return period?.label ?? id;
}