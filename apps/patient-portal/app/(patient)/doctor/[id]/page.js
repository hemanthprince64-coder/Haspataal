import {
  ChevronLeft,
  Star,
  Award,
  Users,
  MessageSquare,
  ShieldCheck,
  MapPin,
  Building2,
  Calendar,
  Phone,
  Share2,
  Heart,
} from 'lucide-react';

import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { services } from '@/lib/services';

export default async function DoctorProfile({ params }) {
  const { id } = await params;

  let doctor;
  try {
    doctor = await services.platform.getDoctorById(id);
  } catch (err) {
    console.error('Failed to load doctor profile:', err);
    doctor = null;
  }

  if (!doctor) {
    return (
      <main className="min-h-screen bg-slate-50/50 pb-24 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center border-slate-200 shadow-sm rounded-2xl">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 opacity-50" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
            Doctor Not Found
          </h2>
          <p className="text-slate-500 mb-8 font-medium">
            We couldn&apos;t find the specialist you&apos;re looking for. They may have moved or the
            link is invalid.
          </p>
          <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black">
            <Link href="/search">Browse All Doctors</Link>
          </Button>
        </Card>
      </main>
    );
  }

  // Extract primary affiliation data
  const currentAffiliation =
    doctor.affiliations?.find((a) => a.isCurrent) || doctor.affiliations?.[0];
  const hospital = currentAffiliation?.hospital;
  const hospitalName = hospital?.displayName || hospital?.legalName || 'Hospital';
  const speciality =
    currentAffiliation?.payload?.speciality ||
    currentAffiliation?.department ||
    'General Specialist';
  const experienceYears = doctor.experienceYears || 0;
  const consultationFee = currentAffiliation?.consultationFee || 500;

  // Profile image fallback
  const profileImage =
    doctor.profilePhotoUrl ||
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop';

  // Compute initials from full name
  const initials =
    doctor.fullName
      ?.split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'DR';

  // Compute rating & review count from real reviews
  const reviews = doctor.reviews || [];
  const reviewCount = reviews.length;
  const rating =
    reviewCount > 0
      ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviewCount).toFixed(1)
      : '4.5';

  // Build biography text
  const aboutText = `Dr. ${doctor.fullName} is a ${speciality.toLowerCase()} with ${experienceYears} ${experienceYears === 1 ? 'year' : 'years'} of clinical experience. They provide quality patient care and are affiliated with ${hospitalName}.`;

  return (
    <main className="min-h-screen bg-slate-50/50 pb-24 animate-fade-in">
      {/* Premium Header/Cover */}
      <div className="relative h-32 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
        <div className="container max-w-4xl mx-auto px-6 pt-6 relative z-10">
          <Button
            asChild
            variant="ghost"
            className="text-white hover:bg-white/10 -ml-2 font-bold h-8 text-xs"
          >
            <Link href="/search" className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Back
            </Link>
          </Button>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-6 -mt-16 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Basic Info */}
          <div className="flex-1">
            <Card className="rounded-xl border-slate-200 shadow-sm bg-white overflow-hidden mb-5">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row gap-5 items-center md:items-start text-center md:text-left">
                  <div className="relative">
                    <Avatar className="w-20 h-20 md:w-24 md:h-24 rounded-xl border-2 border-white shadow-md">
                      <AvatarImage
                        src={profileImage}
                        alt={doctor.fullName}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-blue-50 text-blue-600 text-xl font-black">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 mb-1.5">
                      <Badge className="bg-blue-600 hover:bg-blue-600 text-white px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-md">
                        {speciality}
                      </Badge>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        ID: {doctor.id.slice(-6).toUpperCase()}
                      </div>
                    </div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-1 uppercase">
                      Dr. {doctor.fullName}
                    </h1>
                    <div className="flex flex-col gap-1.5 text-slate-500 font-medium text-[11px]">
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <Building2 className="w-4 h-4 text-blue-500" />
                        <span className="font-black text-slate-700 tracking-tight uppercase text-[10px]">
                          {hospitalName}
                        </span>
                      </div>
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="font-bold">
                          {hospital?.city || ''} • {hospital?.addressLine1 || 'Main Center'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-6">
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col items-center justify-center">
                    <Award className="w-4 h-4 text-blue-600 mb-0.5" />
                    <div className="text-sm font-black text-slate-900 tracking-tight">
                      {experienceYears}+ Yrs
                    </div>
                    <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest">
                      Experience
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col items-center justify-center">
                    <Users className="w-4 h-4 text-emerald-500 mb-0.5" />
                    <div className="text-sm font-black text-slate-900 tracking-tight">
                      {reviewCount > 0 ? `${reviewCount}+` : '500+'}
                    </div>
                    <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest">
                      Patients
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col items-center justify-center">
                    <Star className="w-4 h-4 text-amber-500 mb-0.5 fill-amber-500" />
                    <div className="text-sm font-black text-slate-900 tracking-tight">{rating}</div>
                    <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none text-center">
                      Reviews
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="px-2">
              <h3 className="text-lg font-black text-slate-900 mb-2 tracking-tight uppercase">
                Biography
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium mb-6">{aboutText}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                      Verified
                    </div>
                    <div className="text-xs font-black text-slate-900">
                      {doctor.kycStatus === 'VERIFIED' ? 'MCI Verified' : 'Verification Pending'}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                      Languages
                    </div>
                    <div className="text-xs font-black text-slate-900">English, Hindi</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Actions */}
          <div className="lg:w-72">
            <Card className="rounded-xl border-slate-200 shadow-lg bg-white overflow-hidden sticky top-8">
              <CardContent className="p-5">
                <div className="text-center mb-5">
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                    Fee
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    ₹{consultationFee}
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50 py-1 px-2 rounded-lg text-[9px] font-black uppercase tracking-wide">
                    <Calendar className="w-2.5 h-2.5" /> Available Today
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <Button
                    asChild
                    className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-black text-xs uppercase tracking-widest"
                  >
                    <Link
                      href={`/book?doctorId=${doctor.id}&hospitalId=${currentAffiliation?.hospitalId || ''}`}
                    >
                      Book Now
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-10 bg-white border-slate-200 text-slate-600 rounded-lg font-black text-xs uppercase tracking-widest"
                  >
                    <Phone className="w-3.5 h-3.5 mr-2" /> Contact
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="flex-1 h-10 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg border border-slate-200 transition-all"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="flex-1 h-10 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl border border-slate-200 transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
