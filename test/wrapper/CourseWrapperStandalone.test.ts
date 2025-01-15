import { CourseWrapperStandalone } from "../../src/wrapper/CourseWrapperStandalone";


test('test all methods with standard values', async () => {
  let wrapper = new CourseWrapperStandalone({id: "1", name: "learner 1"});
  let hasStarted = false;
  let hasStopped = false;
  wrapper.onStart = () => {hasStarted = true};
  wrapper.onStop = () => {hasStopped = true};

  await wrapper.start();
  expect(hasStarted).toBe(true);
  expect(await wrapper.getLearner()).toMatchObject({id: "1", name: "learner 1"});
  expect(await wrapper.getCurrentActivity()).toBe(null);
  expect(await wrapper.getActivityState("activity 1")).toBe(null);
  expect(await wrapper.getActivityStates()).toMatchObject({});
  expect(await wrapper.getCourseState()).toMatchObject({progress: 0});

  await wrapper.setCurrentActivity("activity 1");
  expect(await wrapper.getCurrentActivity()).toBe("activity 1");

  let state1 = {progress: 1, success: true, score: 0.9, maxScore: 1}
  await wrapper.setActivityState("activity 1", state1);
  expect(await wrapper.getActivityState("activity 1")).toMatchObject(state1);
  expect(await wrapper.getActivityStates()).toMatchObject({"activity 1": state1});

  let state2 = {progress: 1, success: false, score: 0.9, maxScore: 14}
  await wrapper.setCourseState(state2);
  expect(await wrapper.getCourseState()).toMatchObject(state2);

  await wrapper.stop();
  expect(hasStopped).toBe(true);
});
