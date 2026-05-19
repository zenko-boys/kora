import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { parseISO } from "date-fns";
import { ExternalLink } from "lucide-react";
import type { FeedItem } from "@/lib/types";
import { FeedTypeBadge } from "./feed-type-badge";

const IMAGE_HEIGHT: Record<string, string> = {
    championship: "h-48",
    event: "h-36",
    photo: "h-64",
    post: "",
    result: "",
};

function RelativeTime({ utcString }: { utcString: string }) {
    const date = parseISO(utcString);
    return (
        <time dateTime={utcString} className="text-xs text-muted-foreground">
            {formatDistanceToNow(date, { addSuffix: true, locale: ptBR })}
        </time>
    );
}

export function FeedCard({ item }: { item: FeedItem }) {
    const imgClass = IMAGE_HEIGHT[item.type] ?? "h-48";

    return (
        <article className="overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
            {item.imageUrl && (
                <img
                    src={item.imageUrl}
                    alt={item.title}
                    className={["w-full object-cover", imgClass].join(" ")}
                />
            )}
            <div className="space-y-2 p-4">
                <div className="flex items-center justify-between gap-2">
                    <FeedTypeBadge type={item.type} />
                    <RelativeTime utcString={item.publishedAt} />
                </div>

                <h3 className="font-semibold leading-snug text-foreground">{item.title}</h3>

                {item.body && (
                    <p className="line-clamp-3 text-sm text-muted-foreground">{item.body}</p>
                )}

                <div className="flex items-center justify-between gap-2 pt-1">
                    {item.clubName && (
                        <span className="text-xs text-muted-foreground">{item.clubName}</span>
                    )}
                    <div className="flex flex-wrap gap-1">
                        {item.tags?.map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {item.linkUrl && (
                    <a
                        href={item.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#93C5FD] hover:underline"
                    >
                        Ver mais <ExternalLink className="h-3 w-3" />
                    </a>
                )}
            </div>
        </article>
    );
}

export function FeedCardSkeleton() {
    return (
        <div className="animate-pulse overflow-hidden rounded-xl border border-border bg-card">
            <div className="h-40 bg-muted" />
            <div className="space-y-3 p-4">
                <div className="h-3 w-16 rounded-full bg-muted" />
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="space-y-1.5">
                    <div className="h-3 w-full rounded bg-muted" />
                    <div className="h-3 w-5/6 rounded bg-muted" />
                    <div className="h-3 w-2/3 rounded bg-muted" />
                </div>
            </div>
        </div>
    );
}
