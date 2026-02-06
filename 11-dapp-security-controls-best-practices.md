# dApp Security Controls & Best Practices

This document defines **mandatory best practices and security checks** for Web3 dApps built with Node.js / React / Next.js and deployed on Vercel.  
Its goal is to **prevent DoS abuse, RPC exhaustion, data exposure, and cascading failures** observed in prior incidents.

---

## 1. Application-Level Best Practices

### 1.1 API & GraphQL Hardening
- Disable GraphQL introspection in production.
- Remove GraphQL playground endpoints from prod.
- Enforce **query complexity & depth limits**.
- Require authentication for schema access.
- Enforce payload size limits (fail fast).

### 1.2 Caching Strategy (Mandatory)
- Cache all heavy or repeated onchain reads.
- Never rely on frontend-only cache.
- Prefer server-side or middleware cache using **:contentReference[oaicite:2]{index=2}**.
- Set cache TTLs defensively (≥30s for expensive RPC calls).
- Protect cache from stampede (lock / dedupe).

### 1.3 RPC Usage Discipline
- Separate RPC endpoints:
  - Client-facing (per-IP rate limited).
  - Backend/middleware (strict global caps).
- Never expose shared high-limit RPCs to untrusted paths.
- Fail gracefully on RPC 429 / timeout.

Providers commonly used:
- **:contentReference[oaicite:3]{index=3}**
- **:contentReference[oaicite:4]{index=4}**
- **:contentReference[oaicite:5]{index=5}**

---

## 2. Rate Limiting & Abuse Controls

### 2.1 Edge / Middleware Controls
- Enforce rate limiting **before** serverless execution.
- Apply endpoint-specific limits (not global only).
- Use environment flags to enable/disable limits safely.
- Expect attackers to distribute across IPs.

### 2.2 DoS Reality Check
- Assume attackers can exceed Redis write limits.
- Rate limiting alone is insufficient at high scale.
- Protect concurrency, not only request count.

---

## 3. Vercel-Specific Security Controls (Required)

### 3.1 Vercel Firewall & Platform
- Enable Vercel Firewall rules for:
  - Path-based protection.
  - Method filtering (e.g. block GET on GraphQL POST-only).
- Monitor concurrent execution exhaustion.
- Enforce function timeout and memory ceilings.

### 3.2 Bot & L7 Protection
- Enable Vercel Bot Protection for public routes.
- Combine with challenge-based protection during attacks.
- Integrate external L7 defense when under active attack (e.g. **:contentReference[oaicite:6]{index=6}**).

---

## 4. Observability & Incident Readiness

### 4.1 Logging & Monitoring
- Centralize logs and alerts using **:contentReference[oaicite:7]{index=7}**.
- Never log secrets, private keys, or tokens.
- Assume logs are attacker-readable if misconfigured.
- Alert on:
  - Traffic spikes
  - RPC error rate
  - Cache miss storms
  - Concurrency saturation

### 4.2 Kill Switches
- Feature flags for:
  - Rate limiting
  - Expensive endpoints
  - Onchain-heavy features
- Ability to degrade service without full outage.

---

## 5. Architecture & Design Principles

- Avoid monolithic “do-everything” frontends.
- Treat dApps as **mission-critical Web2 systems**, not hobby apps.
- Assume adversarial traffic at all times.
- Design for blast-radius containment.

---

## 6. Final Checklist (Must Be Green)

- [ ] GraphQL introspection disabled in prod
- [ ] Playground removed
- [ ] Edge rate limiting enabled
- [ ] Heavy endpoints cached
- [ ] RPC endpoints segmented
- [ ] Bot protection enabled
- [ ] Logs sanitized
- [ ] Incident kill switches tested

---

**Security is layered, not optional.  
If one control fails, another must absorb the impact.**
