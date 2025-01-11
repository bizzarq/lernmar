/**
 * The state of a course activity.
 * @property {number} progress progress of activity as a value between 0 (not started) and 1 (completed).
 * @property {boolean} success whether activity was completed with success. all mandatory
 *   activities must be completed successfully for the course to be successful. the course
 *   itself needs to decide whether an unsuccessful activity can be re-taken or not.
 * @property {number} score score achieved. must be >= 0. if omitted, no score is recorded.
 * @property {number} maxScore: maximum score possible for this activity. must be >= score.
 */
type ActivityState =
  { progress: number, success?: boolean } |
  { progress: number, success?: boolean, score: number, maxScore: number };

function isActivityState(state: any): state is ActivityState {
  if (typeof state.progress !== "number") {
    return false;
  }
  if (!("success" in state && typeof state.success === "boolean")) {
    return false;
  }
  else if (typeof state.score === "number" && typeof state.maxScore !== "number") {
    return false;
  }
  return true;
}


export type { ActivityState };
export { isActivityState as isActivityState};
