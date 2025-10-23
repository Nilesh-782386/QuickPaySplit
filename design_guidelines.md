# QuickPay - Design Guidelines

## Design Approach

**Selected Approach:** Design System (Utility-Focused Financial Application)

**System Reference:** Material Design + Stripe-inspired minimalism for financial trust and clarity

**Design Principles:**
- Clarity over decoration - financial data must be instantly readable
- Trust through simplicity - clean, professional aesthetic
- Speed of interaction - minimal clicks, immediate feedback
- Mobile-first responsive design

---

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Background: 240 15% 95% (soft gray)
- Container/Surface: 0 0% 100% (white)
- Primary Action: 207 90% 54% (trustworthy blue)
- Primary Hover: 207 90% 45%
- Success/Positive Balance: 145 63% 42% (green)
- Error/Negative Balance: 4 90% 58% (red)
- Warning/Settlement: 4 90% 58% (red for settle action)
- Neutral/Zero State: 210 7% 56% (gray)
- Text Primary: 210 11% 15% (dark gray)
- Text Secondary: 210 9% 45% (medium gray)
- Border: 210 14% 89% (light gray)

**Dark Mode:**
- Background: 222 14% 12%
- Container/Surface: 222 14% 18%
- Primary Action: 207 90% 61%
- Success: 145 63% 49%
- Error: 4 90% 65%
- Text Primary: 210 17% 98%
- Text Secondary: 210 9% 71%
- Border: 222 14% 28%

### B. Typography

**Font Stack:** 
- Primary: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- Numbers/Currency: "SF Mono", Monaco, Consolas, monospace (for alignment and clarity)

**Hierarchy:**
- App Title: 28px, 700 weight
- Balance Display: 36px, 700 weight (hero metric)
- Section Headings: 18px, 600 weight
- Transaction Amount: 16px, 600 weight, monospace
- Body Text: 16px, 400 weight
- Metadata/Dates: 14px, 400 weight
- Small Text: 12px, 400 weight

### C. Layout System

**Spacing Units:** Tailwind units of 2, 4, 6, 8, 12, 16, 20 (p-2, m-4, space-y-6, etc.)

**Container Strategy:**
- Max width: max-w-md (448px) for optimal mobile-to-desktop experience
- Padding: p-4 on mobile, p-6 on desktop
- Gaps: space-y-4 for form elements, space-y-3 for transaction list
- Border radius: rounded-lg (8px) for containers, rounded-md (6px) for inputs

**Grid System:**
- Single column layout (financial apps benefit from focused, linear flow)
- Transaction history: stacked list with clear separation
- Form fields: full-width for easy mobile interaction

### D. Component Library

**Balance Display Card:**
- Large, prominent positioning at top of app
- Dynamic color background based on balance state (positive/negative/zero)
- Centered text with icon indicators (↑ ↓ ✓)
- Animated number transitions when balance updates
- Shadow: shadow-lg for elevation

**Expense Input Form:**
- Grouped in clean white card with subtle shadow
- Select dropdown for payer (custom styled, not native)
- Number input with currency symbol (₹) placeholder
- Text input for description with character counter
- Primary button: full-width, bold, with loading state
- Form validation with inline error messages

**Transaction List Items:**
- Left accent border (4px) colored by transaction type
- Card-style with subtle background (gray-50 light mode, gray-800 dark mode)
- Layout: payer name (bold) | amount + description | timestamp
- Hover state: subtle background change and shadow lift
- Empty state: illustration + encouraging message

**Settlement Button:**
- Destructive styling (red) to indicate action weight
- Requires confirmation modal before executing
- Full-width placement in dedicated section
- Icon: refresh/checkmark animation on success

**Navigation/Header:**
- Fixed or sticky positioning for app title and user info
- Minimal height to maximize content space
- Logout button (text-only, right-aligned)

### E. Interactions & Micro-animations

**Use Sparingly:**
- Balance number counting animation (when new expense added)
- Success checkmark animation after expense submission
- Subtle slide-in for new transactions at top of list
- Loading spinner states (inline for buttons, overlay for full page)
- Smooth color transitions for balance card (300ms ease)

**NO excessive animations** - financial data requires stability

---

## Key UI Patterns

**Balance Visualization:**
- Dominant card at top showing net balance
- Clear typography: "[Name] owes [Name]" with amount in large numbers
- Visual indicator: green background = you're owed, red = you owe, gray = settled
- Include small text showing last transaction timestamp

**Transaction Flow:**
- Add expense form immediately visible (no hidden tabs)
- Instant validation feedback
- Success message with updated balance preview
- Auto-clear form after submission

**Transaction History:**
- Most recent first (reverse chronological)
- Infinite scroll or "Load more" if needed
- Each item shows: payer badge, amount (monospace), description, relative time
- Subtle separators between items (not heavy borders)

**Responsive Behavior:**
- Mobile: full-width cards, stacked layout, larger touch targets (min 44px)
- Desktop: centered container, slightly increased padding, better use of whitespace

---

## Accessibility

- Maintain WCAG AA contrast ratios (4.5:1 minimum for text)
- Focus indicators on all interactive elements (blue ring, 3px offset)
- Semantic HTML (proper headings, form labels, button roles)
- Screen reader announcements for balance updates
- Dark mode respects user system preferences
- Touch targets minimum 44x44px for mobile

---

## Images

**No hero images required** - this is a utility application where data is the hero

**Optional illustrations:**
- Empty state for transactions (simple line art, 200x200px)
- Settlement success animation (confetti or checkmark, subtle)
- 404/error states (friendly, minimal illustrations)

All illustrations should be: simple, two-tone, aligned with brand blue