import { getLineNumber } from "../DinoLabsIDELintUtils";

export function detectHTMLSyntaxErrors(codeStr, detectedProblems) {
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

export function detectHTMLSemanticErrors(codeStr, detectedProblems) {
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
