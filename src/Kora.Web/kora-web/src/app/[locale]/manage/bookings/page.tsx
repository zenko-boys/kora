import { getTranslations } from "next-intl/server";
import { ManageBookingsClient } from "./manage-bookings-client";

export default async function ManageBookingsPage() {
    const t = await getTranslations("manage");
    return <ManageBookingsClient title={t("bookings.title")} subtitle={t("bookings.subtitle")} />;
}
