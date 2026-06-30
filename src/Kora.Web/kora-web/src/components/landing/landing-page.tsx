"use client";

import { useRef, useEffect, useState } from "react";
import {
    CalendarDays,
    Users,
    MapPin,
    Trophy,
    Zap,
    Heart,
    Brain,
    Shield,
    ArrowRight,
    Check,
    Star,
    TrendingUp,
    Globe,
    Send,
    Clock,
    Sun,
    Moon,
    X,
    ChevronDown,
} from "lucide-react";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { routing } from "@/i18n/routing";

// ---------------------------------------------------------------------------
// Scroll-reveal hook
// ---------------------------------------------------------------------------
function useReveal<T extends HTMLElement = HTMLDivElement>() {
    const ref = useRef<T>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    obs.disconnect();
                }
            },
            { threshold: 0.08 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return [ref, visible] as const;
}

// ---------------------------------------------------------------------------
// FLOATING LANDING NAV
// ---------------------------------------------------------------------------
function LandingNavbar() {
    const t = useTranslations("nav");
    const { theme, setTheme } = useTheme();
    const { isSignedIn } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => setMounted(true), []);

    function toggleLocale() {
        const next = routing.locales.find((l) => l !== locale) ?? routing.defaultLocale;
        router.replace(pathname, { locale: next });
    }

    const isDark = !mounted || theme === "dark";

    return (
        <>
            {/* Pill nav */}
            <nav
                className="fixed top-5 left-1/2 z-50 -translate-x-1/2 flex items-center gap-1 rounded-full border px-2 py-1.5"
                style={{
                    backgroundColor: "var(--landing-nav-bg)",
                    borderColor: "var(--landing-nav-border)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    boxShadow: "0 4px 28px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.1)",
                    transition: "background-color 0.4s cubic-bezier(0.32,0.72,0,1), border-color 0.4s cubic-bezier(0.32,0.72,0,1)",
                }}
            >
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center rounded-full px-3 py-1.5 transition-opacity duration-300 hover:opacity-70"
                >
                    <img src="/logo.png" alt="Kora" className="h-6 w-auto object-contain" />
                </Link>

                {/* Desktop controls */}
                <div className="hidden sm:flex items-center gap-1">
                    <div
                        className="h-3.5 w-px mx-1"
                        style={{ backgroundColor: "var(--landing-divider)" }}
                    />
                    {mounted && (
                        <button
                            onClick={toggleLocale}
                            className="flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all duration-300 hover:bg-white/10"
                            style={{ color: "var(--landing-text-2)" }}
                            title={locale === "en" ? "Mudar para Portugu\u00eas" : "Switch to English"}
                        >
                            {locale === "en" ? "PT" : "EN"}
                        </button>
                    )}
                    {mounted && (
                        <button
                            onClick={() => setTheme(isDark ? "light" : "dark")}
                            className="flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 hover:bg-white/10"
                            style={{ color: "var(--landing-text-2)" }}
                            aria-label="Toggle theme"
                        >
                            {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                        </button>
                    )}
                    {isSignedIn ? (
                        <div className="flex h-7 w-7 items-center justify-center">
                            <UserButton />
                        </div>
                    ) : (
                        <SignInButton mode="modal" forceRedirectUrl="/bookings">
                            <button className="flex items-center rounded-full bg-[#8CC63F] px-4 py-1.5 text-[11px] font-bold text-[#0D1B2A] transition-all duration-300 hover:bg-[#7AB534] hover:shadow-[0_6px_20px_rgba(140,198,63,0.3)] active:scale-[0.97]">
                                {t("signIn")}
                            </button>
                        </SignInButton>
                    )}
                </div>

                {/* Hamburger — mobile only */}
                <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="sm:hidden flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ color: "var(--landing-text-1)" }}
                    aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
                >
                    <div className="relative h-3.5 w-4">
                        <span
                            className="absolute left-0 h-[1.5px] w-full rounded-full bg-current transition-all duration-300"
                            style={{
                                top: menuOpen ? "50%" : "0",
                                transform: menuOpen ? "translateY(-50%) rotate(45deg)" : "none",
                                transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1)",
                            }}
                        />
                        <span
                            className="absolute left-0 top-1/2 h-[1.5px] w-full rounded-full bg-current transition-all duration-300"
                            style={{
                                transform: menuOpen ? "translateY(-50%) scaleX(0)" : "translateY(-50%) scaleX(1)",
                                opacity: menuOpen ? 0 : 1,
                                transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1)",
                            }}
                        />
                        <span
                            className="absolute left-0 h-[1.5px] w-full rounded-full bg-current transition-all duration-300"
                            style={{
                                top: menuOpen ? "50%" : "100%",
                                transform: menuOpen ? "translateY(-50%) rotate(-45deg)" : "none",
                                transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1)",
                            }}
                        />
                    </div>
                </button>
            </nav>

            {/* Mobile fullscreen overlay */}
            <div
                className="fixed inset-0 z-40 flex flex-col p-8 sm:hidden"
                style={{
                    backdropFilter: menuOpen ? "blur(28px)" : "blur(0px)",
                    WebkitBackdropFilter: menuOpen ? "blur(28px)" : "blur(0px)",
                    backgroundColor: "var(--landing-overlay-bg)",
                    opacity: menuOpen ? 1 : 0,
                    pointerEvents: menuOpen ? "auto" : "none",
                    transition: "opacity 0.4s cubic-bezier(0.32,0.72,0,1)",
                }}
            >
                <nav className="flex flex-col gap-6 mt-20">
                    {[
                        { href: "/bookings", label: t("bookings") },
                        { href: "/clubs", label: t("clubs") },
                    ].map((item, i) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMenuOpen(false)}
                            className="text-5xl font-bold tracking-tighter"
                            style={{
                                color: "var(--landing-text-1)",
                                opacity: menuOpen ? 1 : 0,
                                transform: menuOpen ? "translateY(0)" : "translateY(24px)",
                                transition: "opacity 0.5s cubic-bezier(0.32,0.72,0,1) " + (0.1 + i * 0.08) + "s, transform 0.5s cubic-bezier(0.32,0.72,0,1) " + (0.1 + i * 0.08) + "s",
                            }}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="mt-auto flex items-center gap-4">
                    {mounted && (
                        <button
                            onClick={toggleLocale}
                            className="text-sm font-semibold uppercase tracking-wider"
                            style={{ color: "var(--landing-text-2)" }}
                        >
                            {locale === "en" ? "PT" : "EN"}
                        </button>
                    )}
                    {mounted && (
                        <button
                            onClick={() => setTheme(isDark ? "light" : "dark")}
                            className="rounded-full p-2"
                            style={{ color: "var(--landing-text-2)" }}
                        >
                            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </button>
                    )}
                    {isSignedIn ? (
                        <div className="ml-auto">
                            <UserButton />
                        </div>
                    ) : (
                        <SignInButton mode="modal" forceRedirectUrl="/bookings">
                            <button className="ml-auto rounded-full bg-[#8CC63F] px-6 py-3 text-sm font-bold text-[#0D1B2A]">
                                {t("signIn")}
                            </button>
                        </SignInButton>
                    )}
                </div>
            </div>
        </>
    );
}

// ---------------------------------------------------------------------------
// HERO
// ---------------------------------------------------------------------------
function HeroSection() {
    const t = useTranslations("landing");
    const { isSignedIn } = useAuth();
    return (
        <section
            id="hero"
            className="relative overflow-hidden"
            style={{ minHeight: "100dvh", backgroundColor: "var(--landing-bg-1)" }}
        >
            {/* Ambient glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute right-0 top-0 h-[700px] w-[700px] -translate-y-1/3 translate-x-1/4 rounded-full bg-[#8CC63F] blur-[140px]"
                style={{ opacity: "var(--landing-glow-opacity)" }}
            />

            <div
                className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 pt-36 pb-28 lg:grid-cols-[1fr_460px] lg:pt-0 lg:pb-0"
                style={{ minHeight: "inherit" }}
            >
                {/* Left: content */}
                <div
                    className="flex flex-col gap-8"
                    style={{ animation: "kora-fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both" }}
                >
                    {/* Eyebrow pill */}
                    <div
                        className="flex w-fit items-center gap-2 rounded-full border px-3 py-1"
                        style={{
                            borderColor: "rgba(140,198,63,0.3)",
                            backgroundColor: "rgba(140,198,63,0.08)",
                        }}
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#8CC63F]" />
                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8CC63F]">
                            {t("hero.badge")}
                        </span>
                    </div>

                    <h1
                        className="text-[clamp(2.8rem,6vw,5rem)] font-bold leading-[1.04] tracking-tighter"
                        style={{ color: "var(--landing-text-1)" }}
                    >
                        {t("hero.headline1")}
                        {" "}
                        <span className="text-[#8CC63F]">{t("hero.headline2")}</span>
                        {" "}
                        {t("hero.headline3")}
                    </h1>

                    <p
                        className="max-w-[48ch] text-base leading-relaxed"
                        style={{ color: "var(--landing-text-2)" }}
                    >
                        {t("hero.description")}
                    </p>

                    <div className="flex flex-wrap items-center gap-4">
                        {isSignedIn ? (
                            <Link
                                href="/bookings"
                                className="group inline-flex items-center gap-0 rounded-full bg-[#8CC63F] pl-6 pr-2 py-2 text-sm font-semibold text-[#0D1B2A] transition-all duration-500 hover:-translate-y-[2px] hover:bg-[#7AB534] hover:shadow-[0_12px_35px_rgba(140,198,63,0.38)] active:scale-[0.98]"
                                style={{ transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1)" }}
                            >
                                {t("hero.ctaLogin")}
                                <span
                                    className="ml-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-all duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-[1px] group-hover:scale-105"
                                    style={{ transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1)" }}
                                >
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </span>
                            </Link>
                        ) : (
                            <SignInButton mode="modal" forceRedirectUrl="/bookings">
                                <button
                                    className="group inline-flex items-center gap-0 rounded-full bg-[#8CC63F] pl-6 pr-2 py-2 text-sm font-semibold text-[#0D1B2A] transition-all duration-500 hover:-translate-y-[2px] hover:bg-[#7AB534] hover:shadow-[0_12px_35px_rgba(140,198,63,0.38)] active:scale-[0.98]"
                                    style={{ transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1)" }}
                                >
                                    {t("hero.ctaLogin")}
                                    <span
                                        className="ml-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-all duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-[1px] group-hover:scale-105"
                                        style={{ transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1)" }}
                                    >
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </span>
                                </button>
                            </SignInButton>
                        )}
                        <Link
                            href="/clubs"
                            className="inline-flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-semibold transition-all duration-500 active:scale-[0.98]"
                            style={{
                                borderColor: "var(--landing-card-border)",
                                color: "var(--landing-text-2)",
                                transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1)",
                            }}
                        >
                            {t("hero.ctaSecondary")}
                        </Link>
                    </div>

                    {/* Stars removed */}
                </div>

                {/* Right: image panel — Double-Bezel */}
                <div
                    className="relative hidden lg:block"
                    style={{ animation: "kora-fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}
                >
                    {/* Outer shell */}
                    <div
                        className="rounded-[2rem] p-2"
                        style={{
                            backgroundColor: "var(--landing-card-bg)",
                            border: "1px solid var(--landing-card-border)",
                        }}
                    >
                        {/* Inner core */}
                        <div
                            className="relative overflow-hidden"
                            style={{
                                height: "582px",
                                borderRadius: "calc(2rem - 0.375rem)",
                                boxShadow: "inset 0 1px 1px rgba(255,255,255,0.12)",
                            }}
                        >
                            <img
                                src="https://picsum.photos/seed/padel-kora-hero/500/700"
                                alt="Quadra de padel iluminada"
                                className="h-full w-full object-cover"
                            />
                            <div
                                className="absolute inset-0"
                                style={{
                                    background: "linear-gradient(to top, var(--landing-bg-1) 0%, transparent 55%)",
                                }}
                            />
                            {/* Floating match card — COMMENTED OUT */}
                            {/* <div
                                className="absolute bottom-5 left-5 right-5 rounded-xl p-4"
                                style={{
                                    border: "1px solid var(--landing-card-border)",
                                    backgroundColor: "var(--landing-float-card-bg)",
                                    backdropFilter: "blur(12px)",
                                    WebkitBackdropFilter: "blur(12px)",
                                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                                }}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[11px]" style={{ color: "var(--landing-text-3)" }}>
                                            {t("hero.matchCard.label")}
                                        </p>
                                        <p className="mt-0.5 text-sm font-medium" style={{ color: "var(--landing-text-1)" }}>
                                            {t("hero.matchCard.court")}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[11px]" style={{ color: "var(--landing-text-3)" }}>
                                            {t("hero.matchCard.today")}
                                        </p>
                                        <p className="mt-0.5 text-sm font-bold text-[#8CC63F]">19:00</p>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        {[41, 83, 27].map((seed) => (
                                            <img
                                                key={seed}
                                                src={"https://picsum.photos/seed/kora-p" + seed + "/40/40"}
                                                className="h-6 w-6 rounded-full object-cover"
                                                style={{ border: "2px solid var(--landing-bg-1)" }}
                                                alt=""
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs" style={{ color: "var(--landing-text-3)" }}>
                                        {t("hero.matchCard.spots")}
                                    </span>
                                    <span className="ml-auto cursor-pointer text-xs font-semibold text-[#8CC63F] transition-colors hover:text-[#8CC63F]">
                                        {t("hero.matchCard.join")}
                                    </span>
                                </div>
                            </div> */}
                        </div>
                    </div>
                    {/* Glow behind card */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-12 left-10 right-10 h-40 rounded-full bg-[#8CC63F] blur-[60px]"
                        style={{ opacity: "var(--landing-glow-opacity)" }}
                    />
                </div>
            </div>
        </section>
    );
}

// ---------------------------------------------------------------------------
// STATS
// ---------------------------------------------------------------------------
function StatsSection() {
    const t = useTranslations("landing");
    const [ref, visible] = useReveal();

    const stats = [
        { value: t("stats.playersValue"), label: t("stats.playersLabel") },
        { value: t("stats.courtsValue"), label: t("stats.courtsLabel") },
        { value: t("stats.statesValue"), label: t("stats.statesLabel") },
    ];

    return (
        <div
            ref={ref}
            style={{
                borderTop: "1px solid var(--landing-divider)",
                borderBottom: "1px solid var(--landing-divider)",
                backgroundColor: "var(--landing-bg-1)",
            }}
        >
            <div className="mx-auto max-w-7xl px-4">
                <div className="grid grid-cols-1 sm:grid-cols-3">
                    {stats.map((s, i) => (
                        <div
                            key={i}
                            className="kora-stat-item flex flex-col gap-1.5 px-8 py-11"
                            style={{
                                opacity: visible ? 1 : 0,
                                transform: visible ? "translateY(0)" : "translateY(16px)",
                                transition: "opacity 0.6s cubic-bezier(0.32,0.72,0,1) " + (i * 0.08) + "s, transform 0.6s cubic-bezier(0.32,0.72,0,1) " + (i * 0.08) + "s",
                            }}
                        >
                            <span
                                className="font-mono text-4xl font-bold tracking-tighter"
                                style={{ color: "var(--landing-text-1)" }}
                            >
                                {s.value}
                            </span>
                            <span className="text-sm" style={{ color: "var(--landing-text-3)" }}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// BRAZIL EXPANSION
// ---------------------------------------------------------------------------
function BrazilSection() {
    const t = useTranslations("landing");
    const [ref, visible] = useReveal();

    const facts = [
        { icon: Globe, text: t("brazil.fact1") },
        { icon: TrendingUp, text: t("brazil.fact2") },
        { icon: Users, text: t("brazil.fact3") },
        { icon: MapPin, text: t("brazil.fact4") },
    ];

    return (
        <section
            id="brazil-expansion"
            ref={ref}
            className="overflow-hidden py-28"
            style={{ backgroundColor: "var(--landing-bg-1)" }}
        >
            <div className="mx-auto max-w-7xl px-4">
                <div className="grid grid-cols-1 gap-14 lg:grid-cols-[480px_1fr] lg:items-center">
                    {/* Image */}
                    <div
                        className="relative overflow-hidden rounded-2xl"
                        style={{
                            opacity: visible ? 1 : 0,
                            transform: visible ? "translateX(0)" : "translateX(-28px)",
                            transition: "opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1)",
                        }}
                    >
                        <img
                            src="https://picsum.photos/seed/padel-brazil-2026/480/560"
                            alt="Expans\u00e3o do padel no Brasil"
                            className="aspect-[4/5] w-full object-cover"
                        />
                        <div
                            className="absolute inset-0"
                            style={{ background: "linear-gradient(to right, transparent, var(--landing-bg-1) 100%)" }}
                        />
                        <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-[#8CC63F]/30 bg-[#8CC63F]/15 px-4 py-2 backdrop-blur-sm">
                            <TrendingUp className="h-4 w-4 text-[#8CC63F]" />
                            <span className="text-xs font-semibold text-[#8CC63F]">
                                {t("brazil.badgeGrowth")}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div
                        className="flex flex-col gap-7"
                        style={{
                            opacity: visible ? 1 : 0,
                            transform: visible ? "translateX(0)" : "translateX(28px)",
                            transition: "opacity 0.75s cubic-bezier(0.16,1,0.3,1) 0.15s, transform 0.75s cubic-bezier(0.16,1,0.3,1) 0.15s",
                        }}
                    >
                        <div
                            className="flex w-fit items-center gap-2 rounded-full border px-3 py-1"
                            style={{
                                borderColor: "rgba(140,198,63,0.3)",
                                backgroundColor: "rgba(140,198,63,0.08)",
                            }}
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-[#8CC63F]" />
                            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8CC63F]">
                                {t("brazil.badge")}
                            </span>
                        </div>

                        <h2
                            className="text-4xl font-bold leading-[1.1] tracking-tighter lg:text-5xl"
                            style={{ color: "var(--landing-text-1)" }}
                        >
                            {t("brazil.headline")}
                        </h2>

                        <p className="text-base leading-relaxed" style={{ color: "var(--landing-text-2)" }}>
                            {t("brazil.description")}
                        </p>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {facts.map((item, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-[#8CC63F]" />
                                    <p className="text-sm leading-relaxed" style={{ color: "var(--landing-text-2)" }}>
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
// ---------------------------------------------------------------------------
// BENEFITS BENTO
// ---------------------------------------------------------------------------
function BenefitsSection() {
    const t = useTranslations("landing");
    const [ref, visible] = useReveal();

    const benefits = [
        {
            icon: Heart,
            title: t("benefits.card1Title"),
            description: t("benefits.card1Desc"),
            wide: true,
        },
        {
            icon: Users,
            title: t("benefits.card2Title"),
            description: t("benefits.card2Desc"),
            wide: false,
        },
        {
            icon: Brain,
            title: t("benefits.card3Title"),
            description: t("benefits.card3Desc"),
            wide: false,
        },
        {
            icon: Trophy,
            title: t("benefits.card4Title"),
            description: t("benefits.card4Desc"),
            wide: true,
        },
    ];

    return (
        <section
            id="benefits"
            ref={ref}
            className="py-28"
            style={{ backgroundColor: "var(--landing-bg-2)" }}
        >
            <div className="mx-auto max-w-7xl px-4">
                <div
                    className="mb-14 max-w-xl"
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? "translateY(0)" : "translateY(16px)",
                        transition: "opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)",
                    }}
                >
                    <div
                        className="mb-4 flex w-fit items-center gap-2 rounded-full border px-3 py-1"
                        style={{
                            borderColor: "rgba(140,198,63,0.3)",
                            backgroundColor: "rgba(140,198,63,0.08)",
                        }}
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#8CC63F]" />
                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8CC63F]">
                            {t("benefits.badge")}
                        </span>
                    </div>
                    <h2
                        className="text-4xl font-bold leading-[1.1] tracking-tighter lg:text-5xl"
                        style={{ color: "var(--landing-text-1)" }}
                    >
                        {t("benefits.headline")}
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {benefits.map((b, i) => (
                        /* Double-Bezel card */
                        <div
                            key={i}
                            className={[
                                "group rounded-[1.5rem] p-1.5 transition-all duration-500",
                                b.wide ? "md:col-span-2" : "md:col-span-1",
                            ].join(" ")}
                            style={{
                                backgroundColor: "var(--landing-card-bg)",
                                border: "1px solid var(--landing-card-border)",
                                opacity: visible ? 1 : 0,
                                transform: visible ? "translateY(0)" : "translateY(24px)",
                                transition: "opacity 0.6s cubic-bezier(0.16,1,0.3,1) " + (0.1 + i * 0.08) + "s, transform 0.6s cubic-bezier(0.16,1,0.3,1) " + (0.1 + i * 0.08) + "s, border-color 0.3s",
                            }}
                        >
                            {/* Inner core */}
                            <div
                                className="flex flex-col gap-5 rounded-[1.1rem] p-6 h-full"
                                style={{
                                    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.08)",
                                    backgroundColor: "var(--landing-card-bg)",
                                }}
                            >
                                <div
                                    className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-300"
                                    style={{
                                        backgroundColor: "rgba(140,198,63,0.1)",
                                    }}
                                >
                                    <b.icon className="h-5 w-5 text-[#8CC63F]" />
                                </div>
                                <div>
                                    <h3
                                        className="mb-2 text-base font-semibold"
                                        style={{ color: "var(--landing-text-1)" }}
                                    >
                                        {b.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed" style={{ color: "var(--landing-text-2)" }}>
                                        {b.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ---------------------------------------------------------------------------
// FIND PLAYERS
// ---------------------------------------------------------------------------
function FindPlayersSection() {
    const t = useTranslations("landing");
    const [ref, visible] = useReveal();

    const players = [
        {
            seed: 73,
            name: t("players.p1Name"),
            level: t("players.p1Level"),
            city: t("players.p1City"),
            games: t("players.p1Games"),
        },
        {
            seed: 22,
            name: t("players.p2Name"),
            level: t("players.p2Level"),
            city: t("players.p2City"),
            games: t("players.p2Games"),
        },
        {
            seed: 55,
            name: t("players.p3Name"),
            level: t("players.p3Level"),
            city: t("players.p3City"),
            games: t("players.p3Games"),
        },
    ];

    const features = [
        t("players.feature1"),
        t("players.feature2"),
        t("players.feature3"),
        t("players.feature4"),
    ];

    return (
        <section
            id="find-players"
            ref={ref}
            className="py-28"
            style={{ backgroundColor: "var(--landing-bg-1)" }}
        >
            <div className="mx-auto max-w-7xl px-4">
                <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[1fr_420px]">
                    {/* Content */}
                    <div
                        className="flex flex-col gap-7"
                        style={{
                            opacity: visible ? 1 : 0,
                            transform: visible ? "translateX(0)" : "translateX(-20px)",
                            transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
                        }}
                    >
                        <div
                            className="flex w-fit items-center gap-2 rounded-full border px-3 py-1"
                            style={{
                                borderColor: "rgba(140,198,63,0.3)",
                                backgroundColor: "rgba(140,198,63,0.08)",
                            }}
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-[#8CC63F]" />
                            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8CC63F]">
                                {t("players.badge")}
                            </span>
                        </div>

                        <h2
                            className="text-4xl font-bold leading-[1.1] tracking-tighter lg:text-5xl"
                            style={{ color: "var(--landing-text-1)" }}
                        >
                            {t("players.headline")}
                        </h2>

                        <p className="text-base leading-relaxed" style={{ color: "var(--landing-text-2)" }}>
                            {t("players.description")}
                        </p>

                        <ul className="flex flex-col gap-4">
                            {features.map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#8CC63F]" />
                                    <span className="text-sm leading-relaxed" style={{ color: "var(--landing-text-2)" }}>
                                        {item}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <Link
                            href="/bookings"
                            className="group mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-[#8CC63F]/35 bg-[#8CC63F]/10 px-6 py-3 text-sm font-semibold text-[#8CC63F] transition-all duration-300 hover:border-[#8CC63F]/55 hover:bg-[#8CC63F]/18 active:scale-[0.98]"
                        >
                            {t("players.cta")}
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </Link>
                    </div>

                    {/* Player cards */}
                    <div
                        className="flex flex-col gap-3"
                        style={{
                            opacity: visible ? 1 : 0,
                            transform: visible ? "translateX(0)" : "translateX(20px)",
                            transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s",
                        }}
                    >
                        {players.map((p, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-4 rounded-xl p-4 transition-all duration-300"
                                style={{
                                    border: "1px solid var(--landing-card-border)",
                                    backgroundColor: "var(--landing-card-bg)",
                                }}
                            >
                                <img
                                    src={"https://picsum.photos/seed/kp" + p.seed + "/48/48"}
                                    className="h-11 w-11 shrink-0 rounded-full object-cover"
                                    alt={p.name}
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium" style={{ color: "var(--landing-text-1)" }}>
                                        {p.name}
                                    </p>
                                    <p className="text-xs" style={{ color: "var(--landing-text-3)" }}>
                                        {p.city} · {p.games}
                                    </p>
                                </div>
                                <span className="shrink-0 rounded-full border border-[#8CC63F]/30 bg-[#8CC63F]/10 px-3 py-1 text-[11px] font-medium text-[#8CC63F]">
                                    {p.level}
                                </span>
                            </div>
                        ))}

                        <div
                            className="mt-1 flex items-center justify-center gap-2 rounded-xl border border-dashed py-5 text-sm"
                            style={{
                                borderColor: "var(--landing-divider)",
                                color: "var(--landing-text-3)",
                            }}
                        >
                            <Users className="h-4 w-4" />
                            <span>{t("players.count")}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ---------------------------------------------------------------------------
// ACCESSIBILITY
// ---------------------------------------------------------------------------
function AccessibilitySection() {
    const t = useTranslations("landing");
    const [ref, visible] = useReveal();

    const features = [
        { icon: Globe, title: t("access.f1Title"), text: t("access.f1Text") },
        { icon: Users, title: t("access.f2Title"), text: t("access.f2Text") },
        { icon: Shield, title: t("access.f3Title"), text: t("access.f3Text") },
        { icon: Zap, title: t("access.f4Title"), text: t("access.f4Text") },
    ];

    return (
        <section
            id="accessibility"
            ref={ref}
            className="py-28"
            style={{ backgroundColor: "var(--landing-bg-2)" }}
        >
            <div className="mx-auto max-w-7xl px-4">
                <div
                    className="mb-14 text-center"
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? "translateY(0)" : "translateY(16px)",
                        transition: "opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)",
                    }}
                >
                    <div className="mb-4 flex items-center justify-center gap-3">
                        <span
                            aria-hidden="true"
                            className="h-px w-8 bg-[#8CC63F]"
                        />
                        <div
                            className="flex items-center gap-2 rounded-full border px-3 py-1"
                            style={{
                                borderColor: "rgba(140,198,63,0.3)",
                                backgroundColor: "rgba(140,198,63,0.08)",
                            }}
                        >
                            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8CC63F]">
                                {t("access.badge")}
                            </span>
                        </div>
                        <span aria-hidden="true" className="h-px w-8 bg-[#8CC63F]" />
                    </div>
                    <h2
                        className="text-4xl font-bold leading-[1.1] tracking-tighter lg:text-5xl"
                        style={{ color: "var(--landing-text-1)" }}
                    >
                        {t("access.headline")}
                    </h2>
                    <p
                        className="mx-auto mt-4 max-w-[52ch] text-base"
                        style={{ color: "var(--landing-text-2)" }}
                    >
                        {t("access.description")}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((f, i) => (
                        <div
                            key={i}
                            className="kora-access-item flex flex-col gap-4 px-6 py-9 transition-all duration-500"
                            style={{
                                opacity: visible ? 1 : 0,
                                transform: visible ? "translateY(0)" : "translateY(20px)",
                                transitionDelay: (0.1 + i * 0.08) + "s",
                                borderTop: "1px solid var(--landing-divider)",
                            }}
                        >
                            <f.icon className="h-6 w-6 text-[#8CC63F]" />
                            <div>
                                <h3
                                    className="mb-2 text-sm font-semibold"
                                    style={{ color: "var(--landing-text-1)" }}
                                >
                                    {f.title}
                                </h3>
                                <p className="text-sm leading-relaxed" style={{ color: "var(--landing-text-3)" }}>
                                    {f.text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ---------------------------------------------------------------------------
// HOW IT WORKS
// ---------------------------------------------------------------------------
function HowItWorksSection() {
    const t = useTranslations("landing");
    const [ref, visible] = useReveal();

    const steps = [
        { n: t("howto.s1n"), title: t("howto.s1Title"), text: t("howto.s1Text") },
        { n: t("howto.s2n"), title: t("howto.s2Title"), text: t("howto.s2Text") },
        { n: t("howto.s3n"), title: t("howto.s3Title"), text: t("howto.s3Text") },
    ];

    return (
        <section
            id="how-it-works"
            ref={ref}
            className="py-28"
            style={{ backgroundColor: "var(--landing-bg-1)" }}
        >
            <div className="mx-auto max-w-7xl px-4">
                <div
                    className="mb-16"
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? "translateY(0)" : "translateY(16px)",
                        transition: "opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)",
                    }}
                >
                    <div
                        className="mb-4 flex w-fit items-center gap-2 rounded-full border px-3 py-1"
                        style={{
                            borderColor: "rgba(140,198,63,0.3)",
                            backgroundColor: "rgba(140,198,63,0.08)",
                        }}
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#8CC63F]" />
                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8CC63F]">
                            {t("howto.badge")}
                        </span>
                    </div>
                    <h2
                        className="text-4xl font-bold leading-[1.1] tracking-tighter lg:text-5xl"
                        style={{ color: "var(--landing-text-1)" }}
                    >
                        {t("howto.headline")}
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3">
                    {steps.map((s, i) => (
                        <div
                            key={i}
                            className="kora-howto-item flex flex-col gap-5 py-10 transition-all duration-500 lg:px-10 lg:first:pl-0"
                            style={{
                                opacity: visible ? 1 : 0,
                                transform: visible ? "translateY(0)" : "translateY(24px)",
                                transitionDelay: (0.1 + i * 0.1) + "s",
                                borderTop: "1px solid var(--landing-divider)",
                            }}
                        >
                            <span
                                className="font-mono text-5xl font-bold leading-none tracking-tighter"
                                style={{ color: "rgba(140,198,63,0.2)" }}
                            >
                                {s.n}
                            </span>
                            <div>
                                <h3
                                    className="mb-2 text-lg font-semibold"
                                    style={{ color: "var(--landing-text-1)" }}
                                >
                                    {s.title}
                                </h3>
                                <p className="text-sm leading-relaxed" style={{ color: "var(--landing-text-2)" }}>
                                    {s.text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ---------------------------------------------------------------------------
// CTA
// ---------------------------------------------------------------------------
function CtaSection() {
    const t = useTranslations("landing");
    const [ref, visible] = useReveal();

    return (
        <section
            id="cta"
            ref={ref}
            className="py-4"
            style={{ backgroundColor: "var(--landing-bg-2)" }}
        >
            <div className="mx-auto max-w-7xl px-4">
                <div
                    className="relative overflow-hidden rounded-3xl bg-[#8CC63F] p-12 text-center md:p-20"
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? "translateY(0)" : "translateY(24px)",
                        transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
                    }}
                >
                    {/* Inner texture */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.12) 0%, transparent 55%), radial-gradient(circle at 80% 15%, rgba(255,255,255,0.07) 0%, transparent 45%)",
                        }}
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-3xl border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                    />

                    <CalendarDays className="mx-auto mb-6 h-10 w-10 text-white/50" />

                    <h2 className="text-4xl font-bold leading-[1.08] tracking-tighter text-white lg:text-5xl">
                        {t("cta.headline")}
                    </h2>
                    <p className="mx-auto mt-4 max-w-[46ch] text-base text-white/65">
                        {t("cta.description")}
                    </p>

                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        {/* Button-in-button primary CTA */}
                        <Link
                            href="/bookings"
                            className="group inline-flex items-center gap-0 rounded-full bg-white pl-8 pr-2 py-2 text-sm font-bold text-[#8CC63F] transition-all duration-500 hover:-translate-y-[2px] hover:shadow-[0_16px_40px_rgba(0,0,0,0.3)] active:scale-[0.98]"
                            style={{ transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1)" }}
                        >
                            {t("cta.primary")}
                            <span
                                className="ml-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#8CC63F]/10 transition-all duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-[1px] group-hover:scale-105"
                                style={{ transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1)" }}
                            >
                                <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                        </Link>
                        <Link
                            href="/clubs"
                            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/[0.1] px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.18] active:scale-[0.98]"
                        >
                            {t("cta.secondary")}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ---------------------------------------------------------------------------
// CLUBS CAROUSEL
// ---------------------------------------------------------------------------
function ClubsCarouselSection() {
    const t = useTranslations("landing");
    const [paused, setPaused] = useState(false);
    const [ref, visible] = useReveal();

    const clubs = [
        { seed: "kora-club-spo-01", name: t("clubs.c1Name"), address: t("clubs.c1Address"), rating: 4.9 },
        { seed: "kora-club-rio-02", name: t("clubs.c2Name"), address: t("clubs.c2Address"), rating: 4.7 },
        { seed: "kora-club-bhe-03", name: t("clubs.c3Name"), address: t("clubs.c3Address"), rating: 4.8 },
        { seed: "kora-club-cwb-04", name: t("clubs.c4Name"), address: t("clubs.c4Address"), rating: 4.6 },
        { seed: "kora-club-poa-05", name: t("clubs.c5Name"), address: t("clubs.c5Address"), rating: 4.9 },
        { seed: "kora-club-ssa-06", name: t("clubs.c6Name"), address: t("clubs.c6Address"), rating: 4.7 },
        { seed: "kora-club-bsb-07", name: t("clubs.c7Name"), address: t("clubs.c7Address"), rating: 4.5 },
    ];

    const track = [...clubs, ...clubs];

    return (
        <section
            ref={ref}
            className="overflow-hidden py-28"
            style={{ backgroundColor: "var(--landing-bg-2)" }}
        >
            {/* Section header */}
            <div
                className="mx-auto mb-14 max-w-7xl px-4"
                style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(16px)",
                    transition: "opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)",
                }}
            >
                <div
                    className="mb-4 flex w-fit items-center gap-2 rounded-full border px-3 py-1"
                    style={{
                        borderColor: "rgba(140,198,63,0.3)",
                        backgroundColor: "rgba(140,198,63,0.08)",
                    }}
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#8CC63F]" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8CC63F]">
                        {t("clubs.badge")}
                    </span>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <h2
                        className="text-4xl font-bold leading-[1.1] tracking-tighter lg:text-5xl"
                        style={{ color: "var(--landing-text-1)" }}
                    >
                        {t("clubs.headline")}
                    </h2>
                    <p
                        className="max-w-[44ch] text-sm leading-relaxed sm:text-right"
                        style={{ color: "var(--landing-text-2)" }}
                    >
                        {t("clubs.description")}
                    </p>
                </div>
            </div>

            {/* Carousel */}
            <div
                className="relative"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
            >
                {/* Edge fades */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-0 z-10 w-28"
                    style={{ background: "linear-gradient(to right, var(--landing-bg-2), transparent)" }}
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 right-0 z-10 w-28"
                    style={{ background: "linear-gradient(to left, var(--landing-bg-2), transparent)" }}
                />

                <div
                    className="flex gap-5 pl-6"
                    style={{
                        width: "max-content",
                        animation: "kora-scroll 44s linear infinite",
                        animationPlayState: paused ? "paused" : "running",
                    }}
                >
                    {track.map((club, i) => (
                        <article
                            key={i}
                            className="w-72 shrink-0 overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1.5"
                            style={{
                                border: "1px solid var(--landing-card-border)",
                                backgroundColor: "var(--landing-card-bg)",
                            }}
                        >
                            <div className="relative h-40 overflow-hidden">
                                <img
                                    src={"https://picsum.photos/seed/" + club.seed + "/288/160"}
                                    alt={club.name}
                                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                    draggable={false}
                                />
                                <div
                                    className="absolute inset-0"
                                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)" }}
                                />
                                {/* Rating pill */}
                                <div
                                    className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 backdrop-blur-md"
                                    style={{
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        backgroundColor: "rgba(0,0,0,0.55)",
                                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
                                    }}
                                >
                                    <Star className="h-3 w-3 fill-[#8CC63F] text-[#8CC63F]" />
                                    <span className="text-[11px] font-bold tabular-nums text-white">
                                        {club.rating.toFixed(1)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2.5 p-4">
                                <p
                                    className="truncate text-sm font-semibold"
                                    style={{ color: "var(--landing-text-1)" }}
                                >
                                    {club.name}
                                </p>
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <Star
                                            key={n}
                                            className={"h-3 w-3 " + (n <= Math.floor(club.rating) ? "fill-[#8CC63F] text-[#8CC63F]" : "fill-current opacity-15 text-[#8CC63F]")}
                                        />
                                    ))}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="h-3 w-3 shrink-0" style={{ color: "var(--landing-text-3)" }} />
                                    <span
                                        className="truncate text-xs"
                                        style={{ color: "var(--landing-text-3)" }}
                                    >
                                        {club.address}
                                    </span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ---------------------------------------------------------------------------
// CONTACT
// ---------------------------------------------------------------------------
function ContactSection() {
    const t = useTranslations("landing");
    const [ref, visible] = useReveal();

    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [agreed, setAgreed] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

    function validate() {
        const e: Record<string, string> = {};
        if (!form.name.trim()) e.name = t("contact.errRequired");
        if (!form.email.trim()) e.email = t("contact.errRequired");
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t("contact.errEmail");
        if (!form.message.trim()) e.message = t("contact.errRequired");
        if (!agreed) e.agreed = t("contact.errConsent");
        return e;
    }

    async function handleSubmit(ev: React.FormEvent) {
        ev.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setStatus("loading");
        await new Promise<void>((r) => setTimeout(r, 1500));
        setStatus("success");
    }

    const inputStyle = {
        backgroundColor: "var(--landing-input-bg)",
        borderColor: "var(--landing-input-border)",
        color: "var(--landing-text-1)",
    };
    const inputErrStyle = {
        backgroundColor: "var(--landing-input-bg)",
        borderColor: "rgba(239,68,68,0.4)",
        color: "var(--landing-text-1)",
    };
    const inputBase = "kora-input w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200 focus:ring-1 focus:ring-[#8CC63F]/30";

    const facts = [
        { Icon: Clock, label: t("contact.infoReplyTime"), value: t("contact.infoReplyValue") },
        { Icon: Globe, label: t("contact.infoClubs"), value: t("contact.infoClubsValue") },
        { Icon: Users, label: t("contact.infoPlayers"), value: t("contact.infoPlayersValue") },
    ] as const;

    return (
        <section
            ref={ref}
            className="py-28"
            style={{ backgroundColor: "var(--landing-bg-1)" }}
        >
            <div className="mx-auto max-w-7xl px-4">
                <div
                    className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_360px]"
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? "translateY(0)" : "translateY(20px)",
                        transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
                    }}
                >
                    {/* LEFT: Form */}
                    <div>
                        <div
                            className="mb-4 flex w-fit items-center gap-2 rounded-full border px-3 py-1"
                            style={{
                                borderColor: "rgba(140,198,63,0.3)",
                                backgroundColor: "rgba(140,198,63,0.08)",
                            }}
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-[#8CC63F]" />
                            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8CC63F]">
                                {t("contact.badge")}
                            </span>
                        </div>

                        <h2
                            className="mb-3 text-5xl font-bold leading-[1.05] tracking-tighter lg:text-6xl"
                            style={{ color: "var(--landing-text-1)" }}
                        >
                            {t("contact.headline")}{" "}
                            <span className="text-[#8CC63F]">{t("contact.headlineAccent")}</span>
                        </h2>
                        <p
                            className="mb-10 max-w-[52ch] text-sm leading-relaxed"
                            style={{ color: "var(--landing-text-2)" }}
                        >
                            {t("contact.subline")}
                        </p>

                        {status === "success" ? (
                            <div className="flex flex-col items-start gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-8 py-10">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
                                    <Check className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-base font-semibold" style={{ color: "var(--landing-text-1)" }}>
                                        {t("contact.successTitle")}
                                    </p>
                                    <p className="mt-1 text-sm" style={{ color: "var(--landing-text-2)" }}>
                                        {t("contact.successBody")}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div className="flex flex-col gap-1.5">
                                        <label
                                            className="text-xs font-medium"
                                            style={{ color: "var(--landing-text-2)" }}
                                        >
                                            {t("contact.nameLabel")}
                                        </label>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            placeholder={t("contact.namePlaceholder")}
                                            className={inputBase}
                                            style={errors.name ? inputErrStyle : inputStyle}
                                        />
                                        {errors.name && <span className="text-xs text-red-400">{errors.name}</span>}
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label
                                            className="text-xs font-medium"
                                            style={{ color: "var(--landing-text-2)" }}
                                        >
                                            {t("contact.emailLabel")}
                                        </label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            placeholder={t("contact.emailPlaceholder")}
                                            className={inputBase}
                                            style={errors.email ? inputErrStyle : inputStyle}
                                        />
                                        {errors.email && <span className="text-xs text-red-400">{errors.email}</span>}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label
                                        className="text-xs font-medium"
                                        style={{ color: "var(--landing-text-2)" }}
                                    >
                                        {t("contact.messageLabel")}
                                    </label>
                                    <textarea
                                        rows={5}
                                        value={form.message}
                                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                                        placeholder={t("contact.messagePlaceholder")}
                                        className={inputBase + " resize-none"}
                                        style={errors.message ? inputErrStyle : inputStyle}
                                    />
                                    {errors.message && <span className="text-xs text-red-400">{errors.message}</span>}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="flex cursor-pointer items-start gap-3">
                                        <span className="relative mt-0.5 shrink-0">
                                            <input
                                                type="checkbox"
                                                checked={agreed}
                                                onChange={(e) => setAgreed(e.target.checked)}
                                                className="sr-only"
                                            />
                                            <span
                                                className="flex h-4 w-4 items-center justify-center rounded border transition-all duration-150"
                                                style={{
                                                    borderColor: agreed
                                                        ? "#8CC63F"
                                                        : errors.agreed
                                                            ? "rgba(239,68,68,0.5)"
                                                            : "var(--landing-card-border)",
                                                    backgroundColor: agreed ? "#8CC63F" : "var(--landing-input-bg)",
                                                }}
                                            >
                                                {agreed && <Check className="h-2.5 w-2.5 text-white" />}
                                            </span>
                                        </span>
                                        <span className="text-xs leading-relaxed" style={{ color: "var(--landing-text-2)" }}>
                                            {t("contact.consentText")}
                                        </span>
                                    </label>
                                    {errors.agreed && (
                                        <span className="pl-7 text-xs text-red-400">{errors.agreed}</span>
                                    )}
                                </div>

                                <div className="pt-1">
                                    <button
                                        type="submit"
                                        disabled={status === "loading"}
                                        className="group inline-flex items-center gap-2.5 rounded-full bg-[#8CC63F] px-7 py-3.5 text-sm font-semibold text-[#0D1B2A] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#7AB534] hover:shadow-[0_12px_35px_rgba(140,198,63,0.38)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
                                    >
                                        {status === "loading" ? (
                                            <>
                                                <span
                                                    className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                                                    style={{ animation: "kora-spin 0.8s linear infinite" }}
                                                    aria-hidden="true"
                                                />
                                                {t("contact.sendingLabel")}
                                            </>
                                        ) : (
                                            <>
                                                {t("contact.sendLabel")}
                                                <Send className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* RIGHT: Info panel */}
                    <div className="lg:sticky lg:top-28 lg:self-start">
                        {/* Outer shell */}
                        <div
                            className="rounded-[1.5rem] p-1.5"
                            style={{
                                border: "1px solid var(--landing-card-border)",
                                backgroundColor: "var(--landing-card-bg)",
                            }}
                        >
                            {/* Inner core */}
                            <div
                                className="relative overflow-hidden rounded-[1.1rem] p-8"
                                style={{
                                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                                    backgroundColor: "var(--landing-card-bg)",
                                }}
                            >
                                <div
                                    aria-hidden="true"
                                    className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#8CC63F] blur-[80px]"
                                    style={{ opacity: "var(--landing-glow-opacity)" }}
                                />

                                <p className="mb-8 text-base font-semibold leading-snug" style={{ color: "var(--landing-text-1)" }}>
                                    Fast responses,<br />real support.
                                </p>

                                <div className="flex flex-col gap-6">
                                    {facts.map(({ Icon, label, value }) => (
                                        <div key={label} className="flex items-center gap-4">
                                            <div
                                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                                                style={{
                                                    border: "1px solid var(--landing-card-border)",
                                                    backgroundColor: "var(--landing-card-bg)",
                                                }}
                                            >
                                                <Icon className="h-4 w-4 text-[#8CC63F]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold" style={{ color: "var(--landing-text-1)" }}>
                                                    {value}
                                                </p>
                                                <p className="text-xs" style={{ color: "var(--landing-text-3)" }}>
                                                    {label}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div
                                    className="mt-8 pt-6"
                                    style={{ borderTop: "1px solid var(--landing-divider)" }}
                                >
                                    <p className="text-xs leading-relaxed" style={{ color: "var(--landing-text-3)" }}>
                                        {t("contact.infoPrivacy")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ---------------------------------------------------------------------------
// FOOTER
// ---------------------------------------------------------------------------
function FooterSection() {
    const t = useTranslations("landing");
    const tc = useTranslations("cookies");

    const col1 = [
        { label: t("footer.col1Clubs"), href: "/clubs" },
    ];
    const col2 = [
        { label: t("footer.col2Book"), href: "/bookings" },
    ];
    const col3: { label: string; href: string }[] = [];

    // Only show columns with links
    const columns = [col1, col2, col3].filter(col => col.length > 0);
    const columnTitles = [t("footer.col1Title"), t("footer.col2Title")].filter((_, i) => [col1, col2, col3][i].length > 0);

    return (
        <footer
            id="footer"
            style={{ borderTop: "1px solid var(--landing-divider)", backgroundColor: "var(--landing-bg-footer)" }}
        >
            <div className="mx-auto max-w-7xl px-4 py-16">
                <div className="grid grid-cols-1 gap-16 md:grid-cols-[auto_1fr]">

                    {/* LEFT: Brand + social + legal */}
                    <div className="flex flex-col gap-8">
                        <div>
                            <span
                                className="text-xl font-bold tracking-tight"
                                style={{ color: "var(--landing-text-1)" }}
                            >
                                Kora
                            </span>
                            <p
                                className="mt-2 max-w-[26ch] text-xs leading-relaxed"
                                style={{ color: "var(--landing-text-3)" }}
                            >
                                {t("footer.tagline")}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {[
                                { label: "Facebook", path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
                                { label: "Instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
                                { label: "X (Twitter)", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
                            ].map(({ label, path }) => (
                                <a
                                    key={label}
                                    href="#"
                                    aria-label={label}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 hover:border-[#8CC63F]/30 hover:bg-[#8CC63F]/10"
                                    style={{
                                        border: "1px solid var(--landing-card-border)",
                                        backgroundColor: "var(--landing-card-bg)",
                                        color: "var(--landing-text-3)",
                                    }}
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                                        <path d={path} />
                                    </svg>
                                </a>
                            ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-5">
                            {[t("footer.privacy"), t("footer.terms")].map((label) => (
                                <a
                                    key={label}
                                    href="#"
                                    className="text-xs transition-colors duration-200"
                                    style={{ color: "var(--landing-text-3)" }}
                                >
                                    {label}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Site map */}
                    <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:justify-items-end">
                        {columns.map((links, idx) => (
                            <div key={idx}>
                                <p
                                    className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em]"
                                    style={{ color: "var(--landing-text-3)" }}
                                >
                                    {columnTitles[idx]}
                                </p>
                                <ul className="flex flex-col gap-3">
                                    {links.map(({ label, href }) => (
                                        <li key={label}>
                                            <a
                                                href={href}
                                                className="text-xs transition-colors duration-200 hover:text-[#8CC63F]"
                                                style={{ color: "var(--landing-text-2)" }}
                                            >
                                                {label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Copyright bar */}
            <div style={{ borderTop: "1px solid var(--landing-divider)" }}>
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
                    <p className="text-xs" style={{ color: "var(--landing-text-3)" }}>
                        {t("footer.copyright")}
                    </p>
                    <div className="flex items-center gap-2">
                        <span
                            aria-hidden="true"
                            className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                            style={{ animation: "kora-pulse 2.5s ease-in-out infinite" }}
                        />
                        <span className="text-xs" style={{ color: "var(--landing-text-3)" }}>
                            {t("footer.statusLabel")}
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// ---------------------------------------------------------------------------
// FAQ SECTION
// ---------------------------------------------------------------------------
function FAQSection() {
    const t = useTranslations("landing");
    const [ref, visible] = useReveal();
    const [expanded, setExpanded] = useState<string | null>(null);

    const faqs = [
        {
            id: "faq-1",
            question: t("faq.q1"),
            answer: t("faq.a1"),
        },
        {
            id: "faq-2",
            question: t("faq.q2"),
            answer: t("faq.a2"),
        },
        {
            id: "faq-3",
            question: t("faq.q3"),
            answer: t("faq.a3"),
        },
        {
            id: "faq-4",
            question: t("faq.q4"),
            answer: t("faq.a4"),
        },
    ];

    return (
        <section
            id="faq"
            ref={ref}
            className="py-28"
            style={{ backgroundColor: "var(--landing-bg-2)" }}
        >
            <div className="mx-auto max-w-3xl px-4">
                <div
                    className="mb-14 text-center"
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? "translateY(0)" : "translateY(16px)",
                        transition: "opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)",
                    }}
                >
                    <div
                        className="mb-4 flex w-fit items-center gap-2 rounded-full border px-3 py-1 mx-auto"
                        style={{
                            borderColor: "rgba(140,198,63,0.3)",
                            backgroundColor: "rgba(140,198,63,0.08)",
                        }}
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#8CC63F]" />
                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8CC63F]">
                            {t("faq.badge")}
                        </span>
                    </div>
                    <h2
                        className="text-4xl font-bold leading-[1.1] tracking-tighter lg:text-5xl"
                        style={{ color: "var(--landing-text-1)" }}
                    >
                        {t("faq.headline")}
                    </h2>
                </div>

                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <div
                            key={faq.id}
                            className="rounded-xl overflow-hidden border"
                            style={{
                                borderColor: "var(--landing-card-border)",
                                backgroundColor: "var(--landing-bg-1)",
                                opacity: visible ? 1 : 0,
                                transform: visible ? "translateY(0)" : "translateY(16px)",
                                transition: "opacity 0.6s cubic-bezier(0.16,1,0.3,1) " + (0.05 + i * 0.08) + "s, transform 0.6s cubic-bezier(0.16,1,0.3,1) " + (0.05 + i * 0.08) + "s",
                            }}
                        >
                            <button
                                onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}
                                className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors hover:bg-[#8CC63F]/5"
                            >
                                <span
                                    className="font-semibold"
                                    style={{ color: "var(--landing-text-1)" }}
                                >
                                    {faq.question}
                                </span>
                                <div
                                    className="flex h-6 w-6 items-center justify-center rounded-full shrink-0 transition-transform duration-300"
                                    style={{
                                        backgroundColor: "rgba(140,198,63,0.1)",
                                        transform: expanded === faq.id ? "rotate(180deg)" : "rotate(0)",
                                    }}
                                >
                                    <ChevronDown className="h-4 w-4 text-[#8CC63F]" />
                                </div>
                            </button>

                            {expanded === faq.id && (
                                <div
                                    className="px-6 pb-4 border-t"
                                    style={{
                                        borderColor: "var(--landing-divider)",
                                        color: "var(--landing-text-2)",
                                    }}
                                >
                                    <p className="text-sm leading-relaxed">{faq.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ---------------------------------------------------------------------------
// Root export
// ---------------------------------------------------------------------------
export function LandingPage() {
    return (
        <>
            <style>{`
                @keyframes kora-fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0);    }
                }
                @keyframes kora-scroll {
                    from { transform: translateX(0); }
                    to   { transform: translateX(-50%); }
                }
                @keyframes kora-spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes kora-pulse {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0.3; }
                }
                /* Stats grid dividers */
                @media (min-width: 640px) {
                    .kora-stat-item:not(:first-child) {
                        border-top: none !important;
                        border-left: 1px solid var(--landing-divider);
                    }
                }
                /* AccessibilitySection left borders on sm+ */
                @media (min-width: 640px) {
                    .kora-access-item:not(:first-child) {
                        border-left: 1px solid var(--landing-divider);
                    }
                    .kora-access-item:nth-child(2n+1) {
                        border-left: none;
                    }
                }
                @media (min-width: 1024px) {
                    .kora-access-item:not(:first-child) {
                        border-left: 1px solid var(--landing-divider);
                    }
                    .kora-access-item:nth-child(2n+1) {
                        border-left: 1px solid var(--landing-divider);
                    }
                    .kora-access-item:first-child {
                        border-left: none;
                    }
                }
                /* HowItWorks left borders on lg+ */
                @media (min-width: 1024px) {
                    .kora-howto-item {
                        border-top: none !important;
                        border-left: 1px solid var(--landing-divider);
                    }
                    .kora-howto-item:first-child {
                        border-left: none;
                    }
                }
                /* Input placeholder color */
                .kora-input::placeholder {
                    color: var(--landing-text-3);
                    opacity: 0.7;
                }
            `}</style>

            <LandingNavbar />
            <HeroSection />
            {/* <StatsSection /> */}
            <BrazilSection />
            {/* <ClubsCarouselSection /> */}
            <BenefitsSection />
            <FindPlayersSection />
            <AccessibilitySection />
            <HowItWorksSection />
            <CtaSection />
            {/* <ContactSection /> */}
            <FAQSection />
            <FooterSection />
        </>
    );
}