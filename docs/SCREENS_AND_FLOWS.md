# PETINDER — Screens & User Flows

> Mobile-first. MVP ships as a responsive Next.js PWA; Phase 2 moves owner/provider apps to React Native (Expo). Admin stays web-only.

---

## 1. Screen Inventory

### 1.1 Owner App (mobile)

| # | Screen | Key elements | Route (MVP) |
|---|---|---|---|
| O1 | Splash / Onboarding carousel | Value props, location permission, signup/login CTA | `/welcome` |
| O2 | Signup / Login | Email+password, role choice hidden (owner default) | `/signup`, `/login` |
| O3 | Home (Feed) | Tabbed feed (Following / Discover), stories-style pet highlights, FAB to post | `/` |
| O4 | Post composer | Photo/video picker, pet tag, caption, visibility | `/posts/new` |
| O5 | Post detail | Media, likes, threaded comments, report | `/posts/[id]` |
| O6 | Pet profile (own) | Photos, breed, vaccination, temperament tags, premium badge, edit | `/pets/[id]` |
| O7 | Create/edit pet | Form + AI breed suggestion from first photo | `/pets/new` |
| O8 | Match (Playdate/Adoption) | Swipe deck, compatibility score, filters (distance, size, energy) | `/match` |
| O9 | Match success modal | "It's a match!" → open chat | overlay |
| O10 | Explore services | Map + list of nearby providers, category chips, search | `/services` |
| O11 | Provider detail | Bio, services, rating, reviews, verified/background-check badges, calendar | `/providers/[id]` |
| O12 | Booking checkout | Slot picker, pet selector, price + fees breakdown, pay | `/bookings/new` |
| O13 | Booking detail / live walk | Status timeline, **live GPS map**, chat shortcut, complete/review CTA | `/bookings/[id]` |
| O14 | Marketplace | Product grid, categories, search, cart icon | `/shop` |
| O15 | Product detail | Gallery, vendor, reviews, add to cart | `/shop/[id]` |
| O16 | Cart & checkout | Items by vendor, wallet credit toggle, Stripe payment sheet | `/cart` |
| O17 | Orders | Order list + tracking states | `/orders` |
| O18 | Chat inbox / thread | Conversations, typing indicator, attachments | `/messages` |
| O19 | Notifications | Grouped by kind, deep links | `/notifications` |
| O20 | Wallet | Balance, transaction ledger | `/wallet` |
| O21 | Profile & settings | Account, pets list, premium upsell, dispute center, logout | `/profile` |
| O22 | Leave review | Stars + text post-completion | modal |
| O23 | Dispute wizard | Reason → description → evidence upload → submit | `/disputes/new` |

### 1.2 Provider App (mobile)

| # | Screen | Key elements |
|---|---|---|
| P1 | Provider onboarding wizard | Business info → type (walker/sitter/vet/groomer/shop) → ID verification (Persona) → background check consent → Stripe Connect onboarding |
| P2 | Dashboard | Today's bookings, earnings snapshot, rating, verification status banner |
| P3 | Service catalog | CRUD services, pricing, duration, radius |
| P4 | Availability calendar | Week view, recurring slots, blackout dates |
| P5 | Booking requests | Accept/decline with countdown (auto-expire) |
| P6 | Active booking / walk mode | Check-in button, GPS auto-track, photo updates to owner, complete |
| P7 | Earnings & payouts | Pending vs paid, commission breakdown, payout schedule, Stripe dashboard link |
| P8 | Storefront (shop type) | Product CRUD, inventory, order fulfillment queue |
| P9 | Chat inbox | With AI suggested replies |
| P10 | Reviews & reputation | Rating trend, badges, respond to reviews |
| P11 | Subscription & growth | Tier upgrade (Free/Pro/Elite), featured listing purchase |
| P12 | Disputes | Respond with evidence |

### 1.3 Admin Dashboard (web)

| # | Screen | Key elements |
|---|---|---|
| A1 | Overview | GMV, take rate, bookings, fill rate (liquidity), DAU, dispute rate |
| A2 | Users & providers | Search, suspend/reinstate, role audit |
| A3 | Verification queue | Pending ID/background checks, vendor webhook results, pass/fail |
| A4 | Moderation queue | AI-flagged + reported posts/comments/reviews; approve/remove/warn/ban |
| A5 | Disputes console | Timeline, evidence (incl. GPS track replay), resolve refund/partial/provider |
| A6 | Payments ops | Payments, refunds, payout holds/releases |
| A7 | Marketplace ops | Vendor approvals, category & commission config (10–25%) |
| A8 | Audit log explorer | Filter by actor/action/target |

---

## 2. User Flows

### 2.1 Onboarding (owner)

```mermaid
flowchart TD
    A[Open app] --> B[Onboarding carousel]
    B --> C{Account?}
    C -- no --> D[Signup: email, password, name]
    C -- yes --> E[Login]
    D --> F[JWT set in httpOnly cookie]
    E --> F
    F --> G[Location permission]
    G --> H{Has pet?}
    H -- yes --> I[Create first pet profile]
    H -- later --> J[Home feed]
    I --> J
```

### 2.2 Create Pet Profile

```mermaid
sequenceDiagram
    actor O as Owner
    participant App
    participant API as /api/pets
    participant S3
    participant AI as AI breed ID

    O->>App: New pet → upload photo
    App->>API: POST /pets/:id/photos/presign
    API-->>App: presigned URLs
    App->>S3: PUT photo
    App->>AI: POST /ai/breed-identify {imageKey}
    AI-->>App: breeds + confidence
    App-->>O: suggest breed, prefill form
    O->>App: confirm details, temperament tags
    App->>API: POST /pets
    API-->>App: 201 pet (embedding computed async for matching)
```

### 2.3 Post to Feed

```mermaid
sequenceDiagram
    actor O as Owner
    participant API
    participant MOD as AI moderation
    participant FEED as Feed fan-out

    O->>API: POST /posts {media, body, petId}
    API->>MOD: moderate(media, text)
    alt flagged
        MOD-->>API: flag
        API-->>O: 422 CONTENT_FLAGGED (or queued for human review)
    else approved
        MOD-->>API: approve
        API->>FEED: fan-out to follower feeds (Redis)
        API-->>O: 201 post live
    end
```

### 2.4 Playdate Match

```mermaid
sequenceDiagram
    actor A as Owner A
    participant API
    participant VDB as Vector DB
    actor B as Owner B

    A->>API: GET /matches/candidates?petId&kind=playdate
    API->>VDB: kNN(pet embedding) + geo/size/energy filters
    VDB-->>API: ranked candidates
    API-->>A: swipe deck with scores
    A->>API: POST /matches/swipe {action: like}
    Note over API: B liked A's pet earlier
    API-->>A: matched: true + conversation created
    API-->>B: WS notification.new "It's a match!"
    A->>B: chat → arrange playdate
```

### 2.5 Book a Dog Walker (GPS tracking, completion, review)

```mermaid
sequenceDiagram
    actor O as Owner
    participant API
    participant ST as Stripe
    actor W as Walker
    participant WS as Realtime (Pusher)

    O->>API: POST /bookings {serviceId, petId, slot}
    API->>ST: PaymentIntent (manual capture, app fee 18%)
    API-->>O: booking requested + client secret
    O->>ST: confirm card (authorize only)
    API-->>W: push "New booking request"
    W->>API: POST /bookings/:id/accept
    API->>ST: capture payment
    API-->>O: status: paid

    W->>API: POST /bookings/:id/check-in {lat,lng}
    API-->>O: status: in_progress
    loop every 5–10s during walk
        W->>WS: gps.ping → private-booking-{id}-gps
        WS-->>O: live route on map
    end
    W->>API: POST /bookings/:id/complete {photos, summary}
    API-->>O: completed + photo report
    Note over API: escrow timer → funds to walker's pending payout
    O->>API: POST /reviews {bookingId, rating, body}
    API-->>W: rating updated
```

### 2.6 Marketplace Checkout (Stripe commission split)

```mermaid
sequenceDiagram
    actor O as Owner
    participant API
    participant INV as Inventory
    participant ST as Stripe Connect

    O->>API: POST /orders (from cart)
    API->>INV: reserve stock (15-min TTL)
    API->>ST: PaymentIntent, destination charges per vendor,<br/>application_fee = commission (e.g. 15%)
    API-->>O: client secret
    O->>ST: pay
    ST->>API: webhook payment_intent.succeeded
    API->>INV: commit stock
    API-->>O: order paid
    Note over ST: net amount lands in vendor's<br/>Connect balance; platform keeps fee
    API-->>O: vendor fulfills → fulfilled → delivered → review prompt
```

### 2.7 Provider Accepts Booking & Gets Paid Out

```mermaid
flowchart TD
    A[Booking request push] --> B{Accept within 4h?}
    B -- no --> C[Auto-expire, auth released, owner rebooks]
    B -- decline --> C
    B -- accept --> D[Payment captured]
    D --> E[Perform service + complete]
    E --> F[48h escrow window<br/>no dispute opened]
    F --> G[Funds released to Connect balance<br/>minus 10–25% commission]
    G --> H{Payout schedule}
    H -- standard --> I[Weekly Stripe payout to bank]
    H -- instant, Elite tier --> J[Instant payout, small fee]
    F -. dispute opened .-> K[Payout HELD until resolution]
```

### 2.8 Dispute Flow

```mermaid
flowchart TD
    A[Owner or provider opens dispute<br/>within 14 days] --> B[Payout auto-held<br/>conversation + dispute thread created]
    B --> C[Both parties submit evidence<br/>photos, chat logs, GPS track]
    C --> D{Auto-resolvable?<br/>e.g. no GPS check-in = no-show}
    D -- yes --> E[Automatic refund]
    D -- no --> F[Admin review in console<br/>GPS replay + evidence]
    F --> G{Decision}
    G -- full refund --> H[Stripe refund, payout cancelled]
    G -- partial --> I[Partial refund, rest paid out]
    G -- provider favored --> J[Payout released]
    H & I & J --> K[Both parties notified<br/>audit_log written<br/>repeat offenders flagged to T&S]
```

### 2.9 Admin Moderation

```mermaid
flowchart TD
    A[Content created] --> B[AI moderation pass]
    B -- approve --> C[Published]
    B -- flag --> Q[Moderation queue]
    C -- user report --> Q
    Q --> D[Admin reviews item + context]
    D --> E{Action}
    E -- approve --> C
    E -- remove --> F[Content removed, author notified]
    E -- warn --> G[Strike recorded on user]
    E -- ban --> H[User suspended<br/>active bookings cancelled + refunded]
    F & G & H --> I[audit_log entry]
    G --> J{3 strikes?} -- yes --> H
```

---

## 3. Navigation Model (MVP PWA)

- **Owner bottom tabs:** Feed · Match · Services · Shop · Profile (chat + notifications in header).
- **Provider bottom tabs:** Dashboard · Bookings · Calendar · Earnings · Profile.
- **Admin:** left-nav web layout (Overview, Users, Verifications, Moderation, Disputes, Payments, Marketplace, Audit).
- Role is read from the JWT; `middleware.ts` redirects `/admin/*` for non-admins and provider routes for non-providers.
