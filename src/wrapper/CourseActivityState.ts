/**
 * The state of a course activity.
 * @param complete whether activity was completed.
 * @param success whether activity was completed with success. the course itself needs to decide
 *    whether an unsuccessful activity can be re-taken or not. default value is true.
 * @param score score achieved. if given must be >= 0. if omitted, no score is recorded.
 * @param maxScore: maximum score possible for this activity. must be >= score.
 */
type CourseActivityState =
  { complete: false } |
  { complete: false, score: number, maxScore: number } |
  { complete: true, success: boolean } |
  { complete: true, success: boolean, score: number, maxScore: number };

function isCourseActivityState(state: any): state is CourseActivityState {
  if (state.complete && typeof state.success !== "boolean") {
    return false;
  }
  else if (typeof state.score === "number" && typeof state.maxScore !== "number") {
    return false;
  }
  return true;
}


export type { CourseActivityState };
export { isCourseActivityState};
