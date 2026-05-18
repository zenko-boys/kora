"use client";

import { LayoutDashboard, Building2, CalendarDays } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";

interface ManageSidebarProps {
    overviewLabel: string;
    clubsLabel: string;
    bookingsLabel: string;
}

export function ManageSidebar({ overviewLabel, clubsLabel, bookingsLabel }: ManageSidebarProps) {
    const pathname = usePathname();

    function linkCls(href: string) {
        const isActive =
            href === "/manage" ? pathname === "/manage" : pathname.startsWith(href);
        return `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive
                ? "bg-[#3D46FB]/10 text-[#3D46FB]"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`;
    }

    return (
        <aside className="hidden w-48 shrink-0 sm:block">
            <nav className="space-y-1">
                <Link href="/manage" className={linkCls("/manage")}>
                    <LayoutDashboard className="h-4 w-4" />
                    {overviewLabel}
                </Link>
                <Link href="/manage/clubs" className={linkCls("/manage/clubs")}>
                    <Building2 className="h-4 w-4" />
                    {clubsLabel}
                </Link>
                <Link href="/manage/bookings" className={linkCls("/manage/bookings")}>
                    <CalendarDays className="h-4 w-4" />
                    {bookingsLabel}
                </Link>
            </nav>
        </aside>
    );
}
