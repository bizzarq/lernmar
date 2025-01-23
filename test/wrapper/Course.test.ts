/**
 * @jest-environment jsdom
 */
import { Course } from "../../src/wrapper/Course";
import { TestActivity } from "./TestActivity";
import { TestWrapper } from "./TestWrapper";


test('normal execution', async () => {
  let section = document.createElement("section");
  let wrapper = new TestWrapper();
  let activity1 = new TestActivity("activity 1", true);
  let activity2 = new TestActivity("activity 2", true);
  let activity3 = new TestActivity("activity 3", true);
  let course = new Course([activity1, activity2, activity3]);

  expect(course.mandatoryActivities).toBe(3);
  expect(course.maxScore).toBe(0);
  expect(course.name).toBe("Main Course");

  // enable to halt the course for running tests during activity calls
  // tests in sub-functions will not be recognized by jest
  let activity1Resolve = (value: void | PromiseLike<void>) => {};
  let activity1Promise = new Promise<void>(resolve => {
    activity1.onExecute = async () => {
      resolve(); await new Promise(resolve2 => activity1Resolve = resolve2);
    }
  });
  let activity2Resolve = (value: void | PromiseLike<void>) => {};
  let activity2Promise = new Promise<void>(resolve => {
    activity2.onExecute = async () => {
      resolve(); await new Promise(resolve2 => activity2Resolve = resolve2);
    }
  });
  let activity3Resolve = (value: void | PromiseLike<void>) => {};
  let activity3Promise = new Promise<void>(resolve => {
    activity3.onExecute = async () => {
      resolve(); await new Promise(resolve2 => activity3Resolve = resolve2);
    }
  });

  let coursePromise = course.execute(section, wrapper);

  await activity1Promise;
  expect(wrapper.calls[0]).toBe("start");
  expect(wrapper.calls).toContainEqual(["setCurrentActivity", "activity 1"]);
  wrapper.clearCalls();
  expect(activity2.isExecuted).toBe(false);
  expect(activity3.isExecuted).toBe(false);
  activity1Resolve();

  await activity2Promise;
  expect(wrapper.calls).toContainEqual(["setActivityState", "activity 1", {progress: 1, success: true}]);
  expect(wrapper.calls).toContainEqual(["setCurrentActivity", "activity 2"]);
  wrapper.clearCalls();
  expect(activity1.isExecuted).toBe(true);
  expect(activity3.isExecuted).toBe(false);
  activity2Resolve();

  await activity3Promise;
  expect(wrapper.calls).toContainEqual(["setActivityState", "activity 2", {progress: 1, success: true}]);
  expect(wrapper.calls).toContainEqual(["setCurrentActivity", "activity 3"]);
  wrapper.clearCalls();
  expect(activity1.isExecuted).toBe(true);
  expect(activity2.isExecuted).toBe(true);
  activity3Resolve();

  await coursePromise;
  expect(wrapper.calls).toContainEqual(["setActivityState", "activity 3", {progress: 1, success: true}]);
  expect(wrapper.calls).toContainEqual(["setCourseState", {progress: 1, success: true}]);
  expect(wrapper.calls[wrapper.calls.length - 1]).toBe("stop");
});

test('progress of incomplete activities is discounted when mandatory', async () => {
  let section = document.createElement("section");
  let wrapper = new TestWrapper();
  let activity1 = new TestActivity("activity 1", false);
  let activity2 = new TestActivity("activity 2", true);
  let activity3 = new TestActivity("activity 3", true);
  let course = new Course([activity1, activity2, activity3]);

  activity1.result = {progress: 0};
  activity3.result = {progress: 0};

  expect(course.mandatoryActivities).toBe(2);
  await course.execute(section, wrapper);

  expect(wrapper.calls).toContainEqual(["setActivityState", "activity 1", {progress: 0}]);
  expect(wrapper.calls).toContainEqual(["setActivityState", "activity 2", {progress: 1, success: true}]);
  expect(wrapper.calls).toContainEqual(["setActivityState", "activity 3", {progress: 0}]);
  expect(wrapper.calls).toContainEqual(["setCourseState", {progress: 0.5}]);
});

test('only mandatory activities contribute to fails', async () => {
  let section = document.createElement("section");
  let wrapperA = new TestWrapper();
  let wrapperB = new TestWrapper();
  let activity1 = new TestActivity("activity 1", true);
  let activity2a = new TestActivity("activity 2", true);
  let activity2b = new TestActivity("activity 2", false);
  let courseA = new Course([activity1, activity2a]);
  let courseB = new Course([activity1, activity2b]);

  activity2a.result = {progress: 1, success: false};
  activity2b.result = {progress: 1, success: false};

  expect(courseA.mandatoryActivities).toBe(2);
  await courseA.execute(section, wrapperA);
  expect(wrapperA.calls).toContainEqual(["setActivityState", "activity 1", {progress: 1, success: true}]);
  expect(wrapperA.calls).toContainEqual(["setActivityState", "activity 2", {progress: 1, success: false}]);
  expect(wrapperA.calls).toContainEqual(["setCourseState", {progress: 1, success: false}]);

  expect(courseB.mandatoryActivities).toBe(1);
  await courseB.execute(section, wrapperB);
  expect(wrapperB.calls).toContainEqual(["setActivityState", "activity 1", {progress: 1, success: true}]);
  expect(wrapperB.calls).toContainEqual(["setActivityState", "activity 2", {progress: 1, success: false}]);
  expect(wrapperB.calls).toContainEqual(["setCourseState", {progress: 1, success: true}]);
});

test('empty course', async () => {
  let section = document.createElement("section");
  let wrapper = new TestWrapper();
  let course = new Course([]);

  expect(course.mandatoryActivities).toBe(0);
  await course.execute(section, wrapper);
  expect(wrapper.calls[0]).toBe("start");
  expect(wrapper.calls).toContainEqual(["setCourseState", {progress: 1, success: true}]);
});

test('nested course, normal execution', async () => {
  let section = document.createElement("section");
  let wrapper = new TestWrapper();
  let activity1 = new TestActivity("activity 1", true);
  let activity211 = new TestActivity("activity 211", true);
  let course21 = new Course([activity211], "course 21");
  let activity22 = new TestActivity("activity 22", true);
  let course2 = new Course([course21, activity22], "course 2");
  let course = new Course([activity1, course2], "course");

  expect(course.mandatoryActivities).toBe(3);
  expect(course.maxScore).toBe(0);
  expect(course.name).toBe("course");

  // enable to halt the course for running tests during activity calls
  // tests in sub-functions will not be recognized by jest
  let activity1Resolve = (value: void | PromiseLike<void>) => {};
  let activity1Promise = new Promise<void>(resolve => {
    activity1.onExecute = async () => {
      resolve(); await new Promise(resolve2 => activity1Resolve = resolve2);
    }
  });
  let activity211Resolve = (value: void | PromiseLike<void>) => {};
  let activity211Promise = new Promise<void>(resolve => {
    activity211.onExecute = async () => {
      resolve(); await new Promise(resolve2 => activity211Resolve = resolve2);
    }
  });
  let activity22Resolve = (value: void | PromiseLike<void>) => {};
  let activity22Promise = new Promise<void>(resolve => {
    activity22.onExecute = async () => {
      resolve(); await new Promise(resolve2 => activity22Resolve = resolve2);
    }
  });

  let coursePromise = course.execute(section, wrapper);

  await activity1Promise;
  expect(wrapper.calls[0]).toBe("start");
  expect(wrapper.calls).toContainEqual(["setCurrentActivity", "activity 1"]);
  wrapper.clearCalls();
  expect(activity211.isExecuted).toBe(false);
  expect(activity22.isExecuted).toBe(false);
  activity1Resolve();

  await activity211Promise;
  expect(wrapper.calls).toContainEqual(["setActivityState", "activity 1", {progress: 1, success: true}]);
  expect(wrapper.calls).toContainEqual(["setCurrentActivity", "course 2.course 21.activity 211"]);
  wrapper.clearCalls();
  expect(activity1.isExecuted).toBe(true);
  expect(activity22.isExecuted).toBe(false);
  activity211Resolve();

  await activity22Promise;
  expect(wrapper.calls).toContainEqual(
    ["setActivityState", "course 2.course 21.activity 211", {progress: 1, success: true}]
  );
  expect(wrapper.calls).toContainEqual(["setCurrentActivity", "course 2.activity 22"]);
  wrapper.clearCalls();
  expect(activity1.isExecuted).toBe(true);
  expect(activity211.isExecuted).toBe(true);
  activity22Resolve();

  await coursePromise;
  expect(wrapper.calls).toContainEqual(
    ["setActivityState", "course 2.activity 22", {progress: 1, success: true}]
  );
  expect(wrapper.calls).toContainEqual(["setCourseState", {progress: 1, success: true}]);
  expect(wrapper.calls[wrapper.calls.length - 1]).toBe("stop");
});

test("call prepares first activity, the others are prepared during previous execute", async () => {
  let section = document.createElement("section");
  let wrapper = new TestWrapper();
  let activity1 = new TestActivity("activity 1", true);
  let activity2 = new TestActivity("activity 2", true);
  let activity3 = new TestActivity("activity 3", true);
  let course = new Course([activity1, activity2, activity3]);

  // enable to halt the course for running tests during activity calls
  // tests in sub-functions will not be recognized by jest
  let activity1Resolve = (value: void | PromiseLike<void>) => {};
  let activity1Promise = new Promise<void>(resolve => {
    activity1.onExecute = async () => {
      resolve(); await new Promise(resolve2 => activity1Resolve = resolve2);
    }
  });
  let activity2Resolve = (value: void | PromiseLike<void>) => {};
  let activity2Promise = new Promise<void>(resolve => {
    activity2.onExecute = async () => {
      resolve(); await new Promise(resolve2 => activity2Resolve = resolve2);
    }
  });

  expect(activity1.isPrepared).toBe(false);
  expect(activity2.isPrepared).toBe(false);
  expect(activity3.isPrepared).toBe(false);
  await course.prepare();
  expect(activity1.isPrepared).toBe(true);
  expect(activity2.isPrepared).toBe(false);
  expect(activity3.isPrepared).toBe(false);

  let coursePromise = course.execute(section, wrapper);

  await activity1Promise;
  await new Promise(resolve => setTimeout(resolve, 1));
  expect(activity2.isPrepared).toBe(true);
  expect(activity3.isPrepared).toBe(false);
  activity1Resolve();

  await activity2Promise;
  await new Promise(resolve => setTimeout(resolve, 1));
  expect(activity3.isPrepared).toBe(true);
  activity2Resolve();

  await coursePromise;
  expect(wrapper.calls).toContainEqual(["setCourseState", {progress: 1, success: true}]);
});

test("prepare calls in a nested course work as in flat course", async () => {
  let section = document.createElement("section");
  let wrapper = new TestWrapper();
  let activity1 = new TestActivity("activity 1", true);
  let activity211 = new TestActivity("activity 211", true);
  let course21 = new Course([activity211], "course 21");
  let activity22 = new TestActivity("activity 22", true);
  let course2 = new Course([course21, activity22], "course 2");
  let course = new Course([activity1, course2], "course");

  // enable to halt the course for running tests during activity calls
  // tests in sub-functions will not be recognized by jest
  let activity1Resolve = (value: void | PromiseLike<void>) => {};
  let activity1Promise = new Promise<void>(resolve => {
    activity1.onExecute = async () => {
      resolve(); await new Promise(resolve2 => activity1Resolve = resolve2);
    }
  });
  let activity211Resolve = (value: void | PromiseLike<void>) => {};
  let activity211Promise = new Promise<void>(resolve => {
    activity211.onExecute = async () => {
      resolve(); await new Promise(resolve2 => activity211Resolve = resolve2);
    }
  });

  expect(activity1.isPrepared).toBe(false);
  expect(activity211.isPrepared).toBe(false);
  expect(activity22.isPrepared).toBe(false);
  await course.prepare();
  expect(activity1.isPrepared).toBe(true);
  expect(activity211.isPrepared).toBe(false);
  expect(activity22.isPrepared).toBe(false);

  let coursePromise = course.execute(section, wrapper);

  await activity1Promise;
  await new Promise(resolve => setTimeout(resolve, 1));
  expect(activity211.isPrepared).toBe(true);
  expect(activity22.isPrepared).toBe(false);
  activity1Resolve();

  await activity211Promise;
  expect(activity22.isPrepared).toBe(true);
  activity211Resolve();

  await coursePromise;
  expect(wrapper.calls).toContainEqual(["setCourseState", {progress: 1, success: true}]);
});

test("course result in a nested course is calculated correctly", async () => {
  let section = document.createElement("section");
  let wrapper = new TestWrapper();
  // course 1: narrow success in incomplete non-mandatory activity
  let activity11 = new TestActivity("activity 11", false);
  activity11.result = {progress: 0, score: 75, maxScore: 100};
  let activity12 = new TestActivity("activity 12", true);
  activity12.result = {progress: 1, success: true, score: 85, maxScore: 100};
  let course1 = new Course([activity11, activity12], "course 1");
  // course 2: no success because of bad score in non-mandatory activity
  let activity21 = new TestActivity("activity 21", false);
  activity21.result = {progress: 1, success: true, score: 74, maxScore: 100};
  let activity22 = new TestActivity("activity 22", true);
  activity22.result = {progress: 1, success: true, score: 85, maxScore: 100};
  let course2 = new Course([activity21, activity22], "course 2");
  // course 3. incomplete despite good score
  let activity31 = new TestActivity("activity 31", true);
  activity31.result = {progress: 1, success: true, score: 100, maxScore: 100};
  let activity32 = new TestActivity("activity 32", true);
  activity32.result = {progress: 0, score: 100, maxScore: 100};
  let course3 = new Course([activity31, activity32], "course 3");

  let course = new Course([course1, course2, course3]);

  expect(course1.maxScore).toBe(200);
  await course1.execute(section, wrapper);
  expect(wrapper.calls).toContainEqual(
    ["setCourseState", {progress: 1, success: true, score: 160, maxScore: 200}]
  );
  wrapper.clearCalls();

  expect(course2.maxScore).toBe(200);
  await course2.execute(section, wrapper);
  expect(wrapper.calls).toContainEqual(
    ["setCourseState", {progress: 1, success: false, score: 159, maxScore: 200}]
  );
  wrapper.clearCalls();

  expect(course3.maxScore).toBe(200);
  await course3.execute(section, wrapper);
  expect(wrapper.calls).toContainEqual(
    ["setCourseState", {progress: 0.5, score: 200, maxScore: 200}]
  );
  wrapper.clearCalls();

  expect(course.maxScore).toBe(600);
  await course.execute(section, wrapper);
  expect(wrapper.calls).toContainEqual(
    ["setCourseState", {progress: 0.75, score: 519, maxScore: 600}]
  );
});

test("bad names are recognized and ignored", async () => {
  let section = document.createElement("section");
  let wrapper = new TestWrapper();
  let activity1 = new TestActivity("", true);
  let activity2 = new TestActivity("activity 2", true);
  let activity3 = new TestActivity("dots.are.bad", true);

  let errorCount = 0;
  let errorBackup = global.console.error;
  console.error = () => errorCount++;
  let course = new Course([activity1, activity2, activity3]);
  console.error = errorBackup;
  expect(course.mandatoryActivities).toBe(1);
  expect(errorCount).toBe(2);

  await course.execute(section, wrapper);

  expect(activity1.isExecuted).toBe(false);
  expect(activity2.isExecuted).toBe(true);
  expect(activity3.isExecuted).toBe(false);
});
