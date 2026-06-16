import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createApiClient } from "@/lib/api";
import { ManageSidebar } from "./manage-sidebar";

const MANAGEMENT_ROLES = ["Owner", "Manager", "Admin"];

interface ManageLayoutProps {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}

export default async function ManageLayout({ children, params }: ManageLayoutProps) {
    const { locale } = await params;
    const authObj = await auth();

    if (!authObj.userId) {
        redirect(`/${locale}/sign-in`);
    }

    const api = createApiClient((opts) => authObj.getToken(opts));
    const { clubs } = await api.getMyClubs();
    const hasAccess = clubs.some((c) => MANAGEMENT_ROLES.includes(c.role));

    if (!hasAccess) {
        redirect(`/${locale}/bookings`);
    }

    const t = await getTranslations("manage");

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="flex gap-8">
                <ManageSidebar
                    overviewLabel={t("page.title")}
                    clubsLabel={t("clubs.title")}
                    calendarLabel={t("calendar.title")}
                />
                <main className="min-w-0 flex-1">{children}</main>
            </div>
        </div>
    );
}
