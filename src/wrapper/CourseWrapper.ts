import type { CourseActivityState } from "./CourseActivityState";
import type { CourseProgress } from "./CourseProgress";


interface Learner {
  readonly id: string,
  readonly name: string,
}

/**
 * statistics of course progress.
 * @property {number} activityCount number of started activities.
 * @property {number} mandatoryCount number of started mandatory activities.
 * @property {number} completeCount number of started mandatory activities completed.
 * @property {number} successCount number of started mandatory activities completed successfully.
 */
interface CourseStatistics {
  activityCount: number;
  mandatoryCount: number;
  completeCount: number;
  successCount: number;
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
   * report course progress to the Learn Management System.
   * @param progress progress of course execution.
   */
  reportProgress(progress: CourseProgress): Promise<void>;

  /**
   * @return statistics from the activity states reported.
   */
  statistics(): CourseStatistics;

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
  setActivityState(name: string, state: CourseActivityState): Promise<void>;

  /**
   * get the current state of an activity (e.g. a chapter or a slide). this includes also
   * information from previouse sessions (if they had been recorded).
   * @param name name of activity.
   * @returns the activity state or null if state is not known.
   */
  getActivityState(name: string): Promise<CourseActivityState | null>;
}


export type { CourseWrapper, CourseStatistics, Learner };
