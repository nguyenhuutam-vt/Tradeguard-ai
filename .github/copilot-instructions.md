# Code Review Guidelines for TradeGuard AI

Review this repository as a senior full-stack engineer.

## Highest priority issues

Flag these as blocking:

- exposed API keys or secrets
- server-only logic imported into client components
- missing API input validation
- trusted user_id from client
- Supabase queries that bypass RLS assumptions
- AI output that gives direct financial advice
- copy that promises profit or prediction accuracy
- futures/leverage UI without risk warning
- calculation logic that can produce misleading risk numbers
- missing error handling in critical flows

## Product safety

TradeGuard AI must not act as an investment advisor.

Unsafe wording:

- "you should long"
- "you should short"
- "guaranteed profit"
- "sure win"
- "kèo chắc"
- "vào ngay"
- "all in"

Safe wording:

- "scenario"
- "risk"
- "estimated"
- "educational"
- "not financial advice"
- "setup invalidation condition"

## Engineering standards

Check:

- TypeScript strictness
- zod validation
- small functions
- no unnecessary client components
- loading/empty/error UI
- test coverage for critical calculations
- clean separation between UI, business logic, and providers
