import { nanoid } from "nanoid"
import { SourceMapConsumer } from "source-map"

export class SourceMap {
  constructor(consumer, fileNameInline, fileName) {
    this.id = nanoid();
    this.consumer = consumer;
    this.fileNameInline = fileNameInline;
    this.fileName = fileName;
  }

  static async create(rawSourceMap, sourceMapFileName) {
    let parsed;
    try {
      parsed = JSON.parse(rawSourceMap);
    } catch {
      parsed = null;
    }

    if (!parsed || !SourceMap.isRawSourceMap(parsed)) {
      return null;
    }

    const consumer = await new SourceMapConsumer(rawSourceMap);
    const fileNameInline = parsed.file;

    return new SourceMap(consumer, fileNameInline, sourceMapFileName);
  }

  static isRawSourceMap(sourceMap) {
    return (
      'version' in sourceMap &&
      'sources' in sourceMap &&
      'names' in sourceMap &&
      'mappings' in sourceMap
    );
  }

  isEqual(sourceMap) {
    return this.fileNameInline === sourceMap.fileNameInline;
  }
}

export default SourceMap;

