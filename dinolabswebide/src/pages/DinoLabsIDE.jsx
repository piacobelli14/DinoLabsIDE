import React, { useState, useEffect, useRef } from "react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import DinoLabsIDEMarkdown from "./DinoLabsIDECode/DinoLabsIDEMarkdown.jsx";
import DinoLabsIDETabularEditor from "./DinoLabsIDETabular/DinoLabsIDETabularEditor.jsx"; 
import DinoLabsIDERichTextEditor from "./DinoLabsIDEText/DinoLabsIDERichTextEditor.jsx"; 
import DinoLabsIDEImageEditor from "./DinoLabsIDEMedia/DinoLabsIDEImageEditor.jsx"; 
import DinoLabsIDEVideoEditor from "./DinoLabsIDEMedia/DinoLabsIDEVideoEditor.jsx"; 
import DinoLabsIDEAudioEditor from "./DinoLabsIDEMedia/DinoLabsIDEAudioEditor.jsx"; 
import DinoLabsIDEAccount from "./DinoLabsIDEAccount/DinoLabsIDEAccount.jsx";
import { showDialog } from "./DinoLabsIDEAlert.jsx";
import "../styles/mainStyles/DinoLabsIDE.css";
import "../styles/mainStyles/DinoLabsIDEUnavailable.css";
import "../styles/mainStyles/MirrorThemes/DefaultTheme.css";
import "../styles/mainStyles/MirrorThemes/DarkTheme.css";
import "../styles/mainStyles/MirrorThemes/LightTheme.css";
import "../styles/helperStyles/Tooltip.css";
import "../styles/helperStyles/LoadingSpinner.css";
import "../styles/helperStyles/HighlightKill.css";
import useAuth from "../UseAuth";
import LinePlot from "../helpers/PlottingHelpers/LineHelper.jsx";
import DoughnutPlot from "../helpers/PlottingHelpers/DoughnutHelper.jsx";
import DinoLabsNav from "../helpers/DinoLabsNav.jsx";
import { FixedSizeList as List } from 'react-window';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
  faChevronRight,
  faFolderOpen
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
  js: "Javascript",
  jsx: "Javascript",
  ts: "Typescript",
  tsx: "Typescript",
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
  webm: "videoExtension.svg",
  zip: "archiveExtensions.svg",
  rar: "archiveExtensions.svg",
  tar: "archiveExtensions.svg",
  gz: "archiveExtensions.svg",
  default: "unknownExtension.svg",
  cache: "cacheExtensions.svg",
  tmp: "cacheExtensions.svg",
  temp: "cacheExtensions.svg",
  bak: "cacheExtensions.svg",
  dockerfile: "dockerfileExtension.svg",
  makefile: "makefileExtension.svg", 
  git: "githubExtension.svg"
};

const markdownExtensions = [
  'js', 'jsx', 'ts', 'tsx', 'html', 'css',
  'py', 'java', 'rb', 'php', 'swift', 'c', 'cpp', 'h', 'cs', 'rs', 'bash', 'sh', 'zsh',
  'mc', 'mcgen', 'asm', 'sql', 'xml', 'json',
  'dockerfile', 'makefile'
];

const textExtensions = {
  richText: ['txt', 'md'],
};

const mediaExtensions = {
  image: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'bmp'],
  video: ['mp4', 'mkv', 'avi', 'mov', 'webm'],
  audio: ['mp3', 'wav', 'flac']
};

const tabularExtensions = {
  tabular: ['csv']
}; 

const getFileIcon = (filename) => {
  let extension;
  const lowerFilename = filename.toLowerCase();

  if (lowerFilename === "dockerfile") {
    extension = "dockerfile";
  } else if (lowerFilename === "makefile") {
    extension = "makefile"; 
  } else if (lowerFilename.startsWith('.git')) {
    extension = "git"
  } else {
    const parts = filename.split('.');
    extension = parts.length > 1 ? parts.pop().toLowerCase() : 'default';
  }

  const imageName = extensionToImageMap[extension] || extensionToImageMap['default'];

  return (
    <img
      src={`/language-images/${imageName}`}
      alt={`${extension} icon`}
      className="dinolabsIDEFileIcon"
    />
  );
};

const prefixPath = (rootDirectoryName, path) => {
  if (path.startsWith(rootDirectoryName)) {
    return path;
  }
  return `${rootDirectoryName}/${path}`;
};

const DinoLabsIDE = () => {
  const { token, userID, organizationID, loading } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [screenSize, setScreenSize] = useState(window.innerWidth);
  const [resizeTrigger, setResizeTrigger] = useState(false);
  const debounceRef = useRef(null);
  const [directoryWidth, setDirectoryWidth] = useState(20);
  const [contentWidth, setContentWidth] = useState(80);
  const [markdownHeight, setMarkdownHeight] = useState(90);
  const [consoleHeight, setConsoleHeight] = useState(0);
  const [isDraggingWidth, setIsDraggingWidth] = useState(false);
  const [isDraggingHeight, setIsDraggingHeight] = useState(false);
  const [isDraggingPane, setIsDraggingPane] = useState(false);
  const [paneWidths, setPaneWidths] = useState({ pane1: 50, pane2: 50 });
  const [repositoryFiles, setRepositoryFiles] = useState([]);
  const [openedDirectories, setOpenedDirectories] = useState({});
  const [rootDirectoryName, setRootDirectoryName] = useState("");
  const [rootDirectoryHandle, setRootDirectoryHandle] = useState(null);
  const [isRootOpen, setIsRootOpen] = useState(false);
  const [panes, setPanes] = useState([{ openedTabs: [], activeTabId: null }]);
  const [activePaneIndex, setActivePaneIndex] = useState(0);
  const panesRef = useRef(panes);
  const editorRefs = useRef({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState({});
  const [originalContents, setOriginalContents] = useState({});
  const [modifiedContents, setModifiedContents] = useState({});
  const [isNavigatorState, setIsNavigatorState] = useState(true);
  const [isNavigatorLoading, setIsNavigatorLoading] = useState(false);
  const [isSearchState, setIsSearchState] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [globalReplaceTerm, setGlobalReplaceTerm] = useState("");
  const [globalSearchResults, setGlobalSearchResults] = useState([]);
  const [isGlobalReplace, setIsGlobalReplace] = useState(false);
  const [isCaseSensitiveSearch, setIsCaseSensitiveSearch] = useState(true);
  const [isPlotRendered, setIsPlotRendered] = useState(false);
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
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuTarget, setContextMenuTarget] = useState(null);
  const contextMenuRef = useRef(null);
  const [flattenedDirectoryList, setFlattenedDirectoryList] = useState([]);
  const [flattenedSearchList, setFlattenedSearchList] = useState([]);
  const [dragOverId, setDragOverId] = useState(null);
  const loadDirectoryContents = async (directoryHandle, parentPath) => {
    const promises = [];
    for await (const [name, entry] of directoryHandle.entries()) {
      if (entry.kind === "directory") {
        const fullPath = `${parentPath}/${name}`;
        promises.push(Promise.resolve({ name, type: "directory", handle: entry, fullPath, files: undefined }));
      } else {
        promises.push((async () => {
          const fileObj = await entry.getFile();
          const safeName = fileObj.name; 
          const fullPath = `${parentPath}/${safeName}`;
          return { name: safeName, type: "file", handle: entry, fullPath };
        })());
      }
    }
    const results = await Promise.all(promises);
    return results.filter(item => item !== null);
  };

  const updateTreeWithDirectoryContents = (tree, targetPath, children) => {
    return tree.map(node => {
      if (node.fullPath === targetPath) {
        return { ...node, files: children };
      } else if (node.type === 'directory' && node.files) {
        return { ...node, files: updateTreeWithDirectoryContents(node.files, targetPath, children) };
      } else {
        return node;
      }
    });
  };

  const getVirtualizedItemHeight = (size) => {
    if (size < 499) {
      return 18;
    } else if (size >= 500 && size <= 699) {
      return 18;
    } else if (size >= 700 && size <= 1299) {
      return 20;
    } else if (size >= 1300 && size <= 1499) {
      return 24;
    } else if (size >= 1500 && size <= 2199) {
      return 30;
    } else if (size >= 2200 && size <= 2599) {
      return 40;
    } else if (size >= 2600 && size <= 3899) {
      return 65;
    } else if (size >= 3900 && size <= 5299) {
      return 75;
    } else {
      return 18;
    }
  };

  const mediaExtensionsToDisable = [...mediaExtensions.image, ...mediaExtensions.video, ...mediaExtensions.audio];
  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsLoaded(false);
      setScreenSize(window.innerWidth);
      setResizeTrigger(prev => !prev);
      setTimeout(() => setIsLoaded(true), 300);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const flattenTree = (files, parentPath, level = 0, isParentVisible = true, output = []) => {
    files.forEach((item) => {
      const directoryKey = prefixPath("", item.fullPath || `${parentPath}/${item.name}`);
      const isDir = item.type === "directory";
      const isOpen = openedDirectories[directoryKey] || false;
      const isVisible = isParentVisible && (isRootOpen || parentPath === "");
      output.push({
        id: directoryKey,
        name: item.name,
        type: item.type,
        fullPath: directoryKey,
        level: level,
        isVisible: isVisible,
        isOpen: isDir ? isOpen : false,
        handle: item.handle
      });
      if (isDir && isOpen && item.files && item.files.length > 0) {
        flattenTree(item.files, item.fullPath, level + 1, isVisible && isOpen, output);
      }
    });
    return output;
  };

  useEffect(() => {
    if (!rootDirectoryName) {
      setFlattenedDirectoryList([]);
      return;
    }
    const filtered = searchQuery
      ? repositoryFiles.filter(file => file.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : repositoryFiles;
    const flatList = flattenTree(filtered, "", 0, true, []);
    setFlattenedDirectoryList(flatList);
  }, [repositoryFiles, openedDirectories, isRootOpen, rootDirectoryName, searchQuery]);

  const flattenSearchResults = (resultsByFile, collapsedMap) => {
    const output = [];
    Object.entries(resultsByFile).forEach(([filePath, results]) => {
      output.push({
        type: 'fileHeader',
        filePath,
        isCollapsed: collapsedMap[filePath] || false
      });
      if (!collapsedMap[filePath]) {
        results.forEach((res) => {
          output.push({
            type: 'lineMatch',
            filePath,
            lineNumber: res.lineNumber,
            lineContent: res.lineContent
          });
        });
      }
    });
    return output;
  };

  useEffect(() => {
    if (globalSearchResults.length === 0) {
      setFlattenedSearchList([]);
      return;
    }
    const resultsByFile = globalSearchResults.reduce((acc, result) => {
      if (!acc[result.filePath]) {
        acc[result.filePath] = [];
      }
      acc[result.filePath].push(result);
      return acc;
    }, {});
    const newList = flattenSearchResults(resultsByFile, collapsedFiles);
    setFlattenedSearchList(newList);
  }, [globalSearchResults, collapsedFiles]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchUserInfo(userID, organizationID),
          fetchPersonalUsageData(userID, organizationID)
        ]);
        setIsLoaded(true);
      } catch (error) {
        return;
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
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ userID, organizationID }),
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
      return;
    }
  };

  const fetchPersonalUsageData = async (userID, organizationID) => {
    setIsPlotRendered(false);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found in localStorage");
      }
      const response = await fetch("https://www.dinolaboratories.com/dinolabs/dinolabs-web-api/usage-info", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ userID, organizationID }),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      const data = await response.json();
      if (!data.personalUsageInfo || !Array.isArray(data.personalUsageInfo)) {
        throw new Error("Unexpected data structure from the backend");
      } else {
        setIsPlotRendered(true);
      }
      setPersonalUsageByDay(
        data.personalUsageInfo.map((item) => ({
          day: new Date(item.day),
          count: parseInt(item.usage_count, 10),
        }))
      );
      if (!data.usageLanguages || !Array.isArray(data.usageLanguages)) {
        throw new Error("Unexpected usageLanguages data structure from the backend");
      }
      setUsageLanguages(
        data.usageLanguages.map((item) => ({
          language: item.language,
          count: parseInt(item.language_count, 10),
        }))
      );
    } catch (error) {
      return;
    }
  };

  useEffect(() => {
    panesRef.current = panes;
  }, [panes]);

  const directoryRef = useRef(null);
  const contentRef = useRef(null);

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
      setPaneWidths({ pane1: newPaneWidth, pane2: 100 - newPaneWidth });
    }
  };
  const handleMouseUpPane = () => setIsDraggingPane(false);

  const handleLoadRepository = async () => {
    try {
      setIsNavigatorLoading(true);
      const directoryHandle = await window.showDirectoryPicker();
      const rootName = directoryHandle.name;
      setRootDirectoryHandle(directoryHandle);
      setRootDirectoryName(rootName);
      const files = await loadDirectoryContents(directoryHandle, rootName);
      setRepositoryFiles(files);
      setIsRootOpen(true);
      setIsNavigatorLoading(false);
    } catch (error) {
      setIsNavigatorLoading(false);
      return;
    }
  };

  const getDirectoryHandleByPath = async (path) => {
    const fullPath = prefixPath(rootDirectoryName, path);
    if (!rootDirectoryHandle) return null;
    if (fullPath === rootDirectoryName || fullPath === `${rootDirectoryName}/`) return rootDirectoryHandle;
    const parts = fullPath.replace(`${rootDirectoryName}/`, '').split('/').filter(part => part);
    let currentHandle = rootDirectoryHandle;
    for (const part of parts) {
      try {
        currentHandle = await currentHandle.getDirectoryHandle(part, { create: false });
      } catch (error) {
        return null;
      }
    }
    return currentHandle;
  };

  const reloadDirectory = async () => {
    if (!rootDirectoryHandle) return;
    const newFiles = await loadDirectoryContents(rootDirectoryHandle, rootDirectoryName);
    setRepositoryFiles(newFiles);
  };

  const handleLoadFile = async () => {
    try {
      const [fileHandle] = await window.showOpenFilePicker({ multiple: false });
      const fileId = prefixPath(rootDirectoryName, fileHandle.name);
      const parts = fileHandle.name.split('.');
      const extension = parts.length > 1 ? parts.pop().toLowerCase() : '';
      const lowerName = fileHandle.name.toLowerCase();
      const language = (lowerName === "dockerfile") ? "Dockerfile" :
                        (lowerName === "makefile") ? "Makefile" :
                        extensionToLanguageMap[extension] || "Unknown";
      let mediaType = null;
      for (const type in mediaExtensions) {
        if (mediaExtensions[type].includes(extension)) {
          mediaType = type;
          break;
        }
      }
      let content;
      if (!mediaType) {
        if (modifiedContents[fileId]) {
          content = modifiedContents[fileId];
        } else {
          const file = await fileHandle.getFile();
          content = await file.text();
        }
      }
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
      if (mediaType) {
        const newTab = {
          id: fileId,
          name: fileHandle.name,
          isMedia: true,
          fileHandle: fileHandle
        };
        setPanes(prevPanes => {
          const newPanes = [...prevPanes];
          newPanes[activePaneIndex].openedTabs.push(newTab);
          newPanes[activePaneIndex].activeTabId = newTab.id;
          return newPanes;
        });
        setOriginalContents(prev => ({ ...prev, [fileId]: null }));
        setUnsavedChanges(prev => ({ ...prev, [fileId]: false }));
        return;
      } else {
        const language = extensionToLanguageMap[extension] || "Unknown";
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
      }
    } catch (error) {
      return;
    }
  };

  const handleFileClick = async (file, parentPath) => {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    let mediaType = null;
    for (const type in mediaExtensions) {
      if (mediaExtensions[type].includes(fileExtension)) {
        mediaType = type;
        break;
      }
    }
    const fileId = prefixPath(rootDirectoryName, file.fullPath || `${parentPath}/${file.name}`);
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
    if (mediaType) {
      const newTab = {
        id: fileId,
        name: file.name,
        isMedia: true,
        fileHandle: file.handle
      };
      setPanes(prevPanes => {
        const newPanes = [...prevPanes];
        newPanes[activePaneIndex].openedTabs.push(newTab);
        newPanes[activePaneIndex].activeTabId = newTab.id;
        return newPanes;
      });
      setOriginalContents(prev => ({ ...prev, [fileId]: null }));
      setUnsavedChanges(prev => ({ ...prev, [fileId]: false }));
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
        content = markdownExtensions.includes(fileExtension)
          ? "Error reading file content."
          : "The content of this file type could not be automatically detected. Try to open it anyway.";
      }
      const lowerName = file.name.toLowerCase();
      const language = (lowerName === "dockerfile") ? "Dockerfile" :
                      (lowerName === "makefile") ? "Makefile" :
                      extensionToLanguageMap[fileExtension] || "Unknown";
      const newTab = {
        id: fileId,
        name: file.name,
        content: content,
        language: markdownExtensions.includes(fileExtension) ? language : "Unknown",
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
    } catch (error) {
      const newTab = {
        id: fileId,
        name: file.name,
        content: markdownExtensions.includes(fileExtension)
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

  const toggleDirectory = async (directoryKey) => {
    setOpenedDirectories(prev => ({
      ...prev,
      [directoryKey]: !prev[directoryKey],
    }));
    if (!openedDirectories[directoryKey]) {
      const findNode = (nodes) => {
        for (let node of nodes) {
          if (node.fullPath === directoryKey) return node;
          if (node.type === 'directory' && node.files) {
            const result = findNode(node.files);
            if (result) return result;
          }
        }
        return null;
      };
      const node = findNode(repositoryFiles);
      if (node && node.files === undefined && node.handle) {
        const children = await loadDirectoryContents(node.handle, node.fullPath);
        setRepositoryFiles(prevTree => updateTreeWithDirectoryContents(prevTree, directoryKey, children));
      }
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

  const closeTab = async (paneIndex, tabId) => {
    if (unsavedChanges[tabId]) {
      const alertResult = await showDialog({
        title: 'System Alert',
        message: 'You have unsaved changes in this file. Are you sure you want to close it?',
        showCancel: true
      });
      if (alertResult === null) {
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
                    filePath: prefixPath(rootDirectoryName, file.fullPath),
                    lineNumber: index + 1,
                    lineContent: line
                  });
                }
              } else {
                if (line.toLowerCase().includes(globalSearchQuery.toLowerCase())) {
                  results.push({
                    filePath: prefixPath(rootDirectoryName, file.fullPath),
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
    const confirmationMessage = `Are you sure you want to replace ${totalMatches} ${totalMatches === 1 ? 'occurrence' : 'occurrences'
      } of "${globalSearchQuery}" across ${filesWithMatches} ${filesWithMatches === 1 ? 'file' : 'files'}?`;
    const alertResult = await showDialog({
      title: 'System Alert',
      message: confirmationMessage,
      showCancel: true
    });
    if (alertResult === null) {
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
                  setUnsavedChanges(prev => ({ ...prev, [file.fullPath]: false }));
                } catch (writeError) {
                  setUnsavedChanges(prev => ({ ...prev, [file.fullPath]: true }));
                }
              } else {
                setUnsavedChanges(prev => ({ ...prev, [file.fullPath]: true }));
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
    setModifiedContents(prev => ({ ...prev, ...updatedFiles }));
    setPanes(prevPanes => {
      const newPanes = prevPanes.map(pane => {
        const updatedTabs = pane.openedTabs.map(tab => {
          if (updatedFiles[prefixPath(rootDirectoryName, tab.id)]) {
            return { ...tab, content: updatedFiles[prefixPath(rootDirectoryName, tab.id)] };
          }
          return tab;
        });
        return { ...pane, openedTabs: updatedTabs };
      });
      return newPanes;
    });
    performGlobalSearch();
  };

  const toggleCollapse = (filePath) => {
    const prefixedPath = prefixPath(rootDirectoryName, filePath);
    setCollapsedFiles(prev => ({
      ...prev,
      [prefixedPath]: !prev[prefixedPath]
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
    const prefixedFilePath = prefixPath(rootDirectoryName, filePath);
    let targetPaneIndex = -1;
    let targetTab = null;
    panes.forEach((pane, paneIndex) => {
      const tab = pane.openedTabs.find(tab => tab.id === prefixedFilePath);
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
          if (t.id === prefixedFilePath) {
            return { ...t, searchTerm: globalSearchQuery, isSearchOpen: false };
          }
          return t;
        });
        thePane.activeTabId = targetTab.id;
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
          let fileHandle = await getFileHandleByPath(repositoryFiles, prefixedFilePath);
          if (!fileHandle) {
            try {
              const [pickedFile] = await window.showOpenFilePicker({
                multiple: false,
                suggestedName: prefixedFilePath.split('/').pop(),
              });
              if (pickedFile) {
                fileHandle = pickedFile;
              }
            } catch (err) {
              return;
            }
          }
          if (!fileHandle) {
            return;
          }
          const fileData = await fileHandle.getFile();
          content = await fileData.text();
          const parts = prefixedFilePath.split('.');
          const extension = parts.length > 1 ? parts.pop().toLowerCase() : '';
          const language = extensionToLanguageMap[extension] || "Unknown";
          const newTabId = prefixedFilePath;
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
                  return { ...t, searchTerm: globalSearchQuery, isSearchOpen: false };
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
            name: prefixedFilePath.split('/').pop(),
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
            fullPath: prefixedFilePath
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
          return;
        }
      };
      handleOpenAndJump();
    }
  };

  const getFileHandleByPath = async (files, filePath) => {
    const prefixedPath = prefixPath(rootDirectoryName, filePath);
    for (const file of files) {
      if (file.type === 'file' && file.fullPath === prefixedPath) {
        return file.handle;
      } else if (file.type === 'directory') {
        const handle = await getFileHandleByPath(file.files, filePath);
        if (handle) return handle;
      }
    }
    return null;
  };

  const createNewFile = async () => {
    if (!contextMenuTarget) return;
    const { type: itemType, path } = contextMenuTarget;
    const alertResult = await showDialog({
      title: 'Create New File',
      message: 'Enter the name of your new file:',
      inputs: [{ name: 'fileName', type: 'text', label: '', defaultValue: '' }],
      showCancel: true
    });
    const fileName = alertResult && alertResult.fileName;
    if (!fileName) return;
    const dirHandle = await getDirectoryHandleByPath(path);
    if (!dirHandle) {
      return;
    }
    let fileExists = false;
    for await (const entry of dirHandle.values()) {
      if (entry.name.toLowerCase() === fileName.toLowerCase()) {
        fileExists = true;
        break;
      }
    }
    if (fileExists) {
      const alertResult = await showDialog({
        title: 'System Alert',
        message: `A file named "${fileName}" already exists in this directory.`,
        inputs: [],
        showCancel: false
      });
      return;
    }
    try {
      await dirHandle.getFileHandle(fileName, { create: true });
      await reloadDirectory();
    } catch (error) {
      return;
    }
    setContextMenuVisible(false);
  };

  const createNewFolder = async () => {
    if (!contextMenuTarget) return;
    const { type: itemType, path } = contextMenuTarget;
    const alertResult = await showDialog({
      title: 'Create New Directory',
      message: 'Enter the name of your new directory:',
      inputs: [{ name: 'folderName', type: 'text', label: '', defaultValue: '' }],
      showCancel: true
    });
    const folderName = alertResult && alertResult.folderName;
    if (!folderName) return;
    const dirHandle = await getDirectoryHandleByPath(path);
    if (!dirHandle) {
      return;
    }
    let folderExists = false;
    for await (const entry of dirHandle.values()) {
      if (entry.name.toLowerCase() === folderName.toLowerCase()) {
        folderExists = true;
        break;
      }
    }
    if (folderExists) {
      const alertResult = await showDialog({
        title: 'System Alert',
        message: `A folder named "${folderName}" already exists in this directory.`,
        inputs: [],
        showCancel: false
      });
      return;
    }
    try {
      await dirHandle.getDirectoryHandle(folderName, { create: true });
      await reloadDirectory();
    } catch (error) {
      return;
    }
    setContextMenuVisible(false);
  };

  const deleteItem = async () => {
    if (!contextMenuTarget) return;
    const { type: itemType, path } = contextMenuTarget;
    const splitted = path.split('/');
    const itemName = splitted.pop();
    const parentPath = splitted.join('/');
    const confirmationMessage = `Are you sure you want to delete the ${itemType} "${itemName}"?`;
    const alertResult = await showDialog({
      title: 'Confirm Delete',
      message: confirmationMessage,
      showCancel: true
    });
    if (alertResult === null) return;
    const dirHandle = await getDirectoryHandleByPath(parentPath);
    if (!dirHandle) {
      return;
    }
    try {
      await dirHandle.removeEntry(itemName, { recursive: itemType === 'directory' });
      await reloadDirectory();
    } catch (error) {
      return;
    }
    setContextMenuVisible(false);
  };

  const handleContextMenu = (e, target) => {
    e.preventDefault();
    e.stopPropagation();
    if (!rootDirectoryName) {
      return;
    }
    let xPos = e.clientX;
    let yPos = e.clientY;
    setContextMenuVisible(true);
    setContextMenuPosition({ x: xPos, y: yPos });
    setContextMenuTarget(target);
  };

  const copyRelativePathToClipboard = () => {
    if (contextMenuTarget) {
      const { path } = contextMenuTarget;
      const pathWithSlash = path.endsWith('/') ? path : path + '/';
      navigator.clipboard.writeText(pathWithSlash)
        .then(() => { setContextMenuVisible(false); })
        .catch(err => { return; });
    }
  };

  useEffect(() => {
    if (contextMenuVisible && contextMenuRef.current) {
      const menu = contextMenuRef.current;
      const { innerWidth, innerHeight } = window;
      const { x, y } = contextMenuPosition;
      const menuRect = menu.getBoundingClientRect();
      let newX = x;
      let newY = y;
      const margin = 10;
      if (x + menuRect.width > innerWidth) {
        newX = innerWidth - menuRect.width - margin;
      }
      if (y + menuRect.height > innerHeight) {
        newY = innerHeight - menuRect.height - margin;
      }
      newX = Math.max(newX, margin);
      newY = Math.max(newY, margin);
      if (newX !== x || newY !== y) {
        setContextMenuPosition({ x: newX, y: newY });
      }
    }
  }, [contextMenuVisible, contextMenuPosition]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setContextMenuVisible(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape' && contextMenuVisible) {
        setContextMenuVisible(false);
      }
    };
    window.addEventListener('click', handleClickOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [contextMenuVisible]);

  const handleItemDragStart = (e, item) => {
    e.dataTransfer.setData("application/my-app", JSON.stringify({ path: item.fullPath, type: item.type }));
  };

  const handleItemDrop = async (e, targetDirItem) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("application/my-app");
    if (!data) return;
    const { path: sourcePath, type: sourceType } = JSON.parse(data);
    const targetDirHandle = await getDirectoryHandleByPath(targetDirItem.fullPath);
    if (!targetDirHandle) return;
    if (sourceType === "directory" && sourcePath.startsWith(targetDirItem.fullPath)) {
      const alertResult = await showDialog({
        title: 'System Alert',
        message: "Cannot move a directory into itself or its subdirectory.",
        inputs: [],
        showCancel: false
      });
      return;
    }
    let exists = false;
    for await (const entry of targetDirHandle.values()) {
      if (entry.name.toLowerCase() === sourcePath.split('/').pop().toLowerCase()) {
        exists = true;
        break;
      }
    }
    if (exists) {
      const alertResult = await showDialog({
        title: 'System Alert',
        message: "Target directory already contains an item with the same name.",
        inputs: [],
        showCancel: false
      });
      return;
    }
    if (sourceType === "file") {
      const sourceFileHandle = await getFileHandleByPath(repositoryFiles, sourcePath);
      if (!sourceFileHandle) return;
      const sourceFile = await sourceFileHandle.getFile();
      const destFileHandle = await targetDirHandle.getFileHandle(sourceFile.name, { create: true });
      const writable = await destFileHandle.createWritable();
      await writable.write(sourceFile);
      await writable.close();
      const parentPath = sourcePath.split('/').slice(0, -1).join('/');
      const parentDir = await getDirectoryHandleByPath(parentPath);
      await parentDir.removeEntry(sourceFile.name);
    } else if (sourceType === "directory") {
      const sourceDirHandle = await getDirectoryHandleByPath(sourcePath);
      if (!sourceDirHandle) return;
      const newDirHandle = await targetDirHandle.getDirectoryHandle(sourceDirHandle.name, { create: true });
      async function copyDirectory(srcDir, destDir) {
        for await (const entry of srcDir.values()) {
          if (entry.kind === "file") {
            const file = await entry.getFile();
            const destFileHandle = await destDir.getFileHandle(entry.name, { create: true });
            const writable = await destFileHandle.createWritable();
            await writable.write(file);
            await writable.close();
          } else if (entry.kind === "directory") {
            const newSubDir = await destDir.getDirectoryHandle(entry.name, { create: true });
            const subSrcDir = await srcDir.getDirectoryHandle(entry.name);
            await copyDirectory(subSrcDir, newSubDir);
          }
        }
      }
      await copyDirectory(sourceDirHandle, newDirHandle);
      const parentPath = sourcePath.split('/').slice(0, -1).join('/');
      const parentDir = await getDirectoryHandleByPath(parentPath);
      await parentDir.removeEntry(sourceDirHandle.name, { recursive: true });
    }
    await reloadDirectory();
  };

  const renderNavigatorRow = ({ index, style, data }) => {
    const item = data[index];
    if (!item.isVisible) {
      return <div style={{ ...style, display: 'none' }} />;
    }
    if (item.type === 'directory') {
      return (
        <div
          style={{
            ...style,
            background: dragOverId === item.id ? 'rgba(255,255,255,0.2)' : undefined
          }}
          className={`directoryListItem${item.level === 0 ? " rootDirectory" : ""}`}
          draggable={true}
          onDragStart={(e) => handleItemDragStart(e, item)}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={(e) => setDragOverId(item.id)}
          onDragLeave={(e) => setDragOverId(null)}
          onDrop={(e) => { setDragOverId(null); handleItemDrop(e, item); }}
          onClick={() => toggleDirectory(item.id)}
          onContextMenu={(e) => handleContextMenu(e, { type: 'directory', path: item.id })}
        >
          <span style={{ marginLeft: `${item.level * 1.2}em` }}>
            <FontAwesomeIcon icon={item.isOpen ? faAngleDown : faAngleRight} />
            {' '}
            {item.name}
            {unsavedChanges[item.id] && (
              <Tippy content="Unsaved" theme="tooltip-light">
                <span className="dinolabsIDEFileUnsavedDot" />
              </Tippy>
            )}
          </span>
        </div>
      );
    } else {
      return (
        <div
          style={style}
          className={`directoryListItem ${unsavedChanges[item.id] ? "dinolabsIDEFileUnsaved" : ""}`}
          draggable={true}
          onDragStart={(e) => handleItemDragStart(e, item)}
          onClick={() => {
            const parts = item.id.split('/');
            const parentPath = parts.slice(0, -1).join('/');
            handleFileClick({
              name: item.name,
              type: 'file',
              handle: item.handle,
              fullPath: item.fullPath
            }, parentPath);
          }}
          onContextMenu={(e) => handleContextMenu(e, { type: 'file', path: item.id })}
        >
          <span style={{ marginLeft: `${item.level * 1.2}em` }}>
            {unsavedChanges[item.id] && (
              <Tippy content="Unsaved" theme="tooltip-light">
                <span className="dinolabsIDEFileUnsavedDot" />
              </Tippy>
            )}
            {getFileIcon(item.name)}
            {item.name}
          </span>
        </div>
      );
    }
  };

  const renderSearchRow = ({ index, style, data }) => {
    const item = data[index];
    if (item.type === 'fileHeader') {
      const isCollapsed = item.isCollapsed;
      return (
        <div
          style={style}
          className="leadingDirectoryGlobalSearchResultFileHeader"
          onClick={() => toggleCollapse(item.filePath)}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              toggleCollapse(item.filePath);
            }
          }}
        >
          <FontAwesomeIcon
            icon={isCollapsed ? faChevronRight : faChevronDown}
            className="leadingDirectoryGlobalSearchChevron"
          />
          <strong>{item.filePath}</strong>
        </div>
      );
    } else {
      return (
        <li
          style={{ ...style, listStyle: 'none' }}
          className="leadingDirectoryGlobalSearchResultItem"
          onClick={() => handleSearchSuggestionClick(item.filePath, item.lineNumber)}
          dangerouslySetInnerHTML={{
            __html: `<strong>Line ${item.lineNumber}:</strong> ` +
              highlightResultSnippet(item.lineContent, globalSearchQuery, isCaseSensitiveSearch)
          }}
        />
      );
    }
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
      <DinoLabsNav activePage={"dinolabside"} />
      {(screenSize >= 700 && screenSize <= 5399) && isLoaded ? (
        <div className="dinolabsIDEHeaderContainer" style={{ height: "100%" }}>
          <div className="dinolabsIDEControlFlex">
            <div
              className="leadingIDEDirectoryStack"
              style={{ width: `${directoryWidth}%` }}
              ref={directoryRef}
              onContextMenu={(e) => handleContextMenu(e, { type: 'navigator', path: rootDirectoryName })}
            >
              <div className="leadingDirectoryTopBar">
                <div className="leadingDirectoryZoomButtonFlex" style={{ borderRight: "0.2vh solid rgba(255,255,255,0.1)" }}>
                  <Tippy content={"Zoom In"} theme="tooltip-light" placement="bottom">
                    <button className="leadingDirectoryZoomButton" onClick={handleZoomIn} disabled={!rootDirectoryName}>
                      <FontAwesomeIcon icon={faPlusSquare} />
                    </button>
                  </Tippy>
                  <Tippy content={"Zoom Out"} theme="tooltip-light" placement="bottom">
                    <button className="leadingDirectoryZoomButton" onClick={handleZoomOut} disabled={!rootDirectoryName}>
                      <FontAwesomeIcon icon={faMinusSquare} />
                    </button>
                  </Tippy>
                  <Tippy content={"Reset View"} theme="tooltip-light" placement="bottom">
                    <button className="leadingDirectoryZoomButton" onClick={handleResetZoomLevel} disabled={!rootDirectoryName}>
                      <FontAwesomeIcon icon={faRetweet} />
                    </button>
                  </Tippy>
                </div>
              </div>
              <div className="leadingDirectoryStack">
                <div className="leadingdDirectoryOperationsWrapper">
                  <div className="leadingDirectory" />
                  <button className="leadingDirectoryButton" onClick={handleLoadRepository}>
                    <FontAwesomeIcon icon={faFolderOpen} />
                    Import a Directory
                  </button>
                  <button className="leadingDirectoryButton" onClick={handleLoadFile}>
                    <FontAwesomeIcon icon={faCode} />
                    Import a File
                  </button>
                </div>
                <div className="leadingDirectoryTabsWrapper">
                  <button
                    className="leadingDirectoryTabButton"
                    style={{ backgroundColor: isNavigatorState ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.0)" }}
                    onClick={() => {
                      setIsSearchState(!isSearchState);
                      setIsNavigatorState(!isNavigatorState);
                    }}
                  >
                    Navigator
                  </button>
                  <button
                    className="leadingDirectoryTabButton"
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
                {isNavigatorState &&
                  (isNavigatorLoading ? (
                    <div className="leadingDirectoryFilesSupplement" style={{ textAlign: "center" }}>
                      <div className="loading-circle" />
                    </div>
                  ) : (
                    <div className="leadingDirectoryFiles">
                      {rootDirectoryName && (
                        <ul className="leadingDirectoryFileStack">
                          <li className="leadingDirectoryFileStackContent">
                            <div
                              onClick={() => setIsRootOpen(!isRootOpen)}
                              onContextMenu={(e) => handleContextMenu(e, { type: "directory", path: rootDirectoryName })}
                              className="directoryListItemRoot"
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => handleItemDrop(e, { fullPath: rootDirectoryName, type: "directory" })}
                            >
                              <FontAwesomeIcon icon={isRootOpen ? faAngleDown : faAngleRight} />
                              {rootDirectoryName}
                              {unsavedChanges[rootDirectoryName] && (
                                <Tippy content="Unsaved" theme="tooltip-light">
                                  <span className="dinolabsIDEFileUnsavedDot" />
                                </Tippy>
                              )}
                            </div>
                            {isRootOpen && flattenedDirectoryList.length > 0 && (
                              <div className="nestedDirectoryFileStack" style={{ height: "70vh", width: "100%" }}>
                                <List
                                  height={window.innerHeight * 0.65}
                                  itemCount={flattenedDirectoryList.length}
                                  itemSize={getVirtualizedItemHeight(screenSize)}
                                  width={"100%"}
                                  itemData={flattenedDirectoryList}
                                  className="nestedDirectoryFileStack"
                                >
                                  {renderNavigatorRow}
                                </List>
                              </div>
                            )}
                          </li>
                        </ul>
                      )}
                    </div>
                  ))}
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
                            <FontAwesomeIcon icon={faA} style={{ color: isCaseSensitiveSearch ? "#AD6ADD" : "" }} />
                          </button>
                        </Tippy>
                        <Tippy content={"Search Files"} theme="tooltip-light">
                          <button className="leadingDirectoryGlobalSearchButton" onClick={performGlobalSearch}>
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
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
                            <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
                          </button>
                        </Tippy>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="leadingDirectoryBottomBar">
                <div className="leadingDirectorySettingsButtonFlex" style={{ borderRight: "0.2vh solid rgba(255,255,255,0.1)" }}>
                  <Tippy content={"Account"} theme="tooltip-light">
                    <button
                      className="leadingDirectoryZoomButton"
                      onClick={() => { setIsAccountOpen(!isAccountOpen); }}
                    >
                      <FontAwesomeIcon icon={faUserCircle} style={{ color: isAccountOpen ? "#AD6ADD" : "" }} />
                    </button>
                  </Tippy>
                </div>
              </div>
            </div>
            <div className="resizableWidthDivider" onMouseDown={handleMouseDownWidth} />
            <div className="dinolabsIDEControlStack" style={{ width: `${contentWidth}%` }} ref={contentRef}>
              {(!isAccountOpen) && (
                <div className="topIDEControlBarWrapper">
                  {panes.map((pane, paneIndex) => (
                    <React.Fragment key={`pane-wrapper-${paneIndex}`}>
                      {(panes.length > 1 && paneIndex === 1) && (
                        <div className="resizablePaneDivider" />
                      )}
                      <div
                        className="topIDEControlBar"
                        style={{
                          height: "100%",
                          width: panes.length > 1 ? `${paneWidths[`pane${paneIndex + 1}`]}%` : "100%",
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
                                className={`dinolabsIDETabItem ${pane.activeTabId === tab.id && unsavedChanges[tab.id]
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
                                  onClick={(e) => { e.stopPropagation(); closeTab(paneIndex, tab.id); }}
                                >
                                  ×
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <div className="dinolabsIDETabItem activeTab">
                            <FontAwesomeIcon icon={faWandMagicSparkles} />
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
                    height: hasOpenFile ? `${markdownHeight}%` : "90%",
                    zoom: hasOpenFile ? zoomLevel : 1,
                  }}
                >
                  {panes.map((pane, paneIndex) => (
                    <React.Fragment key={`pane-${paneIndex}`}>
                      <div
                        key={paneIndex}
                        className="dinolabsIDEMarkdownPaneWrapper"
                        style={{
                          width: panes.length > 1 ? `${paneWidths[`pane${paneIndex + 1}`]}%` : "100%",
                        }}
                        onClick={() => setActivePaneIndex(paneIndex)}
                      >
                        <div className="dinolabsIDEMarkdownPaneFlex">
                          {pane.openedTabs.length > 0 ? (
                            pane.openedTabs.map(tab => (
                              <div
                                key={tab.id}
                                className="dinolabsIDEMarkdownPane"
                                style={{ display: pane.activeTabId === tab.id ? "block" : "none" }}
                              >
                                {tab.isMedia ? (
                                  <>
                                    {(['png', 'jpg', 'jpeg'].includes(tab.fileHandle.name.split('.').pop().toLowerCase())) && (
                                      <DinoLabsIDEImageEditor fileHandle={tab.fileHandle} />
                                    )}
                                    {(['mp4', 'mkv', 'avi', 'mov', 'webm'].includes(tab.fileHandle.name.split('.').pop().toLowerCase())) && (
                                      <DinoLabsIDEVideoEditor fileHandle={tab.fileHandle} />
                                    )}
                                    {(['mp3', 'wav', 'flac'].includes(tab.fileHandle.name.split('.').pop().toLowerCase())) && (
                                      <DinoLabsIDEAudioEditor fileHandle={tab.fileHandle} />
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {(['txt', 'md'].includes(tab.fileHandle.name.split('.').pop().toLowerCase())) && (
                                      <DinoLabsIDERichTextEditor 
                                        fileHandle={tab.fileHandle} 
                                        keyBinds={keyBinds}    
                                      />
                                    )}
                                    {(['csv'].includes(tab.fileHandle.name.split('.').pop().toLowerCase())) && (
                                      <DinoLabsIDETabularEditor 
                                        fileHandle={tab.fileHandle} 
                                        keyBinds={keyBinds}
                                      />
                                    )}
                                    {(!tab.fileHandle ||
                                      (!(
                                        ['txt', 'md'].includes(tab.fileHandle.name.split('.').pop().toLowerCase()) ||
                                        ['csv'].includes(tab.fileHandle.name.split('.').pop().toLowerCase())
                                      ))
                                    ) && (
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
                                        disableSplit={
                                          panes.length >= 2 ||
                                          pane.openedTabs.length <= 1 ||
                                          pane.openedTabs.some(innerTab => {
                                            if (innerTab.isMedia && innerTab.fileHandle?.name) {
                                              const ext = innerTab.fileHandle.name.split('.').pop().toLowerCase();
                                              return (
                                                mediaExtensions.image.includes(ext) ||
                                                mediaExtensions.video.includes(ext) ||
                                                mediaExtensions.audio.includes(ext)
                                              );
                                            }
                                            return false;
                                          })
                                        }
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
                                        keyBinds={keyBinds}
                                        colorTheme={colorTheme}
                                      />
                                    )}
                                  </>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="dinolabsIDENoFileSelectedWrapper">
                              <div className="dinolabsIDEGetStartedStack">
                                <div className="dinolabsIDEGetStartedFlex">
                                  <div className="dinolabsIDEGetStartedWrapperInfo">
                                    <label className="dinolabsIDETitle">
                                      Dino Labs Web Developer
                                    </label>
                                    <label className="dinolabsIDESubtitle">
                                      Version 1.0.0 (Beta)
                                    </label>
                                    <div className="vevktorIDEStartButtonWrapper">
                                      <button className="dinolabsIDEStartButton" onClick={handleLoadRepository}>
                                        <FontAwesomeIcon icon={faFolderOpen} />
                                        Import a Directory
                                      </button>
                                      <button className="dinolabsIDEStartButton" onClick={handleLoadFile}>
                                        <FontAwesomeIcon icon={faCode} />
                                        Import a File
                                      </button>
                                    </div>
                                  </div>
                                  {isPlotRendered ? (
                                    <LinePlot plotType="getStartedPageUsagePlot" data={personalUsageByDay} />
                                  ) : (
                                    <div className="getStartedLinePlot" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                      <div className="loading-circle" />
                                    </div>
                                  )}
                                </div>
                                <div className="dinolabsIDELanguageDisplayFlex">
                                  {isPlotRendered ? (
                                    <div className="dinolabsIDEGetStartedWrapperLanguages">
                                      <div className="dinolabsIDEUsageLanguagesContainer">
                                        {usageLanguages.length === 0 ? (
                                          <p className="dinolabsIDELanguageUsageUnavailable">No usage data available.</p>
                                        ) : (
                                          <ul className="dinolabsIDEUsageLanguageList">
                                            {usageLanguages.slice(0, 5).map((language) => {
                                              const total = usageLanguages.reduce((acc, lang) => acc + lang.count, 0);
                                              const percentage = (language.count / total) * 100;
                                              const languageColors = {
                                                Javascript: "#EB710E",
                                                Typescript: "#3178c6",
                                                HTML: "#e34c26",
                                                CSS: "#9FB7EF",
                                                JSON: "#8e44ad",
                                                XML: "#1abc9c",
                                                Python: "#3572a5",
                                                PHP: "#8993be",
                                                Swift: "#ffac45",
                                                C: "#a8b9cc",
                                                "C++": "#f34b7d",
                                                "C#": "#178600",
                                                Rust: "#dea584",
                                                Bash: "#4eaa25",
                                                Shell: "#89e051",
                                                "Monkey C": "#f45b69",
                                                SQL: "#c5b7db",
                                                Assembly: "#5d9ca3",
                                                default: "#95a5a6"
                                              };
                                              const color = languageColors[language.language] || languageColors.default;
                                              return (
                                                <li key={language.language} className="dinolabsIDELanguageItem">
                                                  <div className="dinolabsIDELanguageLabel">
                                                    {language.language}
                                                    <span>{percentage.toFixed(1)}%</span>
                                                  </div>
                                                  <div className="dinolabsIDELanguageBar" style={{ width: `${percentage}%`, backgroundColor: color }}></div>
                                                </li>
                                              );
                                            })}
                                          </ul>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="dinolabsIDEGetStartedWrapperLanguages" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                      <div className="loading-circle" />
                                    </div>
                                  )}
                                  {isPlotRendered ? (
                                    <div className="dinolabsIDEGetStartedWrapperLanguages">
                                      <DoughnutPlot cellType="languageUsage" data={{ usageLanguages }} fontSizeMultiplier={1.7} />
                                    </div>
                                  ) : (
                                    <div className="dinolabsIDEGetStartedWrapperLanguages" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                      <div className="loading-circle" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {paneIndex < panes.length - 1 && (
                        <div className="resizablePaneDivider" onMouseDown={handleMouseDownPane} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
              {(!isAccountOpen) && <div className="bottomIDEControlBar" />}
              {isAccountOpen && (
                <DinoLabsIDEAccount
                  onClose={() => setIsAccountOpen(false)}
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
      ) : (
        !isLoaded ? (
          <div className="dinolabsIDEHeaderContainer" style={{ backgroundColor: "#222222" }}>
            <div className="loading-wrapper">
              <div className="loading-circle" />
              <label className="loading-title">Dino Labs Web IDE</label>
            </div>
          </div>
        ) : (
          <div className="dinolabsIDEHeaderContainer">
            <div className="dinolabsIDEUnavailableWrapper">
              <img className="dinolabsIDEUnavailableImage" src="./DinoLabsLogo-White.png" alt="Logo" />
              <label className="dinolabsUnavailableLabel">
                The Dino Labs IDE is currently unavailable at this screen size.
              </label>
              <label className="dinolabsUnavailableSubLabel">
                Please sign in on a {screenSize < 700 ? "larger" : "smaller"} screen to continue.
              </label>
            </div>
          </div>
        )
      )}
      {(screenSize >= 700 && screenSize <= 5399) && contextMenuVisible && (
        <ul
          className="dinolabsIDEContextMenu"
          ref={contextMenuRef}
          style={{ top: contextMenuPosition.y, left: contextMenuPosition.x }}
        >
          <li className="dinolabsIDEContextMenuItem" onClick={createNewFile}>
            Add File
          </li>
          <li className="dinolabsIDEContextMenuItem" onClick={createNewFolder}>
            Add Folder
          </li>
          {(contextMenuTarget?.type === "file" || contextMenuTarget?.type === "directory") && (
            <li className="dinolabsIDEContextMenuItem" onClick={deleteItem}>
              Delete
            </li>
          )}
          <li className="dinolabsIDEContextMenuItem" style={{ borderBottom: "none" }} onClick={copyRelativePathToClipboard}>
            Copy Relative Path
          </li>
        </ul>
      )}
    </div>
  );
};

export default DinoLabsIDE;
