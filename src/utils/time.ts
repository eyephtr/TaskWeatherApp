export function formatUpdatedAgo(fetchedAt: number, now: number): string {
    const minutes = Math.floor(Math.max(0, now - fetchedAt) / 60000);
    if (minutes < 1) {
        return 'Updated just now';
    }
    if (minutes < 60) {
        return `Updated ${minutes} min ago`;
    }
    const hours = Math.floor(minutes / 60);
    return `Updated ${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
}