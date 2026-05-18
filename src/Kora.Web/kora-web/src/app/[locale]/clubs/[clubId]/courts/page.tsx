import { getTranslations } from "next-intl/server";
import { CourtsClient } from "./courts-client";

interface CourtsPageProps {
    params: Promise<{ locale: string; clubId: string }>;
}

export default async function CourtsPage({ params }: CourtsPageProps) {
    const { clubId } = await params;
    const t = await getTranslations("courts.page");

    return (
        <main className="mx-auto max-w-6xl px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("title")}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Manage the courts for this club.
                </p>
            </div>

            <CourtsClient clubId={clubId} />
        </main>
    );
}
