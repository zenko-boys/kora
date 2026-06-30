"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "@/i18n/navigation";
import { useEffect } from "react";

export default function HomePage() {
    const { isSignedIn, isLoaded } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoaded) return;

        if (isSignedIn) {
            router.push("/bookings");
        } else {
            router.push("/landing");
        }
    }, [isLoaded, isSignedIn, router]);

    return null;
}

