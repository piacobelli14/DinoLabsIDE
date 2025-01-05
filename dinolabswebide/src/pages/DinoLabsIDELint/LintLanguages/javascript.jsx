import { getLineNumber } from "../DinoLabsIDELintUtils";

export function detectJavaScriptSyntaxErrors(codeStr, detectedProblems) {
    const lines = codeStr.split(/\r?\n/);
    const multiLineOpeners = ["{", "[", "("];
    const multiLineClosers = ["}", "]", ")"];
    const structureStack = [];
    let inTemplateString = false;
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let inRegex = false;
    let inMultiLineComment = false;
    let openNestingLevel = 0; 

    lines.forEach((line, index) => {
        let i = 0;
        let lineWithoutComments = '';
        while (i < line.length) {
            const char = line[i];
            const nextChar = i < line.length - 1 ? line[i + 1] : null;
            const prevChar = i > 0 ? line[i - 1] : null;

            if (inMultiLineComment) {
                if (char === '*' && nextChar === '/') {
                    inMultiLineComment = false;
                    i += 2;
                    continue;
                }
                i++;
                continue;
            }

            if (inTemplateString) {
                if (char === '`' && prevChar !== '\\') {
                    inTemplateString = false;
                }
                lineWithoutComments += char;
                i++;
                continue;
            }

            if (inSingleQuote) {
                if (char === "'" && prevChar !== '\\') {
                    inSingleQuote = false;
                }
                lineWithoutComments += char;
                i++;
                continue;
            }

            if (inDoubleQuote) {
                if (char === '"' && prevChar !== '\\') {
                    inDoubleQuote = false;
                }
                lineWithoutComments += char;
                i++;
                continue;
            }

            if (inRegex) {
                if (char === '/' && prevChar !== '\\') {
                    inRegex = false;
                }
                lineWithoutComments += char;
                i++;
                continue;
            }

            if (char === '/' && nextChar === '*') {
                inMultiLineComment = true;
                i += 2;
                continue;
            }

            if (char === '/' && nextChar === '/') {
                break;
            }

            if (char === '`') {
                inTemplateString = true;
                lineWithoutComments += char;
                i++;
                continue;
            }

            if (char === "'" && prevChar !== '\\') {
                inSingleQuote = true;
                lineWithoutComments += char;
                i++;
                continue;
            }

            if (char === '"' && prevChar !== '\\') {
                inDoubleQuote = true;
                lineWithoutComments += char;
                i++;
                continue;
            }

            if (char === '/' && !inRegex && /[=(:,]\s*$/.test(lineWithoutComments.trim())) {
                inRegex = true;
                lineWithoutComments += char;
                i++;
                continue;
            }

            lineWithoutComments += char;
            i++;
        }

        for (let char of lineWithoutComments) {
            if (multiLineOpeners.includes(char)) {
                openNestingLevel++;
            } else if (multiLineClosers.includes(char)) {
                openNestingLevel = Math.max(openNestingLevel - 1, 0);
            }
        }

        const trimmed = lineWithoutComments.trim();

        const exclusionPatterns = [
            /^import\s+.+from\s+['"].+['"];?/, 
            /^export\s+/,                     
            /^function\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*\(/, 
            /^class\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*{?/, 
            /^if\s*\(.+\)\s*{?$/,             
            /^else\s*{?$/,                     
            /^for\s*\(.+\)\s*{?$/,             
            /^while\s*\(.+\)\s*{?$/,          
            /^switch\s*\(.+\)\s*{?$/,          
            /^case\s+.*:/,                     
            /^default\s*:/,                    
            /^try\s*{?$/,                     
            /^catch\s*\(.+\)\s*{?$/,           
            /^finally\s*{?$/,                 
            /^new\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*\(/, 
            /^return\b.*$/,                    
            /^throw\b.*$/,                     
            /^do\s*{?$/,                       
            /^while\s*\(.+\)\s*;?$/,           
            /^const\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*=/, 
            /^let\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*=/,   
            /^var\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*=/,  
        ];

        const isExempt = exclusionPatterns.some((pattern) => pattern.test(trimmed));
        const isLabelOrTernary = trimmed.endsWith(":") || trimmed.includes("?");

        if (
            openNestingLevel === 0 &&
            !isExempt &&
            !isLabelOrTernary &&
            trimmed !== ""
        ) {
            if (!trimmed.endsWith(";")) {
                detectedProblems.push({
                    type: "Missing Semicolon",
                    severity: "warning",
                    message: `Missing semicolon at the end of the statement.`,
                    line: index + 1,
                });
            }
        }

        const varMatch = trimmed.match(/(?:const|let|var)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)/);
        if (varMatch) {
            const varName = varMatch[1];
            const regex = new RegExp(`\\b${varName}\\b`, "g");
            const occurrences = (codeStr.match(regex) || []).length;
            if (occurrences === 1) {
                detectedProblems.push({
                    type: "Unused Variable",
                    severity: "info",
                    message: `Variable '${varName}' is declared but never used.`,
                    line: index + 1,
                });
            }
        }

        if (/^\s*var\s+/.test(lineWithoutComments)) {
            detectedProblems.push({
                type: "Deprecated Syntax",
                severity: "warning",
                message: `Usage of 'var' is deprecated. Consider using 'let' or 'const'.`,
                line: index + 1,
            });
        }

        if (/console\.log\s*\(/.test(lineWithoutComments)) {
            detectedProblems.push({
                type: "Debug Statement",
                severity: "info",
                message: `Detected 'console.log' statement. Consider removing before production.`,
                line: index + 1,
            });
        }

        if (/===/.test(lineWithoutComments) && !/!==/.test(lineWithoutComments)) {
            detectedProblems.push({
                type: "Potential Logical Error",
                severity: "warning",
                message: `Consider using '!==' for strict inequality.`,
                line: index + 1,
            });
        }
    });

    structureStack.forEach((unmatched) => {
        detectedProblems.push({
            type: "Syntax Error",
            severity: "error",
            message: `Unmatched opening '${unmatched.char}'.`,
            line: unmatched.line,
        });
    });
}


/**
* @param {string} codeStr 
* @param {Array} detectedProblems
*/
export function detectJavaScriptSemanticErrors(codeStr, detectedProblems) {
    const lines = codeStr.split(/\r?\n/);
    const declaredFunctions = [];
    const usedFunctions = new Set();
    const scopeStack = [];

    const isFunctionStart = (trimmedLine) => {
        return (
            /^function\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*\(/.test(trimmedLine) || 
            /^function\s*\(/.test(trimmedLine) ||
            /^[a-zA-Z_$][a-zA-Z0-9_$]*\s*=\s*function\s*\(/.test(trimmedLine) ||
            /^[a-zA-Z_$][a-zA-Z0-9_$]*\s*=\s*\([^)]*\)\s*=>/.test(trimmedLine) || 
            /^\([^)]*\)\s*=>/.test(trimmedLine) || 
            /^[a-zA-Z_$][a-zA-Z0-9_$]*\s*:\s*\([^)]*\)\s*=>/.test(trimmedLine) 
        );
    };

    lines.forEach((line, index) => {
        const trimmed = line.trim();

        if (isFunctionStart(trimmed)) {
            scopeStack.push({ hasReturn: false, nestingLevel: 1 });
        }

        if (scopeStack.length > 0) {
            const currentScope = scopeStack[scopeStack.length - 1];

            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                const prevChar = i > 0 ? line[i - 1] : null;

                if (char === '{') {
                    currentScope.nestingLevel++;
                } else if (char === '}') {
                    currentScope.nestingLevel--;

                    if (currentScope.nestingLevel === 0) {
                        scopeStack.pop();
                        break; 
                    }
                }
            }

            if (/return\b/.test(trimmed)) {
                if (currentScope.nestingLevel === 1) {
                    currentScope.hasReturn = true;
                }
            }

            if (currentScope.hasReturn && currentScope.nestingLevel === 1) {
                if (!/return\b.*;/.test(trimmed) && trimmed !== "") {
                    detectedProblems.push({
                        type: "Unreachable Code",
                        severity: "warning",
                        message: `Code detected after a return statement.`,
                        line: index + 1,
                    });
                }
            }
        }

        const funcMatch = trimmed.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/);
        if (funcMatch) {
            const funcName = funcMatch[1];
            declaredFunctions.push({ name: funcName, line: index + 1 });
        }

        const usageMatches = line.match(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g);
        if (usageMatches) {
            usageMatches.forEach((funcName) => {
                usedFunctions.add(funcName);
            });
        }

        const promiseMatch = line.match(/new\s+Promise\s*\(/);
        if (promiseMatch) {
            detectedProblems.push({
                type: "Potential Asynchronous Issue",
                severity: "info",
                message: `Promise constructor usage detected. Consider using async/await for better readability.`,
                line: index + 1,
            });
        }
    });

    declaredFunctions.forEach((func) => {
        if (!usedFunctions.has(func.name)) {
            detectedProblems.push({
                type: "Unused Function",
                severity: "info",
                message: `Function '${func.name}' is defined but never called.`,
                line: func.line,
            });
        }
    });
}