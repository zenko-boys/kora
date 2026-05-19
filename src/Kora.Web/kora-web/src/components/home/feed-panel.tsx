"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { Newspaper } from "lucide-react";
import { createApiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { FeedCard, FeedCardSkeleton } from "./feed-card";

export function FeedPanel() {
    const { getToken } = useAuth();
    const api = createApiClient(async (opts) => getToken(opts));

    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["feed"],
        queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
            api.getFeed(pageParam),
        getNextPageParam: (last) => last.nextCursor ?? undefined,
        initialPageParam: undefined as string | undefined,
    });

    const items = data?.pages.flatMap((p) => p.items) ?? [];

    if (isLoading) {
        return (
            <div className="space-y-4">
                <FeedCardSkeleton />
                <FeedCardSkeleton />
                <FeedCardSkeleton />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
                <Newspaper className="h-10 w-10 opacity-40" />
                <p className="text-sm">Nenhuma novidade por enquanto.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {items.map((item) => (
                <FeedCard key={item.id} item={item} />
            ))}

            {hasNextPage && (
                <div className="flex justify-center pt-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                    >
                        {isFetchingNextPage ? "Carregando..." : "Carregar mais"}
                    </Button>
                </div>
            )}
        </div>
    );
}
