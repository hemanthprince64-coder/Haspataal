/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in kilometers
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find hospitals within radius of patient location
 */
export async function findNearbyHospitals(lat, lon, radiusKm = 50) {
  // This would query a hospital index with location data
  // For now, returns query parameters for filtering
  return {
    lat,
    lon,
    radius: radiusKm,
  };
}

/**
 * Sort hospitals by distance from patient
 */
export function sortByDistance(hospitals, patientLat, patientLon) {
  return hospitals
    .map((h) => ({
      ...h,
      distance:
        h.latitude && h.longitude
          ? haversineDistance(patientLat, patientLon, h.latitude, h.longitude)
          : Infinity,
    }))
    .sort((a, b) => a.distance - b.distance);
}
