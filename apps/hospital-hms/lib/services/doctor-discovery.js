import prisma from '../lib/prisma';
import { redis } from '../lib/redis';

const CACHE_TTL = 300; // 5 minutes

export class DoctorDiscoveryService {
  async searchDoctors(params) {
    const cacheKey = `doctors:search:${JSON.stringify(params)}`;

    // Try cache first
    try {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch {
      // Continue without cache
    }

    const { query, specialty, city, minRating, limit = 20, offset = 0 } = params;

    // Build where clause
    const where = {
      isActive: true,
    };

    if (query) {
      where.OR = [
        { fullName: { contains: query, mode: 'insensitive' } },
        { specialties: { hasSome: [query] } },
      ];
    }

    if (specialty) {
      where.specialties = { has: specialty };
    }

    if (city) {
      where.city = { equals: city, mode: 'insensitive' };
    }

    if (minRating) {
      where.avgRating = { gte: minRating };
    }

    const doctors = await prisma.doctorSearchIndex.findMany({
      where,
      orderBy: [{ avgRating: 'desc' }, { reviewCount: 'desc' }],
      take: limit,
      skip: offset,
    });

    // Cache results
    try {
      await redis.set(cacheKey, JSON.stringify(doctors), { ex: CACHE_TTL });
    } catch {
      // Continue without cache
    }

    return doctors;
  }

  async getDoctorPublicProfile(doctorId) {
    return await prisma.doctorPublicProfile.findUnique({
      where: { doctorId },
    });
  }

  async getAvailability(doctorId, hospitalId, date) {
    const cacheKey = `availability:${doctorId}:${hospitalId}:${date}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch {}

    // Get from database - use correct constraint name
    const availability = await prisma.doctorAvailability.findUnique({
      where: {
        doctorId_hospitalId_date: {
          doctorId,
          hospitalId,
          date: new Date(date),
        },
      },
    });

    // If not cached, compute on-demand
    if (!availability || new Date(availability.ttlExpiresAt) < new Date()) {
      const computed = await this.computeAvailability(doctorId, hospitalId, date);

      // Save computed - use correct constraint name
      await prisma.doctorAvailability.upsert({
        where: {
          doctorId_hospitalId_date: {
            doctorId,
            hospitalId,
            date: new Date(date),
          },
        },
        create: computed,
        update: computed,
      });

      try {
        await redis.set(cacheKey, JSON.stringify(computed), { ex: 300 });
      } catch {}

      return computed;
    }

    return availability;
  }

  async computeAvailability(doctorId, hospitalId, date) {
    // Get doctor's weekly schedule
    const schedule = await prisma.doctorSchedule.findMany({
      where: { doctorId },
    });

    // Get leaves
    const leaves = await prisma.doctorLeave.findMany({
      where: {
        doctorId,
        status: 'ACTIVE',
        startDate: { lte: new Date(date) },
        endDate: { gte: new Date(date) },
      },
    });

    // Get holidays
    const holidays = await prisma.doctorHoliday.findMany({
      where: {
        OR: [
          { doctorId, date: new Date(date) },
          { hospitalId, date: new Date(date) },
        ],
      },
    });

    // Get existing appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: new Date(date),
      },
    });

    // Check if on leave
    if (leaves.length > 0) {
      return {
        doctorId,
        hospitalId,
        date: new Date(date),
        status: 'Leave',
        availableSlots: 0,
        bookableSlots: 0,
        cachedAt: new Date(),
        ttlExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
      };
    }

    // Check if holiday
    if (holidays.length > 0) {
      return {
        doctorId,
        hospitalId,
        date: new Date(date),
        status: 'Holiday',
        availableSlots: 0,
        bookableSlots: 0,
        cachedAt: new Date(),
        ttlExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
      };
    }

    // Calculate slots from schedule
    const dayOfWeek = new Date(date).getDay();
    const daySchedule = schedule.find((s) => s.dayOfWeek === dayOfWeek);

    let totalSlots = 0;
    if (daySchedule) {
      const start = new Date(`2024-01-01T${daySchedule.startTime}`);
      const end = new Date(`2024-01-01T${daySchedule.endTime}`);
      const durationMs = end.getTime() - start.getTime();
      const slotMinutes = daySchedule.slotDurationMinutes || 15;
      totalSlots = Math.floor(durationMs / (slotMinutes * 60 * 1000));
    }

    const bookedSlots = appointments.length;
    const availableSlots = Math.max(0, totalSlots - bookedSlots);

    let status;
    if (availableSlots === 0) {
      status = 'Full';
    } else if (availableSlots < totalSlots * 0.3) {
      status = 'Limited';
    } else {
      status = 'Available';
    }

    return {
      doctorId,
      hospitalId,
      date: new Date(date),
      status,
      availableSlots,
      bookableSlots: availableSlots,
      cachedAt: new Date(),
      ttlExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
    };
  }

  async refreshIndex() {
    return {
      job: 'refresh-doctor-search-index',
      status: 'queued',
    };
  }
}
