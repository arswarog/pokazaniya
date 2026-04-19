import { BASE_URL } from './constants';
import { MeterPoint, ReadingResponse } from './types';

function getAccessToken(): string {
    try {
        const raw = localStorage.getItem('security_permissions');
        if (!raw) {
            throw new Error('security_permissions not found');
        }
        const parsed = JSON.parse(raw);
        const token = parsed.accessToken;
        if (!token) {
            throw new Error('accessToken not found');
        }
        return token;
    } catch (e) {
        throw new Error(`Failed to get access token: ${(e as Error).message}`);
    }
}

export function getLastMidnight(): string {
    const now = new Date();
    now.setHours(0, -now.getTimezoneOffset(), 0, 0);
    return now.toISOString().replace('Z', '');
}

export function hasAccessToken(): boolean {
    try {
        getAccessToken();
        return true;
    } catch {
        return false;
    }
}

export async function fetchMeterPoints(): Promise<MeterPoint[]> {
    const token = getAccessToken();
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

export async function fetchReading(meterPointId: number): Promise<ReadingResponse> {
    const token = getAccessToken();
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
