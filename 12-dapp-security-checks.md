# dApp Security Best Practices & Checks

This is a _quick mental model_ for building secure Web3 dApps on Vercel.  
Reality and experience tell us that **most incidents come from architecture, not tools**.

---

## The Core Rule

**Never let the frontend be your backend.**

If the browser can:
- call RPCs directly
- access Supabase / Redis / service APIs
- hold secrets or high-privilege tokens

...then attackers can do it too, at scale.

---

## The Right Shape

`Frontend → BFF (server-side) → RPC / DB / Cache / External services`


The **Backend-for-Frontend (BFF)** is the **only choke point**.

If something must be protected, it must live behind the BFF.

---

## What the BFF Must Enforce (Always)

- Authentication & authorization
- Rate limiting (per route, not only global)
- Caching for expensive operations
- RPC access control
- Payload and method limits
- Graceful degradation on overload

If a control is spread across UI + middleware + random endpoints,
it is not a real control.

---

## Absolute Rules

### Secrets
- ❌ No private keys, admin tokens, service-role keys in the UI
- ✅ Short-lived tokens, minimal scopes, server-side only

### RPC
- ❌ Direct browser → unlimited RPC calls
- ✅ RPC access only through BFF for expensive flows
- ✅ Separate client vs backend RPC keys

### Caching
- ❌ Frontend cache is not protection
- ✅ Cache heavy reads server-side
- ✅ Protect against cache stampede

### GraphQL
- ❌ Introspection & playground in prod
- ✅ Depth & complexity limits
- ✅ POST-only, payload limits

---

## Vercel Reality Check

- Edge/middleware is **not a full backend**
- Rate limiting alone does not stop large attacks
- Concurrency exhaustion is a real failure mode

Use:
- Vercel Firewall (paths + methods)
- Bot protection / challenge mode during attacks
- Kill switches for expensive features

---

## Final Checklist (If any is “No”, stop)

- [ ] Is there a clear BFF?
- [ ] Are secrets fully server-side?
- [ ] Are expensive RPC calls cached?
- [ ] Are rate limits per endpoint?
- [ ] Can we degrade safely under attack?

---

**If the architecture is wrong, no amount of WAFs or rate limits will save you.**
