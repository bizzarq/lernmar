interface Learner {
  readonly id: string,
  readonly name: string,
}

interface CourseParts {
  [name: string]: {required?: boolean, maxScore?: number},
}

interface CourseWrapper {

  /**
   * start the course. calling this function is optional.
   */
  start(): Promise<void>;

  /**
   * stop the course and hand over to the Learn Management System.
   * @param progress the progress inside the course as a number between 0 (not started) and 1
   *   (complete). if omitted, no progress will be reported to the LMS.
   * @param success whether the course was completed successfully.
   *  ignored if progress is undefined, overwritten with false if progress < 1.
   *  if undefined set to progress == 1.
   */
  stop(progress?: number, success?: boolean): Promise<void>;

  /**
   * report course progress to the Learn Management System.
   * @param progress the progress inside the course as a number between 0 (not started) and 1
   *   (complete).
   * the other functions is called.
   * @param success whether the course was completed successfully. overwritten with false if 
   * progress < 1. if undefined set to progress == 1.
   */
  reportProgress(progress: number, success?: boolean): Promise<void>;

  /**
   * get the learner data (id and name).
   */
  getLearner(): Promise<Learner>;

  /**
   * start a part of the course (e.g. a chapter or a slide). calling this function is not required.
   * however, if it is not called, it will not be possible to resume sessions at the part it was
   * interrupted before.
   * @param name: name of part (must be unique).
   */
  startPart(name: string): Promise<void>;

  /**
   * @returns the name of last known part which was started with startPart() or null if last part
   *   is not known.
   */
  getLastStartedPart(): Promise<string | null>;

  /**
   * mark a part (e.g. a chapter or a slide) of this course as completed.
   * @param name name of part (must be unique).
   * @param success whether the part was completed with success. the course itself needs to decide
   *    whether an unsuccessful part can be re-taken or not. default value is true.
   * @param score score achieved. must be >= 0. if omitted, no score is recorded.
   * @param maxScore: maximum score possible for this part. must be >= score.
   */
  completePart(name: string, success?: boolean, score?: number, maxScore?: number): Promise<void>;

  /**
   * get the current state of a course part (e.g. a chapter or a slide). this includes also
   * information from previouse sessions (if they had been recorded).
   * @param name name of part.
   * @returns whether the part was completed, and if yes, if it was successful and the reported score.
   */
  getPartState(name: string): Promise<[boolean, boolean, number] | [boolean, boolean]>;
}


export { CourseWrapper };
