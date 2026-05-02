import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BookingCardSkeleton() {
    return (
        <Card className="flex flex-col overflow-hidden border-border">
            <CardHeader className="px-5 pb-3 pt-5">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1.5 min-w-0">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-5 w-14 rounded-full" />
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 px-5 pb-5">
                <Skeleton className="h-4 w-48" />
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="h-1.5 w-full" />
                </div>
                <div className="flex justify-center pt-1">
                    <Skeleton className="h-9 w-full" />
                </div>
            </CardContent>
        </Card>
    );
}
