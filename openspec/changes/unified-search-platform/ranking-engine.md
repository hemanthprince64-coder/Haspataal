# Healthcare Ranking Engine - Mathematical Model

## Ranking Formula

```
TotalScore = Σ(Weight_i × Score_i) + Boost - Decay

Where:
- Weight_i: Component weight (0.0 - 1.0)
- Score_i: Component score (0.0 - 1.0)
- Boost: Applied boosts (>1.0 multiplier)
- Decay: Time-based decay (0.0 - 1.0)
```

## Core Components

### 1. Exact Match Score
```
ExactMatch(Query, Document) = {
  1.0 if title contains any query token exactly
  0.8 if content contains any query token exactly
  0.5 if metadata contains any query token exactly
  0.0 otherwise
}

Weight: 0.40 (highest)
```

### 2. Prefix Match Score
```
PrefixMatch(Query, Document) = {
  0.9 if title starts with query token
  0.7 if title contains prefix
  0.5 if content starts with query token
  0.0 otherwise
}

Weight: 0.15
```

### 3. Fuzzy Match Score
```
FuzzyMatch(Query, Document) = {
  Levenshtein(query_token, document_token) ≤ 2 ? 1.0 - (distance / max_length) : 0
  
  Example: "patiend" → "patient"
  distance = 1, max_length = 7
  score = 1.0 - (1/7) = 0.86
}

Weight: 0.10
```

### 4. Popularity Score
```
Popularity(Entity) = {
  log10(search_count + 1) / log10(max_search_count + 1)
  
  Where:
  - search_count from search_logs aggregation
  - Normalized to 0-1 range
}

Weight: 0.10
```

### 5. Recent Activity Score
```
Recency(Entity) = {
  1.0 if updated_at in last 7 days
  0.8 if updated_at in last 30 days
  0.6 if updated_at in last 90 days
  0.4 if updated_at in last 180 days
  0.2 if older
}

Weight: 0.15
```

### 6. Doctor Rating Score
```
DoctorRating(Doctor) = {
  normalized_average_rating
  
  Where:
  - average_rating from reviews table
  - normalized to 0-1 (assuming 1-5 scale)
}

Weight: 0.05
```

### 7. Distance Score
```
Distance(User, Entity) = {
  Only for geo-enabled entities
  1.0 - (distance_km / max_distance_km)
  
  Example: 5km / 50km max = 0.9
}

Weight: 0.05
```

### 8. Hospital Proximity Score
```
HospitalProximity(User, Entity) = {
  1.0 if entity.hospital_id = user.hospital_id
  0.8 if entity.hospital_id in user.hospitals[]
  0.5 if entity.hospital_id in same network
  0.2 otherwise
}

Weight: 0.05
```

### 9. Patient Context Score
```
PatientContext(User, Entity) = {
  1.0 if entity.patient_id = user.patient_id
  0.8 if entity in user.medical_history
  0.5 if entity in user.family_members
  0.3 if entity in user.referred_by
  0.0 otherwise
}

Weight: 0.05
```

### 10. Role Context Score
```
RoleContext(User, Entity) = {
  1.0 if entity in user role scope
  0.7 if entity in delegated scope
  0.3 if entity in organization scope
  0.0 otherwise
}

Weight: 0.05
```

### 11. Clinical Relevance Score
```
ClinicalRelevance(Query, Entity) = {
  Query intent matching entity category
  
  Examples:
  - "diabetes" query → Diabetes Journey: 1.0
  - "diabetes" query → Cardiology Appointment: 0.2
  - "cardiology" query → Cardiology Doctor: 1.0
  - "billing" query → Bill: 1.0
}

Weight: 0.05
```

### 12. Usage Frequency Score
```
UsageFrequency(User, Entity) = {
  Count of User interactions with Entity in last 30 days
  Min-Max normalized to 0-1
}

Weight: 0.05
```

## Boost Rules

### Entity Type Boost
```
if entity_type IN ['patient', 'doctor']:
  multiply score by 1.5

if entity_type IN ['appointment', 'journey']:
  multiply score by 1.2

if entity_type IN ['medicine', 'notification']:
  multiply score by 1.0 (no boost)
```

### Field Boost
```
if query matches title field:
  multiply score by 1.3

if query matches metadata.key field:
  multiply score by 1.1
```

### Recency Boost
```
if created_at in last 24 hours:
  multiply score by 1.2

if created_at in last 7 days:
  multiply score by 1.1
```

### Status Boost
```
if status = 'ACTIVE':
  multiply score by 1.5

if status = 'COMPLETED':
  multiply score by 1.2

if status IN ['CANCELLED', 'EXPIRED']:
  multiply score by 0.5
```

## Decay Rules

### Time Decay
```
Decay(entity) = {
  1.0 - (days_old / 365)
  
  Example: 30 days old
  decay = 1.0 - (30/365) = 0.92
}
```

### Soft Delete Decay
```
if entity.deleted_at exists:
  final_score *= 0.1
```

## Synonym Boost
```
if synonym matched:
  multiply score by 1.0 (no penalty)
  but prefer exact match over synonym match
```

## Search Intent Boost

### Intent Categories
- **CLINICAL**: Patient care related → boost 1.3
- **FINANCIAL**: Billing/insurance → boost 1.1
- **OPERATIONAL**: Scheduling/admin → boost 1.0
- **COMMERCIAL**: Marketing → boost 0.8

## AI Ranking (Future)

```
AIRanking(Entity) = {
  embedding_similarity(query_embedding, entity_embedding)
  Weighted average of:
    - Semantic relevance: 0.4
    - Clinical context: 0.3
    - User behavior: 0.2
    - Temporal relevance: 0.1
}

Hybrid Score = 0.7 × TraditionalScore + 0.3 × AIRanking
```

## Ranking Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                  Ranking Calculation Flow                    │
├─────────────────────────────────────────────────────────────┤
│ Input: Query, Document, User Context                         │
│      ↓                                                        │
│ 1. Calculate Component Scores (0.0-1.0)                      │
│    ├── Exact Match                                           │
│    ├── Prefix Match                                          │
│    ├── Fuzzy Match                                           │
│    ├── Popularity                                            │
│    ├── Recency                                               │
│    ├── Doctor Rating                                         │
│    ├── Distance                                                │
│    ├── Hospital Proximity                                    │
│    ├── Patient Context                                       │
│    ├── Role Context                                          │
│    ├── Clinical Relevance                                    │
│    └── Usage Frequency                                       │
│      ↓                                                        │
│ 2. Apply Weights                                             │
│    Total = Σ(Weight_i × Score_i)                             │
│      ↓                                                        │
│ 3. Apply Boosts                                              │
│    Total = Total × Σ(Boosts)                                 │
│      ↓                                                        │
│ 4. Apply Decay                                               │
│    Final = Total × Decay                                     │
└─────────────────────────────────────────────────────────────┘
```

## Score Normalization

All scores normalized to 0.0 - 1.0 range before weighting:
- Log scaling for skewed distributions
- Min-max normalization for bounded ranges
- Sigmoid for unbounded values