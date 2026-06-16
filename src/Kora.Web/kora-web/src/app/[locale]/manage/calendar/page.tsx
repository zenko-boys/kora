import { getTranslations } from "next-intl/server";
import { CalendarClient } from "./calendar-client";

export default async function CalendarPage() {
    const t = await getTranslations("manage");
    return <CalendarClient title={t("calendar.title")} subtitle={t("calendar.subtitle")} />;
}
