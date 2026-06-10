"use client";

import { UserButton, SignInButton, useAuth } from "@clerk/nextjs";
import { Sun, Moon, Languages, House, Menu, X, LayoutDashboard, Building2, CalendarDays, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function Navbar() {
    const { isSignedIn } = useAuth();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [manageExpanded, setManageExpanded] = useState(false);
    const t = useTranslations("nav");
    const tManage = useTranslations("manage");
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => setMounted(true), []);
    // Close mobile menu on navigation
    useEffect(() => { setMenuOpen(false); }, [pathname]);
    // Auto-expand manage submenu when on a manage page
    useEffect(() => { if (pathname.startsWith("/manage")) setManageExpanded(true); }, [pathname]);

    function toggleLocale() {
        const next = routing.locales.find((l) => l !== locale) ?? routing.defaultLocale;
        router.replace(pathname, { locale: next });
    }

    const activeNavLinkCls = "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium bg-[#8CC63F]/10 text-[#8CC63F]";
    const navLinkCls = "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";
    const subLinkCls = "flex items-center gap-3 rounded-lg pl-9 pr-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";
    const activeSubLinkCls = "flex items-center gap-3 rounded-lg pl-9 pr-3 py-2 text-sm bg-[#8CC63F]/10 text-[#8CC63F]";

    if (pathname === "/landing") return null;

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
                    {/* Logo */}
                    <Link href="/bookings" className="flex items-center gap-2">
                        <img src="/logo.png" alt="Kora" className="h-7 w-auto object-contain" />
                    </Link>

                    {/* Desktop nav links */}
                    <nav className="hidden items-center gap-6 sm:flex">
                        <Link
                            href="/"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <House className="inline-block h-4 w-4" />
                            <span className="sr-only">{t("home")}</span>
                        </Link>
                        <Link
                            href="/bookings"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {t("bookings")}
                        </Link>
                        {isSignedIn && (
                            <Link
                                href="/manage"
                                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {t("manage")}
                            </Link>
                        )}
                    </nav>

                    {/* Auth + theme toggle + locale switcher + hamburger */}
                    <div className="flex items-center gap-3">
                        {mounted && (
                            <>
                                <button
                                    onClick={toggleLocale}
                                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                    title={locale === "en" ? "PT" : "EN"}
                                >
                                    <Languages className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                    aria-label={t("toggleTheme")}
                                >
                                    {theme === "dark" ? (
                                        <Sun className="h-4 w-4" />
                                    ) : (
                                        <Moon className="h-4 w-4" />
                                    )}
                                </button>
                            </>
                        )}
                        {isSignedIn ? (
                            <UserButton />
                        ) : (
                            <SignInButton mode="modal">
                                <button className="rounded-md bg-[#8CC63F] px-4 py-1.5 text-sm font-semibold text-[#0D1B2A] transition-all hover:bg-[#7AB534] active:scale-[0.98]">
                                    {t("signIn")}
                                </button>
                            </SignInButton>
                        )}
                        {/* Hamburger button — mobile only */}
                        <button
                            onClick={() => setMenuOpen((v) => !v)}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:hidden"
                            aria-label="Menu"
                        >
                            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile drawer */}
            {menuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm sm:hidden"
                        onClick={() => setMenuOpen(false)}
                    />
                    {/* Drawer panel */}
                    <div className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-border bg-background p-4 sm:hidden">
                        <div className="mb-4 flex items-center justify-between">
                            <Link
                                href="/bookings"
                                className="flex items-center gap-2"
                                onClick={() => setMenuOpen(false)}
                            >
                                <img src="/logo.png" alt="Kora" className="h-7 w-auto object-contain" />
                            </Link>
                            <button
                                onClick={() => setMenuOpen(false)}
                                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <nav className="space-y-1">
                            <Link href="/" className={pathname === "/" ? activeNavLinkCls : navLinkCls}>
                                <House className="h-4 w-4" />
                                {t("home")}
                            </Link>
                            <Link
                                href="/bookings"
                                className={pathname.startsWith("/bookings") ? activeNavLinkCls : navLinkCls}
                            >
                                <CalendarDays className="h-4 w-4" />
                                {t("bookings")}
                            </Link>
                            {isSignedIn && (
                                <>
                                    <button
                                        onClick={() => setManageExpanded((v) => !v)}
                                        className={`w-full ${pathname.startsWith("/manage") ? activeNavLinkCls : navLinkCls}`}
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        {t("manage")}
                                        <ChevronDown
                                            className={`ml-auto h-4 w-4 transition-transform ${manageExpanded ? "rotate-180" : ""}`}
                                        />
                                    </button>
                                    {manageExpanded && (
                                        <div className="space-y-1">
                                            <Link
                                                href="/manage"
                                                className={pathname === "/manage" ? activeSubLinkCls : subLinkCls}
                                            >
                                                <LayoutDashboard className="h-4 w-4" />
                                                {tManage("page.title")}
                                            </Link>
                                            <Link
                                                href="/manage/clubs"
                                                className={pathname.startsWith("/manage/clubs") ? activeSubLinkCls : subLinkCls}
                                            >
                                                <Building2 className="h-4 w-4" />
                                                {tManage("clubs.title")}
                                            </Link>
                                            <Link
                                                href="/manage/bookings"
                                                className={pathname.startsWith("/manage/bookings") ? activeSubLinkCls : subLinkCls}
                                            >
                                                <CalendarDays className="h-4 w-4" />
                                                {tManage("bookings.title")}
                                            </Link>
                                        </div>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                </>
            )}
        </>
    );
}
