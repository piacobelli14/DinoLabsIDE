import { getLineNumber } from "../DinoLabsIDELintUtils";

export function detectPHPSyntaxErrors(codeStr, detectedProblems) {
    const lines = codeStr.split(/\r?\n/);
    const multiLineOpeners = ["{", "[", "("];
    const multiLineClosers = ["}", "]", ")"];
    const structureStack = [];
    let inSingleLineComment = false;
    let inMultiLineComment = false;
    let inString = false;
    let stringChar = '';

    lines.forEach((line, index) => {
        let i = 0;
        while (i < line.length) {
            const char = line[i];
            const nextChar = i < line.length - 1 ? line[i + 1] : null;

            if (inMultiLineComment) {
                if (char === '*' && nextChar === '/') {
                    inMultiLineComment = false;
                    i += 2;
                    continue;
                }
                i++;
                continue;
            }

            if (inString) {
                if (char === stringChar && line[i - 1] !== '\\') {
                    inString = false;
                }
                i++;
                continue;
            }

            if (char === '/' && nextChar === '/') {
                inSingleLineComment = true;
                break;
            }

            if (char === '/' && nextChar === '*') {
                inMultiLineComment = true;
                i += 2;
                continue;
            }

            if (char === '"' || char === "'") {
                inString = true;
                stringChar = char;
                i++;
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
            i++;
        }

        inSingleLineComment = false;

        const trimmed = line.trim();

        const exclusionPatterns = [
            /^#include\s+/,
            /^use\s+/,
            /^namespace\s+/,
            /^class\s+/, /^interface\s+/, /^trait\s+/, /^abstract\s+/, /^final\s+/,
            /^function\s+/,
            /^extends\s+/, /^implements\s+/,
            /^const\s+/, /^define\s*\(/,
            /^echo\s+/, /^print\s+/,
            /^if\s*\(.+\)\s*{?$/,
            /^else\s*{?$/,
            /^for\s*\(.+\)\s*{?$/,
            /^foreach\s*\(.+\)\s*{?$/,
            /^while\s*\(.+\)\s*{?$/,
            /^switch\s*\(.+\)\s*{?$/,
            /^do\s*{?$/,
            /^try\s*{?$/,
            /^catch\s*\(.+\)\s*{?$/,
            /^finally\s*{?$/,
            /^case\s+.*:/, /^default\s*:/,
        ];

        const isExempt = exclusionPatterns.some((pattern) => pattern.test(trimmed));

        if (
            !inString &&
            !inMultiLineComment &&
            !isExempt &&
            !trimmed.endsWith("{") &&
            !trimmed.endsWith("}") &&
            !trimmed.endsWith(":") &&
            !trimmed.endsWith(",") &&
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
                    message: `Missing semicolon at end of SQL statement.`,
                    line: index + 1,
                });
            }
        }

        const varMatch = trimmed.match(/\$([a-zA-Z_][a-zA-Z0-9_]*)\s*=/);
        if (varMatch) {
            const varName = varMatch[1];
            const regex = new RegExp(`\\$${varName}\\b`, "g");
            const occurrences = (codeStr.match(regex) || []).length;
            if (occurrences === 1) {
                detectedProblems.push({
                    type: "Unused Variable",
                    severity: "info",
                    message: `Variable '$${varName}' is assigned but never used.`,
                    line: index + 1,
                });
            }
        }

        if (/mysql_connect\(/.test(trimmed)) {
            detectedProblems.push({
                type: "Deprecated Function",
                severity: "warning",
                message: `Function 'mysql_connect' is deprecated. Consider using 'mysqli_connect' or PDO.`,
                line: index + 1,
            });
        }

        if (/var\s+/.test(trimmed)) {
            detectedProblems.push({
                type: "Deprecated Syntax",
                severity: "warning",
                message: `Usage of 'var' is deprecated. Consider using explicit types.`,
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

export function detectPHPSemanticErrors(codeStr, detectedProblems) {
    const functionRegex = /function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
    const functions = [];
    let match;

    while ((match = functionRegex.exec(codeStr)) !== null) {
        const funcName = match[1];
        functions.push({ name: funcName, line: getLineNumber(codeStr, match.index) });
    }

    functions.forEach((func) => {
        const regex = new RegExp(`\\b${func.name}\\b`, "g");
        const occurrences = (codeStr.match(regex) || []).length;
        if (occurrences === 1) {
            detectedProblems.push({
                type: "Unused Function",
                severity: "info",
                message: `Function '${func.name}' is defined but never called.`,
                line: func.line,
            });
        }
    });

    const deprecatedFunctions = ["mysql_connect", "ereg", "split"];
    deprecatedFunctions.forEach((func) => {
        const regex = new RegExp(`\\b${func}\\b`, "g");
        const matches = codeStr.match(regex);
        if (matches) {
            matches.forEach((matchItem) => {
                detectedProblems.push({
                    type: "Deprecated Function",
                    severity: "warning",
                    message: `Function '${matchItem}' is deprecated.`,
                    line: getLineNumber(codeStr, codeStr.indexOf(matchItem)),
                });
            });
        }
    });
}
