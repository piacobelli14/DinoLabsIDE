import { getLineNumber } from "../DinoLabsIDELintUtils";

/**
* @param {string} codeStr 
* @param {Array} detectedProblems
*/
export function detectXMLSyntaxErrors(codeStr, detectedProblems) {
    const lines = codeStr.split(/\r?\n/);
    const tagStack = [];
    const selfClosingTags = ["br", "img", "hr", "meta", "input", "link"]; 
    const openingTagRegex = /^<([A-Za-z_][\w\-.]*)\b([^>]*)>/;
    const closingTagRegex = /^<\/([A-Za-z_][\w\-.]*)>/;
    const selfClosingTagRegex = /^<([A-Za-z_][\w\-.]*)\b([^>]*)\/>/;

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (trimmed === "") return;
        let match;

        if ((match = trimmed.match(selfClosingTagRegex))) {
            const tagName = match[1];
            const attributesString = match[2];
            const attributes = parseAttributes(attributesString);
            const duplicates = findDuplicateAttributes(attributes);
            if (duplicates.length > 0) {
                detectedProblems.push({
                    type: "Duplicate Attributes",
                    severity: "error",
                    message: `Duplicate attribute(s) [${duplicates.join(", ")}] found in self-closing tag <${tagName} />.`,
                    line: index + 1,
                });
            }
            return;
        }

        if ((match = trimmed.match(closingTagRegex))) {
            const tagName = match[1];
            if (tagStack.length === 0) {
                detectedProblems.push({
                    type: "Unmatched Closing Tag",
                    severity: "error",
                    message: `Closing tag </${tagName}> found without a corresponding opening tag.`,
                    line: index + 1,
                });
            } else {
                const lastTag = tagStack.pop();
                if (lastTag !== tagName) {
                    detectedProblems.push({
                        type: "Mismatched Closing Tag",
                        severity: "error",
                        message: `Closing tag </${tagName}> does not match the opening tag <${lastTag}>.`,
                        line: index + 1,
                    });
                }
            }
            return;
        }

        if ((match = trimmed.match(openingTagRegex))) {
            const tagName = match[1];
            if (!isValidTagName(tagName)) {
                detectedProblems.push({
                    type: "Invalid Tag Name",
                    severity: "error",
                    message: `Invalid tag name <${tagName}>.`,
                    line: index + 1,
                });
            }

            if (selfClosingTags.includes(tagName)) {
                if (!trimmed.endsWith("/>")) {
                    detectedProblems.push({
                        type: "Self-Closing Tag Not Properly Closed",
                        severity: "error",
                        message: `Tag <${tagName}> is self-closing and should end with '/>'.`,
                        line: index + 1,
                    });
                }
            } else {
                tagStack.push(tagName);
            }

            const attributesString = match[2];
            const attributes = parseAttributes(attributesString);
            const duplicates = findDuplicateAttributes(attributes);
            if (duplicates.length > 0) {
                detectedProblems.push({
                    type: "Duplicate Attributes",
                    severity: "error",
                    message: `Duplicate attribute(s) [${duplicates.join(", ")}] found in tag <${tagName}>.`,
                    line: index + 1,
                });
            }
            return;
        }

        if (trimmed.startsWith("<") && !trimmed.startsWith("<!--")) {
            detectedProblems.push({
                type: "Malformed Tag",
                severity: "error",
                message: `Malformed tag detected.`,
                line: index + 1,
            });
        }
    });

    while (tagStack.length > 0) {
        const unclosedTag = tagStack.pop();
        detectedProblems.push({
            type: "Unclosed Tag",
            severity: "error",
            message: `Tag <${unclosedTag}> was not closed.`,
            line: getLineNumber(codeStr, unclosedTag),
        });
    }
}

/**
* @param {string} attributesString
* @returns {Array} 
*/
function parseAttributes(attributesString) {
    const attrRegex = /([A-Za-z_][\w\-.]*)\s*=\s*"[^"]*"|'[^']*'/g;
    const attributes = [];
    let match;
    while ((match = attrRegex.exec(attributesString)) !== null) {
        attributes.push(match[1]);
    }
    return attributes;
}

/**
* @param {Array} attributes
* @returns {Array} 
*/
function findDuplicateAttributes(attributes) {
    const seen = new Set();
    const duplicates = new Set();
    attributes.forEach(attr => {
        if (seen.has(attr)) {
            duplicates.add(attr);
        } else {
            seen.add(attr);
        }
    });
    return Array.from(duplicates);
}

/**
* @param {string} tagName 
* @returns {boolean} 
*/
function isValidTagName(tagName) {
    const tagNameRegex = /^[A-Za-z_][\w\-.]*$/;
    return tagNameRegex.test(tagName);
}

/**
* @param {string} codeStr 
* @param {Array} detectedProblems 
*/
export function detectXMLSemanticErrors(codeStr, detectedProblems) {
    const lines = codeStr.split(/\r?\n/);
    const definedEntities = {};
    const usedEntities = new Set();
    const requiredAttributes = {
        "img": ["src", "alt"],
        "a": ["href"],
        "link": ["rel", "href"],
    };
    const deprecatedTags = ["font", "center", "marquee"];

    lines.forEach((line, index) => {
        const trimmed = line.trim();

        if (trimmed === "" || trimmed.startsWith("<!--")) return;

        const deprecatedTagMatch = trimmed.match(/^<\s*([A-Za-z_][\w\-.]*)\b/);
        if (deprecatedTagMatch) {
            const tagName = deprecatedTagMatch[1];
            if (deprecatedTags.includes(tagName.toLowerCase())) {
                detectedProblems.push({
                    type: "Deprecated Tag",
                    severity: "warning",
                    message: `Tag <${tagName}> is deprecated.`,
                    line: index + 1,
                });
            }
        }

        const entityRegex = /&([A-Za-z0-9#]+);/g;
        let entityMatch;
        while ((entityMatch = entityRegex.exec(line)) !== null) {
            const entityName = entityMatch[1];
            if (!isPredefinedEntity(entityName) && !definedEntities[entityName]) {
                usedEntities.add(entityName);
            }
        }

        const openingTagMatch = trimmed.match(/^<([A-Za-z_][\w\-.]*)\b([^>]*)>/);
        if (openingTagMatch) {
            const tagName = openingTagMatch[1];
            const attributesString = openingTagMatch[2];
            if (requiredAttributes[tagName]) {
                const attributes = parseAttributes(attributesString);
                requiredAttributes[tagName].forEach(reqAttr => {
                    if (!attributes.includes(reqAttr)) {
                        detectedProblems.push({
                            type: "Missing Required Attribute",
                            severity: "error",
                            message: `Tag <${tagName}> is missing required attribute '${reqAttr}'.`,
                            line: index + 1,
                        });
                    }
                });
            }
        }
    });

    usedEntities.forEach(entity => {
        detectedProblems.push({
            type: "Undefined Entity",
            severity: "error",
            message: `Entity &${entity}; is undefined.`,
            line: getLineNumber(codeStr, `&${entity};`),
        });
    });
}

/**
* @param {string} entityName 
* @returns {boolean}
*/
function isPredefinedEntity(entityName) {
    const predefinedEntities = ["lt", "gt", "amp", "apos", "quot"];
    if (entityName.startsWith("#")) {
        return true;
    }
    return predefinedEntities.includes(entityName);
}
