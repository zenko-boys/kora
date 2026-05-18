import { getTranslations } from "next-intl/server";
import { ManageClubsClient } from "./manage-clubs-client";

export default async function ManageClubsPage() {
    const t = await getTranslations("manage");
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {t("clubs.title")}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">{t("clubs.subtitle")}</p>
            </div>
            <ManageClubsClient />
        </div>
    );
}
