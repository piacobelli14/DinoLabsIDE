import { getLineNumber } from "../DinoLabsIDELintUtils";

export function detectAssemblySyntaxErrors(codeStr, detectedProblems) {
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

export function detectAssemblySemanticErrors(codeStr, detectedProblems) {
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

export function detectAssemblyBestPractices(codeStr, detectedProblems) {
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
