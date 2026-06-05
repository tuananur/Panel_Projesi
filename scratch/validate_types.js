const fs = require('fs');
const code = fs.readFileSync('c:\\Users\\Casper\\Desktop\\TEST\\src\\app\\dashboard\\client\\[id]\\stats\\stats-content.jsx', 'utf8');
const lines = code.split('\n');

const renderSlidesCode = lines.slice(480, 1263).join('\n');
const words = new Set(renderSlidesCode.match(/[a-zA-Z_$][a-zA-Z0-9_$]*/g));

const globals = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue',
  'true', 'false', 'null', 'undefined', 'NaN', 'Infinity', 'this', 'new', 'typeof', 'instanceof', 'in', 'of', 'void', 'delete',
  'Math', 'round', 'max', 'min', 'abs', 'floor', 'ceil', 'sin', 'cos', 'tan', 'log', 'exp', 'pow', 'sqrt', 'random', 'PI',
  'Object', 'keys', 'values', 'entries', 'assign', 'create', 'defineProperty', 'freeze', 'seal', 'preventExtensions',
  'Array', 'isArray', 'from', 'of', 'prototype', 'push', 'pop', 'shift', 'unshift', 'splice', 'slice', 'concat', 'join',
  'split', 'reverse', 'sort', 'filter', 'map', 'forEach', 'reduce', 'reduceRight', 'some', 'every', 'find', 'findIndex',
  'indexOf', 'lastIndexOf', 'includes', 'fill', 'copyWithin', 'flat', 'flatMap',
  'String', 'Number', 'Boolean', 'Date', 'RegExp', 'Error', 'EvalError', 'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError', 'URIError',
  'JSON', 'parse', 'stringify', 'console', 'log', 'error', 'warn', 'info', 'dir', 'time', 'timeEnd', 'trace', 'assert',
  'Set', 'Map', 'WeakSet', 'WeakMap', 'Promise', 'all', 'race', 'resolve', 'reject', 'then', 'catch', 'finally',
  'window', 'document', 'navigator', 'location', 'history', 'screen', 'performance', 'localStorage', 'sessionStorage',
  'React', 'useState', 'useEffect', 'useContext', 'useReducer', 'useCallback', 'useMemo', 'useRef', 'useImperativeHandle',
  'useLayoutEffect', 'useDebugValue', 'className', 'style', 'key', 'id', 'src', 'alt', 'width', 'height', 'viewBox', 'fill',
  'stroke', 'strokeWidth', 'strokeLinecap', 'strokeLinejoin', 'cx', 'cy', 'r', 'x1', 'y1', 'x2', 'y2', 'd', 'points', 'rect',
  'line', 'circle', 'polygon', 'path', 'g', 'svg', 'div', 'span', 'img', 'h1', 'h2', 'h3', 'p', 'a', 'br', 'hr', 'strong',
  'em', 'u', 's', 'small', 'big', 'sub', 'sup', 'b', 'i', 'code', 'pre', 'blockquote', 'ol', 'ul', 'li', 'dl', 'dt', 'dd',
  'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot', 'col', 'colgroup', 'caption', 'form', 'input', 'button', 'select',
  'option', 'textarea', 'label', 'fieldset', 'legend', 'datalist', 'keygen', 'output', 'progress', 'meter', 'details',
  'summary', 'menu', 'menuitem', 'canvas', 'svg', 'math', 'track', 'video', 'audio', 'source', 'embed', 'object', 'param',
  'iframe', 'area', 'map', 'link', 'meta', 'style', 'title', 'head', 'body', 'html',
  'idx', 'i', 'p', 'idx2', 'c', 't', 'd', 'x', 'y', 'val', 'item', 'd2', 'day', 'week', 'platform', 'status', 'note',
  'PLATFORM_ICONS', 'safeFormatDate', 'accountLinkText', 'accountUrl'
]);

words.forEach(word => {
  if (globals.has(word)) return;
  const regex = new RegExp('\\b(const|let|var|function|class)\\s+' + word + '\\b');
  if (regex.test(renderSlidesCode)) return;
  
  if (word === 'activeIndex' || word === 'showAll') return;
  
  // check if defined in file
  const isImported = code.includes('import') && code.includes(word);
  const isDefined = new RegExp('\\b(const|let|var|function|class)\\s+' + word + '\\b').test(code);
  const isProp = word === 'client' || word === 'metaResult' || word === 'googleResult' || word === 'analyticsResult';
  
  if (!isImported && !isDefined && !isProp) {
    // Only print actual variables (alphanumeric english words)
    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(word) && word.length > 2) {
      console.log(`⚠️ WARNING: "${word}" is used in renderSlides but might not be defined or imported!`);
    }
  }
});
