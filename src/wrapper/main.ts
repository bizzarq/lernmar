import { CoursePlayer2004_4 } from "../player/CoursePlayer2004_4";
import { CourseWrapper } from "./CourseWrapper";
import { CourseWrapper2004_4 } from "./CourseWrapper2004_4"; 


async function testWrapper(wrapper: CourseWrapper) {
  await wrapper.setCurrentActivity("part 1");
  await wrapper.setActivityState("part 1", {progress: 1, success: true});
  await wrapper.setCourseState({progress: 0.5});
  await wrapper.setCurrentActivity("part 2");
  await wrapper.stop();

  await wrapper.start();
  let part = await wrapper.getCurrentActivity();
  if (part != "part 2") {
    console.error(`unexpected last part ${part}`);
  };
  await wrapper.setActivityState("part 2", {progress: 1, success: true, score: 9, maxScore: 10});
  await wrapper.setCourseState({progress: 1, success: true, score: 9, maxScore: 10});
  await wrapper.stop();
}


let player = new CoursePlayer2004_4();
window.API_1484_11 = player;

let wrapper = new CourseWrapper2004_4();

testWrapper(wrapper)
  .then(() => {console.debug("end")})
  .catch((error: Error) => {console.warn(`error ${error.message}`)});
