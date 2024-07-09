import { SourceMapConsumer } from 'source-map';

export function transform(sourceMaps, stackTrace) {
  const bindings = calculateBindings(sourceMaps, stackTrace);

  if (!stackTrace || Object.keys(bindings).length === 0) {
    return '';
  }

  const result = [stackTrace.message];

  const transformed = stackTrace.frames.map(stackFrame =>
    generateStackTraceLine(
      toUnifiedPosition(tryGetOriginalPosition(stackFrame, bindings) ?? stackFrame),
    ),
  );

  return result.concat(transformed).join('\n');
}

function tryGetOriginalPosition(stackFrame, bindings) {
  let result = null;

  const { column, file, line } = toUnifiedPosition(stackFrame);

  if (!file || !bindings[file] || !line || !column) {
    return null;
  }

  result = bindings[file].consumer.originalPositionFor({ column, line });

  return result;
}

function generateStackTraceLine(position) {
  const { column, file, line, method } = position;
  return `  at${method ? ` ${method}` : ''} (${file}:${line}:${column})`;
}

function toUnifiedPosition(position) {
  if (isStackFrame(position)) {
    return {
      column: position.column,
      file: position.file,
      line: position.lineNumber,
      method: position.methodName,
    };
  }

  return {
    column: position.column,
    file: position.source,
    line: position.line,
    method: position.name,
  };
}

function isStackFrame(position) {
  return 'lineNumber' in position;
}

function calculateBindings(sourceMaps, stackTrace) {
  if (!stackTrace || stackTrace.fileNames.length === 0 || sourceMaps.length === 0) {
    return {};
  }

  const bindings = {};

  for (const fileName of stackTrace.fileNames) {
    for (const sourceMap of sourceMaps) {
      if (fileName === sourceMap.fileNameInline || fileName === sourceMap.fileName) {
        bindings[fileName] = sourceMap;
      }
    }
  }

  return bindings;
}

