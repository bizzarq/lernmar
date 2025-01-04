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

  expect(activity1.isExecuted).toBe(false);
  expect(activity2.isExecuted).toBe(false);
  expect(activity3.isExecuted).toBe(false);
  expect(course.mandatoryActivities()).toBe(3);

  expect(course.nextActivity()).toBe("activity 1");
  let result = await course.executeActivity("unknown activity");
  expect(result).toMatchObject({ mandatory: false, complete: true, success: false });
  expect(activity1.isExecuted).toBe(false);
  expect(activity2.isExecuted).toBe(false);
  expect(activity3.isExecuted).toBe(false);

  expect(course.nextActivity()).toBe("activity 1");
  result = await course.executeActivity("activity 1");
  expect(result).toMatchObject({ mandatory: true, complete: true, success: true });
  expect(activity1.isExecuted).toBe(true);
  expect(activity2.isExecuted).toBe(false);
  expect(activity3.isExecuted).toBe(false);

  expect(course.nextActivity()).toBe("activity 2");
  result = await course.executeActivity("activity 2");
  expect(result).toMatchObject({ mandatory: true, complete: true, success: true });
  expect(activity1.isExecuted).toBe(true);
  expect(activity2.isExecuted).toBe(true);
  expect(activity3.isExecuted).toBe(false);

  expect(course.nextActivity()).toBe("activity 3");
  result = await course.executeActivity("activity 3");
  expect(result).toMatchObject({ mandatory: true, complete: true, success: true });
  expect(activity1.isExecuted).toBe(true);
  expect(activity2.isExecuted).toBe(true);
  expect(activity3.isExecuted).toBe(true);

  expect(course.nextActivity()).toBe("");
});

test('changed execution order', async () => {
  let section = document.createElement("section");
  let activity1 = new TestActivity("activity 1", true);
  let activity2 = new TestActivity("activity 2", true);
  let activity3 = new TestActivity("activity 3", true);
  let course = new Course(section, [activity1, activity2, activity3]);

  expect(course.nextActivity()).toBe("activity 1");
  let result = await course.executeActivity("activity 2");
  expect(result).toMatchObject({ mandatory: true, complete: true, success: true });

  expect(course.nextActivity()).toBe("activity 3");
  result = await course.executeActivity("activity 3");
  expect(result).toMatchObject({ mandatory: true, complete: true, success: true });

  expect(course.nextActivity()).toBe("activity 1");
  result = await course.executeActivity("activity 1");
  expect(result).toMatchObject({ mandatory: true, complete: true, success: true });

  expect(course.nextActivity()).toBe("");
});

test('incomplete activities', async () => {
  let section = document.createElement("section");
  let activity1 = new TestActivity("activity 1", true);
  let activity2 = new TestActivity("activity 2", true);
  let course = new Course(section, [activity1, activity2]);

  activity1.result = { mandatory: true, complete: false };
  expect(course.nextActivity()).toBe("activity 1");
  let result = await course.executeActivity("activity 1");
  expect(result).toMatchObject({ mandatory: true, complete: false });

  activity1.result = { mandatory: true, complete: true, success: false };
  expect(course.nextActivity()).toBe("activity 1");
  result = await course.executeActivity("activity 1");
  expect(result).toMatchObject({ mandatory: true, complete: true, success: false });
  
  activity2.result = { mandatory: true, complete: false };
  expect(course.nextActivity()).toBe("activity 2");
  result = await course.executeActivity("activity 2");
  expect(result).toMatchObject({ mandatory: true, complete: false });

  activity2.result = { mandatory: true, complete: true, success: true };
  expect(course.nextActivity()).toBe("activity 2");
  result = await course.executeActivity("activity 2");
  expect(result).toMatchObject({ mandatory: true, complete: true, success: true });
  
  expect(course.nextActivity()).toBe("");
});

test('empty course', async () => {
  let section = document.createElement("section");
  let course = new Course(section, []);
  expect(course.mandatoryActivities()).toBe(0);
  expect(course.nextActivity()).toBe("");
  let result = await course.executeActivity("unknown activity");
  expect(result).toMatchObject({ mandatory: false, complete: true, success: false });
  expect(course.nextActivity()).toBe("");
});

test('nested course, normal execution', async () => {
  let section = document.createElement("section");
  let activity1 = new TestActivity("activity 1", true);
  let activity211 = new TestActivity("activity 211", true);
  let course21 = new Course(section, [activity211], "course 21");
  let activity22 = new TestActivity("activity 22", true);
  let course2 = new Course(section, [course21, activity22], "course 2");
  let course = new Course(section, [activity1, course2]);

  expect(course21.mandatoryActivities()).toBe(1);
  expect(course2.mandatoryActivities()).toBe(2);
  expect(course.mandatoryActivities()).toBe(3);
  expect(activity1.isExecuted).toBe(false);
  expect(activity211.isExecuted).toBe(false);
  expect(activity22.isExecuted).toBe(false);

  expect(course21.nextActivity()).toBe("activity 211");
  expect(course2.nextActivity()).toBe("course 21.activity 211");
  expect(course.nextActivity()).toBe("activity 1");
  let result = await course.executeActivity("unknown activity");
  expect(result).toMatchObject({ mandatory: false, complete: true, success: false });
  expect(activity1.isExecuted).toBe(false);
  expect(activity211.isExecuted).toBe(false);
  expect(activity22.isExecuted).toBe(false);

  expect(course21.nextActivity()).toBe("activity 211");
  expect(course2.nextActivity()).toBe("course 21.activity 211");
  expect(course.nextActivity()).toBe("activity 1");
  result = await course.executeActivity("activity 1");
  expect(result).toMatchObject({ mandatory: true, complete: true, success: true });
  expect(activity1.isExecuted).toBe(true);
  expect(activity211.isExecuted).toBe(false);
  expect(activity22.isExecuted).toBe(false);

  expect(course21.nextActivity()).toBe("activity 211");
  expect(course2.nextActivity()).toBe("course 21.activity 211");
  expect(course.nextActivity()).toBe("course 2.course 21.activity 211");
  result = await course.executeActivity("course 2.course 21.activity 211");
  expect(result).toMatchObject({ mandatory: true, complete: true, success: true });
  expect(activity1.isExecuted).toBe(true);
  expect(activity211.isExecuted).toBe(true);
  expect(activity22.isExecuted).toBe(false);

  expect(course21.nextActivity()).toBe("");
  expect(course2.nextActivity()).toBe("activity 22");
  expect(course.nextActivity()).toBe("course 2.activity 22");
  result = await course.executeActivity("course 2.activity 22");
  expect(result).toMatchObject({ mandatory: true, complete: true, success: true });
  expect(activity1.isExecuted).toBe(true);
  expect(activity211.isExecuted).toBe(true);
  expect(activity22.isExecuted).toBe(true);

  expect(course21.nextActivity()).toBe("");
  expect(course2.nextActivity()).toBe("");
  expect(course.nextActivity()).toBe("");
});

test("checking prepare calls within normal course execution", async () => {
  let section = document.createElement("section");
  let activity1 = new TestActivity("activity 1", true);
  let activity2 = new TestActivity("activity 2", true);
  let activity3 = new TestActivity("activity 3", true);
  let course = new Course(section, [activity1, activity2, activity3]);

  expect(activity1.isPrepared).toBe(false);
  expect(activity2.isPrepared).toBe(false);
  expect(activity3.isPrepared).toBe(false);

  await course.executeActivity("intro");
  expect(activity1.isPrepared).toBe(true);
  expect(activity2.isPrepared).toBe(false);
  expect(activity3.isPrepared).toBe(false);

  await course.executeActivity("activity 1");
  expect(activity1.isPrepared).toBe(true);
  expect(activity2.isPrepared).toBe(true);
  expect(activity3.isPrepared).toBe(false);

  await course.executeActivity("activity 2");
  expect(activity1.isPrepared).toBe(true);
  expect(activity2.isPrepared).toBe(true);
  expect(activity3.isPrepared).toBe(true);
});

test("checking prepare calls in a nested course", async () => {
    let section = document.createElement("section");
    let activity1 = new TestActivity("activity 1", true);
    let activity211 = new TestActivity("activity 211", true);
    let course21 = new Course(section, [activity211], "course 21");
    let activity22 = new TestActivity("activity 22", true);
    let course2 = new Course(section, [course21, activity22], "course 2");
    let course = new Course(section, [activity1, course2]);

    expect(activity1.isPrepared).toBe(false);
    expect(activity211.isPrepared).toBe(false);
    expect(activity22.isPrepared).toBe(false);

    await course.executeActivity("intro");
    expect(activity1.isPrepared).toBe(true);
    expect(activity211.isPrepared).toBe(false);
    expect(activity22.isPrepared).toBe(false);

    await course.executeActivity("activity 1");
    expect(activity1.isPrepared).toBe(true);
    expect(activity211.isPrepared).toBe(true);
    expect(activity22.isPrepared).toBe(false);

    await course.executeActivity("course 2.course 21.activity 211");
    expect(activity1.isPrepared).toBe(true);
    expect(activity211.isPrepared).toBe(true);
    expect(activity22.isPrepared).toBe(true);

    await course.executeActivity("course 2.activity 22");
    expect(activity1.isPrepared).toBe(true);
    expect(activity211.isPrepared).toBe(true);
    expect(activity22.isPrepared).toBe(true);
});
