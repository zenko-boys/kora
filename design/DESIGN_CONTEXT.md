# Kora — Design Context (Mobile Auth & Onboarding)

This documents the design work done on the mobile splash/login/account-creation flow, so the desktop version can stay consistent. Everything here was built as a click-through prototype — no backend wired, no real Firebase/Clerk calls, just the UI and interaction design.

**Live prototype:** https://claude.ai/code/artifact/50d67cdb-4051-4f06-bc1f-3aeabdb8d5ef
**Prototype source:** see chat history in this repo's Claude session, or ask Danilo for the exported HTML.

---

## 1. Brand foundations

### Color tokens

| Token | Hex | Use |
|---|---|---|
| `--charcoal` | `#151A1F` | Primary dark ground, ink on light surfaces |
| `--charcoal-deep` | `#0B0D10` | Deepest shadow/ground tone, primary-button text on lime |
| `--stone` | `#F5F6F4` | Primary light ground, text on dark surfaces |
| `--stone-dim` | `#E3E5E0` | Borders/dividers on light surfaces |
| `--deep-green` | `#0FA35A` | Secondary accent, links on light surfaces |
| `--lime-green` | `#A7F15B` | Gradient partner to neon-lime, links on dark surfaces |
| `--neon-lime` | `#C7FF3A` | Primary accent — CTAs, focus rings, active/selected states |
| `--error` | `#FF6B57` | Semantic error only — invalid fields, never used as a brand accent |

Neutrals were picked, not defaulted: charcoal and stone both carry a faint warm/green bias rather than being pure black/white — check the hex values above rather than substituting generic grays.

### Typography

- **Display** (wordmark, headlines, buttons): `'Futura', 'Avenir Next', 'Century Gothic', ui-sans-serif, sans-serif` — geometric, sporty, used bold/heavy.
- **Body/UI** (form fields, labels, running text): system stack — `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`. Legibility over personality for anything users type into.

### Logo assets

Source files are in `design/` (originals, JPEG, white background). Processed, transparent-background versions used in the actual UI are in `design/processed/`:

- `logo-light-text.png` / `logo-dark-text.png` — full "Kora" wordmark, transparent background, white-ink or charcoal-ink text respectively (pick based on what's behind it).
- `logo-light-hero.png` — cropped/resized white-text wordmark used large on the splash screen.
- `icon-mark-light-96.png` / `icon-mark-light-64.png` — the circular mark alone (no wordmark), white-dot version for dark surfaces, cropped out of the wordmark's own "o" glyph.

**Important processing note:** the original JPEGs have a white background that isn't transparent. Do **not** just drop them onto a dark background — you'll get a visible white box/halo. They were keyed to transparent via alpha-matting with edge-color decontamination (naive threshold-based transparency leaves a white fringe on anti-aliased edges from JPEG compression — decontamination recovers the true edge color so it composites cleanly on any background). If you need a new size/crop, redo this properly rather than just using CSS masking on the raw JPEGs. Ask Danilo for the processing script if needed.

There's also `design/icon.jpeg` (mark on a white card) and `design/icon2.jpeg` (mark on a dark card) — these are **app-icon-style tiles**, not general-purpose transparent assets. `icon.jpeg` specifically has a soft drop-shadow baked into its background that does *not* key out cleanly to transparent (leaves a ghost square) — don't try to matte that one, it was tested and rejected.

### Visual world: "night court"

The auth/onboarding flow is deliberately **brand-locked to a dark theme** — charcoal gradient background regardless of the viewer's OS light/dark setting. This was an intentional choice (real app splash/auth screens are usually brand-consistent, not theme-adaptive), not an oversight. If desktop follows the same auth flow, it should probably carry the same dark treatment through login/signup rather than adapting to OS theme.

---

## 2. Screens built (in flow order)

1. **Splash** — logo (hero size, white-text version) centered, tagline "Book courts. Find your four.", two buttons: **Log In** (solid neon-lime, primary) and **Create Account** (ghost/outline). Fine print legal line at the bottom.

2. **Login** — email + password form, "Forgot password?" (not wired), Apple/Google social buttons above a divider, footer link to Create Account. Icon mark sits top-right in the header bar, clear of the phone's camera notch.

3. **Create Account** — same template as Login. Apple/Google buttons (instant path, see flow below) plus a phone-number field + "Send code" (OTP path).

4. **Verify Code** — 6-digit segmented OTP input (auto-advance, backspace-to-previous, paste-to-fill-all supported), "Resend code" with a 30s disabled cooldown, "Edit" link back to Create Account to fix a mistyped number.

5. **Set up your game** — the single convergence point for both signup paths (see below). Fields: Name, Email, Phone (optional), Skill level (slider), Home club (multi-select).

All four post-splash screens share one template (`.screen--login` class): dark ground, back button top-left, icon mark top-right, greeting headline, then form content.

---

## 3. Account-creation flow logic

Two entry paths converge on one profile-completion screen:

```
Phone   → enter number → Verify code (OTP) ─┐
Apple   → instant OAuth ────────────────────┼─→ Set up your game → into the app
Google  → instant OAuth ────────────────────┘
```

- **Why converge:** avoids duplicating "collect the missing profile info" logic per method. Whichever door they came through, they land on the same screen, which just adapts what's pre-filled.
- **Pre-fill, don't hide:** fields known from the auth method (name/email from Google/Apple) are pre-filled but stay **editable**, not locked/hidden. Reasons: OAuth names/emails can be odd (Apple private relay, legal name vs. preferred name), and Apple only hands over the name on the user's *first-ever* authorization — so it can't be relied on for repeat sign-ins. Treat it as "pre-filled, not guaranteed."
- **Phone is the mirror gap:** OAuth gives email+name but no phone; phone-signup gives phone but no email. So Phone is collected on the setup screen too — but it's **optional** there (nothing depends on it for OAuth users, unlike Email which the backend needs for booking-confirmation emails).
- **Email verification is non-blocking.** Format-validated on submit, not confirmed via a second code/link during onboarding. Google/Apple emails are already provider-verified; phone-signup emails are self-typed and unverified but only used for receipts, not security (phone/OTP is already the verified identity there) — so a second "check your inbox" step would just be friction stacked on the OTP step they already did. Verify in the background after signup instead, with a soft/dismissible reminder later if needed.
- **Linking a second method later** (e.g. a phone user adding Google as backup) is explicitly out of scope for this flow — treated as a Settings-screen concern.

---

## 4. Skill level — ⚠️ needs a decision

Built as a slider, **1.0 (Pro) to 7.0 (Beginner) in 0.5 increments** — per explicit direction that in this app's rating convention, the *lower* number is the *better* player (1 = pro, 7 = beginner). The slider's underlying drag behavior is normal (drag right = more filled = better), it's only the displayed number that counts down as you drag right, matching that stated convention.

**Flag for you and your partner:** `design/home.png` (an existing mockup, presumably predating this session) shows match cards labeled like "Level 3.0 – 4.5" without making the direction explicit. Worth confirming both mockups agree on which end is "better" before building the desktop version or wiring this to a real backend — I implemented what was explicitly requested in this session, but haven't cross-checked it against that earlier mockup.

Label bands used: 7.0–5.5 "Beginner", 5.0–3.5 "Intermediate", 3.0–2.0 "Advanced", 1.5–1.0 "Pro".

## 5. Home club — multi-select

Built as multi-select chips (not a single dropdown) with a live search filter above them, because a player can belong to more than one club. Required (at least one).

---

## 6. Interaction patterns / conventions

- **Validation is submit-only**, never on blur/while typing. On failure: red border + inline message under the field, and focus jumps to the first invalid field. Semantic `--error` red is intentionally separate from the brand accent palette.
- **Chips** (home club selector): unselected = muted text (~50% opacity), no checkmark icon rendered at all (not just hidden — removed from layout so no dead space). Selected = solid neon-lime fill, charcoal text, checkmark appears and the chip grows to fit it.
- **Toasts**: used throughout to narrate what a real backend call would do (e.g. "This would confirm the code with Firebase..."), since nothing is actually wired. Positioned as an overlay above whichever screen is active, not tied to one specific screen.
- **Slider thumb**: solid neon-lime fill, no border — kept minimal rather than a bordered/outlined handle.
- **Icon placement**: the small circular mark (not full wordmark) sits top-right in the header bar on every post-splash screen, deliberately positioned clear of the device's camera/notch rather than centered under it.

---

## 7. Open questions for desktop parity

- Does desktop reuse the phone-style "one screen per step" flow, or collapse steps (e.g. combine phone-entry + OTP) given more screen real estate?
- Does the dark "night court" branding extend to desktop auth, or does desktop follow OS theme instead? (Mobile intentionally does *not* follow OS theme for these screens — see §1.)
- Skill-level direction (§4) needs to be confirmed as a single source of truth before both platforms build against it.
