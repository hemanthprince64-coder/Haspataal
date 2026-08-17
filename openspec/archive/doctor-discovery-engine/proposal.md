## Why

Patient portal needs to discover verified doctors with active hospital affiliations to enable appointment booking. Without a discovery engine, patients cannot find doctors, search by specialty/location, or view real-time availability. This is critical path for OPD functionality.

## What Changes

- **New Database Tables**: `DoctorSearchIndex`, `DoctorPublicProfile` for aggregated discovery data
- **New API Endpoints**: `/api/doctors/search`, `/api/doctors/availability`, `/api/doctors/public`
- **New Services**: DoctorDiscoveryService aggregating verified profiles and affiliations
- **Modified Tables**: Add computed availability fields to DoctorAvailability
- **RLS Policies**: Add policies for discovery read-only access

## Capabilities

### New Capabilities
- `doctor-discovery`: Doctor search, filtering, and public profile aggregation
- `doctor-availability`: Real-time availability computation from schedules, holidays, leaves
- `smart-doctor-filter`: Advanced filtering by specialty, fees, ratings, distance
- `doctor-alternatives`: Alternative doctor suggestions when primary unavailable

### Modified Capabilities
- `doctor-identity`: Add auto-publish to search index on verification completion
- `hospital-affiliation`: Update search index on affiliation status changes

## Impact

**APIs**: New endpoints under `/api/doctors`
**Database**: New tables, triggers for search index updates
**Dependencies**: Redis for caching, Google Maps API for distance
**Systems**: Patient portal reads from discovery service only (never queries hospital tables directly)