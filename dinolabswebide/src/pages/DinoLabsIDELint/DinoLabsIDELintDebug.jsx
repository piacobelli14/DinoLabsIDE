import React, { useEffect, useState } from "react";
import Tippy from "@tippyjs/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faExclamationTriangle, faInfoCircle, faCheckCircle, faBug, faFilter, faDownload, faSearch, faFileExport, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import "../../styles/mainStyles/DinoLabsIDEDebug.css";
import icons from "./DinoLabsIDELintIcons";
import { getLineNumber, removeDuplicateProblems } from "./DinoLabsIDELintUtils";
import { detectionFunctions } from "./DinoLabsIDELintDetectionFunctions";

const DinoLabsIDEDebug = ({ code, language, onProblemClick, onProblemsDetected }) => {
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
                filePath: null, 
            });
        }

        const endTime = performance.now();
        setPerformanceMetrics({ time: (endTime - startTime).toFixed(2) });

        const uniqueProblems = removeDuplicateProblems(identifiedProblems);
        setProblems(uniqueProblems);

        if (onProblemsDetected && typeof onProblemsDetected === 'function') {
            onProblemsDetected(uniqueProblems);
        }
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

    const handleProblemItemClick = (problem) => {
        if (onProblemClick && typeof onProblemClick === 'function') {
            onProblemClick(problem.filePath, problem.line);
        }
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
                            onClick={() => handleProblemItemClick(problem)}
                            style={{ cursor: "pointer" }}
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
