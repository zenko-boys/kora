"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { X, Check } from "lucide-react";
import { createApiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import type { BookingType, CreateBookingRequest } from "@/lib/types";

function inputCls(extra?: string) {
    return `w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#3D46FB]/50 ${extra ?? ""}`;
}

export function CreateBookingForm({ onClose }: { onClose: () => void }) {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    const api = createApiClient(async () => getToken({ template: "dev" }));

    const [clubId, setClubId] = useState("");
    const [type, setType] = useState<BookingType>("Game");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("08:00");
    const [duration, setDuration] = useState(60);
    const [capacity, setCapacity] = useState<number | "">(10);

    const { data: clubsData, isLoading: loadingClubs } = useQuery({
        queryKey: ["my-clubs"],
        queryFn: () => api.getMyClubs(),
    });

    const clubs = clubsData?.clubs ?? [];

    const mutation = useMutation({
        mutationFn: () => {
            const body: CreateBookingRequest = {
                type,
                startsAt: `${date}T${time}:00Z`,
                durationMinutes: duration,
                capacity: capacity !== "" ? capacity : undefined,
            };
            return api.createBooking(clubId, body);
        },
        onSuccess: () => {
            toast.success("Booking created!");
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
            onClose();
        },
        onError: (err: Error) => {
            toast.error("Could not create booking", { description: err.message });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!clubId) { toast.error("Select a club first."); return; }
        mutation.mutate();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-[#3D46FB]/30 bg-[#3D46FB]/5 p-5">
            <h3 className="text-sm font-semibold text-foreground">New Booking</h3>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Club *</label>
                    <select
                        required
                        value={clubId}
                        onChange={(e) => setClubId(e.target.value)}
                        disabled={loadingClubs}
                        className={inputCls()}
                    >
                        <option value="">{loadingClubs ? "Loading…" : "Select a club"}</option>
                        {clubs.map((c) => (
                            <option key={c.clubId} value={c.clubId}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Type *</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as BookingType)}
                        className={inputCls()}
                    >
                        <option value="Game">Game</option>
                        <option value="DayUse">Day Use</option>
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Date *</label>
                    <input
                        required
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className={inputCls()}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Start time *</label>
                    <input
                        required
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className={inputCls()}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Duration (min) *</label>
                    <input
                        required
                        type="number"
                        min={30}
                        step={30}
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className={inputCls()}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Capacity</label>
                    <input
                        type="number"
                        min={1}
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="Optional"
                        className={inputCls()}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={mutation.isPending}>
                    <X className="h-3.5 w-3.5" />
                    Cancel
                </Button>
                <Button
                    type="submit"
                    size="sm"
                    disabled={mutation.isPending}
                    className="bg-[#3D46FB] text-white hover:bg-[#3D46FB]/90"
                >
                    <Check className="h-3.5 w-3.5" />
                    {mutation.isPending ? "Creating…" : "Create Booking"}
                </Button>
            </div>
        </form>
    );
}
