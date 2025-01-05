import { getLineNumber } from "../DinoLabsIDELintUtils";

export function detectCSyntaxErrors(codeStr, detectedProblems) {
    const lines = codeStr.split(/\r?\n/);
    const multiLineOpeners = ["{", "[", "("];
    const multiLineClosers = ["}", "]", ")"];
    const structureStack = [];
    let inSingleLineComment = false;
    let inMultiLineComment = false;
    let openNestingLevel = 0; 

    lines.forEach((line, index) => {
        let i = 0;
        let lineWithoutComments = '';
        while (i < line.length) {
            const char = line[i];
            const nextChar = i < line.length - 1 ? line[i + 1] : null;

            if (inSingleLineComment) {
                break;
            }

            if (inMultiLineComment) {
                if (char === '*' && nextChar === '/') {
                    inMultiLineComment = false;
                    i += 2;
                    continue;
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

            lineWithoutComments += char;
            i++;
        }

        inSingleLineComment = false;

        for (let char of lineWithoutComments) {
            if (multiLineOpeners.includes(char)) {
                openNestingLevel++;
            } else if (multiLineClosers.includes(char)) {
                openNestingLevel = Math.max(openNestingLevel - 1, 0);
            }
        }

        const trimmed = lineWithoutComments.trim();

        const exclusionPatterns = [
            /^#/, 
            /^#include\s+/,
            /^using\s+/,
            /^public:/, /^private:/, /^protected:/,
            /^case\s+.*:/, /^default\s*:/,
            /^namespace\s+/, /^class\s+/, /^struct\s+/,
            /^enum\s+/, /^interface\s+/, /^delegate\s+/,
            /^function\s+/,
            /^template\s+/,
            /^typedef\s+/,
            /^if\s*\(.+\)\s*{?$/,
            /^else\s*{?$/,
            /^for\s*\(.+\)\s*{?$/,
            /^while\s*\(.+\)\s*{?$/,
            /^switch\s*\(.+\)\s*{?$/,
            /^do\s*{?$/,
            /^try\s*{?$/,
            /^catch\s*\(.+\)\s*{?$/,
            /^finally\s*{?$/,
            /^public\s+(class|interface)\s+[a-zA-Z_][a-zA-Z0-9_]*\s*{?/,
            /^new\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(/,
            /^else\s+if\s*\(.+\)\s*{?$/,
            /^return\b.*$/, 
            /^#pragma\s+once\b/, 
            /^#define\b/,
            /^#ifndef\b/,
            /^#endif\b/,
            /^#if\b/,
            /^#else\b/,
            /^#elif\b/,
        ];

        const isExempt = exclusionPatterns.some((pattern) => pattern.test(trimmed));
        const isLabelOrInitializer = trimmed.endsWith(":");

        if (
            openNestingLevel === 0 &&
            !inMultiLineComment &&
            !isExempt &&
            !isLabelOrInitializer &&
            !trimmed.endsWith("{") &&
            !trimmed.endsWith("}") &&
            !trimmed.endsWith(":") &&
            !trimmed.endsWith(",") &&
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

        const varMatch = trimmed.match(/(?:int|float|double|char|bool|string|var|auto)\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
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

        if (/auto\b/.test(trimmed)) {
            detectedProblems.push({
                type: "Deprecated Keyword",
                severity: "warning",
                message: `Usage of 'auto' keyword is deprecated.`,
                line: index + 1,
            });
        }

        const classMatch = trimmed.match(/public\s+(class|interface)\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
        if (classMatch) {
            const type = classMatch[1];
            const name = classMatch[2];
            detectedProblems.push({
                type: "Naming Convention",
                severity: "info",
                message: `${type} '${name}' should follow PascalCase naming convention.`,
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

export function detectCSemanticErrors(codeStr, detectedProblems) {
    const functionRegex = /(?:public|private|protected|internal)\s+(?:static\s+)?(?:void|int|float|double|char|bool|string|var|auto)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
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

    const usingDirectives = codeStr.match(/using\s+[a-zA-Z_][a-zA-Z0-9_:]*;/g);
    if (usingDirectives) {
        usingDirectives.forEach((directive) => {
            const moduleMatch = directive.match(/using\s+([a-zA-Z_][a-zA-Z0-9_:]*)\s*;/);
            if (moduleMatch) {
                const moduleName = moduleMatch[1];
                const regex = new RegExp(`\\b${moduleName.split("::").pop()}\\b`, "g");
                const occurrences = (codeStr.match(regex) || []).length;
                if (occurrences === 1) {
                    detectedProblems.push({
                        type: "Unused Import",
                        severity: "info",
                        message: `Using directive '${moduleName}' is declared but never used.`,
                        line: getLineNumber(codeStr, codeStr.indexOf(directive)),
                    });
                }
            }
        });
    }
}
