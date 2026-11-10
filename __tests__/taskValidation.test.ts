import { hasErrors, isValidDate, validateTaskInput } from '../src/utils/taskValidation';
import type { TaskInput } from '../src/types/task';

const valid: TaskInput = {
    title: 'Write report',
    date: '2026-11-10',
    start: '09:00',
    end: '10:00',
    priority: 'high',
};

describe('validateTaskInput', () => {
    it('accepts a valid input', () => {
        expect(hasErrors(validateTaskInput(valid))).toBe(false);
    });

    it('rejects an empty or whitespace title', () => {
        expect(validateTaskInput({ ...valid, title: '' }).title).toBeDefined();
        expect(validateTaskInput({ ...valid, title: '   ' }).title).toBeDefined();
    });

    it('rejects an end time that is not after the start time', () => {
        expect(validateTaskInput({ ...valid, end: '08:00' }).end).toBeDefined();
        expect(validateTaskInput({ ...valid, end: '09:00' }).end).toBeDefined();
    });

    it('allows a missing end time', () => {
        expect(hasErrors(validateTaskInput({ ...valid, end: undefined }))).toBe(false);
    });

    it('rejects malformed times', () => {
        expect(validateTaskInput({ ...valid, start: '25:00' }).start).toBeDefined();
    });
});

describe('isValidDate', () => {
    it('rejects dates that do not exist', () => {
        expect(isValidDate('2026-02-30')).toBe(false);
        expect(isValidDate('2026-13-01')).toBe(false);
        expect(isValidDate('10/11/2026')).toBe(false);
    });

    it('accepts real dates', () => {
        expect(isValidDate('2028-02-29')).toBe(true);
    });
});