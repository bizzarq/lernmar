/**
 * @jest-environment jsdom
 */
import { CoursePlayer2004_4 } from "../../src/player/CoursePlayer2004_4";
import { Course } from "../../src/wrapper/Course";
import { CourseExecutor } from "../../src/wrapper/CourseExecutor";
import { CourseWrapper2004_4 } from "../../src/wrapper/CourseWrapper2004_4";
import { TestActivity } from "./TestActivity";


test("normal execution of nested course", async () => {
  // supress console.log output from the course player
  global.console.log = () => {};
  let player = new CoursePlayer2004_4();
  window.API_1484_11 = player;

  let section = document.createElement("section");
  let activity1 = new TestActivity("activity 1", true);
  let activity211 = new TestActivity("activity 211", true);
  let course21 = new Course(section, [activity211], "course 21");
  let activity22 = new TestActivity("activity 22", true);
  let course2 = new Course(section, [course21, activity22], "course 2");
  let course = new Course(section, [activity1, course2]);
  let wrapper = new CourseWrapper2004_4();
  let executor = new CourseExecutor(course, wrapper);

  activity1.onExecuteStart = async () => {
    expect(activity1.isPrepared).toBe(true);
    expect(activity1.isExecuted).toBe(false);
    expect(activity211.isPrepared).toBe(false);
    expect(activity211.isExecuted).toBe(false);
    expect(activity22.isPrepared).toBe(false);
    expect(activity22.isExecuted).toBe(false);
  };
  activity1.onExecuteEnd = async () => {
    expect(await wrapper.getCurrentActivity()).toBe("activity 1");
  }

  activity211.onExecuteStart = async () => {
    expect(activity1.isExecuted).toBe(true);
    expect(activity211.isPrepared).toBe(true);
    expect(activity211.isExecuted).toBe(false);
    expect(activity22.isPrepared).toBe(false);
    expect(activity22.isExecuted).toBe(false);
  };
  activity211.onExecuteEnd = async () => {
    expect(await wrapper.getCurrentActivity()).toBe("course 2.course 21.activity 211");
  };
  activity22.onExecuteStart = async () => {
    expect(activity211.isExecuted).toBe(true);
    expect(activity22.isPrepared).toBe(true);
    expect(activity22.isExecuted).toBe(false);
  };
  activity22.onExecuteEnd = async () => {
    expect(await wrapper.getCurrentActivity()).toBe("course 2.activity 22");
  };

  await executor.execute();

  expect(activity22.isExecuted).toBe(true);
  expect(await wrapper.getCourseState()).toMatchObject({progress: 1, success: true});
});
