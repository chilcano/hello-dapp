# dApp Security Controls & Best Practices

Baseline security and design guidelines for Web3 dApps (Next.js / Node.js) deployed on Vercel.
Focused on preventing DoS abuse, RPC exhaustion, secret exposure, and cascading failures
caused by monolithic frontend architectures.

---

## 1. Architecture & Application-Level Best Practices

### 1.1 Backend-for-Frontend (BFF) as the Core Pattern

**Anti-pattern (root cause of most incidents):**
- Monolithic frontend
- Direct RPC calls from the browser
- Secrets or high-privilege tokens exposed in UI
- Thin Vercel middleware acting as pseudo-backend
- Controls (auth, rate limit, cache) fragmented or missing

**Recommended pattern:**

`Frontend → BFF (server-side) → RPC / Supabase / Redis / External services`


The BFF acts as the **single choke point** where all security and performance controls
are consistently enforced.

This BFF can be:
- Vercel Serverless / Edge functions with strict limits, or
- A separate backend service (preferred for high-throughput or mission-critical dApps)

---

### 1.2 Consequences of a Proper BFF (Design Guarantees)

When the BFF is the only access path to sensitive resources, the following become
**natural properties**, not ad-hoc fixes:

- **Secrets never reach the UI**
  - No private keys, admin tokens, service-role keys, or unscoped RPC credentials
  - Use short-lived tokens and minimal scopes

- **Centralized security controls**
  - Authentication and authorization
  - Rate limiting (per-IP, per-identity, per-route)
  - Caching and deduplication
  - Payload size and method restrictions

- **Reduced blast radius**
  - Expensive operations isolated
  - Features can be degraded or disabled without full outage

---

### 1.3 API & GraphQL Hardening (Implemented at the BFF)

- Disable GraphQL introspection in production
- Remove playground / explorer endpoints from prod
- Enforce query depth and complexity limits
- Require authentication for schema access
- Restrict HTTP methods (e.g. POST-only GraphQL)
- Enforce strict payload size limits and fail fast

---

### 1.4 Caching Strategy (Mandatory, Server-Side)

- Cache all expensive or repeated onchain reads at the BFF layer
- Never rely on frontend-only caching for protection
- Use Redis / KV with:
  - Defensive TTLs (≥30s for heavy RPC calls)
  - Stampede protection (deduplication / locking)
- Monitor cache MISS storms and protect upstream dependencies

---

### 1.5 RPC Usage Discipline

- Separate RPC endpoints and keys:
  - Client-facing: strict per-IP limits, minimal privileges
  - Server-side/BFF: strict global caps, monitored
- Never proxy unlimited RPC calls from untrusted endpoints
- Handle RPC 429 / timeout errors gracefully and degrade service

---

## 2. Vercel-Specific Security Controls

### 2.1 Platform & Firewall
- Enable Vercel Firewall rules:
  - Path-based protection for sensitive routes
  - Method restrictions (e.g. block GET on GraphQL)
- Set conservative function timeout and memory limits
- Monitor and alert on concurrent execution saturation

### 2.2 Bot & L7 Protection
- Enable bot protection on public routes
- Prepare challenge-based protection for attack periods
- Use external L7 defense (e.g. Cloudflare) during sustained attacks

---

## 3. Observability & Incident Readiness

- Centralize logs and alerts
- Never log secrets, private keys, tokens, or RPC credentials
- Assume logs may become attacker-accessible if misconfigured
- Alert on:
  - Traffic spikes
  - RPC error / 429 rates
  - Cache MISS storms
  - Concurrency exhaustion

### Kill Switches
- Feature flags to:
  - Disable expensive endpoints
  - Increase caching or strict limits
  - Temporarily degrade functionality
- Test kill switches regularly

---

## 4. Mandatory Security Checklist

- [ ] BFF defined as the single control point
- [ ] No secrets exposed to the UI
- [ ] GraphQL introspection disabled; playground removed
- [ ] Endpoint-specific rate limits enforced
- [ ] Server-side caching with stampede protection
- [ ] RPC endpoints segmented and monitored
- [ ] Vercel Firewall and method restrictions enabled
- [ ] Bot protection and attack mode ready
- [ ] Logs sanitized and alerts configured
- [ ] Kill switches tested

---

**Most dApp security failures are architectural, not tooling-related.  
Fix the shape of the system first; controls will follow naturally.**
