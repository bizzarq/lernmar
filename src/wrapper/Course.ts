import type { ActivityState } from "./ActivityState";
import type { ExecutableCourse } from "./CourseExecutor";


interface CourseActivity {
  readonly name: string;
  readonly isMandatory: boolean;
  execute(section: HTMLElement): Promise<ActivityState>;
}


class Course implements ExecutableCourse {
  #section;
  #nameActivities: Record<string, CourseActivity>;
  #incompletes: Array<string>;
  #incompleteId: number;
  #mandatoryActivities;

  /**
   * constructor
   * @param section HTML element the activities can insert their content.
   * @param activities activities, the course consist of. the names of the activities must be
   *   unique. the name "intro" is reserved for activities which are called in the very beginning
   *   (before the connection to the learn management system is completely established).
   */
  constructor(section: HTMLElement, activities: Array<CourseActivity>) {
    this.#section = section;
    this.#nameActivities = {};
    this.#incompletes = [];
    this.#incompleteId = 0;
    this.#mandatoryActivities = 0;
    for (let activity of activities) {
      if (activity.name in this.#nameActivities) {
        console.error(`ignore duplicate activity ${activity.name}`);
        continue;
      }
      this.#nameActivities[activity.name] = activity;
      this.#incompletes.push(activity.name);
      if (activity.isMandatory) {
        this.#mandatoryActivities++;
      }
    }
  }

  async executeActivity(name: string): Promise<ActivityState> {
    let activity = this.#nameActivities[name];
    if (activity) {
      let state = await activity.execute(this.#section);
      if (state.complete) {
        // if activity was complete, remove it from activity list.
        // the incompleteId will then point to the next incomplete activity (or behind the end).
        let incompleteId = this.#incompletes.indexOf(name);
        if (incompleteId >= 0) {
          this.#incompletes.splice(incompleteId, 1);
        }
      }
    }
    return { mandatory: false, complete: true, success: false };
  }

  mandatoryActivities(): number {
    return this.#mandatoryActivities;
  }

  async finalize(): Promise<void> {}

  nextActivity(): string {
    if (this.#incompletes.length > 0) {
      if (this.#incompleteId >= this.#incompletes.length) {
        // if the last incomplete was deleted, the id points behind the last id.
        // in this case, we re-start with the first incomplete.
        this.#incompleteId = 0;
      }
      return this.#incompletes[this.#incompleteId];
    }
    // no incompletes left, return empty string for informing that course is complete.
    return "";
  }

}


export { Course };
