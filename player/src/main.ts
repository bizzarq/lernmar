let section = document.getElementById("lernmar");

if (!section) {
  throw new Error("could not find lernmar root element.");
}

let description = document.createElement("div");
description.innerText = "This is the Lernmar SCORM player";

section.replaceChildren(description);

renderIndex(section);

interface Course {
  name: string,
  path: string,
}

async function renderIndex(section: HTMLElement) {
  try {
    let response = await fetch('courses/index.json');
    let index = await response.json();
    let entries = document.createElement("section");
    entries.classList.add("index");
    for (let course of index?.courses) {
      let name = course.name;
      if (name && course.path) {
        let entry = document.createElement('button');
        entry.innerText = name;
        entries.appendChild(entry);
        entry.onclick = () => playCourse(section, course as Course);
      }
    }
    if (entries.childElementCount > 0) {
      section.replaceChildren(entries);
    }
    else {
      let message = document.createElement("div");
      message.innerText = "no courses in index";
      section.replaceChildren(message);
    }

  }
  catch {
    let message = document.createElement("div");
    message.innerText = "cannot read course index";
    section.replaceChildren(message);
  }
}

function playCourse(section: HTMLElement, course: Course) {
  let iframe = document.createElement("iframe");
  iframe.title = course.name;
  iframe.src = `courses/${course.path}`;
  console.log(`courses/${course.path}`);
  iframe.width = "100%";
  iframe.height = section.clientHeight.toString();
  section.replaceChildren(iframe);
}

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

class ScormApi {

  values: Values = {
    "cmi._version": "2004 4th Edition",
    "cmi.credit": "credit",
    "cmi.completion_status": "unknown",
    "cmi.interactions._count": 0,
    "cmi.entry": "",
    "cmi.exit": "",
    "cmi.learner_id": "",
    "cmi.learner_name": "",
    "cmi.location": "",
    "cmi.mode": "normal",
    "cmi.objectives._count": 0,
    "cmi.progress_measure": 0,
    "cmi.score.scaled": 0,
    "cmi.score.raw": 0,
    "cmi.score.min": 0,
    "cmi.score.max": 0,
    "cmi.session_time": 0,
    "cmi.success_status": "unknown",
    "cmi.suspend_data": "",
    "cmi.total_time": 0,
  }
  lastError: number = 0;

  Initialize(arg: "") {
    console.log("Initialize()");
    return true;
  }

  Terminate(arg: "") {
    console.log("Terminate()");
    if (section) {
      renderIndex(section);
    }
    return true;
  }

  Commit(arg: "") {
    console.log("Commit()");
    return true;
  }

  GetValue(element: keyof ReadValues): ReadValues[typeof element] | undefined {
    if (isReadablElement[element]) {
      console.log(`GetValue(${element}) return ${this.values[element]}`);
      return this.values[element];
    }
    console.log(`GetValue(${element}) -> return undefined`);
  }

  GetLastError() {
    return this.lastError;
  }

  SetValue<E extends keyof WriteValues> (element: E, value: WriteValues[E]) {
    console.log(`Set Value(${element} ${value})`);
    if (isWritableElement[element]) {
      this.values[element] = value as Values[E];
    }
  }

}

export {};

declare global {
  interface Window { API_1484_11: ScormApi; }
}

window.API_1484_11 = new ScormApi();
