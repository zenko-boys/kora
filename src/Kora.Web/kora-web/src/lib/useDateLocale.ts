"use client";

import { useLocale } from "next-intl";
import { ptBR, enUS } from "date-fns/locale";
import type { Locale } from "date-fns";

export function useDateLocale(): Locale {
  const locale = useLocale();
  return locale === "pt" ? ptBR : enUS;
}
