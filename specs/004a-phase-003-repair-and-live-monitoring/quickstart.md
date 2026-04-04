# Quickstart: Phase 003 Repair And Live Monitoring

## Validation

Required checks:

- `npm run typecheck`
- `npm run build`
- verify docs now match implementation
- verify watcher triggers when supported source data changes
- verify watcher idle state does not thrash CPU or spam refreshes
- verify menu bar and overview show refresh state and reset countdowns
- verify 7/30-day window controls work where introduced
- verify local preferences persist and are respected
