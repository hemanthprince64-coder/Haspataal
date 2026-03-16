# UI/UX Pro Max — Haspataal Design Intelligence
# Inspired by the UI/UX Pro Max skill concept — built from scratch for Haspataal's healthcare platform
# Covers: 50+ UI styles, healthcare color systems, 21 palettes, 50 font pairings, Next.js/Tailwind patterns

## When to Use This Skill
Invoke BEFORE writing any frontend component, page, or layout. This is your design system bible.

---

## 🎨 PART 1: UI STYLE DATABASE (50+ styles)

### Healthcare-Specific Styles (USE THESE for Haspataal)

#### 1. Medical Glassmorphism (PRIMARY STYLE for Haspataal)
```css
/* Frosted glass with clinical precision */
background: rgba(255, 255, 255, 0.08);
backdrop-filter: blur(20px) saturate(180%);
-webkit-backdrop-filter: blur(20px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.12);
border-radius: 16px;
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.1);
```
```tsx
// Tailwind equivalent
className="bg-white/8 backdrop-blur-xl border border-white/12 rounded-2xl shadow-2xl"
```

#### 2. Clinical Dark (Doctor/Hospital dashboards)
- Background: `#0a0f1a` (near-black with blue tint)
- Cards: `#111827` with `border: 1px solid #1f2937`
- Accent: Cyan `#06b6d4` for interactive elements
- Success: Emerald `#10b981` (vitals positive)
- Warning: Amber `#f59e0b` (attention needed)
- Critical: Red `#ef4444` (emergency)

#### 3. Soft Medical (Patient Portal — approachable, not clinical)
- Background: `#f8fafc` (cool white)
- Cards: `#ffffff` with soft shadow
- Primary: Indigo `#6366f1`
- Secondary: Teal `#14b8a6`
- Text: `#1e293b`

#### 4. Trust Blue (Admin Control Panel)
- Background: `#0f172a`
- Cards: dark violet `#1e1b4b`
- Accent: Violet `#7c3aed`
- Badge: Purple gradient

---

### 50+ General UI Styles Reference

| Style | Best For | Key Property |
|---|---|---|
| **Glassmorphism** | Dashboards | `backdrop-blur-xl` |
| **Neumorphism** | Buttons, controls | Soft double shadows |
| **Bento Grid** | Stat cards, features | Asymmetric grid |
| **Neobrutalism** | Marketing, CTAs | Bold borders + offsets |
| **Aurora UI** | Hero sections | Animated gradients |
| **Frosted Cards** | Overlays, modals | `bg-white/10` |
| **Material Dark** | Admin panels | Elevation shadows |
| **Claymorphism** | Mobile/friendly UI | 3D inflated look |
| **Gradient Mesh** | Backgrounds | Multi-point gradients |
| **Monochrome Pro** | Professional dashboards | Single hue + opacity |
| **Carbon Dark** | Developer tools | Pure black + mono |
| **Holographic** | Premium features/badges | Iridescent gradients |
| **Soft UI** | Patient-facing | Pastel + rounded |
| **Editorial** | Reports, PDFs | Typography-first |
| **Data Viz** | Analytics, charts | Chart-optimized dark |

---

## 🔵 PART 2: HASPATAAL COLOR SYSTEM

### Healthcare Color Palette (PRIMARY)
```css
/* Haspataal Design Tokens */
:root {
  /* Brand */
  --color-brand-primary: #06b6d4;     /* Cyan — trust + medical */
  --color-brand-secondary: #6366f1;   /* Indigo — professional */
  --color-brand-accent: #10b981;      /* Emerald — health/success */

  /* Semantic */
  --color-critical: #ef4444;          /* Emergency */
  --color-warning: #f59e0b;           /* Alert */
  --color-success: #10b981;           /* Healthy */
  --color-info: #3b82f6;              /* Informational */

  /* Surfaces (Dark) */
  --surface-base: #0a0f1a;
  --surface-card: #111827;
  --surface-elevated: #1f2937;
  --surface-overlay: rgba(255,255,255,0.05);

  /* Text */
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;

  /* Borders */
  --border-subtle: rgba(255,255,255,0.08);
  --border-default: rgba(255,255,255,0.12);
  --border-emphasis: rgba(99,102,241,0.4);
}
```

### 21 Curated Color Palettes

| # | Palette Name | Primary | Secondary | Best For |
|---|---|---|---|---|
| 1 | **Medical Cyan** | `#06b6d4` | `#0e7490` | Doctor dashboards |
| 2 | **Healing Emerald** | `#10b981` | `#059669` | Appointment success |
| 3 | **Trust Indigo** | `#6366f1` | `#4338ca` | Admin control panel |
| 4 | **Alert Amber** | `#f59e0b` | `#d97706` | Warnings/pending |
| 5 | **Critical Red** | `#ef4444` | `#dc2626` | Emergencies |
| 6 | **Ocean Teal** | `#14b8a6` | `#0d9488` | Patient portal |
| 7 | **Royal Violet** | `#7c3aed` | `#6d28d9` | Premium features |
| 8 | **Carbon Night** | `#1f2937` | `#111827` | Base dark theme |
| 9 | **Sunset Orange** | `#f97316` | `#ea580c` | Onboarding |
| 10 | **Silver Mono** | `#e5e7eb` | `#9ca3af` | Print/reports |
| 11 | **Neon Cyan** | `#22d3ee` | `#06b6d4` | Live status |
| 12 | **Soft Lavender** | `#a78bfa` | `#8b5cf6` | Female health |
| 13 | **Forest Green** | `#22c55e` | `#16a34a` | Vitals positive |
| 14 | **Ice Blue** | `#bae6fd` | `#7dd3fc` | Patient-facing light |
| 15 | **Warm White** | `#f8fafc` | `#f1f5f9` | Patient light mode |
| 16 | **Blood Red** | `#dc2626` | `#b91c1c` | Critical alerts |
| 17 | **Gold Premium** | `#fbbf24` | `#f59e0b` | Commission/billing |
| 18 | **Deep Navy** | `#1e3a5f` | `#0f172a` | Hospital admin |
| 19 | **Mint Fresh** | `#6ee7b7` | `#34d399` | Lab results clean |
| 20 | **Charcoal Pro** | `#374151` | `#1f2937` | Professional neutral |
| 21 | **Pink Care** | `#f472b6` | `#ec4899` | Maternal/pediatric |

---

## 🔤 PART 3: FONT PAIRINGS

### Recommended for Haspataal (Top 5)
```tsx
// 1. PREMIUM — Inter + DM Sans (CURRENT CHOICE)
import { Inter, DM_Sans } from 'next/font/google'
const heading = DM_Sans({ weight: ['600','700'], subsets: ['latin'] })
const body = Inter({ weight: ['400','500'], subsets: ['latin'] })
// Use: DM_Sans for all headings, Inter for body text

// 2. CLINICAL — Geist + Geist Mono (Next.js native)
import { Geist, Geist_Mono } from 'next/font/google'

// 3. TRUSTWORTHY — Plus Jakarta Sans + Outfit
import { Plus_Jakarta_Sans, Outfit } from 'next/font/google'

// 4. MODERN MEDICAL — Sora + Noto Sans
import { Sora, Noto_Sans } from 'next/font/google'

// 5. EDITORIAL — Fraunces + Manrope (premium reports)
import { Fraunces, Manrope } from 'next/font/google'
```

### Full 50 Font Pairing Reference
| # | Heading | Body | Mood |
|---|---|---|---|
| 1 | DM Sans 700 | Inter 400 | **Haspataal default** |
| 2 | Geist 600 | Geist Mono | Developer/admin |
| 3 | Plus Jakarta Sans | Outfit | Friendly medical |
| 4 | Sora | Noto Sans | Modern clean |
| 5 | Fraunces | Manrope | Editorial/reports |
| 6 | Bricolage Grotesque | Inter | Bold/marketing |
| 7 | Cabinet Grotesk | DM Sans | Startup premium |
| 8 | Clash Display | Work Sans | Statement |
| 9 | Neue Montreal | Inter | Minimalist pro |
| 10 | Satoshi | Inter | Versatile clean |

---

## 📐 PART 4: NEXT.JS + TAILWIND COMPONENT PATTERNS

### Stat Card (Glassmorphism — Haspataal Standard)
```tsx
interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  gradient: string;
  trend?: string;
}

export function StatCard({ label, value, icon, gradient, trend }: StatCardProps) {
  return (
    <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/8 hover:border-white/20 transition-all duration-300 group">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
      {trend && <p className="text-xs text-emerald-400 mt-2">{trend}</p>}
    </div>
  );
}
```

### Data Table (Clinical Dark)
```tsx
className="w-full text-sm"
// Header row:
className="text-gray-500 text-xs uppercase tracking-wider border-b border-white/8"
// Body rows:
className="divide-y divide-white/5"
// Row hover:
className="hover:bg-white/5 transition-colors cursor-pointer"
// Status badge:
className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400"
```

### Sidebar Nav (Haspataal Standard)
```tsx
// Active item:
className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 font-medium text-sm border border-cyan-500/20"
// Inactive item:
className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white text-sm transition-all duration-200"
```

### Form Input (Medical Standard)
```tsx
className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
```

### Primary Button
```tsx
className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-cyan-500/25"
```

### Modal / Dialog
```tsx
// Overlay
className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
// Modal panel
className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6"
```

---

## ✅ PART 5: PRE-DELIVERY UX CHECKLIST

Before marking any UI component as done, verify ALL:

### Accessibility (A11y)
- [ ] Color contrast ratio ≥ 4.5:1 for body text, ≥ 3:1 for large text
- [ ] All interactive elements have `aria-label` or visible text
- [ ] Focus ring visible on keyboard navigation (`focus:ring-2`)
- [ ] Images have `alt` attributes
- [ ] Form inputs have associated `<label>` elements

### Responsive Design
- [ ] Works on mobile (375px), tablet (768px), desktop (1440px)
- [ ] Text doesn't overflow or truncate unexpectedly
- [ ] Tap targets ≥ 44×44px on mobile
- [ ] No horizontal scroll on mobile

### Performance
- [ ] Images use `next/image` with `width`, `height`, or `fill`
- [ ] Fonts loaded via `next/font/google` (no FOUT)
- [ ] Heavy components are lazy-loaded (`dynamic(() => import(...))`)
- [ ] Animations use `transform`/`opacity` only (GPU-composited)

### Interaction Feedback
- [ ] Buttons have hover + active states
- [ ] Loading states for async operations (skeleton or spinner)
- [ ] Error states shown clearly (not just console.log)
- [ ] Success feedback after form submissions
- [ ] Tooltips on icon-only buttons

### Healthcare-Specific
- [ ] Critical data (emergencies, low vitals) uses red — never green
- [ ] Confirm dialogs before destructive actions (cancel appointment, discharge)
- [ ] Patient PII masked in tables (show partial phone/email)
- [ ] Timestamps in IST format (Indian Standard Time)
- [ ] Currency in INR with ₹ symbol, never `$`

---

## 🌟 PART 6: MICRO-ANIMATIONS (Tailwind)

```tsx
// Fade in on mount
className="animate-in fade-in duration-300"

// Slide up cards
className="animate-in slide-in-from-bottom-4 duration-500"

// Pulse for live status
className="animate-pulse"

// Spin for loading
className="animate-spin"

// Hover scale (stat cards)
className="hover:scale-[1.02] transition-transform duration-200"

// Hover lift (clickable cards)
className="hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"

// Shimmer skeleton
className="animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] animate-shimmer"
```

---

## 🏥 PART 7: HEALTHCARE UX RULES (Non-negotiable)

1. **Vitals color coding**: Green=normal, Yellow=borderline, Red=critical. Never invert.
2. **Error messages**: Always explain what to DO, not just what went wrong.
3. **Appointment status**: Use pill badges — BOOKED (blue), CONFIRMED (green), CANCELLED (red), COMPLETED (gray).
4. **Empty states**: Always show a helpful illustration + action — never blank white.
5. **Loading**: Show skeleton screens, not spinners, for data-heavy tables.
6. **Time display**: "Today 10:30 AM" not "2026-03-16T05:00:00Z".
7. **Numbers**: Lakhs/Crores format for Indian users — ₹2,40,000 not ₹240,000.
8. **Multilingual**: Keep text labels in component props, not hardcoded — enables Hindi support.
9. **Trust signals**: Show doctor credentials (MBBS, MD) prominently. Never hide verification status.
10. **Confirmations**: Appointment booking → show recap screen before final submit.

---
*Built for Haspataal — inspired by UI/UX Pro Max skill concept. Stack: Next.js 16 + Tailwind CSS 3.4 + TypeScript.*
