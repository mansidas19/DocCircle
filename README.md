# DocCircle

**Find doctors through people you trust.**

DocCircle is a doctor-discovery prototype with a peer-trust layer. Think "Zomato for doctors", but instead of relying only on anonymous star ratings it shows whether people from communities you belong to (alumni network, your company, friends, family) have visited a doctor and would recommend them.

> Prototype — demo data. All doctors, clinics and reviews are fictional. DocCircle provides community experience information, not medical advice.

## The core idea

```
Dermatology + Bangalore
        ↓
Peer Reviewed for You          ← doctors your circles have visited
        ↓
Dr. Meera Sharma
6 NIT Alumni visited · 5 recommend
2 Workplace visited · 2 recommend
        ↓
Anonymous detailed experiences + AI experience summary
```

**Anonymous publicly, verified privately.** Reviewers are never named. The platform verifies community membership privately and shows only the community label and aggregate counts.

## Features

- **Search** by specialty + city with two segments: *Peer Reviewed for You* (first) and *All Doctors*. The empty peer state keeps the product useful when a circle has no reviews yet.
- **Doctor profile**: provider info, peer-trust block with per-community breakdown, experience breakdown (communication, listening, fees, waiting), cached AI summary, anonymous detailed reviews.
- **Profile & circles** (`/profile`): private details (college, employer, work email) derive your communities; verify membership via email code, document review or invite code, or create your own peer group.
- **Ask My Circle** (`/circle`): a conversational concierge. Describe what you need in plain words; a server-side Claude call asks at most two clarifying questions, picks the specialty, reasons over what your circles actually wrote, and returns ranked recommendations with reasoning, anonymous evidence quotes and one-tap booking. Falls back to deterministic offline reasoning without an API key.
- **Book appointment**: pick a day and slot on any doctor profile; priority slots unlock after your first shared experience.
- **Profile gate**: search, doctor profiles and Ask My Circle require a completed profile, because every signal is personalised to your circles.
- **Share your experience**: a sub-60-second structured form plus optional written experience.
- **Fable moderation**: the written text is sent to a server-side API route which returns strict JSON (medical claims, personal info, abuse, promo and spam flags; per-dimension sentiment; experience themes; a safe public summary). Flagged reviews get friendly guidance instead of being published.
- **Demo fallback**: with no API key the same route returns deterministic mock moderation, clearly labelled, so the demo never breaks.

## Run it

```bash
npm install
cp .env.example .env.local   # optional: add FABLE_API_KEY for live moderation
npm run dev
```

Open http://localhost:3000.

### Environment

| Variable | Required | Notes |
|---|---|---|
| `FABLE_API_KEY` | No | Server-side only. Empty = demo mode with mock moderation. `ANTHROPIC_API_KEY` is also accepted. |
| `FABLE_MODEL` | No | Defaults to `claude-fable-5-1`; falls back to `claude-opus-5` if the key cannot access it. |

## Demo script (3 minutes)

1. **Problem** (landing page): Google has reviews, but not the answer to "has someone I trust been here?"
2. **Search** Dermatologist + Bangalore. Show *Peer Reviewed for You* above *All Doctors*.
3. **Profile** Dr. Meera Sharma: community counts, anonymous reviews highlighted for your circles, AI summary.
4. **Ask My Circle**: untick Workplace, tick Family, watch results change. Try Dentist + Bangalore for the empty state.
5. **Share experience**: submit a review. Try `"She prescribed X and cured my rash"` to see a medical-claim flag, then a clean review to see it land on the profile instantly.

## Structure

```
src/app
  page.tsx                       landing
  doctors/page.tsx               search results (two segments)
  doctors/[id]/page.tsx          doctor profile
  circle/page.tsx                Ask My Circle
  review/page.tsx                review submission
  api/moderate-review/route.ts   server-side Fable moderation
  api/concierge/route.ts         Ask My Circle concierge (structured output over community text)
  profile/page.tsx               two-step onboarding: details -> suggested circles
src/components                   UI
src/lib
  types.ts        data model (DB-ready shape)
  demo-data.ts    11 doctors, 4 communities, 43 reviews
  utils.ts        signal aggregation + segmentation
  moderation.ts   prompt, output schema, mock fallback
  circle-store.tsx client session state (private profile, memberships & verification, custom communities, submitted reviews)
```

Built with Next.js (App Router), TypeScript, Tailwind CSS, lucide-react and the Anthropic TypeScript SDK.
