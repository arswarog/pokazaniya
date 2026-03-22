import { BASE_URL } from './constants';
import { MeterPoint, ReadingResponse } from './types';

export function getLastMidnight(): string {
    const now = new Date();
    now.setHours(0, -now.getTimezoneOffset(), 0, 0);
    return now.toISOString().replace('Z', '');
}

export async function fetchMeterPoints(token: string): Promise<MeterPoint[]> {
    const res = await fetch(`${BASE_URL}/api/v1/meterpoints/getmeterpoints/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }
    return res.json();
}

export async function fetchReading(token: string, meterPointId: number): Promise<ReadingResponse> {
    const res = await fetch(`${BASE_URL}/api/v1/meterpointreadings/read/`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            meterPointId,
            valuesDt: getLastMidnight(),
        }),
    });
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }
    return res.json();
}
