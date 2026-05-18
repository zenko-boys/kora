import { getTranslations } from "next-intl/server";
import { ManageBookingsClient } from "./manage-bookings-client";

export default async function ManageBookingsPage() {
    const t = await getTranslations("manage");
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {t("bookings.title")}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">{t("bookings.subtitle")}</p>
            </div>
            <ManageBookingsClient />
        </div>
    );
}
