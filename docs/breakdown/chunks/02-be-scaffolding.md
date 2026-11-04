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
Spring Boot (Kotlin) project, package/module layout, Postgres connection (local + Supabase via config), migration tooling, logging, health endpoint, Dockerfile and CI build/test.

## In scope
- Kotlin Spring Boot project and build setup
- Package/module structure and layering conventions
- Postgres: local (Docker) for development, Supabase for production via config
- Migration tooling with an initial empty migration
- Logging, health endpoint
- Dockerfile
- CI: build + tests incl. DB-backed integration tests

## Out of scope
- Error handling, security, SpringDoc, validation (`be-common`)
- Server provisioning and CD (`infra-vps`)

## Builds on
- Nothing (root chunk)

## Provides
- Bootable service skeleton, migration pipeline, Postgres-backed test setup, container image

## Done when
- Service boots locally against Postgres
- Health endpoint responds
- CI builds and runs tests
- Docker image builds

## Decisions from the breakdown
- Kotlin + Spring Boot (user decision).
- PostgreSQL on Supabase, used purely as a database.

## Open questions for the deep-dive session
- Single module vs. multi-module Gradle build
- Persistence approach (JPA, Spring Data JDBC, jOOQ, Exposed)
- Flyway vs. Liquibase
- Testcontainers for integration tests?
- CI provider
