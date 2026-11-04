# VPS infrastructure & deployment

| | |
|---|---|
| ID | `infra-vps` |
| Area | Infrastructure |
| Size | M |
| Wave | 7 |
| Depends on | `mob-cards-connect` (mobile feature-complete), `mob-import-export-connect` (mobile feature-complete), `mob-search-filter` (mobile feature-complete), `web-cards-connect` (web feature-complete), `web-import-export-connect` (web feature-complete), `web-search-filter` (web feature-complete) |
| Unlocks | none |

## Goal
Provision the production VPS: container runtime, reverse proxy with TLS serving the web build and the API, secrets, Supabase Postgres connection, backups/monitoring basics, CD for backend and web, and a production smoke test of both clients.

## In scope
- Provision and harden the VPS
- Container runtime and service setup for the backend
- Reverse proxy with TLS serving the web build and proxying the API (same domain)
- Secrets (DB credentials, JWT keys)
- Supabase production database, connection from the VPS, migrations on deploy
- CD: build and deploy backend and web on push to main
- Basic backups, log access, uptime checks
- Production smoke test of all v1 flows on web, Android and iOS

## Out of scope
- Staging environment (production only)
- Mobile store release

## Builds on
- All backend chunks (via the connect chunks), the backend Docker image (`be-scaffolding`) and the static web build (`web-scaffolding`)
- Base URL per environment from `*-api-client`

## Provides
- Production environment over HTTPS

## Done when
- A push to main deploys backend and web over HTTPS
- All v1 flows pass a smoke test against production on web, Android and iOS
- Secrets are not in the repo
- Rollback procedure documented

## Decisions from the breakdown
- Self-managed VPS, production only, CD folded in (user decision).
- Scheduled last on purpose: development runs against a local backend and Postgres until then (user decision). Edges to the final client chunks express this order, not a technical need.
- Accepted risk: TLS, cookies, iOS ATS and the Supabase pooler surface late.

## Open questions for the deep-dive session
- VPS provider and size
- Caddy vs. Nginx + certbot
- Docker Compose vs. systemd
- Image registry
- Domain and DNS
- Supabase pooler vs. direct connection
- Backup strategy beyond Supabase's own
