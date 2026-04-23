"use client";

import React from "react";
import Link from "next/link";
import { User, Stethoscope, Hospital, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PortalCardProps {
    type: "patient" | "doctor" | "hospital";
}

const portalConfigs = {
    patient: {
        title: "For Patients",
        subtitle: "Patient Login Portal",
        icon: User,
        gradient: "from-blue-500/10 to-blue-600/10",
        hoverGlow: "group-hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.2)]",
        borderColor: "group-hover:border-blue-500/30",
        iconBg: "bg-blue-500/15 text-blue-400",
        btnColor: "bg-blue-600 hover:bg-blue-700",
        regBtnColor: "border-blue-500/20 text-blue-400 hover:bg-blue-500/10",
        loginPath: "/login",
        registerPath: "/register"
    },
    doctor: {
        title: "For Doctors",
        subtitle: "Doctor Login Portal",
        icon: Stethoscope,
        gradient: "from-teal-500/10 to-teal-600/10",
        hoverGlow: "group-hover:shadow-[0_0_20px_-5px_rgba(20,184,166,0.2)]",
        borderColor: "group-hover:border-teal-500/30",
        iconBg: "bg-teal-500/15 text-teal-400",
        btnColor: "bg-teal-600 hover:bg-teal-700",
        regBtnColor: "border-teal-500/20 text-teal-400 hover:bg-teal-500/10",
        loginPath: "/doctor/login",
        registerPath: "/doctor/register"
    },
    hospital: {
        title: "For Hospitals",
        subtitle: "Hospital Login Portal",
        icon: Hospital,
        gradient: "from-purple-500/10 to-purple-600/10",
        hoverGlow: "group-hover:shadow-[0_0_20px_-5px_rgba(168,85,247,0.2)]",
        borderColor: "group-hover:border-purple-500/30",
        iconBg: "bg-purple-500/15 text-purple-400",
        btnColor: "bg-purple-600 hover:bg-purple-700",
        regBtnColor: "border-purple-500/20 text-purple-400 hover:bg-purple-500/10",
        loginPath: "/hospital/login",
        registerPath: "/hospital/register"
    }
};

export default function PortalCard({ type }: PortalCardProps) {
    const config = portalConfigs[type];
    const Icon = config.icon;

    return (
        <Card className={cn(
            "group relative overflow-hidden transition-all duration-300 hover:-translate-y-1.5 border-white/5 bg-slate-900/60 backdrop-blur-md",
            config.hoverGlow,
            config.borderColor
        )}>
            {/* Subtle Gradient Overlay */}
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity duration-300 group-hover:opacity-70", config.gradient)} />
            
            <CardHeader className="relative p-5 pb-3">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                        config.iconBg
                    )}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                        <CardTitle className="text-lg font-bold text-white tracking-tight leading-tight">
                            {config.title}
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-400 font-medium">
                            {config.subtitle}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="relative p-5 pt-2">
                <div className="grid grid-cols-2 gap-2">
                    <Button 
                        asChild
                        size="sm"
                        className={cn("rounded-lg font-bold transition-all duration-200 h-9", config.btnColor)}
                    >
                        <Link href={config.loginPath} className="flex items-center justify-center gap-1.5 no-underline">
                            Login <ArrowRight className="w-3 h-3" />
                        </Link>
                    </Button>
                    
                    <Button 
                        variant="outline"
                        asChild
                        size="sm"
                        className={cn("rounded-lg font-bold border h-9 transition-all duration-200 bg-transparent text-xs", config.regBtnColor)}
                    >
                        <Link href={config.registerPath} className="no-underline">
                            Register
                        </Link>
                    </Button>
                </div>
            </CardContent>

            {/* Shine effect on hover */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </Card>
    );
}
