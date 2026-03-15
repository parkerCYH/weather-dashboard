---
name: feature-dev-workflow
description: 'Plan-first development workflow for parkerCYH-portfolio. Use when implementing ANY new feature, page, component, or fix. Requires creating a dev plan markdown FIRST and waiting for explicit user confirmation ("可以開始") before writing any code. Dev plan must include E2E test cases with individual package.json test scripts — never run all tests at once.'
argument-hint: 'Brief description of the feature or fix to plan'
---

# Feature Development Workflow

## When to Use
- Implementing any new feature, section, page, or component
- Adding or refactoring API routes
- Making significant UI or i18n changes
- Any request where the user says "做 X" or "新增 X"

## Core Rule
**Never write production code before the dev plan is confirmed.**
The user must explicitly say **"可以開始"** (or equivalent confirmation) before implementation begins.

---

## Step 1 — Create the Dev Plan Document

Create a markdown file at the project root named `docs/DEV_<FEATURE_NAME>.md` (e.g., `docs/DEV_CONTACT_PAGE.md`).

### Template

```markdown
# Dev Plan: <Feature Name>

## Overview
One-paragraph description of what is being built and why.

## Scope
- What is **included**
- What is **out of scope**

## Implementation Steps
1. Step one (file/component to create or modify)
2. Step two
3. ...

## File Changes
| File | Action | Notes |
|------|--------|-------|
| `app/[locale]/contact/page.tsx` | Create | ... |

## i18n Keys (if applicable)
List any new keys to add to `messages/{zh-TW,en,ja}.json`.

## E2E Test Plan

### Test File
`tests/e2e/<feature-slug>.spec.ts`

### Test Cases
| # | Description | Steps | Expected |
|---|-------------|-------|----------|
| 1 | ... | 1. goto `/` <br> 2. click X | Should see Y |
| 2 | ... | ... | ... |

### package.json Script
```json
"test:e2e:<feature-slug>": "playwright test tests/e2e/<feature-slug>.spec.ts --reporter=list --workers=1"
```

## Open Questions
- Any ambiguities or decisions to be made before starting?
```

---

## Step 2 — Wait for Confirmation

After creating the dev plan, **stop**. Do not write any implementation code.

Present a summary to the user:
> "Dev plan created at `docs/DEV_<FEATURE_NAME>.md`. Please review and say **可以開始** when ready."

---

## Step 3 — Implement (after confirmation)

Follow the steps in the dev plan exactly. Key conventions for this project:

### Stack Conventions
- **Framework**: Next.js 16 App Router, React 19, TypeScript
- **Styling**: Tailwind v4, shadcn/ui components (`components/ui/`)
- **i18n**: next-intl 4.x — all pages under `app/[locale]/`, call `setRequestLocale(locale)` at the top of every page
- **Middleware**: `proxy.ts` (not `middleware.ts` — Next.js 16 rename)
- **API routes**: Stay at `app/api/` outside `[locale]/` to avoid locale prefix
- **Type safety**: `typedRoutes: true` is enabled

### i18n Checklist
- [ ] Add all new message keys to `messages/zh-TW.json`, `messages/en.json`, `messages/ja.json`
- [ ] Use `useTranslations()` hook in client components, `getTranslations()` in server components

---

## Step 4 — Add E2E Test

1. Create the test file at `tests/e2e/<feature-slug>.spec.ts`
2. Write test cases matching the plan (use Traditional Chinese for `test.describe` / `test` labels, matching the style in existing tests)
3. Add the individual script to `package.json`:
   ```json
   "test:e2e:<feature-slug>": "playwright test tests/e2e/<feature-slug>.spec.ts --reporter=list --workers=1"
   ```
4. **Do NOT add a script that runs all E2E tests at once.** Each feature gets its own script only.

### Existing Test Script Pattern (reference)
```json
"test:e2e:header-language-switcher": "playwright test tests/e2e/header-language-switcher.spec.ts --reporter=list --workers=1",
"test:e2e:language-switcher-double-click": "playwright test tests/e2e/language-switcher-double-click.spec.ts --reporter=list --workers=1"
```

---

## Step 5 — Verify

Run the following **in order**. All three must pass before the task is considered done.

```bash
pnpm tsc        # No TypeScript errors
pnpm lint       # No ESLint errors
pnpm test:e2e:<feature-slug>   # All E2E tests pass
```

- [ ] `pnpm tsc` — exits with code 0
- [ ] `pnpm lint` — exits with code 0
- [ ] `pnpm test:e2e:<feature-slug>` — all test cases pass

If any step fails, fix it before finishing. Do not skip or suppress errors.

---

## Anti-patterns to Avoid
- Starting implementation before `可以開始` is received
- Adding a `test:e2e` or `test:e2e:all` script that runs multiple spec files
- Skipping i18n keys for any hardcoded visible text
- Creating API routes under `app/[locale]/api/` (must stay at `app/api/`)
