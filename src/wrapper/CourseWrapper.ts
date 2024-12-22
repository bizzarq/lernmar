import { CourseActivityState } from "./CourseActivityState";

interface Learner {
  readonly id: string,
  readonly name: string,
}


/**
 * A wrapper around a digital course which connects to a learn management system like SCORM.
 */
interface CourseWrapper {

  /**
   * start the course. calling this function is optional.
   */
  start(): Promise<void>;

  /**
   * stop the course and hand over to the Learn Management System.
   * @param progress the progress inside the course as a number between 0 (not started) and 1
   *   (complete). if omitted, no progress will be reported to the LMS.
   * @param success whether the course was completed successfully.
   *  ignored if progress is undefined, overwritten with false if progress < 1.
   *  if undefined set to progress == 1.
   */
  stop(progress?: number, success?: boolean): Promise<void>;

  /**
   * report course progress to the Learn Management System.
   * @param progress the progress inside the course as a number between 0 (not started) and 1
   *   (complete).
   * the other functions is called.
   * @param success whether the course was completed successfully. overwritten with false if 
   * progress < 1. if undefined set to progress == 1.
   */
  reportProgress(progress: number, success?: boolean): Promise<void>;

  /**
   * get the learner data (id and name).
   */
  getLearner(): Promise<Learner>;

  /**
   * sets the current course activity (e.g. a chapter or a slide). calling this function is not
   * required. however, if it is not called, it will not be possible to resume sessions at the
   * activity it was interrupted before.
   * @param name: name of activity (must be unique).
   */
  setCurrentActivity(name: string): Promise<void>;

  /**
   * @returns the name of last current activity registered with setCurrentActivity() or null if
   *  there is no current activity registered.
   */
  getCurrentActivity(): Promise<string | null>;

  /**
   * set the state of an activity (e.g. a chapter or a slide).
   * @param name name of activity (must be unique).
   * @param state state of the activity.
   */
  setActivityState(name: string, state: CourseActivityState): Promise<void>;

  /**
   * get the current state of an activity (e.g. a chapter or a slide). this includes also
   * information from previouse sessions (if they had been recorded).
   * @param name name of activity.
   * @returns the activity state.
   */
  getActivityState(name: string): Promise<CourseActivityState>;
}


export { CourseWrapper };
