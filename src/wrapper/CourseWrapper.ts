import type { ActivityState } from "./ActivityState";


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
   */
  stop(): Promise<void>;

  /**
   * get the learner data (id and name).
   * @return learner data.
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
  setActivityState(name: string, state: ActivityState): Promise<void>;

  /**
   * get the state of all activities (e.g. chapters or slides) whose activity has been reported.
   * this includes also information from previous sessions (if they had been recorded).
   * @returns and object mapping activity names to their states.
   */
  getActivityStates(): Promise<Record<string, ActivityState>>

  /**
   * get the current state of an activity (e.g. a chapter or a slide).
   * this includes also information from previous sessions (if they had been recorded).
   * @param name name of activity.
   * @returns the activity state or null if state is not known.
   */
  getActivityState(name: string): Promise<ActivityState | null>;

  /**
   * sets the current state of the course.
   * @param state current state of course.
   */
  setCourseState(state: ActivityState): Promise<void>;

  /**
   * gets the current state of the course. this can also be from a previous session.
   * @returns the current state of the course.
   */
  getCourseState(): Promise<ActivityState>;

}


export type { CourseWrapper, Learner };
