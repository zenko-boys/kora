"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export interface ClubSearchOption {
    clubId: string;
    name: string;
    timeZoneId?: string;
}

interface ClubSearchInputProps {
    clubs: ClubSearchOption[];
    selectedClubId: string;
    onSelect: (clubId: string) => void;
    placeholder: string;
    allLabel: string;
}

export function ClubSearchInput({ clubs, selectedClubId, onSelect, placeholder, allLabel }: ClubSearchInputProps) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);

    const selected = clubs.find((c) => c.clubId === selectedClubId);
    const filtered = query.trim()
        ? clubs.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()))
        : clubs;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger className="relative w-full text-left">
                <Search className="pointer-events-none absolute left-3.25 top-1/2 h-4.25 w-4.25 -translate-y-1/2 text-muted-foreground" />
                <div className="w-full cursor-pointer truncate rounded-[10px] border-[1.5px] border-border bg-background py-3 pr-9 pl-9.5 text-sm font-medium text-foreground">
                    {selected?.name ?? placeholder}
                </div>
                {selected && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect("");
                            setQuery("");
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
                        aria-label={allLabel}
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[--anchor-width] max-h-72 overflow-y-auto p-1.5">
                <input
                    autoFocus
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="mb-1.5 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground outline-none focus:border-[#8CC63F]"
                />
                <div className="flex flex-col gap-0.5">
                    <button
                        type="button"
                        onClick={() => {
                            onSelect("");
                            setQuery("");
                            setOpen(false);
                        }}
                        className={[
                            "rounded-md p-2 text-left text-sm font-medium transition-colors",
                            selectedClubId === "" ? "bg-[#8CC63F]/10 text-[#8CC63F]" : "text-foreground hover:bg-accent",
                        ].join(" ")}
                    >
                        {allLabel}
                    </button>
                    {filtered.length === 0 ? (
                        <p className="px-2 py-3 text-center text-xs text-muted-foreground">—</p>
                    ) : (
                        filtered.map((c) => (
                            <button
                                key={c.clubId}
                                type="button"
                                onClick={() => {
                                    onSelect(c.clubId);
                                    setQuery("");
                                    setOpen(false);
                                }}
                                className={[
                                    "truncate rounded-md p-2 text-left text-sm font-medium transition-colors",
                                    c.clubId === selectedClubId ? "bg-[#8CC63F]/10 text-[#8CC63F]" : "text-foreground hover:bg-accent",
                                ].join(" ")}
                            >
                                {c.name}
                            </button>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
