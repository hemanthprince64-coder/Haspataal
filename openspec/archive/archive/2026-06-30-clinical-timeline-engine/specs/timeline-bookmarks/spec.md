## ADDED Requirements

### Requirement: Users can bookmark timeline events
The system SHALL provide `POST /api/timeline/bookmarks` allowing patients and doctors to bookmark a `TimelineEvent`. Bookmarks SHALL be stored in the `TimelineBookmark` table with `userId`, `eventId`, and optional `note`. `GET /api/timeline/bookmarks` SHALL return all bookmarks for the authenticated user.

#### Scenario: Doctor bookmarks a critical lab result
- **WHEN** a doctor calls `POST /api/timeline/bookmarks` with `{ eventId, note: "Watch next visit" }`
- **THEN** a `TimelineBookmark` row SHALL be created
- **THEN** the event SHALL appear in `GET /api/timeline/bookmarks` for that doctor

#### Scenario: Duplicate bookmark
- **WHEN** a user bookmarks an already-bookmarked event
- **THEN** the system SHALL return `409 Conflict` with `"Already bookmarked"`

### Requirement: Users can pin critical timeline events
The system SHALL allow doctors and admins to pin events via `PATCH /api/timeline/events/[id]/pin` setting `isPinned: true` on the `TimelineEvent`. Pinned events SHALL always appear at the top of timeline views regardless of chronological order.

#### Scenario: Doctor pins an active diagnosis event
- **WHEN** a doctor calls `PATCH /api/timeline/events/[id]/pin` with `{ isPinned: true }`
- **THEN** the `TimelineEvent.isPinned` field SHALL be set to `true`
- **THEN** `GET /api/timeline/patient/me` SHALL always return pinned events in the first section `pinnedEvents: [...]`

#### Scenario: Unpinning an event
- **WHEN** `PATCH /api/timeline/events/[id]/pin` is called with `{ isPinned: false }`
- **THEN** the event SHALL be removed from the `pinnedEvents` section on next timeline load

### Requirement: Bookmarks are deleted when user removes them
The system SHALL support `DELETE /api/timeline/bookmarks/[id]` to remove a bookmark.

#### Scenario: Patient removes a bookmark
- **WHEN** patient calls `DELETE /api/timeline/bookmarks/[bookmarkId]`
- **THEN** the `TimelineBookmark` row SHALL be deleted
- **THEN** `GET /api/timeline/bookmarks` SHALL no longer include that event
