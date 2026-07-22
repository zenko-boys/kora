import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Providers } from "@/components/providers";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { CookieBanner } from "@/components/cookie-banner";

interface LocaleLayoutProps {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
    const { locale } = await params;
    const messages = await getMessages();

    return (
        <NextIntlClientProvider messages={messages}>
            <Providers>
                <div className="flex min-h-screen flex-1">
                    <AppSidebar />
                    <div className="min-w-0 flex-1">{children}</div>
                </div>
                <Toaster richColors position="bottom-right" />
                <CookieBanner />
            </Providers>
        </NextIntlClientProvider>
    );
}
