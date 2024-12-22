import { CoursePlayer2004_4 } from "../player/CoursePlayer2004_4";
import { CourseWrapper } from "./CourseWrapper";
import { CourseWrapper2004_4 } from "./CourseWrapper2004_4"; 


async function testWrapper(wrapper: CourseWrapper) {
  await wrapper.setCurrentActivity("part 1");
  await wrapper.setActivityState("part 1", {complete: true, success: true});
  await wrapper.reportProgress(0.5, true);
  await wrapper.setCurrentActivity("part 2");
  await wrapper.stop();

  await wrapper.start();
  let part = await wrapper.getCurrentActivity();
  if (part != "part 2") {
    console.error(`unexpected last part ${part}`);
  };
  await wrapper.setActivityState("part 2", {complete: true, success: true, score: 9, maxScore: 10});
  await wrapper.reportProgress(1, true);
  await wrapper.stop();
}


let player = new CoursePlayer2004_4();
window.API_1484_11 = player;

let wrapper = new CourseWrapper2004_4();

testWrapper(wrapper)
  .then(() => {console.debug("end")})
  .catch((error: Error) => {console.warn(`error ${error.message}`)});
