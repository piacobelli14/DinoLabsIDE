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

    lines.forEach((line, index) => {
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const prevChar = i > 0 ? line[i - 1] : null;

            if (inTemplateString) {
                if (char === '`' && prevChar !== '\\') {
                    inTemplateString = false;
                }
                continue;
            }

            if (inSingleQuote) {
                if (char === "'" && prevChar !== '\\') {
                    inSingleQuote = false;
                }
                continue;
            }

            if (inDoubleQuote) {
                if (char === '"' && prevChar !== '\\') {
                    inDoubleQuote = false;
                }
                continue;
            }

            if (inRegex) {
                if (char === '/' && prevChar !== '\\') {
                    inRegex = false;
                }
                continue;
            }

            if (char === '`') {
                inTemplateString = true;
                continue;
            }

            if (char === "'" && prevChar !== '\\') {
                inSingleQuote = true;
                continue;
            }

            if (char === '"' && prevChar !== '\\') {
                inDoubleQuote = true;
                continue;
            }

            if (char === '/' && line[i + 1] === '/' && !inRegex) {
                break;
            }

            if (char === '/' && line[i + 1] === '*' && !inRegex) {
                i += 1;
                while (i < line.length && !(line[i] === '*' && line[i + 1] === '/')) {
                    i++;
                }
                i++;
                continue;
            }

            if (char === '/' && (/[a-zA-Z0-9_$]/.test(line[i - 1]) || line[i - 1] === ')')) {
                inRegex = true;
                continue;
            }

            if (multiLineOpeners.includes(char)) {
                structureStack.push({ char, line: index + 1 });
            } else if (multiLineClosers.includes(char)) {
                const last = structureStack.pop();
                const expected = multiLineOpeners[multiLineClosers.indexOf(char)];
                if (last && last.char !== expected) {
                    detectedProblems.push({
                        type: "Syntax Error",
                        severity: "error",
                        message: `Mismatched '${last.char}' and '${char}'.`,
                        line: last.line,
                    });
                }
            }
        }

        const trimmed = line.trim();

        const exclusionPatterns = [
            /^import\s+.+from\s+['"].+['"];?/,
            /^export\s+/,
            /^function\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*\(/,
            /^{\s*$/,
            /^}\s*$/,
            /^if\s*\(.+\)\s*{?$/,
            /^else\s*{?$/,
            /^for\s*\(.+\)\s*{?$/,
            /^while\s*\(.+\)\s*{?$/,
            /^switch\s*\(.+\)\s*{?$/,
            /^case\s+.*:/, /^default\s*:/,
            /^try\s*{?$/,
            /^catch\s*\(.+\)\s*{?$/,
            /^finally\s*{?$/,
            /^class\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*{?/,
            /^new\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*\(/,
            /^else\s+if\s*\(.+\)\s*{?$/,
            /^do\s*{?$/,
            /^while\s*\(.+\)\s*;?$/,
        ];

        const isExempt = exclusionPatterns.some((pattern) => pattern.test(trimmed));

        if (
            !inTemplateString &&
            !inSingleQuote &&
            !inDoubleQuote &&
            !inRegex &&
            !isExempt &&
            trimmed !== "" &&
            !trimmed.startsWith("//") &&
            !trimmed.startsWith("/*") &&
            !trimmed.startsWith("*") &&
            !trimmed.startsWith("*/")
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

        if (/var\s+/.test(trimmed)) {
            detectedProblems.push({
                type: "Deprecated Syntax",
                severity: "warning",
                message: `Usage of 'var' is deprecated. Consider using 'let' or 'const'.`,
                line: index + 1,
            });
        }

        if (/console\.log\(/.test(trimmed)) {
            detectedProblems.push({
                type: "Debug Statement",
                severity: "info",
                message: `Detected 'console.log' statement. Consider removing before production.`,
                line: index + 1,
            });
        }

        if (/===/.test(trimmed) && !/!==/.test(trimmed)) {
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

export function detectJavaScriptSemanticErrors(codeStr, detectedProblems) {
    const lines = codeStr.split(/\r?\n/);
    let returnFound = false;
    const declaredFunctions = [];
    const usedFunctions = new Set();

    lines.forEach((line, index) => {
        const trimmed = line.trim();

        if (returnFound && trimmed !== "") {
            detectedProblems.push({
                type: "Unreachable Code",
                severity: "warning",
                message: `Code detected after a return statement.`,
                line: index + 1,
            });
        }

        if (/return\b/.test(trimmed)) {
            returnFound = true;
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
                line: getLineNumber(codeStr, promiseMatch.index),
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
