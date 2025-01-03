import type { ActivityState } from "./ActivityState";


/**
 * Activity in a lernmar course. An activity has a unique name and can be mandatory.
 */
interface Activity {

  /**
   * name of the activity. must be unique in the course.
   */
  readonly name: string;

  /**
   * whether completion of this activity is mandatory for completion of the course.
   */
  readonly isMandatory: boolean;

  /**
   * prepare the activity for execution, e.g. by loading resources.
   * if there is nothing to prepare, this method can be omitted.
   */
  prepare?: () => Promise<void>;

  /**
   * execute the activity and return the state of the activity.
   * @param section the section in which the activity is executed.
   * @returns the state of the activity after execution.
   */
  execute(section: HTMLElement): Promise<ActivityState>;

}


export { Activity }

