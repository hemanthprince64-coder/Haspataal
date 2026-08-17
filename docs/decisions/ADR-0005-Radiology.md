---\nversion: 2.0\nowner: Haspataal Engineering\nlast_updated: 2026-08-04\nstatus: Active\n---\n
# ADR-0005: Radiology Module Integration

## Status
Accepted

## Context
Radiology (X-Ray, MRI, CT) requires PACS (Picture Archiving and Communication System) integration and heavier file storage mechanisms than standard laboratory textual results.

## Decision
Radiology orders will use `ClinicalOrder`. The results payload will contain secure, signed URLs pointing to an external PACS viewer or a secure S3 bucket.

## Alternatives Considered
Storing binary DICOM files directly in Postgres was explicitly forbidden due to performance degradation.

## Consequences
- Requires AWS S3/CloudFront (or equivalent) setup for secure signed URLs.
- UI components must support interactive tooltips for PACS intranet access requirements.

## Migration Notes
None

## Related Packages
- @haspataal/core

## Related ADRs
None
