import { CollectedReading } from './types';

interface ParsedCaption {
    prefix: string;
    num: number;
    suffix: string;
}

function parseCaption(caption: string): ParsedCaption | null {
    const match = caption.match(/^(.*?)(\d+)(.*)$/);
    if (!match) {
        return null;
    }
    return {
        prefix: match[1],
        num: parseInt(match[2], 10),
        suffix: match[3],
    };
}

function emptyReading(caption: string): CollectedReading {
    return {
        caption,
        nightValue: null,
        nightDate: null,
        dayValue: null,
        dayDate: null,
    };
}

export function fillMissingReadings(readings: CollectedReading[]): CollectedReading[] {
    const groups = new Map<
        string,
        { prefix: string; suffix: string; items: Map<number, CollectedReading> }
    >();
    const withoutNumbers: CollectedReading[] = [];

    for (const reading of readings) {
        const parsed = parseCaption(reading.caption);
        if (!parsed) {
            withoutNumbers.push(reading);
            continue;
        }
        const key = `${parsed.prefix}\u0000${parsed.suffix}`;
        let group = groups.get(key);
        if (!group) {
            group = { prefix: parsed.prefix, suffix: parsed.suffix, items: new Map() };
            groups.set(key, group);
        }
        group.items.set(parsed.num, reading);
    }

    const sortedGroups = Array.from(groups.values()).sort((a, b) =>
        (a.prefix + a.suffix).localeCompare(b.prefix + b.suffix),
    );

    const result: CollectedReading[] = [];
    for (const group of sortedGroups) {
        const maxN = Math.max(...group.items.keys());
        for (let n = 1; n <= maxN; n++) {
            const existing = group.items.get(n);
            if (existing) {
                result.push(existing);
            } else {
                result.push(emptyReading(`${group.prefix}${n}${group.suffix}`));
            }
        }
    }

    result.push(...withoutNumbers);
    return result;
}
