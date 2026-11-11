import { formatUpdatedAgo } from '../src/utils/time';

const MIN = 60 * 1000;

describe('formatUpdatedAgo', () => {
    it('says just now under a minute, and never goes negative', () => {
        expect(formatUpdatedAgo(0, 30 * 1000)).toBe('Updated just now');
        expect(formatUpdatedAgo(5 * MIN, 0)).toBe('Updated just now');
    });

    it('uses minutes under an hour', () => {
        expect(formatUpdatedAgo(0, 5 * MIN)).toBe('Updated 5 min ago');
        expect(formatUpdatedAgo(0, 59 * MIN)).toBe('Updated 59 min ago');
    });

    it('uses hours from one hour', () => {
        expect(formatUpdatedAgo(0, 60 * MIN)).toBe('Updated 1 hour ago');
        expect(formatUpdatedAgo(0, 125 * MIN)).toBe('Updated 2 hours ago');
    });
});