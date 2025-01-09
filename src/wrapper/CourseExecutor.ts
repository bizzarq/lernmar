import { CourseWrapper2004_4 } from "./CourseWrapper2004_4";
import type { CourseWrapper } from "./CourseWrapper";
import type { ActivityState } from "./ActivityState";
import type { CourseProgress } from "./CourseProgress";


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
   * @return number of mandatory activities in this course. this number is needed to calculate
   * the progress of the course.
   */
  mandatoryActivities(): number;

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

  constructor(course: ExecutableCourse, wrapper?: CourseWrapper) {
    this.course = course;
    this.wrapper = wrapper ? wrapper : new CourseWrapper2004_4();
  }

  async execute() {
    let name = "intro";
    let introPromise = this.course.executeActivity(name);
    await this.wrapper.start();
    await this.#processState(name, introPromise);

    name = (await this.wrapper.getCurrentActivity()) || this.course.nextActivity();

    while (name) {
      let state = await this.wrapper.getActivityState(name);
      if (state == null || !state.complete) {
        let statePromise = this.course.executeActivity(name);
        await this.wrapper.setCurrentActivity(name);
        await this.#processState(name, statePromise);
        name = this.course.nextActivity();
      }
    }

    await this.course.finalize?.();
    await this.wrapper.stop();
  }

  async #processState(name: string, statePromise: Promise<ActivityState>) {
    let state = await statePromise;
    let setStatePromise = this.wrapper.setActivityState(name, state);
    let mandatory = this.course.mandatoryActivities();
    let statistics = this.wrapper.statistics();
    let progress: CourseProgress;
    if (mandatory <= 0) {
      progress = {progress: 0, success: false};
    }
    else if (statistics.completeCount < mandatory) {
      progress = {progress: statistics.completeCount / mandatory, success: false };
    }
    else {
      progress = {progress: 1, success: statistics.successCount == mandatory}
    }
    await setStatePromise;
    await this.wrapper.reportProgress(progress);
  }
}


export { CourseExecutor };
export type { ExecutableCourse };
