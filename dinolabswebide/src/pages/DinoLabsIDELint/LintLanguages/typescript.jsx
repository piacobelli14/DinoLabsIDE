import { getLineNumber } from "../DinoLabsIDELintUtils";

/**
* @param {string} codeStr 
* @param {Array} detectedProblems 
*/
export function detectTypeScriptSyntaxErrors(codeStr, detectedProblems) {
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
                structureStack.push({ char, line: index + 1 });
            } else if (multiLineClosers.includes(char)) {
                if (structureStack.length === 0 || multiLineOpeners.indexOf(structureStack[structureStack.length - 1].char) !== multiLineClosers.indexOf(char)) {
                    detectedProblems.push({
                        type: "Syntax Error",
                        severity: "error",
                        message: `Unmatched closing '${char}'.`,
                        line: index + 1,
                    });
                } else {
                    structureStack.pop();
                }
                openNestingLevel = Math.max(openNestingLevel - 1, 0);
            }
        }

        const trimmed = lineWithoutComments.trim();

        const exclusionPatterns = [
            /^import\s+.+from\s+['"].+['"];?/,
            /^export\s+/,                     
            /^const\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*:/, 
            /^interface\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*{/, 
            /^type\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*=/, 
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
            /^return\s+/,
            /^export\s+default\s+/ 
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

        const varMatch = trimmed.match(/(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
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

        if (/as\s+[A-Za-z0-9_]+/.test(trimmed) && !/<[^>]+>\s*as\s+[A-Za-z0-9_]+/.test(trimmed)) {
            detectedProblems.push({
                type: "Type Assertion",
                severity: "info",
                message: `Type assertion using 'as' detected. Ensure it's necessary.`,
                line: index + 1,
            });
        }

        if (/\bany\b/.test(trimmed)) {
            detectedProblems.push({
                type: "Use of 'any'",
                severity: "info",
                message: `Usage of 'any' type detected. Consider using a more specific type.`,
                line: index + 1,
            });
        }

        if (/<\s*\w+\s+[^>]*\bmap\s*\(/.test(trimmed)) {
            if (!/key\s*=/.test(lineWithoutComments)) {
                detectedProblems.push({
                    type: "Missing 'key' Prop",
                    severity: "warning",
                    message: `Missing 'key' prop in list item. Add a unique key.`,
                    line: index + 1,
                });
            }
        }

        if (/\b(useState|useEffect|useCallback|useMemo|useRef)\s*\(/.test(trimmed)) {
            const indentation = line.match(/^(\s*)/)?.[1].length || 0;
            if (indentation > 0) {
                detectedProblems.push({
                    type: "React Hooks Rule Violation",
                    severity: "warning",
                    message: `React hooks should not be called inside loops, conditions, or nested functions.`,
                    line: index + 1,
                });
            }
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
export function detectTypeScriptSemanticErrors(codeStr, detectedProblems) {
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

        if (/new\s+Promise\s*\(/.test(trimmed)) {
            detectedProblems.push({
                type: "Potential Asynchronous Issue",
                severity: "info",
                message: `Promise constructor usage detected. Consider using async/await for better readability.`,
                line: index + 1,
            });
        }

        if (/function\s+\w+\s*\([^)]*\)\s*{/.test(trimmed)) {
            const paramsMatch = trimmed.match(/\(([^)]*)\)/);
            if (paramsMatch && paramsMatch[1].trim() !== "") {
                const params = paramsMatch[1].split(',').map(p => p.trim());
                params.forEach(param => {
                    if (!/:/.test(param) && param !== 'props') { 
                        detectedProblems.push({
                            type: "Missing Type Annotation",
                            severity: "info",
                            message: `Parameter '${param}' is missing a type annotation.`,
                            line: index + 1,
                        });
                    }
                });
            }
        }

        if (/![^=]/.test(trimmed)) {
            detectedProblems.push({
                type: "Non-Null Assertion",
                severity: "info",
                message: `Usage of non-null assertion ('!') detected. Consider handling null or undefined cases explicitly.`,
                line: index + 1,
            });
        }

        if (/useEffect\s*\(/.test(trimmed)) {
            const dependenciesMatch = line.match(/\[([^\]]*)\]/);
            if (dependenciesMatch && dependenciesMatch[1].trim() === "") {
                detectedProblems.push({
                    type: "Missing useEffect Dependencies",
                    severity: "warning",
                    message: `useEffect has no dependency array. Consider adding dependencies to avoid unexpected behaviors.`,
                    line: index + 1,
                });
            }
        }

        const stateMatch = trimmed.match(/const\s+\[([a-zA-Z_$][a-zA-Z0-9_$]*)\s*,\s*set[A-Z][a-zA-Z0-9_$]*\]\s*=\s*useState\s*\(/);
        if (stateMatch) {
            const stateVar = stateMatch[1];
            if (!/^is[A-Z]/.test(stateVar) && !/^has[A-Z]/.test(stateVar) && !/^can[A-Z]/.test(stateVar)) {
                detectedProblems.push({
                    type: "State Naming Convention",
                    severity: "info",
                    message: `State variable '${stateVar}' should be prefixed with 'is', 'has', or 'can' for boolean states.`,
                    line: index + 1,
                });
            }
        }

        const functionReturnTypeMatch = trimmed.match(/function\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*\([^)]*\)\s*{/);
        if (functionReturnTypeMatch) {
            if (!/: [a-zA-Z_$][a-zA-Z0-9_$]*/.test(trimmed)) {
                detectedProblems.push({
                    type: "Missing Return Type",
                    severity: "info",
                    message: `Function '${functionReturnTypeMatch[1]}' is missing an explicit return type.`,
                    line: index + 1,
                });
            }
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
