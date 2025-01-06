import React, { useState, useEffect, useRef } from "react"; 
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import DinoLabsIDEMarkdown from "./DinoLabsIDEMarkdown.jsx";
import DinoLabsIDEAccount from "./DinoLabsAccount/DinoLabsAccountProfile";
import DinoLabsIDEDebug from "./DinoLabsIDELint/DinoLabsIDELintDebug";
import "../styles/mainStyles/DinoLabsIDE.css";
import "../styles/mainStyles/MirrorThemes/DefaultTheme.css";

import "../styles/helperStyles/Tooltip.css";
import useAuth from "../UseAuth"; 
import LinePlot from "../helpers/PlottingHelpers/LineHelper.jsx";
import DinoLabsNav from "../helpers/DinoLabsNav.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import {
  faCode,
  faAngleRight,
  faAngleDown, 
  faWandMagicSparkles,
  faPlusSquare,
  faMinusSquare,
  faUserCircle,
  faRetweet,
  faA,
  faMagnifyingGlass,
  faMagnifyingGlassPlus,
  faChevronDown,
  faChevronRight
} from "@fortawesome/free-solid-svg-icons";

const highlightResultSnippet = (text, searchTerm, isCaseSensitive) => {
  if (!searchTerm) return text;
  const escapedTerm = escapeRegExp(searchTerm);
  let flags = 'g';
  if (!isCaseSensitive) flags += 'i';
  const re = new RegExp(`(${escapedTerm})`, flags);
  return text.replace(re, '<span class="searchHighlight">$1</span>');
};

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const extensionToLanguageMap = {
  js: "JavaScript",
  jsx: "JavaScript",
  ts: "TypeScript",
  tsx: "TypeScript",
  html: "HTML",
  css: "CSS",
  json: "JSON",
  xml: "XML",
  py: "Python",
  php: "PHP",
  swift: "Swift",
  c: "C",
  cpp: "C++",
  h: "C++",
  cs: "C#",
  rs: "Rust", 
  bash: "Bash", 
  sh: "Shell", 
  zsh: "Shell", 
  mc: "Monkey C", 
  mcgen: "Monkey C", 
  sql: "SQL", 
  asm: "Assembly", 
  md: "Markdown", 
  txt: "Text"
};

const extensionToImageMap = {
  js: "javascript.svg",
  jsx: "javascript.svg",
  ts: "typescript.svg",
  tsx: "typescript.svg",
  html: "html.svg",
  css: "css.svg",
  json: "json.svg",
  xml: "xml.svg",
  py: "python.svg",
  php: "php.svg",
  swift: "swift.svg",
  c: "c.svg",
  cpp: "c++.svg",
  h: "c++.svg",
  cs: "csharp.svg",
  rs: "rust.svg", 
  bash: "bash.svg", 
  sh: "shell.svg", 
  zsh: "shell.svg", 
  mc: "monkeyc.svg", 
  mcgen: "monkeyc.svg", 
  md: "markdown.svg", 
  asm: "assembly.svg", 
  sql: "sql.svg", 
  pem: "securityExtensions.svg", 
  txt: "txtExtension.svg", 
  csv: "csvExtension.svg", 
  pdf: "pdfExtension.svg",
  doc: "wordExtension.svg",
  docx: "wordExtension.svg",
  xls: "excelExtension.svg",
  xlsx: "excelExtension.svg",
  ppt: "powerpointExtension.svg",
  pptx: "powerpointExtension.svg",
  png: "imageExtension.svg",
  jpg: "imageExtension.svg",
  jpeg: "imageExtension.svg",
  svg: "imageExtension.svg",
  bmp: "imageExtension.svg",
  mp3: "audioExtension.svg",
  wav: "audioExtension.svg",
  flac: "audioExtension.svg",
  gif: "videoExtension.svg",
  mp4: "videoExtension.svg",
  mkv: "videoExtension.svg",
  avi: "videoExtension.svg",
  mov: "videoExtension.svg",
  zip: "archiveExtensions.svg",
  rar: "archiveExtensions.svg",
  tar: "archiveExtensions.svg",
  gz: "archiveExtensions.svg",
  git: "githubExtension.svg", 
  default: "unknownExtension.svg"
};

const supportedExtensions = [
  'txt', 'md', 'js', 'jsx', 'ts', 'tsx', 'html', 'css', 
  'py', 'java', 'rb', 'php', 'swift', 'c', 'cpp', 'h', 'cs', 'rs', 'bash', 'sh', 'zsh',
  'mc', 'mcgen', 'asm', 'sql', 'xml', 'json', 
  'md', 'txt'
];

const getFileIcon = (filename) => {
  const parts = filename.split('.');
  const extension = parts.length > 1 ? parts.pop().toLowerCase() : 'default';

  const imageName = extensionToImageMap[extension] || extensionToImageMap['default'];

  return (
    <img
      src={`/language-images/${imageName}`}
      alt={`${extension} icon`}
      className="dinolabsIDEFileIcon"
    />
  );
};

const DinoLabsIDE = () => {
  const { token, userID, organizationID, loading } = useAuth();
  const debounceRef = useRef(null);
  const [directoryWidth, setDirectoryWidth] = useState(20);
  const [contentWidth, setContentWidth] = useState(80);
  const [markdownHeight, setMarkdownHeight] = useState(70);
  const [consoleHeight, setConsoleHeight] = useState(20);
  const [isDraggingWidth, setIsDraggingWidth] = useState(false);
  const [isDraggingHeight, setIsDraggingHeight] = useState(false);
  const [isDraggingPane, setIsDraggingPane] = useState(false);
  const [paneWidths, setPaneWidths] = useState({ pane1: 50, pane2: 50 }); 
  const [repositoryFiles, setRepositoryFiles] = useState([]);
  const [openedDirectories, setOpenedDirectories] = useState({});
  const [rootDirectoryName, setRootDirectoryName] = useState("");
  const [isRootOpen, setIsRootOpen] = useState(false);
  const [panes, setPanes] = useState([{ openedTabs: [], activeTabId: null }]);
  const [activePaneIndex, setActivePaneIndex] = useState(0);
  const directoryRef = useRef(null); 
  const contentRef = useRef(null);  
  const panesRef = useRef(panes);
  const editorRefs = useRef({}); 
  const [searchQuery, setSearchQuery] = useState("");
  const [isAccountOpen, setIsAccountOpen] = useState(false); 
  const [unsavedChanges, setUnsavedChanges] = useState({});
  const [originalContents, setOriginalContents] = useState({});
  const [modifiedContents, setModifiedContents] = useState({}); 
  const [isNavigatorState, setIsNavigatorState] = useState(true);
  const [isSearchState, setIsSearchState] = useState(false); 
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [globalReplaceTerm, setGlobalReplaceTerm] = useState("");
  const [globalSearchResults, setGlobalSearchResults] = useState([]);
  const [isGlobalReplace, setIsGlobalReplace] = useState(false);
  const [isCaseSensitiveSearch, setIsCaseSensitiveSearch] = useState(true); 
  const [lintProblems, setLintProblems] = useState([]);
  const [collapsedFiles, setCollapsedFiles] = useState({});
  const defaultKeyBinds = {
    save: 's',
    undo: 'z',
    redo: 'y',
    cut: 'x',
    copy: 'c',
    paste: 'v',
    search: 'f',
    selectAll: 'a',
  };
  const [keyBinds, setKeyBinds] = useState(defaultKeyBinds);
  const [zoomLevel, setZoomLevel] = useState(1); 
  const [colorTheme, setColorTheme] = useState("default"); 
  const [personalUsageByDay, setPersonalUsageByDay] = useState([]); 
  const [usageLanguages, setUsageLanguages] = useState([]);
  

  useEffect(() => {
        const fetchData = async () => {
            try {
                await Promise.all([
                    fetchUserInfo (userID, organizationID), 
                    fetchPersonalUsageData(userID, organizationID)
                ]);
                setIsLoaded(true);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        if (!loading && token) {
            fetchData();
        }
  }, [userID, organizationID, loading, token]);

  const fetchUserInfo = async (userID, organizationID) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://www.dinolaboratories.com/dinolabs/dinolabs-web-api/user-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          userID,
          organizationID
        }),
      });

      if (response.status !== 200) {
        throw new Error(`Internal Server Error`);
      }

      const data = await response.json();

      if (data[0].userkeybinds) {
          setKeyBinds({ ...defaultKeyBinds, ...data[0].userkeybinds });
      } else {
          setKeyBinds(defaultKeyBinds);
      }
      setZoomLevel(data[0].userzoomlevel || 1); 
      setColorTheme(data[0].usercolortheme || "default");
    } catch (error) {
      console.error("Error fetching user info:", error);
      return;
    }
  };

  const fetchPersonalUsageData = async (userID, organizationID) => {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Token not found in localStorage");
        }

        const response = await fetch("https://www.dinolaboratories.com/dinolabs/dinolabs-web-api/usage-info", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ 
                userID, 
                organizationID
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const data = await response.json();

        // Unpack and handle `personalUsageInfo`
        if (!data.personalUsageInfo || !Array.isArray(data.personalUsageInfo)) {
            throw new Error("Unexpected data structure from the backend");
        }

        setPersonalUsageByDay(
            data.personalUsageInfo.map((item) => ({
                day: new Date(item.day), 
                count: parseInt(item.usage_count, 10), // Use radix 10 for parsing
            }))
        );

        if (!data.usageLanguages || !Array.isArray(data.usageLanguages)) {
            throw new Error("Unexpected usageLanguages data structure from the backend");
        }

        setUsageLanguages(
            data.usageLanguages.map((item) => ({
                language: item.language,
                count: parseInt(item.language_count, 10), // Use radix 10 for parsing
            }))
        );

    } catch (error) {
        console.error("Error fetching personal usage data:", error);
    }
  };

  useEffect(() => {
    panesRef.current = panes;
  }, [panes]);

  useEffect(() => {
    const dir = directoryRef.current;
    const cont = contentRef.current;
    if (!dir || !cont) return;
    
    let isSyncingDir = false;
    let isSyncingCont = false;
    
    const onDirScroll = () => {
      if (isSyncingDir) {
        isSyncingDir = false;
        return;
      }
      isSyncingCont = true;
      cont.scrollTop = dir.scrollTop;
    };
    
    const onContScroll = () => {
      if (isSyncingCont) {
        isSyncingCont = false;
        return;
      }
      isSyncingDir = true;
      dir.scrollTop = cont.scrollTop;
    };
    
    dir.addEventListener('scroll', onDirScroll);
    cont.addEventListener('scroll', onContScroll);
    
    return () => {
      dir.removeEventListener('scroll', onDirScroll);
      cont.removeEventListener('scroll', onContScroll);
    };
  }, []);

  const handleMouseDownWidth = () => setIsDraggingWidth(true);
  const handleMouseMoveWidth = (e) => {
    if (!isDraggingWidth) return;
    const container = document.querySelector(".dinolabsIDEControlFlex");
    const containerWidth = container.offsetWidth;

    const newDirectoryWidth =
      ((e.clientX - container.getBoundingClientRect().left) / containerWidth) * 100;

    if (newDirectoryWidth > 10 && newDirectoryWidth < 50) {
      setDirectoryWidth(newDirectoryWidth);
      setContentWidth(100 - newDirectoryWidth);
    }
  };
  const handleMouseUpWidth = () => setIsDraggingWidth(false);

  const handleMouseDownHeight = () => setIsDraggingHeight(true);
  const handleMouseMoveHeight = (e) => {
    if (!isDraggingHeight) return;
    const container = document.querySelector(".dinolabsIDEControlFlex");
    const containerHeight = container.offsetHeight * 0.90;

    const newMarkdownHeight =
      ((e.clientY - container.getBoundingClientRect().top) / containerHeight) * 100;

    if (newMarkdownHeight > 20 && newMarkdownHeight < 80) {
      setMarkdownHeight(newMarkdownHeight);
      setConsoleHeight(90 - newMarkdownHeight);
    }
  };
  const handleMouseUpHeight = () => setIsDraggingHeight(false);

  const handleMouseDownPane = () => setIsDraggingPane(true);
  const handleMouseMovePane = (e) => {
    if (!isDraggingPane) return;
    const container = document.querySelector(".dinolabsIDEMarkdownWrapper");
    const containerWidth = container.offsetWidth;

    const newPaneWidth = ((e.clientX - container.getBoundingClientRect().left) / containerWidth) * 100;

    if (newPaneWidth > 25 && newPaneWidth < 75) {
      setPaneWidths({
        pane1: newPaneWidth,
        pane2: 100 - newPaneWidth
      });
    }
  };
  const handleMouseUpPane = () => setIsDraggingPane(false);

  const handleLoadRepository = async () => {
    try {
      const directoryHandle = await window.showDirectoryPicker();
      setRootDirectoryName(directoryHandle.name);
      const files = await loadAllDirectoryContents(directoryHandle); 
      setRepositoryFiles(files);
      setIsRootOpen(true);
    } catch (error) {
      console.error("Error loading repository:", error);
      return; 
    }
  };

  const toggleDirectory = (directoryKey) => {
    setOpenedDirectories((prev) => ({
      ...prev,
      [directoryKey]: !prev[directoryKey],
    }));
  };

  const loadAllDirectoryContents = async (directoryHandle, parentPath = "") => {
    const files = [];
    for await (const entry of directoryHandle.values()) {
      const fullPath = parentPath ? `${parentPath}/${entry.name}` : entry.name;
      if (entry.kind === "file") {
        files.push({ name: entry.name, type: "file", handle: entry, fullPath });
      } else if (entry.kind === "directory") {
        const subFiles = await loadAllDirectoryContents(entry, fullPath);
        files.push({ name: entry.name, type: "directory", files: subFiles, handle: entry, fullPath });
      }
    }
    return files;
  };

  const handleFileLoad = async () => {
    try {
      const [fileHandle] = await window.showOpenFilePicker({ multiple: false });
      const fileId = fileHandle.name;

      let content;
      if (modifiedContents[fileId]) {
        content = modifiedContents[fileId];
      } else {
        const file = await fileHandle.getFile();
        content = await file.text();
      }

      const parts = fileHandle.name.split('.');
      const extension = parts.length > 1 ? parts.pop().toLowerCase() : '';
      const language = extensionToLanguageMap[extension] || "Unknown";

      let existingTabPaneIndex = -1;
      let existingTab = null;
      panes.forEach((pane, index) => {
        const tab = pane.openedTabs.find(tab => tab.id === fileId);
        if (tab) {
          existingTabPaneIndex = index;
          existingTab = tab;
        }
      });

      if (existingTab) {
        setActivePaneIndex(existingTabPaneIndex);
        setPanes(prevPanes => {
          const newPanes = [...prevPanes];
          newPanes[existingTabPaneIndex].activeTabId = existingTab.id;
          return newPanes;
        });
        return;
      }

      const newTab = {
        id: fileId, 
        name: fileHandle.name,
        content: content,
        language: language,
        forceOpen: false, 
        searchTerm: "",
        replaceTerm: "",
        searchPositions: [],
        currentSearchIndex: -1,
        isSearchOpen: false, 
        isReplaceOpen: false,
        fileHandle: fileHandle 
      };

      setPanes(prevPanes => {
        const newPanes = [...prevPanes];
        newPanes[activePaneIndex].openedTabs.push(newTab);
        newPanes[activePaneIndex].activeTabId = newTab.id;
        return newPanes;
      });

      setOriginalContents(prev => ({ ...prev, [fileId]: content }));
      setUnsavedChanges(prev => ({ ...prev, [fileId]: false }));
    } catch (error) {
      console.error("Error loading file:", error);
      return; 
    }
  };

  const handleFileClick = async (file, parentPath) => {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const isSupported = supportedExtensions.includes(fileExtension);
    const fileId = file.fullPath || `${parentPath}/${file.name}`;
    let existingTabPaneIndex = -1;
    let existingTab = null;
    panes.forEach((pane, index) => {
      const tab = pane.openedTabs.find(tab => tab.id === fileId);
      if (tab) {
        existingTabPaneIndex = index;
        existingTab = tab;
      }
    });

    if (existingTab) {
      setActivePaneIndex(existingTabPaneIndex);
      setPanes(prevPanes => {
        const newPanes = [...prevPanes];
        newPanes[existingTabPaneIndex].activeTabId = existingTab.id;
        return newPanes;
      });
      return;
    }

    try {
      let content;
      if (modifiedContents[fileId]) {
        content = modifiedContents[fileId];
      } else if (file.handle) {
        const fileData = await file.handle.getFile();
        content = await fileData.text();
      } else {
        content = isSupported
          ? "Error reading file content."
          : "The content of this file type could not be automatically detected. Try to open it anyway.";
      }

      const language = extensionToLanguageMap[fileExtension] || "Unknown";
      const newTab = {
        id: fileId, 
        name: file.name,
        content: content,
        language: isSupported ? language : "Unknown",
        forceOpen: false, 
        searchTerm: "",
        replaceTerm: "",
        searchPositions: [],
        currentSearchIndex: -1,
        isSearchOpen: false, 
        isReplaceOpen: false,
        fileHandle: file.handle 
      };

      setPanes(prevPanes => {
        const newPanes = [...prevPanes];
        newPanes[activePaneIndex].openedTabs.push(newTab);
        newPanes[activePaneIndex].activeTabId = newTab.id;
        return newPanes;
      });

      setOriginalContents(prev => ({ ...prev, [fileId]: content }));
      setUnsavedChanges(prev => ({ ...prev, [fileId]: false }));
    } catch (error) {
      console.error("Error opening file:", error);
      const newTab = {
        id: fileId, 
        name: file.name,
        content: isSupported
          ? "Error reading file content."
          : "The content of this file type could not be automatically detected. Try to open it anyway.",
        language: "Unknown",
        forceOpen: false,
        searchTerm: "",
        replaceTerm: "",
        searchPositions: [],
        currentSearchIndex: -1,
        isSearchOpen: false, 
        isReplaceOpen: false,
        fileHandle: null 
      };

      setPanes(prevPanes => {
        const newPanes = [...prevPanes];
        newPanes[activePaneIndex].openedTabs.push(newTab);
        newPanes[activePaneIndex].activeTabId = newTab.id;
        return newPanes;
      });

      setUnsavedChanges(prev => ({ ...prev, [fileId]: false }));
    }
  };

  const handleForceOpenTab = (paneIndex, tabId) => {
    setPanes(prevPanes => {
      const newPanes = [...prevPanes];
      const pane = newPanes[paneIndex];
      pane.openedTabs = pane.openedTabs.map(tab =>
        tab.id === tabId ? { ...tab, forceOpen: true } : tab
      );
      return newPanes;
    });
  };

  const setTabSearchOpen = (paneIndex, tabId, isOpen) => {
    setPanes(prevPanes => {
      const newPanes = [...prevPanes];
      const pane = newPanes[paneIndex];
      pane.openedTabs = pane.openedTabs.map(tab =>
        tab.id === tabId ? { ...tab, isSearchOpen: isOpen } : tab
      );
      return newPanes;
    });
  };

  const setTabReplaceOpen = (paneIndex, tabId, isOpen) => {
    setPanes(prevPanes => {
      const newPanes = [...prevPanes];
      const pane = newPanes[paneIndex];
      pane.openedTabs = pane.openedTabs.map(tab =>
        tab.id === tabId ? { ...tab, isReplaceOpen: isOpen } : tab
      );
      return newPanes;
    });
  };

  const setTabSearchTerm = (paneIndex, tabId, term) => {
    setPanes(prevPanes => {
      const newPanes = [...prevPanes];
      const pane = newPanes[paneIndex];
      pane.openedTabs = pane.openedTabs.map(tab =>
        tab.id === tabId ? { ...tab, searchTerm: term } : tab
      );
      return newPanes;
    });
  };

  const setTabReplaceTerm = (paneIndex, tabId, term) => {
    setPanes(prevPanes => {
      const newPanes = [...prevPanes];
      const pane = newPanes[paneIndex];
      pane.openedTabs = pane.openedTabs.map(tab =>
        tab.id === tabId ? { ...tab, replaceTerm: term } : tab
      );
      return newPanes;
    });
  };

  const setTabCurrentSearchIndex = (paneIndex, tabId, index) => {
    setPanes(prevPanes => {
      const newPanes = [...prevPanes];
      const pane = newPanes[paneIndex];
      pane.openedTabs = pane.openedTabs.map(tab =>
        tab.id === tabId ? { ...tab, currentSearchIndex: index } : tab
      );
      return newPanes;
    });
  };

  const setTabSearchPositions = (paneIndex, tabId, positions) => {
    setPanes(prevPanes => {
      const newPanes = [...prevPanes];
      const pane = newPanes[paneIndex];
      pane.openedTabs = pane.openedTabs.map(tab =>
        tab.id === tabId ? { ...tab, searchPositions: positions } : tab
      );
      return newPanes;
    });
  };

  const filterFiles = (files, query) => {
    return files.reduce((acc, file) => {
      if (file.type === 'file' && file.name.toLowerCase().includes(query.toLowerCase())) {
        acc.push(file);
      } else if (file.type === 'directory') {
        const filteredSubFiles = filterFiles(file.files, query);
        if (filteredSubFiles.length > 0 || file.name.toLowerCase().includes(query.toLowerCase())) {
          acc.push({ ...file, files: filteredSubFiles });
        }
      }
      return acc;
    }, []);
  };

  const renderFiles = (files, parentPath = "", isRoot = true) => {
    const filteredFiles = searchQuery ? filterFiles(files, searchQuery) : files;
  
    return filteredFiles.map((file) => {
      const directoryKey = file.fullPath || `${parentPath}/${file.name}`;
      if (file.type === "directory") {
        const isOpen = openedDirectories[directoryKey];
        return (
          <React.Fragment key={directoryKey}>
            <div
              onClick={() => toggleDirectory(directoryKey)}
              className={`directoryListItem ${isRoot ? "rootDirectory" : ""}`}
            >
              <FontAwesomeIcon icon={isOpen ? faAngleDown : faAngleRight} />
              {file.name}
              {unsavedChanges[file.fullPath || `${parentPath}/${file.name}`] && (
                <Tippy content="Unsaved" theme="tooltip-light">
                  <span className="dinolabsIDEFileUnsavedDot" />
                </Tippy>
              )}
            </div>
            {isOpen && file.files.length > 0 && (
              <ul className={`directoryListNestedFiles ${isRoot ? "" : "nestedList"}`}>
                {renderFiles(file.files, directoryKey, false)}
              </ul>
            )}
          </React.Fragment>
        );
      }
  
      return (
        <li
          key={file.fullPath || `${parentPath}/${file.name}`}
          className={`directoryListItem ${unsavedChanges[file.fullPath || `${parentPath}/${file.name}`] ? "dinolabsIDEFileUnsaved" : ""}`}
          onClick={() => handleFileClick(file, parentPath)}
        >
          {unsavedChanges[file.fullPath || `${parentPath}/${file.name}`] && (
            <Tippy content="Unsaved" theme="tooltip-light">
              <span className="dinolabsIDEFileUnsavedDot" />
            </Tippy>
          )}
          {getFileIcon(file.name)}
          {file.name}
        </li>
      );
    });
  };  

  const closeTab = (paneIndex, tabId) => {
    if (unsavedChanges[tabId]) {
      const confirmClose = window.confirm(
        "You have unsaved changes in this file. Are you sure you want to close it?"
      );
      if (!confirmClose) {
        return;
      }
    }
  
    setPanes(prevPanes => {
      let newPanes = [...prevPanes];
      const pane = newPanes[paneIndex];
      pane.openedTabs = pane.openedTabs.filter(tab => tab.id !== tabId);
      if (pane.activeTabId === tabId) {
        pane.activeTabId = pane.openedTabs.length > 0 ? pane.openedTabs[0].id : null;
      }
  
      if (pane.openedTabs.length === 0) {
        newPanes.splice(paneIndex, 1);
        if (activePaneIndex >= paneIndex && activePaneIndex > 0) {
          setActivePaneIndex(activePaneIndex - 1);
        }
  
        if (newPanes.length === 0) {
          newPanes = [{ openedTabs: [], activeTabId: null }];
        }
  
        if (newPanes.length === 1) {
          setPaneWidths({ pane1: 100, pane2: 0 });
        }
      }
  
      setUnsavedChanges(prev => {
        const updated = { ...prev };
        delete updated[tabId];
        return updated;
      });
  
      setOriginalContents(prev => {
        const updated = { ...prev };
        delete updated[tabId];
        return updated;
      });
  
      setModifiedContents(prev => { 
        const updated = { ...prev };
        delete updated[tabId];
        return updated;
      });
  
      return newPanes;
    });
  };

  const switchTab = (paneIndex, tabId) => {
    setPanes(prevPanes => {
      const newPanes = [...prevPanes];
      newPanes[paneIndex].activeTabId = tabId;
      return newPanes;
    });
    setActivePaneIndex(paneIndex);
  };

  const splitTab = () => {
    setPanes(prevPanes => {
      if (prevPanes.length >= 2) {
        return prevPanes;
      }
  
      const currentPane = prevPanes[activePaneIndex];
      const currentTabId = currentPane.activeTabId;
      const currentTabIndex = currentPane.openedTabs.findIndex(tab => tab.id === currentTabId);
      const currentTab = currentPane.openedTabs[currentTabIndex];
      if (!currentTab) {
        return prevPanes;
      }
  
      const updatedPanes = [...prevPanes];
      updatedPanes[activePaneIndex].openedTabs.splice(currentTabIndex, 1);
      if (updatedPanes[activePaneIndex].activeTabId === currentTabId) {
        updatedPanes[activePaneIndex].activeTabId = updatedPanes[activePaneIndex].openedTabs.length > 0 ? updatedPanes[activePaneIndex].openedTabs[0].id : null;
      }
  
      const newPane = {
        openedTabs: [{
          ...currentTab,
          forceOpen: currentTab.forceOpen || unsavedChanges[currentTab.id],
        }],
        activeTabId: currentTab.id
      };
  
      setPaneWidths({ pane1: 50, pane2: 50 }); 
      return [...updatedPanes, newPane];
    });
  };

  const handleDragStart = (e, sourcePaneIndex, tabId) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ sourcePaneIndex, tabId }));
  };

  const handleDrop = (e, targetPaneIndex) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const { sourcePaneIndex, tabId } = data;
    if (sourcePaneIndex === targetPaneIndex) return; 
    moveTabBetweenPanes(sourcePaneIndex, targetPaneIndex, tabId);
  };

  const moveTabBetweenPanes = (sourcePaneIndex, targetPaneIndex, tabId) => {
    const currentPanes = panesRef.current;
    const newPanes = [...currentPanes];
    const sourcePane = newPanes[sourcePaneIndex];
    const targetPane = newPanes[targetPaneIndex];
    
    const tabToMove = sourcePane.openedTabs.find(tab => tab.id === tabId);
    if (!tabToMove) return;

    sourcePane.openedTabs = sourcePane.openedTabs.filter(tab => tab.id !== tabId);
    if (sourcePane.activeTabId === tabId) {
      sourcePane.activeTabId = sourcePane.openedTabs.length > 0 ? sourcePane.openedTabs[0].id : null;
    }

    const existingTab = targetPane.openedTabs.find(tab => tab.id === tabId);
    if (!existingTab) {
      targetPane.openedTabs.push(tabToMove);
      targetPane.activeTabId = tabId;
    } else {
      targetPane.activeTabId = existingTab.id;
    }

    let newActivePaneIndex = activePaneIndex;
    if (sourcePane.openedTabs.length === 0) {
      newPanes.splice(sourcePaneIndex, 1);
      if (activePaneIndex === sourcePaneIndex) {
        newActivePaneIndex = targetPaneIndex < sourcePaneIndex ? targetPaneIndex : targetPaneIndex - 1;
      } else if (activePaneIndex > sourcePaneIndex) {
        newActivePaneIndex = activePaneIndex - 1;
      }

      if (newPanes.length === 1) {
        setPaneWidths({ pane1: 100, pane2: 0 }); 
      }
    }

    if (newPanes.length === 0) {
      newPanes.push({ openedTabs: [], activeTabId: null });
      setPaneWidths({ pane1: 100, pane2: 0 });
      newActivePaneIndex = 0;
    }

    setPanes(newPanes);
    setActivePaneIndex(newActivePaneIndex);
  };

  const handleZoomIn = () => setZoomLevel(prevZoom => Math.min(prevZoom + 0.1, 3));
  const handleZoomOut = () => setZoomLevel(prevZoom => Math.max(prevZoom - 0.1, 0.5));
  const handleResetZoomLevel = () => setZoomLevel(zoomLevel);

  const handleEdit = (paneIndex, tabId, previousState, newState) => {
    const originalContent = originalContents[tabId];
    if (newState.fullCode === originalContent) {
      setUnsavedChanges(prev => ({ ...prev, [tabId]: false }));
    } else {
      setUnsavedChanges(prev => ({ ...prev, [tabId]: true }));
    }
  
    setPanes(prevPanes => {
      const newPanes = [...prevPanes];
      const pane = newPanes[paneIndex];
      const updatedTabs = pane.openedTabs.map(tab => {
        if (tab.id === tabId) {
          return { ...tab, content: newState.fullCode };
        }
        return tab;
      });
      newPanes[paneIndex] = { ...pane, openedTabs: updatedTabs };
      return newPanes;
    });

    setModifiedContents(prev => ({ ...prev, [tabId]: newState.fullCode }));
  };

  const handleCloneGithubRepository = async () => {
    const repoUrl = prompt("Enter the GitHub repository URL to clone:");
    if (!repoUrl) return;

    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)(\.git)?$/);
    if (!match) return;

    const owner = match[1];
    const repo = match[2].replace(/\.git$/, "");

    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Repository not found or private.");
        } else {
          throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      if (!data.tree) {
        throw new Error("Invalid repository structure.");
      }

      const filesMap = {};
      data.tree.forEach(item => {
        const parts = item.path.split('/');
        let current = filesMap;
        let fullPath = '';
        parts.forEach((part, index) => {
          fullPath += `/${part}`;
          if (index === parts.length - 1) {
            if (item.type === 'tree') {
              current[part] = { name: part, type: 'directory', files: [], fullPath };
            } else if (item.type === 'blob') {
              current[part] = { name: part, type: 'file', handle: null, fullPath };
            }
          } else {
            if (!current[part]) {
              current[part] = { name: part, type: 'directory', files: [], fullPath };
            }
            current = current[part].files;
          }
        });
      });

      const convertMapToArray = (map) => {
        return Object.values(map).map(item => {
          if (item.type === 'directory') {
            return {
              name: item.name,
              type: 'directory',
              files: convertMapToArray(item.files),
              fullPath: item.fullPath
            };
          } else {
            return {
              name: item.name,
              type: 'file',
              handle: null,
              fullPath: item.fullPath
            };
          }
        });
      };

      const structuredFiles = convertMapToArray(filesMap);

      setRootDirectoryName(`${owner}/${repo}`);
      setRepositoryFiles(structuredFiles);
      setIsRootOpen(true);
    } catch (error) {
      console.error("Error cloning GitHub repository:", error);
      return; 
    }
  };

  const handleSave = (paneIndex, tabId, newFullCode) => {
    setOriginalContents(prev => ({ ...prev, [tabId]: newFullCode }));
    setUnsavedChanges(prev => ({ ...prev, [tabId]: false }));
    setModifiedContents(prev => {
      const updated = { ...prev };
      delete updated[tabId];
      return updated;
    });
  };
  
  const hasOpenFile = panes.some(pane => pane.openedTabs.length > 0);

  const performGlobalSearch = async () => {
    if (!globalSearchQuery) {
      setGlobalSearchResults([]);

      setPanes(prevPanes => prevPanes.map(pane => {
        const newTabs = pane.openedTabs.map(tab => ({
          ...tab,
          searchTerm: "" 
        }));
        return { ...pane, openedTabs: newTabs };
      }));
      return;
    }

    const results = [];

    const traverseFiles = async (files) => {
      for (const file of files) {
        if (file.type === 'file') {
          try {
            let content = '';
            if (file.handle) {
              const fileData = await file.handle.getFile();
              content = await fileData.text();
            } else if (modifiedContents[file.fullPath]) {
              content = modifiedContents[file.fullPath];
            } else {
              continue;
            }

            const lines = content.split('\n');
            lines.forEach((line, index) => {
              if (isCaseSensitiveSearch) {
                if (line.includes(globalSearchQuery)) {
                  results.push({
                    filePath: file.fullPath,
                    lineNumber: index + 1,
                    lineContent: line
                  });
                }
              } else {
                if (line.toLowerCase().includes(globalSearchQuery.toLowerCase())) {
                  results.push({
                    filePath: file.fullPath,
                    lineNumber: index + 1,
                    lineContent: line
                  });
                }
              }
            });
          } catch (error) {
            continue;
          }
        } else if (file.type === 'directory') {
          await traverseFiles(file.files);
        }
      }
    };

    await traverseFiles(repositoryFiles);
    setGlobalSearchResults(results);

    setPanes(prevPanes => {
      return prevPanes.map(pane => {
        const newTabs = pane.openedTabs.map(tab => ({
          ...tab,
          searchTerm: globalSearchQuery 
        }));
        return { ...pane, openedTabs: newTabs };
      });
    });
  };

  const performGlobalReplace = async () => {
    if (!globalSearchQuery) {
      return;
    }

    let totalMatches = 0;
    let filesWithMatches = 0;

    const traverseAndCount = async (files) => {
      for (const file of files) {
        if (file.type === 'file') {
          try {
            let content = '';
            if (file.handle) {
              const fileData = await file.handle.getFile();
              content = await fileData.text();
            } else if (modifiedContents[file.fullPath]) {
              content = modifiedContents[file.fullPath];
            } else {
              continue;
            }

            let matchCount = 0;

            if (isCaseSensitiveSearch) {
              matchCount = (content.match(new RegExp(escapeRegExp(globalSearchQuery), 'g')) || []).length;
            } else {
              matchCount = (content.match(new RegExp(escapeRegExp(globalSearchQuery), 'gi')) || []).length;
            }

            if (matchCount > 0) {
              totalMatches += matchCount;
              filesWithMatches += 1;
            }
          } catch (error) {
            continue;
          }
        } else if (file.type === 'directory') {
          await traverseAndCount(file.files);
        }
      }
    };

    await traverseAndCount(repositoryFiles);

    if (totalMatches === 0) {
      return;
    }

    const confirmReplace = window.confirm(`Are you sure you want to replace ${totalMatches} ${totalMatches === 1 ? 'occurrence' : 'occurrences'} of "${globalSearchQuery}" across ${filesWithMatches} ${filesWithMatches === 1 ? 'file' : 'files'}?`);

    if (!confirmReplace) {
      return;
    }

    const updatedFiles = {};

    const traverseAndReplace = async (files) => {
      for (const file of files) {
        if (file.type === 'file') {
          try {
            let content = '';
            if (file.handle) {
              const fileData = await file.handle.getFile();
              content = await fileData.text();
            } else if (modifiedContents[file.fullPath]) {
              content = modifiedContents[file.fullPath];
            } else {
              continue;
            }

            let matchCount = 0;
            let newContent = content;

            if (isCaseSensitiveSearch) {
              if (content.includes(globalSearchQuery)) {
                newContent = content.split(globalSearchQuery).join(globalReplaceTerm);
                matchCount = (content.match(new RegExp(escapeRegExp(globalSearchQuery), 'g')) || []).length;
              }
            } else {
              const regex = new RegExp(escapeRegExp(globalSearchQuery), 'gi');
              newContent = content.replace(regex, globalReplaceTerm);
              const matches = content.match(regex);
              matchCount = matches ? matches.length : 0;
            }

            if (matchCount > 0) {
              updatedFiles[file.fullPath] = newContent;

              if (file.handle) {
                try {
                  const writable = await file.handle.createWritable();
                  await writable.write(newContent);
                  await writable.close();

                  setUnsavedChanges(prev => ({
                    ...prev,
                    [file.fullPath]: false
                  }));
                } catch (writeError) {
                  setUnsavedChanges(prev => ({
                    ...prev,
                    [file.fullPath]: true
                  }));
                }
              } else {
                setUnsavedChanges(prev => ({
                  ...prev,
                  [file.fullPath]: true
                }));
              }
            }
          } catch (error) {
            continue;
          }
        } else if (file.type === 'directory') {
          await traverseAndReplace(file.files);
        }
      }
    };

    await traverseAndReplace(repositoryFiles);

    setModifiedContents(prev => ({
      ...prev,
      ...updatedFiles
    }));

    setPanes(prevPanes => {
      const newPanes = prevPanes.map(pane => {
        const updatedTabs = pane.openedTabs.map(tab => {
          if (updatedFiles[tab.id]) {
            return {
              ...tab,
              content: updatedFiles[tab.id]
            };
          }
          return tab;
        });
        return {
          ...pane,
          openedTabs: updatedTabs
        };
      });
      return newPanes;
    });

    performGlobalSearch();
  };

  const toggleCollapse = (filePath) => {
    setCollapsedFiles(prev => ({
      ...prev,
      [filePath]: !prev[filePath]
    }));
  };

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      performGlobalSearch();
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [globalSearchQuery, isCaseSensitiveSearch]);

  const handleSearchSuggestionClick = async (filePath, lineNumber) => {
    let targetPaneIndex = -1;
    let targetTab = null;

    panes.forEach((pane, paneIndex) => {
      const tab = pane.openedTabs.find(tab => tab.id === filePath);
      if (tab) {
        targetPaneIndex = paneIndex;
        targetTab = tab;
      }
    });

    if (targetTab) {
      setPanes(prevPanes => {
        const newPanes = [...prevPanes];
        const thePane = newPanes[targetPaneIndex];
        thePane.openedTabs = thePane.openedTabs.map(t => {
          if (t.id === filePath) {
            return {
              ...t,
              searchTerm: globalSearchQuery,
              isSearchOpen: false
            };
          }
          return t;
        });
        thePane.activeTabId = filePath;
        return newPanes;
      });

      setActivePaneIndex(targetPaneIndex);

      const editorRef = editorRefs.current[targetPaneIndex][targetTab.id];
      if (editorRef && editorRef.current && typeof editorRef.current.jumpToLine === 'function') {
        editorRef.current.jumpToLine(lineNumber);
      }
    } else {
      const handleOpenAndJump = async () => {
        try {
          let content = '';
          let fileHandle = await getFileHandleByPath(repositoryFiles, filePath);

          if (!fileHandle) {
            try {
              const [pickedFile] = await window.showOpenFilePicker({
                multiple: false,
                suggestedName: filePath.split('/').pop(),
              });
              if (pickedFile) {
                fileHandle = pickedFile;
              }
            } catch (err) {
              console.error("No valid file handle selected.");
              return;
            }
          }

          if (!fileHandle) {
            console.error("No valid file handle. Cannot open.");
            return;
          }

          const fileData = await fileHandle.getFile();
          content = await fileData.text();

          const parts = filePath.split('.');
          const extension = parts.length > 1 ? parts.pop().toLowerCase() : '';
          const language = extensionToLanguageMap[extension] || "Unknown";

          const newTabId = filePath; 
          let existingPaneIndex = -1;
          let existingTab = null;
          panes.forEach((pane, index) => {
            const tab = pane.openedTabs.find(tab => tab.id === newTabId);
            if (tab) {
              existingPaneIndex = index;
              existingTab = tab;
            }
          });

          if (existingTab) {
            setActivePaneIndex(existingPaneIndex);
            setPanes(prevPanes => {
              const newPanes = [...prevPanes];
              const thePane = newPanes[existingPaneIndex];
              thePane.openedTabs = thePane.openedTabs.map(t => {
                if (t.id === newTabId) {
                  return {
                    ...t,
                    searchTerm: globalSearchQuery,
                    isSearchOpen: false
                  };
                }
                return t;
              });
              thePane.activeTabId = existingTab.id;
              return newPanes;
            });
            const editorRef = editorRefs.current[existingPaneIndex][existingTab.id];
            if (editorRef && editorRef.current && typeof editorRef.current.jumpToLine === 'function') {
              editorRef.current.jumpToLine(lineNumber);
            }
            return;
          }

          const newTab = {
            id: newTabId, 
            name: filePath.split('/').pop(),
            content: content,
            language: language,
            forceOpen: false, 
            searchTerm: globalSearchQuery,
            replaceTerm: "",
            searchPositions: [],
            currentSearchIndex: -1,
            isSearchOpen: false, 
            isReplaceOpen: false,
            fileHandle: fileHandle, 
            fullPath: filePath
          };

          setPanes(prevPanes => {
            const newPanes = [...prevPanes];
            newPanes[activePaneIndex].openedTabs.push(newTab);
            newPanes[activePaneIndex].activeTabId = newTab.id;
            return newPanes;
          });

          setOriginalContents(prev => ({ ...prev, [newTabId]: content }));
          setUnsavedChanges(prev => ({ ...prev, [newTabId]: false }));

          setTimeout(() => {
            const editorRef = editorRefs.current[activePaneIndex][newTab.id];
            if (editorRef && editorRef.current && typeof editorRef.current.jumpToLine === 'function') {
              editorRef.current.jumpToLine(lineNumber);
            }
          }, 100);

        } catch (error) {
          console.error("Error opening file:", error);
        }
      };

      handleOpenAndJump();
    }
  };

  const getFileHandleByPath = async (files, filePath) => {
    for (const file of files) {
      if (file.type === 'file' && file.fullPath === filePath) {
        return file.handle;
      } else if (file.type === 'directory') {
        const handle = await getFileHandleByPath(file.files, filePath);
        if (handle) return handle;
      }
    }
    return null;
  };

  const handleProblemClick = (filePath, lineNumber) => {
    if (filePath) {
      handleSearchSuggestionClick(filePath, lineNumber);
    } else {
      const activePane = panes[activePaneIndex];
      const activeTab = activePane.openedTabs.find(tab => tab.id === activePane.activeTabId);
      if (activeTab) {
        const editorRef = editorRefs.current[activePaneIndex][activeTab.id];
        if (editorRef && editorRef.current && typeof editorRef.current.jumpToLine === 'function') {
          editorRef.current.jumpToLine(lineNumber);
        }
      }
    }
  };

  const handleProblemsDetected = (problems) => {
      setLintProblems(problems);
  };

  return (
    <div
      className="dinolabsIDEPageWrapper"
      onMouseMove={(e) => {
        handleMouseMoveWidth(e);
        if (hasOpenFile) handleMouseMoveHeight(e);
        handleMouseMovePane(e); 
      }}
      onMouseUp={() => {
        handleMouseUpWidth();
        handleMouseUpHeight();
        handleMouseUpPane(); 
      }}
      onMouseLeave={() => {
        handleMouseUpWidth();
        handleMouseUpHeight();
        handleMouseUpPane(); 
      }}
    >
      <DinoLabsNav activePage={"dinolabside"}/> 

      <div className="dinolabsIDEHeaderContainer">
        <div className="dinolabsIDEControlFlex">
          <div 
            className="leadingIDEDirectoryStack" 
            style={{ width: `${directoryWidth}%` }}
            ref={directoryRef} 
          >
            <div className="leadingDirectoryTopBar">
              <div className="leadingDirectoryZoomButtonFlex" style={{"borderRight": "0.2vh solid rgba(255,255,255,0.1)"}}> 
                <Tippy content={"Zoom In"} theme="tooltip-light" placement="bottom">
                  <button className="leadingDirectoryZoomButton" onClick={handleZoomIn}> 
                    <FontAwesomeIcon icon={faPlusSquare}/>
                  </button>
                </Tippy>
              
                <Tippy content={"Zoom Out"} theme="tooltip-light" placement="bottom">
                  <button className="leadingDirectoryZoomButton" onClick={handleZoomOut}> 
                    <FontAwesomeIcon icon={faMinusSquare}/>
                  </button>
                </Tippy>

                <Tippy content={"Reset View"} theme="tooltip-light" placement="bottom">
                  <button className="leadingDirectoryZoomButton" onClick={handleResetZoomLevel}> 
                    <FontAwesomeIcon icon={faRetweet}/>
                  </button>
                </Tippy>
              </div>
            </div>

            <div className="leadingDirectoryStack">
              <div className="leadingdDirectoryOperationsWrapper">
                <div className="leadingDirectory"> 
                </div>
                <button className="leadingDirectoryButton" onClick={handleLoadRepository}>
                  <FontAwesomeIcon icon={faAngleDown} />
                  Import a Directory
                </button>

                <button className="leadingDirectoryButton" onClick={handleFileLoad}>
                  <FontAwesomeIcon icon={faCode} />
                  Import a File
                </button>

                <button className="leadingDirectoryButton" onClick={handleCloneGithubRepository}>
                  <FontAwesomeIcon icon={faGithub} />
                  Clone a GitHub Repository
                </button>
              </div>

              <div className="leadingDirectoryTabsWrapper">
                <button className="leadingDirectoryTabButton"
                  style={{ backgroundColor: isNavigatorState ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.0)" }}
                  onClick={() => {
                    setIsSearchState(!isSearchState);
                    setIsNavigatorState(!isNavigatorState);
                  }}
                > 
                  Navigator
                </button>
                <button className="leadingDirectoryTabButton"
                  style={{ backgroundColor: isSearchState ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.0)" }}
                  onClick={() => {
                    setIsSearchState(!isSearchState);
                    setIsNavigatorState(!isNavigatorState);
                  }}
                > 
                  Search
                </button>
              </div>
              
              {isNavigatorState && (
                <div className="leadingDirectorySearchWrapper"> 
                  <input
                    type="text"
                    className="directorySearchInput"
                    placeholder="🔎   Search the directory..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}

              {isNavigatorState && (
                <div className="leadingDirectoryFiles">
                  {rootDirectoryName && (
                    <ul className="leadingDirectoryFileStack">
                      <li className="leadingDirectoryFileStackContent">
                        <div
                          onClick={() => setIsRootOpen(!isRootOpen)}
                          className="directoryListItem"
                        >
                          <FontAwesomeIcon icon={isRootOpen ? faAngleDown : faAngleRight} /> 
                          {rootDirectoryName}
                          {unsavedChanges[rootDirectoryName] && (
                            <Tippy content="Unsaved" theme="tooltip-light">
                              <span className="dinolabsIDEFileUnsavedDot" />
                            </Tippy>
                          )}
                        </div>
                        {isRootOpen && (
                          <ul className="nestedDirectoryFileStack">{renderFiles(repositoryFiles)}</ul>
                        )}
                      </li>
                    </ul>
                  )}
                </div>
              )}

              {isSearchState && (
                <div className="leadingDirectoryGlobalSearchWrapper">
                  <div className="leadingDirectoryGlobalSearchFlex" style={{ alignItems: "flex-end" }}> 
                    <input
                      type="text"
                      className="leadingDirectoryGlobalSearchInput"
                      placeholder="Search across all files..."
                      value={globalSearchQuery}
                      onChange={(e) => setGlobalSearchQuery(e.target.value)}
                    />

                    <div className="leadingDirectoryGlobalSearchTrailingButtons"> 
                      <Tippy content={"Case Sensitive"} theme="tooltip-light">
                        <button
                          type="button" 
                          className="leadingDirectoryGlobalSearchButton"
                          onClick={() => setIsCaseSensitiveSearch(!isCaseSensitiveSearch)} 
                          title="Toggle Case Sensitivity"
                          onMouseDown={(e) => e.preventDefault()} 
                        >
                          <FontAwesomeIcon icon={faA} style={{ color: isCaseSensitiveSearch ? "#AD6ADD" : "" }}/>
                        </button>
                      </Tippy>

                      <Tippy content={"Search Files"} theme="tooltip-light">
                        <button
                          className="leadingDirectoryGlobalSearchButton"
                          onClick={performGlobalSearch}
                        >
                          <FontAwesomeIcon icon={faMagnifyingGlass}/>
                        </button>
                      </Tippy>
                    </div>
                  </div>

                  <div className="leadingDirectoryGlobalSearchFlex" style={{ alignItems: "flex-start" }}> 
                    <input
                      type="text"
                      className="leadingDirectoryGlobalSearchInput"
                      placeholder="Replace with..."
                      value={globalReplaceTerm}
                      onChange={(e) => setGlobalReplaceTerm(e.target.value)}
                      disabled={!isGlobalReplace}
                    />

                    <div className="leadingDirectoryGlobalSearchTrailingButtons"> 
                      <Tippy content={"Replace Across Files"} theme="tooltip-light">
                        <button
                          className="leadingDirectoryGlobalSearchButton"
                          onClick={() => {
                            setIsGlobalReplace(true);
                            performGlobalReplace();
                          }}
                          disabled={!globalSearchQuery}
                        >
                          <FontAwesomeIcon icon={faMagnifyingGlassPlus}/>
                        </button>
                      </Tippy>
                    </div>
                  </div>
                </div>
              )}
              
              {isSearchState && (
                <div className="leadingDirectoryGlobalSearchResults">
                  {globalSearchResults.length > 0 && (
                    <div className="leadingDirectoryGlobalSearchResultsGrouped">
                      {Object.entries(
                        globalSearchResults.reduce((acc, result) => {
                          if (!acc[result.filePath]) {
                            acc[result.filePath] = [];
                          }
                          acc[result.filePath].push(result);
                          return acc;
                        }, {})
                      ).map(([filePath, results]) => (
                        <div key={filePath} className="leadingDirectoryGlobalFileGroup">
                          <div 
                            className="leadingDirectoryGlobalSearchResultFileHeader" 
                            onClick={() => toggleCollapse(filePath)}
                            role="button"
                            aria-expanded={!collapsedFiles[filePath]}
                            tabIndex={0}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                toggleCollapse(filePath);
                              }
                            }}
                          >
                            <FontAwesomeIcon 
                              icon={collapsedFiles[filePath] ? faChevronRight : faChevronDown} 
                              className="leadingDirectoryGlobalSearchChevron"
                            />
                            <strong>{filePath}</strong>
                          </div>
                          {!collapsedFiles[filePath] && (
                            <ul className="leadingDirectoryGlobalSearchResultNestedGroup">
                              {results.map((res, idx) => (
                                <li 
                                  key={idx}
                                  className="leadingDirectoryGlobalSearchResultItem"
                                  onClick={() => handleSearchSuggestionClick(res.filePath, res.lineNumber)}
                                  dangerouslySetInnerHTML={{
                                    __html: `<strong>Line ${res.lineNumber}:</strong> ${highlightResultSnippet(res.lineContent, globalSearchQuery, isCaseSensitiveSearch)}`
                                  }}
                                />
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="leadingDirectoryBottomBar">
                <div className="leadingDirectorySettingsButtonFlex" style={{ borderRight: "0.2vh solid rgba(255,255,255,0.1)" }}> 
                  <Tippy content={"Account"} theme="tooltip-light">
                    <button
                      className="leadingDirectoryZoomButton"
                      onClick={() => {
                        setIsAccountOpen(!isAccountOpen);
                      }}
                    > 
                      <FontAwesomeIcon icon={faUserCircle}/>
                    </button>
                  </Tippy> 
                </div>
            </div>
          </div>

          <div className="resizableWidthDivider" onMouseDown={handleMouseDownWidth} />

          <div 
            className="dinolabsIDEControlStack" 
            style={{ width: `${contentWidth}%` }}
            ref={contentRef} 
          >
            {(!isAccountOpen) && (
              <div className="topIDEControlBarWrapper">
                {panes.map((pane, paneIndex) => (
                  <React.Fragment key={`pane-wrapper-${paneIndex}`}>
                    {(panes.length > 1 && paneIndex === 1) && (
                      <div className="resizablePaneDivider"/> 
                    )}

                    <div
                      className="topIDEControlBar"
                      style={{ 
                        height: "100%", 
                        width: panes.length > 1 ? `${paneWidths[`pane${paneIndex + 1}`]}%` : '100%',
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, paneIndex)}
                    >
                      {pane.openedTabs.length > 0 ? (
                        pane.openedTabs.map((tab) => {
                          if (!editorRefs.current[paneIndex]) {
                            editorRefs.current[paneIndex] = {};
                          }
                          if (!editorRefs.current[paneIndex][tab.id]) {
                            editorRefs.current[paneIndex][tab.id] = React.createRef();
                          }

                          return (
                            <div
                              key={tab.id}
                              className={`dinolabsIDETabItem ${
                                pane.activeTabId === tab.id && unsavedChanges[tab.id]
                                  ? "activeUnsavedTab"
                                  : pane.activeTabId === tab.id
                                  ? "activeTab"
                                  : unsavedChanges[tab.id]
                                  ? "unsavedTab"
                                  : ""
                              }`}
                              onClick={() => switchTab(paneIndex, tab.id)}
                              draggable={true}
                              onDragStart={(e) => handleDragStart(e, paneIndex, tab.id)}
                              style={{ width: "fit-content" }} 
                            >
                              {unsavedChanges[tab.id] && (
                                <Tippy content="Unsaved" theme="tooltip-light">
                                  <span className="dinolabsIDEFileUnsavedDot" />
                                </Tippy>
                              )}
                              {getFileIcon(tab.name)}
                              {tab.name}
                              <span
                                className="dinolabsIDECloseTab"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  closeTab(paneIndex, tab.id);
                                }}
                              >
                                ×
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="dinolabsIDETabItem activeTab">
                          <FontAwesomeIcon icon={faWandMagicSparkles}/>
                          Get Started
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            )}
            
            {(!isAccountOpen) && (
              <div
                className="dinolabsIDEMarkdownWrapper"
                style={{ 
                  height: hasOpenFile ? `${markdownHeight}%` : '100%', 
                  zoom: zoomLevel,
                }}
              >
                {panes.map((pane, paneIndex) => (
                  <React.Fragment key={`pane-${paneIndex}`}>
                    <div
                      key={paneIndex}
                      className="dinolabsIDEMarkdownPaneWrapper"
                      style={{ 
                        width: panes.length > 1 ? `${paneWidths[`pane${paneIndex + 1}`]}%` : '100%',
                      }}
                      onClick={() => setActivePaneIndex(paneIndex)}
                    >
                      <div className="dinolabsIDEMarkdownPaneFlex">
                        {pane.openedTabs.length > 0 ? (
                          pane.openedTabs.map(tab => (
                            <div
                              key={tab.id}
                              className="dinolabsIDEMarkdownPane"
                              style={{
                                display: pane.activeTabId === tab.id ? 'block' : 'none',
                              }}
                            >
                              <DinoLabsIDEMarkdown
                                fileContent={tab.content}
                                detectedLanguage={tab.language}
                                forceOpen={tab.forceOpen}
                                onForceOpen={() => handleForceOpenTab(paneIndex, tab.id)}
                                searchTerm={tab.searchTerm}
                                setSearchTerm={(term) => setTabSearchTerm(paneIndex, tab.id, term)}
                                replaceTerm={tab.replaceTerm}
                                setReplaceTerm={(term) => setTabReplaceTerm(paneIndex, tab.id, term)}
                                searchPositions={tab.searchPositions}
                                setSearchPositions={(positions) => setTabSearchPositions(paneIndex, tab.id, positions)}
                                currentSearchIndex={tab.currentSearchIndex}
                                setCurrentSearchIndex={(index) => setTabCurrentSearchIndex(paneIndex, tab.id, index)}
                                onSplit={splitTab}
                                disableSplit={panes.length >= 2 || pane.openedTabs.length <= 1} 
                                paneIndex={paneIndex}
                                tabId={tab.id}
                                isSearchOpen={tab.isSearchOpen}
                                isReplaceOpen={tab.isReplaceOpen}
                                setTabSearchOpen={(isOpen) => setTabSearchOpen(paneIndex, tab.id, isOpen)}
                                setTabReplaceOpen={(isOpen) => setTabReplaceOpen(paneIndex, tab.id, isOpen)}
                                ref={editorRefs.current[paneIndex][tab.id]}
                                onEdit={handleEdit}
                                onSave={handleSave}
                                fileHandle={tab.fileHandle}
                                isGlobalSearchActive={!!globalSearchQuery}
                                lintProblems={lintProblems}
                                keyBinds={keyBinds}
                                zoomLevel={zoomLevel}
                                colorTheme={colorTheme}
                              />
                            </div>
                          ))
                        ) : (
                          <div className="dinolabsIDENoFileSelectedWrapper">

                            <div className="dinolabsIDEGetStartedStack">
                              <div className="dinolabsIDEGetStartedFlex">
                                <div className="dinolabsIDEGetStartedWrapper">
                                  <label className="dinolabsIDETitle"> 
                                    Dino Labs Web Developer
                                  </label>
                                  <label className="dinolabsIDESubtitle"> 
                                    Version 1.0.0 (Beta)
                                  </label>
                                  <div className="vevktorIDEStartButtonWrapper"> 
                                    <button className="dinolabsIDEStartButton" onClick={handleLoadRepository}> 
                                      <FontAwesomeIcon icon={faAngleDown}/>
                                      Import a Directory
                                    </button>
                                    <button className="dinolabsIDEStartButton" onClick={handleFileLoad}> 
                                      <FontAwesomeIcon icon={faCode}/>
                                      Open a File
                                    </button>
                                    <button className="dinolabsIDEStartButton" onClick={handleCloneGithubRepository}> 
                                      <FontAwesomeIcon icon={faGithub}/>
                                      Clone a GitHub Repository
                                    </button>
                                  </div>
                                </div>

                                <div className="dinolabsIDEGetStartedWrapper">
                                    <div className="dinolabsIDEUsageLanguagesContainer">
                                        {usageLanguages.length === 0 ? (
                                            <p className="dinolabsIDELanguageUsageUnavailable">No data available.</p>
                                        ) : (

                                            <ul className="dinolabsIDEUsageLanguageList">
                                                {usageLanguages.slice(0, 5).map((language) => {
                                                    const percentage = (language.count / usageLanguages.reduce((acc, lang) => acc + lang.count, 0)) * 100;
                                                    const languageColors = {
                                                      Javascript: "#f1c40f",  // Bright Yellow
                                                      Typescript: "#3178c6",  // Light Blue
                                                      HTML: "#e34c26",        // Orange-Red
                                                      CSS: "#2965f1",         // Bright Blue
                                                      JSON: "#8e44ad",        // Purple
                                                      XML: "#1abc9c",         // Teal
                                                      Python: "#3572a5",      // Deep Blue
                                                      PHP: "#8993be",         // Light Purple
                                                      Swift: "#ffac45",       // Orange
                                                      C: "#a8b9cc",           // Light Gray-Blue
                                                      "C++": "#f34b7d",       // Pinkish Red
                                                      "C#": "#178600",        // Green
                                                      Rust: "#dea584",        // Tan/Orange
                                                      Bash: "#4eaa25",        // Green
                                                      Shell: "#89e051",       // Light Green
                                                      "Monkey C": "#f45b69",  // Coral
                                                      SQL: "#c5b7db",         // Lavender
                                                      Assembly: "#5d9ca3",    // Light Blue-Green
                                                      default: "#95a5a6",     // Neutral Gray (for unknown languages)
                                                    };
                                                    const color = languageColors[language.language] || languageColors.default;

                                                    return (
                                                      <li key={language.language} className="dinolabsIDELanguageItem">
                                                          <div className="dinolabsIDELanguageLabel">
                                                              {language.language}
                                                              <span>{percentage.toFixed(1)}%</span>
                                                          </div>

                                                          <div
                                                              className="dinolabsIDELanguageBar"
                                                              style={{
                                                                  width: `${percentage}%`, 
                                                                  backgroundColor: color, 
                                                              }}
                                                          ></div>
                                                      </li>
                                                  );
                                                })}
                                            </ul>
                                        )}
                                    </div>
                                </div>





                              </div>

                              <LinePlot
                                    plotType="getStartedPageUsagePlot"
                                    data={personalUsageByDay}
                                />
                            </div>



                          </div>
                        )}
                      </div>
                    </div>

                    {paneIndex < panes.length - 1 && (
                      <div 
                        className="resizablePaneDivider"
                        onMouseDown={handleMouseDownPane}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            {hasOpenFile && (!isAccountOpen) && (
              <>
                <div className="draggableConsoleDivider" onMouseDown={handleMouseDownHeight} />
                <div
                  className="dinolabsIDEConsoleWrapper"
                  style={{ height: `${consoleHeight}%` }}
                >
                  <DinoLabsIDEDebug 
                      code={panes[activePaneIndex].openedTabs.find(tab => tab.id === panes[activePaneIndex].activeTabId).content}
                      language={panes[activePaneIndex].openedTabs.find(tab => tab.id === panes[activePaneIndex].activeTabId).language}
                      onProblemClick={handleProblemClick}
                      onProblemsDetected={handleProblemsDetected} 
                  />

                </div>
              </>
            )}

            {(!isAccountOpen) && (
              <div className="bottomIDEControlBar" />
            )}

            {isAccountOpen && (
              <DinoLabsIDEAccount onClose={() => setIsAccountOpen(false)} 
                keyBinds={keyBinds}
                setKeyBinds={setKeyBinds}
                zoomLevel={zoomLevel}
                setZoomLevel={setZoomLevel}
                colorTheme={colorTheme}
                setColorTheme={setColorTheme}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DinoLabsIDE;
