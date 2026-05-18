"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { Pencil, Plus, Check, X, MapPin } from "lucide-react";
import { toast } from "sonner";
import { createApiClient } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { CourtSummary, MyClubSummary } from "@/lib/types";

interface Props {
    clubId: string;
}

export function ManageClubClient({ clubId }: Props) {
    const { getToken } = useAuth();
    const t = useTranslations("manage");
    const qc = useQueryClient();
    const api = createApiClient(async (opts) => getToken(opts));

    // ── Club info ──────────────────────────────────────────────────────────
    const { data: clubsData, isLoading: clubsLoading } = useQuery({
        queryKey: ["my-clubs"],
        queryFn: () => api.getMyClubs(),
    });
    const club: MyClubSummary | undefined = clubsData?.clubs.find(
        (c) => c.clubId === clubId
    );

    const [editingName, setEditingName] = useState(false);
    const [clubName, setClubName] = useState("");

    const updateClubMutation = useMutation({
        mutationFn: (name: string) =>
            api.updateClub(clubId, { name, operatingHours: [] }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["my-clubs"] });
            toast.success(t("clubDetail.toast.clubUpdated"));
            setEditingName(false);
        },
        onError: () => {
            toast.error(t("clubDetail.toast.clubUpdateFailed"));
        },
    });

    // ── Courts ─────────────────────────────────────────────────────────────
    const { data: courtsData, isLoading: courtsLoading } = useQuery({
        queryKey: ["courts", clubId],
        queryFn: () => api.getCourts(clubId),
    });
    const courts: CourtSummary[] = courtsData?.courts ?? [];

    const [addingCourt, setAddingCourt] = useState(false);
    const [newCourtName, setNewCourtName] = useState("");
    const [editingCourtId, setEditingCourtId] = useState<string | null>(null);
    const [editingCourtName, setEditingCourtName] = useState("");

    const createCourtMutation = useMutation({
        mutationFn: (name: string) => api.createCourt(clubId, { name }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["courts", clubId] });
            qc.invalidateQueries({ queryKey: ["my-clubs"] });
            toast.success(t("clubDetail.toast.courtCreated"));
            setNewCourtName("");
            setAddingCourt(false);
        },
        onError: () => toast.error(t("clubDetail.toast.courtCreateFailed")),
    });

    const updateCourtMutation = useMutation({
        mutationFn: ({ courtId, name }: { courtId: string; name: string }) =>
            api.updateCourt(clubId, courtId, { name }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["courts", clubId] });
            toast.success(t("clubDetail.toast.courtUpdated"));
            setEditingCourtId(null);
        },
        onError: () => toast.error(t("clubDetail.toast.courtUpdateFailed")),
    });

    if (clubsLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-40 w-full rounded-xl" />
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Club name */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {club?.name ?? "—"}
                </h1>
                <p className="mt-0.5 text-sm text-muted-foreground">{club?.timeZoneId}</p>
            </div>

            {/* Club settings card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">{t("clubDetail.settings")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3">
                        {editingName ? (
                            <>
                                <input
                                    className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#3D46FB]/50"
                                    value={clubName}
                                    onChange={(e) => setClubName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") updateClubMutation.mutate(clubName);
                                        if (e.key === "Escape") setEditingName(false);
                                    }}
                                    autoFocus
                                />
                                <Button
                                    size="sm"
                                    onClick={() => updateClubMutation.mutate(clubName)}
                                    disabled={updateClubMutation.isPending || !clubName.trim()}
                                >
                                    <Check className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingName(false)}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </>
                        ) : (
                            <>
                                <span className="flex-1 text-sm text-foreground">{club?.name}</span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setClubName(club?.name ?? "");
                                        setEditingName(true);
                                    }}
                                >
                                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                    {t("clubDetail.save")}
                                </Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Courts card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">{t("clubDetail.courts")}</CardTitle>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAddingCourt(true)}
                    >
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        {t("clubDetail.newCourt")}
                    </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                    {courtsLoading && (
                        <div className="space-y-2">
                            {[1, 2].map((i) => (
                                <Skeleton key={i} className="h-10 w-full rounded-md" />
                            ))}
                        </div>
                    )}

                    {!courtsLoading && courts.length === 0 && !addingCourt && (
                        <div className="flex flex-col items-center gap-2 py-8 text-center">
                            <MapPin className="h-8 w-8 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground">
                                {t("clubDetail.courtsSubtitle")}
                            </p>
                        </div>
                    )}

                    {courts.map((court) => (
                        <div
                            key={court.id}
                            className="flex items-center gap-3 rounded-md border border-border px-3 py-2"
                        >
                            {editingCourtId === court.id ? (
                                <>
                                    <input
                                        className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#3D46FB]/50"
                                        value={editingCourtName}
                                        onChange={(e) => setEditingCourtName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter")
                                                updateCourtMutation.mutate({
                                                    courtId: court.id,
                                                    name: editingCourtName,
                                                });
                                            if (e.key === "Escape") setEditingCourtId(null);
                                        }}
                                        autoFocus
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            updateCourtMutation.mutate({
                                                courtId: court.id,
                                                name: editingCourtName,
                                            })
                                        }
                                        disabled={
                                            updateCourtMutation.isPending || !editingCourtName.trim()
                                        }
                                    >
                                        <Check className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setEditingCourtId(null)}
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                    <span className="flex-1 text-sm text-foreground">
                                        {court.name}
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            setEditingCourtId(court.id);
                                            setEditingCourtName(court.name);
                                        }}
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                </>
                            )}
                        </div>
                    ))}

                    {/* Add court inline form */}
                    {addingCourt && (
                        <div className="flex items-center gap-3 rounded-md border border-[#3D46FB]/40 px-3 py-2">
                            <input
                                className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#3D46FB]/50"
                                placeholder={t("clubDetail.courtNamePlaceholder")}
                                value={newCourtName}
                                onChange={(e) => setNewCourtName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") createCourtMutation.mutate(newCourtName);
                                    if (e.key === "Escape") {
                                        setAddingCourt(false);
                                        setNewCourtName("");
                                    }
                                }}
                                autoFocus
                            />
                            <Button
                                size="sm"
                                onClick={() => createCourtMutation.mutate(newCourtName)}
                                disabled={createCourtMutation.isPending || !newCourtName.trim()}
                            >
                                <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    setAddingCourt(false);
                                    setNewCourtName("");
                                }}
                            >
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
