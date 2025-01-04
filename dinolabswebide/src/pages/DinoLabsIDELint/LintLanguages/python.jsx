import { getLineNumber } from "../DinoLabsIDELintUtils";

export function detectPythonSyntaxErrors(codeStr, detectedProblems) {
    const lines = codeStr.split(/\r?\n/);
    const indentStack = [0];
    let indentSize = null;
    let indentChar = null;
    let mixedIndent = false;
    const multiLineOpeners = ["(", "[", "{"];
    let inMultiLineString = false;
    const multiLineStringDelim = ["'''", '"""'];
    let multiLineStringStartLine = -1;
    const structureStack = [];
    let lineContinuation = false;
    let defStatement = false;

    lines.forEach((line, index) => {
        const trimmed = line.trim();

        if (inMultiLineString) {
            const delim = multiLineStringDelim.find((d) => line.includes(d));
            if (delim) {
                const endIndex = line.indexOf(delim, multiLineStringDelim.findIndex(d => d === delim) + delim.length);
                if (endIndex !== -1) {
                    inMultiLineString = false;
                }
            }
            return;
        } else {
            const multiLineDelimFound = multiLineStringDelim.find((delim) =>
                trimmed.startsWith(delim)
            );
            if (multiLineDelimFound) {
                const endDelimIndex = line.indexOf(multiLineDelimFound, multiLineDelimFound.length);
                if (endDelimIndex === -1 || endDelimIndex === multiLineDelimFound.length - 1) {
                    inMultiLineString = true;
                    multiLineStringStartLine = index + 1;
                }
            }
        }

        if (trimmed === "" || trimmed.startsWith("#")) return;

        if (lineContinuation) {
            if (trimmed.endsWith("\\")) {
                lineContinuation = true;
            } else {
                lineContinuation = false;
            }
            return;
        }

        if (trimmed.endsWith("\\")) {
            lineContinuation = true;
            return;
        }

        const match = line.match(/^[ \t]*/);
        const leadingWhitespace = match ? match[0] : "";
        const currentIndentLevel = leadingWhitespace.length;
        const currentIndentChar = leadingWhitespace.includes("\t") ? "\t" : " ";

        if (currentIndentLevel > 0) {
            if (indentChar === null) {
                indentChar = currentIndentChar;
                if (indentChar === " ") {
                    indentSize = leadingWhitespace.length;
                }
            } else {
                if (currentIndentChar !== indentChar) {
                    if (!mixedIndent) {
                        mixedIndent = true;
                        detectedProblems.push({
                            type: "Syntax Error",
                            severity: "error",
                            message: `Mixed tabs and spaces in indentation.`,
                            line: index + 1,
                        });
                    }
                    return;
                }

                if (indentChar === " " && indentSize !== null) {
                    if (leadingWhitespace.length % indentSize !== 0) {
                        detectedProblems.push({
                            type: "Syntax Error",
                            severity: "error",
                            message: `Indentation is not a multiple of ${indentSize} spaces.`,
                            line: index + 1,
                        });
                    }
                }
            }
        }

        const expectedIndentLevel = indentStack[indentStack.length - 1];

        if (currentIndentLevel > expectedIndentLevel) {
            if (
                indentSize !== null &&
                currentIndentLevel - expectedIndentLevel !== indentSize
            ) {
                detectedProblems.push({
                    type: "Syntax Error",
                    severity: "error",
                    message: `Unexpected indentation increase.`,
                    line: index + 1,
                });
            }
            indentStack.push(currentIndentLevel);
        } else if (currentIndentLevel < expectedIndentLevel) {
            while (
                indentStack.length > 0 &&
                indentStack[indentStack.length - 1] > currentIndentLevel
            ) {
                indentStack.pop();
            }
            if (
                indentStack.length === 0 ||
                indentStack[indentStack.length - 1] !== currentIndentLevel
            ) {
                detectedProblems.push({
                    type: "Syntax Error",
                    severity: "error",
                    message: `Unexpected indentation.`,
                    line: index + 1,
                });
            }
        }

        if (multiLineOpeners.includes(trimmed.charAt(trimmed.length - 1))) {
            structureStack.push(trimmed.charAt(trimmed.length - 1));
        }

        const defMatch = trimmed.match(/^def\b/);
        if (defMatch) {
            defStatement = true;
        }

        if (
            /^(if|elif|else|for|while|def|class|try|except|with)\b/.test(trimmed) &&
            !trimmed.endsWith(":") &&
            structureStack.length === 0
        ) {
            const openParens = (trimmed.match(/\(/g) || []).length;
            const closeParens = (trimmed.match(/\)/g) || []).length;
            if (openParens > closeParens) {
                return;
            }

            detectedProblems.push({
                type: "Syntax Error",
                severity: "error",
                message: `Missing colon at the end of the statement.`,
                line: index + 1,
            });
        }

        const varMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=/);
        if (varMatch) {
            const varName = varMatch[1];
            const regex = new RegExp(`\\b${varName}\\b`, "g");
            const occurrences = (codeStr.match(regex) || []).length;
            if (occurrences === 1) {
                detectedProblems.push({
                    type: "Unused Variable",
                    severity: "info",
                    message: `Variable '${varName}' is assigned but never used.`,
                    line: index + 1,
                });
            }
        }

        if (currentIndentLevel < expectedIndentLevel && structureStack.length > 0) {
            structureStack.pop();
        }

        if (defStatement && structureStack.length === 0 && trimmed.endsWith(":")) {
            defStatement = false;
        }
    });

    if (inMultiLineString) {
        detectedProblems.push({
            type: "Syntax Error",
            severity: "error",
            message: `Unterminated multi-line string literal.`,
            line: multiLineStringStartLine,
        });
    }

    structureStack.forEach((unmatched) => {
        detectedProblems.push({
            type: "Syntax Error",
            severity: "error",
            message: `Unmatched opening '${unmatched}'.`,
            line: unmatched.line,
        });
    });
}

export function detectPythonSemanticErrors(codeStr, detectedProblems) {
    const importRegex = /^import\s+([a-zA-Z_][a-zA-Z0-9_]*)(\s+as\s+[a-zA-Z_][a-zA-Z0-9_]*)?/;
    const fromImportRegex = /^from\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+import\s+(.+)/;
    const lines = codeStr.split(/\r?\n/);
    const imports = [];
    const fromImports = [];
    const declaredFunctions = [];
    const usedFunctions = new Set();

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        const match = trimmed.match(importRegex);
        const fromMatch = trimmed.match(fromImportRegex);
        if (match) {
            const importedModule = match[1];
            imports.push({ module: importedModule, line: index + 1 });
        }
        if (fromMatch) {
            const importedModule = fromMatch[1];
            const importedItems = fromMatch[2]
                .split(",")
                .map((item) => item.trim().split(" as ")[0]);
            importedItems.forEach((item) => {
                fromImports.push({ module: item, line: index + 1 });
            });
        }

        const funcMatch = trimmed.match(/^def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
        if (funcMatch) {
            const funcName = funcMatch[1];
            declaredFunctions.push({ name: funcName, line: index + 1 });
        }

        const usageMatches = line.match(/\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g);
        if (usageMatches) {
            usageMatches.forEach((funcName) => {
                usedFunctions.add(funcName);
            });
        }
    });

    imports.forEach((imp) => {
        const regex = new RegExp(`\\b${imp.module}\\b`, "g");
        const occurrences = (codeStr.match(regex) || []).length;
        if (occurrences === 1) {
            detectedProblems.push({
                type: "Unused Import",
                severity: "info",
                message: `Module '${imp.module}' is imported but never used.`,
                line: imp.line,
            });
        }
    });

    fromImports.forEach((imp) => {
        const regex = new RegExp(`\\b${imp.module}\\b`, "g");
        const occurrences = (codeStr.match(regex) || []).length;
        if (occurrences === 1) {
            detectedProblems.push({
                type: "Unused Import",
                severity: "info",
                message: `Imported item '${imp.module}' is not used.`,
                line: imp.line,
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

    const potentialExceptionRegex = /(raise\s+Exception|raise\s+[a-zA-Z_][a-zA-Z0-9_]*\()/;
    const exceptionMatch = codeStr.match(potentialExceptionRegex);
    if (exceptionMatch) {
        detectedProblems.push({
            type: "Exception Handling",
            severity: "info",
            message: `Potential unhandled exception raised.`,
            line: getLineNumber(codeStr, exceptionMatch.index),
        });
    }
}
