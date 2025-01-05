import { getLineNumber } from "../DinoLabsIDELintUtils";

/**
* @param {string} codeStr 
* @param {Array} detectedProblems
*/
export function detectSQLSyntaxErrors(codeStr, detectedProblems) {
    const lines = codeStr.split(/\r?\n/);
    let inMultiLineComment = false;
    let statementBuffer = '';
    let statementStartLine = 0;

    lines.forEach((line, index) => {
        let currentLine = line;
        let lineNumber = index + 1;

        if (inMultiLineComment) {
            const endCommentIndex = currentLine.indexOf("*/");
            if (endCommentIndex !== -1) {
                currentLine = currentLine.substring(endCommentIndex + 2);
                inMultiLineComment = false;
            } else {
                return;
            }
        }

        while (currentLine.length > 0) {
            const startCommentIndex = currentLine.indexOf("/*");
            const singleCommentIndex = currentLine.indexOf("--");

            if (startCommentIndex !== -1 && (singleCommentIndex === -1 || startCommentIndex < singleCommentIndex)) {
                const endCommentIndex = currentLine.indexOf("*/", startCommentIndex + 2);
                if (endCommentIndex !== -1) {
                    currentLine = currentLine.substring(0, startCommentIndex) + " " + currentLine.substring(endCommentIndex + 2);
                } else {
                    currentLine = currentLine.substring(0, startCommentIndex);
                    inMultiLineComment = true;
                    break;
                }
            } else if (singleCommentIndex !== -1) {
                currentLine = currentLine.substring(0, singleCommentIndex);
                break;
            } else {
                break;
            }
        }

        const trimmed = currentLine.trim();

        if (trimmed === "") {
            return;
        }

        if (!inMultiLineComment) {
            if (!statementBuffer) {
                statementStartLine = lineNumber;
            }

            statementBuffer += trimmed + ' ';

            if (trimmed.endsWith(";")) {
                statementBuffer = '';
            }
        }
    });

    if (statementBuffer && !statementBuffer.trim().endsWith(";")) {
        const lastLineIndex = lines.length - 1;
        detectedProblems.push({
            type: "Missing Semicolon",
            severity: "warning",
            message: `Missing semicolon at end of SQL statement.`,
            line: lastLineIndex + 1,
        });
    }
}

/**
* @param {string} codeStr 
* @param {Array} detectedProblems 
*/
export function detectSQLSemanticErrors(codeStr, detectedProblems) {
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

    const foreignKeyRegex = /FOREIGN\s+KEY\s*\(([^)]+)\)\s+REFERENCES\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]+)\)/gi;
    let foreignKeys;
    while ((foreignKeys = foreignKeyRegex.exec(codeStr)) !== null) {
        detectedProblems.push({
            type: "Foreign Key Constraint",
            severity: "info",
            message: `Foreign key constraint detected: '${foreignKeys[0]}'. Ensure it aligns with database design.`,
            line: getLineNumber(codeStr, foreignKeys.index),
        });
    }

    const indexRegex = /CREATE\s+INDEX\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+ON\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]+)\)/gi;
    let indexes;
    while ((indexes = indexRegex.exec(codeStr)) !== null) {
        detectedProblems.push({
            type: "Index Definition",
            severity: "info",
            message: `Index defined: '${indexes[0]}'. Ensure it improves query performance.`,
            line: getLineNumber(codeStr, indexes.index),
        });
    }
}
