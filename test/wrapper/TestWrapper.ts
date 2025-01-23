import { ActivityState } from "../../src/wrapper/ActivityState";
import { CourseWrapper, Learner } from "../../src/wrapper/CourseWrapper";


type Call = "start" | "stop" | "getLearner" |
  ["setCurrentActivity", string] | "getCurrentActivity" |
  ["setActivityState", string, ActivityState] | "getActivityStates" | ["getActivityState", string] |
  ["setCourseState", ActivityState] | "getCourseState";

/**
 * wrapper for testing purposes.
 * it records all calls to its methods.
 */
class TestWrapper implements CourseWrapper {
  calls: Array<Call> = [];
  learner: Learner;
  activityStates: Record<string, ActivityState> = {};
  courseState: ActivityState = {progress: 0};

  constructor(learner?: Learner) {
    this.learner = learner ? learner : {id: "", name: ""};
  }

  /**
   * clear the recorded calls.
   */
  clearCalls() {
    this.calls.length = 0;
  }

  async start() {
    this.calls.push("start");
  }

  async stop() {
    this.calls.push("stop");
  }

  async getLearner() {
    this.calls.push("getLearner");
    return this.learner;
  }

  async setCurrentActivity(name: string) {
    this.calls.push(["setCurrentActivity", name])
  }

  async getCurrentActivity() {
    this.calls.push("getCurrentActivity");
    return null;
  }

  async setActivityState(name: string, state: ActivityState) {
    this.calls.push(["setActivityState", name, state]);
    this.activityStates[name] = state;
  }

  async getActivityStates(): Promise<Record<string, ActivityState>> {
    this.calls.push("getActivityStates");
    return {...this.activityStates};
  }

  async getActivityState(name: string): Promise<ActivityState | null> {
    this.calls.push(["getActivityState", name]);
    return this.activityStates[name] || null;
  }

  async setCourseState(state: ActivityState): Promise<void> {
    this.calls.push(["setCourseState", state]);
    this.courseState = state;
  }

  async getCourseState(): Promise<ActivityState> {
    this.calls.push("getCourseState");
    return this.courseState;
  }

}


export { TestWrapper };