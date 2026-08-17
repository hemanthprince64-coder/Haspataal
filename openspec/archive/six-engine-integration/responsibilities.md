# Engine Responsibility Matrix

This matrix defines the exact boundaries of what each engine owns and controls. No capability may have two authoritative owners.

## Configuration Engine
| Capability | Owner | Writer | Reader | Event Producer | Event Consumer | Config Consumer | Audit Req |
|---|---|---|---|---|---|---|---|
| Configuration Definitions | Config Engine | Admin Portal | All Engines | Config Engine | - | - | High |
| Configuration Hierarchy | Config Engine | Admin Portal | All Engines | Config Engine | - | - | High |
| Configuration Resolution | Config Engine | Config Engine | All Engines | - | - | All Engines | High |
| Feature Flags | Config Engine | Admin Portal | All Engines | Config Engine | - | All Engines | High |
| Policy Locks | Config Engine | Admin Portal | Config Engine | - | - | All Engines | Critical |
| Configuration Audit History | Config Engine | Config Engine | Admin Portal | - | Config Engine | - | Critical |
*Note: It does not own clinical decisions.*

## Timeline Engine
| Capability | Owner | Writer | Reader | Event Producer | Event Consumer | Config Consumer | Audit Req |
|---|---|---|---|---|---|---|---|
| Immutable Longitudinal Events | Timeline Engine | Timeline Engine | Portals (BFF) | Timeline Engine | All Domains | Yes | Critical |
| Timeline Presentation Metadata | Timeline Engine | Timeline Engine | Portals (BFF) | - | - | Yes | Low |
| Timeline Indexing State | Timeline Engine | Timeline Engine | Timeline Engine | - | - | No | Low |
| Bookmarks & Filters | Timeline Engine | Timeline Engine | Portals (BFF) | - | - | No | Low |
*Note: It does not own original clinical records. Source modules remain authoritative.*

## Rules Engine
| Capability | Owner | Writer | Reader | Event Producer | Event Consumer | Config Consumer | Audit Req |
|---|---|---|---|---|---|---|---|
| Rule Definitions | Rules Engine | Admin Portal | Rules Engine | Rules Engine | - | Yes | High |
| Rule Versions | Rules Engine | Admin Portal | Rules Engine | - | - | Yes | High |
| Rule Evaluation | Rules Engine | Rules Engine | Rules Engine | Rules Engine | All Domains | Yes | Critical |
| Rule Execution Records | Rules Engine | Rules Engine | Admin Portal | - | Rules Engine | Yes | Critical |
| Action Intents | Rules Engine | Rules Engine | Consumers | Rules Engine | - | Yes | Critical |
*Note: It does not directly own appointments, journeys, notifications, or clinical records.*

## Notification Engine
| Capability | Owner | Writer | Reader | Event Producer | Event Consumer | Config Consumer | Audit Req |
|---|---|---|---|---|---|---|---|
| Notification Intents | Notify Engine | Notify Engine | Notify Engine | Notify Engine | All Domains | Yes | High |
| Templates | Notify Engine | Admin/HMS | Notify Engine | - | - | Yes | Medium |
| Channel Routing | Notify Engine | Notify Engine | Notify Engine | - | - | Yes | High |
| Delivery Attempts & Status | Notify Engine | Notify Engine | Notify Engine | Notify Engine | - | No | High |
| User Communication Prefs | Notify Engine | Portals | Notify Engine | Notify Engine | Portals | Yes | High |
| Provider Health | Notify Engine | Notify Engine | Admin Portal | Notify Engine | - | Yes | Low |
*Note: It does not decide clinical eligibility for an alert.*

## Care Journey Engine
| Capability | Owner | Writer | Reader | Event Producer | Event Consumer | Config Consumer | Audit Req |
|---|---|---|---|---|---|---|---|
| Journey Templates | Journey Engine | Admin/HMS | Journey Engine | Journey Engine | - | Yes | High |
| Journey Instances | Journey Engine | Journey Engine | HMS/Patient | Journey Engine | Journey Engine | Yes | Critical |
| Stages & Milestones | Journey Engine | Journey Engine | HMS/Patient | Journey Engine | Journey Engine | Yes | Critical |
| Tasks | Journey Engine | Journey Engine | HMS/Patient | Journey Engine | Journey Engine | Yes | High |
| Journey Progress | Journey Engine | Journey Engine | HMS/Patient | Journey Engine | Journey Engine | Yes | High |
| Journey Care-Team Assignments | Journey Engine | Journey Engine | HMS | Journey Engine | Journey Engine | Yes | Critical |
*Note: It does not own the patient's master clinical record.*

## Unified Search & Discovery Engine
| Capability | Owner | Writer | Reader | Event Producer | Event Consumer | Config Consumer | Audit Req |
|---|---|---|---|---|---|---|---|
| Search Documents | Search Engine | Search Engine | Search Engine | - | All Domains | No | Medium |
| Search Indexes | Search Engine | Search Engine | Search Engine | - | - | Yes | Low |
| Search Ranking Config Cons. | Search Engine | Search Engine | Search Engine | - | - | Yes | Medium |
| Search Query History | Search Engine | Search Engine | Search Engine | - | - | Yes | High |
| Search Analytics | Search Engine | Search Engine | Admin Portal | - | - | Yes | Low |
*Note: It does not own the entities it indexes.*
