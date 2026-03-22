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

function createInfoBlock(): HTMLDivElement {
    const el = document.createElement('div');
    el.id = 'pokazaniya-info';
    el.textContent = 'Загрузка...';
    document.body.appendChild(el);
    return el;
}

async function fetchMeterPoints(token: string): Promise<unknown[]> {
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

async function init() {
    const token = getAccessToken();
    if (!token) {
        console.warn('[Pokazaniya] accessToken not found in security_permissions');
        return;
    }

    const block = createInfoBlock();

    try {
        const data = await fetchMeterPoints(token);
        block.textContent = `Точек учёта: ${data.length}`;
    } catch (err) {
        console.error('[Pokazaniya] Failed to fetch meter points:', err);
        block.textContent = 'Ошибка загрузки';
    }
}

init();
