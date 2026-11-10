export const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];
export const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function toDateString(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export function formatDate(dateString: string): string {
    const [y, m, d] = dateString.split('-').map(Number);
    const weekday = dayNames[new Date(y, m - 1, d).getDay()];
    return `${weekday}, ${d} ${monthNames[m - 1]}`;
}

export function monthStartOf(dateString: string): string {
    return `${dateString.slice(0, 7)}-01`;
}

export function addDays(dateString: string, n: number): string {
    const [y, m, d] = dateString.split('-').map(Number);
    return toDateString(new Date(y, m - 1, d + n));
}

export function diffDays(a: string, b: string): number {
    const utc = (s: string) => {
        const [y, m, d] = s.split('-').map(Number);
        return Date.UTC(y, m - 1, d);
    };
    return Math.round((utc(b) - utc(a)) / 86400000);
}

export function startOfWeek(dateString: string): string {
    const [y, m, d] = dateString.split('-').map(Number);
    return addDays(dateString, -new Date(y, m - 1, d).getDay());
}

export function fromDateString(dateString: string): Date {
    const [y, m, d] = dateString.split('-').map(Number);
    return new Date(y, m - 1, d);
}

const pad = (n: number) => String(n).padStart(2, '0');

export function toTimeString(d: Date): string {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromTimeString(time: string): Date {
    const [h, min] = time.split(':').map(Number);
    const d = new Date();
    d.setHours(h, min, 0, 0);
    return d;
}

export function addMinutes(time: string, minutes: number): string {
    const [h, m] = time.split(':').map(Number);
    const total = Math.max(0, Math.min(h * 60 + m + minutes, 23 * 60 + 59));
    return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}