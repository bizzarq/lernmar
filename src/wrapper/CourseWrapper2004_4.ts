import type { ScormApi_2004_4 } from "../api/ScormApi2004_4";
import type { CourseWrapper } from "./CourseWrapper";


class CourseWrapper2004_4 implements CourseWrapper{
  #apiMaxTries = 20;
  #api: ScormApi_2004_4 | undefined;
  #isInitialized: boolean = false;

  completionStatus = "unknown";
  passedStatus = "unknown";
  #location: string | null = null;
  #achievements: {[name: string]: [boolean, boolean, number] | [boolean, boolean]};

  constructor() {
    this.#achievements = {};
  }

  async start(): Promise<void> {
    await this.#initialize();
  }

  async stop(progress?: number, success?: boolean): Promise<void> {
    let api = await this.#initialize();
    if (progress) {
      await this.reportProgress(progress, success);
    }
    api.Terminate("");
    this.#isInitialized = false;
  }

  async reportProgress(progress: number, success?: boolean): Promise<void> {
    let api = await this.#initialize();
    progress = progress > 1 ? 1 : (progress < 0 ? 0 : progress);
    if (typeof success === "undefined" || progress < 1) {
      success = progress == 1;
    }
    api.SetValue("cmi.completion_status", progress == 1 ? "completed" : "incomplete");
    api.SetValue("cmi.progress_measure", progress.toString());
    api.SetValue("cmi.success_status", success ? "passed" : "failed");
    api.Commit("");
  }

  async getLearner() {
    let api = await this.#initialize();
    return {
      id: api.GetValue("cmi.learner_id") || "",
      name: api.GetValue("cmi.learner_name") || "",
    };
  }

  async startPart(name: string): Promise<void> {
    let api = await this.#initialize();
    this.#location = name;
    api.SetValue("cmi.location", name);
  }

  async getLastStartedPart(): Promise<string | null> {
    await this.#initialize();
    return this.#location;
  }

  async getPartState(name: string): Promise<[boolean, boolean, number] | [boolean, boolean]> {
    await this.#initialize();
    let achievement = this.#achievements[name];
    if (achievement) {
      return achievement;
    }
    return [false, false];
  }

  async completePart(name: string, success: boolean, score?: number, maxScore?: number): Promise<void> {
    let api = await this.#initialize();
    let achievement: [boolean, boolean, number] | [boolean, boolean];
    if (typeof score !== "undefined") {
      if (score < 0) {
        throw Error("score must be >= 0");
      }
      let maxScore2 = maxScore ? maxScore : score;
      api.SetValue("cmi.score.raw", score.toString());
      api.SetValue("cmi.score.max", maxScore2.toString());
      api.SetValue("cmi.score.min", "0");
      api.SetValue("cmi.score.scaled", (maxScore2 > 0 ? score / maxScore2 : 1).toString());
      achievement = [true, success, score];
    }
    else {
      achievement = [true, success];
    }
    this.#achievements[name] = achievement;
    api.SetValue("cmi.suspend_data", JSON.stringify(this.#achievements));
  }

  async #initialize(): Promise<ScormApi_2004_4> {
    let api: ScormApi_2004_4;
    if (this.#api) {
      api = this.#api;
    }
    else {
      api = this.#findApi();
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
    let achievementsString = api.GetValue("cmi.suspend_data");
    if (typeof achievementsString === "string" && achievementsString != "") {
      try {
        let achievements = JSON.parse(achievementsString);
        for (let [name, values] of Object.entries(achievements)) {
          if (typeof name === "string" && Array.isArray(values) && values.length > 1
            && typeof values[0] === "boolean" && typeof values[1] === "boolean"
            && (values.length < 3 || typeof values[2] === "number")
          ) {
            this.#achievements[name] = values as [boolean, boolean, number] | [boolean, boolean];
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

  #findApi(): ScormApi_2004_4 {
    let todos: Array<Window> = [window, window.opener];
    let tries = 0
    while (todos.length > 0 && tries < this.#apiMaxTries) {
      let testWindow = todos.shift();
      if (testWindow) {
        if (testWindow.API_1484_11) {
          return testWindow.API_1484_11;
        }
        let parent: Window | undefined = testWindow.parent;
        if (parent && parent != testWindow) {
          todos.unshift(parent);
        }
      }
    }
    throw new Error("cannot find Scorm API");
  }

}


export { CourseWrapper2004_4 };
