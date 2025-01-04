import { getLineNumber } from "../DinoLabsIDELintUtils";

export function detectSQLSyntaxErrors(codeStr, detectedProblems) {
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
