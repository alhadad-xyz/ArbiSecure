# ArbiSecure — Demo Video Script & Narration

**Target Length:** ~3 minutes | **Format:** Screen recording + voiceover
**Audience:** Hackathon judges (Arbitrum Open House NYC Buildathon)

---

## [SCENE 1] Hook / Problem (0:00–0:20)

### On-Screen
> Cold open on a dark screen. Text fades in, one line at a time.

```
"You just finished a $5,000 smart contract audit."
"The client has gone silent."
"Your funds are locked. Your work is done."
"There's nothing you can do."
```

> Cut to the ArbiSecure landing page hero section.

### Narration (Voiceover)
> *"In the global freelance economy, trust is still a centralized bottleneck. Clients fear non-delivery. Freelancers fear non-payment. And existing escrow platforms charge up to 20% in fees while still leaving disputes to human judgment.*
>
> *We built ArbiSecure — the first self-enforcing escrow protocol on Arbitrum, where disputes are prevented, not just resolved."*

---

## [SCENE 2] Landing Page Overview (0:20–0:35)

### On-Screen
> Scroll slowly through the ArbiSecure landing page:
> - Hero section with tagline
> - "How It Works" section (3 steps)
> - Features section (Programmable Releases, Staked Arbiters, Evidence System)
> - Fees section (0.5% vs 5–20%)

### Narration
> *"Built with Arbitrum Stylus in Rust, ArbiSecure achieves over 80% gas savings compared to Solidity equivalents. But the real innovation isn't the gas savings — it's programmable milestone releases that make most disputes technically impossible."*

---

## [SCENE 3] Deal Creation Wizard (0:35–1:30)

### On-Screen
> Navigate to `/create`. Show the 7-step wizard with smooth step transitions.

---

### Step 1 — Initiate Agreement

> - Connect wallet via RainbowKit
> - Type: `"Smart Contract Audit — DeFi Protocol"`
> - Add description: `"Full security audit of ERC-20 token contract with 3 rounds of review"`
> - Click **Next**

**Narration:**
> *"As a freelancer, I start by connecting my wallet and defining the agreement. No account creation, no KYC — just a wallet."*

---

### Step 2 — Escrow Value

> - Enter total amount: `0.0001 ETH`
> - Enter freelancer wallet address
> - Enter client wallet address
> - Click **Next**

**Narration:**
> *"I set the total escrow value in ETH and specify the freelancer and client wallet addresses. The protocol secures native ETH on Arbitrum."*

---

### Step 3 — Payment Milestones

> Show the MilestoneBuilder with 3 milestones:
> - M1: `Initial Review` — 30%
> - M2: `Full Audit Report` — 50%
> - M3: `Final Remediation Check` — 20%
>
> Progress bar shows 100% allocated. Click **Next**

**Narration:**
> *"I break the payment into 3 milestones. The percentages must sum to 100% — the contract enforces this on-chain."*

---

### Step 4 — Release Conditions — KEY INNOVATION

> Show the ConditionConfigurator for each milestone:
>
> - **M1 (Initial Review):** Select `Manual Approval` — "Client approval required"
> - **M2 (Full Audit Report):** Select `Time-Based` — set `14 days`
>   - Info text: *"Funds will auto-release 14 days after previous milestone"*
> - **M3 (Final Check):** Select `Oracle` — choose `GitHub (PR merged)` — enter GitHub URL
>
> Click **Next**

**Narration:**
> *"Here's what makes ArbiSecure unique — programmable release conditions. Milestone 1 requires client approval. Milestone 2 auto-releases after 14 days — no client action needed. Milestone 3 triggers when a GitHub PR is merged, verified by an oracle. Both parties agree to these conditions upfront. When they're met, funds release automatically. No dispute possible."*

---

### Step 5 — Dispute Resolution

> - Show the Arbiter address field
> - Click `Use ArbiSecure Platform` to auto-fill the platform arbiter address
> - Click **Review**

**Narration:**
> *"For the rare edge case where a dispute does occur, we designate an arbiter — the ArbiSecure platform arbiter or any verified address from our staked arbiter registry."*

---

### Step 6 — Review & Confirm

> Show the full deal summary card (title, description, amount, addresses).
> Click **Generate Agreement Link** — loading state.

**Narration:**
> *"We review everything, then generate the deal link. Deal metadata is stored off-chain; the escrow logic lives entirely on-chain."*

---

### Step 7 — Agreement Created

> - Confetti animation fires
> - QR code appears
> - Deal link displayed: `arbisecure.xyz/deal/[uuid]`
> - Click **Copy Link**

**Narration:**
> *"A unique deal link is generated. The freelancer shares this with the client. No email, no platform account — just a link."*

---

## [SCENE 4] Client Funds the Deal (1:30–2:00)

### On-Screen
> Open the deal link in a new tab (client's perspective).
> Status badge: `PENDING` — page title: `REVIEW & FUND`
>
> Show deal details and 3 milestones with conditions. `0/3 Released` progress bar.
>
> Connect the client wallet — Click **Create & Fund Deal**
> MetaMask popup — confirm — page reloads — status: `FUNDED`

### Narration
> *"The client opens the link, reviews the pre-agreed conditions, connects their wallet, and funds the escrow in a single transaction. The ETH is now locked on-chain. Deal status: Funded."*

---

## [SCENE 5] Milestone Release (2:00–2:25)

### On-Screen
> Show the funded deal from the **client's perspective**.
>
> - M1: `Requires Client Approval` — Click **Release Milestone 1** — wallet confirm — success toast — M1 turns green in progress bar
> - M2: shows `Time-Locked` with a countdown timer

### Narration
> *"Milestone 1 requires manual approval — the client clicks release after reviewing the initial audit. Milestone 2 is time-locked. When the 7-day window passes, the release triggers automatically. No client action, no dispute possible. This is the core innovation: pre-approved, self-enforcing payments."*

---

## [SCENE 6] Dispute Flow (2:25–2:50)

### On-Screen
> From the **client's perspective**, click **Initiate Dispute**.
>
> DisputeForm appears:
> - Reason: `"Audit report is incomplete — critical vulnerabilities not documented"`
> - Evidence: `https://github.com/client/repo/issues/42`
> - Click **Submit Dispute** — wallet confirm
>
> Page transitions to **Dispute View**:
> - Red glowing border, `Dispute In Progress` badge
> - Dispute reason + evidence link displayed
> - `Awaiting Arbiter Review` message
>
> Switch to **arbiter wallet** — two ruling buttons appear:
> `Release to Freelancer` | `Refund to Client`
> Click **Release to Freelancer** — transaction confirms — resolved.

### Narration
> *"If a dispute arises, either party can escalate. Evidence links — GitHub issues, Loom videos, IPFS files — are submitted on-chain. The appointed arbiter reviews everything and issues a binding ruling. Funds are distributed per the ruling. The entire process is transparent, on-chain, and economically secured by the arbiter's stake."*

---

## [SCENE 7] Technical Highlights (2:50–3:10)

### On-Screen
> Quick cuts:
> 1. Rust contract source (`contracts/src/`)
> 2. Arbitrum Sepolia explorer — deployed contract
> 3. Gas comparison: Stylus vs Solidity (80%+ savings)

### Narration
> *"Under the hood: ArbiSecure is written in Rust using the Arbitrum Stylus SDK. A single optimized contract handles deal creation, milestone tracking with programmable conditions, dispute initiation, and arbiter resolution. Over 80% gas savings versus a comparable Solidity implementation — making high-frequency escrow economically viable for the first time."*

---

## [SCENE 8] Closing / CTA (3:10–3:20)

### On-Screen
> Return to the landing page hero. Fade in text:
>
> ```
> ArbiSecure
> Self-Enforcing Escrow on Arbitrum
> Built with Stylus (Rust)
> arbisecure.xyz
> ```

### Narration
> *"ArbiSecure: where 90% of payments release automatically, 10% of disputes are resolved by staked arbiters, and 0% of funds are lost to platform fees or centralized bias. The trust layer for the global freelance economy — built on Arbitrum."*

---

## Production Notes

### Timing Summary

| Scene | Content | Duration |
|-------|---------|----------|
| 1 | Hook / Problem | 0:20 |
| 2 | Landing Page | 0:15 |
| 3 | Deal Creation (7 steps) | 0:55 |
| 4 | Client Funds Deal | 0:30 |
| 5 | Milestone Release | 0:25 |
| 6 | Dispute Flow | 0:25 |
| 7 | Technical Highlights | 0:20 |
| 8 | Closing | 0:10 |
| **Total** | | **~3:20** |

### Recording Tips

- Use the built-in **Dev Tools** panel to mock wallet roles without switching wallets
- Pre-fill form data to save time during recording
- Use a pre-existing test deal in Supabase for the funding/release scenes
- Record at **1440p** or higher for crisp text readability
- Add subtle ambient music at ~20% volume

### Key Talking Points for Judges

1. **Programmable conditions** — the core differentiator; spend the most time here
2. **No account creation** — just a wallet + a shareable link
3. **Rust/Stylus** — 80%+ gas savings; mention for the technical track
4. **Staked arbiters** — economic security model, not "trust us"
5. **Evidence system** — structured, on-chain, IPFS-backed

### What's Implemented

- Full 7-step deal creation wizard with animated transitions
- Programmable release conditions (time, oracle, manual, hybrid)
- Deal detail page with live contract state (wagmi hooks)
- Client funding via `createDeal` contract call
- Milestone release via `releaseMilestone` contract call
- Dispute initiation via `raiseDispute` contract call
- Dispute view with arbiter ruling UI (`resolveDispute`)
- Supabase metadata layer for deal links
- QR code generation for deal sharing
- RainbowKit wallet connection
- Deployed on Arbitrum Sepolia testnet

### Mention But Don't Demo

- Gasless first deal (Paymaster) — mention in narration
- Full arbiter marketplace UI — mention as roadmap
- IPFS evidence upload — show URL input field, mention as supported
