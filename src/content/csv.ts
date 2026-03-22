import { CollectedReading } from './types';

export function downloadCsv(readings: CollectedReading[]) {
    const header = 'Точка учёта;Суммарно;Дата;Показание день;Дата день;Показание ночь;Дата ночь';
    const rows = readings.map((r) => {
        const total =
            r.dayValue != null && r.nightValue != null ? `${r.dayValue} - ${r.nightValue}` : '';
        const date = (r.dayDate ?? r.nightDate)?.slice(0, 10) ?? '';
        const dayDate = r.dayDate?.slice(0, 10) ?? '';
        const nightDate = r.nightDate?.slice(0, 10) ?? '';
        return `${r.caption};${total};${date};${r.dayValue ?? ''};${dayDate};${r.nightValue ?? ''};${nightDate}`;
    });
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pokazaniya_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
