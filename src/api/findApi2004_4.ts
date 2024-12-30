import { ScormApi_2004_4 } from "./ScormApi2004_4";


/**
 * finds the Scorm API in the window or its parent.
 * @param maxTries number of parents to try before giving up (default 20).
 * @returns the nearest Scorm API.
 */
function findApi(maxTries?: number): ScormApi_2004_4 {
  if (!maxTries) {
    maxTries = 20;
  }
  let todos: Array<Window> = [window, window.opener];
  let tries = 0
  while (todos.length > 0 && tries < maxTries) {
    let testWindow = todos.shift();
    if (testWindow) {
      if (testWindow.API_1484_11) {
        return testWindow.API_1484_11;
      }
      let parent: Window | undefined = testWindow.parent;
      if (parent && parent != testWindow) {
        todos.unshift(parent);
      }
    }
  }
  throw new Error("cannot find Scorm API");
}


export { findApi };
