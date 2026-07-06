import { prisma } from '@haspataal/db';

export class TimelineMutationHandler {
  static async addBookmark(userId: string, eventId: string, note?: string) {
    return prisma.timelineBookmark.create({
      data: { userId, eventId, note },
    });
  }

  static async removeBookmark(bookmarkId: string, userId: string) {
    return prisma.timelineBookmark.deleteMany({
      where: { id: bookmarkId, userId },
    });
  }

  static async pinEvent(eventId: string, isPinned: boolean) {
    return prisma.timelineEvent.update({
      where: { id: eventId },
      data: { isPinned },
    });
  }

  static async requestExport(patientId: string, format: string, requestedBy: string, filters?: object) {
    const exportRecord = await prisma.timelineExport.create({
      data: {
        patientId,
        requestedBy,
        format,
        status: 'QUEUED',
        filters: filters ? (filters as any) : undefined,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return { jobId: exportRecord.id, status: 'queued' };
  }
}
