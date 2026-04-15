# Spec: Invitation-Only Open Letters

## Overview
Add a new letter type: **invitation-only** (€10 to publish). Letters are always publicly readable, but signing can be restricted via personal invitation links and/or email domain restrictions.

## Letter Types
- **Public** (free) — anyone can sign. Current behavior, unchanged.
- **Invitation-only** (€10) — signing restricted. Creator pays via Stripe Checkout to publish/activate invitations.

## User Flow

### Creating an invitation-only letter
1. Creator writes the letter on `/create` (same as today)
2. New toggle: "Public (free)" vs "Invitation only (€10)"
3. If invitation-only, additional fields appear:
   - **Restriction mode**: "Invite links only" or "Email domain restriction"
   - If invite links: **Invites per person** (number, e.g. 5) — how many people each invitee can invite
   - If invite links: **Allow chain invites** — toggle (off = flat/1 level, on = infinite depth)
   - If domain restriction: **Allowed domains** — comma-separated list (e.g. `university.edu, department.org`)
4. Letter is created as a **draft** (visible, readable, but signing disabled)
5. Creator is redirected to Stripe Checkout (€10) to pay
6. On successful payment (Stripe webhook or redirect), letter becomes **active** — invitations work, signing is enabled

### Inviting signers (invitation-only letters)
1. After payment, creator lands on a management page (`/{slug}/manage?token=xxx`)
2. Creator can:
   - Enter email addresses to invite (sends email with personal invite link)
   - Copy a personal invite link to share manually
   - See who has been invited, who has signed, who invited whom (web of trust tree)
3. Each invite link is unique: `/{slug}?invite=<token>`
4. When an invitee signs, they get their own invite links (up to the per-person limit)
5. Chain depth: if disabled, only creator's direct invitees can invite; if enabled, invitees of invitees can also invite, recursively

### Signing an invitation-only letter
1. Visitor arrives at `/{slug}` — can always **read** the letter and see signatures
2. If no valid `?invite=<token>` in URL:
   - Show message: "This letter is invitation-only. You need an invitation link to sign it."
3. If valid invite token:
   - Normal signing flow (email or passkey)
   - After signing, show their own invite links (if they have invite slots)
4. If domain restriction mode:
   - Email field is required (no passkey-only)
   - Email must match one of the allowed domains
   - No invite tokens needed — anyone with a matching email can sign

## Data Model

### Letters table — new columns
```sql
ALTER TABLE letters ADD COLUMN letter_type VARCHAR(16) DEFAULT 'public';     -- 'public' | 'invite_only'
ALTER TABLE letters ADD COLUMN restriction_mode VARCHAR(16) DEFAULT NULL;     -- 'invite' | 'domain' | NULL
ALTER TABLE letters ADD COLUMN allowed_domains TEXT DEFAULT NULL;             -- JSON array: ["university.edu","dept.org"]
ALTER TABLE letters ADD COLUMN invites_per_person INTEGER DEFAULT 5;         -- how many invites each person gets
ALTER TABLE letters ADD COLUMN allow_chain_invites BOOLEAN DEFAULT FALSE;    -- flat (false) vs infinite depth (true)
ALTER TABLE letters ADD COLUMN is_paid BOOLEAN DEFAULT FALSE;                -- payment completed?
ALTER TABLE letters ADD COLUMN stripe_session_id VARCHAR(255) DEFAULT NULL;  -- Stripe Checkout session ID
```

### New table: invitations
```sql
CREATE TABLE invitations (
  id SERIAL PRIMARY KEY,
  letter_id INTEGER NOT NULL REFERENCES letters(id),
  token VARCHAR(64) NOT NULL UNIQUE,          -- unique invite token
  email VARCHAR(255) DEFAULT NULL,            -- invited email (optional, for tracking)
  invited_by INTEGER DEFAULT NULL REFERENCES invitations(id),  -- parent invitation (NULL = creator)
  generation INTEGER DEFAULT 0,               -- 0 = creator, 1 = direct invitee, 2 = their invitee...
  invites_remaining INTEGER DEFAULT 5,        -- how many invites this person can still send
  signature_id INTEGER DEFAULT NULL REFERENCES signatures(id), -- linked signature once they sign
  used_at TIMESTAMP DEFAULT NULL,             -- when they signed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### New endpoints
- `POST /letters/:slug/invitations` — create invitation(s) (requires letter token auth)
  - Body: `{ token, emails: ["a@b.com"], invite_token: "xxx" }` (invite_token for chain invites)
  - Returns: array of invitation objects with invite URLs
- `GET /letters/:slug/invitations?token=xxx` — list all invitations for a letter (requires letter token)
- `GET /invitations/:invite_token` — validate an invite token, return letter info
- `POST /letters/:slug/checkout` — create Stripe Checkout session for €10
- `POST /webhooks/stripe` — handle Stripe payment webhooks

### Modified endpoints
- `POST /letters/:slug/:locale/sign` — check invitation validity before allowing signature
  - If letter_type='invite_only' and restriction_mode='invite': require valid invite_token in body
  - If letter_type='invite_only' and restriction_mode='domain': validate email domain
- `GET /letters/:slug` — include `letter_type`, `restriction_mode`, `is_paid` in response
- `POST /letters/create` — accept `letter_type` and related fields

## Frontend Pages

### Modified pages
- `/create` — add letter type selector + invite settings
- `/{slug}` — show invite-only messaging, gate signing form behind invite token
- `/{slug}/confirm_signature` — after confirming, show invite links if applicable

### New pages
- `/{slug}/manage?token=xxx` — invitation management dashboard (creator only)
- `/pricing` — new pricing page explaining Public vs Invitation-only

### Homepage redesign
- Hero: emphasize the two options (public free letter vs invitation-only)
- Value prop for invitation-only: "Stop AI bots. Ensure genuine signatures. Give more weight to your open letter."
- Social proof: stats (3,600+ letters, 490,000+ signatures)
- Clear CTA: "Create a Public Letter (free)" and "Create an Invitation-Only Letter (€10)"

## Stripe Integration
- New Stripe Payment Link or Checkout Session for €10
- On success: set `is_paid = true` on the letter
- Webhook endpoint to handle async payment confirmation
- Use existing Stripe setup (already have `stripe` npm package in frontend)

## i18n
- Add new translation keys for all new UI strings (en, fr, nl, de)
- Key examples: `create.type.public`, `create.type.invite_only`, `pricing.title`, `invite.message`, etc.
