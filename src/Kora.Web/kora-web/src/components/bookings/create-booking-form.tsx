"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { X, Check, Clock, Loader2 } from "lucide-react";
import moment from "moment-timezone";
import { createApiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import type { BookingType, CreateBookingRequest } from "@/lib/types";

function inputCls(extra?: string) {
    return `w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#3D46FB]/50 ${extra ?? ""}`;
}

const MAX_DURATION_SLOTS = 8;

function buildDurationOptions(cellMin: number, minMin: number): { label: string; value: number }[] {
    const options: { label: string; value: number }[] = [];
    for (let mult = Math.ceil(minMin / cellMin); mult <= MAX_DURATION_SLOTS; mult++) {
        const totalMin = mult * cellMin;
        const h = Math.floor(totalMin / 60);
        const m = totalMin % 60;
        const label = h > 0 && m > 0 ? `${h}h ${m}min` : h > 0 ? `${h}h` : `${m}min`;
        options.push({ label, value: totalMin });
    }
    return options;
}

export function CreateBookingForm({ onClose }: { onClose: () => void }) {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    const api = createApiClient(async (opts) => getToken(opts));

    const [clubId, setClubId] = useState("");
    const [type, setType] = useState<BookingType>("Game");
    const [date, setDate] = useState("");
    const [selectedSlotStart, setSelectedSlotStart] = useState("");
    const [duration, setDuration] = useState<number | null>(null);
    const [capacity, setCapacity] = useState<number | "">(10);

    // Reset slot selection when club or date changes
    useEffect(() => { setSelectedSlotStart(""); }, [clubId, date]);

    const { data: clubsData, isLoading: loadingClubs } = useQuery({
        queryKey: ["my-clubs"],
        queryFn: () => api.getMyClubs(),
    });

    const clubs = clubsData?.clubs ?? [];

    const { data: slotsData, isLoading: loadingSlots, isFetching: fetchingSlots } = useQuery({
        queryKey: ["club-slots", clubId, date],
        queryFn: () => api.getClubSlots(clubId, date),
        enabled: !!clubId && !!date,
        staleTime: 60_000,
    });

    const timeZoneId = slotsData?.timeZoneId ?? "UTC";
    const cellMin = slotsData?.slotCellDurationMinutes ?? 60;
    const minMin = slotsData?.minimumBookingDurationMinutes ?? 60;
    const slots = slotsData?.slots ?? [];
    const durationOptions = buildDurationOptions(cellMin, minMin);

    // Set default duration when options change
    useEffect(() => {
        if (durationOptions.length > 0) setDuration(durationOptions[0].value);
    }, [cellMin, minMin]);

    // Timezone display badge: e.g. "America/Sao_Paulo  → BRT (UTC-03:00)"
    const tzBadge = timeZoneId !== "UTC"
        ? moment.tz(timeZoneId).format("[UTC]Z") + " · " + timeZoneId
        : "UTC";

    function formatSlotTime(timeStr: string) {
        // timeStr is "HH:mm:ss" local to the club timezone
        return moment.tz(`${date} ${timeStr}`, "YYYY-MM-DD HH:mm:ss", timeZoneId).format("HH:mm");
    }

    const mutation = useMutation({
        mutationFn: () => {
            const startsAt = moment
                .tz(`${date} ${selectedSlotStart}`, "YYYY-MM-DD HH:mm:ss", timeZoneId)
                .utc()
                .toISOString();

            const body: CreateBookingRequest = {
                type,
                startsAt,
                durationMinutes: duration ?? minMin,
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
        if (!date) { toast.error("Select a date."); return; }
        if (!selectedSlotStart) { toast.error("Select a time slot."); return; }
        mutation.mutate();
    };

    const today = moment().format("YYYY-MM-DD");

    return (
        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-[#3D46FB]/30 bg-[#3D46FB]/5 p-5">
            <h3 className="text-sm font-semibold text-foreground">New Booking</h3>

            <div className="grid gap-4 sm:grid-cols-2">
                {/* Club */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Club *</label>
                    <select
                        required
                        name="clubId"
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

                {/* Type */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Type *</label>
                    <select
                        name="type"
                        value={type}
                        onChange={(e) => setType(e.target.value as BookingType)}
                        className={inputCls()}
                    >
                        <option value="Game">Game</option>
                        <option value="DayUse">Day Use</option>
                    </select>
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Date *</label>
                    <input
                        required
                        name="date"
                        type="date"
                        min={today}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className={inputCls()}
                    />
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Duration *</label>
                    <select
                        name="durationMinutes"
                        value={duration ?? ""}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        disabled={durationOptions.length === 0}
                        className={inputCls()}
                    >
                        {durationOptions.length === 0 && (
                            <option value="">—</option>
                        )}
                        {durationOptions.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>

                {/* Capacity */}
                <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground">Capacity</label>
                    <input
                        name="capacity"
                        type="number"
                        min={1}
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="Optional"
                        className={inputCls()}
                    />
                </div>
            </div>

            {/* Slot picker */}
            {clubId && date && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-muted-foreground">
                            Available time slots *
                        </label>
                        {timeZoneId && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {tzBadge}
                            </span>
                        )}
                    </div>

                    {loadingSlots || fetchingSlots ? (
                        <div className="flex items-center gap-2 py-4 text-xs text-muted-foreground">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Loading slots…
                        </div>
                    ) : slots.length === 0 ? (
                        <p className="rounded-md border border-dashed border-border py-4 text-center text-xs text-muted-foreground">
                            No slots available for this date.
                        </p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {slots.map((slot) => {
                                const isSelected = selectedSlotStart === slot.startTime;
                                return (
                                    <button
                                        key={slot.startTime}
                                        type="button"
                                        disabled={!slot.available}
                                        onClick={() => setSelectedSlotStart(slot.startTime)}
                                        className={[
                                            "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                                            slot.available
                                                ? isSelected
                                                    ? "border-[#3D46FB] bg-[#3D46FB] text-white"
                                                    : "border-border bg-background text-foreground hover:border-[#3D46FB]/60 hover:bg-[#3D46FB]/5"
                                                : "cursor-not-allowed border-border bg-muted/40 text-muted-foreground opacity-40",
                                        ].join(" ")}
                                    >
                                        {formatSlotTime(slot.startTime)}
                                        {slot.available && !isSelected && (
                                            <span className="ml-1 text-muted-foreground">
                                                ({slot.availableCourts})
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={mutation.isPending}>
                    <X className="h-3.5 w-3.5" />
                    Cancel
                </Button>
                <Button
                    type="submit"
                    size="sm"
                    disabled={mutation.isPending || !selectedSlotStart}
                    className="bg-[#3D46FB] text-white hover:bg-[#3D46FB]/90"
                >
                    <Check className="h-3.5 w-3.5" />
                    {mutation.isPending ? "Creating…" : "Create Booking"}
                </Button>
            </div>
        </form>
    );
}

