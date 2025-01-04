import { detectJavaScriptSyntaxErrors, detectJavaScriptSemanticErrors } from "./LintLanguages/javascript.jsx";
import { detectPythonSyntaxErrors, detectPythonSemanticErrors } from "./LintLanguages/python.jsx";
import { detectCSyntaxErrors, detectCSemanticErrors } from "./LintLanguages//c.jsx";
import { detectCSyntaxErrors as detectCppSyntaxErrors, detectCSemanticErrors as detectCppSemanticErrors } from "./LintLanguages/c++.jsx";
import { detectCSyntaxErrors as detectCSharpSyntaxErrors, detectCSemanticErrors as detectCSharpSemanticErrors } from "./LintLanguages/c#.jsx";
import { detectPHPSyntaxErrors, detectPHPSemanticErrors } from "./LintLanguages/php.jsx";
import { detectBashSyntaxErrors } from "./LintLanguages/bash.jsx";
import { detectBashSyntaxErrors as detectShellSyntaxErrors } from "./LintLanguages/shell.jsx";
import { detectCSSSyntaxErrors, detectCSSSemanticErrors } from "./LintLanguages/css.jsx";
import { detectHTMLSyntaxErrors, detectHTMLSemanticErrors } from "./LintLanguages/html.jsx";
import { detectSQLSyntaxErrors, detectSQLSemanticErrors } from "./LintLanguages/sql.jsx";
import { detectRustSyntaxErrors, detectRustSemanticErrors } from "./LintLanguages/rust.jsx";
import { detectSwiftSyntaxErrors, detectSwiftSemanticErrors } from "./LintLanguages/swift.jsx";
import { detectMonkeyCSyntaxErrors, detectMonkeyCSemanticErrors } from "./LintLanguages/monkey-c.jsx";
import { detectAssemblySyntaxErrors, detectAssemblySemanticErrors, detectAssemblyBestPractices } from "./LintLanguages/assembly.jsx";

export const detectionFunctions = {
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
        syntax: detectCppSyntaxErrors,
        semantic: detectCppSemanticErrors,
    },
    "c#": {
        syntax: detectCSharpSyntaxErrors,
        semantic: detectCSharpSemanticErrors,
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
        syntax: detectShellSyntaxErrors,
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
