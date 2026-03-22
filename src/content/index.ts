import { fetchMeterPoints, fetchReading } from './api';
import {
    BATCH_SIZE,
    DELAY_MAX,
    DELAY_MIN,
    PARAMETER_ID,
    TARIFF_ZONE_DAY,
    TARIFF_ZONE_NIGHT,
} from './constants';
import { downloadCsv } from './csv';
import { CollectedReading } from './types';

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

let paused = false;
let running = false;
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
        status.textContent = 'Загрузка списка точек учёта';
        const points = await fetchMeterPoints(token);

        currentReadings = [];
        const readings = currentReadings;
        const activePoints = points.filter((p) => p.id !== 0);

        let nextIndex = 0;

        async function worker() {
            while (nextIndex < activePoints.length) {
                while (paused) {
                    await new Promise((r) => setTimeout(r, 200));
                }
                const idx = nextIndex++;
                if (idx >= activePoints.length) {
                    break;
                }

                const point = activePoints[idx];

                const response = await fetchReading(token, point.id);
                const nightEntry = response.readings.find(
                    (r) => r.tariffZoneId === TARIFF_ZONE_NIGHT && r.parameterId === PARAMETER_ID,
                );
                const dayEntry = response.readings.find(
                    (r) => r.tariffZoneId === TARIFF_ZONE_DAY && r.parameterId === PARAMETER_ID,
                );
                const caption = point.caption;
                const nightValue =
                    nightEntry?.lastValue != null ? Math.trunc(nightEntry.lastValue / 1000) : null;
                const nightDate = nightEntry?.lastValueDate ?? null;
                const dayValue =
                    dayEntry?.lastValue != null ? Math.trunc(dayEntry.lastValue / 1000) : null;
                const dayDate = dayEntry?.lastValueDate ?? null;
                readings.push({ caption, nightValue, nightDate, dayValue, dayDate });

                status.textContent = `Показания: ${readings.length}/${activePoints.length}`;

                if (nextIndex < activePoints.length) {
                    const delay = DELAY_MIN + Math.random() * (DELAY_MAX - DELAY_MIN);
                    await new Promise((r) => setTimeout(r, delay));
                }
            }
        }

        await Promise.all(
            Array.from({ length: Math.min(BATCH_SIZE, activePoints.length) }, () => worker()),
        );

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
