import { getLineNumber } from "../DinoLabsIDELintUtils";

export function detectCSSSyntaxErrors(codeStr, detectedProblems) {
    const lines = codeStr.split(/\r?\n/);
    const multiLineOpeners = ["{", "("];
    const multiLineClosers = ["}", ")"];
    const structureStack = [];
    let inComment = false;

    lines.forEach((line, index) => {
        let i = 0;
        while (i < line.length) {
            const char = line[i];
            const nextChar = i < line.length - 1 ? line[i + 1] : null;

            if (inComment) {
                if (char === '*' && nextChar === '/') {
                    inComment = false;
                    i += 2;
                    continue;
                }
                i++;
                continue;
            }

            if (char === '/' && nextChar === '*') {
                inComment = true;
                i += 2;
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

        const trimmed = line.trim();

        const exclusionPatterns = [
            /^@media\s+/, /^@import\s+/, /^@font-face\s+/, /^@keyframes\s+/, /^@supports\s+/, /^@namespace\s+/
        ];

        const isExempt = exclusionPatterns.some((pattern) => pattern.test(trimmed));

        if (
            !inComment &&
            !isExempt &&
            trimmed !== "" &&
            !trimmed.startsWith("/*") &&
            !trimmed.startsWith("*") &&
            !trimmed.startsWith("*/") &&
            !trimmed.startsWith("//") &&
            !trimmed.endsWith("{") &&
            !trimmed.endsWith("}") &&
            !trimmed.endsWith(":")
        ) {
            const lineWithoutComments = trimmed.split('/*')[0].split('//')[0].trim();
            if (!lineWithoutComments.endsWith(";")) {
                detectedProblems.push({
                    type: "Missing Semicolon",
                    severity: "warning",
                    message: `Missing semicolon at end of declaration.`,
                    line: index + 1,
                });
            }
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
                "flex-direction",
                "flex-wrap",
                "flex-flow",
                "flex-grow",
                "flex-shrink",
                "flex-basis",
                "align-content",
                "align-self",
                "justify-items",
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

export function detectCSSSemanticErrors(codeStr, detectedProblems) {
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
        "flex-direction",
        "flex-wrap",
        "flex-flow",
        "flex-grow",
        "flex-shrink",
        "flex-basis",
        "align-content",
        "align-self",
        "justify-items",
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
