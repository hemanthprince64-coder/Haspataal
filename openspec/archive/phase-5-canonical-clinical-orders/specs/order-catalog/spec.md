## ADDED Requirements

### Requirement: Master Order Catalog
The system SHALL support a `ClinicalOrderCatalog` defining standard orderable items (e.g., "CBC", "IV Ceftriaxone"). Order Instances MUST reference a `ClinicalOrderCatalogVersion` and SHALL NOT duplicate catalog metadata.

#### Scenario: Creating a Catalog Entry
- **WHEN** an admin defines a new orderable test "Liver Function Test"
- **THEN** it is saved as a Version 1 in the Catalog, and all future orders for LFT reference this version ID.
