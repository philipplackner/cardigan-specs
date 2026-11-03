# Backend scaffolding & architecture

| | |
|---|---|
| ID | `be-scaffolding` |
| Area | Backend |
| Size | M |
| Wave | 1 |
| Depends on | none |
| Unlocks | `be-auth`, `infra-vps` |

## Goal
Spring Boot (Kotlin) project, package/module layout, Postgres connection (local + Supabase), migration tooling, global error handling, logging, health endpoint, Dockerfile and CI build/test.

## In scope
- Kotlin Spring Boot project and build setup
- Package/module structure and layering conventions
- Postgres connection: local (Docker) for development, Supabase for production via config
- Migration tooling with an initial empty migration
- Global error handling matching the contract's error model
- Logging, health endpoint
- Dockerfile for the service
- CI: build + tests (incl. DB-backed integration tests)

## Out of scope
- Auth and any domain features (`be-auth` onwards)
- Server provisioning and CD (`infra-vps`)

## Builds on
- Nothing (root chunk; greenfield repo)

## Provides
- Bootable service skeleton, migration pipeline, test setup with a real Postgres, container image

## Done when
- Service boots locally against Postgres
- Health endpoint responds
- CI builds and runs tests
- Docker image builds

## Decisions from the breakdown
- Kotlin + Spring Boot (user decision).
- PostgreSQL hosted on Supabase, used purely as a database.

## Open questions for the deep-dive session
- Gradle Kotlin DSL single module vs. multi-module
- Persistence approach (JPA/Hibernate, Spring Data JDBC, jOOQ, Exposed)
- Migration tool (Flyway vs. Liquibase)
- Integration tests via Testcontainers?
- CI provider (GitHub Actions assumed by infra chunk)
- Error reporting/monitoring tool, if any
