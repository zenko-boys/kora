import { getTranslations } from "next-intl/server";
import { BookingsClient } from "./bookings-client";

export default async function BookingsPage() {
    const t = await getTranslations("bookings.page");

    return (
        <main className="mx-auto max-w-6xl px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("title")}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
            </div>

            <BookingsClient />
        </main>
    );
}
