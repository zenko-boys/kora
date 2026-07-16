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

2. **Login** — email + password form, "Forgot password?" (wired, see §8), Apple/Google social buttons above a divider, footer link to Create Account. Icon mark sits top-right in the header bar, clear of the phone's camera notch.

3. **Create Account** — same template as Login. Apple/Google buttons (instant path, see flow below) plus a phone-number field + "Send code" (OTP path).

4. **Verify Code** — 6-digit segmented OTP input (auto-advance, backspace-to-previous, paste-to-fill-all supported), "Resend code" with a 30s disabled cooldown, "Edit" link back to Create Account to fix a mistyped number.

5. **Set up your game** — the single convergence point for both signup paths (see below). Fields: Name, Email, Phone (optional), Skill level (slider), Home club (multi-select).

6. **Reset password** — reached from Login's "Forgot password?" link. Email field, "Send reset link" button. Submitting swaps the form for a generic confirmation message ("If an account exists for that email, we've sent a link…") rather than confirming either way whether the address is registered — this is the one screen in the flow that deliberately does *not* reveal account existence (contrast with Create Account/Set up your game, which do reveal it — see §8). Confirmation state has a "Back to log in" button.

All post-splash screens share one template (`.screen--login` class): dark ground, back button top-left, icon mark top-right, greeting headline, then form content.

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

## 4. Skill level

Built as a slider, **1.0 (Pro) to 7.0 (Beginner) in 0.5 increments** — in this app's rating convention, the *lower* number is the *better* player (1 = pro, 7 = beginner). The slider's underlying drag behavior is normal (drag right = more filled = better), it's only the displayed number that counts down as you drag right, matching that convention.

An earlier mockup (`design/home.png`) showed match-level labels without making direction explicit, which raised a question about consistency — that mockup has since been removed and will be redesigned, so there's nothing to reconcile against right now. Whoever designs the next match-browsing screen should just match this convention (1 = best, 7 = beginner) rather than introduce a new one.

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

## 8. Edge-case states

Since nothing is really wired, these are simulated with fixed "magic" trigger values so a click-through tester can find them without reading code. Each screen that has one calls it out with a dashed-border "Prototype tip" hint (`.demo-hint` class) — real copy, none of this scaffolding, ships to production.

- **Wrong OTP / repeated tries**: the only code that verifies is `123456`. Any other 6 digits is treated as wrong — inline error shows remaining attempts (`Incorrect code. N attempts left.`), and the boxes clear so the user retypes rather than edits over a rejected code. After 5 wrong attempts, the code boxes and Verify button lock (`Too many incorrect attempts. Resend a new code to try again.`) — only "Resend code" clears the lockout, which also resets the attempt counter to 0.
- **Phone already registered**: entering a number ending `555 000 1111` on Create Account surfaces `An account with this phone number already exists. Log in instead.` on submit and keeps the user on Create Account (doesn't advance to Verify Code) — the existing "Already have an account? Log in" footer link is the recovery path, so no new UI was needed there.
- **Email already registered**: entering `taken@kora.app` on Set up your game surfaces `That email is already linked to another account.` on submit and blocks saving. This is the only place email-uniqueness is checked in this flow, since phone-signup users don't type an email until this step, and OAuth users' emails are provider-verified (linking a second method to an existing account is still out of scope — see §3).
- **Forgot password**: now wired end-to-end (previously a dead link). Unlike the two cases above, this one deliberately does *not* reveal whether the email is registered — generic "if an account exists…" confirmation regardless of input, matching standard password-reset practice (revealing account existence here is a user-enumeration risk in a way that signup-time "email taken" isn't).

**Why real values instead of random/always-fail:** deterministic triggers mean the wrong-code and happy-path states are both reachable on demand while testing, and the hint text means nobody has to open dev tools to find them.

---

## 9. Open questions for desktop parity

- Does desktop reuse the phone-style "one screen per step" flow, or collapse steps (e.g. combine phone-entry + OTP) given more screen real estate?
- Does the dark "night court" branding extend to desktop auth, or does desktop follow OS theme instead? (Mobile intentionally does *not* follow OS theme for these screens — see §1.)
- Skill-level convention (§4, 1 = best) is settled — keep it consistent wherever match/skill levels show up next (e.g. the redesigned home/discover screen).

---

# Part 2 — Main app shell (Home / Matches / Events)

The auth flow above ends in a toast ("this would take you into the app") because there was no "into the app" yet — and still doesn't. A first pass at Home was built directly into the auth prototype (drag-sheet ad banner, next-match card, bottom nav) but was rejected outright and has been **removed from the prototype entirely** (the login/setup handlers again just toast, matching pre-Home behavior). Home is being redesigned from scratch; nothing about its visual layout should be inherited from that attempt. An earlier mockup, `design/home.png`, showed an even older sketch of a "Discover" screen and was deleted before that — also not a reference.

## 10. Bottom nav & screen split

- **Bottom nav:** Home / Matches / Events / Messages / Profile.
- **Home** — a personal dashboard, not a browse feed. Leads with *your* next match (and next event, if any) rather than "available matches to join." Empty state: "No games on your calendar" → **Find a match** CTA into Matches.
- **Matches** — browsing and joining open matches created by other players. No sport-type filter for now — **Padel only**. Club filtering uses the searchable club picker (§11), not limited to the player's home club(s).
- **Events** — day-use passes and tournaments, grouped together because both are "club-hosted, book a slot" actions, distinct from a peer-organized Match. Maps onto the backend's `BookingType` / `ICreateBookingStrategy` split (see root CLAUDE.md). Tournaments open their own richer flow (bracket size, entry fee, registration deadline) rather than reusing the simple Match "join" card — day-use stays simple.
- **Club page** — still an open thread. Explored tabs-at-top vs. a menu-first structure vs. peek-with-"see all" sections; parked without a final shape.

## 11. Club picker (decided direction, not yet built)

- **Rejected:** filter chips scoped only to the player's home club(s) (the pattern used for the *signup* home-club picker, §5) — too narrow here, since players need to discover clubs beyond ones they belong to (traveling, trying somewhere new).
- **Direction instead:** a searchable picker (bottom sheet) — search bar, home club(s) pinned/pre-checked at top, plus the ability to find and add any other club by name or nearby location. Multi-select, applies as a filter to the Matches feed.

## 12. Home screen — status: rebuilding incrementally, step 1 in place

The original attempt (header, ad banner, next-match card, "also on your calendar" row, empty state, bottom nav) was pulled out of the prototype in full — CSS, markup, and JS — and Home is being redesigned from scratch, one deliberately-scoped piece at a time rather than all at once. §10's bottom-nav/screen-split decisions and §11's club-picker direction are structural decisions independent of any particular visual attempt and still stand.

**Step 1 (current): top bar + draggable sheet, nothing else.** Built directly into the auth prototype (§0's link), reachable via the "Home" button in the screen switcher:

- **Top bar** (`.app-header`) — avatar chip on the left, notification bell + search icon buttons on the right, dark charcoal background. Structurally mirrors the reference's profile-chip-left/icons-right split, not its exact contents (no level badge, no message icon).
- **Draggable sheet** (`.home-sheet` / `.sheet-handle`) — modeled directly on the Itaú reference (`design/itauFormClosed.jpeg` / `design/itemFormOpened.jpeg`): drag the handle down to reveal the area behind it, up to hide it; tapping the handle also toggles it, so it's testable without touch. The reveal area (`.reveal-area`) and the sheet's own content (`.sheet-content`) are both explicit labeled placeholders (`.demo-hint`) — no next-match card, no promo copy, no quick-actions grid invented to fill the space. Nothing else has been designed yet; the next step should be scoped and agreed before adding it, not folded in here.
- **Sheet accent** — a 2px `--neon-lime` top border on the sheet. Considered making the header and sheet both solid lime first; rejected because lime is used everywhere else as a small accent (buttons, focus rings, chip/slider states) against dark grounds, and a full-lime fill on two large surfaces would wash that out and break the dark-ground-with-accent hierarchy from §1. A thin top-border keeps it in that same accent role.
- **Header and reveal area are transparent, not flat** — they let `.screen--home`'s own radial gradient show through, same as every other screen's header (`.login-top` has no background of its own either — see §1/§2). An earlier pass gave the header and reveal area their own flat `var(--charcoal)` fill to paper over a seam bug (below); that made Home's upper portion read as a flat, uniformly darker block instead of the same lighter-at-top gradient every other screen shows, which is what created the "is Home darker than the rest?" impression. Only the sheet itself keeps a flat `var(--charcoal)` fill — it's a distinct surface/card sitting on the gradient (like a button or field does), not page-level chrome, so it's exempt from this.
- **Sheet is bottom-anchored, not transform-translated** — `.home-sheet` is `position: absolute; left/right/bottom: 0` with an animated `top` (via the `--sheet-top` custom property), instead of a fixed-height flex item pushed around with `transform: translateY(...)`. The transform approach moved the sheet's bottom edge along with its top when closing, which uncovered a gap at the very bottom of the screen (revealing the plain background behind it). Pinning `bottom: 0` means the sheet always reaches the bottom of the screen regardless of drag position — only how much of the reveal area shows above it changes.
- **Sheet background is the exact same gradient as every other screen**, not a flat color. Went through two flat-color guesses first (`--charcoal`, then `--charcoal-deep`) trying to approximate what the gradient looks like at the sheet's position — both were still visibly off since a flat fill can't match a gradient's tonal falloff. Settled on applying the literal same value used by `.screen--login` / `.screen--home` (`radial-gradient(120% 90% at 50% 12%, #1B2129 0%, var(--charcoal) 46%, var(--charcoal-deep) 100%)`) directly to `.home-sheet` — same background as the rest of the app, full stop, not an approximation of it.

**Step 2: floating bottom nav, modeled on Nubank's app.** A capsule-shaped bar (`.floating-nav`) floating with margin from the screen edges (not flush, not full-width) rather than the flat edge-to-edge `.bottom-nav` from the original scrapped attempt. Three items only, per explicit direction — not the full five-tab set from §10 yet:

- **Matches** and **Events** — plain icon + label buttons, reusing the exact icon glyphs from the original (deleted) bottom-nav rather than drawing new ones (overlapping-circles for Matches, calendar for Events) — same icon language, not reinvented.
- **New match** — the center item, raised above the bar as a circular button (`.floating-nav-new`), filled solid `--neon-lime` — the one CTA-weight element here, consistent with lime's role as the accent for primary actions everywhere else in the app.
- All three still just toast "prototype only" on click, same convention as everything else unwired.

**Step 3: featured "up next" card.** First real content in the sheet — a single card (`.next-card`) surfacing whatever's next on the calendar, match or event, deliberately generic rather than assuming it's always a match:

- **Type** — a small pill badge (`.next-card-type`, `--deep-green` fill), currently reading "Match"; would read "Event" for a day-use pass/tournament. Sits next to the **time**.
- **Club** — name with the same location-pin icon already used elsewhere in the prototype (§ auth flow's match-level reference), not a new icon.
- **Participants** — `.avatar-stack`, capped at **8** visible circles; if there are more than 8 people, the last slot collapses into `+N` rather than growing the row (current placeholder: 7 initials + `+3`, i.e. a 10-person match/event).
- Still placeholder data throughout (club name, initials, counts) with a `.demo-hint` calling that out — nothing here is real yet, just the layout.

**Corrections made to step 3 after review:**

- **Card background was inventing a new color, not reusing one.** First pass used a green-tinted gradient (`rgba(15,163,90,alpha)` blending to `--charcoal-deep`) reasoning that it was "built from tokens" — but blending a token at unusual opacity into a gradient produces a visible color that doesn't match anything else in the app; no other surface anywhere has a green tint. Flagged as still inventing despite technically using token-derived rgba values. Fixed by dropping the gradient entirely and reusing the *exact* neutral "box on dark ground" recipe already used for form fields: `background: rgba(245,246,244,0.05); border: 1.4px solid rgba(245,246,244,0.16);`, `border-radius: 14px` (matching `.btn`'s existing radius, not a new one-off 18px). Lesson: "built from approved tokens" isn't sufficient on its own — the resulting *treatment* also has to already exist somewhere in the app, not just the ingredients.
- **Avatars were translucent, causing overlap bleed-through.** `.avatar-stack span` originally used `rgba(245,246,244,0.18)` as a see-through fill, so where circles overlapped, whatever was behind (card background, or the avatar underneath) showed through — reading as a rendering bug. Fixed to solid opaque fills, cycling three §1 tokens per avatar (`--deep-green`, `--lime-green`, `--stone-dim`, with contrasting text color each) via `.avatar--a/--b/--c` classes, plus a dedicated `--charcoal` fill for the `+N` overflow slot — no new colors, but solid rather than tinted.
- **Green wasn't banned, just the specific treatment was wrong — until a reference showed up for it.** After flattening the card, confirmed `--deep-green`/`--lime-green`/`--neon-lime` are still fair game — the card's own type badge is already solid `--deep-green`. First added a 3px solid `--deep-green` left-edge border as the accent (mirroring the sheet's lime top-border precedent). Then Danilo pointed to `design/card.png` — a reference showing a night-court-photo card fading from green into near-black at the bottom — and asked for that background treatment specifically. Swapped the left-border accent for a top-to-bottom gradient, `rgba(15,163,90,0.45)` fading to `--charcoal-deep` by 70%: still only `--deep-green`/`--charcoal-deep`, no new hex values, just applied as a full-card wash instead of a stripe now that there's an explicit reference asking for it (same category of source as the Itaú sheet reference — a concrete mockup in `design/`, not an invented treatment).
- **Lime went small, not into the background.** Asked about using lime instead of green for the card background; talked through why not — `--lime-green`'s own §1 description is "gradient partner to *neon-lime*" (implies pairing with neon-lime, not fading alone into dark), and `--neon-lime` is reserved as the primary CTA/focus accent, so washing either across the whole card background would be the same "accent spread over a large surface" mistake already backed out of once. Landed on one small high-contrast hit instead, matching how card.png itself only uses bright lime for its CTA button, not its backdrop: the avatar-stack's `+N` overflow slot (`.avatar--more`) is now solid `--neon-lime` fill with `--charcoal-deep` text.
- **Final direction: left-border, type-coded, not a tinted background at all.** Built a side-by-side comparison of 7 background treatments (flat neutral, solid charcoal-deep, left-border, vertical green gradient, horizontal/radial lime glow, and an actual cropped-photo option from `design/card.png`) so the choice wasn't another guess. Chosen: neutral `rgba(stone,0.05)` fill (same as header/sheet/fields — no tint) with a 4px colored **left border only** signaling type — `--deep-green` for Match, `--lime-green` for Event (`.next-card.type--event`). No background photo, no gradient wash; color stays a small signal, not a surface treatment.
- **Card grew and gained the rest of card.png's info row.** Feedback was "too much empty space" — padding went 16px→20px, radius 14px→16px, avatar circles 26px→34px, and font sizes stepped up across the board (club name is now a proper 16px display-font headline, not a meta line). Also added, matching card.png's chip row: a clock icon next to the time, and two new chips (`.next-card-chip`) for **level range** ("Level 3.0–4.5") and **spots left** ("2 spots left", person icon) sitting below the club line. Club/pin line is now its own bold headline rather than sharing a row with anything else.
- **Card background went fully transparent; borders moved onto the individual info pieces instead.** Even the neutral `rgba(stone,0.05)` fill read as an unwanted "box" — dropped it (`background: transparent`) so the card just takes on whatever's behind it (the sheet). `.next-card-time` now has the same bordered-chip treatment as the level/spots chips (`border: 1px solid rgba(stone,0.14)`, rounded) — every discrete piece of info is its own bordered chip; only the club headline stays plain text (already distinct via the display font). First pass dropped the card's own outer border entirely (only the colored left edge remained) — flagged as missing top/bottom framing, so the full `1.4px solid rgba(stone,0.16)` border came back alongside the transparent fill; only the left edge is thicker/colored for type.
- **Cards shrunk once there were two of them.** With a Match and Event card both on screen (below), the earlier "make it bigger" sizing (20px padding, 16px club headline, 34px avatars) ate too much width for a scrollable row — sized back down (14px padding, 14px club headline, 27px avatars, 11px chip text) and `flex-basis` dropped from 82%→68% (`max-width` 300px→240px) so more of the next card peeks and more fit on screen at once.
- **Type badge + time chip were overflowing at that smaller width** — "PM" was wrapping onto its own line and the time text was touching the chip's border. Root cause: those two elements together were wider than the shrunk card's inner width, and without `white-space: nowrap` the browser broke the text mid-phrase instead of just tightening spacing. Fixed by tightening both down to 10px font / ~4px padding, adding `white-space: nowrap` + `flex-shrink: 0` so they hold their shape, and giving `.next-card-chip` the same `nowrap` treatment (safe there since the row itself already wraps whole chips via `flex-wrap`, so text-level wrapping was never needed).
- **Removed the colored left border entirely.** After trying it, decided the type badge's own color (deep-green Match / lime-green Event) is enough of a signal on its own — the card border is back to a plain, uniform `rgba(stone,0.16)` on all sides, same as before type-coding was introduced. Type-coding now lives only on the badge, not on the card frame.

**Step 4: club filter field in the header.** A second row under the avatar/icon row — `.club-filter`, a pin icon + label + chevron in a bordered pill (same `rgba(stone,0.08)` fill / `rgba(stone,0.16)` border recipe used everywhere else), opening the multi-select club picker described in §11 (not built yet — click currently just toasts, referencing §11's search + pinned-home-clubs direction so it doesn't drift from that decision later).

- **Label logic**: exactly one club selected → show that club's name ("Riverside Padel Club"). More than one → show a count ("Showing 3 clubs") rather than trying to list names and running out of room.
- Demonstrated with a dev-only state switcher (`club-filter-switcher`, same convention as the screen/icon switchers) rather than actually building the picker sheet yet — toggling between the two states is what's being tested here, not the picker itself.
- **Notification bell + search icons removed from the header entirely** (not just visually hidden) — Danilo doesn't expect to use them, and the club filter now sits where they were, in the header's top row next to the avatar chip, rather than as a second row underneath. `.header-actions`/`.icon-btn`/`.notif-dot` and their JS handlers were deleted outright rather than left dead in the file.

**Card-row polish**, same pass:
- **Event card now shows a level chip too** ("All levels", vs. Match's numeric "Level 3.0–4.5") — originally omitted since skill level didn't seem to apply to a day-use event, but leaving it out meant the two cards had a different number of content rows above the avatar stack, so the avatars didn't line up between cards in the scroll row. Matching the chip count fixed the misalignment as a side effect of fixing the content parity.
- **Cards widened, less of the next one peeks** — `flex-basis` went 68%→80%→84% (`max-width` 240px→290px→300px) across two rounds of feedback: first "1/4 would be perfectly fine," then tightened further to roughly 1/5 — enough to signal the row scrolls without giving away a full quarter-card's worth of the next item. Applies to both card rows (`.next-card` is shared), so both got smaller peeks from one change.
- **Cards were losing their edge margin once scrolled.** `.next-cards-scroll` bleeds edge-to-edge via a negative margin matching `.sheet-content`'s own 20px padding (standard full-bleed-carousel technique) — but without telling the browser to keep that padding as part of the scroll-snap reference point, snapping could land a card flush against the true edge instead of respecting the 20px inset. Added `scroll-padding: 0 20px;` (matching the same 20px used everywhere else) so every snapped position — first card, last card, anything in between — keeps the same margin as the rest of the sheet's content.

**Step 5: "Join an existing match" — a second scrollable row, reusing the exact same card component.** Sits below "Your next bookings" in the same sheet. Same `.next-card`/`.next-cards-scroll` markup and styling (type badge, time, club, level/spots chips) — the only new thing is the avatar treatment:

- **Open slots are dashed, empty circles** (`.avatar--empty`: transparent fill, `2px dashed rgba(stone,0.35)` border), not another solid-fill avatar — the point is to visually read as "space available," directly modeled on card.png's own dashed "+" avatar circle for its open spot. Two examples: 2-of-4 filled (2 dashed circles open) and 3-of-4 filled (1 open), matching each card's own "N spots left" chip so the two don't contradict each other.
- Cards aren't interactive yet (no tap handler) — the `.demo-hint` notes tapping one would go to match details/join, once wired.

**Header now carries the icon mark too**, matching every other post-splash screen (§1's "small circular mark, top-right in the header, clear of the notch" rule) — Home's header was missing it. Layout: avatar-chip and club-filter keep their natural left-to-right order with a gap between them; the icon mark uses `margin-left: auto` to push itself to the far right, same visual result as the grid-based `justify-self: end` used on the auth screens' `.login-top`, just via flexbox since Home's header isn't a grid.

- **Empty-avatar sizing fix**: the dashed `.avatar--empty` circles were reading as visibly bigger than the solid ones at the same 27px box size — a real rendering quirk where a dashed border on a circle looks visually heavier than a solid border of the same width, not an actual size difference (box-sizing: border-box guarantees the box itself is identical). Thinned the dashed border to 1.5px (vs. 2px for solid avatars) to compensate optically rather than changing the shared avatar size.

**Step 6: third row ("Join an event") + a "See all" link on every row.** Home's sheet now has three scrollable card rows in order: Your next bookings → Join an existing match → Join an event. All three share the exact same `.next-card`/`.next-cards-scroll` component; "Join an event" just uses `.type--event` cards (lime-green badge) with bigger attendee counts and no "empty slot" avatars (day-use passes/tournaments are capacity-based, not a fixed 4-person roster like a match, so "spots left" carries that information instead).

- **`.section-header`** wraps each row's `.section-label` in a flex row with a new `.see-all-link` button, right-aligned. Clicking either toasts which full list it would open (bookings / open matches / events), keyed off a `data-see-all` attribute rather than three near-duplicate handlers.
- **First real use of `--lime-green` as a text link** — its own §1 description is "links on dark surfaces," which hadn't actually been used that way anywhere yet (only as a fill color). This is that use, rather than reaching for `--neon-lime` (reserved for CTA/focus) or inventing a new link color.
- **Fixed**: `.section-header` used `align-items: baseline`, which lines up text baselines rather than visual centers — with a 20px display-font headline next to a 12.5px body-font link, that left the link looking vertically off relative to the headline instead of centered. Changed to `align-items: center`.

## 13. Design system reference panel

Added directly to the live prototype artifact (§0's link), below the phone mockup — a `<section class="design-system" id="designSystem">` toggled via a "Show/Hide design system" button, not one of the click-through screens. Covers: color tokens (swatch + hex + usage, straight from §1's table), typography samples, buttons, chips, badges/links, avatars (all four variants), the card component, the corner-radius scale (10/12/14/16/28px), and the icon mark.

**Why it reuses classes instead of re-describing them:** every example is built with the exact same CSS classes as the real screens (`.btn--primary`, `.chip`, `.next-card`, `.avatar-stack`, etc.) rather than separate mockup styling — so the panel can't quietly drift out of sync with what's actually built the way a written spec could. If a class changes, the panel changes with it automatically.
- **Section renamed "Your next bookings," and it's now a scrollable row of cards, not one fixed card.** Two changes converged here: (1) a real padel Match is exactly 4 players — the avatar-stack for Match cards shows all 4 with no `+N` overflow (overflow only makes sense for Events, which realistically can have many more attendees than a doubles match). (2) Added a second card demonstrating an Event with more people (12 total: 7 shown + `+5`), which meant "Up next" (singular) no longer fit — renamed to "Your next bookings" and wrapped both cards in `.next-cards-scroll` (horizontal flex row, `overflow-x: auto`, `scroll-snap-type: x mandatory`, cards at `flex: 0 0 82%` so the next card's edge peeks to hint it scrolls). Uses a negative-margin bleed matching `.sheet-content`'s own 20px padding, a standard technique for edge-to-edge carousels inside a padded container. This also frees the rest of the sheet vertically for other content later, instead of one card eating a full-width block.

**Hard constraint — reuse the existing design system, don't invent a new one.** The original attempt wasn't scrapped because the brand was wrong; it was scrapped because its *layout/interaction* choices (the card treatment, the ad banner, etc.) missed the mark. Whatever Home becomes — step 1 above and everything after it — must be built from the same system already established by the live auth prototype (§0's link) and documented in §1, not from new colors, fonts, or shapes invented for the occasion:

- **Colors**: only the tokens in §1's table (`--charcoal`, `--charcoal-deep`, `--stone`, `--stone-dim`, `--deep-green`, `--lime-green`, `--neon-lime`, `--error`). No new hex values, no new gradients built from unrelated colors — if a gradient is needed, it's built from these tokens the way the auth screens already do.
- **Typography**: `'Futura', 'Avenir Next', 'Century Gothic', ...` for display/headlines/buttons, system stack for body/UI — same two stacks, no third font introduced.
- **Shapes/chrome**: reuse existing corner-radius scale, button styles (`.btn` / `.btn--primary`), focus-ring treatment (neon-lime outline), chip pattern, field pattern, phone-frame chrome — pull these classes/values from the current prototype file rather than redrawing equivalents from scratch.
- **Theme**: stays dark, night-court (§1) — not open for re-litigating.

Concretely: before proposing or building new Home visuals, look at what's already in the live prototype (`kora-auth-prototype.html`) and extend it, rather than designing in a vacuum and reconciling colors/fonts after the fact.
