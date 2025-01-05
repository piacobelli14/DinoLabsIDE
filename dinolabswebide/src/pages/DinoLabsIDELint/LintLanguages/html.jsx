import { getLineNumber } from "../DinoLabsIDELintUtils";

/**
* @param {string} codeStr 
* @param {Array} detectedProblems 
*/
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

    const nestingRules = {
        "ul": ["li"],
        "ol": ["li"],
        "li": ["ul", "ol", "p", "div", "span", "a", "img"],
        "table": ["thead", "tbody", "tfoot", "tr", "caption"],
        "thead": ["tr"],
        "tbody": ["tr"],
        "tfoot": ["tr"],
        "tr": ["th", "td"],
        "select": ["option", "optgroup"],
        "optgroup": ["option"],
        "dl": ["dt", "dd"],
        "dt": ["span", "a"],
        "dd": ["span", "a"],
        "p": ["span", "a", "img", "strong", "em"],
    };

    const openTags = [];
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g;
    let match;

    while ((match = tagRegex.exec(codeStr)) !== null) {
        const fullTag = match[0];
        const tag = match[1].toLowerCase();
        const isClosing = fullTag.startsWith("</");
        const tagStartIndex = match.index;
        const beforeTag = codeStr.substring(0, tagStartIndex);
        const commentStart = beforeTag.lastIndexOf("<!--");
        const commentEnd = beforeTag.lastIndexOf("-->");

        if (commentStart > commentEnd) {
            continue;
        }

        const lineNumber = getLineNumber(codeStr, tagStartIndex);

        if (!isClosing) {
            if (!selfClosingTags.has(tag)) {
                if (openTags.length > 0) {
                    const parentTag = openTags[openTags.length - 1].tag;
                    if (nestingRules[parentTag]) {
                        const allowedChildren = nestingRules[parentTag];
                        if (!allowedChildren.includes(tag)) {
                            detectedProblems.push({
                                type: "Invalid Nesting",
                                severity: "error",
                                message: `Tag <${tag}> cannot be nested inside <${parentTag}>.`,
                                line: lineNumber,
                            });
                        }
                    }
                }

                openTags.push({ tag, line: lineNumber });
            }
        } else {
            const lastOpen = openTags.pop();
            if (!lastOpen) {
                detectedProblems.push({
                    type: "Syntax Error",
                    severity: "error",
                    message: `Unexpected closing tag </${tag}>.`,
                    line: lineNumber,
                });
            } else if (lastOpen.tag !== tag) {
                detectedProblems.push({
                    type: "Syntax Error",
                    severity: "error",
                    message: `Mismatched closing tag </${tag}>. Expected </${lastOpen.tag}>.`,
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

/**
* @param {string} codeStr 
* @param {Array} detectedProblems 
*/
export function detectHTMLSemanticErrors(codeStr, detectedProblems) {
    const lines = codeStr.split(/\r?\n/);
    const requiredAttributes = {
        img: ["alt"],
        a: ["href"],
        input: ["type"],
        link: ["rel"],
        script: ["src"],
    };

    const nestingRules = {
        "ul": ["li"],
        "ol": ["li"],
        "li": ["ul", "ol", "p", "div", "span", "a", "img"],
        "table": ["thead", "tbody", "tfoot", "tr", "caption"],
        "thead": ["tr"],
        "tbody": ["tr"],
        "tfoot": ["tr"],
        "tr": ["th", "td"],
        "select": ["option", "optgroup"],
        "optgroup": ["option"],
        "dl": ["dt", "dd"],
        "dt": ["span", "a"],
        "dd": ["span", "a"],
        "p": ["span", "a", "img", "strong", "em"],
    };

    const openTags = [];
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g;
    let match;

    const commentRanges = [];
    const commentStartRegex = /<!--/g;
    const commentEndRegex = /-->/g;
    let commentStartMatch, commentEndMatch;
    while ((commentStartMatch = commentStartRegex.exec(codeStr)) !== null) {
        const start = commentStartMatch.index;
        commentEndMatch = commentEndRegex.exec(codeStr.substring(commentStartMatch.index));
        if (commentEndMatch) {
            const end = commentStartMatch.index + commentEndMatch.index + 3; 
            commentRanges.push([start, end]);
        } else {
            // Comment does not close
            commentRanges.push([start, codeStr.length]);
            break;
        }
    }

    /**
    * @param {number} index 
    * @returns {boolean} 
    */
    function isInsideComment(index) {
        for (const range of commentRanges) {
            if (index >= range[0] && index < range[1]) {
                return true;
            }
        }
        return false;
    }

    while ((match = tagRegex.exec(codeStr)) !== null) {
        const fullTag = match[0];
        const tag = match[1].toLowerCase();
        const isClosing = fullTag.startsWith("</");
        const tagStartIndex = match.index;

        if (isInsideComment(tagStartIndex)) {
            continue;
        }

        const lineNumber = getLineNumber(codeStr, tagStartIndex);

        if (!isClosing) {
            if (requiredAttributes[tag]) {
                const attrs = match[2];
                requiredAttributes[tag].forEach((attr) => {
                    const attrRegex = new RegExp(`${attr}=`, "i");
                    if (!attrRegex.test(attrs)) {
                        detectedProblems.push({
                            type: "Missing Attribute",
                            severity: "warning",
                            message: `Tag <${tag}> is missing required attribute '${attr}'.`,
                            line: lineNumber,
                        });
                    }
                });
            }

            if (openTags.length > 0) {
                const parentTag = openTags[openTags.length - 1].tag;
                if (nestingRules[parentTag]) {
                    const allowedChildren = nestingRules[parentTag];
                    if (!allowedChildren.includes(tag)) {
                        detectedProblems.push({
                            type: "Invalid Nesting",
                            severity: "error",
                            message: `Tag <${tag}> cannot be nested inside <${parentTag}>.`,
                            line: lineNumber,
                        });
                    }
                }
            }

            openTags.push({ tag, line: lineNumber });
        } else {
            const lastOpen = openTags.pop();
            if (!lastOpen) {
                detectedProblems.push({
                    type: "Syntax Error",
                    severity: "error",
                    message: `Unexpected closing tag </${tag}>.`,
                    line: lineNumber,
                });
            } else if (lastOpen.tag !== tag) {
                detectedProblems.push({
                    type: "Syntax Error",
                    severity: "error",
                    message: `Mismatched closing tag </${tag}>. Expected </${lastOpen.tag}>.`,
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

    lines.forEach((line, index) => {
        const lineNumber = index + 1;
        const commentStart = line.indexOf("<!--");
        const commentEnd = line.indexOf("-->");

        let codeLine = line;
        if (commentStart !== -1) {
            if (commentEnd !== -1 && commentEnd > commentStart) {
                codeLine = line.substring(0, commentStart) + line.substring(commentEnd + 3);
            } else {
                codeLine = line.substring(0, commentStart);
            }
        }

        const tagMatch = codeLine.match(/<([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/);
        if (tagMatch) {
            const tag = tagMatch[1].toLowerCase();
            const attrs = tagMatch[2];
            if (requiredAttributes[tag]) {
                requiredAttributes[tag].forEach((attr) => {
                    const attrRegex = new RegExp(`${attr}=`, "i");
                    if (!attrRegex.test(attrs)) {
                        detectedProblems.push({
                            type: "Missing Attribute",
                            severity: "warning",
                            message: `Tag <${tag}> is missing required attribute '${attr}'.`,
                            line: lineNumber,
                        });
                    }
                });
            }
        }
    });

    const deprecatedTags = ["center", "font", "marquee"];
    lines.forEach((line, index) => {
        const lineNumber = index + 1;
        const commentStart = line.indexOf("<!--");
        const commentEnd = line.indexOf("-->");

        let codeLine = line;
        if (commentStart !== -1) {
            if (commentEnd !== -1 && commentEnd > commentStart) {
                codeLine = line.substring(0, commentStart) + line.substring(commentEnd + 3);
            } else {
                codeLine = line.substring(0, commentStart);
            }
        }

        deprecatedTags.forEach((tag) => {
            const regex = new RegExp(`</?${tag}\\b`, "i");
            if (regex.test(codeLine)) {
                detectedProblems.push({
                    type: "Deprecated Tag",
                    severity: "warning",
                    message: `Tag <${tag}> is deprecated.`,
                    line: lineNumber,
                });
            }
        });
    });

    const imgTags = codeStr.match(/<img\b[^>]*>/gi);
    if (imgTags) {
        imgTags.forEach((imgTag) => {
            const tagIndex = codeStr.indexOf(imgTag);
            const beforeTag = codeStr.substring(0, tagIndex);
            const commentStart = beforeTag.lastIndexOf("<!--");
            const commentEnd = beforeTag.lastIndexOf("-->");

            if (commentStart > commentEnd) {
                return;
            }

            if (!/alt\s*=/.test(imgTag)) {
                detectedProblems.push({
                    type: "Accessibility Issue",
                    severity: "warning",
                    message: `<img> tag is missing 'alt' attribute.`,
                    line: getLineNumber(codeStr, tagIndex),
                });
            }
        });
    }

    const headingTags = codeStr.match(/<h[1-6]\b[^>]*>/gi);
    if (headingTags) {
        headingTags.forEach((headingTag) => {
            const tagIndex = codeStr.indexOf(headingTag);
            const beforeTag = codeStr.substring(0, tagIndex);
            const commentStart = beforeTag.lastIndexOf("<!--");
            const commentEnd = beforeTag.lastIndexOf("-->");

            if (commentStart > commentEnd) {
                return;
            }

            if (/style\s*=/.test(headingTag)) {
                detectedProblems.push({
                    type: "Inline Styling",
                    severity: "info",
                    message: `Inline styling detected in heading tags. Consider using CSS classes.`,
                    line: getLineNumber(codeStr, tagIndex),
                });
            }
        });
    }
}
