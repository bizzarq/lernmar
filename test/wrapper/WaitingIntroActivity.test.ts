/**
 * @jest-environment jsdom
 */
import { WaitingIntroActivity } from "../../src/wrapper/WaitingIntroActivity";


test("normal execution", async () => {
  let message = document.createElement("div");
  let resolve = () => {};
  let wait = () => new Promise<void>((resolve2) => resolve = resolve2);
  let intro = new WaitingIntroActivity(wait, message);

  let section = document.createElement("section");
  expect(section.childNodes.length).toBe(0);
  let introPromise = intro.execute(section);
  expect(section.childNodes.length).toBe(1);
  expect(section.firstChild).toBe(message);
  resolve();
  await expect(introPromise).resolves.toMatchObject({progress: 1, success: true});
});

test("with exception string instead of HTML", async () => {
  let message = "test message";
  let reject = () => {};
  let wait = () => new Promise<void>((resolve, reject2) => reject = reject2);
  let intro = new WaitingIntroActivity(wait, message);

  let section = document.createElement("section");
  expect(section.childNodes.length).toBe(0);
  let introPromise = intro.execute(section);
  expect(section.childNodes.length).toBe(1);
  let div = section.firstChild as HTMLElement;
  expect(div.innerText).toBe(message);
  reject();
  await expect(introPromise).resolves.toMatchObject({progress: 1, success: false});
});
