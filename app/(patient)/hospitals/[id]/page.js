import { services } from "@/lib/services";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, MapPin, Star, ShieldCheck, Clock, Users, ArrowRight, ChevronLeft, Calendar, Info, MessageCircle, Map, Heart, Activity, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DoctorCard from "../../components/DoctorCard";

export default async function HospitalDetailPage({ params }) {
    const { id } = await params;
    const hospital = await services.platform.getHospitalById(id);

    if (!hospital) {
        notFound();
    }

    const doctorsRaw = await services.platform.getHospitalDoctors(hospital.id);
    const reviewsRaw = await services.platform.getHospitalReviews(hospital.id);
    const doctors = Array.isArray(doctorsRaw) ? doctorsRaw : [];
    const reviews = Array.isArray(reviewsRaw) ? reviewsRaw : [];
    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : hospital.rating;

    return (
        <main className="container max-w-5xl mx-auto px-6 py-10 animate-fade-in text-slate-900">
            <Button asChild variant="ghost" className="mb-8 text-slate-500 hover:text-blue-600 -ml-4 font-bold">
                <Link href="/hospitals" className="flex items-center gap-2">
                    <ChevronLeft className="w-5 h-5" /> All Hospitals
                </Link>
            </Button>
            
            {/* Hospital Hero Section */}
            <Card className="mb-10 rounded-2xl border-slate-200/60 shadow-xl shadow-slate-200/5 overflow-hidden bg-white">
                <div className="h-52 bg-slate-900 relative flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 opacity-80" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:20px_20px]" />
                    <Building2 className="w-32 h-32 text-white/20 relative z-10" />
                    
                    <div className="absolute bottom-8 left-8 right-8 z-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <Badge className="bg-white/20 backdrop-blur-md text-white border-white/20 font-black text-[9px] uppercase tracking-[0.2em] px-3 py-1 rounded-lg">
                                Verified Institute
                            </Badge>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight uppercase">{hospital.name}</h1>
                            <div className="flex items-center gap-4 text-white/80 font-bold tracking-tight">
                                <Link href="#" className="flex items-center gap-2 hover:text-white transition-colors">
                                    <MapPin className="w-4 h-4" /> {hospital.area}, {hospital.city}
                                </Link>
                                <div className="w-1 h-1 bg-white/40 rounded-full" />
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Open 24/7
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl p-3 rounded-2xl border border-white/10">
                            <div className="text-center px-3">
                                <div className="text-2xl font-black text-white flex items-center gap-2 leading-none">
                                    {avgRating} <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                                </div>
                                <div className="text-[9px] font-black text-white/60 uppercase tracking-widest mt-1">{reviews.length} Reviews</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <CardContent className="p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-xl font-black text-slate-900 tracking-tight leading-none">{doctors.length}</div>
                                <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Specialists</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-emerald-600 tracking-tight">Active</div>
                                <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Quality Sync</div>
                            </div>
                        </div>
                        <div className="md:col-span-2 flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                                    <Activity className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-base font-black tracking-tight leading-none mb-1">Emergency Support</div>
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Ambulance & Trauma</div>
                                </div>
                            </div>
                            <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-white/10 text-blue-400">
                                <Phone className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    <Tabs defaultValue="doctors" className="space-y-8">
                        <TabsList className="w-full bg-slate-50 p-1 rounded-xl h-12 border border-slate-100 px-1">
                            <TabsTrigger value="doctors" className="flex-1 h-full rounded-xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600">
                                Our Specialists
                            </TabsTrigger>
                            <TabsTrigger value="reviews" className="flex-1 h-full rounded-xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600">
                                Patient Feedback
                            </TabsTrigger>
                            <TabsTrigger value="about" className="flex-1 h-full rounded-xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600">
                                About Facility
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="doctors" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2">
                            {doctors.length === 0 ? (
                                <div className="py-24 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                                    <p className="text-slate-500 font-bold">No listed specialists found for this location.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {doctors.map(doc => (
                                        <DoctorCard 
                                            key={doc.id} 
                                            doctor={{
                                                ...doc,
                                                fees: doc.fee, // Ensure mapping consistency
                                                hospital: hospital.name,
                                                hospitalId: hospital.id,
                                                gender: doc.gender || "male",
                                                stars: doc.rating || "4.8",
                                                matches: 98,
                                                distance: "Nearby"
                                            }} 
                                        />
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="reviews" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2">
                            {reviews.length === 0 ? (
                                <div className="py-24 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                                    <p className="text-slate-500 font-bold">No patient verified reviews yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {reviews.map(review => (
                                        <Card key={review.id} className="rounded-[2rem] border-slate-100 bg-white group hover:border-blue-200 transition-all">
                                            <CardContent className="p-8">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-blue-50 transition-colors">
                                                            <Users className="w-6 h-6 text-slate-400 group-hover:text-blue-500" />
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-slate-800">Patient ***{review.patientMobile.slice(-4)}</div>
                                                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-0.5">Verified Visit</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
                                                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                                        <span className="font-black text-amber-700 text-sm">{review.rating}.0</span>
                                                    </div>
                                                </div>
                                                <p className="text-slate-600 font-medium leading-relaxed italic text-lg">&quot;{review.comment}&quot;</p>
                                                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                                                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                                        {new Date(review.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </div>
                                                    <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px] uppercase tracking-widest">Authentic Feedback</Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                        
                        <TabsContent value="about" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2">
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <Card className="md:col-span-2 rounded-[2.5rem] border-slate-200/60 bg-white p-8">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4">About the Facility</h3>
                                    <p className="text-slate-500 leading-relaxed font-medium mb-8">
                                        {hospital.name} is a state-of-the-art medical facility located in {hospital.area}. We provide comprehensive healthcare services through our network of elite specialists and dedicated support staff. Our facility is equipped with the latest diagnostic technology and emergency response systems.
                                    </p>
                                    <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-4">Facility Features</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['24x7 Emergency', 'Pharmacy On-site', 'Modern Labs', 'Patient Recovery Suites', 'Ambulance Support', 'Insurance Cashless'].map(feat => (
                                            <div key={feat} className="flex items-center gap-3 text-sm font-bold text-slate-600 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> {feat}
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                                <div className="space-y-6">
                                    <Card className="rounded-[2.5rem] border-slate-200/60 bg-slate-900 text-white p-8 shadow-2xl">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                                                <Map className="w-6 h-6 text-blue-400" />
                                            </div>
                                            <h4 className="font-black text-xl tracking-tight">Location</h4>
                                        </div>
                                        <p className="text-slate-400 text-sm font-bold leading-relaxed mb-6">
                                            {hospital.addressLine1 || hospital.area}<br/>
                                            {hospital.city}, Maharashtra<br/>
                                            Pincode: 400001
                                        </p>
                                        <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest">
                                            Get Navigation <MapPin className="ml-2 w-3.5 h-3.5" />
                                        </Button>
                                    </Card>
                                    <Card className="rounded-[2.5rem] border-emerald-100 bg-emerald-50/30 p-8">
                                        <div className="flex items-center gap-4 mb-4 text-emerald-600">
                                            <ShieldCheck className="w-8 h-8" />
                                            <h4 className="font-black text-xl tracking-tight">Safeguard</h4>
                                        </div>
                                        <p className="text-emerald-700/70 text-sm font-bold leading-relaxed mb-0">
                                            This hospital is Haspataal-Verified for quality standards.
                                        </p>
                                    </Card>
                                </div>
                             </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </main>
    );
}

function CheckCircle2(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
