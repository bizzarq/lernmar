type ScormBoolean = "true" | "false";
type CMIErrorCode = "0" |
  "101" | "102" | "103" | "104" |
  "111" | "112" | "113" |
  "122" | "123" | "132" | "133" | "142" | "143" |
  "201" | "301" | "351" | "391" |
  "401" | "402" | "403" | "404" | "405" | "406" | "407" | "408"

type ReadWriteValues = {
  "cmi.completion_status": "completed" | "incomplete" | "not attempted" | "unknown",
  "cmi.location": string,
  "cmi.progress_measure": number,
  "cmi.score.scaled": number,
  "cmi.score.raw": number,
  "cmi.score.min": number,
  "cmi.score.max": number,
  "cmi.success_status": "passed" | "failed" | "unknown",
  "cmi.suspend_data": string,
}

type ReadOnlyValues = {
  "cmi._version": "2004 4th Edition",
  "cmi.credit": "credit" | "no-credit",
  "cmi.entry": "ab_initio" | "resume" | "",
  "cmi.interactions._count": number,
  "cmi.learner_id": string,
  "cmi.learner_name": string,
  "cmi.mode": "browse" | "normal" | "review",
  "cmi.objectives._count": number,
  "cmi.session_time": number,
  "cmi.total_time": number,
}

type WriteOnlyValues = {
  "cmi.exit": "timeout" | "suspend" | "logout" | "normal" | "",
}

type ReadValues = ReadWriteValues & ReadOnlyValues;
type WriteValues = ReadWriteValues & WriteOnlyValues;
type Values = ReadWriteValues & ReadOnlyValues & WriteOnlyValues;

interface ScormApi_2004_4 {

  Initialize(arg: ""): ScormBoolean;

  Terminate(arg: ""): ScormBoolean;

  GetValue(element: keyof ReadValues): ReadValues[typeof element] | undefined;

  SetValue<E extends keyof WriteValues> (element: E, value: WriteValues[E]): ScormBoolean;

  Commit(arg: ""): ScormBoolean;

  GetLastError(): CMIErrorCode;

  GetErrorString(errorCode: CMIErrorCode): string;

  GetDiagnostic(errorCode: CMIErrorCode): string;

}

declare global {
  interface Window { API_1484_11: ScormApi_2004_4; }
}

export type { ScormApi_2004_4, CMIErrorCode, ScormBoolean, ReadValues, WriteValues, Values };
