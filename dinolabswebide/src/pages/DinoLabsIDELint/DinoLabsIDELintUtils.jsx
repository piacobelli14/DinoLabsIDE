export const getLineNumber = (codeStr, index) => {
    return codeStr.slice(0, index).split(/\r?\n/).length;
};

export const removeDuplicateProblems = (problems) => {
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
