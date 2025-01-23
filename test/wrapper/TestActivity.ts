import type { Activity } from "../../src/wrapper/Activity";
import type { ActivityState } from "../../src/wrapper/ActivityState";


class TestActivity implements Activity {
  name: string;
  isMandatory: boolean;
  maxScore: number | undefined;
  result: ActivityState;
  isExecuted: boolean = false;
  isPrepared: boolean = false;

  constructor(name: string, isMandatory: boolean) {
    this.name = name;
    this.isMandatory = isMandatory;
    this.result = {progress: 1, success: true};
  }

  onExecute: (() => Promise<void>) | undefined;
  onPrepare: (() => Promise<void>) | undefined;

  async execute(section: HTMLElement): Promise<ActivityState> {
    this.isExecuted = true;
    await this.onExecute?.();
    return this.result;
  }

  async prepare(): Promise<void> {
    this.isPrepared = true;
    await this.onPrepare?.();
  }
  
}


export { TestActivity };
