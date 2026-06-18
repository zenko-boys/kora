import { Skeleton } from "@/components/ui/skeleton";

export default function CalendarLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-7 w-36" />
                <Skeleton className="h-4 w-72" />
            </div>
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-5 w-52" />
                <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="grid grid-cols-7 border-b border-slate-200">
                    <Skeleton className="h-10 m-2 rounded" />
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 m-2 rounded" />
                    ))}
                </div>
                <div className="space-y-0">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="grid grid-cols-7 border-b border-slate-100 last:border-0">
                            <Skeleton className="h-14 m-1 rounded" />
                            {Array.from({ length: 6 }).map((_, j) => (
                                <Skeleton key={j} className="h-14 m-1 rounded opacity-40" />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
