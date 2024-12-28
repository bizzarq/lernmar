import type { ActivityState } from "./ActivityState";


interface Activity {
  readonly name: string;
  readonly isMandatory: boolean;
  execute(section: HTMLElement): Promise<ActivityState>;
}


export { Activity }

