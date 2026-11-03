# VPS infrastructure & deployment

| | |
|---|---|
| ID | `infra-vps` |
| Area | Infrastructure |
| Size | M |
| Wave | 2 |
| Depends on | `be-scaffolding` (Docker image of the backend), `web-scaffolding` (static web build) |
| Unlocks | `mob-integration`, `web-integration` |

## Goal
Provision the production VPS: container runtime, reverse proxy with TLS serving the web build and the API, secrets, Supabase Postgres connection, backups/monitoring basics, and an automated CD pipeline for backend and web.

## In scope
- Provision and harden the VPS (users, SSH, firewall, updates)
- Container runtime and service setup for the backend
- Reverse proxy with TLS serving the web build and proxying the API (same domain)
- Secrets management (DB credentials, JWT keys)
- Supabase project/production database and the connection from the VPS, migrations on deploy
- Automated CD pipeline: build, push and deploy backend and web on push to main
- Basic backups, log access and uptime checks

## Out of scope
- Staging environment (production only, user decision)
- Mobile store releases (out of plan)

## Builds on
- `be-scaffolding`: Docker image of the backend
- `web-scaffolding`: static web build

## Provides
- Deployed production environment with HTTPS URL that both integration chunks target

## Done when
- A push to main deploys backend and web to production over HTTPS
- Health endpoint answers publicly
- Secrets are not in the repo
- A rollback procedure is documented

## Decisions from the breakdown
- Self-managed VPS, no cloud hoster (user decision).
- Web app served from the same VPS (user decision).
- Production environment only; CD folded into this chunk (user decision).

## Open questions for the deep-dive session
- VPS provider and size
- Reverse proxy (Caddy vs. Nginx + certbot)
- Docker Compose vs. systemd
- Image registry (GHCR?)
- Domain and DNS
- Zero-downtime deploys needed?
- Supabase connection pooling (pooler vs. direct)
- Backup strategy beyond Supabase's own
