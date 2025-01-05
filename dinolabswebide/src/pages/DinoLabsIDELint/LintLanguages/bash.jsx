import { getLineNumber } from "../DinoLabsIDELintUtils";

export function detectBashSyntaxErrors(codeStr, detectedProblems) {
    const quoteTypes = ["'", '"'];
    quoteTypes.forEach((quote) => {
        const matches = codeStr.split(quote).length - 1;
        if (matches % 2 !== 0) {
            detectedProblems.push({
                type: "Syntax Error",
                severity: "error",
                message: `Unmatched ${quote} quote.`,
                line: getLineNumber(codeStr, codeStr.lastIndexOf(quote)),
            });
        }
    });

    const multiLineOpeners = ["{", "(", "["];
    const multiLineClosers = ["}", ")", "]"];
    const structureStack = [];
    const lines = codeStr.split(/\r?\n/);
    let inSingleQuote = false;
    let inDoubleQuote = false;

    lines.forEach((line, index) => {
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const prevChar = i > 0 ? line[i - 1] : null;

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

            if (char === "'") {
                inSingleQuote = true;
                continue;
            }

            if (char === '"') {
                inDoubleQuote = true;
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
            /^#!/,
            /^export\s+/,
            /^alias\s+/,
            /^function\s+/,
            /^if\s+/, /^else\s*/, /^elif\s*/, /^fi$/,
            /^for\s+/, /^while\s*/, /^until\s*/, /^do$/, /^done$/,
            /^case\s+/, /^esac$/,
            /^select\s+/, /^then$/, /^elif\s*/,
        ];

        const isExempt = exclusionPatterns.some((pattern) => pattern.test(trimmed));

        if (
            !inSingleQuote &&
            !inDoubleQuote &&
            !isExempt &&
            trimmed !== "" &&
            !trimmed.startsWith("#") &&
            !trimmed.startsWith("&&") &&
            !trimmed.startsWith("||") &&
            (trimmed.includes("&&") || trimmed.includes("||") || trimmed.includes(";")) &&
            !trimmed.endsWith(";") &&
            !trimmed.endsWith("{") &&
            !trimmed.endsWith("}") &&
            !trimmed.endsWith(":")
        ) {
            detectedProblems.push({
                type: "Missing Semicolon",
                severity: "warning",
                message: `Missing semicolon in complex command.`,
                line: index + 1,
            });
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

        if (/&&|\|\|/.test(trimmed) && !trimmed.endsWith(";")) {
            detectedProblems.push({
                type: "Syntax Warning",
                severity: "warning",
                message: `Missing semicolon in complex command.`,
                line: index + 1,
            });
        }

        if (/^\s*exit\s+\d+/.test(trimmed) && !/\s*$/.test(trimmed)) {
            detectedProblems.push({
                type: "Best Practice",
                severity: "info",
                message: `Explicit exit status found. Ensure it aligns with intended script behavior.`,
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

export function detectBashSemanticErrors(codeStr, detectedProblems) {
    const lines = codeStr.split(/\r?\n/);
    const declaredVariables = [];
    const usedVariables = new Set();

    lines.forEach((line, index) => {
        const varMatch = line.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*=/);
        if (varMatch) {
            const varName = varMatch[1];
            declaredVariables.push({ name: varName, line: index + 1 });
        }

        const usageMatches = line.match(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g);
        if (usageMatches) {
            usageMatches.forEach((varUsage) => {
                const varName = varUsage.replace('$', '');
                usedVariables.add(varName);
            });
        }
    });

    declaredVariables.forEach((varObj) => {
        if (!usedVariables.has(varObj.name)) {
            detectedProblems.push({
                type: "Unused Variable",
                severity: "info",
                message: `Variable '$${varObj.name}' is declared but never used.`,
                line: varObj.line,
            });
        }
    });
}
