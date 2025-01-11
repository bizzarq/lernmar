import type { Activity } from "../../src/wrapper/Activity";
import type { ActivityState } from "../../src/wrapper/ActivityState";


class TestActivity implements Activity {
  name: string;
  isMandatory: boolean;
  result: ActivityState;
  isExecuted: boolean = false;
  isPrepared: boolean = false;
  #unblock: Promise<void> | null = null;

  constructor(name: string, isMandatory: boolean) {
    this.name = name;
    this.isMandatory = isMandatory;
    this.result = {progress: 1, success: true};
  }

  async blockExecution(unblock: Promise<void>): Promise<void> {
    this.#unblock = unblock;
  }

  async execute(section: HTMLElement): Promise<ActivityState> {
    if (this.#unblock) {
      await this.#unblock;
      this.#unblock = null;
    }
    this.isExecuted = true;
    return this.result;
  }

  async prepare(): Promise<void> {
    this.isPrepared = true;
  }
  
}


export { TestActivity };
