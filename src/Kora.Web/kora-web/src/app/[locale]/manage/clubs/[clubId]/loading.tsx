import { Skeleton } from "@/components/ui/skeleton";

export default function ManageClubLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-md" />
                <div className="space-y-1.5">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-3.5 w-24" />
                </div>
            </div>
            <div className="space-y-3">
                <Skeleton className="h-36 w-full rounded-xl" />
                <Skeleton className="h-36 w-full rounded-xl" />
            </div>
        </div>
    );
}
