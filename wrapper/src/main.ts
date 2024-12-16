import { ScormPlayer2004_4 } from "lernmar-player/src/ScormPlayer2004_4";
import { CourseWrapper } from "./CourseWrapper";
import { CourseWrapper2004_4 } from "./CourseWrapper2004_4"; 


async function testWrapper(wrapper: CourseWrapper) {
  await wrapper.startPart("part 1");
  await wrapper.completePart("part 1", true);
  await wrapper.reportProgress(0.5, true);
  await wrapper.startPart("part 2");
  await wrapper.stop();

  await wrapper.start();
  let part = await wrapper.getLastStartedPart();
  if (part != "part 2") {
    console.error(`unexpected last part ${part}`);
  };
  await wrapper.completePart("part 2", true, 9, 10);
  await wrapper.stop(1, true);
}


let player = new ScormPlayer2004_4();
window.API_1484_11 = player;

let wrapper = new CourseWrapper2004_4();

testWrapper(wrapper)
  .then(() => {console.debug("end")})
  .catch((error: Error) => {console.warn(`error ${error.message}`)});
