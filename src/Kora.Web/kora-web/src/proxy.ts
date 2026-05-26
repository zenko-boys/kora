import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const isPublicRoute = createRouteMatcher([
    "/:locale/sign-in(.*)",
    "/:locale/landing",
]);

export default clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
        await auth.protect();
    }
    return intlMiddleware(req);
});

export const config = {
    matcher: [
        // Skip Next.js internals, static files, and API routes
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
    ],
};
