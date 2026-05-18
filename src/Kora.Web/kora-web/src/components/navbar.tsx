"use client";

import { UserButton, SignInButton, useAuth } from "@clerk/nextjs";
import { CalendarDays, Sun, Moon, Languages } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function Navbar() {
    const { isSignedIn } = useAuth();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const t = useTranslations("nav");
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();

    // Avoid hydration mismatch — only render toggle after mount
    useEffect(() => setMounted(true), []);

    function toggleLocale() {
        const next = routing.locales.find((l) => l !== locale) ?? routing.defaultLocale;
        router.replace(pathname, { locale: next });
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
                {/* Logo */}
                <Link href="/bookings" className="flex items-center gap-2 font-bold tracking-widest text-foreground">
                    <CalendarDays className="h-5 w-5 text-[#3D46FB]" />
                    <span className="text-sm uppercase">Kora</span>
                </Link>

                {/* Nav links */}
                <nav className="hidden items-center gap-6 sm:flex">
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

                {/* Auth + theme toggle + locale switcher */}
                <div className="flex items-center gap-3">
                    {mounted && (
                        <>
                            <button
                                onClick={toggleLocale}
                                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                aria-label={t("toggleTheme")}
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
                            <button className="rounded-md bg-[#3D46FB] px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90">
                                {t("signIn")}
                            </button>
                        </SignInButton>
                    )}
                </div>
            </div>
        </header>
    );
}
