import type { Activity } from "../../src/wrapper/Activity";
import type { ActivityState } from "../../src/wrapper/ActivityState";


class TestActivity implements Activity {
  name: string;
  isMandatory: boolean;
  result: ActivityState;
  isExecuted: boolean = false;
  isPrepared: boolean = false;

  constructor(name: string, isMandatory: boolean) {
    this.name = name;
    this.isMandatory = isMandatory;
    this.result = {progress: 1, success: true};
  }

  onExecuteStart: (() => Promise<void>) | undefined; 
  onExecuteEnd: (() => Promise<void>) | undefined; 

  async execute(section: HTMLElement): Promise<ActivityState> {
    await this.onExecuteStart?.();
    this.isExecuted = true;
    await this.onExecuteEnd?.();
    return this.result;
  }

  async prepare(): Promise<void> {
    this.isPrepared = true;
  }
  
}


export { TestActivity };
