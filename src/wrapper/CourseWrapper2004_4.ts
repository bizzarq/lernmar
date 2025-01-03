import { isActivityState } from "./ActivityState";
import { findApi } from "../api/findApi2004_4";
import type { ScormApi_2004_4 } from "../api/ScormApi2004_4";
import type { ActivityState } from "./ActivityState";
import type { CourseStatistics, CourseWrapper } from "./CourseWrapper";
import { CourseProgress } from "./CourseProgress";


class CourseWrapper2004_4 implements CourseWrapper {
  #api: ScormApi_2004_4 | undefined;
  #isInitialized: boolean = false;

  completionStatus = "unknown";
  passedStatus = "unknown";
  #location: string | null = null;
  #activityStates: Record<string, ActivityState>;

  constructor() {
    this.#activityStates = {};
  }

  async start(): Promise<void> {
    await this.#initialize();
  }

  async stop(): Promise<void> {
    let api = await this.#initialize();
    api.Terminate("");
    this.#isInitialized = false;
  }

  async reportProgress(progress: CourseProgress): Promise<void> {
    let api = await this.#initialize();
    let progress2 = progress.progress > 1 ? 1 : (progress.progress < 0 ? 0 : progress.progress);
    api.SetValue("cmi.completion_status", progress2 == 1 ? "completed" : "incomplete");
    api.SetValue("cmi.progress_measure", progress2.toString());
    api.SetValue("cmi.success_status", progress.success ? "passed" : "failed");
    api.Commit("");
  }

  statistics(): CourseStatistics {
    let result: CourseStatistics = {
      activityCount: 0, mandatoryCount: 0, completeCount: 0, successCount: 0
    };
    for (let state of Object.values(this.#activityStates)) {
      result.activityCount += 1;
      if (state.mandatory) {
        result.mandatoryCount += 1;
        if (state.complete) {
          result.completeCount += 1;
          if (state.success) {
            result.successCount += 1;
          }
        }
      }
    }
    return result;
  }

  async getLearner() {
    let api = await this.#initialize();
    return {
      id: api.GetValue("cmi.learner_id") || "",
      name: api.GetValue("cmi.learner_name") || "",
    };
  }

  async setCurrentActivity(name: string): Promise<void> {
    let api = await this.#initialize();
    this.#location = name;
    api.SetValue("cmi.location", name);
  }

  async getCurrentActivity(): Promise<string | null> {
    await this.#initialize();
    return this.#location;
  }

  async getActivityState(name: string): Promise<ActivityState | null> {
    await this.#initialize();
    let achievement = this.#activityStates[name];
    if (achievement) {
      return achievement;
    }
    return null;
  }

  async setActivityState(name: string, state: ActivityState): Promise<void> {
    let api = await this.#initialize();
    if ("score" in state) {
      let raw = state.score > 0 ? state.score : 0;
      let max = state.maxScore >= raw ? state.maxScore : raw;
      api.SetValue("cmi.score.raw", raw.toString());
      api.SetValue("cmi.score.max", max.toString());
      api.SetValue("cmi.score.min", "0");
      api.SetValue("cmi.score.scaled", (max > 0 ? raw / max : 0).toString());
    }
    this.#activityStates[name] = state;
    api.SetValue("cmi.suspend_data", JSON.stringify(this.#activityStates));
  }

  async #initialize(): Promise<ScormApi_2004_4> {
    let api: ScormApi_2004_4;
    if (this.#api) {
      api = this.#api;
    }
    else {
      api = findApi();
      this.#api = api;  
    }
    if (this.#isInitialized) {
      // only initialize once
      return api;
    }
    api.Initialize("");
    this.#isInitialized = true;
    this.#setInitData(api);
    return api;
  }

  #setInitData(api: ScormApi_2004_4) {
    let location = api.GetValue("cmi.location");
    this.#location = location ? location : null;
    let activityStatesString = api.GetValue("cmi.suspend_data");
    if (typeof activityStatesString === "string" && activityStatesString != "") {
      try {
        let activityStates = JSON.parse(activityStatesString);
        for (let [name, value] of Object.entries(activityStates)) {
          if (typeof name === "string" && isActivityState(value)) {
            this.#activityStates[name] = value;
          }
          else {
            console.error(`cannot interpret suspend data for ${name}`);
          }
        }
      }
      catch {
        console.error("cannot interpret suspend data");
      }
    }
  }

}


export { CourseWrapper2004_4 };
