import { parse } from "stacktrace-parser"

export class StackTrace {
  constructor(rawStackTrace) {
    const frames = parse(rawStackTrace);

    this.frames = frames;
    this.message = this.#extractErrorMessage(rawStackTrace);
    this.fileNames = this.#extractFileNames(frames);
  }

  static create(rawStackTrace) {
    const trimmed = rawStackTrace.trim();

    if (!trimmed) {
      return null;
    }

    const stackTrace = new StackTrace(rawStackTrace);

    if (stackTrace.frames.length === 0) {
      return null;
    }

    return stackTrace;
  }

  #extractErrorMessage(stackTrace) {
    return stackTrace.split('\n')[0];
  }

  #extractFileNames(frames) {
    const files = new Set();

    frames.forEach(f => f.file && files.add(f.file));

    return Array.from(files);
  }
}

export default StackTrace;

