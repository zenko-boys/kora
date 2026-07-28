import moment from "moment-timezone";

export type PeriodKey = "manha" | "tarde" | "noite";

export const PERIOD_TIME_RANGES: Record<PeriodKey, [string, string]> = {
    manha: ["06:00", "12:00"],
    tarde: ["12:30", "18:00"],
    noite: ["18:30", "22:00"],
};

export const PERIOD_KEYS: PeriodKey[] = ["manha", "tarde", "noite"];

/** Local (viewer) start/end-of-day range for a plain YYYY-MM-DD date. Used when no club/period is selected. */
export function dayOnlyUtcRange(day: string): { fromUtc: string; toUtc: string } {
    const from = new Date(`${day}T00:00:00`);
    const to = new Date(`${day}T23:59:59.999`);
    return { fromUtc: from.toISOString(), toUtc: to.toISOString() };
}

/** Which period card a given club-local slot start time falls into, if any. */
export function bucketSlotPeriod(startTimeIso: string): PeriodKey | null {
    const time = moment.parseZone(startTimeIso).format("HH:mm");
    for (const key of PERIOD_KEYS) {
        const [start, end] = PERIOD_TIME_RANGES[key];
        if (time >= start && time < end) return key;
    }
    return null;
}

/** A period card's nominal boundaries in the club's own timezone, converted to UTC. */
export function periodUtcRange(day: string, period: PeriodKey, timeZoneId: string): { fromUtc: string; toUtc: string } {
    const [startTime, endTime] = PERIOD_TIME_RANGES[period];
    const from = moment.tz(`${day} ${startTime}`, "YYYY-MM-DD HH:mm", timeZoneId);
    const to = moment.tz(`${day} ${endTime}`, "YYYY-MM-DD HH:mm", timeZoneId);
    return { fromUtc: from.utc().toISOString(), toUtc: to.utc().toISOString() };
}
