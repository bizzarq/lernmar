/**
 * The state of a course activity.
 * @property {boolean} mandatory whether the activity is mandatory.
 * @property {boolean} complete whether activity was completed.
 * @property {boolean} success whether activity was completed with success. the course itself needs
 *   to decide whether an unsuccessful activity can be re-taken or not.
 * @property {number} score score achieved. must be >= 0. if omitted, no score is recorded.
 * @property {number} maxScore: maximum score possible for this activity. must be >= score.
 */
type ActivityState =
  { mandatory: boolean, complete: false } |
  { mandatory: boolean, complete: false, score: number, maxScore: number } |
  { mandatory: boolean, complete: true, success: boolean } |
  { mandatory: boolean, complete: true, success: boolean, score: number, maxScore: number };

function isActivityState(state: any): state is ActivityState {
  if (state.complete && typeof state.success !== "boolean") {
    return false;
  }
  else if (typeof state.score === "number" && typeof state.maxScore !== "number") {
    return false;
  }
  return true;
}


export type { ActivityState };
export { isActivityState as isActivityState};
