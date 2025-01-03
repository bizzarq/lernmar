/**
 * @jest-environment jsdom
 */
import { Course } from "../../src/wrapper/Course";
import { TestActivity } from "./TestActivity";


test('normal execution', async () => {
  let section = document.createElement("section");
  let activity1 = new TestActivity("activity 1", true);
  let activity2 = new TestActivity("activity 2", true);
  let activity3 = new TestActivity("activity 3", true);
  let course = new Course(section, [activity1, activity2, activity3]);

  expect(course.mandatoryActivities()).toBe(3);
  expect(course.nextActivity()).toBe("activity 1");
  let result = await course.executeActivity("unknown activity");
  expect(result).toMatchObject({ mandatory: false, complete: true, success: false });

  expect(course.nextActivity()).toBe("activity 1");
  result = await course.executeActivity("activity 1");
  expect(result).toMatchObject({ mandatory: true, complete: true, success: true });

  expect(course.nextActivity()).toBe("activity 2");
  result = await course.executeActivity("activity 2");
  expect(result).toMatchObject({ mandatory: true, complete: true, success: true });

  expect(course.nextActivity()).toBe("activity 3");
  result = await course.executeActivity("activity 3");
  expect(result).toMatchObject({ mandatory: true, complete: true, success: true });

  expect(course.nextActivity()).toBe("");
});
