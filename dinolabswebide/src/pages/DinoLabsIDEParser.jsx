/**
 * @param {string} str 
 * @returns {string} 
*/
export const escapeHtml = (str) => {
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
};

/**
 * @param {string} string 
 * @returns {string}
*/
export const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * @param {string} language 
 * @returns {Array<string>} 
*/
export const getTokenPatterns = (language) => {
    switch (language.toLowerCase()) {
        case 'python':
            return [
                `\\b(${[
                    'False', 'class', 'finally', 'is', 'return',
                    'None', 'continue', 'for', 'lambda', 'try',
                    'True', 'def', 'from', 'nonlocal', 'while',
                    'and', 'del', 'global', 'not', 'with',
                    'as', 'elif', 'if', 'or', 'yield',
                    'assert', 'else', 'import', 'pass',
                    'break', 'except', 'in', 'raise',
                    'async', 'await', 'match', 'case'
                ].join('|')})\\b`,
                `(@[a-zA-Z_][a-zA-Z0-9_]*)`,
                `("([^"\\\\]|\\\\.)*"|'([^'\\\\]|\\\\.)*')`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\b(?=\\()`,
                `(\\b\\d+(\\.\\d+)?\\b)`,
                `([+\\-*/%=&|<>!^~()\\[\\]{}]+)`,
                `("""[\\s\\S]*?"""|'''[\\s\\S]*?''')`,
                `(#.*)`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b`,
                `\\b(${[
                    'print', 'len', 'range', 'open', 'str', 'int', 'float', 'list', 'dict', 'set', 'tuple', 'super', 'self'
                ].join('|')})\\b`,
                `\\b(${[
                    'self', 'cls'
                ].join('|')})\\b`,
                `\\b(${[
                    'async', 'await'
                ].join('|')})\\b`,
                `\\b(${[
                    'List', 'Dict', 'Tuple', 'Optional', 'Union', 'Any', 'Callable', 'Iterable', 'Iterator', 'Generator', 'TypeVar', 'Generic', 'Protocol'
                ].join('|')})\\b`,
                `__([a-zA-Z_]+)__`
            ];
        case 'typescript':
            return [
                `\\b(${[
                    'break', 'case', 'catch', 'class', 'const',
                    'continue', 'debugger', 'default', 'delete', 'do',
                    'else', 'export', 'extends', 'finally', 'for',
                    'function', 'if', 'import', 'in', 'instanceof',
                    'let', 'new', 'return', 'super', 'switch',
                    'this', 'throw', 'try', 'typeof', 'var',
                    'void', 'while', 'with', 'yield', 'await',
                    'implements', 'interface', 'package',
                    'private', 'protected', 'public', 'static', 'enum',
                    'null', 'true', 'false', 'as', 'async', 'await',
                    'declare', 'from', 'get', 'module', 'of', 'set', 'type'
                ].join('|')})\\b`,
                `(@[a-zA-Z_][a-zA-Z0-9_]*)`,
                `((?:"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'))`,
                `((?:\\/\\/.*)|(?:\\/\\*[^*]*\\*+(?:[^/*][^*]*\\*+)\\/))`,
                `(\\b\\d+(?:\\.\\d+)?\\b)`,
                `([==!=<>]=|[-+*/%&|^~<>()\\[\\]{}]=?)`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b(?=\\()`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b`,
                `\\b(${[
                    'console', 'window', 'document', 'require', 'module', 'exports', 'React', 'useState', 'useEffect', 'props', 'state'
                ].join('|')})\\b`,
                `\\b(${[
                    'Array', 'String', 'Number', 'Boolean', 'Object', 'Function', 'Date', 'RegExp', 'Map', 'Set', 'WeakMap', 'WeakSet', 'Promise', 'ReadonlyArray', 'Symbol', 'BigInt'
                ].join('|')})\\b`,
                `\\b(${[
                    'Array', 'String', 'Number', 'Boolean', 'Object', 'Function', 'Date', 'RegExp', 'Map', 'Set', 'WeakMap', 'WeakSet', 'Promise', 'ReadonlyArray', 'Symbol', 'BigInt'
                ].join('|')})\\b`,
                `</?[A-Z][A-Za-z0-9]+\\b`,
                `\\$\{[^}]+\}`
            ];
        case 'javascript':
        case 'react':
        case 'node':
        case 'express':
            return [
                `\\b(${[
                    'break', 'case', 'catch', 'class', 'const',
                    'continue', 'debugger', 'default', 'delete', 'do',
                    'else', 'export', 'extends', 'finally', 'for',
                    'function', 'if', 'import', 'in', 'instanceof',
                    'let', 'new', 'return', 'super', 'switch',
                    'this', 'throw', 'try', 'typeof', 'var',
                    'void', 'while', 'with', 'yield', 'await',
                    'implements', 'interface', 'package',
                    'private', 'protected', 'public', 'static', 'enum',
                    'null', 'true', 'false'
                ].join('|')})\\b`,
                `(@[a-zA-Z_][a-zA-Z0-9_]*)`,
                `((?:"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'|\\\`(?:[^\\\`\\\\]|\\\\.)*\\\`))`,
                `((?:\\/\\/.*)|(?:\\/\\*[^*]*\\*+(?:[^/*][^*]*\\*+)\\/))`,
                `(\\b\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?\\b)`,
                `(\/(?:\\\/|[^\/\n])+\/[gimsuy]*)`,
                `([==!=<>]=|[-+*/%&|^~<>()\\[\\]{}]=?|===|!==|>>>=|<<=|>>=)`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b(?=\\()`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b`,
                `\\b(${[
                    'console', 'window', 'document', 'require', 'module', 'exports', 'React', 'useState', 'useEffect', 'props', 'state'
                ].join('|')})\\b`,
                `\\b(${[
                    'Array', 'String', 'Number', 'Boolean', 'Object', 'Function', 'Date', 'RegExp', 'Map', 'Set', 'WeakMap', 'WeakSet', 'Promise', 'ReadonlyArray', 'Symbol', 'BigInt'
                ].join('|')})\\b`,
                `</?[A-Z][A-Za-z0-9]+\\b`,
                `\\$\{[^}]+\}`
            ];
        case 'bash':
        case 'shell':
            return [
                `\\b(${[
                    'if', 'then', 'else', 'fi', 'for', 'while', 'do', 'done',
                    'case', 'esac', 'function', 'in', 'select', 'until', 'declare',
                    'readonly', 'return', 'continue', 'break', 'export',
                    'local', 'shift', 'getopts', 'echo', 'printf', 'source',
                    'alias', 'unalias', 'true', 'false', 'cd', 'pwd', 'ls', 'grep', 'awk', 'sed',
                    'mkdir', 'rmdir', 'touch', 'rm', 'cp', 'mv', 'chmod', 'chown',
                    'declare', 'typeset', 'readonly', 'let'
                ].join('|')})\\b`,
                `\\b(${[
                    'echo', 'printf', 'cd', 'pwd', 'ls', 'grep', 'awk', 'sed',
                    'mkdir', 'rmdir', 'touch', 'rm', 'cp', 'mv', 'chmod', 'chown',
                    'declare', 'typeset', 'readonly', 'let'
                ].join('|')})\\b`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)`,
                `(\\$\\[a-zA-Z_][a-zA-Z0-9_]*\\|\\$[a-zA-Z_][a-zA-Z0-9_]*)`,
                `(@[a-zA-Z_][a-zA-Z0-9_]*)`,
                `("(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')`,
                `(#.*)`,
                `\\b(\\d+(?:\\.\\d+)?)\\b`,
                `([;&|<>!+\\-*/%=()\\[\\]{}]+)`,
                `(/(?:[a-zA-Z0-9_.-]+/)*[a-zA-Z0-9_.-]+)`
            ];
        case 'c':
            return [
                `(#\\s*(?:include|define|ifndef|ifdef|endif|else|elif|if|pragma|undef|line|error|warning)\\b[^\n]*)`,
                `\\b(${[
                    'auto', 'break', 'case', 'char', 'const', 'continue', 'default',
                    'do', 'double', 'else', 'enum', 'extern', 'float', 'for',
                    'goto', 'if', 'inline', 'int', 'long', 'register', 'restrict',
                    'return', 'short', 'signed', 'sizeof', 'static', 'struct',
                    'switch', 'typedef', 'union', 'unsigned', 'void', 'volatile',
                    'while'
                ].join('|')})\\b`,
                `(@[a-zA-Z_][a-zA-Z0-9_]*)`,
                `((?:"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'))`,
                `((?:\\/\\/.*)|(?:\\/\\*[^*]*\\*+(?:[^/*][^*]*\\*+)\\/))`,
                `(\\b\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?\\b)`,
                `([==!=<>]=|[-+*/%&|^~<>()\\[\\]{}]=?|->|\\.|,)`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b(?=\\()`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b`,
                `#include\\s*<[^>]+>`,
                `#ifndef\\s+\\w+`,
                `#define\\s+\\w+`,
                `#endif`,
                `\\b(${[
                    'printf', 'scanf', 'cout', 'cin', 'std', 'this', 'super', 'self', 'new', 'delete', 'nullptr',
                    'std', 'vector', 'map', 'unordered_map', 'string', 'iostream', 'cin', 'cout'
                ].join('|')})\\b`,
                `\\b(${[
                    'std', 'vector', 'map', 'unordered_map', 'string', 'iostream', 'cin', 'cout'
                ].join('|')})\\b`,
                `\\b(${[
                    'nullptr', 'NULL'
                ].join('|')})\\b`,
                `<\\s*typename\\s+[a-zA-Z_][a-zA-Z0-9]*\\s*>`,
                `:\\s*(public|protected|private)\\s+[a-zA-Z_][a-zA-Z0-9_]*`
            ];
        case 'c++':
            return [
                `(#\\s*(?:include|define|ifndef|ifdef|endif|else|elif|if|pragma|undef|line|error|warning)\\b[^\n]*)`,
                `\\b(${[
                    'auto', 'break', 'case', 'char', 'const', 'continue', 'default',
                    'do', 'double', 'else', 'enum', 'extern', 'float', 'for',
                    'goto', 'if', 'inline', 'int', 'long', 'register', 'restrict',
                    'return', 'short', 'signed', 'sizeof', 'static', 'struct',
                    'switch', 'typedef', 'union', 'unsigned', 'void', 'volatile',
                    'while', 'class', 'public', 'private', 'protected', 'namespace',
                    'using', 'template', 'typename', 'virtual', 'override', 'impl',
                    'let', 'var', 'func', 'mut', 'ref', 'as', 'where', 'async',
                    'await', 'trait', 'impl', 'enum', 'type', 'interface', 'abstract',
                    'sealed', 'partial', 'delegate', 'event', 'readonly', 'volatile',
                    'unsafe', 'fixed', 'extern', 'yield', 'dynamic', 'virtual', 'partial'
                ].join('|')})\\b`,
                `(@[a-zA-Z_][a-zA-Z0-9_]*)`,
                `((?:"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'))`,
                `((?:\\/\\/.*)|(?:\\/\\*[^*]*\\*+(?:[^/*][^*]*\\*+)\\/))`,
                `(\\b\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?\\b)`,
                `([==!=<>]=|[-+*/%&|^~<>]=?|::|->|\\.\\.{2,})`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b(?=\\()`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b`,
                `#include\\s*<[^>]+>`,
                `#ifndef\\s+\\w+`,
                `#define\\s+\\w+`,
                `#endif`,
                `\\b(${[
                    'printf', 'scanf', 'cout', 'cin', 'std', 'this', 'super', 'self', 'new', 'delete', 'nullptr',
                    'std', 'vector', 'map', 'unordered_map', 'string', 'iostream', 'cin', 'cout'
                ].join('|')})\\b`,
                `\\b(${[
                    'std', 'vector', 'map', 'unordered_map', 'string', 'iostream', 'cin', 'cout'
                ].join('|')})\\b`,
                `\\b(${[
                    'nullptr', 'NULL'
                ].join('|')})\\b`,
                `<\\s*typename\\s+[a-zA-Z_][a-zA-Z0-9]*\\s*>`,
                `:\\s*(public|protected|private)\\s+[a-zA-Z_][a-zA-Z0-9_]*`
            ];
        case 'c#':
            return [
                `(#\\s*(?:include|define|ifndef|ifdef|endif|else|elif|if|pragma|undef|line|error|warning)\\b[^\n]*)`,
                `\\b(${[
                    'abstract', 'and', 'as', 'base', 'bool', 'break', 'byte', 'case',
                    'catch', 'char', 'checked', 'class', 'const', 'continue', 'decimal',
                    'default', 'delegate', 'do', 'double', 'else', 'enum', 'event',
                    'explicit', 'extern', 'false', 'finally', 'fixed', 'float', 'for',
                    'foreach', 'goto', 'if', 'implicit', 'in', 'int', 'interface',
                    'internal', 'is', 'lock', 'long', 'namespace', 'new', 'null',
                    'object', 'operator', 'out', 'override', 'params', 'private',
                    'protected', 'public', 'readonly', 'ref', 'return', 'sbyte',
                    'sealed', 'short', 'sizeof', 'stackalloc', 'static', 'string',
                    'struct', 'switch', 'this', 'throw', 'true', 'try', 'typeof',
                    'uint', 'ulong', 'unchecked', 'unsafe', 'ushort', 'using',
                    'virtual', 'void', 'volatile', 'while'
                ].join('|')})\\b`,
                `(@[a-zA-Z_][a-zA-Z0-9_]*)`,
                `((?:"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'))`,
                `((?:\\/\\/.*)|(?:\\/\\*[^*]*\\*+(?:[^/*][^*]*\\*+)\\/))`,
                `(\\b\\d+(?:\\.\\d+)?\\b)`,
                `([==!=<>]=|[-+*/%&|^~<>]=?)`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b(?=\\()`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b`,
                `#define\\s+[a-zA-Z_][a-zA-Z0-9_]*`,
                `#using\\s+["<][^">]+[">]`,
                `#namespace\\s+[a-zA-Z_][a-zA-Z0-9_.]*`,
                `\\b(${[
                    'Console', 'Math', 'String', 'List', 'Dictionary', 'Array', 'Task', 'Exception', 'Convert', 'Environment', 'Guid', 'DateTime', 'TimeSpan', 'Nullable', 'IEnumerable', 'IList', 'ICollection', 'Stream', 'File', 'Directory'
                ].join('|')})\\b`,
                `\\b(${[
                    'Int32', 'Int64', 'String', 'Boolean', 'Double', 'Decimal', 'Object', 'Void', 'Char', 'Byte', 'Float', 'UInt32', 'UInt64', 'Short', 'UShort', 'Long', 'ULong', 'SByte'
                ].join('|')})\\b`,
                `<[a-zA-Z_][a-zA-Z0-9_, ]*>`,
                `\\b(${[
                    'System', 'Microsoft', 'Collections', 'Generic', 'Linq', 'Text', 'Tasks'
                ].join('|')})\\b`,
                `\\b([A-Z][a-zA-Z0-9_]*)\\b`
            ];
        case 'swift':
            return [
                `\\b(${[
                    'import', 'class', 'deinit', 'enum', 'extension', 'func',
                    'init', 'let', 'protocol', 'struct', 'subscript',
                    'typealias', 'var', 'break', 'case', 'continue', 'default',
                    'defer', 'do', 'else', 'fallthrough', 'for', 'guard', 'if',
                    'in', 'repeat', 'return', 'switch', 'where', 'while', 'as',
                    'Any', 'catch', 'false', 'is', 'nil', 'rethrows', 'super',
                    'self', 'Self', 'throw', 'throws', 'true', 'try', 'associatedtype',
                    'dynamic', 'fileprivate', 'final', 'inout', 'lazy', 'open',
                    'nonmutating', 'optional', 'override', 'private', 'public',
                    'required', 'static', 'unowned', 'weak', 'willSet', 'didSet',
                    'throws', 'async', 'await', 'actor', 'convenience', 'dynamicType'
                ].join('|')})\\b`,
                `(@[a-zA-Z_][a-zA-Z0-9_]*)`,
                `((?:"(?:[^"\\\\]|\\\\.)*")|(?:'(?:[^'\\\\]|\\\\.)*'))`,
                `((?:\\/\\/.*)|(?:\\/\\*[^*]*\\*+(?:[^/*][^*]*\\*+)\\/))`,
                `(\\b\\d+(?:\\.\\d+)?\\b)`,
                `([==!=<>]=|[-+*/%&|^~<>()\\[\\]{}]=?|\\.|\?|:)`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b(?=\\()`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b`,
                `\\b(${[
                    'print', 'map', 'filter', 'reduce', 'guard', 'guard let', 'guard var', 'let', 'var'
                ].join('|')})\\b`,
                `\\b(${[
                    'Int', 'String', 'Bool', 'Double', 'Float', 'Array', 'Dictionary', 'Set', 'Optional', 'Any', 'AnyObject', 'Void', 'Never'
                ].join('|')})\\b`,
                `\\b(${[
                    'self', 'super'
                ].join('|')})\\b`,
                `:\\s*([A-Z][a-zA-Z0-9_]*|[a-z]+)`
            ];
        case 'php':
            return [
                `\\b(${[
                    'abstract', 'and', 'array', 'as', 'break', 'callable', 'case',
                    'catch', 'class', 'clone', 'const', 'continue', 'declare', 'default',
                    'die', 'do', 'echo', 'else', 'elseif', 'empty', 'enddeclare',
                    'endfor', 'endforeach', 'endif', 'endswitch', 'endwhile', 'extends',
                    'final', 'finally', 'fn', 'for', 'foreach', 'function', 'global',
                    'goto', 'if', 'implements', 'include', 'include_once', 'instanceof',
                    'insteadof', 'interface', 'isset', 'list', 'namespace', 'new',
                    'or', 'print', 'private', 'protected', 'public', 'require',
                    'require_once', 'return', 'static', 'switch', 'throw', 'trait',
                    'try', 'unset', 'use', 'var', 'while', 'xor', 'yield',
                    'bool', 'int', 'float', 'string', 'void', 'iterable', 'object',
                    'null', 'true', 'false'
                ].join('|')})\\b`,
                `(@[a-zA-Z_][a-zA-Z0-9_]*)`,
                `((?:"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'))`,
                `((?:\\/\\/.*)|(?:\\/\\*[^*]*\\*+(?:[^/*][^*]*\\*+)\\/)|(?:#.*))`,
                `(\\b\\d+(?:\\.\\d+)?\\b)`,
                `([==!=<>]=|[-+*/%&|^~<>()\\[\\]{}]=?|->|\\.|\\.\\.|::)`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b(?=\\()`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b`,
                `(\\$[a-zA-Z_][a-zA-Z0-9_]*)`,
                `\\b([A-Z][a-zA-Z0-9_]*)\\b`,
                `\\b(${[
                    'echo', 'print', 'var_dump', 'isset', 'empty', 'unset', 'require', 'include'
                ].join('|')})\\b`,
                `\\b(${[
                    'mysqli', 'PDO', 'stdClass', 'Exception', 'DateTime', 'ArrayObject', 'Closure', 'Generator', 'Iterator', 'SplObjectStorage'
                ].join('|')})\\b`,
                `\\b(${[
                    'null', 'true', 'false'
                ].join('|')})\\b`,
                `\\b(${[
                    '_GET', '_POST', '_SESSION', '_COOKIE', '_SERVER', '_REQUEST', '_FILES', '_ENV'
                ].join('|')})\\b`,
                `\\\\[a-zA-Z_][a-zA-Z0-9_]*`
            ];
        case 'sql':
            return [
               `\\b(${[
                    'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE',
                    'DROP', 'ALTER', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL',
                    'ON', 'AS', 'INTO', 'VALUES', 'SET', 'AND', 'OR', 'NOT', 'NULL',
                    'LIKE', 'BETWEEN', 'EXISTS', 'PRIMARY', 'KEY', 'FOREIGN',
                    'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'DISTINCT',
                    'UNION', 'ALL', 'ANY', 'IN', 'EXCEPT', 'INTERSECT', 'CASE',
                    'WHEN', 'THEN', 'ELSE', 'END', 'CAST', 'CONVERT', 'ISNULL',
                    'COALESCE', 'TOP', 'IDENTITY', 'ROW_NUMBER', 'OVER', 'PARTITION',
                    'RANK', 'DENSE_RANK', 'CURRENT_DATE', 'CURRENT_TIME', 'CURRENT_TIMESTAMP'
                ].join('|')})\\b`,
                `((?:'(?:''|[^'])*')|(?:"(?:\\"|[^"])*"))`,
                `(--[^\\n\\r]*)`,
                `(\\b\\d+(?:\\.\\d+)?\\b)`,
                `(=|<>|!=|<|>|<=|>=|\\+|\\-|\\*|\\/|%|\\(|\\)|\\[|\\]|\\{|\\})`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b(?=\\()`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b`,
                `(\\bDATE\\b|\\bINT\\b|\\bVARCHAR\\b|\\bTEXT\\b|\\bBOOLEAN\\b|\\bDECIMAL\\b|\\bFLOAT\\b|\\bNUMERIC\\b|\\bCHAR\\b|\\bDATETIME\\b|\\bTIMESTAMP\\b)`,
                `\\b(${[
                    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'NOW', 'COALESCE', 'NULLIF', 'DATEADD', 'DATEDIFF', 'GROUP_CONCAT', 'STDEV', 'VAR'
                ].join('|')})\\b`,
                `\\b(${[
                    'CURRENT_DATE', 'CURRENT_TIME', 'CURRENT_TIMESTAMP', 'GETDATE', 'GETUTCDATE', 'DATEPART', 'DATEADD', 'DATEDIFF', 'FORMAT'
                ].join('|')})\\b`,
                `\\b(${[
                    'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN', 'CROSS JOIN', 'NATURAL JOIN'
                ].join('|')})\\b`
            ];
        case 'monkey c':
            return [
                `\\b(${[
                    'function', 'end', 'if', 'else', 'elseif', 'return', 'for',
                    'while', 'do', 'repeat', 'until', 'break', 'continue',
                    'switch', 'case', 'default', 'import', 'export', 'var', 'const',
                    'let', 'true', 'false', 'null', 'async', 'await', 'struct',
                    'enum', 'typedef', 'typedefstruct', 'typedefenum', 'interface',
                    'implements', 'extends', 'super', 'new', 'delete', 'typeof', 'instanceof'
                ].join('|')})\\b`,
                `(@[a-zA-Z_][a-zA-Z0-9_]*)`,
                `((?:"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'))`,
                `((?:\\/\\/.*)|(?:\\/\\*[^*]*\\*+(?:[^/*][^*]*\\*+)\\/))`,
                `(\\b\\d+(?:\\.\\d+)?\\b)`,
                `([==!=<>]=|[-+*/%&|^~<>]=?|\\(|\\)|\\[|\\]|\\{|\\})`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b(?=\\()`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b`,
                `\\b([A-Z][a-zA-Z0-9_]*)\\b`,
                `\\b(${[
                    'print', 'map', 'filter', 'reduce', 'guard', 'guard let', 'guard var', 'let', 'var', 'async', 'await'
                ].join('|')})\\b`,
                `\\b(${[
                    'String', 'Int', 'Float', 'Bool', 'Array', 'Dictionary', 'Set', 'Option', 'Result', 'Any', 'Self'
                ].join('|')})\\b`,
                `\\b(${[
                    'async', 'await'
                ].join('|')})\\b`,
                `:\\s*([A-Z][a-zA-Z0-9_]*|[a-z]+)`
            ];
        case 'rust':
            return [
                `\\b(${[
                    'as', 'async', 'await', 'break', 'const', 'continue', 'crate',
                    'dyn', 'else', 'enum', 'extern', 'false', 'fn', 'for', 'if',
                    'impl', 'in', 'let', 'loop', 'match', 'mod', 'move', 'mut',
                    'pub', 'ref', 'return', 'self', 'static', 'struct', 'super',
                    'trait', 'true', 'type', 'unsafe', 'use', 'where', 'while',
                    'yield', 'implements', 'type', 'as', 'from', 'of', 'async',
                    'await', 'dyn', 'extern', 'crate', 'macro', 'const',
                    'unsafe', 'trait', 'where', 'type', 'impl', 'for', 'fn'
                ].join('|')})\\b`,
                `(@[a-zA-Z_][a-zA-Z0-9_]*)`,
                `((?:"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'))`,
                `((?:\\/\\/.*)|(?:\\/\\*[^*]*\\*+(?:[^/*][^*]*\\*+)\\/))`,
                `(\\b\\d+(?:\\.\\d+)?\\b)`,
                `([==!=<>]=|[-+*/%&|^~<>]=?|<<=|>>=|&&|\\|\\||\\(|\\)|\\[|\\]|\\{|\\})`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b(?=\\()`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b`,
                `\\b(${[
                    'println', 'vec', 'String', 'Option', 'Result', 'Some', 'None', 'println!', 'format!', 'print!', 'dbg!'
                ].join('|')})\\b`,
                `\\b(${[
                    'Vec', 'HashMap', 'HashSet', 'Box', 'Rc', 'Arc', 'RefCell', 'Mutex', 'Option', 'Result'
                ].join('|')})\\b`,
                `\\b(${[
                    'Option', 'Result'
                ].join('|')})\\b`,
                `'[a-zA-Z_][a-zA-Z0-9_]*`
            ];
        case 'assembly':
            return [
                `\\b(${[
                    'mov', 'add', 'sub', 'mul', 'div', 'jmp', 'je', 'jne', 'jg', 'jge', 'jl', 'jle',
                    'cmp', 'call', 'ret', 'push', 'pop', 'lea', 'and', 'or', 'xor', 'not', 'shl',
                    'shr', 'nop', 'int', 'iret', 'jmp', 'loop', 'jmpf', 'jmpq', 'callf',
                    'callq', 'retf', 'retq', 'hlt', 'sete', 'setne', 'setg', 'setge', 'setl',
                    'setle', 'cmove', 'cmovne', 'cmovg', 'cmovge', 'cmovl', 'cmovle'
                ].join('|')})\\b`,
                `\\b(${[
                    'eax', 'ebx', 'ecx', 'edx', 'esi', 'edi', 'esp', 'ebp',
                    'rax', 'rbx', 'rcx', 'rdx', 'rsi', 'rdi', 'rsp', 'rbp',
                    'ax', 'bx', 'cx', 'dx', 'si', 'di', 'sp', 'bp',
                    'al', 'bl', 'cl', 'dl', 'ah', 'bh', 'ch', 'dh',
                    'r8', 'r9', 'r10', 'r11', 'r12', 'r13', 'r14', 'r15',
                    'r8d', 'r9d', 'r10d', 'r11d', 'r12d', 'r13d', 'r14d', 'r15d',
                    'r8w', 'r9w', 'r10w', 'r11w', 'r12w', 'r13w', 'r14w', 'r15w',
                    'r8b', 'r9b', 'r10b', 'r11b', 'r12b', 'r13b', 'r14b', 'r15b'
                ].join('|')})\\b`,
                `\\b(${[
                    '.data', '.text', '.bss', '.global', '.extern', '.section', '.align', '.byte', '.word', '.long', '.quad', '.ascii', '.asciz', '.org', '.equ', '.macro', '.endm'
                ].join('|')})\\b`,
                `(;.*)`,
                `((0x[0-9a-fA-F]+)|(0b[01]+)|(\\b\\d+\\b))`,
                `\\b[a-zA-Z_][a-zA-Z0-9_]*:`,
                `\\[[a-zA-Z0-9_+\-*/]+\]`,
                `([+\\-*/%&|^~<>]=?|==|!=|<=|>=|\\(|\\)|\\[|\\]|\\{|\\})`,
                `"(?:[^"\\\\]|\\\\.)*"`,
                `\\b[a-zA-Z_][a-zA-Z0-9_]*\\b`
            ];
        case 'html':
            return [
                `(<!--[\\s\\S]*?-->)`,
                `(<!DOCTYPE[^>]*>)`,
                `(<\/?[A-Za-z][A-Za-z0-9]*\\b[^>]*>)`,
                `(@[a-zA-Z_][a-zA-Z0-9_]*)`,
                `("(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')`,
                `(&[a-zA-Z0-9]+;|&#[0-9]+;|&#x[a-fA-F0-9]+;)`,
                `([^<>&]+)`,
                `([\\(\\)\\[\\]\\{\\}])` 
            ];
        case 'css':
            return [
                `(@media\\s*\\([^)]*\\))`,
                `(@(?:media|keyframes|supports)[^{]*\\{[^}]*\\})`,
                `(@[a-zA-Z-]+[^;]*;)`,
                `(/\\*[^*]*\\*+(?:[^/*][^*]*\\*+)*/)`,
                `([.#]?[a-zA-Z0-9_-]+(?:\\[[^\\]]*\\]|:{1,2}[a-zA-Z-]+(?:\\([^)]*\\))?)*\\s*(?=\\{))`,
                `((?:[a-zA-Z-]+\\s*:\\s*[^;\\}]+;))`,
                `(#[a-fA-F0-9]{3,8})`,
                `([a-zA-Z-]+\\([^)]*\\))`,
                `(\\b\\d+(?:\\.\\d+)?(?:px|em|rem|vh|vw|%)\\b)`,
                `(-(?:webkit|moz|ms|o)-[a-zA-Z-]+)`,
                `(!important\\b)`,
                `\\.([A-Za-z0-9_-]+)`,
                `#([A-Za-z0-9_-]+)`,
                `@\\w+`,
                `\\b([A-Za-z-]+):`,
                `:\\s*[^;]+;`,
                `;(?!\\})`,
                `\\b([A-Za-z-]+)\\b`,
                `"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'`,
                `([\\(\\)\\[\\]\\{\\}])` 
            ];
        case 'xml':
            return [
                `(<!--[\\s\\S]*?-->)`,
                `(<\\?[^>]+\\?>)`,
                `(<\/?[A-Za-z_:][A-Za-z0-9_.:-]*\\b[^>]*>)`,
                `(@[a-zA-Z_:][a-zA-Z0-9_.:-]*)`,
                `("(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')`,
                `(&[a-zA-Z0-9]+;|&#[0-9]+;|&#x[a-fA-F0-9]+;)`,
                `([^<>&]+)`,
                `([\\(\\)\\[\\]\\{\\}])`
            ];
        case 'json':
            return [
                `("([^"\\\\]|\\\\.)*")\\s*:`,
                `("([^"\\\\]|\\\\.)*")`,
                `(\\b\\d+(\\.\\d+)?\\b)`,
                `\\b(true|false)\\b`,
                `\\bnull\\b`,
                `([\\{\\}\\[\\]\\(\\):,])`
            ];
        default:
            return null;
    }
};

export const tokenTypes = {
    python: [
        'keyword',
        'decorator',
        'string',
        'function',
        'number',
        'operator',
        'string',
        'comment',
        'variable',
        'builtin',
        'variable',
        'keyword',
        'type-hint',
        'magic-method'
    ],
    typescript: [
        'keyword',
        'decorator',
        'string',
        'comment',
        'number',
        'operator',
        'function',
        'variable',
        'builtin',
        'type',
        'type',
        'jsx-tag',
        'template-placeholder'
    ],
    javascript: [
        'keyword',
        'decorator',
        'string',
        'comment',
        'number',
        'regex',
        'operator',
        'function',
        'variable',
        'builtin',
        'type',
        'jsx-tag',
        'template-placeholder'
    ],
    react: [
        'keyword',
        'decorator',
        'string',
        'comment',
        'number',
        'regex',
        'operator',
        'function',
        'variable',
        'builtin',
        'type',
        'jsx-tag',
        'template-placeholder'
    ],
    node: [
        'keyword',
        'decorator',
        'string',
        'comment',
        'number',
        'regex',
        'operator',
        'function',
        'variable',
        'builtin',
        'type',
        'jsx-tag',
        'template-placeholder'
    ],
    express: [
        'keyword',
        'decorator',
        'string',
        'comment',
        'number',
        'regex',
        'operator',
        'function',
        'variable',
        'builtin',
        'type',
        'jsx-tag',
        'template-placeholder'
    ],
    bash: [
        'keyword',
        'command',
        'variable',
        'variable-interpolation',
        'decorator',
        'string',
        'comment',
        'number',
        'operator',
        'filepath'
    ],
    shell: [
        'keyword',
        'command',
        'variable',
        'variable-interpolation',
        'decorator',
        'string',
        'comment',
        'number',
        'operator',
        'filepath'  
    ],
    c: [
        'preprocessor',
        'keyword',
        'decorator',
        'string',
        'comment',
        'number',
        'operator',
        'function',
        'variable',
        'preprocessor',
        'preprocessor',
        'preprocessor',
        'preprocessor',
        'builtin',
        'builtin',
        'builtin',
        'type',
        'class-name'
    ],
    'c++': [
        'preprocessor',
        'keyword',
        'decorator',
        'string',
        'comment',
        'number',
        'operator',
        'function',
        'variable',
        'preprocessor',
        'preprocessor',
        'preprocessor',
        'preprocessor',
        'builtin',
        'builtin',
        'builtin',
        'type',
        'class-name'
    ],
    'c#': [
        'preprocessor',
        'keyword',
        'decorator',
        'string',
        'comment',
        'number',
        'operator',
        'function',
        'variable',
        'preprocessor',
        'preprocessor',
        'preprocessor',
        'builtin',
        'type',
        'type',
        'namespace',
        'class-name'
    ],
    css: [
        'media-query',
        'at-rule',
        'comment',
        'selector',
        'property',
        'value',
        'hex-color',
        'function',
        'unit',
        'vendor-prefix',
        'important',
        'class',
        'id',
        'at-rule',
        'property-name',
        'property-value',
        'semicolon',
        'keyword',
        'string',
        'parentheses',
        'min-width',
        'pixel-value'
    ],
    html: [
        'comment',
        'doctype',
        'tag',
        'decorator',
        'string',
        'entity',
        'text'
    ],
    swift: [
        'keyword',
        'decorator',
        'string',
        'comment',
        'number',
        'operator',
        'function',
        'variable',
        'type',
        'builtin',
        'boolean',
        'class-name',
        'protocol',
        'interface',
        'enum',
        'struct',
        'trait',
        'annotation',
        'method',
        'namespace',
        'arrow',
        'spread',
        'nullish',
        'optional',
        'operator.logical',
        'operator.arithmetic',
        'operator.assignment',
        'operator.comparison',
        'type-annotation',
        'lifetime'
    ],
    php: [
        'keyword',
        'decorator',
        'string',
        'comment',
        'number',
        'operator',
        'function',
        'variable',
        'builtin',
        'builtin',
        'builtin',
        'type',
        'class-name',
        'namespace',
        'constant',
        'interface',
        'enum',
        'struct',
        'trait',
        'annotation',
        'method',
        'arrow',
        'spread',
        'nullish',
        'optional',
        'operator.logical',
        'operator.arithmetic',
        'operator.assignment',
        'operator.comparison',
        'superglobal',
        'namespace-use',
        'class-inheritance',
        'identifier'
    ],
    sql: [
        'keyword',
        'string',
        'comment',
        'number',
        'operator',
        'function',
        'variable',
        'constant',
        'datatype',
        'boolean',
        'schema',
        'interface',
        'enum',
        'struct',
        'trait',
        'decorator',
        'pseudo-class',
        'pseudo-element',
        'at-rule',
        'unit',
        'preprocessor',
        'template',
        'parameter',
        'command',
        'schema',
        'operator.logical',
        'operator.arithmetic',
        'operator.assignment',
        'operator.comparison',
        'aggregate-function',
        'date-function',
        'join-type'
    ],
    'monkey c': [
        'keyword',
        'decorator',
        'string',
        'comment',
        'number',
        'operator',
        'function',
        'variable',
        'builtin',
        'boolean',
        'class-name',
        'namespace',
        'interface',
        'enum',
        'struct',
        'trait',
        'annotation',
        'method',
        'arrow',
        'spread',
        'nullish',
        'optional',
        'operator.logical',
        'operator.arithmetic',
        'operator.assignment',
        'operator.comparison',
        'class-inheritance',
        'type-annotation'
    ],
    rust: [
        'keyword',
        'decorator',
        'string',
        'comment',
        'number',
        'operator',
        'function',
        'variable',
        'type',
        'builtin',
        'boolean',
        'struct',
        'enum',
        'trait',
        'class-name',
        'interface',
        'annotation',
        'method',
        'namespace',
        'arrow',
        'spread',
        'nullish',
        'optional',
        'operator.logical',
        'operator.arithmetic',
        'operator.assignment',
        'operator.comparison',
        'lifetime',
        'macro',
        'standard-library'
    ],
    assembly: [
        'keyword',
        'register',
        'directive',
        'comment',
        'number',
        'operator',
        'label',
        'memory-address',
        'string',
        'builtin',
        'instruction',
        'constant',
        'filepath'
    ],
    xml: [
        'comment',
        'doctype',
        'tag',
        'processing-instruction',
        'attribute',
        'entity',
        'text'
    ],
    json: [
        'key',
        'string',
        'number',
        'boolean',
        'null',
        'punctuation'
    ]
};

/**
 * 
 * @param {string} codeStr 
 * @param {string} language 
 * @returns {Array<Object>} 
*/
export const tokenize = (codeStr, language) => {
    const tokenPatterns = getTokenPatterns(language);
    if (!tokenPatterns) {
        const allLines = codeStr.split(/\r?\n/);
        return allLines.map((line, i) => ({
            value: line,
            lineNumber: i + 1
        }));
    }

    const regex = new RegExp(tokenPatterns.join('|'), 'gi');
    let match;
    let lastIndex = 0;
    const tokens = [];
    let currentLine = 1;

    while ((match = regex.exec(codeStr)) !== null) {
        const precedingText = codeStr.slice(lastIndex, match.index);
        if (precedingText) {
            const lines = precedingText.split(/\r?\n/);
            lines.forEach((line, idx) => {
                if (line) {
                    tokens.push({ value: line, lineNumber: currentLine });
                }
                if (idx < lines.length - 1) {
                    currentLine += 1;
                }
            });
        }

        let tokenType = null;
        for (let i = 1; i < match.length; i++) {
            if (match[i] !== undefined) {
                const lang = language.toLowerCase();
                tokenType = tokenTypes[lang] ? tokenTypes[lang][i - 1] || null : null;
                break;
            }
        }

        if (match[0]) {
            const lines = match[0].split(/\r?\n/);
            lines.forEach((line, idx) => {
                if (line) {
                    tokens.push({
                        value: line,
                        type: tokenType,
                        lineNumber: currentLine
                    });
                }
                if (idx < lines.length - 1) {
                    currentLine += 1;
                }
            });
        }

        lastIndex = regex.lastIndex;
    }

    const remainingText = codeStr.slice(lastIndex);
    if (remainingText) {
        const lines = remainingText.split(/\r?\n/);
        lines.forEach((line, idx) => {
            if (line) {
                tokens.push({ value: line, lineNumber: currentLine });
            }
            if (idx < lines.length - 1) {
                currentLine += 1;
            }
        });
    }

    return tokens;
};

/**
 * @param {string} codeStr 
 * @param {string} language 
 * @param {string} searchTerm 
 * @param {boolean} isCaseSensitive 
 * @param {number|null} activeLineNumber 
 * @returns {string} 
*/
export const syntaxHighlight = (codeStr, language, searchTerm, isCaseSensitive, activeLineNumber = null) => {
    if (language.toLowerCase() === "unknown") {
        return escapeHtml(codeStr).replace(/\n/g, '<br/>');
    }

    const tokens = tokenize(codeStr, language); 
    const lines = codeStr.split(/\r?\n/);
    const highlightedLines = lines.map((line, index) => {
        const lineNumber = index + 1;
        let highlightedLine = '';

        const lineTokens = tokens.filter(token => token.lineNumber === lineNumber);
        const plainText = lineTokens.map(token => token.value).join('');

        let regex;
        if (searchTerm) {
            try {
                const escapedSearchTerm = escapeRegExp(searchTerm);
                const flags = isCaseSensitive ? 'g' : 'gi';
                regex = new RegExp(escapedSearchTerm, flags);
            } catch (e) {
                console.error("Invalid search term regex:", e);
                regex = null;
            }
        }

        const matches = regex ? Array.from(plainText.matchAll(regex)) : [];
        const matchRanges = matches.map(match => ({
            start: match.index,
            end: match.index + match[0].length
        }));

        const isTokenInMatch = (tokenStart, tokenEnd) => {
            return matchRanges.some(range => tokenStart < range.end && tokenEnd > range.start);
        };

        const isTokenFullyInMatch = (tokenStart, tokenEnd) => {
            return matchRanges.some(range => tokenStart >= range.start && tokenEnd <= range.end);
        };

        let currentChar = 0;
        lineTokens.forEach(token => {
            const tokenText = token.value;
            const tokenLength = tokenText.length;
            const tokenStart = currentChar;
            const tokenEnd = currentChar + tokenLength;
            currentChar += tokenLength;

            let tokenHtml = '';
            if (token.type && token.type !== 'space') { 
                tokenHtml = `<span class="token ${token.type}" style="font-family: monospace; white-space: pre;">${escapeHtml(token.value)}</span>`;
            } else { 
                tokenHtml = `${escapeHtml(token.value)}`;
            }

            if (isTokenFullyInMatch(tokenStart, tokenEnd)) {
                tokenHtml = `<span class="searchHighlight">${tokenHtml}</span>`;
            }

            else if (isTokenInMatch(tokenStart, tokenEnd)) {
                let overlappingRanges = matchRanges.filter(range => tokenStart < range.end && tokenEnd > range.start);
                overlappingRanges.forEach(range => {
                    const overlapStart = Math.max(tokenStart, range.start);
                    const overlapEnd = Math.min(tokenEnd, range.end);
                    const relativeStart = overlapStart - tokenStart;
                    const relativeEnd = overlapEnd - tokenStart;

                    const beforeMatch = token.value.slice(0, relativeStart);
                    const matchedText = token.value.slice(relativeStart, relativeEnd);
                    const afterMatch = token.value.slice(relativeEnd);

                    let newTokenHtml = '';

                    if (beforeMatch) {
                        if (token.type && token.type !== 'space') {
                            newTokenHtml += `<span class="token ${token.type}" style="font-family: monospace; white-space: pre;">${escapeHtml(beforeMatch)}</span>`;
                        } else {
                            newTokenHtml += `${escapeHtml(beforeMatch)}`;
                        }
                    }

                    if (matchedText) {
                        const matchedHtml = token.type && token.type !== 'space'
                            ? `<span class="token ${token.type}" style="font-family: monospace; white-space: pre;">${escapeHtml(matchedText)}</span>`
                            : `${escapeHtml(matchedText)}`;
                        newTokenHtml += `<span class="searchHighlight">${matchedHtml}</span>`;
                    }

                    if (afterMatch) {
                        if (token.type && token.type !== 'space') {
                            newTokenHtml += `<span class="token ${token.type}" style="font-family: monospace; white-space: pre;">${escapeHtml(afterMatch)}</span>`;
                        } else {
                            newTokenHtml += `${escapeHtml(afterMatch)}`;
                        }
                    }

                    tokenHtml = newTokenHtml;
                });
            }

            highlightedLine += tokenHtml;
        });

        if (lineNumber === activeLineNumber) {
            highlightedLine = `<span class="activeLine">${highlightedLine}</span>`;
        }

        return highlightedLine;
    });

    return highlightedLines.join('<br/>');
};