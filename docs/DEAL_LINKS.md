# Deal Link Generation Strategy

## Objective
Create a secure, shareable link for deals that allows the Counterparty (Freelancer) to view and accept a deal without needing a prior account.

## Options Analysis

### Option 1: Sequential IDs (e.g., `app.com/deal/1`)
- **Pros:** Simple, maps directly to Smart Contract ID.
- **Cons:** Insecure (enumeration attacks). Competitors can scrape all dealings.
- **Verdict:** ❌ Rejected for public sharing.

### Option 2: UUID v4 (e.g., `app.com/deal/550e8400-e29b...`)
- **Pros:** Random, hard to guess.
- **Cons:** No direct mapping to Contract ID without a centralized database lookup.
- **Verdict:** ⚠️ Acceptable but requires DB state.

### Option 3: Hash-based (Stateless)
- **Format:** `app.com/deal/<CONTRACT_ID>?key=<HASH>`
- **Logic:**
  - Generate a random 32-byte secret on client.
  - Store `Hash(secret)` on-chain (or just keep secret off-chain if not validating on-chain).
  - Link contains `deal_id` and `secret`.
- **Pros:** Stateless, secure, decentralized.
- **Verdict:** ✅ Recommended for Web3 ethos.

## Implementation Plan (Stateless Wrapper)
Since we want a "Backend/Integration" layer but also decentralization:

1.  **Hybrid Approach**:
    - **Public Link:** `arbisecure.xyz/deal/<UUID>`
    - **Database Map:** `UUID` -> `Contract Deal ID`
    - **Reasoning:** User experience looks cleaner ("magic link"). Prevents ID scraping.

2.  **Database Schema (Supabase/Postgres)**:
    ```sql
    CREATE TABLE deals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      contract_deal_id NUMERIC NOT NULL, -- The Stylus ID
      created_at TIMESTAMP DEFAULT NOW()
    );
    ```

## Decision
**Use UUID v4 mapped to Contract IDs.**
- **Why:** Best UX, prevents scraping, allows attaching off-chain metadata (descriptions, file attachments) that shouldn't be on-chain.
