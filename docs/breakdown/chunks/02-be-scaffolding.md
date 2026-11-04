# Backend scaffolding & architecture

| | |
|---|---|
| ID | `be-scaffolding` |
| Area | Backend |
| Size | M |
| Wave | 1 |
| Depends on | none |
| Unlocks | `be-common` |

## Goal
Spring Boot (Kotlin) modular monolith with the modules `:app`, `:common`, `:user` and `:board`, Postgres connection through `DB_*` config, schema handling per profile, console logging, liveness health endpoint, Dockerfile and CI build/test.

## In scope
- Kotlin Spring Boot project and build setup
- Gradle modules `:app`, `:common`, `:user` and `:board`, and layering conventions
- Postgres: the Supabase dev branch through the session pooler for development. Any other Postgres works by pointing `DB_*` at it, with no compose file or extra profile
- `dev` profile: Hibernate `update`, Flyway off
- `prod` profile: Flyway on with `validate`, and no migration files yet
- Console logging, liveness health endpoint
- Dockerfile
- CI: build + tests incl. one smoke test on a Testcontainers Postgres

## Out of scope
- Error handling, security, SpringDoc, validation (`be-common`)
- Server provisioning and CD (`infra-vps`)
- Any migration file. The baseline migration is written from the entities before the first production deploy

## Builds on
- Nothing (root chunk)

## Provides
- Bootable service skeleton, Flyway configuration for production, Postgres-backed test setup, container image

## Done when
- Service boots with `dev` against the Supabase dev branch, and with `prod` against an empty Postgres
- Health endpoint responds
- CI builds and runs tests
- Docker image builds

## Decisions from the breakdown
- Kotlin + Spring Boot (user decision).
- PostgreSQL on Supabase, used purely as a database.

## Decisions from the deep-dive session
- Multi-module Gradle build: `:app`, `:common`, `:user`, `:board`. Boards, columns, cards, labels and import/export are packages inside `:board`.
- JPA with Spring Data.
- Flyway, on `prod` only for now. Dev uses Hibernate `update`, so there are no migrations until the baseline.
- Testcontainers Postgres 17 for tests, with Hibernate `create-drop` until the baseline migration exists.
- GitHub Actions, running `./gradlew build`.
