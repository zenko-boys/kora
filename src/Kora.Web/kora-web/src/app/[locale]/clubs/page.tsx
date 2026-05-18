import { redirect } from "next/navigation";

export default async function ClubsPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    redirect(`/${locale}/manage/clubs`);
}
