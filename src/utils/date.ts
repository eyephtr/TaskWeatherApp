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