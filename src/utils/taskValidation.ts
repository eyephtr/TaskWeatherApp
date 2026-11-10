import type { TaskInput, ValidationErrors } from '../types/task';

export const TITLE_MAX = 100;
export const TAG_MAX = 20;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidDate(value: string): boolean {
    if (!DATE_RE.test(value)) {
        return false;
    }
    const [y, m, d] = value.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

export const isValidTime = (value: string) => TIME_RE.test(value);

export function validateTaskInput(input: TaskInput): ValidationErrors {
    const errors: ValidationErrors = {};

    const title = input.title.trim();
    if (!title) {
        errors.title = 'Title is required';
    } else if (title.length > TITLE_MAX) {
        errors.title = `Title must be ${TITLE_MAX} characters or fewer`;
    }

    if (!isValidDate(input.date)) {
        errors.date = 'Pick a valid date';
    }

    if (!isValidTime(input.start)) {
        errors.start = 'Pick a valid start time';
    }

    if (input.end) {
        if (!isValidTime(input.end)) {
            errors.end = 'Pick a valid end time';
        } else if (!errors.start && input.end <= input.start) {
            errors.end = 'End time must be after the start time';
        }
    }

    if (input.tag && input.tag.trim().length > TAG_MAX) {
        errors.tag = `Tag must be ${TAG_MAX} characters or fewer`;
    }

    return errors;
}

export const hasErrors = (errors: ValidationErrors) => Object.keys(errors).length > 0;