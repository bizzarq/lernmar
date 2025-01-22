import { Activity } from "./Activity";
import { ActivityState } from "./ActivityState";
import { CourseWrapper } from "./CourseWrapper";

type CoursePart = Activity | Course;

function isActivity(part: CoursePart): part is Activity {
  return "isMandatory" in part;
}

/**
 * standard implementation of a lernmar course. A course is a collection of activities which can
 * be executed by a course executer. courses can contain other courses. In this case, each of the
 * parts (activities and sub-courses) need a unique name.
 *
 * The course assumes a linear execution in which every activity is only executed once (even if
 * activities are not completed).
 */
class Course {
  readonly name: string;
  readonly mandatoryActivities: number;
  readonly maxScore: number;
  #parts;

  constructor(parts: Array<CoursePart>, name: string = "Main Course") {
    this.#parts = parts;
    this.name = name;
    this.mandatoryActivities = 0;
    this.maxScore = 0;
    for (let part of parts) {
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
   * prepare the course (e.g. by loading resources).
   * - currently, only the first activity is prepared for avoiding bottle necks.
   */
  async prepare(): Promise<void> {
    this.#parts[0]?.prepare?.();
  }

  /**
   * execute the course. 
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
    for (let [partId, part] of this.#parts.entries()) {
      let preparePromise = this.#parts[partId + 1]?.prepare?.();
      let subPath = path == "" ? part.name : `${path}.${part.name}`;
      if (isActivity(part)) {
        let state = await this.#executeActivity(part, section, wrapper, subPath);
        if (part.isMandatory) macos += state.progress; 
        if ("score" in state) score += state.score;
      }
      else {
        let state = await part.execute2(section, wrapper, subPath);
        macos += Math.round(state.progress * part.mandatoryActivities);
        if ("score" in state) score += state.score;
      }
      await preparePromise;
    }
    let progress = this.mandatoryActivities > 0 ? macos / this.mandatoryActivities : 1;
    return this.maxScore ? {progress, score, maxScore: this.maxScore} : {progress};
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