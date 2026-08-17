## ADDED Requirements

### Requirement: TimelineCard component renders a single event
The system SHALL provide a `TimelineCard` React component in `packages/ui/src/timeline/TimelineCard.tsx`. It SHALL accept props: `event: TimelineEventDisplay`, `onBookmark?: () => void`, `onPin?: () => void`, `onClick?: () => void`. It SHALL render: event type icon, title, subtitle, timestamp (relative and absolute), severity badge, tags, and action buttons.

#### Scenario: Rendering a prescription event card
- **WHEN** `<TimelineCard event={prescriptionEvent} />` is rendered
- **THEN** the card SHALL show a pill icon, prescription title, doctor name as subtitle, relative timestamp ("2 hours ago"), and a "PRESCRIPTION" category badge

#### Scenario: Critical severity event card
- **WHEN** a `TimelineCard` renders an event with `severity: 'CRITICAL'`
- **THEN** the card SHALL display a red border and a "⚠ Critical" badge

### Requirement: TimelineGroup component groups events by date or category
The system SHALL provide `TimelineGroup` in `packages/ui/src/timeline/TimelineGroup.tsx` accepting `{ label: string, events: TimelineEventDisplay[], children?: ReactNode }`. It SHALL render a collapsible group header with event count badge.

#### Scenario: Collapsed group
- **WHEN** user clicks the group header
- **THEN** the event cards within SHALL animate collapse/expand using Framer Motion or CSS transition

### Requirement: TimelineFilters component provides filterable controls
The system SHALL provide `TimelineFilters` in `packages/ui/src/timeline/TimelineFilters.tsx` with controlled filter state: date range picker, category multi-select checkboxes, severity dropdown, module dropdown, free-text search input. Filters SHALL debounce at 300ms before firing `onFiltersChange` callback.

#### Scenario: User applies date range filter
- **WHEN** user selects `dateFrom=2026-01-01` and `dateTo=2026-06-30` in the filter panel
- **THEN** `onFiltersChange({ dateFrom, dateTo })` SHALL be called after 300ms debounce
- **THEN** the parent component SHALL re-fetch the timeline with these filter params

### Requirement: Timeline list supports infinite scroll with virtualization
The system SHALL provide `TimelineInfiniteScroll` in `packages/ui/src/timeline/TimelineInfiniteScroll.tsx` using `react-virtual` or `@tanstack/react-virtual` for row virtualization. It SHALL use an Intersection Observer to trigger cursor-paginated fetches when the user scrolls within 200px of the list bottom.

#### Scenario: Initial render with 50 events
- **WHEN** the timeline initially loads with 50 events
- **THEN** only the visible events (approximately 10) SHALL be rendered in the DOM
- **THEN** as the user scrolls, additional DOM nodes SHALL be mounted

#### Scenario: Fetching next page at scroll boundary
- **WHEN** the Intersection Observer fires at the 200px threshold
- **THEN** the component SHALL call `onLoadMore()` with the current `nextCursor`
- **THEN** a skeleton loader SHALL appear below the existing events during the fetch

### Requirement: All components are accessible (WCAG 2.1 AA)
Timeline components SHALL meet WCAG 2.1 Level AA standards: keyboard navigable (Tab/Enter/Arrow keys), correct ARIA roles (`role="feed"` for the timeline list, `role="article"` for each card), screen reader announcements for new events loaded, minimum 4.5:1 color contrast ratio on text, and focus visible rings on all interactive elements.

#### Scenario: Keyboard navigation through events
- **WHEN** a user tabs to the timeline list and uses Arrow Down
- **THEN** focus SHALL move to the next `TimelineCard`
- **THEN** the card SHALL be visually highlighted with a focus ring
