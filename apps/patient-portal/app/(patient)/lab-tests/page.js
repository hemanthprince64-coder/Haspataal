'use client';

import {
  Search,
  ChevronLeft,
  FlaskConical,
  Microscope,
  Activity,
  Star,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Loader2,
  ClipboardList,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

import { useState, useEffect } from 'react';

import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LabTestsPage() {
  const [activeTab, setActiveTab] = useState('packages');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  const [selectedTests, setSelectedTests] = useState([]);
  const [hospitalId, setHospitalId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const AVAILABLE_TESTS = [
    {
      id: 't1',
      name: 'Complete Blood Count (CBC)',
      category: 'Blood',
      price: 299,
      sample: 'Blood',
    },
    { id: 't2', name: 'Lipid Profile', category: 'Blood', price: 499, sample: 'Fasting Blood' },
    {
      id: 't3',
      name: 'Thyroid Profile (T3, T4, TSH)',
      category: 'Blood',
      price: 599,
      sample: 'Blood',
    },
    { id: 't4', name: 'HbA1c', category: 'Blood', price: 450, sample: 'Blood' },
    { id: 't5', name: 'Vitamin D', category: 'Blood', price: 899, sample: 'Blood' },
    {
      id: 't6',
      name: 'Liver Function Test (LFT)',
      category: 'Blood',
      price: 550,
      sample: 'Fasting Blood',
    },
    {
      id: 't7',
      name: 'Kidney Function Test (KFT)',
      category: 'Blood',
      price: 550,
      sample: 'Blood',
    },
    { id: 't8', name: 'Urine R/M', category: 'Urine', price: 199, sample: 'Urine' },
  ];

  const packages = [
    {
      id: 'pkg-1',
      name: 'Comprehensive Full Body Checkup',
      includes: 'CBC, Lipid, Thyroid, LFT, KFT',
      price: 1499,
      originalPrice: 2999,
      discount: '50% OFF',
      tag: 'Best Seller',
      color: 'from-blue-600 to-indigo-600',
      testIds: ['t1', 't2', 't3', 't6', 't7'],
    },
    {
      id: 'pkg-2',
      name: 'Advanced Heart Care Package',
      includes: 'Lipid Profile, Blood Sugar, HbA1c, ECG',
      price: 899,
      originalPrice: 1500,
      discount: '40% OFF',
      color: 'from-rose-600 to-red-600',
      testIds: ['t2', 't4'],
    },
    {
      id: 'pkg-3',
      name: 'Diabetes Care Panel',
      includes: 'HbA1c, Fasting Blood Sugar, Post Prandial Sugar',
      price: 699,
      originalPrice: 1200,
      discount: '42% OFF',
      color: 'from-amber-500 to-orange-500',
      testIds: ['t4', 't6'],
    },
  ];

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/patient/lab-orders');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setOrders(data.orders ?? []);
    } catch {
      // silently fail for unauthenticated users
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const handleBookPackage = async (pkg) => {
    if (!hospitalId) {
      toast.error('Please select a hospital first');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/patient/lab-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalId, testIds: pkg.testIds }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Booking failed');
      }
      toast.success('Lab order placed successfully');
      setBookingOpen(false);
      setSelectedTests([]);
      fetchOrders();
      setActiveTab('orders');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookCustom = async () => {
    if (!hospitalId) {
      toast.error('Please select a hospital first');
      return;
    }
    if (selectedTests.length === 0) {
      toast.error('Please select at least one test');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/patient/lab-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalId, testIds: selectedTests }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Booking failed');
      }
      toast.success('Lab order placed successfully');
      setBookingOpen(false);
      setSelectedTests([]);
      fetchOrders();
      setActiveTab('orders');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTest = (testId) => {
    setSelectedTests((prev) =>
      prev.includes(testId) ? prev.filter((id) => id !== testId) : [...prev, testId],
    );
  };

  const getStatusBadge = (status) => {
    const map = {
      ORDERED: { className: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Ordered' },
      SAMPLE_COLLECTED: {
        className: 'bg-amber-50 text-amber-700 border-amber-200',
        label: 'Sample Collected',
      },
      PROCESSING: {
        className: 'bg-purple-50 text-purple-700 border-purple-200',
        label: 'Processing',
      },
      COMPLETED: {
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        label: 'Completed',
      },
      CANCELLED: { className: 'bg-red-50 text-red-700 border-red-200', label: 'Cancelled' },
    };
    const s = map[status] || {
      className: 'bg-gray-50 text-gray-600 border-gray-200',
      label: status,
    };
    return (
      <Badge variant="outline" className={`text-[10px] font-bold border ${s.className}`}>
        {s.label}
      </Badge>
    );
  };

  return (
    <main
      className="container max-w-5xl mx-auto px-6 py-10 animate-fade-in"
      suppressHydrationWarning
    >
      <Button
        asChild
        variant="ghost"
        className="mb-8 text-slate-500 hover:text-blue-600 -ml-4 font-bold"
      >
        <Link href="/" className="flex items-center gap-2">
          <ChevronLeft className="w-5 h-5" /> Back to Home
        </Link>
      </Button>

      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant="secondary"
                className="text-blue-700 bg-blue-100/50 hover:bg-blue-100 border-blue-200 px-3 py-1 font-bold text-[10px] uppercase tracking-[0.2em] backdrop-blur-sm"
              >
                <FlaskConical className="w-3.5 h-3.5 mr-2" /> Diagnostics
              </Badge>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2">Lab Tests</h1>
            <p className="text-slate-500 text-lg font-medium tracking-tight">
              Book trusted NABL certified diagnostic services at home or clinic.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-emerald-50 px-6 py-4 rounded-[2rem] border border-emerald-100 shadow-sm shadow-emerald-900/5">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <div className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest leading-none mb-1">
                Safety protocol
              </div>
              <div className="text-xs font-black text-emerald-900">100% Sterile Collection</div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mb-12">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <Search className="w-6 h-6 text-slate-400" />
        </div>
        <Input
          placeholder="Search for tests, packages or symptoms..."
          className="h-20 pl-16 rounded-[2.5rem] border-slate-200 bg-white shadow-2xl shadow-slate-200/50 text-xl font-bold focus-visible:ring-blue-500/20 focus-visible:ring-4 focus-visible:border-blue-300 transition-all"
          suppressHydrationWarning
        />
        <Button
          className="absolute right-3 top-3 bottom-3 rounded-[1.8rem] bg-slate-900 hover:bg-slate-800 text-white px-8 font-black uppercase tracking-widest text-xs"
          suppressHydrationWarning
        >
          Search Tests
        </Button>
      </div>

      <Tabs defaultValue="packages" className="w-full" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2 scrollbar-none">
          <TabsList
            className="bg-slate-100/50 p-2 rounded-[2rem] border border-slate-200 h-auto"
            suppressHydrationWarning
          >
            <TabsTrigger
              value="packages"
              className="px-8 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all"
              suppressHydrationWarning
            >
              Health Packages
            </TabsTrigger>
            <TabsTrigger
              value="blood"
              className="px-8 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all"
              suppressHydrationWarning
            >
              Blood Tests
            </TabsTrigger>
            <TabsTrigger
              value="imaging"
              className="px-8 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all"
              suppressHydrationWarning
            >
              Imaging
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="px-8 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all"
              suppressHydrationWarning
            >
              My Lab Orders
            </TabsTrigger>
          </TabsList>

          <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
            <Button
              variant="outline"
              className="rounded-[1.5rem] border-slate-200 font-black text-[10px] uppercase tracking-widest px-6 ml-4"
              suppressHydrationWarning
              onClick={() => setBookingOpen(true)}
            >
              <Sparkles className="w-3.5 h-3.5 mr-2" /> Book Custom Tests
            </Button>
            <DialogContent className="sm:max-w-lg rounded-[2rem]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Book Lab Tests</DialogTitle>
                <DialogDescription>
                  Select a hospital and choose tests to create a diagnostic order.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Select Hospital
                  </label>
                  <Select value={hospitalId} onValueChange={(v) => setHospitalId(v)}>
                    <SelectTrigger className="rounded-xl h-12 border-slate-200 font-bold">
                      <SelectValue placeholder="Choose hospital" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="hosp-1">Apollo Hospitals</SelectItem>
                      <SelectItem value="hosp-2">Fortis Healthcare</SelectItem>
                      <SelectItem value="hosp-3">Max Healthcare</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Available Tests
                  </label>
                  <ScrollArea className="h-64 rounded-xl border border-slate-200 p-3">
                    <div className="space-y-2">
                      {AVAILABLE_TESTS.map((test) => {
                        const selected = selectedTests.includes(test.id);
                        return (
                          <button
                            key={test.id}
                            onClick={() => toggleTest(test.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                              selected
                                ? 'border-blue-300 bg-blue-50'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <div className="text-left">
                              <p className="text-sm font-bold text-slate-900">{test.name}</p>
                              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                {test.sample}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-black text-slate-900">
                                ₹{test.price}
                              </span>
                              {selected && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>

                {selectedTests.length > 0 && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Selected Tests
                      </p>
                      <p className="text-lg font-black text-slate-900">
                        {selectedTests.length} tests
                      </p>
                    </div>
                    <Button
                      onClick={handleBookCustom}
                      disabled={submitting}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-6 font-black"
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Book Now
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent
          value="packages"
          className="space-y-8 animate-in slide-in-from-bottom-5 duration-500"
        >
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Popular Health Packages
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                className="group rounded-[3rem] border-none shadow-[0_32px_64px_-16px_rgba(37,99,235,0.08)] bg-white overflow-hidden hover:scale-[1.01] transition-all duration-500 relative"
              >
                {pkg.tag && (
                  <div className="absolute top-0 right-10 z-10">
                    <Badge className="bg-amber-500 hover:bg-amber-500 text-white font-black text-[9px] uppercase tracking-[0.2em] px-4 py-3 rounded-b-2xl border-none shadow-xl">
                      {pkg.tag}
                    </Badge>
                  </div>
                )}

                <CardHeader className="p-10 pb-6">
                  <CardTitle className="text-3xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                    {pkg.name}
                  </CardTitle>
                  <CardDescription className="text-slate-500 font-medium text-lg flex items-center gap-2 mt-4">
                    <FlaskConical className="w-5 h-5 text-blue-500" /> Includes {pkg.includes}
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-10 py-6">
                  <div className="flex flex-wrap gap-2">
                    {['Sugar', 'Lipid', 'Liver', 'Kidney', 'Blood'].map((m) => (
                      <Badge
                        key={m}
                        variant="secondary"
                        className="bg-slate-100 text-slate-500 font-bold px-3 py-1 rounded-lg"
                      >
                        {m}
                      </Badge>
                    ))}
                    <Badge
                      variant="secondary"
                      className="bg-blue-50 text-blue-600 font-black px-3 py-1 rounded-lg border border-blue-100"
                    >
                      +77 more
                    </Badge>
                  </div>
                </CardContent>

                <CardFooter className="p-10 pt-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-4xl font-black text-slate-900 tabular-nums tracking-tighter">
                        ₹{pkg.price}
                      </span>
                      <span className="text-lg text-slate-300 line-through tabular-nums font-bold">
                        ₹{pkg.originalPrice}
                      </span>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 font-black text-[10px] uppercase tracking-wider px-3 py-1 border-none">
                      {pkg.discount} EXCLUSIVE
                    </Badge>
                  </div>
                  <Button
                    className="h-16 px-10 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-base shadow-2xl shadow-slate-900/20 active:scale-95 transition-all group/btn"
                    suppressHydrationWarning
                    onClick={() => handleBookPackage(pkg)}
                  >
                    Book Now{' '}
                    <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent
          value="blood"
          className="space-y-6 animate-in slide-in-from-bottom-5 duration-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AVAILABLE_TESTS.filter((t) => t.category === 'Blood').map((test) => (
              <Card
                key={test.id}
                className="rounded-[2rem] border border-slate-200 bg-white hover:border-blue-300 transition-all"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[9px] font-black uppercase border-slate-200"
                    >
                      {test.sample}
                    </Badge>
                  </div>
                  <h4 className="text-base font-black text-slate-900 mb-1">{test.name}</h4>
                  <p className="text-2xl font-black text-slate-900 mb-4">₹{test.price}</p>
                  <Button
                    className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest h-11"
                    onClick={() => {
                      setSelectedTests([test.id]);
                      setHospitalId('hosp-1');
                      setBookingOpen(true);
                    }}
                  >
                    Add to Order
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent
          value="imaging"
          className="py-24 text-center animate-in slide-in-from-bottom-5 duration-500"
        >
          <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Microscope className="w-12 h-12 text-blue-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Imaging & Radiology</h3>
          <p className="text-slate-500 text-lg font-medium max-w-md mx-auto">
            X-Ray, MRI, CT Scan and ultrasound bookings will be available here. Use packages above
            for lab tests.
          </p>
        </TabsContent>

        <TabsContent value="orders" className="mt-0 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-slate-900">My Lab Orders</h3>
            <Button
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest h-10 px-5"
              onClick={() => setBookingOpen(true)}
            >
              <Sparkles className="w-3.5 h-3.5 mr-2" /> New Order
            </Button>
          </div>

          {loadingOrders ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
          ) : orders.length === 0 ? (
            <Card className="rounded-[2rem] border-2 border-dashed border-slate-200 bg-white">
              <CardContent className="py-20 text-center">
                <ClipboardList className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-slate-900 mb-2">No lab orders yet</h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto">
                  Book health packages or individual tests from the catalog above.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card
                  key={order.id}
                  className="rounded-[2rem] border border-slate-200 bg-white hover:border-blue-200 transition-all"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-black text-slate-900">
                            {order.items?.map((i) => i.test?.testName || i.testName).join(', ') ||
                              'Lab Order'}
                          </h4>
                          {getStatusBadge(order.orderStatus)}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-semibold">
                          <span>
                            {order.hospital?.displayName || order.hospital?.legalName || 'Hospital'}
                          </span>
                          <span className="hidden md:inline text-slate-300">•</span>
                          <span>
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          {order.invoices?.[0] && (
                            <>
                              <span className="hidden md:inline text-slate-300">•</span>
                              <span className="font-bold text-slate-700">
                                ₹
                                {Number(order.invoices[0].totalAmount || 0).toLocaleString('en-IN')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {order.items?.some((i) => i.results?.length > 0) && (
                          <Button
                            variant="outline"
                            className="rounded-xl border-slate-200 font-bold text-xs h-10 px-5"
                          >
                            View Report
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
