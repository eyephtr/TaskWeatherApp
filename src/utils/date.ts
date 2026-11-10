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