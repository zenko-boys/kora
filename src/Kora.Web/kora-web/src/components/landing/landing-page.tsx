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
import { Link } from "@/i18n/navigation";

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
                            Plataforma de booking de padel
                        </span>
                    </div>

                    <h1 className="text-[clamp(2.8rem,6vw,5rem)] font-bold leading-[1.04] tracking-tighter text-white">
                        O esporte que está
                        <br />
                        <span className="text-[#818cf8]">dominando</span>
                        <br />o Brasil.
                    </h1>

                    <p className="max-w-[48ch] text-base leading-relaxed text-zinc-400">
                        Reserve quadras, encontre jogadores compatíveis e descubra clubes em
                        todo o país — direto do seu celular.
                    </p>

                    <div className="flex flex-wrap items-center gap-4">
                        <Link
                            href="/bookings"
                            className="group inline-flex items-center gap-2.5 rounded-lg bg-[#3D46FB] px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-[2px] hover:bg-[#4f58fc] hover:shadow-[0_12px_35px_rgba(61,70,251,0.38)] active:scale-[0.98]"
                        >
                            Começar agora
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </Link>
                        <Link
                            href="/clubs"
                            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-7 py-3.5 text-sm font-semibold text-white/70 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white active:scale-[0.98]"
                        >
                            Ver clubes
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
                            +2.800 partidas reservadas este mês
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
                                    <p className="text-[11px] text-zinc-500">Próxima vaga disponível</p>
                                    <p className="mt-0.5 text-sm font-medium text-white">
                                        Arena Kora · Quadra 3
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[11px] text-zinc-500">hoje</p>
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
                                <span className="text-xs text-zinc-500">3 de 4 · 1 vaga restante</span>
                                <span className="ml-auto cursor-pointer text-xs font-semibold text-[#3D46FB] transition-colors hover:text-[#818cf8]">
                                    Entrar
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
    const [ref, visible] = useReveal();

    const stats = [
        { value: "47,2k", label: "jogadores ativos" },
        { value: "+312", label: "quadras cadastradas" },
        { value: "8", label: "estados cobertos" },
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
    const [ref, visible] = useReveal();

    const facts = [
        { icon: Globe, text: "2º esporte de raquete mais praticado no mundo" },
        { icon: TrendingUp, text: "Mais de 800 novos clubes abertos nos últimos 2 anos" },
        { icon: Users, text: "67% dos praticantes têm entre 18 e 40 anos" },
        { icon: MapPin, text: "Presente em todos os 26 estados brasileiros" },
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
                                +340% em 3 anos
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
                                Expansão no Brasil
                            </span>
                        </div>

                        <h2 className="text-4xl font-bold leading-[1.1] tracking-tighter text-white lg:text-5xl">
                            O padel cresce 5x mais rápido que qualquer outro esporte no país.
                        </h2>

                        <p className="text-base leading-relaxed text-zinc-400">
                            Com mais de 2 milhões de praticantes e crescimento acelerado em São
                            Paulo, Rio de Janeiro, Brasília e Curitiba, o padel se consolidou como
                            o esporte de mais rápida ascensão do Brasil.
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
    const [ref, visible] = useReveal();

    const benefits = [
        {
            icon: Heart,
            title: "Saúde cardiovascular",
            description:
                "45 minutos de padel equivalem a 8 km de corrida em impacto cardiovascular, com menor sobrecarga nas articulações.",
            wide: true,
        },
        {
            icon: Users,
            title: "Conexão social",
            description:
                "Sempre jogado em duplas. Cada partida é uma oportunidade real de conhecer pessoas novas.",
            wide: false,
        },
        {
            icon: Brain,
            title: "Raciocínio estratégico",
            description:
                "Um jogo de leitura espacial, antecipação e decisões rápidas sob pressão.",
            wide: false,
        },
        {
            icon: Trophy,
            title: "Para todos os níveis",
            description:
                "Do iniciante ao competidor regional, o padel se adapta ao seu ritmo. A curva de aprendizado é a mais curta entre os esportes de raquete.",
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
                            Por que padel
                        </span>
                    </div>
                    <h2 className="text-4xl font-bold leading-[1.1] tracking-tighter text-white lg:text-5xl">
                        Um esporte que transforma dentro e fora da quadra.
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
    const [ref, visible] = useReveal();

    const players = [
        {
            seed: 73,
            name: "Fernanda Queiroz",
            level: "Avançado",
            city: "São Paulo",
            games: "84 partidas",
        },
        {
            seed: 22,
            name: "Matheus Lira",
            level: "Intermediário",
            city: "Curitiba",
            games: "41 partidas",
        },
        {
            seed: 55,
            name: "Renata Vidal",
            level: "Iniciante",
            city: "Rio de Janeiro",
            games: "12 partidas",
        },
    ];

    const features = [
        "Filtro por nível: iniciante, intermediário e avançado",
        "Histórico de partidas e avaliações entre jogadores",
        "Notificações de vagas abertas perto de você",
        "Grupos e campeonatos organizados pelos clubes",
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
                                Comunidade Kora
                            </span>
                        </div>

                        <h2 className="text-4xl font-bold leading-[1.1] tracking-tighter text-white lg:text-5xl">
                            Nunca fique sem parceiro de jogo.
                        </h2>

                        <p className="text-base leading-relaxed text-zinc-400">
                            O Kora conecta jogadores pelo nível técnico, localização e
                            disponibilidade. Monte sua dupla ideal ou entre em uma partida já
                            formada.
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
                            Explorar partidas abertas
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
                            <span>+2.400 jogadores disponíveis hoje</span>
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
    const [ref, visible] = useReveal();

    const features = [
        {
            icon: Globe,
            title: "Qualquer lugar",
            text: "Disponível em todo o Brasil, com novos clubes parceiros adicionados semanalmente.",
        },
        {
            icon: Users,
            title: "Qualquer nível",
            text: "Do primeiro jogo da vida ao torneio regional — todas as pessoas são bem-vindas.",
        },
        {
            icon: Shield,
            title: "Reservas seguras",
            text: "Pagamento protegido e cancelamento gratuito até 2 horas antes da partida.",
        },
        {
            icon: Zap,
            title: "Reserve em 30 s",
            text: "Escolha quadra, horário e confirme. Sem filas, sem ligações, sem complicação.",
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
                            Feito para todos
                        </span>
                        <span aria-hidden="true" className="h-px w-8 bg-[#3D46FB]" />
                    </div>
                    <h2 className="text-4xl font-bold leading-[1.1] tracking-tighter text-white lg:text-5xl">
                        Acessível de verdade.
                    </h2>
                    <p className="mx-auto mt-4 max-w-[52ch] text-base text-zinc-400">
                        Nenhuma barreira — técnica, geográfica ou financeira — deve impedir
                        alguém de jogar padel.
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
    const [ref, visible] = useReveal();

    const steps = [
        {
            n: "01",
            title: "Crie sua conta",
            text: "Cadastro rápido com Google, Apple ou e-mail. Sem formulários longos, sem burocracia.",
        },
        {
            n: "02",
            title: "Escolha sua quadra",
            text: "Filtre por cidade, clube, horário e tipo de partida. Veja vagas em tempo real.",
        },
        {
            n: "03",
            title: "Jogue e conecte",
            text: "Confirme, pague e apareça na quadra. Convide parceiros ou entre em uma partida aberta.",
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
                            Como funciona
                        </span>
                    </div>
                    <h2 className="text-4xl font-bold leading-[1.1] tracking-tighter text-white lg:text-5xl">
                        Da ideia à quadra em 3 passos.
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
                        Pronto para jogar?
                    </h2>
                    <p className="mx-auto mt-4 max-w-[46ch] text-base text-white/65">
                        Junte-se a milhares de jogadores que já reservam, conectam e jogam
                        pelo Kora.
                    </p>

                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        <Link
                            href="/bookings"
                            className="inline-flex items-center gap-2.5 rounded-lg bg-white px-8 py-4 text-sm font-bold text-[#3D46FB] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_16px_40px_rgba(0,0,0,0.3)] active:scale-[0.98]"
                        >
                            Reservar agora
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/clubs"
                            className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/[0.1] px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.18] active:scale-[0.98]"
                        >
                            Explorar clubes
                        </Link>
                    </div>
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
            `}</style>

            <HeroSection />
            <StatsSection />
            <BrazilSection />
            <BenefitsSection />
            <FindPlayersSection />
            <AccessibilitySection />
            <HowItWorksSection />
            <CtaSection />
        </>
    );
}
