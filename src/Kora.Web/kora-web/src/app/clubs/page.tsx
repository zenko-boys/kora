import { ClubsClient } from "./clubs-client";

export default function ClubsPage() {
    return (
        <main className="mx-auto max-w-6xl px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Clubs</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Manage your clubs and their settings.
                </p>
            </div>

            <ClubsClient />
        </main>
    );
}
