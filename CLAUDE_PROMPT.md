# Claude Code Implementation Prompt

Copy and paste the following prompt when starting Claude Code in this project directory:

---

```
You are implementing a production-grade e-commerce platform. All planning is complete. Your job is to EXECUTE the implementation.

## Project Context

- **Project:** DXLR E-Commerce Platform
- **Stack:** Next.js 16, TypeScript, Tailwind CSS, Supabase, Paymob
- **UI:** Pre-built HTML/CSS screens exist in `/ui` folder - preserve exact styling

## Documentation Available

Read these files BEFORE starting any work:

1. `TECHNICAL_PLAN.md` - High-level architecture
2. `TECHNICAL_PLAN_AMENDMENTS.md` - Security requirements & Next.js 16 specifics
3. `docs/IMPLEMENTATION_CHECKLIST.md` - **START HERE** - Ordered tasks with exact commands
4. `docs/FILE_STRUCTURE.md` - Every file to create with paths
5. `docs/DATABASE_MIGRATIONS.md` - SQL to execute in Supabase
6. `docs/UI_CONVERSION_MAP.md` - How to convert HTML screens to React
7. `docs/API_ROUTES.md` - API endpoint specifications

## Critical Rules

1. **Follow the checklist in order** - Tasks have dependencies
2. **Do NOT redesign the UI** - Copy Tailwind classes exactly from `/ui` HTML files
3. **Server-side validation is mandatory** - Client validation is for UX only
4. **RLS must be enabled on ALL tables** - No exceptions
5. **Service role key NEVER in client code** - Only in API routes/webhooks
6. **Test each phase before proceeding** - Run `npm run build` after Phase 1

## Your First Action

1. Read `docs/IMPLEMENTATION_CHECKLIST.md` completely
2. Start with Task 1.1: Initialize Next.js 16 project
3. Complete Phase 1 tasks in order
4. Run `npm run build` to verify before Phase 2

## When Converting UI

For each screen in `/ui`:
1. Read the `code.html` file
2. Reference the `screen.png` for visual confirmation
3. Extract Tailwind classes exactly
4. Create React component following `docs/UI_CONVERSION_MAP.md`
5. Verify visual match

## Environment Setup

You will need these environment variables (user must provide values):
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- PAYMOB_API_KEY
- PAYMOB_INTEGRATION_ID
- PAYMOB_IFRAME_ID
- PAYMOB_HMAC_SECRET

Begin by reading the implementation checklist and executing Task 1.1.
```

---

## Quick Start Command

```bash
cd /path/to/new-ecom
claude
```

Then paste the prompt above.

## Alternative: Save as System Prompt

You can also save this as a `.claude` file or use it with the `--system-prompt` flag if your Claude Code setup supports it.
