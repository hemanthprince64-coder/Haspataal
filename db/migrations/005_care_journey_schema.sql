model JourneyTemplate {
  id           String   @id @default(uuid())
  hospitalId   String?  @map("hospital_id")
  name         String
  category     String
  stages       Json
  isActive     Boolean  @default(true) @map("is_active")
  createdBy    String?  @map("created_by")
  approvedBy   String?  @map("approved_by")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@index([hospitalId])
  @@index([category])
  @@map("journey_templates")
}

model JourneyTemplateVersion {
  id          String   @id @default(uuid())
  templateId  String   @map("template_id")
  version     Int      @default(1)
  stages      Json
  createdBy   String?  @map("created_by")
  createdAt   DateTime @default(now()) @map("created_at")

  @@index([templateId])
  @@map("journey_template_versions")
}

model JourneyInstance {
  id            String   @id @default(uuid())
  templateId    String   @map("template_id")
  patientId     String   @map("patient_id")
  hospitalId    String?  @map("hospital_id")
  status        String   @default("ACTIVE")
  currentStage  String   @map("current_stage")
  riskScore     Float    @map("risk_score")
  startDate     DateTime @map("start_date")
  expectedEnd   DateTime? @map("expected_end_date")
  careTeam      Json?    @map("care_team")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  @@index([templateId])
  @@index([patientId])
  @@index([hospitalId])
  @@map("journey_instances")
}

model JourneyMilestone {
  id            String   @id @default(uuid())
  journeyId     String   @map("journey_id")
  name          String
  category      String
  dueDate       DateTime? @map("due_date")
  completedAt   DateTime? @map("completed_at")
  status        String   @default("PENDING")
  riskScore     Float?   @map("risk_score")

  @@index([journeyId])
  @@map("journey_milestones")
}

model JourneyTask {
  id            String   @id @default(uuid())
  milestoneId   String?  @map("milestone_id")
  journeyId     String   @map("journey_id")
  name          String
  category      String
  assignedTo    String?  @map("assigned_to")
  dueDate       DateTime? @map("due_date")
  completedAt   DateTime? @map("completed_at")
  status        String   @default("PENDING")
  priority      String   @default("NORMAL")
  slaHours      Int?     @map("sla_hours")

  @@index([journeyId])
  @@index([milestoneId])
  @@map("journey_tasks")
}

model JourneyRisk {
  id            String   @id @default(uuid())
  journeyId     String   @unique @map("journey_id")
  score         Float
  factors       Json?
  lastUpdated   DateTime @default(now()) @map("last_updated")

  @@map("journey_risks")
}