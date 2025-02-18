//
//  DinoLabsPlayground.swift
//
//  Created by Peter Iacobelli on 2/12/25.
//

import SwiftUI
import AppKit

struct PersonalUsageInfo: Codable {
    let day: String
    let usage_count: String
}

struct UsageLanguage: Codable {
    let language: String
    let language_count: String
}

struct UsageResponse: Codable {
    let personalUsageInfo: [PersonalUsageInfo]?
    let usageLanguages: [UsageLanguage]?
}

struct LanguageUsage: Identifiable {
    let id = UUID()
    let language: String
    let count: Int
    var percentage: Double = 0.0
}

struct FileItem: Identifiable {
    let id: URL
    let url: URL
    let isDirectory: Bool
    var children: [FileItem]?
}

func editorPlaceholderText(for fileURL: URL) -> String {
    let ext = fileURL.pathExtension.lowercased()
    if ["csv"].contains(ext) {
         return "Currently editing tabular file"
    }
    if ["txt", "md"].contains(ext) {
         return "Currently editing text file"
    }
    if ["png", "jpg", "jpeg", "gif", "svg", "bmp"].contains(ext) {
         return "Currently editing image file"
    }
    if ["mp4", "mkv", "avi", "mov", "webm"].contains(ext) {
         return "Currently editing video file"
    }
    if ["mp3", "wav", "flac"].contains(ext) {
         return "Currently editing audio file"
    }
    let languageMapping: [String: String] = [
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
    if let language = languageMapping[ext] {
         return "Currently editing \(language) file"
    }
    return "Currently editing file"
}

func colorForLanguage(_ language: String) -> Color {
    let languageColors: [String: String] = [
        "Javascript": "EB710E",
        "Typescript": "3178c6",
        "HTML": "e34c26",
        "CSS": "9FB7EF",
        "JSON": "8e44ad",
        "XML": "1abc9c",
        "Python": "3572a5",
        "PHP": "8993be",
        "Swift": "ffac45",
        "C": "a8b9cc",
        "C++": "f34b7d",
        "C#": "178600",
        "Rust": "dea584",
        "Bash": "4eaa25",
        "Shell": "89e051",
        "Monkey C": "f45b69",
        "SQL": "c5b7db",
        "Assembly": "5d9ca3"
    ]
    if let hexString = languageColors[language],
       let intValue = Int(hexString, radix: 16) {
        return Color(hex: UInt(intValue), alpha: 1.0)
    }
    return Color(hex: UInt(0x95a5a6), alpha: 1.0)
}

struct CollapsibleItemView: View {
    let item: FileItem
    let level: Int
    let getIcon: (FileItem) -> String
    let onAddFile: (FileItem) -> Void
    let onAddFolder: (FileItem) -> Void
    let onDeleteItem: (FileItem) -> Void
    let onCut: (FileItem) -> Void
    let onCopy: (FileItem) -> Void
    let onPaste: (FileItem) -> Void
    let onRename: (FileItem) -> Void
    let onRevealInFinder: (FileItem) -> Void
    let isPasteEnabled: Bool
    @State private var isDragOver: Bool = false
    @State private var isHovered: Bool = false
    @State private var isExpanded: Bool = false
    let onDropItem: (URL, FileItem) -> Bool
    let onOpenFile: (FileItem) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .center, spacing: 0) {
                Color.clear
                    .frame(width: CGFloat(level) * 16, height: 1)
                if item.isDirectory {
                    Image(systemName: isExpanded ? "chevron.down" : "chevron.right")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 8, height: 8)
                        .foregroundColor(.white.opacity(0.8))
                        .padding(.trailing, 8)
                } else {
                    Image(getIcon(item))
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 12, height: 12)
                        .foregroundColor(.white.opacity(0.8))
                        .padding(.trailing, 8)
                }
                Text(item.url.lastPathComponent)
                    .foregroundColor(.white.opacity(0.8))
                    .font(.system(size: 10, weight: .semibold))
                    .lineLimit(1)
                    .truncationMode(.tail)
            }
            .onHover { hovering in
                self.isHovered = hovering
            }
            .background(isHovered ? Color(hex: 0x3A3A3A) : Color.clear)
            .padding(.vertical, 4)
            .frame(maxWidth: .infinity, alignment: .leading)
            .hoverEffect(
                backgroundColor: isHovered ? Color(hex: 0x3A3A3A) : Color(hex: 0x212121),
                scale: 1.02,
                cursor: .pointingHand
            )
            .onTapGesture {
                if item.isDirectory {
                    isExpanded.toggle()
                } else {
                    onOpenFile(item)
                }
            }
            .onDrag {
                let provider = NSItemProvider(object: item.url.absoluteString as NSString)
                return provider
            }
            .contextMenu {
                Button("Add File") {
                    onAddFile(item)
                }
                Button("Add Folder") {
                    onAddFolder(item)
                }
                Button("Delete") {
                    onDeleteItem(item)
                }
                Divider()
                Button("Cut") {
                    onCut(item)
                }
                Button("Copy") {
                    onCopy(item)
                }
                Button("Paste") {
                    onPaste(item)
                }
                .disabled(!isPasteEnabled || !item.isDirectory)
                Button("Rename") {
                    onRename(item)
                }
                Button("Reveal in Finder") {
                    onRevealInFinder(item)
                }
                Divider()
                Button("Copy Relative Path") {
                    let relative = relativePath(itemURL: item.url)
                    NSPasteboard.general.clearContents()
                    NSPasteboard.general.setString(relative, forType: .string)
                }
                Button("Copy Full Path") {
                    NSPasteboard.general.clearContents()
                    NSPasteboard.general.setString(item.url.path, forType: .string)
                }
            }
            .onDrop(
                of: [.fileURL],
                isTargeted: $isDragOver
            ) { providers -> Bool in
                let destinationItem: FileItem = item.isDirectory ? item : FileItem(id: item.url.deletingLastPathComponent(), url: item.url.deletingLastPathComponent(), isDirectory: true, children: nil)
                if let itemProvider = providers.first {
                    itemProvider.loadItem(forTypeIdentifier: "public.file-url", options: nil) { (draggedData, error) in
                        guard let draggedData = draggedData as? Data,
                              let draggedString = String(data: draggedData, encoding: .utf8),
                              let sourceURL = URL(string: draggedString)
                        else { return }
                        _ = onDropItem(sourceURL, destinationItem)
                    }
                    return true
                }
                return false
            }
            if item.isDirectory, isExpanded, let kids = item.children {
                VStack(alignment: .leading, spacing: 0) {
                    ForEach(kids) { child in
                        CollapsibleItemView(
                            item: child,
                            level: level + 1,
                            getIcon: getIcon,
                            onAddFile: onAddFile,
                            onAddFolder: onAddFolder,
                            onDeleteItem: onDeleteItem,
                            onCut: onCut,
                            onCopy: onCopy,
                            onPaste: onPaste,
                            onRename: onRename,
                            onRevealInFinder: onRevealInFinder,
                            isPasteEnabled: isPasteEnabled,
                            onDropItem: onDropItem,
                            onOpenFile: onOpenFile
                        )
                    }
                }
            }
        }
    }
    
    func relativePath(itemURL: URL) -> String {
        guard let root = DinoLabsPlayground.loadedRootURL else {
            return itemURL.path
        }
        let rootName = root.lastPathComponent
        let rootParent = root.deletingLastPathComponent().path
        var path = itemURL.path.replacingOccurrences(of: rootParent, with: "")
        if path.hasPrefix("/") { path.removeFirst() }
        return path
    }
}

struct DinoLabsPlayground: View {
    @Binding var currentView: AppView
    static var loadedRootURL: URL? = nil
    
    @State private var directoryURL: URL? = nil {
        didSet {
            DinoLabsPlayground.loadedRootURL = directoryURL
        }
    }
    @State private var fileURL: URL? = nil
    @State private var showAlert: Bool = false
    @State private var alertTitle: String = ""
    @State private var alertMessage: String = ""
    @State private var alertInputs: [DinoLabsAlertInput] = []
    @State private var showCancelButton: Bool = false
    @State private var leftPanelWidthRatio: CGFloat = 0.25
    @State private var fileItems: [FileItem] = []
    @State private var rootIsExpanded: Bool = true
    @State private var isNavigatorLoading: Bool = false
    @State private var isReplace: Bool = false
    @State private var isCaseSensitive: Bool = true
    @State private var directoryItemSearch: String = ""
    @State private var debouncedSearch: String = ""
    @State private var searchDebounceTask: DispatchWorkItem? = nil
    @State private var noFileSelected: Bool = true
    @State private var onConfirmAction: (([String: Any]?) -> Void)? = nil
    @State private var clipboardItem: URL? = nil
    @State private var clipboardOperation: String? = nil
    @State private var draggingTab: IDEFileTab? = nil
    @State private var openTabs: [IDEFileTab] = []
    @State private var activeTabId: UUID? = nil
    @State private var personalUsageData: [LineChartDataPoint] = []
    @State private var personalUsageByDay: [LineChartDataPoint] = []
    @State private var usageLanguagesData: [LanguageUsage] = []
    @State private var usageDoughnutData: [DoughnutData] = []
    
    struct IDEFileTab: Identifiable, Hashable {
        let id = UUID()
        let fileName: String
        let fileURL: URL
    }
    
    private let extensionToImageMap: [String: String] = [
        "js": "javascript",
        "jsx": "javascript",
        "ts": "typescript",
        "tsx": "typescript",
        "html": "html",
        "css": "css",
        "json": "json",
        "xml": "xml",
        "py": "python",
        "php": "php",
        "swift": "swift",
        "c": "c",
        "cpp": "c++",
        "h": "c++",
        "cs": "csharp",
        "rs": "rust",
        "bash": "bash",
        "sh": "shell",
        "zsh": "shell",
        "mc": "monkeyc",
        "mcgen": "monkeyc",
        "md": "markdown",
        "asm": "assembly",
        "sql": "sql",
        "pem": "securityExtensions",
        "txt": "txtExtension",
        "csv": "csvExtension",
        "pdf": "pdfExtension",
        "doc": "wordExtension",
        "docx": "wordExtension",
        "xls": "excelExtension",
        "xlsx": "excelExtension",
        "ppt": "powerpointExtension",
        "pptx": "powerpointExtension",
        "png": "imageExtension",
        "jpg": "imageExtension",
        "jpeg": "imageExtension",
        "svg": "imageExtension",
        "bmp": "imageExtension",
        "mp3": "audioExtension",
        "wav": "audioExtension",
        "flac": "audioExtension",
        "gif": "videoExtension",
        "mp4": "videoExtension",
        "mkv": "videoExtension",
        "avi": "videoExtension",
        "mov": "videoExtension",
        "webm": "videoExtension",
        "zip": "archiveExtensions",
        "rar": "archiveExtensions",
        "tar": "archiveExtensions",
        "gz": "archiveExtensions",
        "default": "unknownExtension",
        "cache": "cacheExtensions",
        "tmp": "cacheExtensions",
        "temp": "cacheExtensions",
        "bak": "cacheExtensions",
        "dockerfile": "dockerfileExtension",
        "makefile": "makefileExtension",
        "git": "githubExtension"
    ]
    
    
    private func addFile(to item: FileItem) {
        alertTitle = "Create New File"
        alertMessage = "Enter the name of your new file:"
        alertInputs = [
            DinoLabsAlertInput(
                name: "New file name...",
                type: "text",
                defaultValue: "",
                attributes: nil
            )
        ]
        showCancelButton = true
        onConfirmAction = { result in
            guard let values = result,
                  let fileName = values["New file name..."] as? String,
                  !fileName.isEmpty else { return }
            let parentURL = item.isDirectory
                ? item.url
                : item.url.deletingLastPathComponent()
            let newFileURL = parentURL.appendingPathComponent(fileName)
            let fm = FileManager.default
            if fm.fileExists(atPath: newFileURL.path) {
                alertTitle = "File Already Exists"
                alertMessage = "A file with the same name already exists in this directory."
                showAlert = true
                return
            }
            fm.createFile(atPath: newFileURL.path, contents: nil, attributes: nil)
            reloadDirectory()
        }
        showAlert = true
    }
    
    private func addFolder(to item: FileItem) {
        alertTitle = "Create New Folder"
        alertMessage = "Enter the name of your new folder:"
        alertInputs = [
            DinoLabsAlertInput(
                name: "New folder name...",
                type: "text",
                defaultValue: "",
                attributes: nil
            )
        ]
        showCancelButton = true
        onConfirmAction = { result in
            guard let values = result,
                  let folderName = values["New folder name..."] as? String,
                  !folderName.isEmpty else { return }
            let parentURL = item.isDirectory
                ? item.url
                : item.url.deletingLastPathComponent()
            let newFolderURL = parentURL.appendingPathComponent(folderName)
            let fm = FileManager.default
            if fm.fileExists(atPath: newFolderURL.path) {
                alertTitle = "Folder Already Exists"
                alertMessage = "A folder with the same name already exists in this directory."
                showAlert = true
                return
            }
            do {
                try fm.createDirectory(at: newFolderURL, withIntermediateDirectories: false, attributes: nil)
                reloadDirectory()
            } catch {
            }
        }
        showAlert = true
    }
    
    private func deleteItem(_ item: FileItem) {
        let typeLabel = item.isDirectory ? "folder" : "file"
        let name = item.url.lastPathComponent
        alertTitle = "Confirm Delete"
        alertMessage = "Are you sure you want to delete the \(typeLabel) \"\(name)\"?"
        alertInputs = []
        showCancelButton = true
        onConfirmAction = { _ in
            let fm = FileManager.default
            do {
                try fm.removeItem(at: item.url)
                reloadDirectory()
            } catch {
            }
        }
        showAlert = true
    }
    
    private func cutItem(_ item: FileItem) {
        clipboardItem = item.url
        clipboardOperation = "cut"
    }
    
    private func copyItem(_ item: FileItem) {
        clipboardItem = item.url
        clipboardOperation = "copy"
    }
    
    private func pasteItem(_ target: FileItem) {
        guard let sourceURL = clipboardItem, let operation = clipboardOperation else { return }
        let fm = FileManager.default
        let destinationURL = target.url.appendingPathComponent(sourceURL.lastPathComponent)
        if fm.fileExists(atPath: destinationURL.path) {
            alertTitle = "Paste Failed"
            alertMessage = "A file or folder with the same name already exists in the destination."
            alertInputs = []
            showAlert = true
            return
        }
        if operation == "cut" {
            do {
                try fm.moveItem(at: sourceURL, to: destinationURL)
                clipboardItem = nil
                clipboardOperation = nil
                reloadDirectory()
            } catch {
            }
        } else if operation == "copy" {
            do {
                try fm.copyItem(at: sourceURL, to: destinationURL)
                reloadDirectory()
            } catch {
            }
        }
    }
    
    private func renameItem(_ item: FileItem) {
        let oldName = item.url.lastPathComponent
        alertTitle = "Rename"
        alertMessage = "Enter new name for \"\(oldName)\":"
        alertInputs = [
            DinoLabsAlertInput(
                name: "Enter new name...",
                type: "text",
                defaultValue: oldName,
                attributes: nil
            )
        ]
        showCancelButton = true
        onConfirmAction = { result in
            guard let values = result,
                  let newName = values["Enter new name..."] as? String,
                  !newName.isEmpty else { return }
            let fm = FileManager.default
            let parentURL = item.url.deletingLastPathComponent()
            let newURL = parentURL.appendingPathComponent(newName)
            if fm.fileExists(atPath: newURL.path) {
                alertTitle = "Rename Failed"
                alertMessage = "A file or folder with the name \"\(newName)\" already exists."
                showAlert = true
                return
            }
            do {
                try fm.moveItem(at: item.url, to: newURL)
                reloadDirectory()
            } catch {
            }
        }
        showAlert = true
    }
    
    private func revealInFinder(_ item: FileItem) {
        NSWorkspace.shared.activateFileViewerSelecting([item.url])
    }
    
    private func reloadDirectory() {
        guard let dir = directoryURL else { return }
        isNavigatorLoading = true
        DispatchQueue.global(qos: .userInitiated).async {
            let root = FileItem(
                id: dir,
                url: dir,
                isDirectory: true,
                children: self.loadFileItems(from: dir)
            )
            DispatchQueue.main.async {
                fileItems = [root]
                rootIsExpanded = true
                isNavigatorLoading = false
            }
        }
    }
    
    private func handleDropItem(source: URL, destinationItem: FileItem) -> Bool {
        let fm = FileManager.default
        guard destinationItem.isDirectory else { return false }
        if source == destinationItem.url { return false }
        if source.hasDirectoryPath {
            if destinationItem.url.path.hasPrefix(source.path) {
                return false
            }
        }
        let destinationURL = destinationItem.url.appendingPathComponent(source.lastPathComponent)
        if fm.fileExists(atPath: destinationURL.path) {
            DispatchQueue.main.async {
                alertTitle = "Move Failed"
                alertMessage = "A file or folder with the name \"\(source.lastPathComponent)\" already exists in the destination."
                alertInputs = []
                showAlert = true
            }
            return false
        }
        do {
            try fm.moveItem(at: source, to: destinationURL)
            DispatchQueue.main.async {
                reloadDirectory()
            }
            return true
        } catch {
            return false
        }
    }
    
    private func getIcon(forFileURL url: URL) -> String {
        let name = url.lastPathComponent.lowercased()
        if name == "dockerfile" {
            return extensionToImageMap["dockerfile"] ?? extensionToImageMap["default"]!
        } else if name == "makefile" {
            return extensionToImageMap["makefile"] ?? extensionToImageMap["default"]!
        } else if name.hasPrefix(".git") {
            return extensionToImageMap["git"] ?? extensionToImageMap["default"]!
        }
        let ext = url.pathExtension.lowercased()
        return extensionToImageMap[ext] ?? extensionToImageMap["default"]!
    }
    
    private func loadFileItems(from url: URL) -> [FileItem] {
        var items = [FileItem]()
        let fm = FileManager.default
        if let contents = try? fm.contentsOfDirectory(at: url, includingPropertiesForKeys: [.isDirectoryKey], options: [.skipsHiddenFiles]) {
            for contentURL in contents {
                let isDir = (try? contentURL.resourceValues(forKeys: [.isDirectoryKey]).isDirectory) ?? false
                var children: [FileItem]? = nil
                if isDir {
                    children = loadFileItems(from: contentURL)
                }
                items.append(FileItem(id: contentURL, url: contentURL, isDirectory: isDir, children: children))
            }
        }
        return items
    }
    
    private func filteredFileItem(_ item: FileItem, query: String) -> FileItem? {
        if query.isEmpty { return item }
        let name = item.url.lastPathComponent
        let matches: Bool
        if isCaseSensitive {
            matches = name.contains(query)
        } else {
            matches = name.lowercased().contains(query.lowercased())
        }
        if item.isDirectory, let children = item.children {
            let filteredChildren = children.compactMap { filteredFileItem($0, query: query) }
            if matches || !filteredChildren.isEmpty {
                return FileItem(id: item.id, url: item.url, isDirectory: item.isDirectory, children: filteredChildren)
            }
        } else {
            if matches {
                return item
            }
        }
        return nil
    }
    
    private var displayedChildren: [FileItem] {
        guard let root = fileItems.first else { return [] }
        if debouncedSearch.isEmpty {
            return root.children ?? []
        } else {
            return (root.children ?? []).compactMap { filteredFileItem($0, query: debouncedSearch) }
        }
    }
    
    func relativePath(itemURL: URL) -> String {
        guard let root = DinoLabsPlayground.loadedRootURL else { return itemURL.path }
        let rootName = root.lastPathComponent
        let rootParent = root.deletingLastPathComponent().path
        var path = itemURL.path.replacingOccurrences(of: rootParent, with: "")
        if path.hasPrefix("/") { path.removeFirst() }
        return path
    }
    
    private func openFileTab(url: URL) {
        if let existingTab = openTabs.first(where: { $0.fileURL == url }) {
            activeTabId = existingTab.id
            noFileSelected = false
        } else {
            let newTab = IDEFileTab(fileName: url.lastPathComponent, fileURL: url)
            openTabs.append(newTab)
            activeTabId = newTab.id
            noFileSelected = false
        }
    }
    
    private func closeTab(_ tab: IDEFileTab) {
        openTabs.removeAll { $0.id == tab.id }
        if openTabs.isEmpty {
            activeTabId = nil
            noFileSelected = true
        } else {
            activeTabId = openTabs.last?.id
            noFileSelected = false
        }
    }
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .topLeading) {
                VStack(spacing: 0) {
                    Spacer().frame(height: 50)
                    HStack(spacing: 0) {
                        VStack(spacing: 0) {
                            HStack { }
                                .frame(width: geometry.size.width * leftPanelWidthRatio,
                                       height: (geometry.size.height - 50) * 0.05)
                                .containerHelper(backgroundColor: Color(hex:0x171717), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                                .overlay(
                                    Rectangle()
                                        .frame(height: 0.5)
                                        .foregroundColor(Color(hex:0xc1c1c1).opacity(0.4)),
                                    alignment: .bottom
                                )
                            VStack(alignment: .leading, spacing: 0) {
                                MainButtonMain {
                                    loadDirectory()
                                }
                                .frame(width: (geometry.size.width * leftPanelWidthRatio), height: 12)
                                .padding(.vertical, 10)
                                .containerHelper(backgroundColor: Color(hex:0x111111), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                                .overlay(
                                    HStack {
                                        Image(systemName: "folder.fill")
                                            .resizable()
                                            .aspectRatio(contentMode: .fit)
                                            .frame(width: 10, height: 10)
                                            .foregroundColor(.white.opacity(0.8))
                                            .padding(.trailing, 4)
                                            .allowsHitTesting(false)
                                        Text("Load Directory")
                                            .foregroundColor(.white.opacity(0.8))
                                            .font(.system(size: 9, weight: .semibold))
                                            .lineLimit(1)
                                            .truncationMode(.tail)
                                            .allowsHitTesting(false)
                                        Spacer()
                                    }
                                    .padding(.leading, 10)
                                    .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                                )
                                .overlay(
                                    Rectangle()
                                        .frame(height: 0.5)
                                        .foregroundColor(Color(hex:0xc1c1c1).opacity(0.2)),
                                    alignment: .bottom
                                )
                                MainButtonMain {
                                    loadFile()
                                }
                                .frame(width: (geometry.size.width * leftPanelWidthRatio), height: 12)
                                .padding(.vertical, 10)
                                .containerHelper(backgroundColor: Color(hex:0x111111), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                                .overlay(
                                    HStack {
                                        Image(systemName: "doc.text")
                                            .resizable()
                                            .aspectRatio(contentMode: .fit)
                                            .frame(width: 10, height: 10)
                                            .foregroundColor(.white.opacity(0.8))
                                            .allowsHitTesting(false)
                                            .padding(.trailing, 4)
                                        Text("Load File")
                                            .foregroundColor(.white.opacity(0.8))
                                            .font(.system(size: 9, weight: .semibold))
                                            .lineLimit(1)
                                            .truncationMode(.tail)
                                            .allowsHitTesting(false)
                                        Spacer()
                                    }
                                    .padding(.leading, 10)
                                    .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                                )
                                .overlay(
                                    Rectangle()
                                        .frame(height: 0.5)
                                        .foregroundColor(Color(hex:0xc1c1c1).opacity(0.2)),
                                    alignment: .bottom
                                )
                                Spacer()
                            }
                            .frame(width: geometry.size.width * leftPanelWidthRatio,
                                   height: (geometry.size.height - 50) * 0.15)
                            .containerHelper(backgroundColor: Color(hex:0x111111), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                            .overlay(
                                Rectangle()
                                    .frame(height: 0.5)
                                    .foregroundColor(Color(hex:0xc1c1c1).opacity(0.4)),
                                alignment: .bottom
                            )
                            HStack(spacing: 0) {
                                MainButtonMain {
                                    isReplace.toggle()
                                }
                                .frame(width: (geometry.size.width * leftPanelWidthRatio) * 0.5)
                                .containerHelper(backgroundColor: isReplace ? Color.clear : Color(hex:0x212121), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                                .overlay(
                                    HStack {
                                        Text("Search")
                                            .foregroundColor(.white.opacity(0.8))
                                            .font(.system(size: 9, weight: .semibold))
                                            .lineLimit(1)
                                            .truncationMode(.tail)
                                            .allowsHitTesting(false)
                                    }
                                    .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                                )
                                MainButtonMain {
                                    isReplace.toggle()
                                }
                                .frame(width: (geometry.size.width * leftPanelWidthRatio) * 0.5)
                                .containerHelper(backgroundColor: !isReplace ? Color.clear : Color(hex:0x212121), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                                .overlay(
                                    HStack {
                                        Text("Search & Replace")
                                            .foregroundColor(.white.opacity(0.8))
                                            .font(.system(size: 9, weight: .semibold))
                                            .lineLimit(1)
                                            .truncationMode(.tail)
                                            .allowsHitTesting(false)
                                    }
                                    .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                                )
                            }
                            .frame(width: geometry.size.width * leftPanelWidthRatio,
                                   height: (geometry.size.height - 50) * 0.05)
                            .containerHelper(backgroundColor: Color(hex:0x171717), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                            .overlay(
                                Rectangle()
                                    .frame(height: 0.5)
                                    .foregroundColor(Color(hex:0xc1c1c1).opacity(0.4)),
                                alignment: .bottom
                            )
                            VStack {
                                if !isReplace {
                                    HStack(spacing: 0) {
                                        MainTextField(placeholder: "Search...", text: $directoryItemSearch)
                                            .lineLimit(1)
                                            .truncationMode(.tail)
                                            .textFieldStyle(PlainTextFieldStyle())
                                            .foregroundColor(.white)
                                            .font(.system(size: 10, weight: .heavy))
                                            .padding(.horizontal, 10)
                                            .frame(width: (geometry.size.width * leftPanelWidthRatio * 0.9) * 0.80, height: 32)
                                            .containerHelper(backgroundColor: Color(hex: 0x222222), borderColor: Color(hex:0x616161), borderWidth: 1, topLeft: 6, topRight: 0, bottomLeft: 6, bottomRight: 0, shadowColor: .clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                                            .hoverEffect(opacity: 0.8)
                                        HStack {
                                            MainButtonMain {
                                                isCaseSensitive.toggle()
                                            }
                                            .lineLimit(1)
                                            .truncationMode(.tail)
                                            .textFieldStyle(PlainTextFieldStyle())
                                            .foregroundColor(.white)
                                            .font(.system(size: 8))
                                            .overlay(
                                                Image(systemName: "a.square.fill")
                                                    .font(.system(size: 12, weight: .semibold))
                                                    .foregroundColor(isCaseSensitive ? Color(hex:0x5C2BE2) : Color(hex:0xf5f5f5))
                                                    .allowsHitTesting(false)
                                            )
                                            .hoverEffect(
                                                opacity: 0.6,
                                                scale: 1.05,
                                                cursor: .pointingHand
                                            )
                                        }
                                        .padding(.horizontal, 10)
                                        .frame(width: (geometry.size.width * leftPanelWidthRatio * 0.9) * 0.2, height: 32)
                                        .containerHelper(
                                            backgroundColor: Color(hex: 0x222222),
                                            borderColor: Color(hex:0x616161),
                                            borderWidth: 1,
                                            topLeft: 0, topRight: 6, bottomLeft: 0, bottomRight: 6,
                                            shadowColor: .clear, shadowRadius: 0, shadowX: 0, shadowY: 0
                                        )
                                    }
                                    .frame(width: (geometry.size.width * leftPanelWidthRatio) * 0.9)
                                    .onChange(of: directoryItemSearch) { newValue in
                                        searchDebounceTask?.cancel()
                                        let task = DispatchWorkItem {
                                            debouncedSearch = newValue
                                        }
                                        searchDebounceTask = task
                                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3, execute: task)
                                    }
                                    .containerHelper(
                                        backgroundColor: Color.clear,
                                        borderColor: Color(hex:0x616161),
                                        borderWidth: 1,
                                        topLeft: 6, topRight: 6, bottomLeft: 6, bottomRight: 6,
                                        shadowColor: Color.white.opacity(0.5), shadowRadius: 8, shadowX: 0, shadowY: 0
                                    )
                                }
                                if isReplace {
                                    HStack(spacing: 0) {
                                        MainTextField(placeholder: "Search all files...", text: $directoryItemSearch)
                                            .lineLimit(1)
                                            .truncationMode(.tail)
                                            .textFieldStyle(PlainTextFieldStyle())
                                            .foregroundColor(.white)
                                            .font(.system(size: 8, weight: .semibold))
                                            .padding(.horizontal, 10)
                                            .frame(width: (geometry.size.width * leftPanelWidthRatio * 0.9) * 0.65, height: 32)
                                            .containerHelper(backgroundColor: Color(hex: 0x222222), borderColor: Color(hex:0x616161), borderWidth: 1, topLeft: 6, topRight: 0, bottomLeft: 6, bottomRight: 0, shadowColor: .clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                                            .hoverEffect(opacity: 0.8)
                                        HStack {
                                            MainButtonMain {
                                                isCaseSensitive.toggle()
                                            }
                                            .lineLimit(1)
                                            .truncationMode(.tail)
                                            .textFieldStyle(PlainTextFieldStyle())
                                            .foregroundColor(.white)
                                            .font(.system(size: 8))
                                            .overlay(
                                                Image(systemName: "a.square.fill")
                                                    .font(.system(size: 12, weight: .semibold))
                                                    .foregroundColor(isCaseSensitive ? Color(hex:0x5C2BE2) : Color(hex:0xf5f5f5))
                                                    .allowsHitTesting(false)
                                            )
                                            .hoverEffect(
                                                opacity: 0.6,
                                                scale: 1.05,
                                                cursor: .pointingHand
                                            )
                                        }
                                        .padding(.horizontal, 10)
                                        .frame(width: (geometry.size.width * leftPanelWidthRatio * 0.9) * 0.35, height: 32)
                                        .containerHelper(
                                            backgroundColor: Color(hex: 0x222222),
                                            borderColor: Color(hex:0x616161),
                                            borderWidth: 1,
                                            topLeft: 0, topRight: 6, bottomLeft: 0, bottomRight: 6,
                                            shadowColor: .clear, shadowRadius: 0, shadowX: 0, shadowY: 0
                                        )
                                    }
                                    .frame(width: (geometry.size.width * leftPanelWidthRatio) * 0.9)
                                    .containerHelper(
                                        backgroundColor: Color.clear,
                                        borderColor: Color(hex:0x616161),
                                        borderWidth: 1,
                                        topLeft: 6, topRight: 6, bottomLeft: 6, bottomRight: 6,
                                        shadowColor: Color.white.opacity(0.5), shadowRadius: 8, shadowX: 0, shadowY: 0
                                    )
                                    .padding(.bottom, 6)
                                    HStack(spacing: 0) {
                                        MainTextField(placeholder: "Replace with...", text: $directoryItemSearch)
                                            .lineLimit(1)
                                            .truncationMode(.tail)
                                            .textFieldStyle(PlainTextFieldStyle())
                                            .foregroundColor(.white)
                                            .font(.system(size: 8, weight: .semibold))
                                            .padding(.horizontal, 10)
                                            .frame(width: (geometry.size.width * leftPanelWidthRatio * 0.9) * 0.65, height: 32)
                                            .containerHelper(backgroundColor: Color(hex: 0x222222), borderColor: Color(hex:0x616161), borderWidth: 1, topLeft: 6, topRight: 0, bottomLeft: 6, bottomRight: 0, shadowColor: .clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                                            .hoverEffect(opacity: 0.8)
                                        HStack {
                                            MainButtonMain {
                                            }
                                            .lineLimit(1)
                                            .truncationMode(.tail)
                                            .textFieldStyle(PlainTextFieldStyle())
                                            .foregroundColor(.white)
                                            .font(.system(size: 8))
                                            .overlay(
                                                Image(systemName: "square.fill")
                                                    .font(.system(size: 12, weight: .semibold))
                                                    .foregroundColor(Color(hex:0xf5f5f5))
                                                    .allowsHitTesting(false)
                                            )
                                            .hoverEffect(opacity: 0.6, scale: 1.05, cursor: .pointingHand)
                                            MainButtonMain {
                                            }
                                            .lineLimit(1)
                                            .truncationMode(.tail)
                                            .textFieldStyle(PlainTextFieldStyle())
                                            .foregroundColor(.white)
                                            .font(.system(size: 8))
                                            .overlay(
                                                Image(systemName: "square.grid.3x3.square")
                                                    .font(.system(size: 14, weight: .semibold))
                                                    .foregroundColor(Color(hex:0xf5f5f5))
                                                    .allowsHitTesting(false)
                                            )
                                            .hoverEffect(opacity: 0.6, scale: 1.05, cursor: .pointingHand)
                                        }
                                        .padding(.horizontal, 10)
                                        .frame(width: (geometry.size.width * leftPanelWidthRatio * 0.9) * 0.35, height: 32)
                                        .containerHelper(
                                            backgroundColor: Color(hex: 0x222222),
                                            borderColor: Color(hex:0x616161),
                                            borderWidth: 1,
                                            topLeft: 0, topRight: 6, bottomLeft: 0, bottomRight: 6,
                                            shadowColor: .clear, shadowRadius: 0, shadowX: 0, shadowY: 0
                                        )
                                    }
                                    .frame(width: (geometry.size.width * leftPanelWidthRatio) * 0.9)
                                    .containerHelper(
                                        backgroundColor: Color.clear,
                                        borderColor: Color(hex:0x616161),
                                        borderWidth: 1,
                                        topLeft: 6, topRight: 6, bottomLeft: 6, bottomRight: 6,
                                        shadowColor: Color.white.opacity(0.5), shadowRadius: 8, shadowX: 0, shadowY: 0
                                    )
                                }
                            }
                            .frame(width: geometry.size.width * leftPanelWidthRatio,
                                   height: !isReplace ? (geometry.size.height - 50) * 0.1 : (geometry.size.height - 50) * 0.2)
                            .containerHelper(backgroundColor: Color(hex:0x171717), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: Color.clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                            .overlay(
                                Rectangle()
                                    .frame(height: 0.5)
                                    .foregroundColor(Color(hex:0xc1c1c1).opacity(0.4)),
                                alignment: .bottom
                            )
                            VStack(spacing: 0) {
                                if isNavigatorLoading {
                                    HStack {
                                        Spacer()
                                        ProgressView()
                                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                            .padding(20)
                                            .background(
                                                RoundedRectangle(cornerRadius: 10)
                                                    .fill(Color.black.opacity(0.5))
                                            )
                                            .shadow(color: Color.black.opacity(0.3), radius: 5, x: 0, y: 3)
                                        Spacer()
                                    }
                                    .frame(width: geometry.size.width * leftPanelWidthRatio,
                                           height: !isReplace ? (geometry.size.height - 50) * 0.6 : (geometry.size.height - 50) * 0.5)
                                } else if let root = fileItems.first {
                                    HStack(alignment: .center, spacing: 0) {
                                        Image(systemName: rootIsExpanded ? "chevron.down" : "chevron.right")
                                            .resizable()
                                            .aspectRatio(contentMode: .fit)
                                            .frame(width: 8, height: 8, alignment: .center)
                                            .foregroundColor(.white.opacity(0.8))
                                            .padding(.trailing, 8)
                                        Text(root.url.lastPathComponent)
                                            .foregroundColor(.white)
                                            .font(.system(size: 10, weight: .semibold))
                                            .lineLimit(1)
                                            .truncationMode(.tail)
                                    }
                                    .padding(.vertical, 6)
                                    .padding(.horizontal, 12)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .containerHelper(backgroundColor: Color(hex:0x212121), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                                    .hoverEffect(opacity: 0.6, scale: 1.02, cursor: .pointingHand)
                                    .onTapGesture {
                                        rootIsExpanded.toggle()
                                    }
                                    if rootIsExpanded {
                                        ScrollView([.vertical, .horizontal], showsIndicators: true) {
                                            ScrollViewReader { proxy in
                                                VStack(spacing: 0) {
                                                    Color.clear
                                                        .frame(height: 0)
                                                        .id("top")
                                                    ForEach(displayedChildren) { child in
                                                        CollapsibleItemView(
                                                            item: child,
                                                            level: 1,
                                                            getIcon: { fileItem in
                                                                getIcon(forFileURL: fileItem.url)
                                                            },
                                                            onAddFile: addFile,
                                                            onAddFolder: addFolder,
                                                            onDeleteItem: deleteItem,
                                                            onCut: cutItem,
                                                            onCopy: copyItem,
                                                            onPaste: pasteItem,
                                                            onRename: renameItem,
                                                            onRevealInFinder: revealInFinder,
                                                            isPasteEnabled: (clipboardItem != nil),
                                                            onDropItem: handleDropItem,
                                                            onOpenFile: { fileItem in
                                                                openFileTab(url: fileItem.url)
                                                            }
                                                        )
                                                    }
                                                }
                                                .frame(
                                                    minWidth: geometry.size.width * leftPanelWidthRatio,
                                                    minHeight: (geometry.size.height - 50) * 0.55,
                                                    alignment: .topLeading
                                                )
                                                .padding(.bottom, 8)
                                                .onChange(of: debouncedSearch) { _ in
                                                    proxy.scrollTo("top", anchor: .topLeading)
                                                }
                                                .onAppear {
                                                    DispatchQueue.main.async {
                                                        proxy.scrollTo("top", anchor: .topLeading)
                                                    }
                                                }
                                            }
                                        }
                                    } else {
                                        Spacer()
                                    }
                                }
                            }
                            .frame(width: geometry.size.width * leftPanelWidthRatio,
                                   height: !isReplace ? (geometry.size.height - 50) * 0.6 : (geometry.size.height - 50) * 0.5)
                            .containerHelper(backgroundColor: Color(hex:0x171717), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                            .overlay(
                                Rectangle()
                                    .frame(height: 0.5)
                                    .foregroundColor(Color(hex:0xc1c1c1).opacity(0.4)),
                                alignment: .bottom
                            )
                            HStack {
                                HStack {
                                    MainButtonMain {
                                    }
                                    .containerHelper(backgroundColor: Color.clear, borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: Color.clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                                    .frame(width: 18, height: 18)
                                    .overlay(
                                        Image(systemName: "person.circle")
                                            .font(.system(size: 11, weight: .semibold))
                                            .foregroundColor(Color(hex: 0xf5f5f5).opacity(0.8))
                                            .allowsHitTesting(false)
                                    )
                                    .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                                }
                                .frame(height: (geometry.size.height - 50) * 0.05)
                                .padding(.horizontal, 10)
                                .containerHelper(backgroundColor: Color(hex:0x111111), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: Color.clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                                .overlay(
                                    Rectangle()
                                        .frame(width: 0.5)
                                        .foregroundColor(Color(hex:0xc1c1c1).opacity(0.4)),
                                    alignment: .trailing
                                )
                                Spacer()
                            }
                            .frame(width: geometry.size.width * leftPanelWidthRatio,
                                   height: (geometry.size.height - 50) * 0.05)
                            .containerHelper(backgroundColor: Color(hex:0x171717), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                            .overlay(
                                Rectangle()
                                    .frame(height: 0.5)
                                    .foregroundColor(Color(hex:0xc1c1c1).opacity(0.4)),
                                alignment: .bottom
                            )
                        }
                        .contextMenu {
                            if let root = fileItems.first {
                                Button("Add File") {
                                    addFile(to: root)
                                }
                                Button("Add Folder") {
                                    addFolder(to: root)
                                }
                                Button("Delete") {
                                    deleteItem(root)
                                }
                                Divider()
                                Button("Cut") {
                                    cutItem(root)
                                }
                                .disabled(true)
                                Button("Copy") {
                                    copyItem(root)
                                }
                                .disabled(true)
                                Button("Paste") {
                                    pasteItem(root)
                                }
                                .disabled(clipboardItem == nil || !root.isDirectory)
                                Button("Rename") {
                                    renameItem(root)
                                }
                                .disabled(true)
                                Button("Reveal in Finder") {
                                    revealInFinder(root)
                                }
                                .disabled(true)
                                Divider()
                                Button("Copy Relative Path") {
                                    let relative = relativePath(itemURL: root.url)
                                    NSPasteboard.general.clearContents()
                                    NSPasteboard.general.setString(relative, forType: .string)
                                }
                                Button("Copy Full Path") {
                                    NSPasteboard.general.clearContents()
                                    NSPasteboard.general.setString(root.url.path, forType: .string)
                                }
                            } else {
                                Button("Add File") {}.disabled(true)
                                Button("Add Folder") {}.disabled(true)
                                Button("Delete") {}.disabled(true)
                                Divider()
                                Button("Cut") {}.disabled(true)
                                Button("Copy") {}.disabled(true)
                                Button("Paste") {}.disabled(true)
                                Button("Rename") {}.disabled(true)
                                Button("Reveal in Finder") {}.disabled(true)
                                Divider()
                                Button("Copy Relative Path") {}.disabled(true)
                                Button("Copy Full Path") {}.disabled(true)
                            }
                        }
                        Rectangle()
                            .foregroundColor(Color(hex:0xc1c1c1).opacity(0.1))
                            .frame(width: 2)
                            .gesture(
                                DragGesture()
                                    .onChanged { value in
                                        let newRatio = ((leftPanelWidthRatio * geometry.size.width) + value.translation.width) / geometry.size.width
                                        leftPanelWidthRatio = min(max(newRatio, 0.1), 0.9)
                                    }
                            )
                            .hoverEffect(opacity: 0.5, cursor: .resizeLeftRight)
                            .clickEffect(opacity: 1.0, cursor: .resizeLeftRight)
                        VStack(spacing: 0) {
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 0) {
                                    if openTabs.isEmpty {
                                        HStack(spacing: 4) {
                                            Image(systemName: "wand.and.stars")
                                                .resizable()
                                                .aspectRatio(contentMode: .fit)
                                                .frame(width: 12, height: 12)
                                                .padding(.trailing, 4)
                                                .allowsHitTesting(false)
                                                .hoverEffect(opacity: 0.8, cursor: .pointingHand)
                                            Text("Get Started")
                                                .foregroundColor(.white.opacity(0.8))
                                                .font(.system(size: 9, weight: .bold))
                                                .lineLimit(1)
                                                .truncationMode(.tail)
                                                .allowsHitTesting(false)
                                                .hoverEffect(opacity: 0.8, cursor: .pointingHand)
                                        }
                                        .frame(height: (geometry.size.height - 50) * 0.05)
                                        .padding(.horizontal, 12)
                                        .background(Color(hex: 0xAD6ADD).opacity(0.2))
                                        .overlay(
                                            Rectangle()
                                                .frame(width: 0.5)
                                                .foregroundColor(Color(hex: 0xc1c1c1).opacity(0.2)),
                                            alignment: .trailing
                                        )
                                    } else {
                                        ForEach(openTabs) { tab in
                                            HStack(spacing: 4) {
                                                Image(getIcon(forFileURL: tab.fileURL))
                                                    .resizable()
                                                    .aspectRatio(contentMode: .fit)
                                                    .frame(width: 12, height: 12)
                                                    .padding(.trailing, 4)
                                                    .allowsHitTesting(false)
                                                    .hoverEffect(opacity: 0.8, cursor: .pointingHand)
                                                Text(tab.fileName)
                                                    .foregroundColor(.white.opacity(0.8))
                                                    .font(.system(size: 9, weight: .bold))
                                                    .lineLimit(1)
                                                    .allowsHitTesting(false)
                                                    .hoverEffect(opacity: 0.8, cursor: .pointingHand)
                                                Button(action: {
                                                    closeTab(tab)
                                                }) {
                                                    Image(systemName: "xmark")
                                                        .font(.system(size: 8, weight: .bold))
                                                        .foregroundColor(.white.opacity(0.8))
                                                        .allowsHitTesting(false)
                                                        .hoverEffect(opacity: 0.8, cursor: .pointingHand)
                                                }
                                                .buttonStyle(PlainButtonStyle())
                                                .padding(.leading, 6)
                                            }
                                            .frame(height: (geometry.size.height - 50) * 0.05)
                                            .padding(.horizontal, 12)
                                            .background(activeTabId == tab.id ? Color(hex: 0xAD6ADD).opacity(0.2) : Color(hex: 0xFFFFFF).opacity(0.05))
                                            .overlay(
                                                Rectangle()
                                                    .frame(width: 0.5)
                                                    .foregroundColor(Color(hex: 0xc1c1c1).opacity(0.2)),
                                                alignment: .trailing
                                            )
                                            .onTapGesture {
                                                activeTabId = tab.id
                                                noFileSelected = false
                                            }
                                            .onDrag {
                                                self.draggingTab = tab
                                                return NSItemProvider(object: tab.id.uuidString as NSString)
                                            }
                                            .onDrop(of: ["public.text"],
                                                    delegate: TabDropDelegate(item: tab,
                                                                             currentTabs: $openTabs,
                                                                             draggingTab: $draggingTab))
                                        }
                                    }
                                }
                                .frame(maxWidth: .infinity, alignment: .leading)
                            }
                            .frame(width: geometry.size.width * (1 - leftPanelWidthRatio),
                                   height: (geometry.size.height - 50) * 0.05)
                            .containerHelper(backgroundColor: Color(hex: 0x171717),
                                             borderColor: Color.clear,
                                             borderWidth: 0,
                                             topLeft: 0,
                                             topRight: 0,
                                             bottomLeft: 0,
                                             bottomRight: 0,
                                             shadowColor: .clear,
                                             shadowRadius: 0,
                                             shadowX: 0,
                                             shadowY: 0)
                            .overlay(
                                Rectangle()
                                    .frame(height: 0.5)
                                    .foregroundColor(Color(hex: 0xc1c1c1).opacity(0.4)),
                                alignment: .bottom
                            )
                            VStack {
                                if let activeTab = openTabs.first(where: { $0.id == activeTabId }) {
                                    Text(editorPlaceholderText(for: activeTab.fileURL))
                                        .foregroundColor(.white)
                                        .font(.system(size: 14))
                                } else if noFileSelected {
                                    Spacer()
                                    HStack {
                                        Spacer()
                                        VStack {
                                            HStack {
                                                VStack(alignment: .leading, spacing: 0) {
                                                    Text("Dino Labs Playground")
                                                        .font(.system(size: 24, weight: .semibold))
                                                        .foregroundColor(Color.white.opacity(0.9))
                                                        .shadow(color: .white.opacity(0.5), radius: 0.5, x: 0, y: 0)
                                                        .padding(.bottom, 8)
                                                    Text("Version 1.0.0 (Beta)")
                                                        .font(.system(size: 14, weight: .regular))
                                                        .foregroundColor(Color.white.opacity(0.6))
                                                    HStack {
                                                        VStack(alignment: .leading) {
                                                            MainButtonMain {
                                                                loadDirectory()
                                                            }
                                                            .frame(width: (geometry.size.width * leftPanelWidthRatio), height: 12)
                                                            .padding(.vertical, 10)
                                                            .containerHelper(backgroundColor: Color(hex:0x111111), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                                                            .overlay(
                                                                HStack {
                                                                    Image(systemName: "folder.fill")
                                                                        .resizable()
                                                                        .aspectRatio(contentMode: .fit)
                                                                        .frame(width: 12, height: 12)
                                                                        .foregroundColor(Color(hex:0x9b59b6))
                                                                        .padding(.trailing, 4)
                                                                        .allowsHitTesting(false)
                                                                    Text("Load Directory")
                                                                        .foregroundColor(Color(hex:0x9b59b6))
                                                                        .font(.system(size: 12, weight: .semibold))
                                                                        .lineLimit(1)
                                                                        .truncationMode(.tail)
                                                                        .allowsHitTesting(false)
                                                                    Spacer()
                                                                }
                                                                .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                                                            )
                                                            .padding(.leading, 8)
                                                            .padding(.vertical, 2)
                                                            MainButtonMain {
                                                                loadFile()
                                                            }
                                                            .frame(width: (geometry.size.width * leftPanelWidthRatio), height: 12)
                                                            .containerHelper(backgroundColor: Color(hex:0x111111), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                                                            .overlay(
                                                                HStack {
                                                                    Image(systemName: "doc.text")
                                                                        .resizable()
                                                                        .aspectRatio(contentMode: .fit)
                                                                        .frame(width: 12, height: 12)
                                                                        .foregroundColor(Color(hex:0x9b59b6))
                                                                        .padding(.trailing, 4)
                                                                        .allowsHitTesting(false)
                                                                    Text("Load File")
                                                                        .foregroundColor(Color(hex:0x9b59b6))
                                                                        .font(.system(size: 12, weight: .semibold))
                                                                        .lineLimit(1)
                                                                        .truncationMode(.tail)
                                                                        .allowsHitTesting(false)
                                                                    Spacer()
                                                                }
                                                                .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                                                            )
                                                            .padding(.leading, 8)
                                                            .padding(.vertical, 2)
                                                        }
                                                        Spacer()
                                                    }
                                                    .padding(.top, 30)
                                                }
                                                Spacer()
                                            }
                                            .padding(.leading, 20)
                                            .padding(.top, 20)
                                            Spacer()
                                        }
                                        .frame(width: (geometry.size.width * (1 - leftPanelWidthRatio) * 0.55))
                                        .frame(height: ((geometry.size.height - 50) * 0.9) * 0.44)
                                        .containerHelper(
                                            backgroundColor: Color(hex:0x111111),
                                            borderColor: Color.clear,
                                            borderWidth: 0,
                                            topLeft: 6, topRight: 6, bottomLeft: 6, bottomRight: 6,
                                            shadowColor: .black, shadowRadius: 2, shadowX: 0, shadowY: 0
                                        )
                                        Spacer()
                                        VStack {
                                            if usageLanguagesData.isEmpty {
                                                HStack {
                                                    Spacer()
                                                    ProgressView()
                                                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                                    Spacer()
                                                }
                                            } else {
                                                ScrollView {
                                                    VStack(alignment: .leading) {
                                                        ForEach(usageLanguagesData.prefix(5)) { language in
                                                            VStack(alignment: .leading) {
                                                                HStack {
                                                                    Text(language.language)
                                                                        .foregroundColor(.white.opacity(0.7))
                                                                        .font(.system(size: 12, weight: .semibold))
                                                                    Spacer()
                                                                    Text(String(format: "%.1f%%", language.percentage))
                                                                        .foregroundColor(.white.opacity(0.7))
                                                                        .font(.system(size: 10, weight: .regular))
                                                                }
                                                                .padding(.bottom, 2)
                                                                GeometryReader { geo in
                                                                    ZStack(alignment: .leading) {
                                                                        Rectangle()
                                                                            .frame(width: geo.size.width, height: 10)
                                                                            .foregroundColor(Color(hex: 0x616161).opacity(0.4))
                                                                            .cornerRadius(4)
                                                                        Rectangle()
                                                                            .frame(width: geo.size.width * CGFloat(language.percentage / 100.0), height: 10)
                                                                            .foregroundColor(colorForLanguage(language.language))
                                                                            .cornerRadius(4)
                                                                    }
                                                                }
                                                                .frame(height: 6)
                                                            }
                                                            .padding(.vertical, 8)
                                                            .padding(.horizontal, 14)
                                                        }
                                                    }
                                                    .frame(maxWidth: .infinity, alignment: .topLeading)
                                                    .padding(.horizontal, 10)
                                                    .padding(.vertical, 8)
                                                }
                                            }
                                        }
                                        .frame(width: (geometry.size.width * (1 - leftPanelWidthRatio) * 0.35))
                                        .frame(height: ((geometry.size.height - 50) * 0.9) * 0.44)
                                        .containerHelper(
                                            backgroundColor: Color(hex:0x111111),
                                            borderColor: Color.clear,
                                            borderWidth: 0,
                                            topLeft: 6, topRight: 6, bottomLeft: 6, bottomRight: 6,
                                            shadowColor: .black, shadowRadius: 2, shadowX: 0, shadowY: 0
                                        )
                                        Spacer()
                                    }
                                    .frame(width: geometry.size.width * (1 - leftPanelWidthRatio))
                                    .frame(height: ((geometry.size.height - 50) * 0.9) * 0.44)
                                    Spacer()
                                    HStack {
                                        Spacer()
                                        VStack {
                                            if personalUsageData.isEmpty {
                                                HStack {
                                                    Spacer()
                                                    ProgressView()
                                                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                                    Spacer()
                                                }
                                            } else {
                                                HStack {
                                                    VStack(alignment: .leading, spacing: 0) {
                                                        Text("Personal Usage")
                                                            .font(.system(size: 18, weight: .semibold))
                                                            .foregroundColor(Color.white.opacity(0.7))
                                                            .shadow(color: .white.opacity(0.5), radius: 0.5, x: 0, y: 0)
                                                            .padding(.bottom, 4)
                                                        Text("Edits Saved In Last 30 Days")
                                                            .font(.system(size: 10, weight: .regular))
                                                            .foregroundColor(Color.white.opacity(0.5))
                                                    }
                                                    Spacer()
                                                }
                                                .padding(.leading, 20)
                                                .padding(.top, 20)
                                                LineChartView(series1Name: "Edits Saved",
                                                              series1Data: $personalUsageData,
                                                              series2Name: nil,
                                                              series2Data: .constant(nil),
                                                              showGrid: false)
                                            }
                                        }
                                        .frame(width: (geometry.size.width * (1 - leftPanelWidthRatio) * 0.55))
                                        .frame(height: ((geometry.size.height - 50) * 0.9) * 0.44)
                                        .containerHelper(
                                            backgroundColor: Color(hex:0x111111),
                                            borderColor: Color.clear,
                                            borderWidth: 0,
                                            topLeft: 6, topRight: 6, bottomLeft: 6, bottomRight: 6,
                                            shadowColor: .black, shadowRadius: 2, shadowX: 0, shadowY: 0
                                        )
                                        Spacer()
                                        VStack {
                                            if usageDoughnutData.isEmpty {
                                                HStack {
                                                    Spacer()
                                                    ProgressView()
                                                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                                    Spacer()
                                                }
                                            } else {
                                                DoughnutPlot(cellType: "languageUsage",
                                                             data: $usageDoughnutData,
                                                             organizationName: "",
                                                             fontSizeMultiplier: 1.0)
                                            }
                                        }
                                        .frame(width: (geometry.size.width * (1 - leftPanelWidthRatio) * 0.35))
                                        .frame(height: ((geometry.size.height - 50) * 0.9) * 0.44)
                                        .containerHelper(
                                            backgroundColor: Color(hex:0x111111),
                                            borderColor: Color.clear,
                                            borderWidth: 0,
                                            topLeft: 6, topRight: 6, bottomLeft: 6, bottomRight: 6,
                                            shadowColor: .black, shadowRadius: 2, shadowX: 0, shadowY: 0
                                        )
                                        Spacer()
                                    }
                                    .frame(width: geometry.size.width * (1 - leftPanelWidthRatio))
                                    .frame(height: ((geometry.size.height - 50) * 0.9) * 0.44)
                                    Spacer()
                                }
                            }
                            .frame(width: geometry.size.width * (1 - leftPanelWidthRatio),
                                   height: (geometry.size.height - 50) * 0.9)
                            .containerHelper(backgroundColor: Color(hex:0x242424), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                            .overlay(
                                Rectangle()
                                    .frame(height: 0.5)
                                    .foregroundColor(Color(hex:0xc1c1c1).opacity(0.4)),
                                alignment: .bottom
                            )
                            HStack {
                                Spacer()
                                HStack {
                                    MainButtonMain {
                                    }
                                    .containerHelper(backgroundColor: Color.clear, borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: Color.clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                                    .frame(width: 18, height: 18)
                                    .overlay(
                                        Image(systemName: "magnifyingglass")
                                            .font(.system(size: 9, weight: .semibold))
                                            .foregroundColor(Color(hex: 0xf5f5f5).opacity(0.8))
                                            .allowsHitTesting(false)
                                    )
                                    .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                                    MainButtonMain {
                                    }
                                    .containerHelper(backgroundColor: Color.clear, borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: Color.clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                                    .frame(width: 18, height: 18)
                                    .overlay(
                                        Image(systemName: "plus.magnifyingglass")
                                            .font(.system(size: 9, weight: .semibold))
                                            .foregroundColor(Color(hex: 0xf5f5f5).opacity(0.8))
                                            .allowsHitTesting(false)
                                    )
                                    .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                                    MainButtonMain {
                                    }
                                    .containerHelper(backgroundColor: Color.clear, borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: Color.clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                                    .frame(width: 18, height: 18)
                                    .overlay(
                                        Image(systemName: "arrow.clockwise")
                                            .font(.system(size: 9, weight: .semibold))
                                            .foregroundColor(Color(hex: 0xf5f5f5).opacity(0.8))
                                            .allowsHitTesting(false)
                                    )
                                    .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                                }
                                .frame(height: (geometry.size.height - 50) * 0.05)
                                .padding(.horizontal, 10)
                                .containerHelper(backgroundColor: Color(hex:0x111111), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: Color.clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                                .overlay(
                                    Rectangle()
                                        .frame(width: 0.5)
                                        .foregroundColor(Color(hex:0xc1c1c1).opacity(0.4)),
                                    alignment: .leading
                                )
                            }
                            .frame(width: geometry.size.width * (1 - leftPanelWidthRatio),
                                   height: (geometry.size.height - 50) * 0.05)
                            .containerHelper(backgroundColor: Color(hex:0x171717), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: Color.clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                            .overlay(
                                Rectangle()
                                    .frame(height: 0.5)
                                    .foregroundColor(Color(hex:0xc1c1c1).opacity(0.4)),
                                alignment: .bottom
                            )
                        }
                        .contextMenu {
                            if let root = fileItems.first {
                                Button("Add File") {
                                    addFile(to: root)
                                }
                                Button("Add Folder") {
                                    addFolder(to: root)
                                }
                                Button("Delete") {
                                    deleteItem(root)
                                }
                                Divider()
                                Button("Cut") {
                                    cutItem(root)
                                }
                                .disabled(true)
                                Button("Copy") {
                                    copyItem(root)
                                }
                                .disabled(true)
                                Button("Paste") {
                                    pasteItem(root)
                                }
                                .disabled(clipboardItem == nil || !root.isDirectory)
                                Button("Rename") {
                                    renameItem(root)
                                }
                                .disabled(true)
                                Button("Reveal in Finder") {
                                    revealInFinder(root)
                                }
                                .disabled(true)
                                Divider()
                                Button("Copy Relative Path") {
                                    let relative = relativePath(itemURL: root.url)
                                    NSPasteboard.general.clearContents()
                                    NSPasteboard.general.setString(relative, forType: .string)
                                }
                                Button("Copy Full Path") {
                                    NSPasteboard.general.clearContents()
                                    NSPasteboard.general.setString(root.url.path, forType: .string)
                                }
                            } else {
                                Button("Add File") {}.disabled(true)
                                Button("Add Folder") {}.disabled(true)
                                Button("Delete") {}.disabled(true)
                                Divider()
                                Button("Cut") {}.disabled(true)
                                Button("Copy") {}.disabled(true)
                                Button("Paste") {}.disabled(true)
                                Button("Rename") {}.disabled(true)
                                Button("Reveal in Finder") {}.disabled(true)
                                Divider()
                                Button("Copy Relative Path") {}.disabled(true)
                                Button("Copy Full Path") {}.disabled(true)
                            }
                        }
                        Rectangle()
                            .foregroundColor(Color(hex:0xc1c1c1).opacity(0.1))
                            .frame(width: 2)
                            .gesture(
                                DragGesture()
                                    .onChanged { value in
                                        let newRatio = ((leftPanelWidthRatio * geometry.size.width) + value.translation.width) / geometry.size.width
                                        leftPanelWidthRatio = min(max(newRatio, 0.1), 0.9)
                                    }
                            )
                            .hoverEffect(opacity: 0.5, cursor: .resizeLeftRight)
                            .clickEffect(opacity: 1.0, cursor: .resizeLeftRight)
                        VStack(spacing: 0) {
                            HStack { }
                            .frame(width: geometry.size.width * (1 - leftPanelWidthRatio),
                                   height: (geometry.size.height - 50) * 0.05)
                            .containerHelper(backgroundColor: Color(hex:0x171717), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                            .overlay(
                                Rectangle()
                                    .frame(height: 0.5)
                                    .foregroundColor(Color(hex:0xc1c1c1).opacity(0.4)),
                                alignment: .bottom
                            )
                            VStack {
                                if noFileSelected {
                                    Spacer()
                                    HStack {
                                        Spacer()
                                        VStack {
                                            HStack {
                                                VStack(alignment: .leading, spacing: 0) {
                                                    Text("Dino Labs Playground")
                                                        .font(.system(size: 24, weight: .semibold))
                                                        .foregroundColor(Color.white.opacity(0.9))
                                                        .shadow(color: .white.opacity(0.5), radius: 0.5, x: 0, y: 0)
                                                        .padding(.bottom, 8)
                                                    Text("Version 1.0.0 (Beta)")
                                                        .font(.system(size: 14, weight: .regular))
                                                        .foregroundColor(Color.white.opacity(0.6))
                                                    HStack {
                                                        VStack(alignment: .leading) {
                                                            MainButtonMain {
                                                                loadDirectory()
                                                            }
                                                            .frame(width: (geometry.size.width * leftPanelWidthRatio), height: 12)
                                                            .padding(.vertical, 10)
                                                            .containerHelper(backgroundColor: Color(hex:0x111111), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                                                            .overlay(
                                                                HStack {
                                                                    Image(systemName: "folder.fill")
                                                                        .resizable()
                                                                        .aspectRatio(contentMode: .fit)
                                                                        .frame(width: 12, height: 12)
                                                                        .foregroundColor(Color(hex:0x9b59b6))
                                                                        .padding(.trailing, 4)
                                                                        .allowsHitTesting(false)
                                                                    Text("Load Directory")
                                                                        .foregroundColor(Color(hex:0x9b59b6))
                                                                        .font(.system(size: 12, weight: .semibold))
                                                                        .lineLimit(1)
                                                                        .truncationMode(.tail)
                                                                        .allowsHitTesting(false)
                                                                    Spacer()
                                                                }
                                                                .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                                                            )
                                                            .padding(.leading, 8)
                                                            .padding(.vertical, 2)
                                                            MainButtonMain {
                                                                loadFile()
                                                            }
                                                            .frame(width: (geometry.size.width * leftPanelWidthRatio), height: 12)
                                                            .containerHelper(backgroundColor: Color(hex:0x111111), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                                                            .overlay(
                                                                HStack {
                                                                    Image(systemName: "doc.text")
                                                                        .resizable()
                                                                        .aspectRatio(contentMode: .fit)
                                                                        .frame(width: 12, height: 12)
                                                                        .foregroundColor(Color(hex:0x9b59b6))
                                                                        .padding(.trailing, 4)
                                                                        .allowsHitTesting(false)
                                                                    Text("Load File")
                                                                        .foregroundColor(Color(hex:0x9b59b6))
                                                                        .font(.system(size: 12, weight: .semibold))
                                                                        .lineLimit(1)
                                                                        .truncationMode(.tail)
                                                                        .allowsHitTesting(false)
                                                                    Spacer()
                                                                }
                                                                .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                                                            )
                                                            .padding(.leading, 8)
                                                            .padding(.vertical, 2)
                                                        }
                                                        Spacer()
                                                    }
                                                    .padding(.top, 30)
                                                }
                                                Spacer()
                                            }
                                            .padding(.leading, 20)
                                            .padding(.top, 20)
                                            Spacer()
                                        }
                                        .frame(width: (geometry.size.width * (1 - leftPanelWidthRatio) * 0.55))
                                        .frame(height: ((geometry.size.height - 50) * 0.9) * 0.44)
                                        .containerHelper(
                                            backgroundColor: Color(hex:0x111111),
                                            borderColor: Color.clear,
                                            borderWidth: 0,
                                            topLeft: 6, topRight: 6, bottomLeft: 6, bottomRight: 6,
                                            shadowColor: .black, shadowRadius: 2, shadowX: 0, shadowY: 0
                                        )
                                        Spacer()
                                        VStack {
                                            if usageLanguagesData.isEmpty {
                                                HStack {
                                                    Spacer()
                                                    ProgressView()
                                                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                                    Spacer()
                                                }
                                            } else {
                                                ScrollView {
                                                    VStack(alignment: .leading) {
                                                        ForEach(usageLanguagesData.prefix(5)) { language in
                                                            VStack(alignment: .leading) {
                                                                HStack {
                                                                    Text(language.language)
                                                                        .foregroundColor(.white.opacity(0.7))
                                                                        .font(.system(size: 12, weight: .semibold))
                                                                    Spacer()
                                                                    Text(String(format: "%.1f%%", language.percentage))
                                                                        .foregroundColor(.white.opacity(0.7))
                                                                        .font(.system(size: 10, weight: .regular))
                                                                }
                                                                .padding(.bottom, 2)
                                                                GeometryReader { geo in
                                                                    ZStack(alignment: .leading) {
                                                                        Rectangle()
                                                                            .frame(width: geo.size.width, height: 10)
                                                                            .foregroundColor(Color(hex: 0x616161).opacity(0.4))
                                                                            .cornerRadius(4)
                                                                        Rectangle()
                                                                            .frame(width: geo.size.width * CGFloat(language.percentage / 100.0), height: 10)
                                                                            .foregroundColor(colorForLanguage(language.language))
                                                                            .cornerRadius(4)
                                                                    }
                                                                }
                                                                .frame(height: 6)
                                                            }
                                                            .padding(.vertical, 8)
                                                            .padding(.horizontal, 14)
                                                        }
                                                    }
                                                    .frame(maxWidth: .infinity, alignment: .topLeading)
                                                    .padding(.horizontal, 10)
                                                    .padding(.vertical, 8)
                                                }
                                            }
                                        }
                                        .frame(width: (geometry.size.width * (1 - leftPanelWidthRatio) * 0.35))
                                        .frame(height: ((geometry.size.height - 50) * 0.9) * 0.44)
                                        .containerHelper(
                                            backgroundColor: Color(hex:0x111111),
                                            borderColor: Color.clear,
                                            borderWidth: 0,
                                            topLeft: 6, topRight: 6, bottomLeft: 6, bottomRight: 6,
                                            shadowColor: .black, shadowRadius: 2, shadowX: 0, shadowY: 0
                                        )
                                        Spacer()
                                    }
                                    .frame(width: geometry.size.width * (1 - leftPanelWidthRatio))
                                    .frame(height: ((geometry.size.height - 50) * 0.9) * 0.44)
                                    Spacer()
                                    HStack {
                                        Spacer()
                                        VStack {
                                            if personalUsageData.isEmpty {
                                                HStack {
                                                    Spacer()
                                                    ProgressView()
                                                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                                    Spacer()
                                                }
                                            } else {
                                                HStack {
                                                    VStack(alignment: .leading, spacing: 0) {
                                                        Text("Personal Usage")
                                                            .font(.system(size: 18, weight: .semibold))
                                                            .foregroundColor(Color.white.opacity(0.7))
                                                            .shadow(color: .white.opacity(0.5), radius: 0.5, x: 0, y: 0)
                                                            .padding(.bottom, 4)
                                                        Text("Edits Saved In Last 30 Days")
                                                            .font(.system(size: 10, weight: .regular))
                                                            .foregroundColor(Color.white.opacity(0.5))
                                                    }
                                                    Spacer()
                                                }
                                                .padding(.leading, 20)
                                                .padding(.top, 20)
                                                LineChartView(series1Name: "Edits Saved",
                                                              series1Data: $personalUsageData,
                                                              series2Name: nil,
                                                              series2Data: .constant(nil),
                                                              showGrid: false)
                                            }
                                        }
                                        .frame(width: (geometry.size.width * (1 - leftPanelWidthRatio) * 0.55))
                                        .frame(height: ((geometry.size.height - 50) * 0.9) * 0.44)
                                        .containerHelper(
                                            backgroundColor: Color(hex:0x111111),
                                            borderColor: Color.clear,
                                            borderWidth: 0,
                                            topLeft: 6, topRight: 6, bottomLeft: 6, bottomRight: 6,
                                            shadowColor: .black, shadowRadius: 2, shadowX: 0, shadowY: 0
                                        )
                                        Spacer()
                                        VStack {
                                            if usageDoughnutData.isEmpty {
                                                HStack {
                                                    Spacer()
                                                    ProgressView()
                                                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                                    Spacer()
                                                }
                                            } else {
                                                DoughnutPlot(cellType: "languageUsage",
                                                             data: $usageDoughnutData,
                                                             organizationName: "",
                                                             fontSizeMultiplier: 1.0)
                                            }
                                        }
                                        .frame(width: (geometry.size.width * (1 - leftPanelWidthRatio) * 0.35))
                                        .frame(height: ((geometry.size.height - 50) * 0.9) * 0.44)
                                        .containerHelper(
                                            backgroundColor: Color(hex:0x111111),
                                            borderColor: Color.clear,
                                            borderWidth: 0,
                                            topLeft: 6, topRight: 6, bottomLeft: 6, bottomRight: 6,
                                            shadowColor: .black, shadowRadius: 2, shadowX: 0, shadowY: 0
                                        )
                                        Spacer()
                                    }
                                    .frame(width: geometry.size.width * (1 - leftPanelWidthRatio))
                                    .frame(height: ((geometry.size.height - 50) * 0.9) * 0.44)
                                    Spacer()
                                }
                            }
                            .frame(width: geometry.size.width * (1 - leftPanelWidthRatio),
                                   height: (geometry.size.height - 50) * 0.9)
                            .containerHelper(backgroundColor: Color(hex:0x242424), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                            .overlay(
                                Rectangle()
                                    .frame(height: 0.5)
                                    .foregroundColor(Color(hex:0xc1c1c1).opacity(0.4)),
                                alignment: .bottom
                            )
                            HStack {
                                Spacer()
                                HStack {
                                    MainButtonMain {
                                    }
                                    .containerHelper(backgroundColor: Color.clear, borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: Color.clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                                    .frame(width: 18, height: 18)
                                    .overlay(
                                        Image(systemName: "magnifyingglass")
                                            .font(.system(size: 9, weight: .semibold))
                                            .foregroundColor(Color(hex: 0xf5f5f5).opacity(0.8))
                                            .allowsHitTesting(false)
                                    )
                                    .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                                    MainButtonMain {
                                    }
                                    .containerHelper(backgroundColor: Color.clear, borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: Color.clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                                    .frame(width: 18, height: 18)
                                    .overlay(
                                        Image(systemName: "plus.magnifyingglass")
                                            .font(.system(size: 9, weight: .semibold))
                                            .foregroundColor(Color(hex: 0xf5f5f5).opacity(0.8))
                                            .allowsHitTesting(false)
                                    )
                                    .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                                    MainButtonMain {
                                    }
                                    .containerHelper(backgroundColor: Color.clear, borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: Color.clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                                    .frame(width: 18, height: 18)
                                    .overlay(
                                        Image(systemName: "arrow.clockwise")
                                            .font(.system(size: 9, weight: .semibold))
                                            .foregroundColor(Color(hex: 0xf5f5f5).opacity(0.8))
                                            .allowsHitTesting(false)
                                    )
                                    .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                                }
                                .frame(height: (geometry.size.height - 50) * 0.05)
                                .padding(.horizontal, 10)
                                .containerHelper(backgroundColor: Color(hex:0x111111), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: Color.clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                                .overlay(
                                    Rectangle()
                                        .frame(width: 0.5)
                                        .foregroundColor(Color(hex:0xc1c1c1).opacity(0.4)),
                                    alignment: .leading
                                )
                            }
                            .frame(width: geometry.size.width * (1 - leftPanelWidthRatio),
                                   height: (geometry.size.height - 50) * 0.05)
                            .containerHelper(backgroundColor: Color(hex:0x171717), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: Color.clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                            .overlay(
                                Rectangle()
                                    .frame(height: 0.5)
                                    .foregroundColor(Color(hex:0xc1c1c1).opacity(0.4)),
                                alignment: .bottom
                            )
                        }
                    }
                    Spacer()
                }
                NavigationBar(geometry: geometry, currentView: $currentView)
                    .frame(width: geometry.size.width)
                DinoLabsAlert(
                    geometry: geometry,
                    visible: showAlert,
                    title: alertTitle,
                    message: alertMessage,
                    inputs: alertInputs,
                    showCancel: showCancelButton,
                    onConfirm: { result in
                        showAlert = false
                        onConfirmAction?(result)
                    },
                    onCancel: {
                        showAlert = false
                    }
                )
                .frame(width: geometry.size.width)
            }
        }
        .onAppear {
            if noFileSelected {
                fetchUsageData()
            }
        }
    }
    
    private func fetchUsageData() {
        guard let url = URL(string: "https://www.dinolaboratories.com/dinolabs/dinolabs-web-api/usage-info") else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        if let token = loadTokenFromKeychain() {
            request.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        let userID = UserDefaults.standard.string(forKey: "userID") ?? "userID_placeholder"
        let organizationID = UserDefaults.standard.string(forKey: "orgID") ?? "orgID_placeholder"
        let body: [String: Any] = ["userID": userID, "organizationID": organizationID]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body, options: [])
        URLSession.shared.dataTask(with: request) { data, response, error in
            guard let data = data else { return }
            do {
                let usageResponse = try JSONDecoder().decode(UsageResponse.self, from: data)
                DispatchQueue.main.async {
                    processUsageResponse(response: usageResponse)
                }
            } catch {
                return
            }
        }.resume()
    }
    
    private func processUsageResponse(response: UsageResponse) {
        var totalLanguageCount = 0
        var langs: [LanguageUsage] = []
        if let usageLangs = response.usageLanguages {
            for item in usageLangs {
                if let count = Int(item.language_count) {
                    totalLanguageCount += count
                    langs.append(LanguageUsage(language: item.language, count: count))
                }
            }
        }
        if totalLanguageCount > 0 {
            langs = langs.map { lang in
                var mutable = lang
                mutable.percentage = (Double(lang.count) / Double(totalLanguageCount)) * 100.0
                return mutable
            }
        }
        usageLanguagesData = langs
        usageDoughnutData = langs.map { DoughnutData(value: Double($0.count), name: $0.language) }
        var lineData: [LineChartDataPoint] = []
        if let personalInfo = response.personalUsageInfo {
            let dateFormatter = ISO8601DateFormatter()
            dateFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            for item in personalInfo {
                if let date = dateFormatter.date(from: item.day),
                   let count = Int(item.usage_count) {
                    lineData.append(LineChartDataPoint(date: date, value: Double(count)))
                }
            }
            lineData.sort { $0.date < $1.date }
        }
        personalUsageData = lineData
        personalUsageByDay = lineData
    }
    
    private func loadDirectory() {
        let panel = NSOpenPanel()
        panel.canChooseFiles = false
        panel.canChooseDirectories = true
        panel.allowsMultipleSelection = false
        if panel.runModal() == .OK {
            if let url = panel.urls.first {
                directoryURL = url
                isNavigatorLoading = true
                DispatchQueue.global(qos: .userInitiated).async {
                    let root = FileItem(
                        id: url,
                        url: url,
                        isDirectory: true,
                        children: self.loadFileItems(from: url)
                    )
                    DispatchQueue.main.async {
                        fileItems = [root]
                        rootIsExpanded = true
                        isNavigatorLoading = false
                    }
                }
            }
        }
    }
    
    private func loadFile() {
        let panel = NSOpenPanel()
        panel.canChooseFiles = true
        panel.canChooseDirectories = false
        panel.allowsMultipleSelection = false
        if panel.runModal() == .OK {
            fileURL = panel.urls.first
        }
    }
}
