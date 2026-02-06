# dApp Security Controls & Best Practices

This document defines **mandatory security best practices and platform checks** for Web3 dApps built with Node.js / React / Next.js and deployed on Vercel.

The objective is to **prevent DoS abuse, RPC exhaustion, data exposure, and cascading failures** observed in previous incidents.

---

## 1. Application-Level Best Practices

### 1.1 API & GraphQL Hardening
- Disable GraphQL introspection in production.
- Remove GraphQL playground / explorer endpoints from prod.
- Enforce query depth and complexity limits.
- Require authentication for schema access.
- Enforce strict payload size limits and fail fast.

### 1.2 Caching Strategy (Mandatory)
- Cache all expensive or repeated onchain reads.
- Never rely on frontend-only caching.
- Use server-side or middleware cache (e.g. Redis / KV).
- Set defensive TTLs (≥30s for heavy RPC calls).
- Protect against cache stampede (request deduplication or locking).

### 1.3 RPC Usage Discipline
- Separate RPC endpoints:
  - Client-facing RPCs (per-IP rate limited).
  - Backend/middleware RPCs (strict global limits).
- Never expose shared or high-limit RPCs to untrusted endpoints.
- Handle RPC 429 / timeout errors gracefully.

---

## 2. Rate Limiting & Abuse Controls

### 2.1 Edge / Middleware Controls
- Apply rate limiting **before** serverless execution.
- Use endpoint-specific limits (not only global limits).
- Support feature flags to enable/disable limits safely.
- Assume attackers will distribute traffic across IPs.

### 2.2 DoS Reality Check
- Rate limiting alone is insufficient at high scale.
- Assume attackers can exhaust Redis / KV write limits.
- Protect **concurrency and execution**, not only request count.

---

## 3. Vercel-Specific Security Controls

### 3.1 Platform & Firewall
- Enable Vercel Firewall rules for:
  - Path-based protection.
  - HTTP method restrictions (e.g. POST-only GraphQL).
- Monitor concurrent execution saturation.
- Enforce strict function timeout and memory limits.

### 3.2 Bot & L7 Protection
- Enable bot protection on public routes.
- Use challenge-based protection during active attacks.
- Prepare external L7 protection (e.g. Cloudflare) for attack periods.

---

## 4. Observability & Incident Readiness

### 4.1 Logging & Monitoring
- Centralize logs and alerts.
- Never log secrets, private keys, or tokens.
- Assume logs may become attacker-accessible if misconfigured.
- Alert on:
  - Traffic spikes
  - RPC error rates
  - Cache miss storms
  - Concurrent execution exhaustion

### 4.2 Kill Switches
- Feature flags for:
  - Rate limiting
  - Expensive endpoints
  - Onchain-heavy features
- Ability to degrade functionality without full outage.

---

## 5. Architecture & Design Principles

- Avoid monolithic frontends handling critical workloads.
- Treat dApps as **mission-critical Web2 systems**.
- Assume adversarial traffic at all times.
- Design for blast-radius containment and graceful degradation.

---

## 6. Mandatory Security Checklist

- [ ] GraphQL introspection disabled in production
- [ ] GraphQL playground removed
- [ ] Edge rate limiting enabled
- [ ] Heavy endpoints cached
- [ ] RPC endpoints segmented
- [ ] Bot protection enabled
- [ ] Logs sanitized
- [ ] Kill switches tested

---

**Security is layered, not optional.  
If one control fails, another must absorb the impact.**
