import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";
import { createApiClient } from "@/lib/api";
import { Building2, CalendarDays, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";

const MANAGEMENT_ROLES = ["Owner", "Manager", "Admin"];

export default async function ManagePage() {
    const authObj = await auth();
    const api = createApiClient((opts) => authObj.getToken(opts));
    const [{ clubs }, t] = await Promise.all([
        api.getMyClubs(),
        getTranslations("manage"),
    ]);

    const managedClubs = clubs.filter((c) => MANAGEMENT_ROLES.includes(c.role));
    const totalCourts = managedClubs.reduce((sum, c) => sum + (c.courtsCount ?? 0), 0);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {t("page.title")}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">{t("page.subtitle")}</p>
            </div>

            {/* Summary cards */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span className="text-xs font-medium">{t("page.managedClubs")}</span>
                    </div>
                    <p className="mt-2 text-3xl font-bold text-foreground">{managedClubs.length}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="text-xs font-medium">{t("page.totalCourts")}</span>
                    </div>
                    <p className="mt-2 text-3xl font-bold text-foreground">{totalCourts}</p>
                </div>
            </div>

            {/* Quick links */}
            <div className="grid gap-3 sm:grid-cols-2">
                <Link
                    href="/manage/clubs"
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-[#8CC63F]/50 hover:bg-accent"
                >
                    <Building2 className="h-8 w-8 text-[#8CC63F]" />
                    <div>
                        <p className="font-semibold text-foreground">{t("clubs.title")}</p>
                        <p className="text-xs text-muted-foreground">{t("clubs.subtitle")}</p>
                    </div>
                </Link>
                <Link
                    href="/manage/bookings"
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-[#8CC63F]/50 hover:bg-accent"
                >
                    <CalendarDays className="h-8 w-8 text-[#8CC63F]" />
                    <div>
                        <p className="font-semibold text-foreground">{t("bookings.title")}</p>
                        <p className="text-xs text-muted-foreground">{t("bookings.subtitle")}</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
