# Create Deal Page - UX/UI Breakdown

**Philosophy:** "Focus Mode". The creation process should feel like a premium, guided contract ceremony, not a boring form.
**Aesthetic:** Deep Glassmorphism (High blur, low opacity) + Neon Accents (`accent-blue`).
**Reference Vibe:** Linear.app, Raycast, meticulously designed Web3 dApps (e.g., Uniswap, Family.co).

---

## 1. Layout & Environment

*   **Background:** 
    *   Deep dark background (`#0a0a0a` / `var(--background-dark)`).
    *   **Ambient Glow:** A subtle, animated `accent-blue` gradient orb moving slowly behind the central card to create depth.
    *   **Noise Texture:** Low opacity noise overlay to prevent banding and add texture.
*   **Container:** 
    *   **The "Monolith":** A single, centrally aligned glass card (`max-w-2xl`).
    *   **Effect:** `backdrop-blur-2xl`, `bg-white/5`, `border border-white/10`, `shadow-2xl`.
    *   **Roundedness:** High curvature (`rounded-[2rem]`).

---

## 2. The Interaction Model (Progressive Disclosure)

Instead of a long scrolling form, we use a **Multi-Step Wizard** with smooth `AnimatePresence` transitions.
*   **Transitions:** Next steps slide in from the right, confirmed steps slide out to the left *and* fade into a "Progress Stack" at the top.
*   **Navigation:** "Back" button always visible. "Continue" button is disabled until validation passes (with a shake animation on invalid click).

---

## 3. Step-by-Step Breakdown

### Step 1: The "Scope" (Project Details)
*   **Goal:** Define what the deal is for.
*   **Input 1:** **Project Title** (e.g., "Smart Contract Audit"). 
    *   *Style:* Large typography (`text-3xl`), transparent background. Placeholder: "What are you building?"
*   **Input 2:** **Description** (Optional).
    *   *Style:* `font-mono`, `text-gray-400`. Expandable textarea.
*   **Micro-interaction:** Typing the title updates the page title metadata dynamically.

### Step 2: The "Value" (Amount & Token)
*   **Goal:** Set the financial terms.
*   **Visual:** The most prominent input on the page.
*   **Input:** **Amount**.
    *   *Style:* Massive font (`text-6xl` or `text-7xl`), `font-header`. 
    *   *Behavior:* Auto-formatting (commas).
    *   *Prefix:* "$" or "USDC" selector (styled as a pill).
*   **Context:** Show approximate USD value (if ETH) or "Gas Fees: <$0.01" hint below to reassure user.

### Step 3: The "Counterparty" (Client)
*   **Goal:** Identify who is funding.
*   **Input:** **Wallet Address / ENS**.
    *   *Style:* Standard size input but with a "Scanner" aesthetic.
*   **Validation:** 
    *   *Loading:* Spinner when resolving ENS.
    *   *Success:* If ENS found, show their Avatar (Blockie) and formatted name with a green checkmark.
    *   *Error:* "Invalid Arbitrum Address" red glow.

### Step 4: The "Pact" (Deadline & Review)
*   **Goal:** Final checks.
*   **Input:** **Deadline** (Date Picker).
    *   *Style:* Custom calendar popover, maintaining glass theme.
*   **Summary Card:** A "Receipt" looking mini-card showing:
    *   Title
    *   Amount
    *   Client
*   **Action:** "Generate Link" Button.
    *   *Style:* Full width, `bg-white`, `text-black` (High contrast).
    *   *Animation:* On click, button morphs into a loading spinner, then explodes into confetti/success state.

---

## 4. Component Design System (New Requirements)

*   **`GlassInput`**:
    *   Transparent background.
    *   Bottom border ONLY (`border-b border-white/20`).
    *   Focus state: Border turns `accent-blue`, glow effect.
    *   Floating label animation (moves from placeholder to top-left).

*   **`StepIndicator`**:
    *   Minimalist dots or thin line progress bar at the top of the card.
    *   Current step: `bg-accent-blue` glow.

*   **`NavigationButtons`**:
    *   Floating action bar at the bottom of the card.
    *   *Key Command:* Support `Cmd+Enter` to "Next".

---

## 5. Animation Spec (Framer Motion)

*   **Card Entrance:** `y: 20 -> 0`, `opacity: 0 -> 1` (Spring physics).
*   **Step Transition:**
    *   `exit: { x: -20, opacity: 0 }`
    *   `enter: { x: 20, opacity: 0 }`
    *   `animate: { x: 0, opacity: 1 }`
*   **Success State:**
    *   The form collapses.
    *   The "Deal Link" appears with a specific copy animation (Click -> "Copied!" tooltip).
