import { CMIErrorCode, ReadValues, ScormApi_2004_4, ScormBoolean, WriteValues } from "../api/ScormApi2004_4";


/**
 * Adapter which, in a course composed of several sub-courses, connects sub-courses with the learn
 * management system.
 */
class SubCourseAdapter2004_4 implements ScormApi_2004_4 {
  #player: ScormApi_2004_4;
  #numberOfCourses: number;
  #currentId: number;
  #currentName: string | undefined;
  #suspendData: Record<string, string>;

  #defaultValues: Partial<ReadValues> = {
    "cmi.completion_status": "unknown",
    "cmi.entry": "",
    "cmi.location": "",
    "cmi.progress_measure": "0",
    "cmi.score.scaled": "0",
    "cmi.score.raw": "0",
    "cmi.score.min": "0",
    "cmi.score.max": "0",
    "cmi.session_time": "0",
    "cmi.success_status": "unknown",
    "cmi.total_time": "0",
  }

  constructor(player: ScormApi_2004_4, numberOfCourses: number) {
    this.#player = player;
    this.#numberOfCourses = numberOfCourses;
    this.#currentId = 0;
    this.#currentName = undefined;
    this.#suspendData = {};
  }

  /**
   * starting a new sub-course. this function should be be called before the new course is loaded.
   * if it is called for the first time, it will initialize the composite course towards the learn
   * management system.
   * @param name unique name of sub-course.
   */
  startSubCourse(name: string) {
    if (typeof this.#currentName === "string") {
      if (name != this.#currentName) {
        console.error(`starting new sub-course ${name} without having finished ${this.#currentName}`);
        this.#currentId++;
      }
    }
    else if (this.#currentId == 0) {
      this.#player.Initialize("");
      this.#loadSuspendData();
    }
    this.#currentName = name;
  }

  #loadSuspendData() {
    let suspendDataString = this.#player.GetValue("cmi.suspend_data");
    if (suspendDataString) {
      try {
        let suspendData = JSON.parse(suspendDataString);
        for (let [name, value] of Object.entries(suspendData)) {
          if (typeof name === "string" && typeof value === "string") {
            this.#suspendData[name] = value;
          }
        }
      }
      catch {
        console.error("cannot parse cmi.suspend_data")
      }
    }
  }

  /**
   * callback which will be called if a sub-course has ended.
   * @param name name of sub-course which has ended.
   * @param numberOfRemaining number of remaining sub-courses expected.
   */
  onSubCourseEnd?: ((numberOfRemaining: number) => void); 

  Initialize(arg: ""): ScormBoolean {
    // ignore initialization requests of the sub-course
    return "true";
  }

  Terminate(arg: ""): ScormBoolean {
    this.#currentName = undefined;
    this.#currentId += 1;
    let numberOfRemaining = this.#numberOfCourses - this.#currentId;
    if (numberOfRemaining <= 0) {
      this.#player.SetValue("cmi.completion_status", "completed");
      this.#player.SetValue("cmi.progress_measure", "1");
      this.#player.Commit("");
      this.#player.Terminate("");
    }
    else if (this.#numberOfCourses > 0) {
      let progressMeasure = this.#currentId / this.#numberOfCourses;
      this.#player.SetValue("cmi.completion_status", "incomplete");
      this.#player.SetValue("cmi.progress_measure", progressMeasure.toString());
      this.#player.Commit("");
    }
    this.onSubCourseEnd?.(numberOfRemaining);
    return "true";
  }

  GetValue<E extends keyof ReadValues>(element: E): ReadValues[E] | undefined {
    switch (element) {
      case "cmi.suspend_data":
        if (typeof this.#currentName === "string") {
          return this.#suspendData[this.#currentName] as ReadValues[E];
        }
        return undefined;
      default:
        if (element in this.#defaultValues) {
          return this.#defaultValues[element];
        }
        else {
          // take value from learn management system for all other elements
          return this.#player.GetValue(element);
        }
    }
  }

  SetValue<E extends keyof WriteValues>(element: E, value: WriteValues[E]): ScormBoolean {
    switch (element) {
      case "cmi.completion_status":
      case "cmi.progress_measure":
        // ignore completion status and progress measure as it is set when terminating
        return "true";
      case "cmi.suspend_data":
        if (typeof this.#currentName === "string") {
          this.#suspendData[this.#currentName] = value;
          return this.#player.SetValue("cmi.suspend_data", JSON.stringify(this.#suspendData))
        }
        return "false";
      default:
        // set value of learn management system for all other elements
        return this.#player.SetValue(element, value);
    }
  }

  Commit(arg: ""): ScormBoolean {
    return this.#player.Commit(arg);
  }

  GetLastError(): CMIErrorCode {
    return this.#player.GetLastError();
  }

  GetErrorString(errorCode: CMIErrorCode): string {
    return this.#player.GetErrorString(errorCode);
  }

  GetDiagnostic(errorCode: CMIErrorCode): string {
    return this.#player.GetDiagnostic(errorCode);
  }

}


export { SubCourseAdapter2004_4 };