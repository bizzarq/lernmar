import { Activity } from "./Activity";
import type { ActivityState } from "./ActivityState";
import type { ExecutableCourse } from "./CourseExecutor";


type CoursePart = Activity | Course;

function isActivity(part: CoursePart): part is Activity {
  return "isMandatory" in part;
}


/**
 * standard implementation of a lernmar course. A course is a collection of activities which can
 * be executed by a course executer. courses can contain other courses. In this case, each of the
 * parts (activities and sub-courses) need a unique name.
 */
class Course implements ExecutableCourse {
  readonly name: string;
  #section;
  #nameParts: Record<string, CoursePart>;
  #incompletes: Array<CoursePart>;
  #incompleteId: number;
  #mandatoryActivities;
  #namePattern = /^([^\.]+)\.?(.*)$/

  /**
   * constructor.
   * @param section HTML element the activities can insert their content.
   * @param parts activities, the course consist of. the names of the activities must be
   *   unique. the name "intro" is reserved for activities which are called in the very beginning
   *   (before the connection to the learn management system is completely established).
   * @param name name of the course. Must be unique when course is part of a larger course.
   *   default name is "Main Course".
   */
  constructor(section: HTMLElement, parts: Array<CoursePart>, name?: string) {
    this.name = name === undefined ? "Main Course": name;
    this.#section = section;
    this.#nameParts = {};
    this.#incompletes = [];
    this.#incompleteId = 0;
    this.#mandatoryActivities = 0;
    for (let part of parts) {
      if (part.name in this.#nameParts) {
        console.error(`ignore duplicate activity ${part.name}`);
        continue;
      }
      this.#nameParts[part.name] = part;
      this.#incompletes.push(part);
      if (isActivity(part)) {
        if (part.isMandatory) {
          this.#mandatoryActivities++;
        }
      }
      else {
        this.#mandatoryActivities += part.mandatoryActivities();
      }
    }
  }

  async executeActivity(name: string): Promise<ActivityState> {
    let match = name.match(this.#namePattern);
    if (match) {
      let nameHead = match[1];
      let nameTail = match[2]; // should be empty for activities
      let part = this.#nameParts[nameHead];
      if (part) {
        if (isActivity(part)) {
          let state = await part.execute(this.#section);
          if (state.complete) {
            // if activity was complete, remove it from activity list.
            // the incompleteId will then point to the next incomplete activity (or behind the end).
            let incompleteId = this.#incompletes.indexOf(part);
            if (incompleteId >= 0) {
              this.#incompletes.splice(incompleteId, 1);
            }
          }
          return state;
        }
        else {
          // whether sub-course is complete will be visible at next nextActivity call.
          return await part.executeActivity(nameTail)
        }
      }
    }
    // if name could not be matched
    return { mandatory: false, complete: true, success: false };
  }

  mandatoryActivities(): number {
    return this.#mandatoryActivities;
  }

  async finalize(): Promise<void> {}

  nextActivity(): string {
    while (this.#incompletes.length > 0) {
      if (this.#incompleteId >= this.#incompletes.length) {
        // if the last incomplete was deleted, the id points behind the last id.
        // in this case, we re-start with the first incomplete.
        this.#incompleteId = 0;
      }
      let part = this.#incompletes[this.#incompleteId];
      if (isActivity(part)) {
        return part.name;
      }
      else {
        let name = part.nextActivity();
        if (name === "") {
          // if sub-course is complete call finalize and deleted it from incomplete list
          part?.finalize();
          let incompleteId = this.#incompletes.indexOf(part);
          if (incompleteId >= 0) {
            this.#incompletes.splice(incompleteId, 1);
          }
          // as sub-course was complete we need to find another next Activity (continue loop)
          continue;
        }
        return `${part.name}.${name}`;
      }
    }
    // no incompletes left, return empty string for informing that course is complete.
    return "";
  }

}


export { Course };
