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
        </>
    );
}
