# Experience redesign: implementation handoff

This folder is the source of truth for the Experience mobile redesign (customer and merchant apps).

- `screens/*.dc.html` holds one file per screen: a 390×844 mockup written in a templating format, with `{{holes}}`, `<sc-for>` loops and `<sc-if>` branches. The values for those come from the `renderVals()` script at the bottom of each file. These files won't render correctly if opened straight in a browser; the rendered versions are on the Design canvas. Read them as **visual specs**: copy the layout, inline styles, spacing and copy, not the HTML. The script holds the sample data and the interactive states.
- `screens/canvas.json` lists every screen with its title.
- This README holds the tokens, the components, the screen-to-API map, the backend gaps and the build order.

> **Implementation rules.** Keep the app's existing framework, navigation, state management and API layer. Restyle and extend what exists; don't rewrite working logic. Never invent endpoints: if a screen needs data the API doesn't provide, leave a TODO and use the fallback described below. Never show a money or points operation as successful until the API response confirms it.

---

## 1. Design tokens

### Colour (dark theme only)

| Token | Value | Use |
|---|---|---|
| `bg` | `#0A0A0F` | App background |
| `bgGlow` | `linear-gradient(180deg, #3A1A8F 0, #1C0F4A 110px, #0A0A0F 240px)` | Top of every screen (absolute, behind the header) |
| `surface` | `#15151C` | Cards, inputs, list rows |
| `surfaceRaised` | `#1F1F29` | Secondary buttons |
| `tabBar` | `#0F0F15` | Bottom navigation |
| `border` | `#2E2E3A` (inputs, chips) / `#24242E` (cards) | 1px |
| `primary` | `#6B4EF0` | Primary buttons, selected tile/chip fill |
| `primaryBorder` | `#8B74F7` | Border on selected tiles/chips |
| `primaryDisabled` | `#2A2148`, text `#9C93C9` | Disabled primary |
| `points` | `#C9BFFF` (text), chip bg `rgba(165,149,255,0.14)` | **Anything in points** |
| `link` / active tab | `#B4A7FF` | |
| `success` | `#34D5A1` (icons, value), text on dark `#5EE6B6`, bg `rgba(52,213,161,0.14)` | Success, ≈ naira value of points |
| `pending` | `#F5B740`, bg `rgba(245,183,64,0.14)` | Pending states |
| `danger` | `#F58E9B` (text), `#C2334A` (destructive button), bg `rgba(245,142,155,0.14)` | Errors, failed, reversal |
| `text` | `#F4F4F7` | Primary text |
| `textSecondary` | `#B9B9C6` | Field labels, sub-text |
| `textMuted` | `#9C9CAB` | Captions, timestamps |
| `brandCard` | `linear-gradient(135deg, #7A5CFA 0%, #4B2BD1 55%, #2E1890 100%)` | Balance cards, giveaway code |

### Points vs money (must stay consistent)
- Points are shown in lavender `#C9BFFF` with a `pts` suffix: `4,200 pts`.
- Money is shown in white with a `₦` prefix and 2 decimals: `₦184,250.00`.
- An estimated naira value of points is shown in mint with `≈`: `≈ ₦2,100`.

### Type: DM Sans (Google Fonts; `@expo-google-fonts/dm-sans` on React Native)

| Role | Size / weight |
|---|---|
| Balance display | 30 / 700, letter-spacing −0.02em, tabular numbers |
| Status title | 19 / 700 |
| Screen title (header) | 16 / 600, left-aligned next to back arrow (tab roots: 18 / 600, no back arrow) |
| Section heading | 13–14 / 600 |
| Body / rows / buttons | 13–14 / 500–600 |
| Field label | 12 / 400, `textSecondary` |
| Caption | 11 / 400, `textMuted`, **never below 11** |

Use tabular numbers (`fontVariant: ['tabular-nums']`) on every amount.

### Shape and spacing
- Radii: 10 (small buttons), 12 (inputs), 14 (primary CTA, list cards), 16 (tiles, cards), 20 (balance card), 999 (chips).
- Spacing on a 4px grid. Screen padding is 20px horizontal.
- Touch targets are at least 44px. The primary CTA is 52px high.
- The header is 56px of top safe area plus a 44px row, with a bottom border `rgba(255,255,255,0.08)`.
- The bottom tab bar is 86px including the home indicator. Icon 22, label 11.

---

## 2. Shared components

| Component | Spec | Seen in |
|---|---|---|
| `ScreenHeader` | Back chevron (44×44) + left title; optional right slot (step "Step 2 of 3", status chip, action) | most screens |
| `StepProgress` | N equal bars, 4px, gap 6, filled `primary` / empty `#24242E` | ResetPassword, MerchantRegister, Transfer, AwardPoints |
| `ChoiceTile` | Dark tile, icon + label, selected = `primary` fill + `primaryBorder`; used for pickers in a 2- or 3-column grid with a centred prompt above ("Choose merchant") | Main, Login, SelectPurchase, CreateProgram, CustomerLookup, ReverseAward |
| `Chip` / `ChipGroup` | Pill, 32–36px, outline when off, `primary` when on | Explore, Wallet, Activity, Transfer quick amounts |
| `InlineField` | Label on the left (≈76–112px column) + input on the right; focused/valid input gets a `primary` border, an error gets `danger` | Transfer, SendPoints, CreateProgram, Rewards |
| `PrimaryButton` | Full width, 52px, pinned to bottom of screen (padding 16/20/36) | all flows |
| `ButtonPair` | Secondary (`surfaceRaised`) + primary side by side | status screens, confirm sheets |
| `ConfirmSheet` | Bottom sheet, radius 28 top, grab handle, key–value summary, Edit + confirm | Transfer, SendPoints |
| `KeyValueCard` | `<dl>` rows: muted key left, value right | PayWithPoints, AwardPoints, TransferStatus |
| `StatusScreen` | Centred 64px icon circle (success / pending / failed colours), title, body, details card, progress timeline, ButtonPair | TransferStatus, VerifyIdentity, ResetPassword |
| `BalanceCard` | `brandCard` gradient, label, display amount, inner account row with copy button | Main, Wallet, Business |
| `ActivityRow` | Card row: icon chip, title + sub, amount right (points/money colours), optional status or action link | Wallet, Activity, Main |
| `EmptyState` | 1.5px dashed `#33333F` border, title + one-line hint | Rewards catalog, SelectPurchase |
| `BottomTabBar` | Customer: Home, Explore, Rewards, Wallet, Profile. Merchant: Overview, Programs, Customers, Activity, Business | |

Every screen needs loading (skeletons matching row shapes), empty, network-error and expired-session states. Money and points actions need pending, success and failed states.

---

## 3. Screens to API endpoints (all paths under `/api/v1`)

Merchant endpoints need `Authorization: Bearer <merchant_token>` **and** `X-Merchant-Id`. Customer endpoints use the customer token. Keep the two tokens separate and refresh them with `POST /auth/refresh`.

### Access
| Screen file | Endpoints |
|---|---|
| Onboarding | none (3 slides: Earn everywhere / Spend smarter / Grow your business) |
| Login | `POST /auth/login` (customer), `POST /auth/login/merchant`; role picker tiles |
| Register | `POST /auth/register/customer` {first_name, last_name, email, phone_number, password} |
| MerchantRegister | `POST /merchant/register` {name, slug, description, business_email, business_phone, country, currency, admin_user{…}}; step 1 business, step 2 admin |
| ResetPassword | `POST /auth/forgot-password` → `POST /auth/verify-otp` (6-digit) → `POST /auth/reset-password` |

### Customer
| Screen file | Endpoints |
|---|---|
| Main (Home) | `GET /customer/dashboard`, `GET /customer/favorites/merchants`, `GET /customer/promos` |
| Explore | `GET /customer/merchants`, `POST`/`DELETE /customer/merchants/{id}/favorite`; search/filter client-side |
| Rewards | `GET /customer/points/merchants`, `POST /customer/giveaways/claim` {giveaway_code}; redeem = `POST /customer/programs/{id}/redeem` with `Idempotency-Key` (catalog blocked, see gaps) |
| Wallet | `GET /customer/wallet`, `GET /customer/transactions`, `GET /safehaven/customer/account-balance`; first-time setup `POST /customer/wallet`, `POST /customer/bank-account` |
| Profile | `GET /customer/profile` (read-only) |
| VerifyIdentity | `POST /safehaven/identity/verify` {type: "BVN", number, async: false} |
| SelectPurchase | `GET /customer/purchases?status=OPEN&merchant_id=`, `GET /customer/merchant/{id}/spendable` |
| PayWithPoints | `POST /customer/merchant/{id}/pay-with-points` {purchase_id} (always the full amount) |
| SendPoints | `GET …/spendable`, `POST /customer/merchant/{id}/send-points` {points_to_use, note} |
| Transfer | `GET /safehaven/banks`, `POST /safehaven/name-enquiry` → keep `sessionId`, then `POST /safehaven/transfers/external` {name_enquiry_reference, debit_account_number, beneficiary_bank_code, beneficiary_account_number, amount, narration, payment_reference (new per attempt), save_beneficiary} |
| TransferStatus | Shows the transfer response only (pending / success / failed tweak) |

### Merchant
| Screen file | Endpoints |
|---|---|
| MerchantOverview | `GET /merchant/profile`, `GET /merchant/wallet`, `GET /merchant/programs`, `GET /merchant/activities?limit=5` |
| Programs | `GET /merchant/programs`, `GET …/{id}/balance`, `GET …/{id}/redemption-policy`, `POST …/{id}/close`, `POST …/{id}/settle` |
| CreateProgram | `POST /merchant/programs`: PREPAID sends `funding_amount`; POSTPAID must **not**. Plus `earning_type: FIXED_RATE`, `points_per_currency_unit`, `point_value`, `maximum_redemption_percentage`, `redeemable_merchant_ids`, `expiration_type: NEVER`, `redemption_mode: PRIVATE` |
| CustomerLookup | `GET /merchant/customers/lookup?` exactly one of email / phone_number / customer_id / merchant_customer_id |
| AwardPoints | `POST /merchant/programs/{id}/customers/{cid}/award` {points, reason}, or `POST /merchant/programs/{id}/award` by identifier (**creates the customer if none match**); keep `ledger_entry_id` |
| ReverseAward | `POST /merchant/programs/{id}/awards/{ledger_entry_id}/reverse`: partial sends `points`, full omits it |
| Giveaway | `POST /merchant/giveaways`, `GET /merchant/giveaways/{id}/status`, `POST …/{id}/close` |
| Promotions | `GET/POST /merchant/promos`, `GET/PUT/DELETE /merchant/promos/{id}` |
| Activity | `GET /merchant/activities` with `activity_type` (POINTS / WALLET), `program_id`, `customer_id`, `start_date`, `end_date`, `limit`/`offset` |
| Business | `GET /merchant/wallet`, `POST /merchant/wallet/fund`, `POST /merchant/verification/company` {registration_type: CAC, registration_number, company_name}, `GET /safehaven/merchant/account-balance` |

**Never call these from the app:** the SafeHaven token, account-listing and subaccount routes. They belong on the server only.

---

## 4. Backend gaps (build the fallback, leave a TODO)

1. **No reward catalog for customers.** Redeem needs a `reward_id` the customer can't look up. Fallback: show "Reward catalog coming soon".
2. **Profile is read-only.** There's no update endpoint and no change-password while signed in. Fallback: password changes go through the reset flow.
3. **No transfer fee or status endpoint.** Fallback: don't show a fee; the result screen reflects the transfer response only.
4. **No customer top-up endpoint.** Fallback: "Add money" shows the Safe Haven account number to pay into.
5. **No list endpoints for giveaways, rewards or merchant purchases.** Fallback: show only items created on this device, or wait for list routes.
6. **No notifications endpoint and no sign-up OTP.** Fallback: no bell icon; OTP only in password reset.
7. **Promo status values:** only `ACTIVE` is documented. Pause/Activate assumes an inactive value exists; confirm it with the backend.
8. **Program expiry:** only `NEVER` is documented.

---

## 5. Build order (one branch or PR per step)

1. Tokens, fonts and shared components (section 2), plus the dark theme and the header glow.
2. Access: Onboarding, Login, Register, ResetPassword, MerchantRegister.
3. Customer tabs: Home, Explore, Rewards, Wallet, Profile.
4. Customer money: SelectPurchase, PayWithPoints, SendPoints, Transfer + ConfirmSheet, TransferStatus, VerifyIdentity.
5. Merchant: Overview, Programs, CreateProgram, CustomerLookup, AwardPoints, ReverseAward, Giveaway, Promotions, Activity, Business.
6. Polish: loading skeletons, error and empty states, accessibility labels, duplicate-submit protection on every money or points action.
