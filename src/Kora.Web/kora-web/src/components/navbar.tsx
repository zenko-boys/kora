"use client";

import { UserButton, SignInButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { CalendarDays, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Navbar() {
    const { isSignedIn } = useAuth();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch — only render toggle after mount
    useEffect(() => setMounted(true), []);

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
                        Bookings
                    </Link>
                </nav>

                {/* Auth + theme toggle */}
                <div className="flex items-center gap-3">
                    {mounted && (
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            aria-label="Toggle theme"
                        >
                            {theme === "dark" ? (
                                <Sun className="h-4 w-4" />
                            ) : (
                                <Moon className="h-4 w-4" />
                            )}
                        </button>
                    )}
                    {isSignedIn ? (
                        <UserButton />
                    ) : (
                        <SignInButton mode="modal">
                            <button className="rounded-md bg-[#3D46FB] px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90">
                                Sign In
                            </button>
                        </SignInButton>
                    )}
                </div>
            </div>
        </header>
    );
}
