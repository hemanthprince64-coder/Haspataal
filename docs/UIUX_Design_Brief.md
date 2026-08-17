# Haspataal - UI/UX Design Brief

## 1. Design Philosophy

### Core Principles
- **Trust & Professionalism**: Medical applications demand seriousness and reliability. Design should feel clinical, trustworthy, and premium.
- **Clarity Over Creativity**: Information hierarchy is critical. Clear typography, ample whitespace, and obvious navigation.
- **Inclusive & Accessible**: WCAG 2.1 AA compliance minimum. Age-inclusive (18-80). Support for low vision, color blindness.
- **Efficiency First**: Minimize clicks, maximize information density without clutter. Healthcare workers are time-pressed.
- **Indian Context**: Hindi support planned, culturally relevant imagery, pincode-based workflows.

### Emotional Design Goals
- **Patients**: Feel cared for, confident, in control of their health
- **Doctors**: Feel empowered, efficient, focused on care (not admin)
- **Hospital Staff**: Feel organized, productive, supported

---

## 2. Visual Design Language

### 2.1 Color Palette

#### Primary Colors (Trust & Medical)
| Color Name | Hex | RGB | Usage |
|------------|-----|-----|-------|
| **Medical Blue** | `#0EA5E9` | 14, 165, 233 | Primary buttons, links, active states |
| **Deep Navy** | `#0F172A` | 15, 23, 42 | Headers, primary text |
| **Teal Accent** | `#14B8A6` | 20, 184, 166 | Success states, positive indicators |

#### Neutral Colors (Readability)
| Color Name | Hex | Usage |
|------------|-----|-------|
| **Background** | `#F8FAFC` (light) / `#0C1222` (dark) | Page background |
| **Surface** | `#FFFFFF` (light) / `#1E293B` (dark) | Cards, modals |
| **Border** | `#E2E8F0` (light) / `#334155` (dark) | Input borders, dividers |
| **Muted** | `#64748B` | Secondary text, disabled |
| **Text Primary** | `#0F172A` (light) / `#F1F5F9` (dark) | Headings, body |
| **Text Secondary** | `#475569` (light) / `#94A3B8` (dark) | Subtitles, hints |

#### Semantic Colors
| Purpose | Hex | Notes |
|---------|-----|-------|
| **Success** | `#22C55E` | Appointments confirmed, records updated |
| **Warning** | `#F59E0B` | Pending approvals, attention needed |
| **Danger** | `#EF4444` | Cancellations, errors, blocked |
| **Info** | `#3B82F6` | Informational alerts, hints |

#### Gradient Options
- **Primary Gradient**: `linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)`
- **Success Gradient**: `linear-gradient(135deg, #10B981 0%, #14B8A6 100%)`

### 2.2 Typography

#### Font Families
- **Primary Font**: Inter (sans-serif) - UI text, buttons, forms
- **Display Font**: Plus Jakarta Sans (headings, hero sections)
- **Mono Font**: JetBrains Mono (code snippets, technical content)

#### Type Scale (rem units, base 16px)
| Style | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| **H1** | 2.5rem (40px) | 700 | 1.2 | Page titles |
| **H2** | 2rem (32px) | 600 | 1.3 | Section headers |
| **H3** | 1.5rem (24px) | 600 | 1.4 | Card titles, subsections |
| **H4** | 1.25rem (20px) | 600 | 1.5 | Dialog titles, table headers |
| **Body Large** | 1.125rem (18px) | 400 | 1.6 | Intro paragraphs, feature text |
| **Body** | 1rem (16px) | 400 | 1.6 | Default text |
| **Body Small** | 0.875rem (14px) | 400 | 1.5 | Helper text, captions |
| **Caption** | 0.75rem (12px) | 400 | 1.4 | Labels, timestamps |

### 2.3 Spacing System

**Base unit**: 4px (0.25rem)

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Fine tuning |
| `space-2` | 8px | Icon spacing |
| `space-3` | 12px | Tight gaps |
| `space-4` | 16px | Default gap |
| `space-6` | 24px | Section spacing |
| `space-8` | 32px | Between sections |
| `space-12` | 48px | Page margins |
| `space-16` | 64px | Large containers |

### 2.4 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 4px | Small badges, tags |
| `radius-md` | 6px | Buttons, inputs |
| `radius-lg` | 8px | Cards, modals |
| `radius-xl` | 12px | Large dialogs |
| `radius-full` | 9999px | Avatars, pills |

### 2.5 Shadows

Use subtle, depth-creating shadows:
- **xs**: `0 1px 2px rgba(0,0,0,0.05)` - Cards
- **sm**: `0 2px 4px rgba(0,0,0,0.08)` - Dropdowns
- **md**: `0 4px 12px rgba(0,0,0,0.12)` - Modals
- **lg**: `0 8px 24px rgba(0,0,0,0.16)` - Hero elements

---

## 3. Component Design System

### 3.1 Buttons

#### Variants
- **Primary** (`btn-primary`): Blue background, white text, rounded-md
- **Secondary** (`btn-secondary`): White/transparent with border, colored text
- **Ghost** (`btn-ghost`): Transparent, hover:bg-muted
- **Destructive** (`btn-destructive`): Red background, white text

#### Sizes
- **sm**: 32px height, padding-x: 12px
- **md**: 40px height, padding-x: 16px (default)
- **lg**: 48px height, padding-x: 24px

**Example Usage:**
```tsx
<Button variant="primary" size="md">Book Appointment</Button>
<Button variant="outline" size="sm">Cancel</Button>
<Button variant="ghost">Learn More</Button>
```

### 3.2 Forms

#### Input Fields
- Border: 1px solid `border` color
- Focus ring: 2px solid `primary` with offset
- Padding: 10px 12px
- Placeholder: `muted-foreground`
- Error state: Red border + error message below

#### Select Dropdown
- Similar to input, with chevron icon
- Styled options with hover states
- Custom scrollbar

#### Checkboxes & Radio
- Custom styled using Radix UI
- Accessible labels
- Indeterminate state for checkboxes

### 3.3 Cards

#### Card Component
- White/dark-surface background
- Subtle border
- Rounded-lg (8px)
- Padding: 6 (24px)
- Shadow-sm

**Variants:**
- **Elevated**: Shadow-md, for feature highlights
- **Outlined**: Border only, for lists
- **Interactive**: Hover effect (slight lift + shadow)

### 3.4 Tables

**Table Styles:**
- Sticky header
- Zebra striping optional (hover only)
- Row hover: bg-muted/50
- Cell padding: 12px 16px
- Border-bottom: 1px solid border
- Status badges in last column

**Example:**
| Doctor | Specialization | Status | Actions |
|--------|----------------|--------|---------|
| Dr. Rajesh Kumar | Cardiology | Active | Edit • Delete |

### 3.5 Badges & Tags

**Badge Component** (`badge`):
- Small, pill-shaped
- Background: muted, text: foreground
- Variants by intent:
  - `default`: gray
  - `secondary`: light gray
  - `success`: green
  - `warning`: yellow
  - `danger`: red

**Status Examples:**
- `<Badge variant="success">Active</Badge>`
- `<Badge variant="warning">Pending</Badge>`
- `<Badge variant="danger">Cancelled</Badge>`

### 3.6 Navigation

#### Sidebar (Hospital Portal)
- Fixed left sidebar (250px width)
- Dark or light surface with subtle border-right
- Logo at top
- Navigation items:
  - Icon + label
  - Active state: primary color background/text
  - Hover: bg-muted
- Collapsible on mobile (hamburger menu)

#### Topbar (All Portals)
- Fixed top bar (60px height)
- Contains:
  - Portal logo/brand
  - Search bar (optional, expandable)
  - Notifications bell (with badge)
  - User avatar dropdown (Profile, Settings, Logout)
- Shadow-sm for separation

#### Mobile Navigation
- Bottom tab bar (iOS style)
- 4-5 main tabs max
- Floating action button (FAB) for primary action (e.g., "Book")
- Slide-in drawer for secondary navigation

### 3.7 Modals & Dialogs

- Backdrop: bg-black/50
- Centered modal (max-w-2xl)
- Header with title + close button
- Body with scroll if overflow
- Footer with action buttons (primary left-aligned, secondary right-aligned)
- Close on backdrop click + Escape key

### 3.8 Loaders & Skeleton States

**Spinners:**
- Small: 16px, for inline loading
- Default: 32px, centered
- Full-page overlay

**Skeleton Loaders:**
- Pulse animation (`animate-pulse`)
- Gray background with shimmer effect
- Match component shape (card skeleton, table skeleton)

---

## 4. Layout Patterns

### 4.1 Dashboard Layout (Hospital)

```
+---------------------------------------------------+
|  Topbar (logo, search, user, notifications)      |
+---------------------------------------------------+
| Sidebar |                                         |
|  Nav     |     Main Content Area                  |
|  Items   |     - KPI Cards (grid)                 |
|          |     - Charts                           |
|          |     - Recent Activity Table            |
+----------+-----------------------------------------+
```

**Sidebar:** Fixed 250px, collapsible to icons-only
**Main Content:** Padding: 6 (24px)
**Responsive:** Sidebar becomes drawer on tablet + mobile

### 4.2 Card Grid Layout

**Doctor Search Results:**
```
+-----------+ +-----------+ +-----------+
| Doctor    | | Doctor    | | Doctor    |
| Card 1    | | Card 2    | | Card 3    |
+-----------+ +-----------+ +-----------+
| Doctor    | | Doctor    | | Doctor    |
| Card 4    | | Card 5    | | Card 6    |
+-----------+ +-----------+ +-----------+
```

- Grid: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- Gap: 6 (24px)

### 4.3 Form Layout

**Single Column (Mobile-First):**
```
[Label]
[Input Field]
[Helper Text / Error]
```

**Two Column (Desktop):**
```
[Label]           [Label]
[Input]           [Input]
[Helper/Error]    [Helper/Error]
```

---

## 5. Iconography

### Icon Set
- **Lucide React** - Primary icon library (stroke-based, consistent)
- **Heroicons** (optional) - Alternative set

**Common Icons:**
- Home, Calendar, Users, Settings, Search, Bell, Menu, X, Chevron, Plus, Edit, Trash, Phone, Mail, MapPin, Clock, CheckCircle, XCircle, AlertCircle

**Sizing:**
- `size-4` (16px) - Small icons in text
- `size-5` (20px) - Default for buttons
- `size-6` (24px) - Large icons in headings

---

## 6. Imagery & Illustrations

### Medical Imagery
- Use **Unsplash** medical photos (via `images.unsplash.com`)
- People: Diverse ages, ethnicities, genders
- Settings: Hospitals, clinics, clean environments
- Avoid overused stock; aim for authentic moments

### Illustrations (Optional)
- Custom SVG illustrations for:
  - Empty states (no appointments, no results)
  - Success states (booking confirmed)
  - Onboarding screens

**Style:** Simple line art, using primary brand colors

---

## 7. Dark Mode

### Color Adaptations

| Component | Light Mode | Dark Mode |
|-----------|------------|-----------|
| Background | `#F8FAFC` | `#0C1222` |
| Surface | `#FFFFFF` | `#1E293B` |
| Text Primary | `#0F172A` | `#F1F5F9` |
| Border | `#E2E8F0` | `#334155` |
| Input BG | `#FFFFFF` | `#1E293B` |
| Muted | `#64748B` | `#94A3B8` |

**Implementation:**
- Tailwind `dark:` variants
- CSS variables in `globals.css`
- `darkMode: 'class'` strategy in `tailwind.config.ts`
- Toggle in user settings (remember preference in localStorage)

---

## 8. Responsive Breakpoints

| Breakpoint | Width | Target Devices |
|------------|-------|----------------|
| **Mobile S** | < 640px | Phones (small) |
| **Mobile** | ≥ 640px | Phones (standard) |
| **Tablet** | ≥ 768px | Tablets, large phones |
| **Laptop** | ≥ 1024px | Laptops, small desktops |
| **Desktop** | ≥ 1280px | Full HD monitors |
| **Wide** | ≥ 1536px | Large screens |

**Mobile-First Approach:**
- Write base styles for mobile
- Use `md:`, `lg:` prefixes for larger screens
- Test on real devices

---

## 9. Accessibility (A11y)

### Keyboard Navigation
- All interactive elements reachable via Tab
- Focus visible with clear ring (2px solid primary)
- Logical tab order (visual → top-left → bottom-right)
- Skip to main content link (visually hidden until focused)

### Screen Reader
- Semantic HTML (header, nav, main, section, article)
- Proper heading hierarchy (h1 → h2 → h3, don't skip)
- ARIA labels where needed (icons, custom controls)
- `aria-live` regions for dynamic content (notifications)
- `role="alert"` for error messages

### Color Contrast
- Minimum 4.5:1 for normal text (WCAG AA)
- 3:1 for large text (18px+ or 14px+ bold)
- Tools: Stark plugin, WebAIM Contrast Checker

### Other
- No flashing content (> 3 flashes/second) - avoid seizures
- Alternative text for images
- Form labels always visible (not placeholder-only)
- Error messages descriptive (not just "Invalid")

---

## 10. Microinteractions & Animation

### Principles
- Subtle, purposeful animations
- 200-300ms duration (ease-out)
- Don't slow down critical flows

### Animation Library
- **Framer Motion** - For complex transitions
- **Tailwind Animate** - For simple transitions (hover, focus)

### Common Animations
- **Page transitions**: Fade + slide
- **Modal open/close**: Scale + fade
- **List items**: Staggered fade-in on load
- **Button clicks**: Subtle scale down
- **Loading states**: Smooth skeleton fade-in

### Performance
- `prefers-reduced-motion` media query support
- Hardware-accelerated transforms (translate, scale, opacity)
- Avoid animating box-shadow or layout thrashing

---

## 11. Design Deliverables

### Components to Build (shadcn/ui)
Already installed base components. Need to customize:

#### Required Custom Components
1. **DoctorCard** - For search results
2. **AppointmentCard** - Patient's appointment list
3. **KPI Card** - Dashboard metrics
4. **StatusBadge** - Appointment/doctor status
5. **DatePicker** - Calendar for booking
6. **TimeSlotGrid** - Available time slots
7. **Timeline** - Care journey milestones
8. **Sidebar** - Hospital portal navigation
9. **Topbar** - Global navigation
10. **EmptyState** - No data placeholders
11. **ErrorState** - Error messages
12. **OnboardingWizard** - Multi-step form
13. **SearchFilter** - Doctor search filters sidebar
14. **ReportChart** - Analytics visualizations
15. **DataTable** - Advanced table with sorting/filtering

### Pages to Design (Figma / Design Tool)
1. **Landing Page** - Hero + portal selection
2. **Patient Portal Home** - Dashboard with upcoming appointments
3. **Doctor Search** - Results grid with filters
4. **Doctor Profile** - Detailed view + booking
5. **Booking Flow** - Date/time selection + confirmation
6. **Appointments List** - Upcoming/past with actions
7. **Care Journey List & Detail**
8. **Patient Profile** - Edit form
9. **Hospital Login** - Simple auth form
10. **Hospital Dashboard** - KPIs + charts
11. **Doctors Management** - Table + CRUD modal
12. **Appointments Management** - Calendar + table
13. **Care Journeys (Hospital)** - Create + manage
14. **Reports Dashboard** - Charts + filters
15. **Hospital Settings** - Profile + preferences
16. **Admin Dashboard** - Platform metrics
17. **Admin Hospitals List** - Table with actions
18. **404 & Error Pages**

---

## 12. Design Tokens (Tailwind Config)

```javascript
// tailwind.config.ts
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDCFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
        },
        medical: {
          blue: '#0EA5E9',
          teal: '#14B8A6',
          navy: '#0F172A',
        },
        // ... other custom colors
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '4': '4px',
        '6': '6px',
        '8': '8px',
        '12': '12px',
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(0,0,0,0.05)',
        'sm': '0 2px 4px rgba(0,0,0,0.08)',
        'md': '0 4px 12px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
```

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-12  
**Owner**: Haspataal Design Team  
**Tools**: Figma (design files), Storybook (component library), Chromatic (visual tests)
