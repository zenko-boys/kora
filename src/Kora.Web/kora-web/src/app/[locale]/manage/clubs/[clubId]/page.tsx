import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";
import { ManageClubClient } from "./manage-club-client";

export default async function ManageClubPage({
    params,
}: {
    params: Promise<{ clubId: string }>;
}) {
    const { clubId } = await params;
    const t = await getTranslations("manage");

    return (
        <div className="space-y-6">
            <Link
                href="/manage/clubs"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
                <ChevronLeft className="h-4 w-4" />
                {t("clubDetail.back")}
            </Link>
            <ManageClubClient clubId={clubId} />
        </div>
    );
}
