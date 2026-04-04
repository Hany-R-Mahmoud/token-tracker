# Quickstart: Production OAuth And Session Hardening

Required checks:

- OAuth start redirects correctly when credentials are configured
- OAuth callback exchanges code and fetches a real GitHub user
- connected identity persists correctly across requests
- invalid or missing state is rejected
- disconnect clears the authenticated session safely
- docs accurately describe dev-mode vs production-mode auth behavior
