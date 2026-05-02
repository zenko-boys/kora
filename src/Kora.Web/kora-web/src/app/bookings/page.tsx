import { BookingsClient } from "./bookings-client";

export default function BookingsPage() {
    return (
        <main className="mx-auto max-w-6xl px-4 py-8">
            {/* Page header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Bookings</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Browse available sessions and join a booking or create your own.
                </p>
            </div>

            <BookingsClient />
        </main>
    );
}
