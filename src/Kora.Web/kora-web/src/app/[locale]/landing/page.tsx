import { Outfit } from "next/font/google";
import { LandingPage } from "@/components/landing/landing-page";

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-landing",
    display: "swap",
    weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
    title: "Kora — O esporte que está dominando o Brasil",
    description:
        "Reserve quadras de padel, encontre jogadores compatíveis e descubra clubes em todo o Brasil. Tudo em um só lugar.",
};

export default function LandingRoute() {
    return (
        <div
            className={outfit.variable}
            style={{ fontFamily: "var(--font-landing, 'Outfit', sans-serif)" }}
        >
            <LandingPage />
        </div>
    );
}
