
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
                tokenHtml = `<span class="token ${token.type}" style="font-family: monospace; white-space: pre; overflow-x: auto;">${escapeHtml(token.value)}</span>`;
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
                            newTokenHtml += `<span class="token ${token.type}" style="font-family: monospace; white-space: pre; overflow-x: auto;">${escapeHtml(beforeMatch)}</span>`;
                        } else {
                            newTokenHtml += `${escapeHtml(beforeMatch)}`;
                        }
                    }

                    if (matchedText) {
                        const matchedHtml = token.type && token.type !== 'space'
                            ? `<span class="token ${token.type}" style="font-family: monospace; white-space: pre; overflow-x: auto;">${escapeHtml(matchedText)}</span>`
                            : `${escapeHtml(matchedText)}`;
                        newTokenHtml += `<span class="searchHighlight">${matchedHtml}</span>`;
                    }

                    if (afterMatch) {
                        if (token.type && token.type !== 'space') {
                            newTokenHtml += `<span class="token ${token.type}" style="font-family: monospace; white-space: pre; overflow-x: auto;">${escapeHtml(afterMatch)}</span>`;
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
            highlightedLine = `<span class="activeLine" style="white-space: pre; overflow-x: auto;">${highlightedLine}</span>`;
        }

        return highlightedLine;
    });

    return highlightedLines.join('<br/>');
};

export const escapeHtml = (str) => {
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;");
};

export const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
export const tokenize = (codeStr, language) => {
    const tokenPatterns = getTokenPatterns(language);
    if (!tokenPatterns) {
        const allLines = codeStr.split(/\r?\n/);
        return allLines.map((line, i) => ({
            value: line,
            lineNumber: i + 1
        }));
    }

    const regex = new RegExp(tokenPatterns.join('|'), 'g');
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
                switch (i) {
                    case 1:
                        tokenType = 'string'; 
                        break;
                    case 2:
                    case 3:
                        tokenType = 'string'; 
                        break;
                    case 4:
                        tokenType = 'comment'; 
                        break;
                    case 5:
                        tokenType = 'keyword'; 
                        break;
                    case 6:
                        tokenType = 'number'; 
                        break;
                    case 7:
                        tokenType = 'operator'; 
                        break;
                    case 8:
                        tokenType = 'identifier'; 
                        break;
                    default:
                        tokenType = null;
                }
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

export const tokenTypes = {
    python: [
        'keyword',
        'string',
        'comment',
        'number',
        'operator',
        'function',
        'variable',
        'decorator',
        'builtin',
        'boolean',
        'class-name'
    ],
    javascript: [
        'keyword',
        'string',
        'comment',
        'number',
        'operator',
        'function',
        'variable',
        'regexp',
        'boolean',
        'class-name',
        'namespace',
        'type'
    ],
    react: [
        'keyword',
        'string',
        'comment',
        'number',
        'operator',
        'function',
        'variable',
        'tag',
        'attribute',
        'jsx-string',
        'boolean',
        'class-name'
    ],
    node: [
        'keyword',
        'string',
        'comment',
        'number',
        'operator',
        'function',
        'variable',
        'builtin',
        'boolean',
        'class-name',
        'type'
    ],
    express: [
        'keyword',
        'string',
        'comment',
        'number',
        'operator',
        'function',
        'variable',
        'builtin',
        'boolean',
        'class-name',
        'type'
    ],
    bash: [
        'keyword',
        'string',
        'comment',
        'number',
        'operator',
        'function',
        'variable',
        'builtin',
        'boolean',
        'parameter',
        'command'
    ],
    shell: [
        'keyword',
        'string',
        'comment',
        'number',
        'operator',
        'function',
        'variable',
        'builtin',
        'boolean',
        'parameter',
        'command'
    ],
    c: [
        'keyword',
        'string',
        'comment',
        'number',
        'operator',
        'function',
        'variable',
        'preprocessor',
        'boolean',
        'type',
        'class-name'
    ],
    'c++': [
        'keyword',
        'string',
        'comment',
        'number',
        'operator',
        'function',
        'variable',
        'preprocessor',
        'boolean',
        'type',
        'class-name',
        'template'
    ],
    'c#': [
        'keyword',
        'string',
        'comment',
        'number',
        'operator',
        'function',
        'variable',
        'preprocessor',
        'boolean',
        'type',
        'class-name',
        'namespace'
    ],
    css: [
        'selector',
        'property',
        'value',
        'comment',
        'operator',
        'function',
        'variable',
        'pseudo-class',
        'pseudo-element',
        'at-rule',
        'unit'
    ],
    html: [
        'tag',
        'attribute',
        'string',
        'comment',
        'doctype',
        'operator',
        'function',
        'variable',
        'entity',
        'boolean',
        'class-name'
    ],
    typescript: [
        'keyword',
        'string',
        'comment',
        'number',
        'operator',
        'function',
        'variable',
        'type',
        'builtin',
        'interface',
        'enum',
        'boolean',
        'class-name',
        'namespace'
    ],
    swift: [
        'keyword',
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
        'protocol'
    ],
    php: [
        'keyword',
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
        'constant'
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
        'schema'
    ],
    'monkey c': [
        'keyword',
        'string',
        'comment',
        'number',
        'operator',
        'function',
        'variable',
        'builtin',
        'boolean',
        'class-name',
        'namespace'
    ],
    rust: [
        'keyword',
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
        'class-name'
    ]
};

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
               `("""[\\s\\S]*?"""|'''[\\s\\S]*?''')`,
                `("([^"\\\\]|\\\\.)*"|'([^'\\\\]|\\\\.)*')`,
                `(#.*)`,
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
                `(\\b\\d+(\\.\\d+)?\\b)`,
                `([+\\-*/%=&|<>!^~]+)`,
                // Identifiers
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b`
            ];
        case 'javascript':
        case 'react js':
        case 'node js':
        case 'express js':
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
                    'await', 'null', 'true', 'false'
                ].join('|')})\\b`,
                `((?:"(?:[^"\\\\]|\\\\.)*")|(?:'(?:[^'\\\\]|\\\\.)*')|(?:\`(?:[^\\\`\\\\]|\\\\.)*\`))`,
                `((?:\\/\\/.*)|(?:\\/\\*[^*]*\\*+(?:[^/*][^*]*\\*+)\\/))`,
                `(\\b\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?\\b)`,
                `([==!=<>]=|[-+*/%&|^~<>]=?)`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b(?=\\()`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b`,
                `(\/(?:\\/(?!\\/)|\*[^*]*\*+(?:[^/*][^*]*\*+)\/))`,
                `\\b([A-Z][a-zA-Z0-9_]*)\\b`
            ];
        case 'bash':
        case 'shell':
            return [
                `\\b(${[
                    'if', 'then', 'else', 'fi', 'for', 'while', 'do', 'done',
                    'case', 'esac', 'function', 'in', 'select', 'until', 'declare',
                    'readonly', 'return', 'continue', 'break', 'export',
                    'local', 'shift', 'getopts', 'echo', 'printf', 'source',
                    'alias', 'unalias', 'true', 'false'
                ].join('|')})\\b`,
                `((?:"(?:[^"\\\\]|\\\\.)*")|(?:'(?:[^'\\\\]|\\\\.)*'))`,
                `(#.*)`,
                `(\\b\\d+(?:\\.\\d+)?\\b)`,
                `([;&|<>!(){}[\]])`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b(?=\\()`,
                `\\$[a-zA-Z_][a-zA-Z0-9_]*`,
                `\\$\{?[a-zA-Z_][a-zA-Z0-9_]*\}?`
            ];
        case 'c':
        case 'c++':
        case 'c#':
        case 'swift':
            return [
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
                `((?:"(?:[^"\\\\]|\\\\.)*")|(?:'(?:[^'\\\\]|\\\\.)*'))`,
                `((?:\\/\\/.*)|(?:\\/\\*[^*]*\\*+(?:[^/*][^*]*\\*+)\\/))`,
                `(\\b\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?\\b)`,
                `([==!=<>]=|[-+*/%&|^~<>]=?|::|->|\.{2,})`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b(?=\\()`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b`,
                `#include\\s*<[^>]+>`
            ];
        case 'css':
            return [
                `([.#]?[a-zA-Z_][a-zA-Z0-9_-]*)`,
                `([a-zA-Z-]+)(?=:)`,
                `(?<=: )([^;]+)(?=;)`,
                `(\\/\\*[^*]*\\*+(?:[^/*][^*]*\\*+)\\/))`,
                `(;)`,
                `([a-zA-Z_][a-zA-Z0-9_-]*)\\(`,
                `(--[a-zA-Z_][a-zA-Z0-9_-]*)`,
                `(@[a-zA-Z-]+)`,
                `(:{2}[a-zA-Z-]+)`
            ];
        case 'html':
            return [
                `(<\/?[a-zA-Z][a-zA-Z0-9]*\\b)`,
                `([a-zA-Z-]+)(?==)`,
                `((?:"[^"]*")|(?:'[^']*'))`,
                `(<!--[^>]*-->)`,
                `(<!DOCTYPE[^>]*>)`,
                `(=)`,
                `([a-zA-Z_][a-zA-Z0-9_]*)\\(`,
                `([a-zA-Z_][a-zA-Z0-9_]*)`,
                `(&[a-zA-Z]+;)`
            ];
        case 'typescript':
            return [
                `\\b(${[
                    'abstract', 'any', 'as', 'async', 'await', 'boolean', 'break',
                    'case', 'catch', 'class', 'const', 'constructor', 'continue',
                    'debugger', 'declare', 'default', 'delete', 'do', 'else',
                    'enum', 'export', 'extends', 'false', 'finally', 'for', 'from',
                    'function', 'if', 'import', 'in', 'instanceof', 'interface',
                    'is', 'keyof', 'let', 'module', 'namespace', 'never', 'new',
                    'null', 'number', 'object', 'package', 'private', 'protected',
                    'public', 'readonly', 'require', 'return', 'string', 'super',
                    'switch', 'symbol', 'this', 'throw', 'true', 'try', 'type',
                    'typeof', 'var', 'void', 'while', 'with', 'yield', 'implements',
                    'type', 'as', 'from', 'of'
                ].join('|')})\\b`,
                `((?:"(?:[^"\\\\]|\\\\.)*")|(?:'(?:[^'\\\\]|\\\\.)*')|(?:\`(?:[^\\\`\\\\]|\\\\.)*\`))`,
                `((?:\\/\\/.*)|(?:\\/\\*[^*]*\\*+(?:[^/*][^*]*\\*+)\\/))`,
                `(\\b\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?\\b)`,
                `([==!=<>]=|[-+*/%&|^~<>]=?)`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b(?=\\()`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b`,
                `\\b([A-Z][a-zA-Z0-9_]*)\\b`
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
                `((?:"(?:[^"\\\\]|\\\\.)*")|(?:'(?:[^'\\\\]|\\\\.)*'))`,
                `((?:\\/\\/.*)|(?:\\/\\*[^*]*\\*+(?:[^/*][^*]*\\*+)\\/)|(?:#.*))`,
                `(\\b\\d+(?:\\.\\d+)?\\b)`,
                `([==!=<>]=|[-+*/%&|^~<>]=?)`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b(?=\\()`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b`,
                `(\\$[a-zA-Z_][a-zA-Z0-9_]*)`,
                `\\b([A-Z][a-zA-Z0-9_]*)\\b`
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
                    'BY', 'RANK', 'DENSE_RANK'
                ].join('|')})\\b`,
                `(?:'(?:''|[^'])*')`,
                `(--[^\\n\\r]*)`,
                `(\\b\\d+(?:\\.\\d+)?\\b)`,
                `(=|<>|!=|<|>|<=|>=|\\+|\\-|\\*|\\/|%)`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b(?=\\()`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b`,
                `(\\bDATE\\b|\\bINT\\b|\\bVARCHAR\\b|\\bTEXT\\b|\\bBOOLEAN\\b|\\bDECIMAL\\b)`
            ];
        case 'monkey c':
            return [
                `\\b(${[
                    'function', 'end', 'if', 'else', 'elseif', 'return', 'for',
                    'while', 'do', 'repeat', 'until', 'break', 'continue',
                    'switch', 'case', 'default', 'import', 'export', 'var', 'const',
                    'let', 'true', 'false', 'null', 'async', 'await', 'struct',
                    'enum', 'typedef', 'typedefstruct', 'typedefenum'
                ].join('|')})\\b`,
                `((?:"(?:[^"\\\\]|\\\\.)*")|(?:'(?:[^'\\\\]|\\\\.)*'))`,
                `((?:\\/\\/.*)|(?:\\/\\*[^*]*\\*+(?:[^/*][^*]*\\*+)\\/))`,
                `(\\b\\d+(?:\\.\\d+)?\\b)`,
                `([==!=<>]=|[-+*/%&|^~<>]=?)`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b(?=\\()`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b`,
                `\\b([A-Z][a-zA-Z0-9_]*)\\b`
            ];
        case 'rust':
            return [
                `\\b(${[
                    'as', 'async', 'await', 'break', 'const', 'continue', 'crate',
                    'dyn', 'else', 'enum', 'extern', 'false', 'fn', 'for', 'if',
                    'impl', 'in', 'let', 'loop', 'match', 'mod', 'move', 'mut',
                    'pub', 'ref', 'return', 'self', 'static', 'struct', 'super',
                    'trait', 'true', 'type', 'unsafe', 'use', 'where', 'while',
                    'yield', 'implements', 'type', 'as', 'from', 'of'
                ].join('|')})\\b`,
                `((?:"(?:[^"\\\\]|\\\\.)*")|(?:'(?:[^'\\\\]|\\\\.)*'))`,
                `((?:\\/\\/.*)|(?:\\/\\*[^*]*\\*+(?:[^/*][^*]*\\*+)\\/))`,
                `(\\b\\d+(?:\\.\\d+)?\\b)`,
                `([==!=<>]=|[-+*/%&|^~<>]=?)`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b(?=\\()`,
                `\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b`,
                `\\b([A-Z][a-zA-Z0-9_]*)\\b`
            ];
        default:
            return null;
    }
};
