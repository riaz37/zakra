# kb-next — Project Overview

## What
ESAP-KB Admin frontend. Internal admin console for the ESAP knowledge-base platform.

## Tech Stack
- **Framework**: Next.js 16 App Router + React 19, TypeScript strict
- **Package manager**: pnpm (workspace — see `pnpm-workspace.yaml`)
- **Styling**: Tailwind CSS v4 (CSS-first config in `src/app/globals.css`)
- **UI**: shadcn/ui (`src/components/ui/`), `@base-ui/react`, lucide-react, next-themes, sonner, recharts
- **Server state**: TanStack Query (`@tanstack/react-query`) + TanStack Table
- **Client state**: Zustand (`src/store/`)
- **Forms**: react-hook-form + `@hookform/resolvers/zod`
- **HTTP**: axios (`src/api/axios.ts`) with JWT + refresh-token interceptor

## Backend
External REST API. Base URL via `NEXT_PUBLIC_API_BASE_URL` (see `.env.example`).
This repo is frontend-only — there is no Next.js API route layer.

## Resources Implemented in src/api
auth, chat (with SSE stream), companies, db-connections, db-query, reports
(AI report generation + download), roles, table-access, users.

## Important Files
- `CLAUDE.md` — project Claude Code instructions
- `AGENTS.md` — Next.js 16 breaking-changes warning
- `DESIGN.md` — Cursor-inspired design system spec (read before any UI work)
- `.carl/` — project-local CARL domain rules
- `.agents/skills/shadcn/` — shadcn skill (symlinked into `.claude/skills/`)
