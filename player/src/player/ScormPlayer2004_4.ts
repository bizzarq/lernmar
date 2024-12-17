import type {
  ScormApi_2004_4, ScormBoolean, CMIErrorCode, ReadValues, WriteValues, Values,
} from "lernmar-api/src/scorm2004_4";


let isReadablElement: Record<keyof ReadValues, true> = {
  "cmi._version": true,
  "cmi.completion_status": true,
  "cmi.credit": true,
  "cmi.entry": true,
  "cmi.interactions._count": true,
  "cmi.learner_id": true,
  "cmi.learner_name": true,
  "cmi.location": true,
  "cmi.mode": true,
  "cmi.objectives._count": true,
  "cmi.progress_measure": true,
  "cmi.score.scaled": true,
  "cmi.score.raw": true,
  "cmi.score.min": true,
  "cmi.score.max": true,
  "cmi.session_time": true,
  "cmi.success_status": true,
  "cmi.suspend_data": true,
  "cmi.total_time": true,
};

let isWritableElement: Record<keyof WriteValues, true> = {
  "cmi.completion_status": true,
  "cmi.exit": true,
  "cmi.location": true,
  "cmi.progress_measure": true,
  "cmi.score.scaled": true,
  "cmi.score.raw": true,
  "cmi.score.min": true,
  "cmi.score.max": true,
  "cmi.success_status": true,
  "cmi.suspend_data": true,
}


class ScormPlayer2004_4 implements ScormApi_2004_4 {

  values: Values = {
    "cmi._version": "2004 4th Edition",
    "cmi.credit": "credit",
    "cmi.completion_status": "unknown",
    "cmi.interactions._count": "0",
    "cmi.entry": "",
    "cmi.exit": "",
    "cmi.learner_id": "",
    "cmi.learner_name": "",
    "cmi.location": "",
    "cmi.mode": "normal",
    "cmi.objectives._count": "0",
    "cmi.progress_measure": "0",
    "cmi.score.scaled": "0",
    "cmi.score.raw": "0",
    "cmi.score.min": "0",
    "cmi.score.max": "0",
    "cmi.session_time": "0",
    "cmi.success_status": "unknown",
    "cmi.suspend_data": "",
    "cmi.total_time": "0",
  }
  lastError: CMIErrorCode = "0";

  Initialize(_arg: ""): ScormBoolean {
    console.log("Initialize()");
    return "true";
  }

  Terminate(arg: ""): ScormBoolean {
    console.log("Terminate()");
    if (this.onTerminate) {
      this.onTerminate();
    }
    return "true";
  }

  onTerminate: (() => void) | undefined;

  GetValue<E extends keyof ReadValues> (element: E): ReadValues[E] | undefined {
    if (isReadablElement[element]) {
      console.log(`GetValue(${element}) return ${this.values[element]}`);
      return this.values[element];
    }
    console.log(`GetValue(${element}) -> return undefined`);
  }

  SetValue<E extends keyof WriteValues> (element: E, value: WriteValues[E]): ScormBoolean {
    console.log(`Set Value(${element} ${value})`);
    if (isWritableElement[element]) {
      this.values[element] = value as Values[E];
    }
    return "true";
  }

  Commit(_arg: ""): ScormBoolean {
    console.log("Commit()");
    return "true";
  }

  GetLastError(): CMIErrorCode {
    console.log("GetLastError()");
    return "0";
  }

  GetErrorString(errorCode: CMIErrorCode): string {
    console.log(`GetErrorString(${errorCode})`);
    return "";
  }

  GetDiagnostic(errorCode: CMIErrorCode): string {
    console.log(`GetDiagnostic(${errorCode})`);
    return "";
  }

}


export { ScormPlayer2004_4 };
