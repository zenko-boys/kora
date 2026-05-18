import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";

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
                <Navbar />
                <div className="flex-1">{children}</div>
                <Toaster richColors position="bottom-right" />
            </Providers>
        </NextIntlClientProvider>
    );
}
