import { getTranslations } from "next-intl/server";
import { BookingsClient } from "./bookings-client";

export default async function BookingsPage() {
    const t = await getTranslations("bookings.page");

    return (
        <div className="flex h-screen overflow-hidden">
            <BookingsClient title={t("title")} />
        </div>
    );
}
