# HMS Diagnostics Module — Document Upload & Post-Upload Edit

## User Story

> **As a** hospital lab technician or diagnostic administrator,  
> **I want to** upload diagnostic documents (reports, imaging, lab results) against a patient’s diagnostic order and edit the document metadata after upload,  
> **So that** patient diagnostic records are complete, auditable, and correctable in case of transcription or categorization errors without requiring a re-upload.

---

## 1. Feature: Diagnostic Document Upload

### 1.1 Context
The HMS already supports diagnostic order creation (`DiagnosticOrder`), result entry (`DiagnosticResult`), and billing linkage. However, there is no mechanism to attach raw or finalized documents (PDFs, DICOM images, scanned reports) to a diagnostic record. This feature enables persistent, secure storage of diagnostic documents linked to specific orders and patients.

### 1.2 Scope
- Upload documents against an existing `DiagnosticOrder` or `DiagnosticResult`.
- Support PDF, PNG, JPEG, and DICOM formats (up to 50 MB per file).
- Associate metadata: document type (e.g., "Blood Report", "X-Ray", "MRI"), description, uploaded by, uploaded at.
- Enforce role-based access: `LAB_TECH`, `DOCTOR`, `HOSPITAL_ADMIN` via `requireHospitalAccess('diagnostics', 'create')`.

### 1.3 API Contract

#### `POST /api/hospital/diagnostics/orders/{orderId}/documents`
**Headers:** `Content-Type: multipart/form-data`  
**Body:**
| Field           | Type   | Required | Description                                      |
|-----------------|--------|----------|--------------------------------------------------|
| `file`          | File   | Yes      | PDF, PNG, JPEG, or DICOM (max (MB)              |
| `documentType`  | string | Yes      | Enum: `BLOOD_REPORT`, `IMAGING`, `PATHOLOGY`, `MICROBIOLOGY`, `OTHER` |
| `description`   | string | No       | Free-text notes about the document               |
| `resultId`      | string | No       | Optional FK to link to `DiagnosticResult`        |

**Response: 201 Created**
```json
{
  "id": "doc-uuid",
  "orderId": "order-uuid",
  "resultId": "result-uuid|null",
  "documentType": "IMAGING",
  "description": "Chest X-Ray taken on arrival",
  "fileUrl": "https://cdn.haspataal.local/diagnostics/uuid-filename.pdf",
  "uploadedBy": "staff-uuid",
  "uploadedAt": "2026-06-24T15:30:00.000Z",
  "fileSizeBytes": 4283912,
  "mimeType": "application/pdf"
}
```

### 1.4 Database Schema Changes
Add to `schema.prisma`:
```prisma
model DiagnosticDocument {
  id           String   @id @default(uuid())
  orderId      String   @map("order_id")
  resultId     String?  @map("result_id")
  documentType String   @map("document_type") // BLOOD_REPORT, IMAGING, PATHOLOGY, MICROBIOLOGY, OTHER
  description  String?
  fileUrl      String   @map("file_url")
  fileSizeBytes Int     @map("file_size_bytes")
  mimeType     String   @map("mime_type")
  uploadedBy   String   @map("uploaded_by")
  uploadedAt   DateTime @default(now()) @map("uploaded_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  order    DiagnosticOrder    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  result   DiagnosticResult?  @relation(fields: [resultId], references: [id], onDelete: SetNull)
  uploader Staff              @relation(fields: [uploadedBy], references: [id])

  @@index([orderId])
  @@index([resultId])
  @@map("diagnostic_documents")
}
```
Also add the relation on existing models:
```prisma
model DiagnosticOrder {
  ...
  documents DiagnosticDocument[]
}

model DiagnosticResult {
  ...
  documents DiagnosticDocument[]
}
```

### 1.5 Storage Strategy
- Use cloud storage (S3 / R2 / GCS) with signed URLs for upload and delivery.
- Files stored under path: `hospitals/{hospitalId}/diagnostics/{orderId}/{documentId}.{ext}`.
- Virus scanning via ClamAV or equivalent before making file URL accessible.
- Retain original filename in metadata but store with UUID to prevent collisions.

---

## 2. Feature: Edit Document Details Post-Upload

###  Construct2.1 Context
After a document is uploaded, users may need to correct the document type (e.g., typo in "IMAGING" vs "PATHOLOGY"), update the description, or re-link it to a different `resultId`. The document binary itself must not be modified; only metadata is editable.

### 2.2 Scope
- Allow editing of `documentType`, `description`, and `resultId` for any `DiagnosticDocument`.
- Prevent edits to file binary, `fileUrl`, `fileSizeBytes`, `mimeType`, `uploadedBy`, and `uploadedAt`.
- Maintain an implicit audit trail through `updatedAt` (Prisma auto-handles).
- Restrict edit access to the original uploader, `HOSPITAL_ADMIN`, and `DOCTOR` roles.

### 2.3 API Contract

#### `PATCH /api/hospital/diagnostics/documents/{documentId}`
**Headers:** `Content-Type: application/json`  
**Body:**
```json
{
  "documentType": "PATHOLOGY",
  "description": "Updated: biopsy report, left arm lesion",
  "resultId": "new-result-uuid-or-null"
}
```

**Response: 200 OK**
```json
{
  "id": "doc-uuid",
  "orderId": "order-uuid",
  "resultId": "new-result-uuid",
  "documentType": "PATHOLOGY",
  "description": "Updated: biopsy report, left arm lesion",
  "fileUrl": "https://cdn.haspataal.local/diagnostics/uuid-filename.pdf",
  "fileSizeBytes": 4283912,
  "mimeType": "application/pdf",
  "uploadedBy": "staff-uuid",
  "uploadedAt": "2026-06-24T15:30:00.000Z",
  "updatedAt": "2026-06-24T16:45:00.000Z"
}
```

**Error Responses:**
- `403 Forbidden`: User lacks `diagnostics:update` permission or is not the original uploader/admin.
- `404 Not Found`: Document ID does not exist.
- `422 Unprocessable Entity`: Invalid `documentType` enum or malformed `resultId`.

### 2.4 Validation Rules
- `documentType` must belong to the allowed enum set.
- `description` max length: 2000 characters.
- `resultId` if provided must reference a `DiagnosticResult` belonging to the same `orderId`.
- At least one mutable field must be present in the request body (reject empty JSON).

---

## 3. Frontend UX Requirements

### 3.1 Upload Flow
1. Inside the HMS Diagnostics Dashboard (`/hospital/dashboard/diagnostics/orders/{orderId}`), display an “Documents” section.
2. Provide a drag-and-drop zone or file picker with format validation (PDF, PNG, JPEG, DICOM).
3. Show upload progress bar (0% → 100%) and a preview for image types.
4. On success, append the document to a list with thumbnail, type badge, and download button.

### 3.2 Edit Flow
1. Each document card shows an “Edit Details” icon (pencil) visible only to permitted users.
2. Clicking opens a modal with:
   - **Document Type**: Dropdown (required)
   - **Description**: Textarea (optional, 2000 chars max)
   - **Link to Result**: Searchable dropdown of results for this order (optional)
3. Save triggers a PATCH; optimistic UI updates the list, then confirms on success.
4. Display “Last updated: relative time” on each document card.

---

## 4. Acceptance Criteria

### AC 1 — Successful Upload
**Given** a lab technician with `diagnostics:create` access is viewing a diagnostic order,  
**When** they select a valid PDF file, choose “BLOOD_REPORT” as document type, enter a description, and submit,  
**Then** the file is uploaded to cloud storage, a `DiagnosticDocument` record is created in the database, the document appears in the order’s document list within 3 seconds, and the staff member receives a success toast.

### AC 2 — Upload Validation
**Given** the same staff member attempts to upload a file,  
**When** they submit a ZIP file or exceed the 50 MB limit,  
**Then** the upload is rejected with a `422` error, no file is stored, and a clear validation message is displayed.

### AC 3 — Role-based Upload Restriction
**Given** a receptionist (`RECEPTIONIST` role) without `diagnostics:create` permission,  
**When** they attempt to upload a document to an order,  
**Then** the API returns `403 Forbidden` and the UI hides the upload button.

### AC 4 — Metadata Edit Success
**Given** a document “Chest X-Ray” already exists on an order,  
**When** the original uploader changes its type to “IMAGING”, updates the description, and saves,  
**Then** the database reflects the new type and description, `updatedAt` is refreshed, the UI list updates optimistically, and a success notification is shown.

### AC 5 — Edit Validation (Illegal Result Link)
**Given** a document belongs to Order A,  
**When** a user attempts to link it to a `resultId` that belongs to Order B,  
**Then** the API returns `422` with the message “Result must belong to the same diagnostic order,” and no changes are persisted.

### AC 6 — Edit Restriction by Non-Owner
**Given** a lab technician who did not upload the document tries to edit it,  
**When** they submit a PATCH request,  
**Then** the API returns `403 Forbidden` unless the user holds `HOSPITAL_ADMIN` or `DOCTOR` role.

### AC 7 — Audit Immutability
**Given** an existing document record,  
**When** any user attempts to modify `fileUrl`, `fileSizeBytes`, or `mimeType` via API,  
**Then** those fields are ignored in the update (or the request is rejected), preserving file integrity.

---

## 5. Non-Functional Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-1 | Upload Latency (p95) | < 5 seconds for files ≤ 10 MB on standard broadband |
| NFR-2 | Storage Durability | 99.999% via cloud provider SLA |
| NFR-3 | Access Control | Documents must never be publicly accessible; use signed URLs with 15-minute expiry |
| NFR-4 | File Retention | Retain deleted documents in cold storage for 7 years per healthcare compliance |
| NFR-5 | Audit Trail | Every upload and edit must be traceable to a `staff_id` and timestamp (existing Prisma `updatedAt` + future audit log extension) |
| NFR-6 | Mobile Responsiveness | Upload and edit modals must be usable on 375 px width viewports |

---

## 6. Dependencies & Assumptions

1. **Cloud Storage**: Project already uses a blob store for `approvalDocumentUrl`; assume reuse of the same provider (S3/R2) with a new `diagnostics/` bucket prefix.
2.桶 Prisma Migrations: A migration must be generated after adding the `DiagnosticDocument` model.
3. **Virus Scanning**: Existing project may not have AV; this feature assumes ClamAV sidecar or cloud-native AV (e.g., AWS S3 Object Lambda, Cloudflare R2 with Workers). Fallback: block potentially dangerous mimetypes (`.exe`, `.js`, `.html`).
4. **Permissions**: `requireHospitalAccess('diagnostics', ...)` already enforces role checks; the new endpoints will wrap existing patterns.

---

## 7. Out of Scope

- In-document OCR or AI-based classification (future roadmap item).
- Patient-side download of documents (covered under patient portal Phase 2.1 but not within this HMS diagnostics module story).
- Bulk upload (single-file upload only for this iteration).
- Versioning of the file binary (binary replacement is a separate “Replace Document” feature).

---

## 8. Task Breakdown (Suggested)

1. **Schema**: Add `DiagnosticDocument` model, generate migration, run `prisma generate`.
2. **API**: Implement `POST /api/hospital/diagnostics/orders/{orderId}/documents`.
3. **API**: Implement `PATCH /api/hospital/diagnostics/documents/{documentId}`.
4. **Storage**: Add `saveDiagnosticDocument(file, hospitalId, orderId)` utility reusing existing upload infrastructure.
5. **Frontend**: Build `DiagnosticDocumentUploader` component (drag-and-drop + type/description fields).
6. **Frontend**: Build `DiagnosticDocumentEditor` modal (type, description, result linkage dropdown).
7. **Integration**: Wire into existing HMS Diagnostics order detail page, ensure `requireHospitalAccess` enforcement.
8. **QA**: Unit tests for validation rules; integration E2E for upload and edit happy paths.
