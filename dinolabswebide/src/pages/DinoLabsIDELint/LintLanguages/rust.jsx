import { getLineNumber } from "../DinoLabsIDELintUtils";

export function detectRustSyntaxErrors(codeStr, detectedProblems) {
    const lines = codeStr.split(/\r?\n/);
    const multiLineOpeners = ["{", "(", "["];
    const multiLineClosers = ["}", ")", "]"];
    const structureStack = [];
    let inString = false;
    let stringChar = '';
    let isInMultiLineStatement = false;

    lines.forEach((line, index) => {
        let trimmedLine = line.trim();

        const commentIndex = trimmedLine.indexOf("//");
        if (commentIndex !== -1) {
            trimmedLine = trimmedLine.substring(0, commentIndex).trim();
        }

        for (let i = 0; i < trimmedLine.length; i++) {
            const char = trimmedLine[i];
            const prevChar = i > 0 ? trimmedLine[i - 1] : null;

            if (inString) {
                if (char === stringChar && prevChar !== '\\') {
                    inString = false;
                }
                continue;
            }

            if (char === '"' || char === "'") {
                inString = true;
                stringChar = char;
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

        const endsWithOperator = /[+\-*/%&|^<>]=?$/.test(trimmedLine);
        if (endsWithOperator) {
            isInMultiLineStatement = true;
        } else if (trimmedLine.endsWith(";")) {
            isInMultiLineStatement = false;
        }

        const exclusionPatterns = [
            /^use\s+/,
            /^fn\s+/,
            /^struct\s+/, /^enum\s+/, /^trait\s+/, /^impl\s+/, /^mod\s+/, /^pub\s+/, /^const\s+/, /^static\s+/, /^type\s+/,
            /^pub\s+fn\s+/, /^pub\s+struct\s+/, /^pub\s+enum\s+/, /^pub\s+trait\s+/
        ];

        const isExempt = exclusionPatterns.some((pattern) => pattern.test(trimmedLine));

        if (
            !inString &&
            !isExempt &&
            !trimmedLine.endsWith("{") &&
            !trimmedLine.endsWith("}") &&
            !trimmedLine.endsWith(",") &&
            trimmedLine !== "" &&
            !isInMultiLineStatement
        ) {
            if (!trimmedLine.endsWith(";")) {
                detectedProblems.push({
                    type: "Missing Semicolon",
                    severity: "warning",
                    message: `Missing semicolon at end of statement.`,
                    line: index + 1,
                });
            }
        }

        const varMatch = trimmedLine.match(/let\s+(mut\s+)?([a-zA-Z_][a-zA-Z0-9_]*)/);
        if (varMatch) {
            const varName = varMatch[2];
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
    });

    structureStack.forEach((unmatched) => {
        detectedProblems.push({
            type: "Syntax Error",
            severity: "error",
            message: `Unmatched opening '${unmatched.char}'.`,
            line: unmatched.line,
        });
    });

    const unusedImports = codeStr.match(/use\s+[a-zA-Z_][a-zA-Z0-9_:]*;/g);
    if (unusedImports) {
        unusedImports.forEach((importStmt) => {
            const moduleMatch = importStmt.match(/use\s+([a-zA-Z_][a-zA-Z0-9_:]*)\s*;/);
            if (moduleMatch) {
                const moduleName = moduleMatch[1];
                const regex = new RegExp(`\\b${moduleName.split("::").pop()}\\b`, "g");
                const occurrences = (codeStr.match(regex) || []).length;
                if (occurrences === 1) {
                    detectedProblems.push({
                        type: "Unused Import",
                        severity: "info",
                        message: `Import '${moduleName}' is declared but never used.`,
                        line: getLineNumber(codeStr, codeStr.indexOf(importStmt)),
                    });
                }
            }
        });
    }
}

export function detectRustSemanticErrors(codeStr, detectedProblems) {
    const lines = codeStr.split(/\r?\n/);
    const declaredVariables = [];
    const usedVariables = new Set();
    const ownershipIssues = [];

    lines.forEach((line, index) => {
        const varMatch = line.match(/let\s+(mut\s+)?([a-zA-Z_][a-zA-Z0-9_]*)/);
        if (varMatch) {
            const varName = varMatch[2];
            declaredVariables.push({ name: varName, line: index + 1 });
        }

        const usageMatches = line.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g);
        if (usageMatches) {
            usageMatches.forEach((varName) => {
                usedVariables.add(varName);
            });
        }

        const ownershipMatch = line.match(/&mut\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
        if (ownershipMatch) {
            ownershipIssues.push({ name: ownershipMatch[1], line: index + 1 });
        }
    });

    declaredVariables.forEach((varObj) => {
        if (!usedVariables.has(varObj.name)) {
            detectedProblems.push({
                type: "Unused Variable",
                severity: "info",
                message: `Variable '${varObj.name}' is declared but never used.`,
                line: varObj.line,
            });
        }
    });

    ownershipIssues.forEach((issue) => {
        detectedProblems.push({
            type: "Ownership Issue",
            severity: "warning",
            message: `Mutable reference '${issue.name}' detected. Ensure proper ownership handling.`,
            line: issue.line,
        });
    });

    const lifetimeIssues = codeStr.match(/'([a-zA-Z0-9_]+)\b/g);
    if (lifetimeIssues) {
        lifetimeIssues.forEach((lifetime) => {
            detectedProblems.push({
                type: "Lifetime Annotation",
                severity: "info",
                message: `Lifetime '${lifetime}' detected. Ensure it aligns with ownership rules.`,
                line: getLineNumber(codeStr, codeStr.indexOf(lifetime)),
            });
        });
    }
}
