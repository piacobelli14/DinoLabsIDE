//
//  DinoLabsPlayground.swift
//  DinoLabsPlayground
//
//  Created by Peter Iacobelli on 2/12/25.
//

import SwiftUI
import Combine

struct FileItem: Identifiable {
    let id: String
    let name: String
    let type: String
    let fullPath: String
    var files: [FileItem]? = nil
    var fileURL: URL? = nil
}

struct TabItem: Identifiable {
    let id: String
    let name: String
    var content: String = ""
    var language: String = "Unknown"
    var forceOpen: Bool = false
    var searchTerm: String = ""
    var replaceTerm: String = ""
    var searchPositions: [Int] = []
    var currentSearchIndex: Int = -1
    var isSearchOpen: Bool = false
    var isReplaceOpen: Bool = false
    var isMedia: Bool = false
    var fileURL: URL? = nil
}

struct Pane {
    var openedTabs: [TabItem] = []
    var activeTabId: String? = nil
}

let defaultKeyBinds: [String: String] = [
    "save": "s",
    "undo": "z",
    "redo": "y",
    "cut": "x",
    "copy": "c",
    "paste": "v",
    "search": "f",
    "selectAll": "a"
]

let extensionToLanguageMap: [String: String] = [
    "js": "Javascript",
    "jsx": "Javascript",
    "ts": "Typescript",
    "tsx": "Typescript",
    "html": "HTML",
    "css": "CSS",
    "json": "JSON",
    "xml": "XML",
    "py": "Python",
    "php": "PHP",
    "swift": "Swift",
    "c": "C",
    "cpp": "C++",
    "h": "C++",
    "cs": "C#",
    "rs": "Rust",
    "bash": "Bash",
    "sh": "Shell",
    "zsh": "Shell",
    "mc": "Monkey C",
    "mcgen": "Monkey C",
    "sql": "SQL",
    "asm": "Assembly"
]

struct DinoLabsPlayground: View {
    @State private var isLoaded: Bool = false
    @State private var screenSize: CGFloat = NSScreen.main?.frame.width ?? 800
    @State private var directoryWidth: CGFloat = 20
    @State private var contentWidth: CGFloat = 80
    @State private var markdownHeight: CGFloat = 90
    @State private var consoleHeight: CGFloat = 0
    @State private var isDraggingWidth: Bool = false
    @State private var isDraggingHeight: Bool = false
    @State private var isDraggingPane: Bool = false
    @State private var paneWidths: [String: CGFloat] = ["pane1": 50, "pane2": 50]
    @State private var repositoryFiles: [FileItem] = []
    @State private var openedDirectories: [String: Bool] = [:]
    @State private var rootDirectoryName: String = ""
    @State private var isRootOpen: Bool = false
    @State private var panes: [Pane] = [Pane()]
    @State private var activePaneIndex: Int = 0
    @State private var searchQuery: String = ""
    @State private var isAccountOpen: Bool = false
    @State private var unsavedChanges: [String: Bool] = [:]
    @State private var originalContents: [String: String] = [:]
    @State private var modifiedContents: [String: String] = [:]
    @State private var isNavigatorState: Bool = true
    @State private var isNavigatorLoading: Bool = false
    @State private var isSearchState: Bool = false
    @State private var globalSearchQuery: String = ""
    @State private var globalReplaceTerm: String = ""
    @State private var globalSearchResults: [String] = []
    @State private var isGlobalReplace: Bool = false
    @State private var isCaseSensitiveSearch: Bool = true
    @State private var isPlotRendered: Bool = false
    @State private var collapsedFiles: [String: Bool] = [:]
    @State private var keyBinds: [String: String] = defaultKeyBinds
    @State private var zoomLevel: CGFloat = 1
    @State private var colorTheme: String = "default"
    @State private var personalUsageByDay: [String] = []
    @State private var usageLanguages: [String] = []
    @State private var contextMenuVisible: Bool = false
    @State private var contextMenuPosition: CGPoint = .zero
    @State private var contextMenuTarget: (type: String, path: String)? = nil
    @State private var flattenedDirectoryList: [FileItem] = []
    @State private var flattenedSearchList: [String] = []
    @State private var dragOverId: String? = nil
    
    var body: some View {
        GeometryReader { geo in
            ZStack {
                if screenSize >= 700 && screenSize <= 5399 {
                    if isLoaded {
                        mainIDEView(frame: geo.frame(in: .global))
                    } else {
                        loadingView(background: Color.black)
                    }
                } else {
                    unavailableView()
                }
                if contextMenuVisible {
                    contextMenu
                        .position(x: contextMenuPosition.x, y: contextMenuPosition.y)
                }
            }
            .gesture(dragGesture())
            .onAppear {
                screenSize = geo.size.width
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                    isLoaded = true
                }
            }
        }
    }
    
    private func mainIDEView(frame: CGRect) -> some View {
        HStack(spacing: 0) {
            sidebarView
                .frame(width: frame.width * (directoryWidth / 100))
            Divider()
                .frame(width: 2)
                .gesture(widthDragGesture())
            contentView
                .frame(width: frame.width * (contentWidth / 100))
        }
    }
    
    private var sidebarView: some View {
        VStack(spacing: 0) {
            topBarView
            directoryOperationsView
            directoryTabsView
            if isNavigatorState {
                directorySearchView
                if isNavigatorLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, alignment: .center)
                } else {
                    directoryFilesView
                }
            } else if isSearchState {
                globalSearchView
            }
            bottomBarView
        }
        .background(Color.gray.opacity(0.2))
    }
    
    private var topBarView: some View {
        HStack {
            Button(action: { zoomIn() }) {
                Image(systemName: "plus.square")
            }
            Button(action: { zoomOut() }) {
                Image(systemName: "minus.square")
            }
            Button(action: { resetZoomLevel() }) {
                Image(systemName: "arrow.counterclockwise")
            }
            Spacer()
        }
        .padding()
    }
    
    private var directoryOperationsView: some View {
        VStack {
            Button(action: { handleLoadRepository() }) {
                HStack {
                    Image(systemName: "folder")
                    Text("Import a Directory")
                }
            }
            Button(action: { handleLoadFile() }) {
                HStack {
                    Image(systemName: "doc")
                    Text("Import a File")
                }
            }
        }
        .padding()
    }
    
    private var directoryTabsView: some View {
        HStack {
            Button(action: {
                isNavigatorState = true
                isSearchState = false
            }) {
                Text("Navigator")
                    .padding(4)
                    .background(isNavigatorState ? Color.blue.opacity(0.2) : Color.clear)
                    .cornerRadius(4)
            }
            Button(action: {
                isSearchState = true
                isNavigatorState = false
            }) {
                Text("Search")
                    .padding(4)
                    .background(isSearchState ? Color.blue.opacity(0.2) : Color.clear)
                    .cornerRadius(4)
            }
        }
        .padding(.horizontal)
    }
    
    private var directorySearchView: some View {
        TextField("🔎 Search the directory...", text: $searchQuery)
            .textFieldStyle(RoundedBorderTextFieldStyle())
            .padding()
    }
    
    private var directoryFilesView: some View {
        List(flattenedDirectoryList) { item in
            if item.type == "directory" {
                HStack {
                    Image(systemName: openedDirectories[item.id] == true ? "chevron.down" : "chevron.right")
                    Text(item.name)
                    if unsavedChanges[item.id] == true {
                        Circle()
                            .fill(Color.red)
                            .frame(width: 8, height: 8)
                    }
                }
                .padding(.leading, 12)
                .onTapGesture {
                    toggleDirectory(directoryKey: item.id)
                }
                .onLongPressGesture {
                    handleContextMenu(target: (type: "directory", path: item.id))
                }
            } else {
                HStack {
                    getFileIcon(fileName: item.name)
                    Text(item.name)
                    if unsavedChanges[item.id] == true {
                        Circle()
                            .fill(Color.red)
                            .frame(width: 8, height: 8)
                    }
                }
                .padding(.leading, 12)
                .onTapGesture {
                    let parentPath = (item.fullPath as NSString).deletingLastPathComponent
                    handleFileClick(file: item, parentPath: parentPath)
                }
                .onLongPressGesture {
                    handleContextMenu(target: (type: "file", path: item.id))
                }
            }
        }
    }
    
    private var globalSearchView: some View {
        VStack {
            HStack {
                TextField("Search across all files...", text: $globalSearchQuery)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                Button(action: { performGlobalSearch() }) {
                    Image(systemName: "magnifyingglass")
                }
                Button(action: {
                    isCaseSensitiveSearch.toggle()
                }) {
                    Text("Aa")
                        .foregroundColor(isCaseSensitiveSearch ? Color.purple : Color.primary)
                }
            }
            .padding()
            HStack {
                TextField("Replace with...", text: $globalReplaceTerm)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .disabled(!isGlobalReplace)
                Button(action: {
                    isGlobalReplace = true
                    performGlobalReplace()
                }) {
                    Image(systemName: "plus.magnifyingglass")
                }
            }
            .padding()
        }
    }
    
    private var bottomBarView: some View {
        HStack {
            Spacer()
            Button(action: { isAccountOpen.toggle() }) {
                Image(systemName: "person.circle")
                    .foregroundColor(isAccountOpen ? Color.purple : Color.primary)
            }
            Spacer()
        }
        .padding()
    }
    
    private var contentView: some View {
        VStack(spacing: 0) {
            tabBarView
            Divider()
            editorAreaView
            Spacer()
        }
    }
    
    private var tabBarView: some View {
        HStack {
            ForEach(panes.indices, id: \.self) { paneIndex in
                ForEach(panes[paneIndex].openedTabs) { tab in
                    HStack {
                        if unsavedChanges[tab.id] == true {
                            Circle()
                                .fill(Color.red)
                                .frame(width: 6, height: 6)
                        }
                        getFileIcon(fileName: tab.name)
                        Text(tab.name)
                        Button(action: {
                            closeTab(paneIndex: paneIndex, tabId: tab.id)
                        }) {
                            Text("×")
                        }
                    }
                    .padding(4)
                    .background(panes[paneIndex].activeTabId == tab.id ? Color.blue.opacity(0.2) : Color.clear)
                    .onTapGesture {
                        switchTab(paneIndex: paneIndex, tabId: tab.id)
                    }
                    .onDrag {
                        return NSItemProvider(object: NSString(string: tab.id))
                    }
                }
            }
            Spacer()
        }
        .padding(.horizontal)
    }
    
    private var editorAreaView: some View {
        ZStack {
            if panes[activePaneIndex].openedTabs.isEmpty {
                VStack {
                    Text("Get Started")
                        .font(.largeTitle)
                    Button(action: { handleLoadRepository() }) {
                        HStack {
                            Image(systemName: "folder")
                            Text("Import a Directory")
                        }
                    }
                    Button(action: { handleLoadFile() }) {
                        HStack {
                            Image(systemName: "doc")
                            Text("Import a File")
                        }
                    }
                }
            } else {
                ForEach(panes[activePaneIndex].openedTabs) { tab in
                    if panes[activePaneIndex].activeTabId == tab.id {
                        if tab.isMedia {
                            Text("Media Editor for \(tab.name)")
                        } else {
                            ScrollView {
                                TextEditor(text: Binding(
                                    get: { tab.content },
                                    set: { newVal in handleEdit(paneIndex: activePaneIndex, tabId: tab.id, newContent: newVal) }
                                ))
                                .font(.system(.body, design: .monospaced))
                            }
                        }
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
    private var contextMenu: some View {
        VStack(alignment: .leading, spacing: 0) {
            Button("Add File") {
                createNewFile()
            }
            .padding(8)
            Button("Add Folder") {
                createNewFolder()
            }
            .padding(8)
            if let target = contextMenuTarget, target.type == "file" || target.type == "directory" {
                Button("Delete") {
                    deleteItem()
                }
                .padding(8)
            }
            Button("Copy Relative Path") {
                copyRelativePathToClipboard()
            }
            .padding(8)
        }
        .background(Color.white)
        .cornerRadius(4)
        .shadow(radius: 4)
    }
    
    private func dragGesture() -> some Gesture {
        DragGesture()
            .onChanged { value in }
            .onEnded { _ in
                isDraggingWidth = false
                isDraggingHeight = false
                isDraggingPane = false
            }
    }
    
    private func widthDragGesture() -> some Gesture {
        DragGesture()
            .onChanged { value in
                isDraggingWidth = true
                let newDirectoryWidth = (value.location.x / screenSize) * 100
                if newDirectoryWidth > 10 && newDirectoryWidth < 50 {
                    directoryWidth = newDirectoryWidth
                    contentWidth = 100 - newDirectoryWidth
                }
            }
            .onEnded { _ in
                isDraggingWidth = false
            }
    }
    
    private func getFileIcon(fileName: String) -> Image {
        let ext = fileName.lowercased().components(separatedBy: ".").last ?? "default"
        let imageName = extensionToLanguageMap[ext] != nil ? ext : "default"
        return Image(systemName: "doc")
    }
    
    private func toggleDirectory(directoryKey: String) {
        if let current = openedDirectories[directoryKey] {
            openedDirectories[directoryKey] = !current
        } else {
            openedDirectories[directoryKey] = true
        }
    }
    
    private func handleFileClick(file: FileItem, parentPath: String) {
        let fileId = file.fullPath
        if let paneIndex = panes.firstIndex(where: { pane in
            pane.openedTabs.contains(where: { $0.id == fileId })
        }) {
            activePaneIndex = paneIndex
            panes[paneIndex].activeTabId = fileId
        } else {
            var newTab = TabItem(id: fileId, name: file.name)
            if file.type == "file" {
                newTab.content = "Content of \(file.name)"
                if let ext = file.name.components(separatedBy: ".").last,
                   let lang = extensionToLanguageMap[ext.lowercased()] {
                    newTab.language = lang
                }
            }
            panes[activePaneIndex].openedTabs.append(newTab)
            panes[activePaneIndex].activeTabId = newTab.id
        }
    }
    
    private func handleLoadRepository() {
        rootDirectoryName = "DemoDirectory"
        repositoryFiles = [
            FileItem(id: "DemoDirectory/folder1", name: "folder1", type: "directory", fullPath: "DemoDirectory/folder1", files: [
                FileItem(id: "DemoDirectory/folder1/file1.txt", name: "file1.txt", type: "file", fullPath: "DemoDirectory/folder1/file1.txt")
            ]),
            FileItem(id: "DemoDirectory/file2.swift", name: "file2.swift", type: "file", fullPath: "DemoDirectory/file2.swift")
        ]
        isRootOpen = true
        flattenedDirectoryList = repositoryFiles
    }
    
    private func handleLoadFile() {
        let fileId = "DemoDirectory/importedFile.txt"
        let newTab = TabItem(id: fileId, name: "importedFile.txt", content: "Imported file content", language: "Unknown")
        panes[activePaneIndex].openedTabs.append(newTab)
        panes[activePaneIndex].activeTabId = newTab.id
    }
    
    private func switchTab(paneIndex: Int, tabId: String) {
        panes[paneIndex].activeTabId = tabId
        activePaneIndex = paneIndex
    }
    
    private func closeTab(paneIndex: Int, tabId: String) {
        if unsavedChanges[tabId] == true {
        }
        panes[paneIndex].openedTabs.removeAll(where: { $0.id == tabId })
        if panes[paneIndex].activeTabId == tabId {
            panes[paneIndex].activeTabId = panes[paneIndex].openedTabs.first?.id
        }
        unsavedChanges.removeValue(forKey: tabId)
        originalContents.removeValue(forKey: tabId)
        modifiedContents.removeValue(forKey: tabId)
    }
    
    private func splitTab() {
        if panes.count >= 2 { return }
        if let currentTabId = panes[activePaneIndex].activeTabId,
           let tabIndex = panes[activePaneIndex].openedTabs.firstIndex(where: { $0.id == currentTabId }) {
            let tab = panes[activePaneIndex].openedTabs.remove(at: tabIndex)
            let newPane = Pane(openedTabs: [tab], activeTabId: tab.id)
            panes.append(newPane)
            activePaneIndex = panes.count - 1
            paneWidths = ["pane1": 50, "pane2": 50]
        }
    }
    
    private func handleEdit(paneIndex: Int, tabId: String, newContent: String) {
        if let original = originalContents[tabId], newContent == original {
            unsavedChanges[tabId] = false
        } else {
            unsavedChanges[tabId] = true
        }
        if let tabIndex = panes[paneIndex].openedTabs.firstIndex(where: { $0.id == tabId }) {
            panes[paneIndex].openedTabs[tabIndex].content = newContent
            modifiedContents[tabId] = newContent
        }
    }
    
    private func handleSave(paneIndex: Int, tabId: String, newFullCode: String) {
        originalContents[tabId] = newFullCode
        unsavedChanges[tabId] = false
        modifiedContents.removeValue(forKey: tabId)
    }
    
    private func zoomIn() {
        zoomLevel = min(zoomLevel + 0.1, 3)
    }
    
    private func zoomOut() {
        zoomLevel = max(zoomLevel - 0.1, 0.5)
    }
    
    private func resetZoomLevel() {
    }
    
    private func performGlobalSearch() {
    }
    
    private func performGlobalReplace() {
    }
    
    private func createNewFile() {
        contextMenuVisible = false
    }
    
    private func createNewFolder() {
        contextMenuVisible = false
    }
    
    private func deleteItem() {
        contextMenuVisible = false
    }
    
    private func copyRelativePathToClipboard() {
        contextMenuVisible = false
    }
    
    private func handleContextMenu(target: (type: String, path: String)) {
        contextMenuTarget = target
        contextMenuPosition = CGPoint(x: 100, y: 100)
        contextMenuVisible = true
    }
    
    private func loadingView(background: Color) -> some View {
        VStack {
            ProgressView()
            Text("Loading...")
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(background)
    }
    
    private func unavailableView() -> some View {
        VStack {
            Image(systemName: "exclamationmark.triangle")
                .resizable()
                .frame(width: 50, height: 50)
            Text("IDE is unavailable at this screen size.")
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

