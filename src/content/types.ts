export interface MeterPoint {
    id: number;
    caption: string;
}

export interface ReadingEntry {
    lastValue: number | null;
    lastValueDate: string | null;
    parameterId: number;
    tariffZoneId: number;
    currentValue: number | null;
}

export interface ReadingResponse {
    readings: ReadingEntry[];
}

export interface CollectedReading {
    caption: string;
    nightValue: number | null;
    nightDate: string | null;
    dayValue: number | null;
    dayDate: string | null;
}
