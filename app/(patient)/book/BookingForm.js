'use client'

import { useActionState, useState, useEffect, useRef } from 'react';
import { bookAppointment, getAvailableSlotsAction } from '@/app/actions';
import Link from 'next/link';
import { Calendar as CalendarIcon, Clock, CheckCircle2, Wallet, AlertCircle, Loader2, ChevronRight, BookmarkCheck, ShieldCheck, CreditCard } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

const initialState = {
    message: '',
    success: false
};

export default function BookingForm({ doctorId, hospitalId }) {
    const [state, formAction, isPending] = useActionState(bookAppointment, initialState);

    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(today);
    const [slots, setSlots] = useState([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [mounted, setMounted] = useState(false);

    const selectedSlotRef = useRef(selectedSlot);
    selectedSlotRef.current = selectedSlot;

    useEffect(() => {
        setMounted(true);
        let isMounted = true;

        async function fetchSlots() {
            if (!doctorId || !selectedDate) return;
            setIsLoadingSlots(true);
            try {
                const available = await getAvailableSlotsAction(doctorId, selectedDate);
                if (isMounted) {
                    setSlots(available);
                    const currentSlot = selectedSlotRef.current;
                    if (currentSlot && !available.find(s => s.time === currentSlot && s.available)) {
                        setSelectedSlot('');
                    }
                }
            } catch (error) {
                console.error('Failed to load slots', error);
            } finally {
                if (isMounted) setIsLoadingSlots(false);
            }
        }

        fetchSlots();

        return () => { isMounted = false; };
    }, [doctorId, selectedDate]);


    if (state?.success) {
        return (
            <Card className="animate-in fade-in zoom-in duration-700 border-none shadow-[0_32px_64px_-16px_rgba(16,185,129,0.1)] bg-white overflow-hidden rounded-[3rem] relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-400" />
                <CardContent className="p-8 text-center flex flex-col items-center">
                    <div className="relative mb-6">
                        <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center ring-1 ring-emerald-100/50">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center ring-1 ring-slate-100">
                             <BookmarkCheck className="w-4 h-4 text-blue-600" />
                        </div>
                    </div>
                    
                    <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight uppercase">Confirmed</h2>
                    <p className="text-slate-500 text-sm font-medium mb-8 max-w-xs mx-auto leading-relaxed">
                        {state.message || "Your medical consultation has been successfully scheduled."}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-sm mx-auto">
                        <Button asChild size="sm" className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 px-6 font-black text-xs uppercase tracking-widest shadow-lg">
                            <Link href="/appointments">View Visits</Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl h-11 px-6 font-black text-xs uppercase tracking-widest">
                            <Link href="/search">Book Another</Link>
                        </Button>
                    </div>
                    
                    <p className="mt-6 text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]" suppressHydrationWarning>
                        Ref: {mounted ? Math.random().toString(36).substring(7).toUpperCase() : "..."}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-lg border-slate-200 rounded-2xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-5">
                <CardTitle className="text-lg font-black flex items-center gap-3 text-slate-900 tracking-tight uppercase">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                        <BookmarkCheck className="w-5 h-5 text-white" />
                    </div>
                    Schedule
                </CardTitle>
                <CardDescription className="text-slate-500 text-xs font-medium ml-11">Choose your preferred date and time.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <form action={formAction} className="space-y-10">
                    <input type="hidden" name="doctorId" value={doctorId || ''} />
                    <input type="hidden" name="hospitalId" value={hospitalId || ''} />

                    <div className="space-y-3">
                        <Label htmlFor="date" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <CalendarIcon className="w-3 h-3" /> 1. Select Date
                        </Label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <CalendarIcon className="w-4 h-4 text-blue-500 group-focus-within:text-blue-600 transition-colors" />
                            </div>
                            <Input
                                id="date"
                                name="date"
                                type="date"
                                required
                                min={today}
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="h-12 pl-10 rounded-xl border-slate-200 bg-slate-50/30 focus-visible:ring-blue-500/20 text-sm font-bold transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Clock className="w-3 h-3" /> 2. Available Slots
                            </Label>
                            {isLoadingSlots && (
                                <Badge variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-50 border-0 animate-pulse text-[8px] uppercase tracking-wider font-black">
                                    <Loader2 className="w-2.5 h-2.5 mr-1 animate-spin" /> Updating
                                </Badge>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {slots.length > 0 ? slots.map(slot => {
                                const isAvailable = slot.available;
                                const isSelected = selectedSlot === slot.time;
                                
                                return (
                                    <Label 
                                        key={slot.time} 
                                        className={`
                                            relative flex items-center justify-center px-3 py-2 rounded-lg border transition-all duration-300 cursor-pointer group/slot
                                            ${isAvailable 
                                                ? isSelected 
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                                                    : 'bg-white border-slate-100 text-slate-600 hover:border-blue-300'
                                                : 'bg-slate-50 border-slate-50 text-slate-300 cursor-not-allowed opacity-50'}
                                        `}
                                    >
                                        <input
                                            type="radio"
                                            name="slot"
                                            value={slot.time}
                                            required
                                            disabled={!isAvailable}
                                            checked={isSelected}
                                            onChange={() => setSelectedSlot(slot.time)}
                                            className="sr-only"
                                        />
                                        
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs font-black tracking-tight">
                                                {(() => {
                                                    const [h, m] = slot.time.split(':');
                                                    const hour = parseInt(h);
                                                    return hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                                                })()}:{slot.time.split(':')[1]}
                                            </span>
                                            <span className={`text-[8px] font-black uppercase tracking-widest ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                                                {parseInt(slot.time.split(':')[0]) >= 12 ? 'PM' : 'AM'}
                                            </span>
                                        </div>
                                    </Label>
                                );
                            }) : !isLoadingSlots && (
                                <div className="col-span-full py-10 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                    <AlertCircle className="w-6 h-6 text-slate-200 mx-auto mb-2" />
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">No slots today</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="group border border-emerald-100 bg-emerald-50/30 p-4 rounded-xl transition-all hover:bg-emerald-50/50 relative">
                        <label className="flex items-center gap-3 cursor-pointer select-none relative z-10">
                            <Checkbox id="payWithWallet" name="payWithWallet" value="true" className="h-5 w-5 rounded-md data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600" />
                            <div className="space-y-0.5">
                                <div className="font-black text-emerald-900 text-sm tracking-tight uppercase">Pay with Wallet</div>
                                <p className="text-[9px] text-emerald-600/80 font-black uppercase tracking-widest">Balance: ₹500</p>
                            </div>
                        </label>
                    </div>

                    {state?.message && !state.success && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <p className="font-bold text-xs">{state.message}</p>
                        </div>
                    )}

                    <Button 
                        type="submit" 
                        disabled={isPending || isLoadingSlots || slots.filter(s => s.available).length === 0} 
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black shadow-lg shadow-blue-600/20 transition-all active:scale-95 uppercase tracking-widest"
                    >
                        {isPending ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" /> Processing
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                Confirm & Pay ₹500 <ChevronRight className="w-4 h-4" />
                            </div>
                        )}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="bg-slate-50/50 border-t border-slate-100 px-6 py-4 flex justify-center">
                <p className="text-[9px] text-slate-400 font-black flex items-center gap-2 uppercase tracking-[0.2em]">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" /> Secure Encryption
                </p>
            </CardFooter>
        </Card>
    );
}
