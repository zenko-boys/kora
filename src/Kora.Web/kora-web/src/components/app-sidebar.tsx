"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import { CalendarDays, Settings, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export function AppSidebar() {
    const { isSignedIn } = useAuth();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const t = useTranslations("nav");
    const pathname = usePathname();

    useEffect(() => setMounted(true), []);

    if (pathname === "/landing" || !isSignedIn) return null;

    const activeCls = "bg-[#8CC63F]/20 text-[#8CC63F]";
    const inactiveCls = "text-muted-foreground hover:bg-white/5 hover:text-foreground";
    const iconBtnCls = "flex h-[46px] w-[46px] items-center justify-center rounded-[13px] transition-colors";

    return (
        <aside className="sticky top-0 flex h-screen w-19 shrink-0 flex-col items-center gap-3 overflow-y-auto border-r border-sidebar-border bg-sidebar py-6 md:w-21">
            <Link href="/bookings" className="mb-2 flex items-center justify-center" title="Kora">
                <img src="/kora-icon.png" alt="Kora" width={36} height={36} className="rounded-[9px]" />
            </Link>

            <nav className="flex flex-col items-center gap-3">
                <Link
                    href="/bookings"
                    title={t("bookings")}
                    className={`${iconBtnCls} ${pathname.startsWith("/bookings") ? activeCls : inactiveCls}`}
                >
                    <CalendarDays className="h-5.5 w-5.5" />
                </Link>
                <Link
                    href="/manage"
                    title={t("manage")}
                    className={`${iconBtnCls} ${pathname.startsWith("/manage") ? activeCls : inactiveCls}`}
                >
                    <Settings className="h-5.5 w-5.5" />
                </Link>
                {mounted && (
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        title={t("toggleTheme")}
                        className={`${iconBtnCls} ${inactiveCls} cursor-pointer`}
                    >
                        {theme === "dark" ? (
                            <Sun className="h-5.5 w-5.5" />
                        ) : (
                            <Moon className="h-5.5 w-5.5" />
                        )}
                    </button>
                )}
            </nav>

            <div className="mt-auto">
                <UserButton
                    appearance={{
                        elements: {
                            avatarBox: "h-10 w-10 rounded-full border-2 border-white/15",
                        },
                    }}
                />
            </div>
        </aside>
    );
}
