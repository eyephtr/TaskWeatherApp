export function isFresh(fetchedAt: number, now: number, ttlMs: number): boolean {
    const age = now - fetchedAt;
    return age >= 0 && age < ttlMs;
}