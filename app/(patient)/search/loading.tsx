import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function SearchLoading() {
    return (
        <main className="container max-w-6xl mx-auto px-4 py-8 animate-fade-in">
            {/* Header Skeleton */}
            <div className="mb-10">
                <Skeleton className="h-6 w-32 mb-4 rounded-full" />
                <Skeleton className="h-12 w-3/4 mb-3 rounded-xl" />
                <Skeleton className="h-6 w-1/2 rounded-lg" />
            </div>

            {/* Search Bar Skeleton */}
            <Skeleton className="h-20 w-full mb-10 rounded-2xl" />

            {/* Filters Skeleton */}
            <div className="mb-8">
                <Skeleton className="h-4 w-24 mb-3 rounded" />
                <div className="flex gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-10 w-24 rounded-xl flex-shrink-0" />
                    ))}
                </div>
            </div>

            <div className="mb-12">
                <Skeleton className="h-4 w-32 mb-3 rounded" />
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-10 w-32 rounded-xl flex-shrink-0" />
                    ))}
                </div>
            </div>

            {/* Doctors Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="rounded-[1.5rem] border-slate-200 overflow-hidden">
                        <CardContent className="p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row items-start gap-6">
                                <Skeleton className="w-24 h-24 rounded-[1.25rem] flex-shrink-0" />
                                <div className="flex-1 w-full space-y-4">
                                    <div className="flex justify-between items-start">
                                        <Skeleton className="h-8 w-1/2 rounded-lg" />
                                        <Skeleton className="h-6 w-16 rounded-lg" />
                                    </div>
                                    <Skeleton className="h-6 w-24 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-10 w-full rounded-lg" />
                                        <Skeleton className="h-10 w-full rounded-lg" />
                                    </div>
                                    <div className="flex justify-between items-center pt-5">
                                        <div className="space-y-1">
                                            <Skeleton className="h-4 w-20 rounded" />
                                            <Skeleton className="h-8 w-24 rounded-lg" />
                                        </div>
                                        <Skeleton className="h-12 w-32 rounded-xl" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </main>
    );
}
