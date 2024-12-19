import { CourseManager } from "./CourseManager";

let section = document.getElementById("lernmar");

if (!section) {
  throw new Error("could not find lernmar root element.");
}

let manager = new CourseManager();
manager.start(section);
