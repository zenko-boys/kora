import type { FeedItemType } from "@/lib/types";

const TYPE_STYLES: Record<FeedItemType, string> = {
    championship: "bg-violet-500/10 text-violet-400",
    event: "bg-[#8CC63F]/10 text-[#8CC63F]",
    post: "bg-muted text-muted-foreground",
    photo: "bg-emerald-500/10 text-emerald-400",
    result: "bg-amber-500/10 text-amber-400",
};

const TYPE_LABELS: Record<FeedItemType, string> = {
    championship: "Campeonato",
    event: "Evento",
    post: "Post",
    photo: "Foto",
    result: "Resultado",
};

export function FeedTypeBadge({ type }: { type: FeedItemType }) {
    return (
        <span
            className={[
                "inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                TYPE_STYLES[type],
            ].join(" ")}
        >
            {TYPE_LABELS[type]}
        </span>
    );
}
