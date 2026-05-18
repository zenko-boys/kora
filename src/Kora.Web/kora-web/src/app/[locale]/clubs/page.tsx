import { getTranslations } from "next-intl/server";
import { ClubsClient } from "./clubs-client";

export default async function ClubsPage() {
    const t = await getTranslations("clubs.page");

    return (
        <main className="mx-auto max-w-6xl px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("title")}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
            </div>

            <ClubsClient />
        </main>
    );
}
