/**
 * Progress of course execution.
 * progress is a value between 0 and 1, 0 means not started, 1 means complete.
 * success can only be true if progress is 1.
 */
type CourseProgress = { progress: 1, success: true } | { progress: number; success: false };


export type { CourseProgress };
