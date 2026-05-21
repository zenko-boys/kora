import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createApiClient } from "@/lib/api";
import { MANAGEMENT_ROLES } from "@/lib/constants";
import { SlotsClient } from "./slots-client";

interface SlotsPageProps {
    params: Promise<{ locale: string; clubId: string }>;
}

export default async function SlotsPage({ params }: SlotsPageProps) {
    const { locale, clubId } = await params;
    const authObj = await auth();

    if (!authObj.userId) {
        redirect(`/${locale}/sign-in`);
    }

    const api = createApiClient((opts) => authObj.getToken(opts));
    const { clubs } = await api.getMyClubs();
    const club = clubs.find((c) => c.clubId === clubId);

    if (!club || !MANAGEMENT_ROLES.includes(club.role)) {
        redirect(`/${locale}/manage/clubs`);
    }

    const t = await getTranslations("manage");

    return (
        <SlotsClient
            clubId={clubId}
            clubName={club.name}
            timeZoneId={club.timeZoneId}
            title={t("slots.title")}
            subtitle={t("slots.subtitle")}
            backLabel={t("slots.back")}
        />
    );
}
