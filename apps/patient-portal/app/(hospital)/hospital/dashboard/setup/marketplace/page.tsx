'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Globe,
  Plus,
  Search,
  Filter,
  Image as ImageIcon,
  ShieldCheck,
  Heart,
  CreditCard,
  Calendar,
  Clock,
  Lock,
  Layout,
  Settings,
  History,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  MapPin,
  Camera,
  Briefcase,
  FileText,
  Share2,
  Eye,
  Monitor,
  Smartphone,
  Stethoscope,
  Building2,
  Umbrella,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MarketplaceSetupPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('listing');
  const [config, setConfig] = useState({
    isListedOnMarketplace: false,
    marketplaceTagline: '',
    marketplaceAbout: '',
    showConsultationFees: true,
    allowOnlineBooking: true,
    showBedCharges: false,
    requiresApproval: false,
    cancellationPolicy: 'FLEXIBLE',
    depositRequired: false,
    depositAmount: 0,
    allowsInstantBooking: true,
    specialities: [] as string[],
    marketplaceFacilities: [] as string[],
    insurancePanels: [] as string[],
    galleryUrls: [] as string[],
    coverImageUrl: '',
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/hospital/setup/marketplace');
        const data = await res.json();
        if (data.hospital) {
          setConfig((prev) => ({
            ...prev,
            ...data.hospital,
            marketplaceTagline: data.hospital.marketplaceTagline || '',
            marketplaceAbout: data.hospital.marketplaceAbout || '',
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleUpdate = async (updates: any) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
  };

  const persistChanges = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/hospital/setup/marketplace', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('Failed to save changes');
      toast.success('Marketplace profile updated successfully');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (type: 'cover' | 'gallery') => {
    // Simulated upload logic
    const mockUrl = `https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80`;
    if (type === 'cover') {
      handleUpdate({ coverImageUrl: mockUrl });
    } else {
      handleUpdate({ galleryUrls: [...config.galleryUrls, mockUrl] });
    }
    toast.info('Branding asset uploaded (Simulated)');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-blue-600 rounded-[1.5rem] shadow-2xl shadow-blue-100">
            <Globe className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
              Public Marketplace
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Configure your global presence, clinical branding, and patient booking policies
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-12 px-6 rounded-2xl border-slate-200 font-bold text-slate-600 bg-white"
          >
            <Eye className="h-4 w-4 mr-2" /> Live Preview
          </Button>
          <Button
            onClick={persistChanges}
            disabled={saving}
            className="bg-slate-900 hover:bg-black h-12 px-10 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-200"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-2" />
            )}
            Publish Profile
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
        <TabsList className="bg-white p-1 rounded-2xl border border-slate-200 h-16 shadow-sm inline-flex">
          <TabsTrigger
            value="listing"
            className="rounded-xl px-8 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest"
          >
            Core Listing
          </TabsTrigger>
          <TabsTrigger
            value="content"
            className="rounded-xl px-8 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest"
          >
            Rich Media & SEO
          </TabsTrigger>
          <TabsTrigger
            value="policies"
            className="rounded-xl px-8 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest"
          >
            Booking Protocols
          </TabsTrigger>
          <TabsTrigger
            value="insurance"
            className="rounded-xl px-8 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest"
          >
            Insurance Panels
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="listing"
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <section className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm space-y-8">
              <div className="flex items-center justify-between p-6 bg-blue-50 rounded-[2rem] border border-blue-100">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                    <Globe className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest leading-none mb-1 text-blue-900">
                      Marketplace Visibility
                    </p>
                    <p className="text-[10px] text-blue-700 font-medium italic">
                      Make your hospital discoverable on Haspataal.com
                    </p>
                  </div>
                </div>
                <Switch
                  checked={config.isListedOnMarketplace}
                  onCheckedChange={(v) => handleUpdate({ isListedOnMarketplace: v })}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Marketplace Tagline
                </label>
                <Input
                  placeholder="e.g., Premier Cardiac Care & Orthopedic Excellence"
                  value={config.marketplaceTagline}
                  onChange={(e) => handleUpdate({ marketplaceTagline: e.target.value })}
                  className="h-14 rounded-2xl border-slate-200 font-bold text-lg px-6"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  About the Facility (Clinical Profile)
                </label>
                <Textarea
                  placeholder="Describe your hospital, history, and medical mission..."
                  className="min-h-[200px] rounded-[2rem] border-slate-200 font-medium p-6"
                  value={config.marketplaceAbout}
                  onChange={(e) => handleUpdate({ marketplaceAbout: e.target.value })}
                />
              </div>
            </section>

            <section className="space-y-8">
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                  <h3 className="text-xl font-black mb-6 tracking-tight flex items-center gap-3">
                    <Stethoscope className="h-6 w-6 text-blue-400" /> Specialties & Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Oncology'].map(
                      (spec) => (
                        <Badge
                          key={spec}
                          className="bg-white/10 text-white border-none font-bold py-1.5 px-4 rounded-xl hover:bg-white/20 cursor-pointer"
                        >
                          {spec}
                        </Badge>
                      ),
                    )}
                    <button className="h-8 w-8 bg-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
                  <Briefcase className="h-48 w-48" />
                </div>
              </div>

              <div className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm">
                <h3 className="text-xl font-black mb-6 tracking-tight flex items-center gap-3">
                  <Layout className="h-6 w-6 text-blue-600" /> Facility Amenities
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {['24/7 Pharmacy', 'Ambulance', 'ICU', 'Cafeteria', 'Parking', 'WiFi'].map(
                    (fac) => (
                      <div
                        key={fac}
                        className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs font-bold text-slate-700">{fac}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </section>
          </div>
        </TabsContent>

        <TabsContent
          value="content"
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-10 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800 tracking-tight mb-2">
                Visual Branding & Media
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Patients are 70% more likely to book if they see high-quality facility photos.
              </p>
            </div>
            <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div
                onClick={() => handleImageUpload('cover')}
                className={`aspect-[16/9] rounded-[2rem] border-2 border-dashed ${config.coverImageUrl ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'} flex flex-col items-center justify-center text-center p-6 hover:bg-slate-50 transition-all cursor-pointer overflow-hidden relative`}
              >
                {config.coverImageUrl ? (
                  <Image
                    src={config.coverImageUrl}
                    alt="Hospital Cover"
                    fill
                    className="object-cover opacity-20"
                  />
                ) : (
                  <div className="h-12 w-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                    <Camera className="h-6 w-6 text-slate-300" />
                  </div>
                )}
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest relative z-10">
                  {config.coverImageUrl ? 'Change Cover Image' : 'Upload Cover Image'}
                </p>
                <p className="text-[10px] text-slate-300 mt-1 uppercase font-black tracking-tighter relative z-10">
                  Recommended: 1920x1080px
                </p>
              </div>
              <div
                onClick={() => handleImageUpload('gallery')}
                className="aspect-[16/9] rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-6 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <div className="h-12 w-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-slate-300" />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Add Gallery Item
                </p>
                <p className="text-[10px] text-slate-300 mt-1 uppercase font-black tracking-tighter">
                  Upload room / ward / OT photos
                </p>
              </div>
              {config.galleryUrls.map((url, i) => (
                <div
                  key={i}
                  className="aspect-[16/9] rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm relative group"
                >
                  <Image src={url} alt={`Gallery Image ${i + 1}`} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" className="text-white">
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="policies"
          className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <section className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm">
              <h2 className="text-xl font-black text-slate-800 tracking-tight mb-8 flex items-center gap-3">
                <Calendar className="h-6 w-6 text-blue-600" /> Appointment Protocols
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">
                      Instant Booking
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium italic">
                      Confirmed immediately without staff review
                    </p>
                  </div>
                  <Switch
                    checked={config.allowsInstantBooking}
                    onCheckedChange={(v) => handleUpdate({ allowsInstantBooking: v })}
                  />
                </div>
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">
                      Fee Transparency
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium italic">
                      Show consultation & bed charges on profile
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Badge
                      variant="outline"
                      className={`cursor-pointer ${config.showConsultationFees ? 'bg-blue-50 border-blue-200 text-blue-600' : 'text-slate-400'}`}
                      onClick={() =>
                        handleUpdate({ showConsultationFees: !config.showConsultationFees })
                      }
                    >
                      OPD
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`cursor-pointer ${config.showBedCharges ? 'bg-blue-50 border-blue-200 text-blue-600' : 'text-slate-400'}`}
                      onClick={() => handleUpdate({ showBedCharges: !config.showBedCharges })}
                    >
                      IPD
                    </Badge>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm">
              <h2 className="text-xl font-black text-slate-800 tracking-tight mb-8 flex items-center gap-3">
                <Lock className="h-6 w-6 text-rose-600" /> Cancellation & Deposits
              </h2>
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Cancellation Strictness
                  </label>
                  <Select
                    value={config.cancellationPolicy}
                    onValueChange={(v) => handleUpdate({ cancellationPolicy: v })}
                  >
                    <SelectTrigger className="h-14 rounded-2xl border-slate-200 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl font-bold">
                      <SelectItem value="FLEXIBLE">Flexible (Free until 2h before)</SelectItem>
                      <SelectItem value="MODERATE">Moderate (50% charge if &lt; 24h)</SelectItem>
                      <SelectItem value="STRICT">Strict (Non-refundable)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between p-6 bg-slate-900 rounded-[2rem] text-white">
                  <div className="flex items-center gap-4">
                    <CreditCard className="h-6 w-6 text-blue-400" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">
                        Pre-paid Deposits
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium italic">
                        Collect part-payment at time of booking
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={config.depositRequired}
                    onCheckedChange={(v) => handleUpdate({ depositRequired: v })}
                  />
                </div>
              </div>
            </section>
          </div>
        </TabsContent>

        <TabsContent
          value="insurance"
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-14 w-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <Umbrella className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">
                  Insurance & TPA Panels
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  List the insurance companies and TPAs you have cashless tie-ups with.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[
                'Star Health',
                'HDFC ERGO',
                'Niva Bupa',
                'ICICI Lombard',
                'Care Health',
                'TATA AIG',
              ].map((panel) => (
                <div
                  key={panel}
                  className="flex items-center gap-3 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 hover:border-emerald-200 transition-all group cursor-pointer"
                >
                  <div className="h-4 w-4 rounded-full border-2 border-slate-200 group-hover:border-emerald-500 group-hover:bg-emerald-500 transition-all shrink-0"></div>
                  <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">
                    {panel}
                  </span>
                </div>
              ))}
              <button className="flex items-center justify-center gap-3 p-5 border-2 border-dashed border-slate-200 rounded-[1.5rem] text-slate-400 hover:bg-slate-50 hover:border-slate-300 transition-all">
                <Plus className="h-4 w-4" />{' '}
                <span className="text-xs font-black uppercase">Add TPA</span>
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
