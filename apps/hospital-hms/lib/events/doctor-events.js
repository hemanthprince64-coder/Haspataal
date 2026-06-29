/* eslint-disable no-console */
import { redis } from './lib/redis';

export const publishDoctorUpdated = async (doctorId, changes) => {
  try {
    await redis.publish(
      'doctor-updated',
      JSON.stringify({
        doctorId,
        changes,
        timestamp: new Date().toISOString(),
      }),
    );
  } catch (e) {
    console.error('Failed to publish doctor-updated event:', e);
  }
};

export const publishVerificationChanged = async (doctorId, status) => {
  try {
    await redis.publish(
      'doctor-verification-changed',
      JSON.stringify({
        doctorId,
        status,
        timestamp: new Date().toISOString(),
      }),
    );
  } catch (e) {
    console.error('Failed to publish verification-changed event:', e);
  }
};

export const publishAffiliationChanged = async (doctorId, hospitalId, status) => {
  try {
    await redis.publish(
      'doctor-affiliation-changed',
      JSON.stringify({
        doctorId,
        hospitalId,
        status,
        timestamp: new Date().toISOString(),
      }),
    );
  } catch (e) {
    console.error('Failed to publish affiliation-changed event:', e);
  }
};
