import { getTranslations } from "next-intl/server";
import { HomeClient } from "./home-client";

export default async function HomePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "home" });
    return <HomeClient title={t("title")} />;
}

