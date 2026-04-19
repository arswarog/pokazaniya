import { PARAMETER_ID, TARIFF_ZONE_DAY, TARIFF_ZONE_NIGHT } from './constants';
import { CollectedReading, ReadingResponse } from './types';

export function parseReadingResponse(caption: string, response: ReadingResponse): CollectedReading {
    const nightEntry = response.readings.find(
        (r) => r.tariffZoneId === TARIFF_ZONE_NIGHT && r.parameterId === PARAMETER_ID,
    );
    const dayEntry = response.readings.find(
        (r) => r.tariffZoneId === TARIFF_ZONE_DAY && r.parameterId === PARAMETER_ID,
    );

    const nightValue =
        nightEntry?.lastValue != null ? Math.trunc(nightEntry.lastValue / 1000) : null;
    const nightDate = nightEntry?.lastValueDate ?? null;
    const dayValue = dayEntry?.lastValue != null ? Math.trunc(dayEntry.lastValue / 1000) : null;
    const dayDate = dayEntry?.lastValueDate ?? null;

    return { caption, nightValue, nightDate, dayValue, dayDate };
}
