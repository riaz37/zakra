# Suggested Commands

## Dev
```bash
pnpm dev      # next dev (http://localhost:3000)
pnpm build    # next build
pnpm start    # next start (production server)
pnpm lint     # eslint
```

## shadcn/ui
```bash
pnpm dlx shadcn@latest add <component>     # add a shadcn primitive
pnpm dlx shadcn@latest diff                 # see local vs upstream drift
pnpm dlx skills add shadcn/ui --yes         # (re)install the shadcn skill
```

## Package management
```bash
pnpm add <pkg>            # runtime dep
pnpm add -D <pkg>          # dev dep
pnpm remove <pkg>
pnpm install              # install all (after pnpm-lock.yaml change)
```

> Always pnpm. Never npm/yarn/bun — would desync `pnpm-lock.yaml`.

## Git
```bash
git status
git diff
git log --oneline -20
git checkout -b <branch>
```

## macOS / Darwin notes
- Shell: zsh
- `find`/`grep`/`sed` are BSD variants — prefer the dedicated Read/Grep/Glob tools.
