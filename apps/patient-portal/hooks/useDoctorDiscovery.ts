/* eslint-disable no-console */
import { useEffect, useState } from 'react';

export function useDoctorSearch(initialParams: Record<string, any> = {}) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ limit: 20, offset: 0 });

  const search = async (params?: Record<string, any>) => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams({
        ...initialParams,
        ...params,
      });

      const response = await fetch(`/api/doctors/search?${searchParams}`);

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setDoctors(data.data || []);
      setPagination(data.pagination || { limit: 20, offset: 0 });
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { doctors, loading, error, search, pagination };
}

export function useDoctorAvailability(doctorId: string, hospitalId: string, date?: string) {
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!doctorId || !hospitalId) return;

    setLoading(true);
    const params = new URLSearchParams({
      doctorId,
      hospitalId,
      date: date || new Date().toISOString().split('T')[0],
    });

    fetch(`/api/doctors/availability?${params}`)
      .then((res) => res.json())
      .then((data) => setAvailability(data.data))
      .catch((err: any) => console.error('Availability fetch error:', err))
      .finally(() => setLoading(false));
  }, [doctorId, hospitalId, date]);

  return { availability, loading };
}
