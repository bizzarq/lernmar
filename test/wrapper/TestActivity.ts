import type { Activity } from "../../src/wrapper/Activity";
import type { ActivityState } from "../../src/wrapper/ActivityState";


class TestActivity implements Activity {
  name: string;
  isMandatory: boolean;
  result: ActivityState;
  isExecuted: boolean = false;
  isPrepared: boolean = false;
  
  constructor(name: string, isMandatory: boolean, result?: ActivityState) {
    this.name = name;
    this.isMandatory = isMandatory;
    if (!result) {
      result = {mandatory: isMandatory, complete: true, success: true};
    }
    this.result = result;
  }

  async execute(section: HTMLElement): Promise<ActivityState> {
    this.isExecuted = true;
    return this.result;
  }

  async prepare(): Promise<void> {
    this.isPrepared = true;
  }
  
}


export { TestActivity };
