# Project Structure

```
kb-next/
├── src/
│   ├── app/                Next.js App Router (layout, page, globals.css)
│   ├── components/ui/      shadcn primitives (avatar, badge, button, card, dialog, …)
│   ├── api/                axios client + per-resource modules
│   │   ├── axios.ts        instance + JWT/refresh interceptor (subscriber queue)
│   │   ├── auth.ts         login/logout/refresh/getCurrentUser
│   │   ├── chat.ts         chat sessions + messages
│   │   ├── companies.ts
│   │   ├── db-connections.ts
│   │   ├── db-query.ts
│   │   ├── reports.ts
│   │   ├── roles.ts
│   │   ├── sse.ts          SSE helper for streaming chat responses
│   │   ├── table-access.ts
│   │   └── users.ts
│   ├── hooks/              TanStack Query hooks (use<Resource>.ts) + use-toast
│   ├── store/              Zustand stores: authStore, chatStore, uiStore
│   ├── types/              shared TS types per resource (auth, chat, company, …)
│   ├── lib/utils.ts        cn() (clsx + tailwind-merge)
│   └── utils/              constants, formatters, cn re-export
├── public/                 static assets
├── .carl/                  project-local CARL rules
├── .serena/                serena project config + memories
├── .agents/skills/         agent-skills (shadcn)
├── .claude/skills/         symlinks to .agents/skills
├── components.json         shadcn CLI config
├── next.config.ts
├── tsconfig.json           paths: @/* → src/*
└── package.json
```

## Conventions
- Path alias `@/*` → `src/*` for all internal imports
- One file per API resource in `src/api/`
- One TanStack Query hook per resource in `src/hooks/use<Resource>.ts`
- One Zustand store per concern in `src/store/`
- Types colocated with the resource in `src/types/`
