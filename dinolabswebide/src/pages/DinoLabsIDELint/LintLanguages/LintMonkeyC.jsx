import { getLineNumber } from "../DinoLabsIDELintUtils";

export function detectMonkeyCSyntaxErrors(codeStr, detectedProblems) {
    const lines = codeStr.split(/\r?\n/);
    const multiLineOpeners = ["{", "(", "["];
    const multiLineClosers = ["}", ")", "]"];
    const structureStack = [];
    let inString = false;
    let stringChar = '';

    lines.forEach((line, index) => {
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const prevChar = i > 0 ? line[i - 1] : null;

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

        const trimmed = line.trim();

        const exclusionPatterns = [
            /^import\s+/, /^struct\s+/, /^class\s+/, /^enum\s+/, /^protocol\s+/, /^extension\s+/
        ];

        const isExempt = exclusionPatterns.some((pattern) => pattern.test(trimmed));

        if (
            !inString &&
            !isExempt &&
            !trimmed.endsWith("{") &&
            !trimmed.endsWith("}") &&
            !trimmed.endsWith(":") &&
            !trimmed.endsWith(",") &&
            trimmed !== "" &&
            !trimmed.startsWith("//")
        ) {
            if (!trimmed.endsWith(";")) {
                if (!trimmed.endsWith("}")) {
                    detectedProblems.push({
                        type: "Missing Semicolon",
                        severity: "warning",
                        message: `Missing semicolon at the end of the statement.`,
                        line: index + 1,
                    });
                }
            }
        }

        const varMatch = trimmed.match(/var\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=/);
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

        if (/switch\s*\(/.test(trimmed)) {
            detectedProblems.push({
                type: "Switch Statement",
                severity: "info",
                message: `Switch statement detected. Ensure all cases are handled properly.`,
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

export function detectMonkeyCSemanticErrors(codeStr, detectedProblems) {
    const lines = codeStr.split(/\r?\n/);
    const declaredVariables = [];
    const usedVariables = new Set();

    lines.forEach((line, index) => {
        const varMatch = line.match(/var\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=/);
        if (varMatch) {
            const varName = varMatch[1];
            declaredVariables.push({ name: varName, line: index + 1 });
        }

        const usageMatches = line.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g);
        if (usageMatches) {
            usageMatches.forEach((varName) => {
                usedVariables.add(varName);
            });
        }

        if (/foreach\s*\(/.test(line)) {
            detectedProblems.push({
                type: "Loop Statement",
                severity: "info",
                message: `Foreach loop detected. Ensure it's used correctly for iterating collections.`,
                line: index + 1,
            });
        }

        if (/break\s*;/.test(line) && !/switch\s*\(/.test(line)) {
            detectedProblems.push({
                type: "Break Statement",
                severity: "info",
                message: `Break statement detected. Ensure it's used within loops or switch statements.`,
                line: index + 1,
            });
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

    const switchCases = codeStr.match(/switch\s*\(.+\)\s*\{/g);
    if (switchCases) {
        switchCases.forEach((switchCase) => {
            detectedProblems.push({
                type: "Switch Statement",
                severity: "info",
                message: `Switch statement detected. Ensure all cases are handled properly.`,
                line: getLineNumber(codeStr, codeStr.indexOf(switchCase)),
            });
        });
    }
}
