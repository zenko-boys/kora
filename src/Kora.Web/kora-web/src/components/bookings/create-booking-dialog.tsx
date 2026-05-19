"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { CreateBookingForm } from "./create-booking-form";

interface CreateBookingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const mql = window.matchMedia("(max-width: 639px)");
        setIsMobile(mql.matches);
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
    }, []);
    return isMobile;
}

export function CreateBookingDialog({ open, onOpenChange }: CreateBookingDialogProps) {
    const t = useTranslations("bookings");
    const isMobile = useIsMobile();

    if (isMobile) {
        if (!open) return null;
        return (
            <div className="rounded-xl border border-[#82B1FF]/30 bg-[#82B1FF]/5 shadow-[0_4px_24px_rgba(130,177,255,0.10)] p-5">
                <h3 className="mb-5 text-sm font-semibold text-foreground">{t("form.title")}</h3>
                <CreateBookingForm onClose={() => onOpenChange(false)} />
            </div>
        );
    }

    return (
        <Dialog open={open} onOpenChange={(o) => onOpenChange(o)}>
            <DialogContent className="max-h-[85vh] min-[720px]:max-w-270 overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t("form.title")}</DialogTitle>
                </DialogHeader>
                <CreateBookingForm onClose={() => onOpenChange(false)} />
            </DialogContent>
        </Dialog>
    );
}
