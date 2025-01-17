import { Activity } from "./Activity";
import type { ActivityState } from "./ActivityState";
import type { ExecutableCourse } from "./CourseExecutor";
import { WaitingIntroActivity } from "./WaitingIntroActivity";


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
  #parts: Record<string, CoursePart>;
  #activityStates: Record<string, ActivityState>;
  #incompletes: Array<CoursePart>;
  #incompleteId: number;
  #mandatoryActivities;
  #namePattern = /^([^\.]+)\.?(.*)$/;

  /**
   * constructor.
   * @param section HTML element the activities can insert their content.
   * @param parts activities, the course consist of. the names of the activities must be
   *   unique and cannot contain dots in their names. the name "intro" is reserved for activities
   *   which are called in the very beginning (before the connection to the learn management system
   *   is completely established).
   * @param name name of the course. Must be unique when course is part of a larger course.
   *   default name is "Main Course".
   */
  constructor(section: HTMLElement, parts: Array<CoursePart>, name?: string) {
    this.name = name === undefined ? "Main Course": name;
    this.#section = section;
    this.#parts = {};
    this.#activityStates = {};
    this.#incompletes = [];
    this.#incompleteId = 0;
    this.#mandatoryActivities = 0;
    for (let part of parts) {
      if (!part.name || part.name.includes(".")) {
        console.error(`ignore invalid activity name ${part.name}`);
        continue;
      }
      if (part.name in this.#parts) {
        console.error(`ignore duplicate activity ${part.name}`);
        continue;
      }
      this.#parts[part.name] = part;
      if (part.name !== "intro") {
        // intro will not be listed in incompletes to avoid having it as next activity
        this.#incompletes.push(part);
      }
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
   let [resultPromise, successor] = this.executeActivity2(name);
    successor?.prepare?.();
    return await resultPromise;
  }

  /**
   * executes an activity and retrieves its next incomplete successor in the course.
   * @param name name of activity
   * @returns result of activity execution and its incomplete successor.
   *  - successor is null if there is no incomplete activity left.
   */
  private executeActivity2(name: string): [Promise<ActivityState>, Activity | null] {
    let match = name.match(this.#namePattern);
    if (match) {
      let nameHead = match[1];
      let nameTail = match[2];
      let part = this.#parts[nameHead];
      if (!part) {
        if (nameHead === "intro") {
          let nextActivity = this.nextActivity2()[1];
          let prepare = nextActivity?.prepare?.bind(nextActivity);
          if (prepare) {
            // if there is no intro but next activity needs preparation, make an intro for it
            let intro = new WaitingIntroActivity(prepare);
            return [intro.execute(this.#section), this.nextActivity2()[1]];
          }
        }
        // if activity is not found, return success=false
        return [Promise.resolve({progress: 1, success: false}), this.nextActivity2()[1]];
      }

      let resultPromise: Promise<ActivityState>;
      let successor: Activity | null = null;
      if (isActivity(part)) {
        resultPromise = part.execute(this.#section);
        resultPromise.then((state) => {
          // store result of activity
          this.#activityStates[nameHead] = state;
          if (state.progress >= 1) {
            this.#markcomplete(part);
          }
        }).catch(() => {
          console.error(`error executing activity ${part.name} in ${this.name}`);
        })
      }
      else {
        [resultPromise, successor] = part.executeActivity2(nameTail);
      }
      successor = this.#ensureSuccessor(part, successor);
      return [resultPromise, successor];
    }
    throw new Error(`invalid activity name ${name}`);
  }

  #ensureSuccessor(part: CoursePart, successor: Activity | null) {
    if (successor === null && this.#incompletes.length > 0) {
      let successorId: number | undefined;
      if (part) {
        let incompleteId = this.#incompletes.indexOf(part);
        if (incompleteId >= 0) {
          successorId = incompleteId + 1;
        }
      }
      successor = this.nextActivity2(successorId)[1];
      // if next activity is part to execute, there are no more incompletes, return null
      successor = successor !== part ? successor : null;
    }
    return successor;
  }

  setActivityStates(states: Record<string, ActivityState>): void {
    let subCourseStates: Record<string, [Course, Record<string, ActivityState>]> = {};
    for (let [name, state] of Object.entries(states)) {
      let match = name.match(this.#namePattern);
      if (match) {
        let nameHead = match[1];
        let nameTail = match[2];
        let part = this.#parts[nameHead];
        if (!part) {
          // ignore state for unknown activity
          continue;
        }
        if (isActivity(part)) {
          if (nameHead in this.#activityStates) {
            // ignore state for activity which was already executed
            continue;
          }
          this.#activityStates[nameHead] = state;
          if (state.progress >= 1) {
            this.#markcomplete(part);
          }
        }
        else {
          // collect sub-course activities in own objects
          if (!(nameHead in subCourseStates)) {
            subCourseStates[nameHead] = [part, {}];
          }
          subCourseStates[nameHead][1][nameTail] = state;
        }
      }
    }
    for (let [ course, states ] of Object.values(subCourseStates)) {
      course.setActivityStates(states);
    }
  }

  /**
   * @return number of mandatory activities in this course. this number is needed to calculate
   * the progress of the course.
   */
  mandatoryActivities(): number {
    return this.#mandatoryActivities;
  }

  courseState(): ActivityState {
    let mandatory = this.#mandatoryActivities > 0;
    let progressSum = 0;
    let success = true;
    let hasScore = false;
    let score = 0;
    let maxScore = 0;
    for (let [name, part] of Object.entries(this.#parts)) {
      let subResult;
      if (isActivity(part)) {
        // results of executed activities are stored in nameResults
        subResult = this.#activityStates[name];
        if (subResult === undefined) {
          // activity was not executed yet
          continue;
        }
        if (part.isMandatory) {
          progressSum += subResult.progress;
        }
      }
      else {
        // sub-courses have their own sub-results
        subResult = part.courseState();
        // need to consider mandatory activities of sub-courses for adjusted progress
        progressSum += Math.round(subResult.progress * part.mandatoryActivities());
      }
      // consider sub-success
      if (!isActivity(part) || part.isMandatory) {
        if (subResult.progress >= 1) {
          success &&= Boolean(subResult.success);
        }
      }
    // add sub-scores
      if ("score" in subResult) {
        hasScore = true;
        score += subResult.score;
        maxScore += subResult.maxScore;
      }
    }
    let result: ActivityState;
    // console.log(`${this.name}, ${this.#mandatoryActivities}, ${progressSum}`);
    if (this.#mandatoryActivities == 0 || progressSum >= this.#mandatoryActivities) {
      // course is complete.
      // make course successful only if score is at least 80% of maxScore
      success &&= !hasScore || (score >= maxScore * 0.8);
      result = {progress: 1, success};
    }
    else {
      // course is incomplete. success will not be set.
      result = {progress: progressSum / this.#mandatoryActivities};
    }
    if (hasScore) {
      // add score in both cases, complete and incomplete
      result = {...result, score, maxScore};
    }
    return result;
  }

  async finalize(): Promise<void> {}

  nextActivity(): string {
    return this.nextActivity2()[0];
  }

  /**
   * looks for the next incomplete activity in the course. the search starts at the given startId.
   * @param startId: id to start the search. if not given, the search starts at the first incomplete.
   * @returns a pair [name, activity] of the next incomplete activity.
   *  - name is empty string and activity is null if the course is complete.
   */
  private nextActivity2(startId?: number): [string, Activity] | ["", null] {
    if (startId === undefined) {
      startId = this.#incompleteId;
    }
    while (this.#incompletes.length > 0) {
      if (startId >= this.#incompletes.length) {
        startId = 0;
      }
      let part = this.#incompletes[startId];
      if (isActivity(part)) {
        return [part.name, part];
      }
      else {
        let [subName, subPart] = part.nextActivity2();
        if (subName === "") {
          // if sub-course is complete call finalize and deleted it from incomplete list
          part?.finalize();
          this.#markcomplete(part);
          // as sub-course was complete we need to find another next Activity (continue loop)
          continue;
        }
        return [`${part.name}.${subName}`, subPart] as [string, Activity];
      }
    }
    // no incompletes left, return empty string for informing that course is complete.
    return ["", null];
  }

  /**
   * mark part as complete (by removing it from the incomplete list) and set the incompleteId
   * to the next entry. do nothing if the part does not exist.
   * @param part part to mark as complete.
   */
  #markcomplete(part: CoursePart) {
    let incompleteId = this.#incompletes.indexOf(part);
    if (incompleteId >= 0) {
      this.#incompletes.splice(incompleteId, 1);
      this.#incompleteId = incompleteId == this.#incompletes.length ? 0 : incompleteId;
    }
  }

  /**
   * Prepares the activity after the next activity, i.e. that the activity loads resources needed.
   * This function will be called from executeActivity() for this course. However, if the next part
   * is a sub-course, the parent course needs to call it for the sub-course.
   * @returns a promise of name of the activity prepared or null if there was no activity to prepare.
   */
  private prepare(): Promise<string> | null {
    for (let i = 0; i <= this.#incompletes.length; i++) {
      let id = (this.#incompleteId + i) % this.#incompletes.length;
      let part = this.#incompletes[id];
      if (!isActivity(part)) {
        let result = part.prepare();
        if (result !== null) {
          // if the next part is a course and the course could prepare, return the name of the
          // with the course name as prefix.
          return new Promise((resolve, reject) => {
            result.then((name) => resolve(`${part.name}.${name}`)).catch((error) => reject(error));
          });
        }
      }
      else if (i > 0) {
        // if the next part is an activity (which cannot be the direct successor),
        // return a promise which resolves when prepare is done or, if the activity does not
        // implement prepare, immediately.
        return new Promise((resolve, reject) => {
          if (part.prepare) {
            part.prepare().then(() => resolve(part.name)).catch((error) => reject(error));
          }
          else {
            resolve(part.name);
          }
        });
      }
    }
    // there is not incomplete activity left to prepare, return null
    return null;
  }

}


export { Course };
