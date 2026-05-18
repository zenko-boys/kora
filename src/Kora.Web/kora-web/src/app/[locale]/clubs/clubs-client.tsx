"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Pencil, ChevronRight, Building2, X, Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { createApiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { CreateClubRequest, MyClubSummary } from "@/lib/types";

const SLOT_DURATIONS = [15, 20, 30, 60] as const;

const ROLE_COLORS: Record<string, string> = {
    Admin: "bg-[#3D46FB]/20 text-[#818cf8] border-[#3D46FB]/30",
    Owner: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    Manager: "bg-sky-500/20 text-sky-400 border-sky-500/30",
};

function inputCls(extra?: string) {
    return `w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#3D46FB]/50 ${extra ?? ""}`;
}

// ---- Create Club Form ----

interface CreateClubFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

function CreateClubForm({ onSuccess, onCancel }: CreateClubFormProps) {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    const t = useTranslations("clubs");
    const api = createApiClient(async () => getToken({ template: "dev" }));

    const [name, setName] = useState("");
    const [timeZoneId, setTimeZoneId] = useState("America/Sao_Paulo");
    const [slotCell, setSlotCell] = useState<15 | 20 | 30 | 60>(60);
    const [minBooking, setMinBooking] = useState(60);

    const mutation = useMutation({
        mutationFn: () => {
            const body: CreateClubRequest = {
                name,
                timeZoneId,
                slotCellDurationMinutes: slotCell,
                minimumBookingDurationMinutes: minBooking,
                operatingHours: [],
            };
            return api.createClub(body);
        },
        onSuccess: () => {
            toast.success(t("toast.created"));
            queryClient.invalidateQueries({ queryKey: ["my-clubs"] });
            onSuccess();
        },
        onError: (err: Error) => {
            toast.error(t("toast.createFailed"), { description: err.message });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (minBooking % slotCell !== 0) {
            toast.error(t("toast.minimumMultiple"));
            return;
        }
        mutation.mutate();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-[#3D46FB]/30 bg-[#3D46FB]/5 p-5">
            <h3 className="text-sm font-semibold text-foreground">{t("form.title")}</h3>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">{t("form.name")} *</label>
                    <input
                        required
                        maxLength={120}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t("form.namePlaceholder")}
                        className={inputCls()}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">{t("form.timezone")} *</label>
                    <input
                        required
                        maxLength={60}
                        value={timeZoneId}
                        onChange={(e) => setTimeZoneId(e.target.value)}
                        placeholder={t("form.timezonePlaceholder")}
                        className={inputCls()}
                    />
                    <p className="text-[10px] text-muted-foreground/60">{t("form.timezoneHint")}</p>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">{t("form.slotCellDuration")}</label>
                    <select
                        value={slotCell}
                        onChange={(e) => setSlotCell(Number(e.target.value) as 15 | 30 | 60)}
                        className={inputCls()}
                    >
                        {SLOT_DURATIONS.map((d) => (
                            <option key={d} value={d}>{t("form.slotDurationMinutes", { duration: d })}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">{t("form.minimumBookingDuration")}</label>
                    <input
                        type="number"
                        required
                        min={slotCell}
                        step={slotCell}
                        value={minBooking}
                        onChange={(e) => setMinBooking(Number(e.target.value))}
                        className={inputCls()}
                    />
                    <p className="text-[10px] text-muted-foreground/60">{t("form.minimumBookingHint", { slotCell })}</p>
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={mutation.isPending}>
                    <X className="h-3.5 w-3.5" />
                    {t("form.cancel")}
                </Button>
                <Button
                    type="submit"
                    size="sm"
                    disabled={mutation.isPending}
                    className="bg-[#3D46FB] text-white hover:bg-[#3D46FB]/90"
                >
                    <Check className="h-3.5 w-3.5" />
                    {mutation.isPending ? t("form.creating") : t("form.create")}
                </Button>
            </div>
        </form>
    );
}

// ---- Edit Club Form ----

interface EditClubFormProps {
    club: MyClubSummary;
    onSuccess: () => void;
    onCancel: () => void;
}

function EditClubForm({ club, onSuccess, onCancel }: EditClubFormProps) {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    const t = useTranslations("clubs");
    const api = createApiClient(async () => getToken({ template: "dev" }));
    const [name, setName] = useState(club.name);

    const mutation = useMutation({
        mutationFn: () =>
            api.updateClub(club.clubId, { name, operatingHours: [] }),
        onSuccess: () => {
            toast.success(t("toast.updated"));
            queryClient.invalidateQueries({ queryKey: ["my-clubs"] });
            onSuccess();
        },
        onError: (err: Error) => {
            toast.error(t("toast.updateFailed"), { description: err.message });
        },
    });

    return (
        <form
            onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
            className="mt-3 flex items-end gap-2"
        >
            <div className="flex-1 space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{t("editForm.clubName")}</label>
                <input
                    required
                    maxLength={120}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputCls()}
                />
            </div>
            <Button
                type="submit"
                size="sm"
                disabled={mutation.isPending}
                className="bg-[#3D46FB] text-white hover:bg-[#3D46FB]/90"
            >
                {mutation.isPending ? t("editForm.saving") : t("editForm.save")}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                <X className="h-3.5 w-3.5" />
            </Button>
        </form>
    );
}

// ---- Club Card ----

interface ClubCardProps {
    club: MyClubSummary;
}

function ClubCard({ club }: ClubCardProps) {
    const [editing, setEditing] = useState(false);
    const t = useTranslations("clubs");

    return (
        <Card className="flex flex-col border-border transition-all hover:shadow-md">
            <CardHeader className="px-5 pb-3 pt-5">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-foreground">{club.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{club.timeZoneId}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <Badge
                            variant="outline"
                            className={`border text-[10px] font-semibold uppercase tracking-wider ${ROLE_COLORS[club.role] ?? "bg-muted text-muted-foreground border-border"}`}
                        >
                            {club.role}
                        </Badge>
                        <button
                            onClick={() => setEditing((v) => !v)}
                            className="rounded p-1 text-muted-foreground/50 transition-colors hover:text-foreground"
                            aria-label={t("editClub")}
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                {editing && (
                    <EditClubForm
                        club={club}
                        onSuccess={() => setEditing(false)}
                        onCancel={() => setEditing(false)}
                    />
                )}
            </CardHeader>

            <CardContent className="px-5 pb-5">
                <Link
                    href={`/clubs/${club.clubId}/courts`}
                    className="inline-flex w-full items-center justify-between rounded-md border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-[#3D46FB]/40 hover:bg-[#3D46FB]/5 hover:text-foreground"
                >
                    <span>{t("manageCourts")}</span>
                    <ChevronRight className="h-4 w-4" />
                </Link>
            </CardContent>
        </Card>
    );
}

// ---- Main Component ----

export function ClubsClient() {
    const { getToken } = useAuth();
    const t = useTranslations("clubs");
    const api = createApiClient(async () => getToken({ template: "dev" }));
    const [showCreate, setShowCreate] = useState(false);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["my-clubs"],
        queryFn: () => api.getMyClubs(),
    });

    const clubs = data?.clubs ?? [];

    return (
        <div className="space-y-6">
            {/* Action bar */}
            <div className="flex items-center justify-between">
                {!isLoading && !isError && (
                    <p className="text-sm text-muted-foreground">
                        {t("clubsCount", { count: clubs.length })}
                    </p>
                )}
                {!showCreate && (
                    <Button
                        size="sm"
                        onClick={() => setShowCreate(true)}
                        className="ml-auto bg-[#3D46FB] text-white hover:bg-[#3D46FB]/90"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        {t("newClub")}
                    </Button>
                )}
            </div>

            {/* Create form */}
            {showCreate && (
                <CreateClubForm
                    onSuccess={() => setShowCreate(false)}
                    onCancel={() => setShowCreate(false)}
                />
            )}

            {/* List */}
            {isLoading ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="p-5 space-y-3">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                            <Skeleton className="h-10 w-full" />
                        </Card>
                    ))}
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 py-16 text-center">
                    <p className="text-sm font-medium text-destructive">{t("failedToLoad")}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{t("checkConnection")}</p>
                </div>
            ) : clubs.length === 0 && !showCreate ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-border py-20 text-center">
                    <Building2 className="mb-4 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm font-medium text-muted-foreground">{t("noClubsEmpty")}</p>
                    <p className="mt-1 text-xs text-muted-foreground/60">{t("createFirstClub")}</p>
                </div>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {clubs.map((club) => (
                        <ClubCard key={club.clubId} club={club} />
                    ))}
                </div>
            )}
        </div>
    );
}
