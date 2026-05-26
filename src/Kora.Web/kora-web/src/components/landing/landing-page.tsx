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
} from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

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
// HERO
// ---------------------------------------------------------------------------
function HeroSection() {
    const t = useTranslations("landing");
    return (
        <section
            className="relative overflow-hidden bg-[#0d0e14]"
            style={{ minHeight: "100dvh" }}
        >
            {/* Ambient glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute right-0 top-0 h-[700px] w-[700px] -translate-y-1/3 translate-x-1/4 rounded-full bg-[#3D46FB] opacity-[0.07] blur-[140px]"
            />

            <div
                className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-28 lg:grid-cols-[1fr_460px] lg:py-0"
                style={{ minHeight: "inherit" }}
            >
                {/* Left: content */}
                <div
                    className="flex flex-col gap-8"
                    style={{ animation: "kora-fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both" }}
                >
                    <div className="flex items-center gap-3">
                        <span aria-hidden="true" className="h-px w-8 bg-[#3D46FB]" />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3D46FB]">
                            {t("hero.badge")}
                        </span>
                    </div>

                    <h1 className="text-[clamp(2.8rem,6vw,5rem)] font-bold leading-[1.04] tracking-tighter text-white">
                        {t("hero.headline1")}
                        <br />
                        <span className="text-[#818cf8]">{t("hero.headline2")}</span>
                        <br />{t("hero.headline3")}
                    </h1>

                    <p className="max-w-[48ch] text-base leading-relaxed text-zinc-400">
                        {t("hero.description")}
                    </p>

                    <div className="flex flex-wrap items-center gap-4">
                        <SignInButton mode="modal">
                            <button className="group inline-flex items-center gap-2.5 rounded-lg bg-[#3D46FB] px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-[2px] hover:bg-[#4f58fc] hover:shadow-[0_12px_35px_rgba(61,70,251,0.38)] active:scale-[0.98]">
                                {t("hero.ctaLogin")}
                                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                            </button>
                        </SignInButton>
                        <Link
                            href="/clubs"
                            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-7 py-3.5 text-sm font-semibold text-white/70 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white active:scale-[0.98]"
                        >
                            {t("hero.ctaSecondary")}
                        </Link>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                        <div className="flex" aria-label="5 estrelas">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <Star
                                    key={i}
                                    className="h-3.5 w-3.5 fill-[#3D46FB] text-[#3D46FB]"
                                />
                            ))}
                        </div>
                        <span className="text-sm text-zinc-500">
                            {t("hero.socialProof")}
                        </span>
                    </div>
                </div>

                {/* Right: image panel */}
                <div
                    className="relative hidden lg:block"
                    style={{ animation: "kora-fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}
                >
                    <div
                        className="relative overflow-hidden rounded-2xl border border-white/[0.07] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]"
                        style={{ height: "590px" }}
                    >
                        <img
                            src="https://picsum.photos/seed/padel-kora-hero/500/700"
                            alt="Quadra de padel iluminada"
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e14] via-[#0d0e14]/20 to-transparent" />

                        {/* Floating match card */}
                        <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-white/10 bg-black/50 p-4 backdrop-blur-md">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[11px] text-zinc-500">{t("hero.matchCard.label")}</p>
                                    <p className="mt-0.5 text-sm font-medium text-white">
                                        {t("hero.matchCard.court")}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[11px] text-zinc-500">{t("hero.matchCard.today")}</p>
                                    <p className="mt-0.5 text-sm font-bold text-[#818cf8]">19:00</p>
                                </div>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    {[41, 83, 27].map((seed) => (
                                        <img
                                            key={seed}
                                            src={`https://picsum.photos/seed/kora-p${seed}/40/40`}
                                            className="h-6 w-6 rounded-full border-2 border-black/60 object-cover"
                                            alt=""
                                        />
                                    ))}
                                </div>
                                <span className="text-xs text-zinc-500">{t("hero.matchCard.spots")}</span>
                                <span className="ml-auto cursor-pointer text-xs font-semibold text-[#3D46FB] transition-colors hover:text-[#818cf8]">
                                    {t("hero.matchCard.join")}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Glow behind card */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-12 left-10 right-10 h-40 rounded-full bg-[#3D46FB] opacity-[0.1] blur-[60px]"
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
        <div ref={ref} className="border-y border-white/[0.06] bg-[#0d0e14]">
            <div className="mx-auto max-w-7xl px-4">
                <div className="grid grid-cols-1 divide-y divide-white/[0.06] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    {stats.map((s, i) => (
                        <div
                            key={i}
                            className="flex flex-col gap-1.5 px-8 py-11 transition-all duration-500"
                            style={{
                                opacity: visible ? 1 : 0,
                                transform: visible ? "translateY(0)" : "translateY(16px)",
                                transitionDelay: `${i * 80}ms`,
                            }}
                        >
                            <span className="font-mono text-4xl font-bold tracking-tighter text-white">
                                {s.value}
                            </span>
                            <span className="text-sm text-zinc-500">{s.label}</span>
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
        <section ref={ref} className="overflow-hidden bg-[#0d0e14] py-28">
            <div className="mx-auto max-w-7xl px-4">
                <div className="grid grid-cols-1 gap-14 lg:grid-cols-[480px_1fr] lg:items-center">
                    {/* Image */}
                    <div
                        className="relative overflow-hidden rounded-2xl"
                        style={{
                            opacity: visible ? 1 : 0,
                            transform: visible ? "translateX(0)" : "translateX(-28px)",
                            transition:
                                "opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1)",
                        }}
                    >
                        <img
                            src="https://picsum.photos/seed/padel-brazil-2026/480/560"
                            alt="Expansão do padel no Brasil"
                            className="aspect-[4/5] w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0d0e14]/50" />

                        {/* Badge */}
                        <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-[#3D46FB]/30 bg-[#3D46FB]/15 px-4 py-2 backdrop-blur-sm">
                            <TrendingUp className="h-4 w-4 text-[#818cf8]" />
                            <span className="text-xs font-semibold text-[#818cf8]">
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
                            transition:
                                "opacity 0.75s cubic-bezier(0.16,1,0.3,1) 0.15s, transform 0.75s cubic-bezier(0.16,1,0.3,1) 0.15s",
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <span aria-hidden="true" className="h-px w-8 bg-[#3D46FB]" />
                            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3D46FB]">
                                {t("brazil.badge")}
                            </span>
                        </div>

                        <h2 className="text-4xl font-bold leading-[1.1] tracking-tighter text-white lg:text-5xl">
                            {t("brazil.headline")}
                        </h2>

                        <p className="text-base leading-relaxed text-zinc-400">
                            {t("brazil.description")}
                        </p>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {facts.map((item, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-[#3D46FB]" />
                                    <p className="text-sm leading-relaxed text-zinc-400">
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
        <section ref={ref} className="bg-[#0a0b10] py-28">
            <div className="mx-auto max-w-7xl px-4">
                <div
                    className="mb-14 max-w-xl"
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? "translateY(0)" : "translateY(16px)",
                        transition:
                            "opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)",
                    }}
                >
                    <div className="mb-4 flex items-center gap-3">
                        <span aria-hidden="true" className="h-px w-8 bg-[#3D46FB]" />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3D46FB]">
                            {t("benefits.badge")}
                        </span>
                    </div>
                    <h2 className="text-4xl font-bold leading-[1.1] tracking-tighter text-white lg:text-5xl">
                        {t("benefits.headline")}
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {benefits.map((b, i) => (
                        <div
                            key={i}
                            className={[
                                "group flex flex-col gap-5 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-7 transition-all duration-500 hover:border-[#3D46FB]/25 hover:bg-white/[0.04]",
                                b.wide ? "md:col-span-2" : "md:col-span-1",
                            ].join(" ")}
                            style={{
                                opacity: visible ? 1 : 0,
                                transform: visible ? "translateY(0)" : "translateY(24px)",
                                transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${0.1 + i * 0.08}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${0.1 + i * 0.08}s`,
                            }}
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3D46FB]/10 transition-colors duration-300 group-hover:bg-[#3D46FB]/18">
                                <b.icon className="h-5 w-5 text-[#3D46FB]" />
                            </div>
                            <div>
                                <h3 className="mb-2 text-base font-semibold text-white">
                                    {b.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-zinc-400">
                                    {b.description}
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
        <section ref={ref} className="bg-[#0d0e14] py-28">
            <div className="mx-auto max-w-7xl px-4">
                <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[1fr_420px]">
                    {/* Content */}
                    <div
                        className="flex flex-col gap-7"
                        style={{
                            opacity: visible ? 1 : 0,
                            transform: visible ? "translateX(0)" : "translateX(-20px)",
                            transition:
                                "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <span aria-hidden="true" className="h-px w-8 bg-[#3D46FB]" />
                            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3D46FB]">
                                {t("players.badge")}
                            </span>
                        </div>

                        <h2 className="text-4xl font-bold leading-[1.1] tracking-tighter text-white lg:text-5xl">
                            {t("players.headline")}
                        </h2>

                        <p className="text-base leading-relaxed text-zinc-400">
                            {t("players.description")}
                        </p>

                        <ul className="flex flex-col gap-4">
                            {features.map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#3D46FB]" />
                                    <span className="text-sm leading-relaxed text-zinc-400">
                                        {item}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <Link
                            href="/bookings"
                            className="group mt-2 inline-flex w-fit items-center gap-2 rounded-lg border border-[#3D46FB]/35 bg-[#3D46FB]/10 px-6 py-3 text-sm font-semibold text-[#818cf8] transition-all duration-300 hover:border-[#3D46FB]/55 hover:bg-[#3D46FB]/18 active:scale-[0.98]"
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
                            transition:
                                "opacity 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s",
                        }}
                    >
                        {players.map((p, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.025] p-4 transition-all duration-300 hover:border-[#3D46FB]/20 hover:bg-white/[0.04]"
                            >
                                <img
                                    src={`https://picsum.photos/seed/kp${p.seed}/48/48`}
                                    className="h-11 w-11 shrink-0 rounded-full object-cover"
                                    alt={p.name}
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-white">
                                        {p.name}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        {p.city} · {p.games}
                                    </p>
                                </div>
                                <span className="shrink-0 rounded-full border border-[#3D46FB]/30 bg-[#3D46FB]/10 px-3 py-1 text-[11px] font-medium text-[#818cf8]">
                                    {p.level}
                                </span>
                            </div>
                        ))}

                        <div className="mt-1 flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.08] py-5 text-sm text-zinc-600">
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
        {
            icon: Globe,
            title: t("access.f1Title"),
            text: t("access.f1Text"),
        },
        {
            icon: Users,
            title: t("access.f2Title"),
            text: t("access.f2Text"),
        },
        {
            icon: Shield,
            title: t("access.f3Title"),
            text: t("access.f3Text"),
        },
        {
            icon: Zap,
            title: t("access.f4Title"),
            text: t("access.f4Text"),
        },
    ];

    return (
        <section ref={ref} className="bg-[#0a0b10] py-28">
            <div className="mx-auto max-w-7xl px-4">
                <div
                    className="mb-14 text-center"
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? "translateY(0)" : "translateY(16px)",
                        transition:
                            "opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)",
                    }}
                >
                    <div className="mb-4 flex items-center justify-center gap-3">
                        <span aria-hidden="true" className="h-px w-8 bg-[#3D46FB]" />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3D46FB]">
                            {t("access.badge")}
                        </span>
                        <span aria-hidden="true" className="h-px w-8 bg-[#3D46FB]" />
                    </div>
                    <h2 className="text-4xl font-bold leading-[1.1] tracking-tighter text-white lg:text-5xl">
                        {t("access.headline")}
                    </h2>
                    <p className="mx-auto mt-4 max-w-[52ch] text-base text-zinc-400">
                        {t("access.description")}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((f, i) => (
                        <div
                            key={i}
                            className="flex flex-col gap-4 border-t border-white/[0.06] px-6 py-9 sm:border-l sm:first:border-l-0 transition-all duration-500"
                            style={{
                                opacity: visible ? 1 : 0,
                                transform: visible ? "translateY(0)" : "translateY(20px)",
                                transitionDelay: `${0.1 + i * 0.08}s`,
                            }}
                        >
                            <f.icon className="h-6 w-6 text-[#3D46FB]" />
                            <div>
                                <h3 className="mb-2 text-sm font-semibold text-white">
                                    {f.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-zinc-500">{f.text}</p>
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
        {
            n: t("howto.s1n"),
            title: t("howto.s1Title"),
            text: t("howto.s1Text"),
        },
        {
            n: t("howto.s2n"),
            title: t("howto.s2Title"),
            text: t("howto.s2Text"),
        },
        {
            n: t("howto.s3n"),
            title: t("howto.s3Title"),
            text: t("howto.s3Text"),
        },
    ];

    return (
        <section ref={ref} className="bg-[#0d0e14] py-28">
            <div className="mx-auto max-w-7xl px-4">
                <div
                    className="mb-16"
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? "translateY(0)" : "translateY(16px)",
                        transition:
                            "opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)",
                    }}
                >
                    <div className="mb-4 flex items-center gap-3">
                        <span aria-hidden="true" className="h-px w-8 bg-[#3D46FB]" />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3D46FB]">
                            {t("howto.badge")}
                        </span>
                    </div>
                    <h2 className="text-4xl font-bold leading-[1.1] tracking-tighter text-white lg:text-5xl">
                        {t("howto.headline")}
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-0 lg:grid-cols-3">
                    {steps.map((s, i) => (
                        <div
                            key={i}
                            className="flex flex-col gap-5 border-t border-white/[0.06] py-10 transition-all duration-500 lg:border-l lg:border-t-0 lg:px-10 lg:first:border-l-0 lg:first:pl-0"
                            style={{
                                opacity: visible ? 1 : 0,
                                transform: visible ? "translateY(0)" : "translateY(24px)",
                                transitionDelay: `${0.1 + i * 0.1}s`,
                            }}
                        >
                            <span className="font-mono text-5xl font-bold leading-none tracking-tighter text-[#3D46FB]/20">
                                {s.n}
                            </span>
                            <div>
                                <h3 className="mb-2 text-lg font-semibold text-white">
                                    {s.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-zinc-400">{s.text}</p>
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
        <section ref={ref} className="bg-[#0a0b10] pb-28 pt-4">
            <div className="mx-auto max-w-7xl px-4">
                <div
                    className="relative overflow-hidden rounded-3xl bg-[#3D46FB] p-12 text-center md:p-20"
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? "translateY(0)" : "translateY(24px)",
                        transition:
                            "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
                    }}
                >
                    {/* Subtle inner texture */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.12) 0%, transparent 55%), radial-gradient(circle at 80% 15%, rgba(255,255,255,0.07) 0%, transparent 45%)",
                        }}
                    />
                    {/* Inner refraction border (Liquid Glass principle) */}
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
                        <Link
                            href="/bookings"
                            className="inline-flex items-center gap-2.5 rounded-lg bg-white px-8 py-4 text-sm font-bold text-[#3D46FB] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_16px_40px_rgba(0,0,0,0.3)] active:scale-[0.98]"
                        >
                            {t("cta.primary")}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/clubs"
                            className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/[0.1] px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.18] active:scale-[0.98]"
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
        <section ref={ref} className="overflow-hidden bg-[#0a0b10] py-28">
            {/* Section header */}
            <div
                className="mx-auto mb-14 max-w-7xl px-4"
                style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(16px)",
                    transition:
                        "opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)",
                }}
            >
                <div className="mb-4 flex items-center gap-3">
                    <span aria-hidden="true" className="h-px w-8 bg-[#3D46FB]" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3D46FB]">
                        {t("clubs.badge")}
                    </span>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <h2 className="text-4xl font-bold leading-[1.1] tracking-tighter text-white lg:text-5xl">
                        {t("clubs.headline")}
                    </h2>
                    <p className="max-w-[44ch] text-sm leading-relaxed text-zinc-400 sm:text-right">
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
                {/* Left edge fade */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-0 z-10 w-28 bg-linear-to-r from-[#0a0b10] to-transparent"
                />
                {/* Right edge fade */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 right-0 z-10 w-28 bg-linear-to-l from-[#0a0b10] to-transparent"
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
                            className="w-72 shrink-0 overflow-hidden rounded-2xl border border-white/6 bg-white/2.5 transition-all duration-300 hover:border-[#3D46FB]/25 hover:bg-white/4 hover:-translate-y-1.5"
                        >
                            {/* Club photo */}
                            <div className="relative h-40 overflow-hidden">
                                <img
                                    src={`https://picsum.photos/seed/${club.seed}/288/160`}
                                    alt={club.name}
                                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                    draggable={false}
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                                {/* Liquid-glass rating pill */}
                                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/55 px-2.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md">
                                    <Star className="h-3 w-3 fill-[#3D46FB] text-[#3D46FB]" />
                                    <span className="text-[11px] font-bold tabular-nums text-white">
                                        {club.rating.toFixed(1)}
                                    </span>
                                </div>
                            </div>

                            {/* Card content */}
                            <div className="flex flex-col gap-2.5 p-4">
                                <p className="truncate text-sm font-semibold text-white">{club.name}</p>
                                {/* Star row */}
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <Star
                                            key={n}
                                            className={`h-3 w-3 ${n <= Math.floor(club.rating)
                                                ? "fill-[#3D46FB] text-[#3D46FB]"
                                                : "fill-zinc-800 text-zinc-800"
                                                }`}
                                        />
                                    ))}
                                </div>
                                {/* Address */}
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="h-3 w-3 shrink-0 text-zinc-500" />
                                    <span className="truncate text-xs text-zinc-500">{club.address}</span>
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

    const inputBase =
        "w-full rounded-xl border bg-white/4 px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none transition-all duration-200 focus:bg-white/6 focus:ring-1 focus:ring-[#3D46FB]/30";
    const inputOk = "border-white/8 focus:border-[#3D46FB]/60";
    const inputErr = "border-red-500/40 focus:border-red-500/50";

    const facts = [
        { Icon: Clock, label: t("contact.infoReplyTime"), value: t("contact.infoReplyValue") },
        { Icon: Globe, label: t("contact.infoClubs"), value: t("contact.infoClubsValue") },
        { Icon: Users, label: t("contact.infoPlayers"), value: t("contact.infoPlayersValue") },
    ] as const;

    return (
        <section ref={ref} className="bg-[#0d0e14] py-28">
            <div className="mx-auto max-w-7xl px-4">
                <div
                    className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_360px]"
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? "translateY(0)" : "translateY(20px)",
                        transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
                    }}
                >
                    {/* ── LEFT: Form ── */}
                    <div>
                        <div className="mb-6 flex items-center gap-3">
                            <span aria-hidden="true" className="h-px w-8 bg-[#3D46FB]" />
                            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3D46FB]">
                                {t("contact.badge")}
                            </span>
                        </div>

                        <h2 className="mb-3 text-5xl font-bold leading-[1.05] tracking-tighter text-white lg:text-6xl">
                            {t("contact.headline")}{" "}
                            <span className="text-[#3D46FB]">{t("contact.headlineAccent")}</span>
                        </h2>
                        <p className="mb-10 max-w-[52ch] text-sm leading-relaxed text-zinc-400">
                            {t("contact.subline")}
                        </p>

                        {/* ── Success state ── */}
                        {status === "success" ? (
                            <div className="flex flex-col items-start gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-8 py-10">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
                                    <Check className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-base font-semibold text-white">{t("contact.successTitle")}</p>
                                    <p className="mt-1 text-sm text-zinc-400">{t("contact.successBody")}</p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                                {/* Name + Email */}
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-medium text-zinc-400">{t("contact.nameLabel")}</label>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            placeholder={t("contact.namePlaceholder")}
                                            className={`${inputBase} ${errors.name ? inputErr : inputOk}`}
                                        />
                                        {errors.name && <span className="text-xs text-red-400">{errors.name}</span>}
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-medium text-zinc-400">{t("contact.emailLabel")}</label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            placeholder={t("contact.emailPlaceholder")}
                                            className={`${inputBase} ${errors.email ? inputErr : inputOk}`}
                                        />
                                        {errors.email && <span className="text-xs text-red-400">{errors.email}</span>}
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-medium text-zinc-400">{t("contact.messageLabel")}</label>
                                    <textarea
                                        rows={5}
                                        value={form.message}
                                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                                        placeholder={t("contact.messagePlaceholder")}
                                        className={`${inputBase} resize-none ${errors.message ? inputErr : inputOk}`}
                                    />
                                    {errors.message && <span className="text-xs text-red-400">{errors.message}</span>}
                                </div>

                                {/* Consent checkbox */}
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
                                                className={`flex h-4 w-4 items-center justify-center rounded border transition-all duration-150 ${agreed
                                                        ? "border-[#3D46FB] bg-[#3D46FB]"
                                                        : errors.agreed
                                                            ? "border-red-500/50 bg-white/4"
                                                            : "border-white/20 bg-white/4"
                                                    }`}
                                            >
                                                {agreed && <Check className="h-2.5 w-2.5 text-white" />}
                                            </span>
                                        </span>
                                        <span className="text-xs leading-relaxed text-zinc-400">{t("contact.consentText")}</span>
                                    </label>
                                    {errors.agreed && <span className="pl-7 text-xs text-red-400">{errors.agreed}</span>}
                                </div>

                                {/* Submit */}
                                <div className="pt-1">
                                    <button
                                        type="submit"
                                        disabled={status === "loading"}
                                        className="group inline-flex items-center gap-2.5 rounded-lg bg-[#3D46FB] px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#4f58fc] hover:shadow-[0_12px_35px_rgba(61,70,251,0.38)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
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

                    {/* ── RIGHT: Info panel ── */}
                    <div className="lg:sticky lg:top-28 lg:self-start">
                        <div className="relative overflow-hidden rounded-2xl border border-white/6 bg-white/2.5 p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                            {/* Accent glow */}
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#3D46FB] opacity-[0.08] blur-[80px]"
                            />

                            <p className="mb-8 text-base font-semibold leading-snug text-white">
                                Fast responses,<br />real support.
                            </p>

                            <div className="flex flex-col gap-6">
                                {facts.map(({ Icon, label, value }) => (
                                    <div key={label} className="flex items-center gap-4">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/6 bg-white/4">
                                            <Icon className="h-4 w-4 text-[#3D46FB]" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">{value}</p>
                                            <p className="text-xs text-zinc-500">{label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 border-t border-white/6 pt-6">
                                <p className="text-xs leading-relaxed text-zinc-600">
                                    {t("contact.infoPrivacy")}
                                </p>
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

    const col1 = [
        { label: t("footer.col1Faq"), href: "#" },
        { label: t("footer.col1Clubs"), href: "/clubs" },
        { label: t("footer.col1Events"), href: "#" },
        { label: t("footer.col1Players"), href: "#" },
        { label: t("footer.col1Rankings"), href: "#" },
    ];
    const col2 = [
        { label: t("footer.col2Book"), href: "/bookings" },
        { label: t("footer.col2HowItWorks"), href: "#" },
        { label: t("footer.col2Pricing"), href: "#" },
        { label: t("footer.col2App"), href: "#" },
    ];
    const col3 = [
        { label: t("footer.col3About"), href: "#" },
        { label: t("footer.col3Blog"), href: "#" },
        { label: t("footer.col3Careers"), href: "#" },
        { label: t("footer.col3Partners"), href: "#" },
        { label: t("footer.col3Press"), href: "#" },
    ];

    return (
        <footer className="border-t border-white/6 bg-[#080910]">
            <div className="mx-auto max-w-7xl px-4 py-16">
                <div className="grid grid-cols-1 gap-16 md:grid-cols-[auto_1fr]">

                    {/* ── LEFT: Brand + social + legal ── */}
                    <div className="flex flex-col gap-8">
                        {/* Brand */}
                        <div>
                            <span className="text-xl font-bold tracking-tight text-white">Kora</span>
                            <p className="mt-2 max-w-[26ch] text-xs leading-relaxed text-zinc-500">
                                {t("footer.tagline")}
                            </p>
                        </div>

                        {/* Social icons (inline SVG for brand mark accuracy) */}
                        <div className="flex items-center gap-3">
                            <a
                                href="#"
                                aria-label="Facebook"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/6 bg-white/4 text-zinc-400 transition-all duration-200 hover:border-[#3D46FB]/30 hover:bg-[#3D46FB]/10 hover:text-white"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                            <a
                                href="#"
                                aria-label="Instagram"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/6 bg-white/4 text-zinc-400 transition-all duration-200 hover:border-[#3D46FB]/30 hover:bg-[#3D46FB]/10 hover:text-white"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                            <a
                                href="#"
                                aria-label="X (Twitter)"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/6 bg-white/4 text-zinc-400 transition-all duration-200 hover:border-[#3D46FB]/30 hover:bg-[#3D46FB]/10 hover:text-white"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                        </div>

                        {/* Legal links */}
                        <div className="flex flex-wrap items-center gap-5">
                            <a href="#" className="text-xs text-zinc-500 transition-colors duration-200 hover:text-white">
                                {t("footer.privacy")}
                            </a>
                            <a href="#" className="text-xs text-zinc-500 transition-colors duration-200 hover:text-white">
                                {t("footer.terms")}
                            </a>
                        </div>
                    </div>

                    {/* ── RIGHT: Site map ── */}
                    <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:justify-items-end">
                        {/* Discover */}
                        <div>
                            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                                {t("footer.col1Title")}
                            </p>
                            <ul className="flex flex-col gap-3">
                                {col1.map(({ label, href }) => (
                                    <li key={label}>
                                        <a href={href} className="text-xs text-zinc-400 transition-colors duration-200 hover:text-white">
                                            {label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Product */}
                        <div>
                            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                                {t("footer.col2Title")}
                            </p>
                            <ul className="flex flex-col gap-3">
                                {col2.map(({ label, href }) => (
                                    <li key={label}>
                                        <a href={href} className="text-xs text-zinc-400 transition-colors duration-200 hover:text-white">
                                            {label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                                {t("footer.col3Title")}
                            </p>
                            <ul className="flex flex-col gap-3">
                                {col3.map(({ label, href }) => (
                                    <li key={label}>
                                        <a href={href} className="text-xs text-zinc-400 transition-colors duration-200 hover:text-white">
                                            {label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Copyright bar ── */}
            <div className="border-t border-white/6">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
                    <p className="text-xs text-zinc-600">{t("footer.copyright")}</p>
                    <div className="flex items-center gap-2">
                        <span
                            aria-hidden="true"
                            className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                            style={{ animation: "kora-pulse 2.5s ease-in-out infinite" }}
                        />
                        <span className="text-xs text-zinc-600">{t("footer.statusLabel")}</span>
                    </div>
                </div>
            </div>
        </footer>
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
            `}</style>

            <HeroSection />
            <StatsSection />
            <BrazilSection />
            <ClubsCarouselSection />
            <BenefitsSection />
            <FindPlayersSection />
            <AccessibilitySection />
            <HowItWorksSection />
            <CtaSection />
            <ContactSection />
            <FooterSection />
        </>
    );
}
