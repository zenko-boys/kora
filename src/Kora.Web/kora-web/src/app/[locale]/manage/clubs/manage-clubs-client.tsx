"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { Building2, ChevronRight, CalendarDays } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { createApiClient } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { MyClubSummary } from "@/lib/types";
import { MANAGEMENT_ROLES, ROLE_COLORS } from "@/lib/constants";

export function ManageClubsClient() {
    const { getToken } = useAuth();
    const t = useTranslations("manage");
    const api = createApiClient(async (opts) => getToken(opts));

    const { data, isLoading } = useQuery({
        queryKey: ["my-clubs"],
        queryFn: () => api.getMyClubs(),
    });

    const managedClubs: MyClubSummary[] = (data?.clubs ?? []).filter((c) =>
        MANAGEMENT_ROLES.includes(c.role)
    );

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    if (managedClubs.length === 0) {
        return (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
                <Building2 className="h-10 w-10 text-muted-foreground/40" />
                <p className="font-medium text-foreground">{t("clubs.noClubs")}</p>
                <p className="text-sm text-muted-foreground">{t("clubs.noClubsDescription")}</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {managedClubs.map((club) => (
                <Card key={club.clubId} className="transition-colors hover:bg-accent/30">
                    <CardContent className="flex items-center justify-between gap-4 p-5">
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-foreground">{club.name}</span>
                                <Badge
                                    variant="outline"
                                    className={ROLE_COLORS[club.role] ?? ""}
                                >
                                    {club.role}
                                </Badge>
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {t("clubs.courtsCount", { count: club.courtsCount ?? 0 })}
                                {" · "}
                                {club.timeZoneId}
                            </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <Link
                                href={`/manage/clubs/${club.clubId}`}
                                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-[#3D46FB]/50 hover:text-foreground"
                            >
                                <Building2 className="h-3.5 w-3.5" />
                                {t("clubs.manageCourts")}
                            </Link>
                            <Link
                                href={`/manage/bookings?clubId=${club.clubId}`}
                                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-[#3D46FB]/50 hover:text-foreground"
                            >
                                <CalendarDays className="h-3.5 w-3.5" />
                                {t("clubs.manageBookings")}
                            </Link>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
