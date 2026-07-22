import { Skeleton } from "@/components/ui/skeleton";

export function BookingCardSkeleton() {
    return (
        <div className="flex flex-col rounded-[20px] border-[1.5px] border-[#1E2F40] bg-card px-5.5 py-5">
            <div className="mb-1 flex items-start justify-between gap-2">
                <Skeleton className="h-4 w-32" />
            </div>
            <div className="my-2 flex gap-1.5">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <Skeleton className="mt-1 h-3 w-24" />
            <Skeleton className="mt-1.5 h-3 w-40" />
            <div className="mt-5.5 mb-4.5 flex justify-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <div className="border-t border-border pt-3.5">
                <Skeleton className="h-9 w-full" />
            </div>
        </div>
    );
}
