"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

// scriptProps suppressHydrationWarning silences the React 19 warning about
// next-themes injecting an inline <script> for anti-FOUC theme detection.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const scriptProps = { suppressHydrationWarning: true } as any;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            scriptProps={scriptProps}
        >
            {children}
        </NextThemesProvider>
    );
}
