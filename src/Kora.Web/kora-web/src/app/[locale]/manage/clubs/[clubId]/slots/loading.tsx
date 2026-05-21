import { Skeleton } from "@/components/ui/skeleton";

export default function ManageSlotsLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-7 w-36" />
                <Skeleton className="h-4 w-60" />
            </div>
            <div className="flex gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-14 rounded-lg" />
                ))}
            </div>
            <div className="space-y-4">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-48 w-full rounded-xl" />
            </div>
        </div>
    );
}
