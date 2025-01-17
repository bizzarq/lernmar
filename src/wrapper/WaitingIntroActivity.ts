import { Activity } from "./Activity";
import { ActivityState } from "./ActivityState";


/**
 * Intro activity which waits for a function to resolve before continuing.
 */
class WaitingIntroActivity implements Activity {
  readonly name: string = "intro";
  readonly isMandatory: boolean = false;
  #wait: () => Promise<void>;
  #introContent: HTMLElement | undefined;
  #maxDelay: number = 10000;

  /**
   * constructor.
   * @param wait function creating a Promise which resolves when the waiting is done.
   * @param content content (either a string or HMTL element) to display while waiting.
   * @param maxDelay maximum time to wait for the promise to resolve in milliseconds.
   *   if maxDelay is not provided, default delay of 10000 is used. maxDelay <= 0 means no timeout.
   */
  constructor(wait: () => Promise<void>, content?: string | HTMLElement, maxDelay?: number) {
    this.#wait = wait;
    if (typeof content === "string") {
      const div = document.createElement("div");
      div.innerText = content;
      content = div;
    }
    this.#introContent = content;
    if (maxDelay !== undefined) {
      this.#maxDelay = maxDelay;
    }
  }

  /**
   * displays content and waits for the waitPromise to resolve.
   * @param section the section in which to display the content.
   * @returns activity complete. success is whether the waitPromise resolved before the maxDelay.
   */
  async execute(section: HTMLElement): Promise<ActivityState> {
    section.innerHTML = "";
    if (this.#introContent) {
      section.appendChild(this.#introContent);
    }
    let promises = [this.#wait()];
    if (this.#maxDelay > 0) {
      promises.push(new Promise((resolve, reject) => setTimeout(reject, this.#maxDelay)));
    }
    try {
      await Promise.race(promises);
      return {progress: 1, success: true};
    }
    catch {
      return {progress: 1, success: false};
    }
  }

}


export { WaitingIntroActivity };
