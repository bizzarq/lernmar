import type { ActivityState } from "./ActivityState";
import type { CourseWrapper, Learner } from "./CourseWrapper";


/**
 * A standalone course wrapper that does not interact with any LMS.
 */
class CourseWrapperStandalone implements CourseWrapper {
  #learner;
  #activityStates: Record<string, ActivityState>;
  #currentActivity: string | null;
  #courseState: ActivityState;

  constructor(learner?: Learner) {
    if (!learner) {
      learner = {id: "", name: ""};
    }
    this.#learner = learner;
    this.#activityStates = {};
    this.#currentActivity = null;
    this.#courseState = { progress: 0 };
  }

  /**
   * callback for when the course is started.
   */
  onStart: (() => void) | undefined;

  /**
   * callback for when the course is stopped.
   */
  onStop: (() => void) | undefined;

  async start(): Promise<void> {
    this.onStart?.();
  }

  async stop(): Promise<void> {
    this.onStop?.();
  }

  async getLearner() {
    return this.#learner;
  }

  async setCurrentActivity(name: string): Promise<void> {
    this.#currentActivity = name;
  }

  async getCurrentActivity(): Promise<string | null> {
    return this.#currentActivity;
  }

  async getActivityStates(): Promise<Record<string, ActivityState>> {
    return {...this.#activityStates};
  }

  async getActivityState(name: string): Promise<ActivityState | null> {
    let activityState = this.#activityStates[name];
    if (activityState) {
      return activityState;
    }
    return null;
  }

  async setActivityState(name: string, state: ActivityState): Promise<void> {
    this.#activityStates[name] = state;
  }

  async setCourseState(state: ActivityState): Promise<void> {
    this.#courseState = state;
  }

  async getCourseState(): Promise<ActivityState> {
    return this.#courseState;
  }

}


export { CourseWrapperStandalone };
