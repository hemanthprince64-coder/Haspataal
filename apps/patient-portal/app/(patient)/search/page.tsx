/* eslint-disable */
'use client';

import {
  Search,
  MapPin,
  Building2,
  Star,
  ChevronRight,
  UserX,
  Clock,
  Award,
  Phone,
  Filter,
  Bookmark,
} from 'lucide-react';

import { useState, useEffect, Suspense } from 'react';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { searchDoctorsAction, getCitiesAction, getAllSpecialitiesAction } from '@/app/actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import DoctorCard from '../components/DoctorCard';

function SearchPageContent() {
  const searchParams = useSearchParams();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [doctors, setDoctors] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cities, setCities] = useState<any[]>([]);
  const [specialities, setSpecialities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [viewBookmarks, setViewBookmarks] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const city = searchParams.get('city') || 'Mumbai';
  const speciality = searchParams.get('speciality') || '';
  const query = searchParams.get('q') || '';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(false);

      if (viewBookmarks) {
        if (typeof window !== 'undefined') {
          try {
            const { getBookmarkedDoctors } = await import('@/lib/infrastructure/offline-db');
            const bookmarked = await getBookmarkedDoctors();
            setDoctors(bookmarked);
            setIsOffline(true);
          } catch (err) {
            console.error('Error fetching bookmarks', err);
            setError(true);
          } finally {
            setLoading(false);
          }
        }
        return;
      }

      try {
        const drs = await searchDoctorsAction(city, speciality, query);
        setDoctors(drs);
        setIsOffline(false);

        if (drs && drs.length > 0 && typeof window !== 'undefined') {
          const { cacheDoctors } = await import('@/lib/infrastructure/offline-db');
          await cacheDoctors(drs).catch((err) => console.error('Cache doctors failed', err));
        }

        const cts = await getCitiesAction();
        setCities(cts);
        const specs = await getAllSpecialitiesAction();
        setSpecialities(specs);
      } catch (e) {
        console.warn('Network request failed, attempting offline database fallback...', e);
        if (typeof window !== 'undefined') {
          try {
            const { getCachedDoctors } = await import('@/lib/infrastructure/offline-db');
            const cached = await getCachedDoctors();
            
            // Filter offline doctors
            const filtered = cached.filter((doc: any) => {
              const aff = doc.affiliations?.[0];
              const docCity = doc.hospital?.city || aff?.hospital?.city || '';
              const docSpec = doc.speciality || aff?.department || '';
              const docName = doc.fullName || doc.name || '';
              
              const cityMatch = !city || docCity.toLowerCase() === city.toLowerCase();
              const specMatch = !speciality || docSpec.toLowerCase() === speciality.toLowerCase();
              const queryMatch = !query || 
                docName.toLowerCase().includes(query.toLowerCase()) || 
                docSpec.toLowerCase().includes(query.toLowerCase());
                
              return cityMatch && specMatch && queryMatch;
            });
            setDoctors(filtered);
            setIsOffline(true);
            
            setCities([
              { id: '1', name: 'Patna' },
              { id: '2', name: 'Gaya' },
              { id: '3', name: 'Muzaffarpur' },
              { id: '4', name: 'Mumbai' },
            ]);
            setSpecialities(['General Medicine', 'Pediatrics', 'Obstetrics', 'Ophthalmology']);
          } catch (offlineErr) {
            console.error('Offline lookup failed', offlineErr);
            setError(true);
          }
        } else {
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [city, speciality, query, viewBookmarks]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doctorsWithHospitals = doctors.map((doc: any) => {
    const aff = doc.affiliations?.[0];
    const hospital = doc.hospital || aff?.hospital || null;
    return {
      id: doc.id,
      name: doc.fullName || doc.name,
      speciality: doc.speciality || aff?.department || 'General Specialist',
      fees: doc.fee || doc.fees || doc.consultationFee || 500,
      hospitalId: doc.hospitalId || aff?.hospitalId || '',
      image: doc.profilePhotoUrl || doc.profilePicture || doc.image,
      gender: doc.gender || 'male',
      hospital: hospital
        ? hospital.legalName || hospital.displayName || hospital || 'Hospital'
        : 'Private Clinic',
      stars: doc.stars || '4.9',
      matches: doc.matches || 98,
      distance: doc.distance || '2.4 km',
    };
  });

  return (
    <main className="container max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Badge
              variant="secondary"
              className="text-blue-700 bg-blue-100 hover:bg-blue-100 px-3 py-1 font-bold uppercase tracking-widest text-xs border-blue-200"
            >
              <Search className="w-3 h-3 mr-2" />
              Doctor Directory
            </Badge>
            {isOffline && (
              <Badge
                variant="destructive"
                className="text-rose-700 bg-rose-50 border-rose-200 px-3 py-1 font-bold uppercase tracking-widest text-xs animate-pulse"
              >
                Offline Cache
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2 leading-tight uppercase">
            {speciality ? `${speciality} Specialists` : 'Specialists'}{' '}
            <span className="text-blue-600">in {city}</span>
          </h1>
          <p className="text-slate-500 text-base font-medium max-w-2xl leading-relaxed">
            {doctorsWithHospitals.length} verified specialists are currently available.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewBookmarks ? 'outline' : 'default'}
            size="sm"
            onClick={() => setViewBookmarks(false)}
            className="text-xs font-black uppercase tracking-wider rounded-xl"
          >
            All Doctors
          </Button>
          <Button
            variant={viewBookmarks ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewBookmarks(true)}
            className="text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5"
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" /> Bookmarked ({doctorsWithHospitals.length})
          </Button>
        </div>
      </div>

      <Card className="mb-8 p-1.5 border-slate-200/60 shadow-xl shadow-slate-200/10 rounded-2xl overflow-hidden bg-white/80 backdrop-blur-xl sticky top-4 z-50 ring-1 ring-slate-200/50">
        <form
          action="/search"
          method="GET"
          className="flex flex-col sm:flex-row items-center gap-1.5"
        >
          <input type="hidden" name="city" value={city} />
          {speciality && <input type="hidden" name="speciality" value={speciality} />}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5" />
            <Input
              name="q"
              type="text"
              placeholder="Find by name, symptom, or treatment..."
              defaultValue={query}
              className="w-full pl-14 border-0 focus-visible:ring-0 bg-transparent text-lg h-14 font-semibold placeholder:text-slate-400"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 h-14 text-base font-black shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            Search Now
          </Button>
        </form>
      </Card>

      <div className="mb-6 overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Select City
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide px-1">
          {cities.map((c) => (
            <Link
              key={c.id}
              href={`/search?city=${c.name}${speciality ? `&speciality=${speciality}` : ''}${query ? `&q=${query}` : ''}`}
            >
              <Badge
                variant={city === c.name ? 'default' : 'outline'}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all whitespace-nowrap ${city === c.name ? 'bg-slate-900 border-slate-900 shadow-md shadow-slate-900/10' : 'bg-white hover:bg-slate-50 border-slate-200'}`}
              >
                {c.name}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      <div className="mb-10 overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Filter by Speciality
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide px-1">
          <Link href={`/search?city=${city}${query ? `&q=${query}` : ''}`}>
            <Badge
              variant={!speciality ? 'default' : 'outline'}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all whitespace-nowrap ${!speciality ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-600/10' : 'bg-white hover:bg-slate-50 border-slate-200'}`}
            >
              All Specialities
            </Badge>
          </Link>
          {specialities.map((s) => (
            <Link
              key={s}
              href={`/search?city=${city}&speciality=${s}${query ? `&q=${query}` : ''}`}
            >
              <Badge
                variant={speciality === s ? 'default' : 'outline'}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all whitespace-nowrap ${speciality === s ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-600/10' : 'bg-white hover:bg-slate-50 border-slate-200'}`}
              >
                {s}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-48 rounded-2xl bg-slate-50 animate-pulse border-slate-100" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-red-50 rounded-[2rem] border-2 border-dashed border-red-200">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-slate-200/5">
            <Filter className="w-10 h-10 text-red-400" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-1 tracking-tight uppercase">
            Connection Error
          </h3>
          <p className="text-slate-600 text-sm font-medium max-w-md leading-relaxed">
            Failed to load doctors. Please check your connection and try again.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white rounded-xl"
          >
            Retry
          </Button>
        </div>
      ) : doctorsWithHospitals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-slate-200/5">
            <UserX className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-1 tracking-tight uppercase">
            No Specialists Found
          </h3>
          <p className="text-slate-600 text-sm font-medium max-w-md leading-relaxed">
            Try broadening your search or selecting a different city.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {doctorsWithHospitals.map((doc) => (
            <DoctorCard key={doc.id} doctor={doc} className="" />
          ))}
        </div>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageContent />
    </Suspense>
  );
}
