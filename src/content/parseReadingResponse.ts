import { PARAMETER_ID, STALE_THRESHOLD_MS, TARIFF_ZONE_DAY, TARIFF_ZONE_NIGHT } from './constants';
import { CollectedReading, ReadingResponse } from './types';

function isStale(date: string | null): boolean {
    if (!date) {
        return false;
    }
    const t = Date.parse(date);
    if (Number.isNaN(t)) {
        return false;
    }
    return Date.now() - t > STALE_THRESHOLD_MS;
}

export function parseReadingResponse(caption: string, response: ReadingResponse): CollectedReading {
    const nightEntry = response.readings.find(
        (r) => r.tariffZoneId === TARIFF_ZONE_NIGHT && r.parameterId === PARAMETER_ID,
    );
    const dayEntry = response.readings.find(
        (r) => r.tariffZoneId === TARIFF_ZONE_DAY && r.parameterId === PARAMETER_ID,
    );

    const nightDate = nightEntry?.lastValueDate ?? null;
    const dayDate = dayEntry?.lastValueDate ?? null;

    const nightValue =
        nightEntry?.lastValue != null && !isStale(nightDate)
            ? Math.trunc(nightEntry.lastValue / 1000)
            : null;
    const dayValue =
        dayEntry?.lastValue != null && !isStale(dayDate)
            ? Math.trunc(dayEntry.lastValue / 1000)
            : null;

    return { caption, nightValue, nightDate, dayValue, dayDate };
}
