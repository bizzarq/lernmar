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
  expect(result).toMatchObject({ mandatory: false, progress: 1, success: false });
  expect(activity1.isExecuted).toBe(false);
  expect(activity2.isExecuted).toBe(false);
  expect(activity3.isExecuted).toBe(false);

  expect(course.nextActivity()).toBe("activity 1");
  result = await course.executeActivity("activity 1");
  expect(result).toMatchObject({ mandatory: true, progress: 1, success: true });
  expect(activity1.isExecuted).toBe(true);
  expect(activity2.isExecuted).toBe(false);
  expect(activity3.isExecuted).toBe(false);

  expect(course.nextActivity()).toBe("activity 2");
  result = await course.executeActivity("activity 2");
  expect(result).toMatchObject({ mandatory: true, progress: 1, success: true });
  expect(activity1.isExecuted).toBe(true);
  expect(activity2.isExecuted).toBe(true);
  expect(activity3.isExecuted).toBe(false);

  expect(course.nextActivity()).toBe("activity 3");
  result = await course.executeActivity("activity 3");
  expect(result).toMatchObject({ mandatory: true, progress: 1, success: true });
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
  expect(result).toMatchObject({ mandatory: true, progress: 1, success: true });

  expect(course.nextActivity()).toBe("activity 3");
  result = await course.executeActivity("activity 3");
  expect(result).toMatchObject({ mandatory: true, progress: 1, success: true });

  expect(course.nextActivity()).toBe("activity 1");
  result = await course.executeActivity("activity 1");
  expect(result).toMatchObject({ mandatory: true, progress: 1, success: true });

  expect(course.nextActivity()).toBe("");
});

test('incomplete activities', async () => {
  let section = document.createElement("section");
  let activity1 = new TestActivity("activity 1", true);
  let activity2 = new TestActivity("activity 2", true);
  let course = new Course(section, [activity1, activity2]);

  activity1.result = { mandatory: true, progress: 0 };
  expect(course.nextActivity()).toBe("activity 1");
  let result = await course.executeActivity("activity 1");
  expect(result).toMatchObject({ mandatory: true, progress: 0});

  activity1.result = { mandatory: true, progress: 1, success: false };
  expect(course.nextActivity()).toBe("activity 1");
  result = await course.executeActivity("activity 1");
  expect(result).toMatchObject({ mandatory: true, progress: 1, success: false });
  
  activity2.result = { mandatory: true, progress: 0 };
  expect(course.nextActivity()).toBe("activity 2");
  result = await course.executeActivity("activity 2");
  expect(result).toMatchObject({ mandatory: true, progress: 0 });

  activity2.result = { mandatory: true, progress: 1, success: true };
  expect(course.nextActivity()).toBe("activity 2");
  result = await course.executeActivity("activity 2");
  expect(result).toMatchObject({ mandatory: true, progress: 1, success: true });
  
  expect(course.nextActivity()).toBe("");
});

test('empty course', async () => {
  let section = document.createElement("section");
  let course = new Course(section, []);
  expect(course.mandatoryActivities()).toBe(0);
  expect(course.nextActivity()).toBe("");
  let result = await course.executeActivity("unknown activity");
  expect(result).toMatchObject({ mandatory: false, progress: 1, success: false });
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
  expect(result).toMatchObject({ mandatory: false, progress: 1, success: false });
  expect(activity1.isExecuted).toBe(false);
  expect(activity211.isExecuted).toBe(false);
  expect(activity22.isExecuted).toBe(false);

  expect(course21.nextActivity()).toBe("activity 211");
  expect(course2.nextActivity()).toBe("course 21.activity 211");
  expect(course.nextActivity()).toBe("activity 1");
  result = await course.executeActivity("activity 1");
  expect(result).toMatchObject({ mandatory: true, progress: 1, success: true });
  expect(activity1.isExecuted).toBe(true);
  expect(activity211.isExecuted).toBe(false);
  expect(activity22.isExecuted).toBe(false);

  expect(course21.nextActivity()).toBe("activity 211");
  expect(course2.nextActivity()).toBe("course 21.activity 211");
  expect(course.nextActivity()).toBe("course 2.course 21.activity 211");
  result = await course.executeActivity("course 2.course 21.activity 211");
  expect(result).toMatchObject({ mandatory: true, progress: 1, success: true });
  expect(activity1.isExecuted).toBe(true);
  expect(activity211.isExecuted).toBe(true);
  expect(activity22.isExecuted).toBe(false);

  expect(course21.nextActivity()).toBe("");
  expect(course2.nextActivity()).toBe("activity 22");
  expect(course.nextActivity()).toBe("course 2.activity 22");
  result = await course.executeActivity("course 2.activity 22");
  expect(result).toMatchObject({ mandatory: true, progress: 1, success: true });
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

test("checking course result in a nested course", async () => {
  let section = document.createElement("section");
  // course 1: narrow success in incomplete non-mandatory activity
  let activity11 = new TestActivity("activity 11", false, {
    mandatory: false, progress: 0, score: 75, maxScore: 100
  });
  let activity12 = new TestActivity("activity 12", true, {
    mandatory: true, progress: 1, success: true, score: 85, maxScore: 100
  });
  let course1 = new Course(section, [activity11, activity12], "course 1");
  // course 2: no success because of bad score in non-mandatory activity
  let activity21 = new TestActivity("activity 21", false, {
    mandatory: false, progress: 1, success: true, score: 74, maxScore: 100
  });
  let activity22 = new TestActivity("activity 22", true, {
    mandatory: true, progress: 1, success: true, score: 85, maxScore: 100
  });
  let course2 = new Course(section, [activity21, activity22], "course 2");
  // course 3. incomplete despite good score
  let activity31 = new TestActivity("activity 31", true, {
    mandatory: true, progress: 1, success: true, score: 100, maxScore: 100
  });
  let activity32 = new TestActivity("activity 32", true, {
    mandatory: true, progress: 0, score: 100, maxScore: 100
  });
  let course3 = new Course(section, [activity31, activity32], "course 3");

  let course = new Course(section, [course1, course2, course3]);

  expect(course1.courseState()).toMatchObject({mandatory: true, progress: 0});
  expect(course2.courseState()).toMatchObject({mandatory: true, progress: 0});
  expect(course3.courseState()).toMatchObject({mandatory: true, progress: 0});
  expect(course.courseState()).toMatchObject({mandatory: true, progress: 0});
      
  await course.executeActivity("course 1.activity 11");
  await course.executeActivity("course 1.activity 12");

  expect(course1.courseState()).toMatchObject({
    mandatory: true, progress: 1, success: true, score: 160, maxScore: 200
  });
  expect(course.courseState()).toMatchObject({
    mandatory: true, progress: 0.25, score: 160, maxScore: 200
  });

  await course.executeActivity("course 2.activity 21");
  await course.executeActivity("course 2.activity 22");

  expect(course2.courseState()).toMatchObject({
    mandatory: true, progress: 1, success: false, score: 159, maxScore: 200
  });
  expect(course.courseState()).toMatchObject({
    mandatory: true, progress: 0.5, score: 319, maxScore: 400
  });

  await course.executeActivity("course 3.activity 31");
  await course.executeActivity("course 3.activity 32");

  expect(course3.courseState()).toMatchObject({
    mandatory: true, progress: 0.5, score: 200, maxScore: 200
  });
  expect(course.courseState()).toMatchObject({
    mandatory: true, progress: 0.75, score: 519, maxScore: 600
  });

});
