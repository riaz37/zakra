# Platform Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                        FIRST-TIME SETUP                         │
└─────────────────────────────────────────────────────────────────┘

  /login  ──►  /select-company  ──►  /companies
                    │                    └── create parent + subsidiaries
                    ▼
               /overview


┌─────────────────────────────────────────────────────────────────┐
│                      INFRASTRUCTURE                             │
└─────────────────────────────────────────────────────────────────┘

  /db-connections
    ├── Add connection → Test → Save
    └── /db-connections/[id]
          ├── Schema Explorer  (browse tables & columns)
          └── Business Rules   (semantic names, column masking)


┌─────────────────────────────────────────────────────────────────┐
│                    ACCESS MANAGEMENT                            │
└─────────────────────────────────────────────────────────────────┘

  /roles          /users                /table-access
  └── Create      └── Invite user       └── Select table
      role            └── Assign            └── Grant column
                          role                   permissions
                                                 per user


┌─────────────────────────────────────────────────────────────────┐
│                        DAILY USE                                │
└─────────────────────────────────────────────────────────────────┘

  /chat  ──────────────────────────────────────────────────────┐
    └── Select DB connection                                    │
    └── Ask question in natural language                        │
    └── AI pipeline:  Thinking → Grep → Read → Edit            │
    └── View SQL + results table                                │
                                                                │
  /reports/templates                                            │
    └── Create template (sections, chart types, query hints)   │
                                                                │
  /reports/ai-generate                                          │
    └── Pick connection + template (optional)                   │
    └── Describe report in plain English                        │
    └── AI generates sections with charts + analysis            │
    └── Download or view in /reports/history                    │
                                                               ◄┘


┌─────────────────────────────────────────────────────────────────┐
│                     TESTING CHECKLIST                           │
└─────────────────────────────────────────────────────────────────┘

  □ Login → wrong password shows error
  □ Create company with invalid slug → validation blocks it
  □ Add DB connection → test fails → shows error detail
  □ Business rule on masked column → chat shows "****"
  □ Regular user cannot access /users or /roles
  □ Switch company → all data scoped to new company
  □ Expired token → auto-refreshes, user never logged out
  □ Chat follow-up → context from prior turn preserved
  □ Report generation cancel → partial report saved
```
