console.log('[Показания] Content script loaded');

const BASE_URL = 'https://62.33.168.51:6001';

function getAccessToken(): string | null {
    try {
        const raw = localStorage.getItem('security_permissions');
        if (!raw) {
            return null;
        }
        const parsed = JSON.parse(raw);
        return parsed.accessToken ?? null;
    } catch {
        return null;
    }
}

function createInfoBlock(): {
    container: HTMLDivElement;
    status: HTMLDivElement;
    button: HTMLButtonElement;
    downloadBtn: HTMLButtonElement;
} {
    const container = document.createElement('div');
    container.id = 'pokazaniya-info';

    const status = document.createElement('div');
    container.appendChild(status);

    const button = document.createElement('button');
    button.id = 'pokazaniya-btn';
    button.textContent = 'Собрать показания';
    container.appendChild(button);

    const downloadBtn = document.createElement('button');
    downloadBtn.id = 'pokazaniya-download';
    downloadBtn.textContent = 'Скачать CSV';
    container.appendChild(downloadBtn);

    document.body.appendChild(container);
    return { container, status, button, downloadBtn };
}

interface MeterPoint {
    id: number;
    caption: string;
}

interface ReadingEntry {
    lastValue: number | null;
    lastValueDate: string | null;
    parameterId: number;
    tariffZoneId: number;
    currentValue: number | null;
}

interface ReadingResponse {
    readings: ReadingEntry[];
}

interface CollectedReading {
    caption: string;
    value: number | null;
}

function getLastMidnight(): string {
    const now = new Date();
    now.setHours(0, -now.getTimezoneOffset(), 0, 0);
    return now.toISOString().replace('Z', '');
}

async function fetchMeterPoints(token: string): Promise<MeterPoint[]> {
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

async function fetchReading(token: string, meterPointId: number): Promise<ReadingResponse> {
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

let paused = false;
let running = false;

function downloadCsv(readings: CollectedReading[]) {
    const header = 'Точка учёта;Показание';
    const rows = readings.map((r) => `${r.caption};${r.value ?? ''}`);
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pokazaniya_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

let currentReadings: CollectedReading[] = [];

async function collectReadings(token: string, status: HTMLDivElement, button: HTMLButtonElement) {
    if (running) {
        paused = !paused;
        button.textContent = paused ? 'Продолжить' : 'Пауза';
        return;
    }

    running = true;
    paused = false;
    button.textContent = 'Пауза';

    try {
        status.textContent = 'Загрузка списка точек учёта...';
        const points = await fetchMeterPoints(token);

        currentReadings = [];
        const readings = currentReadings;
        const activePoints = points.filter((p) => p.id !== 0);
        const BATCH_SIZE = 3;

        for (let i = 0; i < activePoints.length; i += BATCH_SIZE) {
            while (paused) {
                await new Promise((r) => setTimeout(r, 200));
            }

            const batch = activePoints.slice(i, i + BATCH_SIZE);
            status.textContent = `Показания: ${readings.length}/${activePoints.length} — загрузка ${batch.map((p) => `«${p.caption}»`).join(', ')}...`;

            const batchResults = await Promise.all(
                batch.map(async (point) => {
                    const response = await fetchReading(token, point.id);
                    const entry = response.readings.find(
                        (r) => r.tariffZoneId === 0 && r.parameterId === -2161,
                    );
                    const caption = point.caption;
                    const value = entry?.lastValue != null ? entry.lastValue / 1000 : null;
                    console.log({ caption, value, entry, response });
                    return { caption, value };
                }),
            );

            readings.push(...batchResults);

            if (i + BATCH_SIZE < activePoints.length) {
                const delay = 1000 + Math.random() * 2000;
                await new Promise((r) => setTimeout(r, delay));
            }
        }

        status.textContent = `Готово. Показаний: ${readings.length}`;
        button.textContent = 'Собрать показания';

        console.log('[Показания] Readings:', readings);
    } catch (err) {
        console.error('[Показания] Error:', err);
        status.textContent = 'Ошибка загрузки';
        button.textContent = 'Собрать показания';
    }

    running = false;
    paused = false;
}

function init() {
    const token = getAccessToken();
    if (!token) {
        console.warn('[Показания] accessToken not found in security_permissions');
        return;
    }

    const { status, button, downloadBtn } = createInfoBlock();
    status.textContent = 'Готов к сбору показаний';

    button.addEventListener('click', () => collectReadings(token, status, button));
    downloadBtn.addEventListener('click', () => downloadCsv(currentReadings));
}

init();
