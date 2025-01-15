import { CourseWrapper2004_4 } from "./CourseWrapper2004_4";
import type { CourseWrapper } from "./CourseWrapper";
import type { ActivityState } from "./ActivityState";


/**
 * Digital course which can be executed by an exector
 */
interface ExecutableCourse {

  /**
   * execute an activity of the course. this could be an unfinished activity from a previous
   * session which was interrupted or an activity suggested by a call to nextActivity(). There is
   * a special activity, "intro" which (is if it exists) executed at the beginning of the course).
   * @param name name of activity. if the name does not exist, the function should just return with
   * a { mandatory: false, complete: true, success: false } activity state.
   */
  executeActivity(name: string): Promise<ActivityState>;

  /**
   * set the state of a sub-set of the course activities.
   * if there is a previous session which was interrupted, the executor might call this function in
   * the beginning (during or shortly after the intro) for re-setting the course to the state before
   * the interruption. the course can choose to ignore this call (e.g. after user confirmation).
   * @param states map of activity names to their states.
   */
  setActivityStates(states: Record<string, ActivityState>): void;

  /**
   * @returns the state of the course. the course state must represent the state of its activities:
   *   - a course can only be non-mandatory if all of its activities are non-mandatory.
   *   - a course can only be complete if all its mandatory activities are complete.
   *   - a course can only be successful if all its mandatory activities are successful.
   *   - score and maxScore of the course state are the sum of the scores and maxScores its activities.
   */
  courseState(): ActivityState;

  /**
   * finalize the course before it is closed.
   */
  finalize?(): Promise<void>;

  /**
   * determine the next activity to execute in this course. the activities can be offered in any
   * order as long as all activities are offered once. the executor will only execute activities
   * which are not complete yet.
   * @return name of next activity. empty string if there is no activity left.
   */
  nextActivity(): string;

}

/**
 * Executer of digital courses. The executor should work in any learn management system given than
 * there is a CourseWrapper which adapts the interfaces.
 */
class CourseExecutor{
  readonly wrapper: CourseWrapper;
  readonly course: ExecutableCourse;
  #maxExecutions: number; // maximum number of executions of the same activity

  constructor(course: ExecutableCourse, wrapper?: CourseWrapper) {
    this.course = course;
    this.wrapper = wrapper ? wrapper : new CourseWrapper2004_4();
    this.#maxExecutions = 3;
  }

  async execute() {
    let introName = "intro";
    let introPromise = this.course.executeActivity(introName);

    await this.wrapper.start();
    let activityStates = await this.wrapper.getActivityStates();
    this.course.setActivityStates(activityStates);
    let name = (await this.wrapper.getCurrentActivity()) || this.course.nextActivity();

    await this.#processState(introName, introPromise);
    let executions: Record<string, number> = {introName: 1};

    while (name) {
      // avoid endless loop if the course repeatedly returns the same activities
      // by setting a limit of executions per activity
      if (name in executions) {
        if (executions[name] >= this.#maxExecutions) {
          console.log(`max executions ${this.#maxExecutions} reached for activity ${name}`);
          break;
        }
        executions[name]++;
      }
      else {
        executions[name] = 1;
      }
      let statePromise = this.course.executeActivity(name);
      await this.wrapper.setCurrentActivity(name);
      await this.#processState(name, statePromise);
      name = this.course.nextActivity();
    }

    await this.course.finalize?.();
    await this.wrapper.stop();
  }

  async #processState(name: string, statePromise: Promise<ActivityState>) {
    let state = await statePromise;
    let setStatePromise = this.wrapper.setActivityState(name, state);
    let courseState = this.course.courseState();
    await setStatePromise;
    await this.wrapper.setCourseState(courseState);
  }
}


export { CourseExecutor };
export type { ExecutableCourse };
