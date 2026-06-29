## ADDED Requirements

### Requirement: Aggregate doctor profiles for search
The system SHALL aggregate verified doctor profiles with active hospital affiliations into a denormalized search index.

#### Scenario: Verified doctor published to index
- **WHEN** doctor verification status changes to VERIFIED
- **AND** profile is 100% complete
- **AND** affiliation status is ACTIVE
- **AND** hospital status is ACTIVE
- **THEN** doctor SHALL be indexed in DoctorSearchIndex table

### Requirement: Doctor search by specialty
The system SHALL allow patients to search doctors by medical specialty.

#### Scenario: Specialty search returns matching doctors
- **WHEN** patient searches with specialty filter
- **THEN** system SHALL return doctors with matching speciality field
- **THEN** results SHALL include hospital affiliation and consultation fee

### Requirement: Location-based search
The system SHALL support searching doctors by city or pincode.

#### Scenario: City search filters correctly
- **WHEN** patient searches with city parameter
- **THEN** system SHALL return doctors from hospitals in that city
- **THEN** system SHALL calculate distance from hospital location

### Requirement: Doctor filtering
The system SHALL support filtering by availability, fees, ratings, and consultation mode.

#### Scenario: Available today filter
- **WHEN** patient applies "Available Today" filter
- **THEN** system SHALL return only doctors with open slots today
- **THEN** system SHALL compute availability from schedule and leave calendar

### Requirement: Doctor public profile
The system SHALL expose only public-safe doctor information.

#### Scenario: Public profile excludes sensitive data
- **WHEN** patient fetches doctor profile
- **THEN** system SHALL return: name, qualifications, speciality, experience, ratings
- **AND** system SHALL NOT return: govt ID, personal mobile, personal email, documents

## MODIFIED Requirements

### Requirement: Doctor verification triggers index update
The system SHALL automatically update search index on verification status changes.

#### Scenario: Rejection removes from index
- **WHEN** doctor verification status changes to REJECTED
- **THEN** system SHALL remove or mark unavailable in search index

### Requirement: Affiliation changes update index
The system SHALL update search index when doctor-hospital affiliation changes.

#### Scenario: New affiliation published
- **WHEN** doctor accepts new hospital affiliation
- **THEN** system SHALL update index with new hospital details
- **THEN** patient portal SHALL show doctor at new location