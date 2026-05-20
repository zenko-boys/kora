import moment from "moment-timezone";
import { ptBR } from "date-fns/locale";
import { Star, Trophy, CalendarDays, ArrowRight } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useLocale } from "next-intl";
import Link from "next/link";
import type { PlayerStats, UpcomingGame } from "@/lib/types";

const RANK_COLORS: Record<string, string> = {
    Unranked: "text-slate-400 bg-slate-400/10",
    Bronze: "text-amber-600 bg-amber-600/10",
    Silver: "text-slate-400 bg-slate-400/10",
    Gold: "text-yellow-400 bg-yellow-400/10",
    Platinum: "text-cyan-400 bg-cyan-400/10",
    Diamond: "text-violet-400 bg-violet-400/10",
};

const RANK_NEXT: Record<string, string> = {
    Unranked: "Bronze",
    Bronze: "Silver",
    Silver: "Gold",
    Gold: "Platinum",
    Platinum: "Diamond",
    Diamond: "Diamond",
};

function StarRating({ rating }: { rating: number }) {
    const full = Math.floor(rating);
    const empty = 5 - full;
    return (
        <span className="flex items-center gap-0.5">
            {Array.from({ length: full }, (_, i) => (
                <Star key={`f${i}`} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            ))}
            {Array.from({ length: empty }, (_, i) => (
                <Star key={`e${i}`} className="h-3.5 w-3.5 text-muted-foreground" />
            ))}
            <span className="ml-1 text-xs text-muted-foreground">{rating.toFixed(1)}</span>
        </span>
    );
}

interface PlayerSidebarProps {
    stats: PlayerStats;
    upcomingGames: UpcomingGame[];
    isLoading?: boolean;
}

export function PlayerSidebar({ stats, upcomingGames }: PlayerSidebarProps) {
    const { user } = useUser();
    const locale = useLocale();
    const rankColor = RANK_COLORS[stats.rank] ?? RANK_COLORS.Unranked;
    const progressPct = Math.min(100, Math.round((stats.rankPoints / stats.rankPointsToNext) * 100));

    return (
        <div className="space-y-5 rounded-xl border border-border bg-card p-5">

            {/* Avatar + Name */}
            <div className="flex items-center gap-3">
                {user?.imageUrl ? (
                    <img
                        src={user.imageUrl}
                        alt={user.fullName ?? "Avatar"}
                        className="h-14 w-14 rounded-full object-cover ring-2 ring-[#93C5FD]/30"
                    />
                ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-xl font-bold text-muted-foreground ring-2 ring-[#93C5FD]/30">
                        {user?.firstName?.[0] ?? "?"}
                    </div>
                )}
                <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">
                        {user?.fullName ?? "Jogador"}
                    </p>
                    {user?.username && (
                        <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
                    )}
                </div>
            </div>

            {/* Rank + Progress */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Rank</span>
                    <span className={["rounded-full px-2 py-0.5 text-xs font-semibold", rankColor].join(" ")}>
                        {stats.rank}
                    </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                        className="h-full rounded-full bg-[#93C5FD] transition-all"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
                <p className="text-right text-[10px] text-muted-foreground">
                    {stats.rankPoints.toLocaleString()} / {stats.rankPointsToNext.toLocaleString()} pts → {RANK_NEXT[stats.rank]}
                </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
                {[
                    { label: "Jogos", value: stats.gamesPlayed },
                    { label: "Vitórias", value: stats.gamesWon },
                    { label: "Derrotas", value: stats.gamesLost },
                ].map(({ label, value }) => (
                    <div key={label} className="rounded-lg bg-muted/50 py-2">
                        <p className="text-lg font-bold text-foreground">{value}</p>
                        <p className="text-[10px] text-muted-foreground">{label}</p>
                    </div>
                ))}
            </div>

            {/* Rating */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Avaliação</span>
                <StarRating rating={stats.rating} />
            </div>

            {/* Medals */}
            {stats.medals.length > 0 && (
                <div className="space-y-2">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Trophy className="h-3.5 w-3.5" />
                        Medalhas
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {stats.medals.slice(0, 6).map((medal) => (
                            <div
                                key={medal.id}
                                title={`${medal.name} — ${medal.description}`}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-base"
                            >
                                🏅
                            </div>
                        ))}
                        {stats.medals.length > 6 && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                                +{stats.medals.length - 6}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Upcoming Games */}
            <div className="space-y-2">
                <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Próximos Jogos
                </p>
                {upcomingGames.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Nenhum jogo agendado.</p>
                ) : (
                    <div className="space-y-2">
                        {upcomingGames.map((game) => {
                            const start = moment.parseZone(game.startsAt);
                            return (
                                <div
                                    key={game.bookingId}
                                    className="rounded-lg border border-border bg-background px-3 py-2"
                                >
                                    <p className="truncate text-xs font-medium text-foreground">{game.clubName}</p>
                                    <p className="text-[10px] text-muted-foreground">
                                        {game.courtName} &middot;{" "}
                                        {start.locale("pt-BR").format("DD MMM, HH:mm")}
                                    </p>
                                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                                        {game.participantsCount}/{game.capacity} jogadores
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
                <Link
                    href={`/${locale}/bookings`}
                    className="flex items-center gap-1 text-xs text-[#93C5FD] hover:underline"
                >
                    Ver todos os bookings <ArrowRight className="h-3 w-3" />
                </Link>
            </div>
        </div>
    );
}

export function PlayerSidebarSkeleton() {
    return (
        <div className="animate-pulse space-y-5 rounded-xl border border-border bg-card p-5">
            {/* Avatar + name */}
            <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 rounded bg-muted" />
                    <div className="h-3 w-1/3 rounded bg-muted" />
                </div>
            </div>
            {/* Rank */}
            <div className="space-y-2">
                <div className="h-3 w-1/4 rounded bg-muted" />
                <div className="h-1.5 w-full rounded-full bg-muted" />
            </div>
            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((i) => <div key={i} className="h-12 rounded-lg bg-muted" />)}
            </div>
            {/* Rating */}
            <div className="h-3 w-1/2 rounded bg-muted" />
            {/* Medals */}
            <div className="flex gap-2">
                {[0, 1, 2, 3].map((i) => <div key={i} className="h-8 w-8 rounded-full bg-muted" />)}
            </div>
            {/* Upcoming */}
            <div className="space-y-2">
                <div className="h-16 rounded-lg bg-muted" />
                <div className="h-16 rounded-lg bg-muted" />
            </div>
        </div>
    );
}
