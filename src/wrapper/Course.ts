import { Activity } from "./Activity";
import { ActivityState } from "./ActivityState";
import { CourseWrapper } from "./CourseWrapper";


type CoursePart = Activity | Course;

function isActivity(part: CoursePart): part is Activity {
  return "isMandatory" in part;
}

/**
 * standard implementation of a lernmar course. a course is a collection of course activities which
 * are executed one after the other. courses can contain other courses. In this case, each of the
 * parts (activities and sub-courses) need a unique name.
 *
 * This implementation assumes a linear execution in which every activity is only executed once
 * (even if activities are not completed).
 */
class Course {
  readonly name: string;
  readonly mandatoryActivities: number;
  readonly maxScore: number;
  readonly successThreshold: number;
  #parts: Array<CoursePart>;

  /**
   * constructor.
   * @param parts parts of the course (activities and sub-courses).
   * @param name name of the course (default: "Main Course"). must be unique if course is a
   *   sub-course.
   */
  constructor(parts: Array<CoursePart>, name: string = "Main Course") {
    this.name = name;
    this.mandatoryActivities = 0;
    this.maxScore = 0;
    this.successThreshold = 0.8;
    this.#parts = [];
    for (let part of parts) {
      if (!part.name || part.name.includes(".")) {
        console.error(`ignore invalid activity name ${part.name}`);
        continue;
      }
      this.#parts.push(part);
      if (isActivity(part)) {
        if (part.isMandatory) {
          this.mandatoryActivities++;
        }
        if (part.maxScore) {
          this.maxScore += part.maxScore;
        }
      } else {
        this.mandatoryActivities += part.mandatoryActivities;
        this.maxScore += part.maxScore;
      }
    }
  }

  /**
   * event handler for progress inside the course (whenever an activity is completed).
   * @param state new course state.
   */
  onProgress(state: ActivityState): void {};

  /**
   * prepare the course (e.g. by loading resources).
   * - currently, only the first activity is prepared for avoiding bottle necks.
   */
  async prepare(): Promise<void> {
    this.#parts[0]?.prepare?.();
  }

  /**
   * execute the activities of this course. 
   */
  async execute(section: HTMLElement, wrapper: CourseWrapper): Promise<void> {
    await wrapper.start();
    let state = await this.execute2(section, wrapper, "");
    await wrapper.setCourseState(state);
    await wrapper.stop();
  }

  private async execute2(
    section: HTMLElement, wrapper: CourseWrapper, path: string = "",
  ): Promise<ActivityState> {
    let macos = 0; // number of mandatory activities completed
    let score = 0; // overall score
    let success = true;
    let courseState: ActivityState = {progress: 1, success};
    for (let [partId, part] of this.#parts.entries()) {
      let preparePromise = this.#parts[partId + 1]?.prepare?.();
      let subPath = path == "" ? part.name : `${path}.${part.name}`;
      if (isActivity(part)) {
        let state = await this.#executeActivity(part, section, wrapper, subPath);
        if (part.isMandatory) {
          macos += state.progress;
          success &&= state.success === true;
        }
        if ("score" in state) score += state.score;
      }
      else {
        let state = await part.execute2(section, wrapper, subPath);
        macos += Math.round(state.progress * part.mandatoryActivities);
        success &&= state.success === true;
        if ("score" in state) score += state.score;
      }
      courseState = this.#calculateState(macos, score, success);
      this.onProgress(courseState);
      await preparePromise;
    }
    return courseState;
  }

  #calculateState(macos: number, score: number, success: boolean): ActivityState {
    let progress = this.mandatoryActivities > 0 ? macos / this.mandatoryActivities : 1;
    if (progress >= 1) {
      if (this.maxScore > 0) {
        success = success && score >= this.successThreshold * this.maxScore;
        return {progress, success, score, maxScore: this.maxScore};
      }
      return {progress, success};
    }
    if (this.maxScore > 0) {
      return {progress, score, maxScore: this.maxScore};
    }
    return {progress}
  }

  async #executeActivity(
    activity: Activity, section: HTMLElement, wrapper: CourseWrapper, path: string
  ) {
    let wrapperPromise = wrapper.setCurrentActivity(path);
    let state;
    try {
      state = await activity.execute(section);
    }
    catch (error) {
      console.error(`unexpected error in activity ${path}`);
      if (activity.maxScore === undefined) {
        state = {progress: 0};
      }
      else {
        state = {progress: 0, score: 0, maxScore: activity.maxScore};
      }
    }
    try {
      await wrapperPromise;
      await wrapper.setActivityState(path, state);
    }
    catch {
      // ignore wrapper errors
    }
    return state;
  }

}


export { Course };