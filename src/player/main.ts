import { CoursePlayer2004_4 } from "./CoursePlayer2004_4";

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


let player = new CoursePlayer2004_4();
player.onTerminate = () => {
  renderIndex(section);
}

window.API_1484_11 = player;
window.close = () => {
  console.log("window.close(): call Terminate");
  window.API_1484_11.Terminate("");
}
