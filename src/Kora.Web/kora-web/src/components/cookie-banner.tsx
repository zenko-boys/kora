"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronDown, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";

// ─── Constants ───────────────────────────────────────────────────────────────
const CONSENT_VERSION = "1.0";
const STORAGE_KEY = "kora_cookie_consent";

// ─── Types ───────────────────────────────────────────────────────────────────
type CategoryId = "necessary" | "functional" | "analytics" | "marketing";

type ConsentPrefs = {
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
};

type StoredConsent = ConsentPrefs & {
    version: string;
    timestamp: string;
    necessary: true;
};

type CookieRow = {
    nameKey: string;
    providerKey: string;
    purposeKey: string;
    expiryKey: string;
};

type Category = {
    id: CategoryId;
    alwaysOn: boolean;
    cookies: CookieRow[];
};

// ─── Cookie catalogue ─────────────────────────────────────────────────────────
const CATEGORIES: Category[] = [
    {
        id: "necessary",
        alwaysOn: true,
        cookies: [
            { nameKey: "n1Name", providerKey: "n1Provider", purposeKey: "n1Purpose", expiryKey: "n1Expiry" },
            { nameKey: "n2Name", providerKey: "n2Provider", purposeKey: "n2Purpose", expiryKey: "n2Expiry" },
            { nameKey: "n3Name", providerKey: "n3Provider", purposeKey: "n3Purpose", expiryKey: "n3Expiry" },
            { nameKey: "n4Name", providerKey: "n4Provider", purposeKey: "n4Purpose", expiryKey: "n4Expiry" },
        ],
    },
    {
        id: "functional",
        alwaysOn: false,
        cookies: [
            { nameKey: "f1Name", providerKey: "f1Provider", purposeKey: "f1Purpose", expiryKey: "f1Expiry" },
            { nameKey: "f2Name", providerKey: "f2Provider", purposeKey: "f2Purpose", expiryKey: "f2Expiry" },
        ],
    },
    {
        id: "analytics",
        alwaysOn: false,
        cookies: [
            { nameKey: "a1Name", providerKey: "a1Provider", purposeKey: "a1Purpose", expiryKey: "a1Expiry" },
            { nameKey: "a2Name", providerKey: "a2Provider", purposeKey: "a2Purpose", expiryKey: "a2Expiry" },
            { nameKey: "a3Name", providerKey: "a3Provider", purposeKey: "a3Purpose", expiryKey: "a3Expiry" },
        ],
    },
    {
        id: "marketing",
        alwaysOn: false,
        cookies: [
            { nameKey: "m1Name", providerKey: "m1Provider", purposeKey: "m1Purpose", expiryKey: "m1Expiry" },
            { nameKey: "m2Name", providerKey: "m2Provider", purposeKey: "m2Purpose", expiryKey: "m2Expiry" },
        ],
    },
];

// ─── Component ────────────────────────────────────────────────────────────────
export function CookieBanner() {
    const t = useTranslations("cookies");

    const [showBanner, setShowBanner] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [expanded, setExpanded] = useState<CategoryId | null>(null);
    const [draft, setDraft] = useState<ConsentPrefs>({
        functional: true,
        analytics: true,
        marketing: true,
    });

    // Read localStorage on mount — show banner only if consent is absent/stale
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                setShowBanner(true);
                return;
            }
            const stored: StoredConsent = JSON.parse(raw);
            if (stored.version !== CONSENT_VERSION) {
                localStorage.removeItem(STORAGE_KEY);
                setShowBanner(true);
                return;
            }
            setDraft({
                functional: stored.functional,
                analytics: stored.analytics,
                marketing: stored.marketing,
            });
        } catch {
            setShowBanner(true);
        }
    }, []);

    // Listen for the footer "Cookie Settings" trigger
    useEffect(() => {
        const handler = () => {
            setShowModal(true);
            setShowBanner(false);
        };
        window.addEventListener("kora:open-cookie-settings", handler);
        return () => window.removeEventListener("kora:open-cookie-settings", handler);
    }, []);

    // Close modal on Escape key
    useEffect(() => {
        if (!showModal) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeModal();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [showModal]); // eslint-disable-line react-hooks/exhaustive-deps

    const persist = useCallback((prefs: ConsentPrefs) => {
        const payload: StoredConsent = {
            version: CONSENT_VERSION,
            timestamp: new Date().toISOString(),
            necessary: true,
            ...prefs,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        setDraft(prefs);
        setShowBanner(false);
        setShowModal(false);
    }, []);

    const acceptAll = () => persist({ functional: true, analytics: true, marketing: true });
    const rejectOptional = () => persist({ functional: false, analytics: false, marketing: false });

    function closeModal() {
        setShowModal(false);
        // Re-show banner if user closes without having saved consent
        if (!localStorage.getItem(STORAGE_KEY)) setShowBanner(true);
    }

    if (!showBanner && !showModal) return null;

    return (
        <>
            {/* ── Bottom banner ── */}
            {showBanner && !showModal && (
                <div
                    role="dialog"
                    aria-label={t("banner.headline")}
                    className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/6 bg-[#0d0e14] shadow-[0_-8px_48px_rgba(0,0,0,0.5)]"
                >
                    <div className="mx-auto max-w-7xl px-4 py-5">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
                            {/* Left: text */}
                            <div className="flex min-w-0 flex-1 items-start gap-4">
                                {/* Cookie icon */}
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                    className="mt-0.5 h-5 w-5 shrink-0 text-[#3D46FB]"
                                    aria-hidden="true"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Z" />
                                    <circle cx="8.5" cy="11" r="1" fill="currentColor" stroke="none" />
                                    <circle cx="12.5" cy="8" r="1" fill="currentColor" stroke="none" />
                                    <circle cx="14.5" cy="13.5" r="1" fill="currentColor" stroke="none" />
                                    <circle cx="9.5" cy="15.5" r="0.8" fill="currentColor" stroke="none" />
                                    <circle cx="15.5" cy="10" r="0.8" fill="currentColor" stroke="none" />
                                </svg>
                                <div>
                                    <p className="text-sm font-semibold text-white">{t("banner.headline")}</p>
                                    <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">
                                        {t("banner.description")}{" "}
                                        <a href="#" className="text-[#3D46FB] underline-offset-2 hover:underline">
                                            {t("banner.linkPrivacy")}
                                        </a>
                                    </p>
                                </div>
                            </div>

                            {/* Right: buttons */}
                            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-nowrap">
                                <button
                                    onClick={rejectOptional}
                                    className="rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-zinc-400 transition-colors duration-200 hover:border-white/20 hover:text-white"
                                >
                                    {t("banner.btnRejectOptional")}
                                </button>
                                <button
                                    onClick={() => { setShowModal(true); setShowBanner(false); }}
                                    className="rounded-lg border border-white/20 bg-white/4 px-4 py-2 text-xs font-medium text-white transition-all duration-200 hover:bg-white/8"
                                >
                                    {t("banner.btnManage")}
                                </button>
                                <button
                                    onClick={acceptAll}
                                    className="rounded-lg bg-[#3D46FB] px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:bg-[#4f58fc] active:scale-[0.98]"
                                >
                                    {t("banner.btnAcceptAll")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Preferences modal ── */}
            {showModal && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={t("modal.title")}
                    className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={closeModal}
                        aria-hidden="true"
                    />

                    {/* Card */}
                    <div className="relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#0d0e14] shadow-[0_24px_80px_rgba(0,0,0,0.65)]">

                        {/* Header */}
                        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/6 px-6 py-5">
                            <div>
                                <h2 className="text-base font-semibold text-white">{t("modal.title")}</h2>
                                <p className="mt-1 max-w-[54ch] text-xs leading-relaxed text-zinc-500">
                                    {t("modal.subtitle")}
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition-colors duration-200 hover:border-white/20 hover:text-white"
                                aria-label="Close"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        {/* Scrollable body */}
                        <div className="overflow-y-auto">
                            {CATEGORIES.map((cat, idx) => {
                                const isExpanded = expanded === cat.id;
                                const isChecked = cat.alwaysOn
                                    ? true
                                    : draft[cat.id as keyof ConsentPrefs];

                                return (
                                    <div key={cat.id} className={idx > 0 ? "border-t border-white/6" : ""}>
                                        {/* Category header row */}
                                        <div className="flex items-start gap-4 px-6 py-5">
                                            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                                                <div className="flex flex-wrap items-center gap-2.5">
                                                    <span className="text-sm font-semibold text-white">
                                                        {t(`categories.${cat.id}.title` as Parameters<typeof t>[0])}
                                                    </span>
                                                    {cat.alwaysOn && (
                                                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                                                            {t("categories.necessary.alwaysActive")}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs leading-relaxed text-zinc-500">
                                                    {t(`categories.${cat.id}.description` as Parameters<typeof t>[0])}
                                                </p>
                                                <button
                                                    onClick={() => setExpanded(isExpanded ? null : cat.id)}
                                                    className="mt-0.5 flex items-center gap-1 text-[11px] text-zinc-500 transition-colors duration-150 hover:text-zinc-300"
                                                    aria-expanded={isExpanded}
                                                >
                                                    <span>{isExpanded ? t("table.hideCookies") : t("table.showCookies")}</span>
                                                    <ChevronDown
                                                        className={`h-3 w-3 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                                                    />
                                                </button>
                                            </div>

                                            {/* Toggle */}
                                            <div className="mt-1 shrink-0">
                                                {cat.alwaysOn ? (
                                                    <Switch checked={true} disabled />
                                                ) : (
                                                    <Switch
                                                        checked={isChecked as boolean}
                                                        onCheckedChange={(checked: boolean) =>
                                                            setDraft((d) => ({ ...d, [cat.id]: checked }))
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        {/* Cookie table (expandable) */}
                                        {isExpanded && (
                                            <div className="mx-6 mb-5 overflow-hidden rounded-xl border border-white/6">
                                                {/* Table header */}
                                                <div className="grid grid-cols-[1fr_1fr_2fr_0.8fr] gap-x-3 border-b border-white/6 bg-white/2.5 px-4 py-2.5">
                                                    {(["name", "provider", "purpose", "expiry"] as const).map((col) => (
                                                        <span key={col} className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                                                            {t(`table.${col}` as Parameters<typeof t>[0])}
                                                        </span>
                                                    ))}
                                                </div>
                                                {/* Table rows */}
                                                {cat.cookies.map((row, ri) => (
                                                    <div
                                                        key={ri}
                                                        className={`grid grid-cols-[1fr_1fr_2fr_0.8fr] gap-x-3 px-4 py-3 ${ri > 0 ? "border-t border-white/6" : ""}`}
                                                    >
                                                        <code className="truncate font-mono text-[11px] text-zinc-300">
                                                            {t(`cookieData.${row.nameKey}` as Parameters<typeof t>[0])}
                                                        </code>
                                                        <span className="truncate text-xs text-zinc-400">
                                                            {t(`cookieData.${row.providerKey}` as Parameters<typeof t>[0])}
                                                        </span>
                                                        <span className="text-xs leading-relaxed text-zinc-500">
                                                            {t(`cookieData.${row.purposeKey}` as Parameters<typeof t>[0])}
                                                        </span>
                                                        <span className="text-xs text-zinc-400">
                                                            {t(`cookieData.${row.expiryKey}` as Parameters<typeof t>[0])}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Sticky footer bar */}
                        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-white/6 px-6 py-4">
                            <button
                                onClick={rejectOptional}
                                className="text-xs font-medium text-zinc-500 underline-offset-2 transition-colors duration-200 hover:text-zinc-200 hover:underline"
                            >
                                {t("modal.btnRejectAll")}
                            </button>
                            <button
                                onClick={() => persist(draft)}
                                className="inline-flex items-center gap-2 rounded-lg bg-[#3D46FB] px-5 py-2.5 text-xs font-semibold text-white transition-all duration-200 hover:bg-[#4f58fc] active:scale-[0.98]"
                            >
                                <Check className="h-3 w-3" />
                                {t("modal.btnSave")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
