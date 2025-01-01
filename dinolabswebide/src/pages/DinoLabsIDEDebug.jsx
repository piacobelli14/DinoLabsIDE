
import React, { useEffect, useState } from "react";
import Tippy from "@tippyjs/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faExclamationTriangle, faInfoCircle, faCheckCircle, faBug, faFilter, faDownload, faSearch, faFileExport, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import "../styles/mainStyles/DinoLabsIDEDebug.css";
const icons = {
    error: <FontAwesomeIcon icon={faTriangleExclamation}/>,
    warning: <FontAwesomeIcon icon={faExclamationTriangle}/>,
    info: <FontAwesomeIcon icon={faInfoCircle}/>,
    bug: <FontAwesomeIcon icon={faBug}/>,
    filter: <FontAwesomeIcon icon={faFilter}/>,
    download: <FontAwesomeIcon icon={faDownload}/>,
    search: <FontAwesomeIcon icon={faSearch}/>,
};

const getLineNumber = (codeStr, index) => {
    return codeStr.slice(0, index).split(/\r?\n/).length;
};

const removeDuplicateProblems = (problems) => {
    const unique = [];
    const seen = new Set();

    problems.forEach((problem) => {
        const key = `${problem.type}-${problem.message}-${problem.line}`;
        if (!seen.has(key)) {
            seen.add(key);
            unique.push(problem);
        }
    });

    return unique;
};

const detectionFunctions = {
    javascript: {
        syntax: detectJavaScriptSyntaxErrors,
        semantic: detectJavaScriptSemanticErrors,
    },
    python: {
        syntax: detectPythonSyntaxErrors,
        semantic: detectPythonSemanticErrors,
    },
    "c": {
        syntax: detectCSyntaxErrors,
        semantic: detectCSemanticErrors,
    },
    "c++": {
        syntax: detectCSyntaxErrors,
        semantic: detectCSemanticErrors,
    },
    "c#": {
        syntax: detectCSyntaxErrors,
        semantic: detectCSemanticErrors,
    },
    php: {
        syntax: detectPHPSyntaxErrors,
        semantic: detectPHPSemanticErrors,
    },
    bash: {
        syntax: detectBashSyntaxErrors,
        semantic: () => { },
    },
    shell: {
        syntax: detectBashSyntaxErrors,
        semantic: () => { },
    },
    css: {
        syntax: detectCSSSyntaxErrors,
        semantic: detectCSSSemanticErrors,
    },
    html: {
        syntax: detectHTMLSyntaxErrors,
        semantic: detectHTMLSemanticErrors,
    },
    sql: {
        syntax: detectSQLSyntaxErrors,
        semantic: detectSQLSemanticErrors,
    },
    rust: {
        syntax: detectRustSyntaxErrors,
        semantic: detectRustSemanticErrors,
    },
    swift: {
        syntax: detectSwiftSyntaxErrors,
        semantic: detectSwiftSemanticErrors,
    },
    "monkey c": {
        syntax: detectMonkeyCSyntaxErrors,
        semantic: detectMonkeyCSemanticErrors,
    },
    assembly: {
        syntax: detectAssemblySyntaxErrors,
        semantic: detectAssemblySemanticErrors,
        bestPractice: detectAssemblyBestPractices,
    },
};

function detectJavaScriptSyntaxErrors(codeStr, detectedProblems) {
    const lines = codeStr.split(/\r?\n/);
    const multiLineOpeners = ["{", "[", "("];
    const multiLineClosers = ["}", "]", ")"];
    const structureStack = [];

    lines.forEach((line, index) => {
        const trimmed = line.trim();

        for (let char of line) {
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

        if (
            !trimmed.endsWith(";") &&
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
            detectedProblems.push({
                type: "Missing Semicolon",
                severity: "warning",
                message: `Missing semicolon at the end of the statement.`,
                line: index + 1,
            });
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

function detectJavaScriptSemanticErrors(codeStr, detectedProblems) {
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

        const funcMatch = trimmed.match(/function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
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

function detectPythonSyntaxErrors(codeStr, detectedProblems) {
    const lines = codeStr.split(/\r?\n/);
    const indentStack = [0];
    let indentSize = null;
    let indentChar = null;
    let mixedIndent = false;
    const multiLineOpeners = [":"];
    let inMultiLineString = false;
    const multiLineStringDelim = ["'''", '"""'];
    let multiLineStringStartLine = -1;
    const structureStack = [];

    lines.forEach((line, index) => {
        const trimmed = line.trim();

        if (inMultiLineString) {
            if (
                line.includes(
                    multiLineStringDelim.find((delim) => line.includes(delim))
                )
            ) {
                inMultiLineString = false;
            }
            return;
        } else {
            const multiLineDelimFound = multiLineStringDelim.find((delim) =>
                trimmed.startsWith(delim)
            );
            if (multiLineDelimFound) {
                if (
                    !trimmed.endsWith(multiLineDelimFound) ||
                    trimmed === multiLineDelimFound
                ) {
                    inMultiLineString = true;
                    multiLineStringStartLine = index + 1;
                    detectedProblems.push({
                        type: "Syntax Error",
                        severity: "error",
                        message: `Unterminated multi-line string literal.`,
                        line: multiLineStringStartLine,
                    });
                    return;
                }
            }
        }

        if (trimmed === "" || trimmed.startsWith("#")) return;

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
            structureStack.push(":");
        }

        if (
            /^(if|elif|else|for|while|def|class|try|except|with)\b/.test(trimmed) &&
            !trimmed.endsWith(":")
        ) {
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
    });

    structureStack.forEach(() => {
        detectedProblems.push({
            type: "Syntax Error",
            severity: "error",
            message: `Unmatched opening ':'.`,
            line: null,
        });
    });
}

function detectPythonSemanticErrors(codeStr, detectedProblems) {
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

function detectCSyntaxErrors(codeStr, detectedProblems) {
    const lines = codeStr.split(/\r?\n/);
    const multiLineOpeners = ["{", "[", "("];
    const multiLineClosers = ["}", "]", ")"];
    const structureStack = [];

    lines.forEach((line, index) => {
        const trimmed = line.trim();

        for (let char of line) {
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

        if (
            !trimmed.endsWith(";") &&
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
            detectedProblems.push({
                type: "Missing Semicolon",
                severity: "warning",
                message: `Missing semicolon at the end of the statement.`,
                line: index + 1,
            });
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

function detectCSemanticErrors(codeStr, detectedProblems) {
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

function detectPHPSyntaxErrors(codeStr, detectedProblems) {
    const lines = codeStr.split(/\r?\n/);
    const multiLineOpeners = ["{", "[", "("];
    const multiLineClosers = ["}", "]", ")"];
    const structureStack = [];

    lines.forEach((line, index) => {
        const trimmed = line.trim();

        for (let char of line) {
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

        if (
            !trimmed.endsWith(";") &&
            !trimmed.endsWith("{") &&
            !trimmed.endsWith("}") &&
            !trimmed.endsWith(":") &&
            trimmed !== "" &&
            !trimmed.startsWith("//") &&
            !trimmed.startsWith("#")
        ) {
            detectedProblems.push({
                type: "Missing Semicolon",
                severity: "warning",
                message: `Missing semicolon at end of SQL statement.`,
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

function detectPHPSemanticErrors(codeStr, detectedProblems) {
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

function detectBashSyntaxErrors(codeStr, detectedProblems) {
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

    lines.forEach((line, index) => {
        const trimmed = line.trim();

        for (let char of line) {
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

        const validCommands = new Set([
            "echo",
            "cd",
            "ls",
            "pwd",
            "mkdir",
            "rm",
            "rmdir",
            "touch",
            "cp",
            "mv",
            "cat",
            "grep",
            "find",
            "chmod",
            "chown",
            "sudo",
            "apt",
            "yum",
            "brew",
            "ping",
            "curl",
            "wget",
            "alias",
            "unalias",
            "if",
            "then",
            "fi",
            "for",
            "while",
            "do",
            "done",
            "case",
            "esac",
            "select",
            "function",
            "return",
            "export",
            "source",
            "readonly",
        ]);

        if (trimmed !== "" && !trimmed.startsWith("#")) {
            const command = trimmed.split(/\s+/)[0];
            if (!validCommands.has(command)) {
                const isWithinStructure = structureStack.length > 0;
                if (!isWithinStructure) {
                    detectedProblems.push({
                        type: "Syntax Error",
                        severity: "error",
                        message: `Invalid command '${command}'.`,
                        line: index + 1,
                    });
                }
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

function detectCSSSyntaxErrors(codeStr, detectedProblems) {
    const lines = codeStr.split(/\r?\n/);
    const multiLineOpeners = ["{", "("];
    const multiLineClosers = ["}", ")"];
    const structureStack = [];

    lines.forEach((line, index) => {
        const trimmed = line.trim();

        for (let char of line) {
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

        if (
            trimmed !== "" &&
            !trimmed.startsWith("/*") &&
            !trimmed.startsWith("*") &&
            !trimmed.startsWith("*/") &&
            !trimmed.startsWith("//") &&
            !trimmed.endsWith(";") &&
            !trimmed.endsWith("{") &&
            !trimmed.endsWith("}") &&
            !trimmed.endsWith(":")
        ) {
            detectedProblems.push({
                type: "Missing Semicolon",
                severity: "warning",
                message: `Missing semicolon at end of declaration.`,
                line: index + 1,
            });
        }

        const propertyMatch = trimmed.match(/^([a-zA-Z-]+)\s*:/);
        if (propertyMatch) {
            const propertyName = propertyMatch[1];
            const validProperties = new Set([
                "color",
                "background",
                "margin",
                "padding",
                "font-size",
                "font-weight",
                "display",
                "position",
                "top",
                "left",
                "right",
                "bottom",
                "width",
                "height",
                "border",
                "flex",
                "grid",
                "align-items",
                "justify-content",
                "z-index",
                "overflow",
                "opacity",
                "visibility",
                "text-align",
                "line-height",
                "letter-spacing",
                "background-color",
                "background-image",
                "background-position",
                "background-repeat",
                "background-size",
                "box-shadow",
                "text-shadow",
                "transition",
                "transform",
                "animation",
                "cursor",
                "content",
                "pointer-events",
                "border-radius",
                "outline",
                "box-sizing",
                "float",
                "clear",
                "white-space",
                "word-wrap",
                "word-break",
                "text-decoration",
                "text-transform",
                "vertical-align",
                "font-family",
                "font-style",
                "font-variant",
                "font-weight",
                "list-style",
                "list-style-type",
                "list-style-position",
                "list-style-image",
                "border-width",
                "border-style",
                "border-color",
                "background-attachment",
                "background-blend-mode",
                "background-clip",
                "background-origin",
                "background-size",
                "background-position-x",
                "background-position-y",
                "background-repeat-x",
                "background-repeat-y",
                "background-repeat",
                "flex-direction",
                "flex-wrap",
                "flex-flow",
                "flex-grow",
                "flex-shrink",
                "flex-basis",
                "align-content",
                "align-items",
                "align-self",
                "justify-items",
                "justify-content",
                "justify-self",
                "order",
            ]);
            if (!validProperties.has(propertyName)) {
                detectedProblems.push({
                    type: "Invalid Property",
                    severity: "warning",
                    message: `Unknown CSS property '${propertyName}'.`,
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

function detectCSSSemanticErrors(codeStr, detectedProblems) {
    const lines = codeStr.split(/\r?\n/);
    const selectors = new Set();
    const propertyUsage = {};
    const validProperties = new Set([
        "color",
        "background",
        "margin",
        "padding",
        "font-size",
        "font-weight",
        "display",
        "position",
        "top",
        "left",
        "right",
        "bottom",
        "width",
        "height",
        "border",
        "flex",
        "grid",
        "align-items",
        "justify-content",
        "z-index",
        "overflow",
        "opacity",
        "visibility",
        "text-align",
        "line-height",
        "letter-spacing",
        "background-color",
        "background-image",
        "background-position",
        "background-repeat",
        "background-size",
        "box-shadow",
        "text-shadow",
        "transition",
        "transform",
        "animation",
        "cursor",
        "content",
        "pointer-events",
        "border-radius",
        "outline",
        "box-sizing",
        "float",
        "clear",
        "white-space",
        "word-wrap",
        "word-break",
        "text-decoration",
        "text-transform",
        "vertical-align",
        "font-family",
        "font-style",
        "font-variant",
        "font-weight",
        "list-style",
        "list-style-type",
        "list-style-position",
        "list-style-image",
        "border-width",
        "border-style",
        "border-color",
        "background-attachment",
        "background-blend-mode",
        "background-clip",
        "background-origin",
        "background-size",
        "background-position-x",
        "background-position-y",
        "background-repeat-x",
        "background-repeat-y",
        "background-repeat",
        "flex-direction",
        "flex-wrap",
        "flex-flow",
        "flex-grow",
        "flex-shrink",
        "flex-basis",
        "align-content",
        "align-items",
        "align-self",
        "justify-items",
        "justify-content",
        "justify-self",
        "order",
    ]);

    lines.forEach((line, index) => {
        const trimmed = line.trim();

        const selectorMatch = trimmed.match(/^([.#]?[a-zA-Z0-9_-]+)\s*\{/);
        if (selectorMatch) {
            const selector = selectorMatch[1];
            selectors.add(selector);
            if (selectors.size > 100) {
                detectedProblems.push({
                    type: "Performance Concern",
                    severity: "info",
                    message: `High number of selectors (${selectors.size}). Consider optimizing your CSS.`,
                    line: index + 1,
                });
            }
        }

        const propertyMatch = trimmed.match(/^([a-zA-Z-]+)\s*:/);
        if (propertyMatch) {
            const propertyName = propertyMatch[1];
            propertyUsage[propertyName] = (propertyUsage[propertyName] || 0) + 1;

            if (!validProperties.has(propertyName)) {
                detectedProblems.push({
                    type: "Invalid Property",
                    severity: "warning",
                    message: `Unknown CSS property '${propertyName}'.`,
                    line: index + 1,
                });
            }
        }
    });

    Object.entries(propertyUsage).forEach(([property, count]) => {
        if (count > 50) {
            detectedProblems.push({
                type: "Performance Concern",
                severity: "info",
                message: `Property '${property}' is used ${count} times. Consider using CSS variables or classes.`,
                line: null,
            });
        }
    });
}

function detectHTMLSyntaxErrors(codeStr, detectedProblems) {
    const selfClosingTags = new Set([
        "img",
        "br",
        "hr",
        "meta",
        "link",
        "input",
        "area",
        "base",
        "col",
        "command",
        "embed",
        "keygen",
        "param",
        "source",
        "track",
        "wbr",
    ]);

    const openTags = [];
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
    let match;

    while ((match = tagRegex.exec(codeStr)) !== null) {
        const tag = match[1].toLowerCase();
        const isClosing = match[0].startsWith("</");
        const lineNumber = getLineNumber(codeStr, match.index);

        if (!isClosing) {
            if (!selfClosingTags.has(tag)) {
                openTags.push({ tag, line: lineNumber });
            }
        } else {
            const lastOpen = openTags.pop();
            if (!lastOpen || lastOpen.tag !== tag) {
                detectedProblems.push({
                    type: "Syntax Error",
                    severity: "error",
                    message: `Unexpected closing tag </${tag}>.`,
                    line: lineNumber,
                });
            }
        }
    }

    openTags.forEach((openTag) => {
        detectedProblems.push({
            type: "Syntax Error",
            severity: "error",
            message: `Tag <${openTag.tag}> is not closed.`,
            line: openTag.line,
        });
    });
}

function detectHTMLSemanticErrors(codeStr, detectedProblems) {
    const lines = codeStr.split(/\r?\n/);
    const requiredAttributes = {
        img: ["alt"],
        a: ["href"],
        input: ["type"],
        link: ["rel"],
        script: ["src"],
    };

    lines.forEach((line, index) => {
        const tagMatch = line.match(/<([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/);
        if (tagMatch) {
            const tag = tagMatch[1].toLowerCase();
            const attrs = tagMatch[2];
            if (requiredAttributes[tag]) {
                requiredAttributes[tag].forEach((attr) => {
                    const attrRegex = new RegExp(`${attr}=`);
                    if (!attrRegex.test(attrs)) {
                        detectedProblems.push({
                            type: "Missing Attribute",
                            severity: "warning",
                            message: `Tag <${tag}> is missing required attribute '${attr}'.`,
                            line: index + 1,
                        });
                    }
                });
            }
        }
    });

    const deprecatedTags = ["center", "font", "marquee"];
    lines.forEach((line, index) => {
        deprecatedTags.forEach((tag) => {
            const regex = new RegExp(`</?${tag}\\b`, "i");
            if (regex.test(line)) {
                detectedProblems.push({
                    type: "Deprecated Tag",
                    severity: "warning",
                    message: `Tag <${tag}> is deprecated.`,
                    line: index + 1,
                });
            }
        });
    });

    const imgTags = codeStr.match(/<img\b[^>]*>/gi);
    if (imgTags) {
        imgTags.forEach((imgTag) => {
            if (!/alt=/.test(imgTag)) {
                detectedProblems.push({
                    type: "Accessibility Issue",
                    severity: "warning",
                    message: `<img> tag is missing 'alt' attribute.`,
                    line: getLineNumber(codeStr, codeStr.indexOf(imgTag)),
                });
            }
        });
    }

    const headingTags = codeStr.match(/<h[1-6]\b[^>]*>/gi);
    if (headingTags) {
        headingTags.forEach((headingTag) => {
            if (/style=/.test(headingTag)) {
                detectedProblems.push({
                    type: "Inline Styling",
                    severity: "info",
                    message: `Inline styling detected in heading tags. Consider using CSS classes.`,
                    line: getLineNumber(codeStr, codeStr.indexOf(headingTag)),
                });
            }
        });
    }
}

function detectSQLSyntaxErrors(codeStr, detectedProblems) {
    const lines = codeStr.split(/\r?\n/);
    lines.forEach((line, index) => {
        const trimmed = line.trim().toUpperCase();
        if (
            trimmed === "" ||
            trimmed.startsWith("--") ||
            trimmed.startsWith("/*") ||
            trimmed.startsWith("*") ||
            trimmed.startsWith("*/")
        )
            return;

        if (
            !trimmed.endsWith(";") &&
            !trimmed.endsWith("{") &&
            !trimmed.endsWith("}") &&
            !trimmed.endsWith(":")
        ) {
            detectedProblems.push({
                type: "Missing Semicolon",
                severity: "warning",
                message: `Missing semicolon at end of SQL statement.`,
                line: index + 1,
            });
        }
    });
}

function detectSQLSemanticErrors(codeStr, detectedProblems) {
    const lines = codeStr.split(/\r?\n/);
    const tableNames = [];
    const columnUsage = {};

    lines.forEach((line, index) => {
        const createTableMatch = line.match(/CREATE\s+TABLE\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/i);
        if (createTableMatch) {
            tableNames.push(createTableMatch[1]);
        }

        const insertMatch = line.match(/INSERT\s+INTO\s+([a-zA-Z_][a-zA-Z0-9_]*)/i);
        if (insertMatch) {
            const table = insertMatch[1];
            columnUsage[table] = columnUsage[table] || {};
        }

        const selectMatch = line.match(/SELECT\s+(.+)\s+FROM\s+([a-zA-Z_][a-zA-Z0-9_]*)/i);
        if (selectMatch) {
            const columns = selectMatch[1].split(",").map((col) => col.trim());
            const table = selectMatch[2];
            columns.forEach((col) => {
                if (col !== "*") {
                    columnUsage[table] = columnUsage[table] || {};
                    columnUsage[table][col] = (columnUsage[table][col] || 0) + 1;
                }
            });
        }

        const updateMatch = line.match(/UPDATE\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+SET\s+(.+)\s+WHERE\s+(.+)/i);
        if (updateMatch) {
            const table = updateMatch[1];
            const assignments = updateMatch[2].split(",").map((assign) => assign.trim().split("=")[0].trim());
            assignments.forEach((assign) => {
                columnUsage[table] = columnUsage[table] || {};
                columnUsage[table][assign] = (columnUsage[table][assign] || 0) + 1;
            });
        }

        const deleteMatch = line.match(/DELETE\s+FROM\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+WHERE\s+(.+)/i);
        if (deleteMatch) {
            const table = deleteMatch[1];
            columnUsage[table] = columnUsage[table] || {};
        }
    });

    tableNames.forEach((table) => {
        const regex = new RegExp(`\\b${table}\\b`, "g");
        const occurrences = (codeStr.match(regex) || []).length;
        if (occurrences === 1) {
            detectedProblems.push({
                type: "Unused Table",
                severity: "info",
                message: `Table '${table}' is created but never used.`,
                line: null,
            });
        }
    });

    Object.entries(columnUsage).forEach(([table, columns]) => {
        Object.entries(columns).forEach(([column, count]) => {
            if (count === 1) {
                detectedProblems.push({
                    type: "Unused Column",
                    severity: "info",
                    message: `Column '${column}' in table '${table}' is used but never utilized elsewhere.`,
                    line: null,
                });
            }
        });
    });

    const foreignKeyRegex = /FOREIGN\s+KEY\s*\(([^)]+)\)\s+REFERENCES\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]+)\)/i;
    const foreignKeys = codeStr.match(foreignKeyRegex);
    if (foreignKeys) {
        foreignKeys.forEach((fk) => {
            detectedProblems.push({
                type: "Foreign Key Constraint",
                severity: "info",
                message: `Foreign key constraint detected: '${fk}'. Ensure it aligns with database design.`,
                line: getLineNumber(codeStr, codeStr.indexOf(fk)),
            });
        });
    }

    const indexRegex = /CREATE\s+INDEX\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+ON\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]+)\)/i;
    const indexes = codeStr.match(indexRegex);
    if (indexes) {
        indexes.forEach((indexDef) => {
            detectedProblems.push({
                type: "Index Definition",
                severity: "info",
                message: `Index defined: '${indexDef}'. Ensure it improves query performance.`,
                line: getLineNumber(codeStr, codeStr.indexOf(indexDef)),
            });
        });
    }
}

function detectRustSyntaxErrors(codeStr, detectedProblems) {
    const lines = codeStr.split(/\r?\n/);
    const multiLineOpeners = ["{", "(", "["];
    const multiLineClosers = ["}", ")", "]"];
    const structureStack = [];

    lines.forEach((line, index) => {
        const trimmed = line.trim();

        for (let char of line) {
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

        if (
            !trimmed.endsWith(";") &&
            !trimmed.endsWith("{") &&
            !trimmed.endsWith("}") &&
            !trimmed.endsWith(",") &&
            trimmed !== "" &&
            !trimmed.startsWith("//")
        ) {
            if (!/^(fn|let|if|else|for|while|match|return)\b/.test(trimmed)) {
                detectedProblems.push({
                    type: "Missing Semicolon",
                    severity: "warning",
                    message: `Missing semicolon at end of statement.`,
                    line: index + 1,
                });
            }
        }

        const varMatch = trimmed.match(/let\s+(mut\s+)?([a-zA-Z_][a-zA-Z0-9_]*)/);
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

function detectRustSemanticErrors(codeStr, detectedProblems) {
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

function detectSwiftSyntaxErrors(codeStr, detectedProblems) {
    const lines = codeStr.split(/\r?\n/);
    const multiLineOpeners = ["{", "(", "["];
    const multiLineClosers = ["}", ")", "]"];
    const structureStack = [];

    lines.forEach((line, index) => {
        const trimmed = line.trim();

        for (let char of line) {
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

        if (
            !trimmed.endsWith(";") &&
            !trimmed.endsWith("{") &&
            !trimmed.endsWith("}") &&
            !trimmed.endsWith(":") &&
            trimmed !== "" &&
            !trimmed.startsWith("//")
        ) {
            detectedProblems.push({
                type: "Missing Semicolon",
                severity: "warning",
                message: `Missing semicolon at the end of the statement.`,
                line: index + 1,
            });
        }

        const varMatch = trimmed.match(/var\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*[:=]/);
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

function detectSwiftSemanticErrors(codeStr, detectedProblems) {
    const lines = codeStr.split(/\r?\n/);
    const declaredVariables = [];
    const usedVariables = new Set();

    lines.forEach((line, index) => {
        const varMatch = line.match(/var\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*[:=]/);
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

        if (/guard\s+/.test(line)) {
            detectedProblems.push({
                type: "Guard Statement",
                severity: "info",
                message: `Guard statement detected. Ensure it's used correctly to handle conditions.`,
                line: index + 1,
            });
        }

        const optionalMatch = line.match(/\?\./g);
        if (optionalMatch) {
            optionalMatch.forEach(() => {
                detectedProblems.push({
                    type: "Optional Chaining",
                    severity: "info",
                    message: `Optional chaining detected. Ensure it's used appropriately.`,
                    line: index + 1,
                });
            });
        }

        if (/let\s+\w+\s*=\s*\w+\s*!/.test(line)) {
            detectedProblems.push({
                type: "Force Unwrapping",
                severity: "warning",
                message: `Force unwrapping '!' detected. Consider using safe unwrapping techniques.`,
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

    const redundantIfs = codeStr.match(/if\s*\(.+\)\s*{\s*return\s+.*;\s*}/g);
    if (redundantIfs) {
        redundantIfs.forEach((stmt) => {
            detectedProblems.push({
                type: "Redundant If Statement",
                severity: "info",
                message: `Redundant if statement detected. Consider returning the condition directly.`,
                line: getLineNumber(codeStr, codeStr.indexOf(stmt)),
            });
        });
    }
}

function detectMonkeyCSyntaxErrors(codeStr, detectedProblems) {
    const lines = codeStr.split(/\r?\n/);
    const multiLineOpeners = ["{", "(", "["];
    const multiLineClosers = ["}", ")", "]"];
    const structureStack = [];

    lines.forEach((line, index) => {
        const trimmed = line.trim();

        for (let char of line) {
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

        if (
            !trimmed.endsWith(";") &&
            !trimmed.endsWith("{") &&
            !trimmed.endsWith("}") &&
            !trimmed.endsWith(":") &&
            trimmed !== "" &&
            !trimmed.startsWith("//")
        ) {
            detectedProblems.push({
                type: "Missing Semicolon",
                severity: "warning",
                message: `Missing semicolon at the end of the statement.`,
                line: index + 1,
            });
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

function detectMonkeyCSemanticErrors(codeStr, detectedProblems) {
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

function detectAssemblySyntaxErrors(codeStr, detectedProblems) {
    const lines = codeStr.split(/\r?\n/);
    const validOpcodes = new Set([
        "MOV",
        "ADD",
        "SUB",
        "MUL",
        "DIV",
        "JMP",
        "CMP",
        "JE",
        "JNE",
        "CALL",
        "RET",
        "PUSH",
        "POP",
        "AND",
        "OR",
        "XOR",
        "NOT",
        "SHL",
        "SHR",
        "NOP",
    ]);
    const labelRegex = /^[a-zA-Z_][a-zA-Z0-9_]*:/;
    const opcodeRegex = /^([A-Z]+)\b/;

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (trimmed === "" || trimmed.startsWith(";")) return;

        if (labelRegex.test(trimmed)) return;

        const opcodeMatch = trimmed.match(opcodeRegex);
        if (opcodeMatch) {
            const opcode = opcodeMatch[1];
            if (!validOpcodes.has(opcode)) {
                detectedProblems.push({
                    type: "Invalid Opcode",
                    severity: "warning",
                    message: `Unknown opcode '${opcode}'.`,
                    line: index + 1,
                });
            }
        } else {
            detectedProblems.push({
                type: "Syntax Error",
                severity: "error",
                message: `Invalid assembly instruction.`,
                line: index + 1,
            });
        }
    });
}

function detectAssemblySemanticErrors(codeStr, detectedProblems) {
    const lines = codeStr.split(/\r?\n/);
    const labels = [];
    const usedLabels = new Set();

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (trimmed === "" || trimmed.startsWith(";")) return;

        const labelMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*):/);
        if (labelMatch) {
            labels.push({ name: labelMatch[1], line: index + 1 });
        }

        const jumpMatch = trimmed.match(/(?:JMP|JE|JNE)\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
        if (jumpMatch) {
            usedLabels.add(jumpMatch[1]);
        }
    });

    labels.forEach((label) => {
        if (!usedLabels.has(label.name)) {
            detectedProblems.push({
                type: "Unused Label",
                severity: "info",
                message: `Label '${label.name}' is defined but never used.`,
                line: label.line,
            });
        }
    });

    usedLabels.forEach((label) => {
        if (!labels.find((lbl) => lbl.name === label)) {
            detectedProblems.push({
                type: "Undefined Label",
                severity: "error",
                message: `Label '${label}' is used but not defined.`,
                line: null,
            });
        }
    });
}

function detectAssemblyBestPractices(codeStr, detectedProblems) {
    const lines = codeStr.split(/\r?\n/);
    const commentRegex = /^;/;
    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (commentRegex.test(trimmed)) return;
        if (trimmed.startsWith("MOV AX, 0")) {
            detectedProblems.push({
                type: "Best Practice",
                severity: "info",
                message: `Initializing AX to 0 directly.`,
                line: index + 1,
            });
        }
    });
}

const DinoLabsIDEDebug = ({ code, language }) => {
    const [problems, setProblems] = useState([]);
    const [performanceMetrics, setPerformanceMetrics] = useState({ time: 0 });
    const [filter, setFilter] = useState({ severity: "all" });

    useEffect(() => {
        const startTime = performance.now();
        const identifiedProblems = [];

        const lang = language.toLowerCase();
        if (detectionFunctions[lang]) {
            const { syntax, semantic, bestPractice } = detectionFunctions[lang];
            if (syntax) syntax(code, identifiedProblems);
            if (semantic) semantic(code, identifiedProblems);
            if (bestPractice) bestPractice(code, identifiedProblems);
        } else {
            identifiedProblems.push({
                type: "Unsupported Language",
                severity: "warning",
                message: `Syntax checking not supported for ${language}.`,
                line: null,
            });
        }

        const endTime = performance.now();
        setPerformanceMetrics({ time: (endTime - startTime).toFixed(2) });

        const uniqueProblems = removeDuplicateProblems(identifiedProblems);
        setProblems(uniqueProblems);
    }, [code, language]);

    const renderProblemIcon = (severity) => {
        switch (severity) {
            case "error":
                return icons.error;
            case "warning":
                return icons.warning;
            case "info":
                return icons.info;
            default:
                return icons.bug;
        }
    };

    const filteredProblems = problems.filter((problem) => {
        const severityMatch =
            filter.severity === "all" || problem.severity === filter.severity;
        return severityMatch;
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter((prev) => ({ ...prev, [name]: value }));
    };

    const exportProblems = () => {
        const dataStr = JSON.stringify(problems, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "linting-report.json";
        link.click();
    };

    return (
        <div className="dinolabsIDEDebugContainer">
            <div className="dinolabsIDELinterNavBar">
                <div className="dinolabsIDEDebugHeader">
                <label className="dinolabsIDELinterTitle"> 
                        Dino Lint
                    </label>
                    <label className="dinolabsIDELinterPerformanceMetrics">
                        <strong>Linting Time:</strong> {performanceMetrics.time} <strong>ms</strong>
                    </label>
                </div>

                <div className="dinolabsIDEDebugControls">
                    <div className="dinolabsIDEDebugControlsFiltering">

                        <label className="dinolabsIDELinterSelection">
                            <Tippy content="Filter by Severity" theme="tooltip-light">
                                <select
                                    name="severity"
                                    value={filter.severity}
                                    onChange={handleFilterChange}
                                >
                                    <option value="all">All</option>
                                    <option value="error">Error</option>
                                    <option value="warning">Warning</option>
                                    <option value="info">Info</option>
                                </select>  
                            </Tippy> 
                        </label>
                        
                        <Tippy content="Export Lint Report" theme="tooltip-light">
                            <button className="dinolabsIDELintingExport" onClick={exportProblems}>
                                <FontAwesomeIcon icon={faFileExport}/>
                            </button>
                        </Tippy>
                       
                    </div>

                    
                </div>
            </div>

            
            {filteredProblems.length > 0 ? (
                <div className="dinolabsIDEDebugProblems">
                    {filteredProblems.map((problem, index) => (
                        <div
                            key={index}
                            className={`dinolabsIDEDebugProblem ${problem.severity}`}
                        >
                            {renderProblemIcon(problem.severity)}
                            <div className="dinolabsIDEDebugProblemText">

                                <div className="dinolabsIDEDebugProblemLeading">
                                    <strong>{problem.type}:</strong>
                                    <span>{problem.message}</span>
                                </div>

                                <div className="dinolabsIDEDebugProblemTrailing">
                                    {problem.line && (
                                        <strong> (Line: {problem.line})</strong>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <label className="dinolabsIDEDebugNoProblems">
                    No problems detected.
                </label>
            )}
        </div>
    );
};

export default DinoLabsIDEDebug;
