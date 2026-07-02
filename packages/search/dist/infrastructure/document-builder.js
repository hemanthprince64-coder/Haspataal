export function buildSearchDocument(entityType, entity) {
  const doc = {
    id: `${entityType}-${entity.id}`,
    entityType,
    entityId: entity.id,
    hospitalId: entity.hospitalId,
    patientId: entity.patientId,
    title: entity.title || entity.name || '',
    content: entity.content || '',
    metadata: {},
  };
  // Entity-specific field mapping
  if (entityType === 'patient') {
    doc.patientId = entity.id;
    doc.metadata = {
      status: entity.status,
      age_group: entity.ageGroup,
      gender: entity.gender,
      city: entity.city,
    };
  }
  if (entityType === 'doctor') {
    doc.metadata = {
      specialty: entity.specialty,
      department: entity.department,
      status: entity.status,
    };
  }
  if (entityType === 'appointment') {
    doc.metadata = {
      status: entity.status,
      date: entity.date,
      department: entity.department,
    };
  }
  return doc;
}
