# PETINDER — API Reference

> Base URL: `/api` (Next.js App Router route handlers). All responses JSON.
> **Auth:** JWT in httpOnly cookie `petinder_token`, set by `/api/auth/login`. `middleware.ts` verifies the token and enforces role. Roles: `owner`, `provider`, `admin`. "Any" = any authenticated user.
> **Conventions:** money in integer minor units; pagination via `?cursor=&limit=` (default 20, max 100); mutations on money/bookings accept an `Idempotency-Key` header.

### Common error envelope
```json
{ "error": { "code": "BOOKING_NOT_FOUND", "message": "..." } }
```

| HTTP | Meaning |
|---|---|
| 400 | Validation error (`VALIDATION_ERROR`, field details in `error.fields`) |
| 401 | Missing/expired token (`UNAUTHENTICATED`) |
| 403 | Wrong role or not resource owner (`FORBIDDEN`) |
| 404 | Resource not found |
| 409 | State conflict (double-book, already liked, stock) |
| 422 | Domain rule violation (e.g. unverified provider) |
| 429 | Rate limited |

---

## 1. Auth

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/auth/signup` | public | `{ email, password, name, role: "owner"\|"provider" }` | `201 { user }` + cookie. Errors: 409 `EMAIL_TAKEN` |
| POST | `/auth/login` | public | `{ email, password }` | `200 { user }` + cookie. 401 `INVALID_CREDENTIALS` |
| POST | `/auth/logout` | any | — | `204`, cookie cleared |
| GET | `/auth/me` | any | — | `200 { user, providerProfile? }` |
| POST | `/auth/refresh` | any (refresh cookie) | — | `200`, rotated tokens |
| POST | `/auth/forgot-password` | public | `{ email }` | `202` (always, no enumeration) |

## 2. Pets

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/pets` | any | — | `200 { pets[] }` (own pets) |
| POST | `/pets` | owner | `{ name, species, breed?, sex?, birthDate?, size?, energyLevel?, temperamentTags?, photos[] }` | `201 { pet }`; AI breed suggestion in `pet.suggestedBreed` |
| GET | `/pets/:id` | any | — | `200 { pet }` (public profile) |
| PATCH | `/pets/:id` | owner (own) | partial pet | `200 { pet }`. 403 if not owner |
| DELETE | `/pets/:id` | owner (own) | — | `204` (soft delete). 409 if active booking |
| POST | `/pets/:id/photos/presign` | owner (own) | `{ contentType, count }` | `200 { uploads: [{ url, key }] }` S3 presigned |

## 3. Feed (Social)

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/feed` | any | `?tab=following\|discover&cursor=` | `200 { posts[], nextCursor }` ranked |
| POST | `/posts` | any | `{ body, petId?, media[], visibility }` | `201 { post }` (`moderation_status=pending`, AI-screened async). 422 `CONTENT_FLAGGED` |
| GET | `/posts/:id` | any | — | `200 { post, comments[] }` |
| DELETE | `/posts/:id` | author/admin | — | `204` |
| POST | `/posts/:id/like` | any | — | `201`. 409 `ALREADY_LIKED` |
| DELETE | `/posts/:id/like` | any | — | `204` |
| POST | `/posts/:id/comments` | any | `{ body, parentId? }` | `201 { comment }` |
| POST | `/users/:id/follow` | any | — | `201`. 409 if already following |
| DELETE | `/users/:id/follow` | any | — | `204` |
| POST | `/posts/:id/report` | any | `{ reason }` | `202` → moderation queue |

## 4. Matching (Playdate & Adoption)

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/matches/candidates` | owner | `?petId=&kind=playdate\|adoption&radiusKm=` | `200 { candidates: [{ pet, score, distanceKm }] }` (vector + geo ranked) |
| POST | `/matches/swipe` | owner | `{ petId, targetPetId, kind, action: "like"\|"pass" }` | `200 { matched: bool, match? }`. Mutual like → `matched: true`, conversation auto-created |
| GET | `/matches` | owner | `?status=matched` | `200 { matches[] }` |
| POST | `/matches/:id/adoption-application` | owner | `{ answers, homeInfo }` | `201 { application }` → shelter review. 422 if pet not adoptable |
| DELETE | `/matches/:id` | participant | — | `204` (unmatch) |

## 5. Services & Bookings

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/services` | any | `?category=walk&lat=&lng=&radiusKm=&date=` | `200 { services: [{ service, provider, rating, distanceKm }] }` |
| POST | `/services` | provider (verified) | `{ category, title, description, priceAmount, durationMin }` | `201 { service }`. 422 `PROVIDER_UNVERIFIED` |
| PATCH | `/services/:id` | provider (own) | partial | `200 { service }` |
| GET | `/services/:id/availability` | any | `?from=&to=` | `200 { slots[] }` |
| PUT | `/services/:id/availability` | provider (own) | `{ slots: [{ startsAt, endsAt, recurrenceRule? }] }` | `200 { slots[] }`. 409 on overlap |
| POST | `/bookings` | owner | `{ serviceId, petId, slotId?, startsAt, notes? }` | `201 { booking, paymentIntentClientSecret }` (status `requested`; funds authorized, captured on accept). 409 `SLOT_TAKEN` |
| GET | `/bookings` | owner/provider | `?role=&status=` | `200 { bookings[] }` |
| GET | `/bookings/:id` | participant/admin | — | `200 { booking, events[] }` |
| POST | `/bookings/:id/accept` | provider | — | `200 { booking }` (captures payment → `paid`). 409 bad state |
| POST | `/bookings/:id/decline` | provider | `{ reason? }` | `200` (auth released) |
| POST | `/bookings/:id/cancel` | owner/provider | `{ reason }` | `200 { refundAmount }` per cancellation policy |
| POST | `/bookings/:id/check-in` | provider | `{ lat, lng }` | `200` → `in_progress`, starts GPS session |
| POST | `/bookings/:id/gps` | provider | `{ pings: [{ lat, lng, ts }] }` | `202` (batched; also via WS) |
| POST | `/bookings/:id/complete` | provider | `{ summary?, photos[] }` | `200 { booking }` → `completed`; triggers escrow release timer + review prompt |

## 6. Marketplace: Cart, Orders, Payments

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/products` | any | `?q=&category=&vendorId=&sort=` | `200 { products[], facets }` |
| GET | `/products/:id` | any | — | `200 { product, vendor, reviews }` |
| POST | `/products` | provider (vendor) | product fields | `201 { product }` |
| GET | `/cart` | owner | — | `200 { items[], totals }` |
| POST | `/cart/items` | owner | `{ productId, quantity }` | `200 { cart }`. 409 `OUT_OF_STOCK` |
| PATCH | `/cart/items/:id` | owner | `{ quantity }` | `200 { cart }` |
| POST | `/orders` | owner | `{ shippingAddress, walletCredit? }` | `201 { order, paymentIntentClientSecret }` — inventory reserved 15 min |
| GET | `/orders` / `/orders/:id` | owner/vendor/admin | — | `200 { order(s) }` (vendors see own items only) |
| POST | `/orders/:id/fulfill` | provider (vendor) | `{ trackingNumber? }` | `200` → `fulfilled` |
| POST | `/payments/webhook` | Stripe signature | Stripe event | `200`. Handles `payment_intent.succeeded` (commission split via application fee), `charge.refunded`, `account.updated`, `transfer.failed` |
| GET | `/wallet` | any | — | `200 { balance, transactions[] }` |
| GET | `/payouts` | provider | — | `200 { payouts[], pendingBalance, nextPayoutAt }` |

## 7. Chat

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/conversations` | any | — | `200 { conversations[] }` sorted by `lastMessageAt` |
| POST | `/conversations` | any | `{ participantId, bookingId?\|orderId? }` | `201 { conversation }` (idempotent for dm pair) |
| GET | `/conversations/:id/messages` | participant | `?cursor=` | `200 { messages[], nextCursor }` |
| POST | `/conversations/:id/messages` | participant | `{ body, attachments? }` | `201 { message }` + WS broadcast + push if offline |
| POST | `/conversations/:id/read` | participant | `{ lastMessageId }` | `204` |

## 8. Reviews

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/reviews` | owner | `{ bookingId\|orderItemId, rating: 1–5, body }` | `201 { review }`. 409 `ALREADY_REVIEWED`, 422 if booking not completed |
| GET | `/providers/:id/reviews` | any | `?cursor=` | `200 { reviews[], summary: { avg, count, histogram } }` |
| GET | `/products/:id/reviews` | any | — | same shape |

## 9. Trust & Safety

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/verifications/id` | provider | `{ }` | `201 { vendorSessionUrl }` (Persona hosted flow) |
| POST | `/verifications/background-check` | provider | consent fields | `201 { status: "pending" }` (Checkr) |
| POST | `/verifications/webhook` | vendor signature | vendor event | `200` — updates `verification_status` |
| POST | `/disputes` | owner/provider | `{ bookingId\|orderId, reason, description, evidence[] }` | `201 { dispute }`; payout auto-held. 422 outside dispute window (14 days) |
| GET | `/disputes/:id` | party/admin | — | `200 { dispute, timeline }` |
| POST | `/disputes/:id/evidence` | party | `{ text?, files[] }` | `201` |
| POST | `/reports` | any | `{ targetType: post\|user\|review, targetId, reason }` | `202` |

## 10. Admin (role: admin)

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/admin/users` | `?q=&role=&status=` | `200 { users[] }` |
| POST | `/admin/users/:id/suspend` | `{ reason }` | `200` (+ audit log) |
| GET | `/admin/verifications` | `?status=pending` | `200 { queue[] }` |
| POST | `/admin/verifications/:id/decide` | `{ decision: pass\|fail, note }` | `200` |
| GET | `/admin/moderation` | `?status=flagged` | `200 { items[] }` (posts/comments/reviews) |
| POST | `/admin/moderation/:id/decide` | `{ action: approve\|remove\|warn\|ban }` | `200` |
| GET | `/admin/disputes` | `?status=open` | `200 { disputes[] }` |
| POST | `/admin/disputes/:id/resolve` | `{ outcome: refund\|partial\|provider, amount? }` | `200` — triggers Stripe refund / payout release |
| POST | `/admin/payouts/:id/hold` | `{ reason }` | `200` |
| GET | `/admin/metrics` | `?from=&to=` | `200 { gmv, takeRate, bookings, fillRate, dau }` |
| PATCH | `/admin/config/commissions` | `{ category, rate }` | `200` (rate clamped 0.10–0.25) |

## 11. AI

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/ai/breed-identify` | any | `{ imageKey }` | `200 { breeds: [{ name, confidence }] }` |
| POST | `/ai/moderate` | internal/system | `{ contentType, mediaKeys?, text? }` | `200 { verdict: approve\|flag, labels[] }` |
| GET | `/ai/match-score` | owner | `?petId=&targetPetId=` | `200 { score, factors[] }` |
| POST | `/ai/chat-suggest` | provider | `{ conversationId }` | `200 { suggestions: string[] }` |
| POST | `/ai/vet-triage` | owner | `{ petId, symptoms }` | `200 { guidance, urgency, disclaimer }` — never diagnoses; urgent cases deep-link to vet booking |

---

## 12. WebSocket Channels (Pusher/Socket.io)

Auth: channel auth endpoint `POST /api/realtime/auth` validates the JWT cookie before private-channel subscription.

| Channel | Subscribers | Events |
|---|---|---|
| `private-user-{userId}` | the user | `notification.new`, `booking.status`, `order.status`, `payout.paid` |
| `private-conversation-{id}` | participants | `message.new`, `message.read`, `typing` |
| `private-booking-{id}-gps` | owner + provider | `gps.ping { lat, lng, ts }`, `gps.started`, `gps.ended` — live walk tracking |
| `presence-admin-moderation` | admins | `queue.item.new` |

GPS pings are published by the provider app every 5–10 s during `in_progress` walk bookings; the server fans out to the owner channel and buffers pings in Redis (flushed to `bookings.gps_track` on completion).
