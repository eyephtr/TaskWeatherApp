import {
    addDays,
    addMinutes,
    diffDays,
    formatDate,
    fromTimeString,
    monthStartOf,
    startOfWeek,
    toDateString,
    toTimeString,
} from '../src/utils/date';

describe('date utils', () => {
    it('formats local dates without timezone shifts', () => {
        expect(toDateString(new Date(2026, 10, 9, 23, 59))).toBe('2026-11-09');
        expect(toDateString(new Date(2026, 0, 1, 0, 0))).toBe('2026-01-01');
    });

    it('adds days across month and year boundaries', () => {
        expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
        expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
        expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    });

    it('counts the difference in days', () => {
        expect(diffDays('2026-11-09', '2026-11-12')).toBe(3);
        expect(diffDays('2026-11-12', '2026-11-09')).toBe(-3);
        expect(diffDays('2026-11-09', '2026-11-09')).toBe(0);
    });

    it('finds the start of the week (Sunday)', () => {
        expect(startOfWeek('2026-11-09')).toBe('2026-11-08'); // Monday
        expect(startOfWeek('2026-11-08')).toBe('2026-11-08'); // Sunday
        expect(startOfWeek('2026-11-14')).toBe('2026-11-08'); // Saturday
    });

    it('formats readable dates and month starts', () => {
        expect(formatDate('2026-11-09')).toBe('Monday, 9 November');
        expect(monthStartOf('2026-11-19')).toBe('2026-11-01');
    });

    it('converts between Date and HH:mm', () => {
        expect(toTimeString(new Date(2026, 10, 9, 7, 5))).toBe('07:05');
        const d = fromTimeString('13:45');
        expect([d.getHours(), d.getMinutes()]).toEqual([13, 45]);
    });

    it('adds minutes and clamps within the day', () => {
        expect(addMinutes('09:00', 60)).toBe('10:00');
        expect(addMinutes('23:30', 60)).toBe('23:59');
        expect(addMinutes('00:10', -30)).toBe('00:00');
    });
});