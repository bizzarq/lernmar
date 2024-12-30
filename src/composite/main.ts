import { CompositeCourse } from "./CompositeCourse";


let section = document.getElementById("lernmar");

if (!section) {
  throw new Error("could not find lernmar root element.");
}

let course = new CompositeCourse();
course.start(section);
