import { getTranslations } from "next-intl/server";
import { BookingsClient } from "./bookings-client";

export default async function BookingsPage() {
    const t = await getTranslations("bookings.page");

    return (
        <main className="mx-auto max-w-6xl px-4 py-8">
            <BookingsClient
                title={t("title")}
                subtitle={t("subtitle")}
            />
        </main>
    );
}
