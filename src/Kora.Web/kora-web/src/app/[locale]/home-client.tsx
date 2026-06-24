"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createApiClient } from "@/lib/api";
import { MOCK_PLAYER_STATS, MOCK_UPCOMING_GAMES } from "@/lib/mock-data";
import { PlayerSidebar, PlayerSidebarSkeleton } from "@/components/home/player-sidebar";
import { FeedPanel } from "@/components/home/feed-panel";

export function HomeClient({ title }: { title: string }) {
    const { getToken } = useAuth();
    const api = createApiClient(async (opts) => getToken(opts));

    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ["player-stats"],
        queryFn: () => api.getPlayerStats(),
    });

    const { data: upcomingData, isLoading: upcomingLoading } = useQuery({
        queryKey: ["upcoming-games"],
        queryFn: () => api.getUpcomingGames(),
    });

    const isLoading = statsLoading || upcomingLoading;

    // return (
    //     <div className="mx-auto max-w-7xl px-4 py-6">
    //         <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground">{title}</h1>
    //         <div className="flex gap-6">
    //             {/* LEFT SIDEBAR */}
    //             <aside className="hidden w-72 shrink-0 lg:block">
    //                 {isLoading ? (
    //                     <PlayerSidebarSkeleton />
    //                 ) : (
    //                     <PlayerSidebar
    //                         stats={statsData?.stats ?? MOCK_PLAYER_STATS}
    //                         upcomingGames={upcomingData?.games ?? MOCK_UPCOMING_GAMES}
    //                     />
    //                 )}
    //             </aside>

    //             {/* FEED */}
    //             <main className="min-w-0 flex-1">
    //                 <FeedPanel />
    //             </main>
    //         </div>
    //     </div>
    // );

    return null;
}
