"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { Plus, Pencil, ArrowLeft, LayoutGrid, X, Check } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { createApiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CourtSummary } from "@/lib/types";

function inputCls(extra?: string) {
    return `w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#3D46FB]/50 ${extra ?? ""}`;
}

// ---- Create Court Form ----

interface CreateCourtFormProps {
    clubId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

function CreateCourtForm({ clubId, onSuccess, onCancel }: CreateCourtFormProps) {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    const api = createApiClient(async () => getToken({ template: "dev" }));
    const [name, setName] = useState("");

    const mutation = useMutation({
        mutationFn: () => api.createCourt(clubId, { name }),
        onSuccess: () => {
            toast.success("Court created!");
            queryClient.invalidateQueries({ queryKey: ["courts", clubId] });
            onSuccess();
        },
        onError: (err: Error) => {
            toast.error("Could not create court", { description: err.message });
        },
    });

    return (
        <form
            onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
            className="space-y-4 rounded-xl border border-[#3D46FB]/30 bg-[#3D46FB]/5 p-5"
        >
            <h3 className="text-sm font-semibold text-foreground">New Court</h3>
            <div className="flex items-end gap-2">
                <div className="flex-1 space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Name *</label>
                    <input
                        required
                        maxLength={80}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Court 1"
                        className={inputCls()}
                    />
                </div>
                <Button
                    type="submit"
                    size="sm"
                    disabled={mutation.isPending}
                    className="bg-[#3D46FB] text-white hover:bg-[#3D46FB]/90"
                >
                    <Check className="h-3.5 w-3.5" />
                    {mutation.isPending ? "Creating…" : "Create"}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={mutation.isPending}>
                    <X className="h-3.5 w-3.5" />
                </Button>
            </div>
        </form>
    );
}

// ---- Court Row ----

interface CourtRowProps {
    court: CourtSummary;
    clubId: string;
}

function CourtRow({ court, clubId }: CourtRowProps) {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    const api = createApiClient(async () => getToken({ template: "dev" }));
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(court.name);

    const mutation = useMutation({
        mutationFn: () => api.updateCourt(clubId, court.id, { name }),
        onSuccess: () => {
            toast.success("Court updated!");
            queryClient.invalidateQueries({ queryKey: ["courts", clubId] });
            setEditing(false);
        },
        onError: (err: Error) => {
            toast.error("Could not update court", { description: err.message });
        },
    });

    return (
        <Card className="border-border transition-all hover:shadow-sm">
            <CardContent className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#3D46FB]/10 text-[#818cf8]">
                    <LayoutGrid className="h-4 w-4" />
                </div>

                {editing ? (
                    <form
                        onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
                        className="flex flex-1 items-center gap-2"
                    >
                        <input
                            required
                            maxLength={80}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={inputCls("flex-1")}
                            autoFocus
                        />
                        <Button
                            type="submit"
                            size="sm"
                            disabled={mutation.isPending}
                            className="bg-[#3D46FB] text-white hover:bg-[#3D46FB]/90"
                        >
                            {mutation.isPending ? "Saving…" : "Save"}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => { setEditing(false); setName(court.name); }}
                        >
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    </form>
                ) : (
                    <>
                        <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{court.name}</p>
                            <p className="text-xs text-muted-foreground">
                                Added {format(parseISO(court.createdAt), "MMM d, yyyy")}
                            </p>
                        </div>
                        <button
                            onClick={() => setEditing(true)}
                            className="shrink-0 rounded p-1.5 text-muted-foreground/50 transition-colors hover:text-foreground"
                            aria-label="Edit court"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

// ---- Main Component ----

interface CourtsClientProps {
    clubId: string;
}

export function CourtsClient({ clubId }: CourtsClientProps) {
    const { getToken } = useAuth();
    const api = createApiClient(async () => getToken({ template: "dev" }));
    const [showCreate, setShowCreate] = useState(false);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["courts", clubId],
        queryFn: () => api.getCourts(clubId),
    });

    const courts = data?.courts ?? [];

    return (
        <div className="space-y-6">
            {/* Back + action bar */}
            <div className="flex items-center justify-between">
                <Link
                    href="/clubs"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Clubs
                </Link>

                {!showCreate && (
                    <Button
                        size="sm"
                        onClick={() => setShowCreate(true)}
                        className="bg-[#3D46FB] text-white hover:bg-[#3D46FB]/90"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        New Court
                    </Button>
                )}
            </div>

            {/* Create form */}
            {showCreate && (
                <CreateCourtForm
                    clubId={clubId}
                    onSuccess={() => setShowCreate(false)}
                    onCancel={() => setShowCreate(false)}
                />
            )}

            {/* Count */}
            {!isLoading && !isError && (
                <p className="text-sm text-muted-foreground">
                    {courts.length === 0
                        ? "No courts yet"
                        : `${courts.length} court${courts.length !== 1 ? "s" : ""}`}
                </p>
            )}

            {/* List */}
            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="px-5 py-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-2/5" />
                                    <Skeleton className="h-3 w-1/4" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 py-16 text-center">
                    <p className="text-sm font-medium text-destructive">Failed to load courts</p>
                    <p className="mt-1 text-xs text-muted-foreground">Check your connection and try again.</p>
                </div>
            ) : courts.length === 0 && !showCreate ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-border py-16 text-center">
                    <LayoutGrid className="mb-4 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm font-medium text-muted-foreground">No courts yet</p>
                    <p className="mt-1 text-xs text-muted-foreground/60">Add your first court to this club.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {courts.map((court) => (
                        <CourtRow key={court.id} court={court} clubId={clubId} />
                    ))}
                </div>
            )}
        </div>
    );
}
