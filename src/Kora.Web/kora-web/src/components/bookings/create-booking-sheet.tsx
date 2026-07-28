"use client";

import { useTranslations } from "next-intl";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CreateBookingForm } from "./create-booking-form";

interface CreateBookingSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateBookingSheet({ open, onOpenChange }: CreateBookingSheetProps) {
    const t = useTranslations("bookings.form");

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{t("pageTitle")}</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto pr-1">
                    <CreateBookingForm onClose={() => onOpenChange(false)} />
                </div>
            </SheetContent>
        </Sheet>
    );
}
