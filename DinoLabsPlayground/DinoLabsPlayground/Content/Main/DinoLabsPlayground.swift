//
//  DinoLabsPlayground.swift
//
//  Created by Peter Iacobelli on 2/12/25.
//

import SwiftUI
import AppKit

struct FileItem: Identifiable {
    let id: URL
    let url: URL
    let isDirectory: Bool
    var children: [FileItem]?
}

struct CollapsibleItemView: View {
    let item: FileItem
    let level: Int
    let getIcon: (FileItem) -> String
    
    @State private var isExpanded: Bool = false
    @State private var isHovered: Bool = false

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
                        .font(.system(size: 8, weight: .heavy))
                        .padding(.trailing, 8)
                } else {
                    Image(getIcon(item))
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 12, height: 12)
                        .foregroundColor(.white.opacity(0.8))
                        .font(.system(size: 12, weight: .heavy))
                        .padding(.trailing, 8)
                }
                
                Text(item.url.lastPathComponent)
                    .foregroundColor(.white.opacity(0.8))
                    .font(.system(size: 10, weight: .semibold))
                    .lineLimit(1)
                    .truncationMode(.tail)
            }
            .padding(.vertical, 4)
            .frame(maxWidth: .infinity, alignment: .leading)
            .hoverEffect(
                backgroundColor: Color(hex: 0x212121),
                scale: 1.02,
                cursor: .pointingHand
            )
            .onTapGesture {
                if item.isDirectory {
                    isExpanded.toggle()
                }
            }
            
            if item.isDirectory, isExpanded, let kids = item.children {
                VStack(alignment: .leading, spacing: 0) {
                    ForEach(kids) { child in
                        CollapsibleItemView(item: child, level: level + 1, getIcon: getIcon)
                    }
                }
            }
        }
    }
}

struct DinoLabsPlayground: View {
    @Binding var currentView: AppView
    @State private var directoryURL: URL? = nil
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
    
    private func getIcon(for item: FileItem) -> String {
        if item.isDirectory {
            return "folder"
        } else {
            let name = item.url.lastPathComponent.lowercased()
            if name == "dockerfile" {
                return extensionToImageMap["dockerfile"] ?? extensionToImageMap["default"]!
            } else if name == "makefile" {
                return extensionToImageMap["makefile"] ?? extensionToImageMap["default"]!
            } else if name.hasPrefix(".git") {
                return extensionToImageMap["git"] ?? extensionToImageMap["default"]!
            }
            let ext = item.url.pathExtension.lowercased()
            return extensionToImageMap[ext] ?? extensionToImageMap["default"]!
        }
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
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .top) {
                VStack(spacing: 0) {
                    Spacer().frame(height: 50)
                    HStack(spacing: 0) {
                        VStack(spacing: 0) {
                            HStack {
                            }
                            .frame(width: geometry.size.width * leftPanelWidthRatio,
                                   height: (geometry.size.height - 50) * 0.05)
                            .containerHelper(backgroundColor: Color(hex:0x171717), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0 * 1.5, shadowX: 0, shadowY: 0)
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
                                .containerHelper(backgroundColor: Color(hex:0x111111), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0 * 1.5, shadowX: 0, shadowY: 0)
                                .overlay(
                                    HStack {
                                        Image(systemName: "folder.fill")
                                            .resizable()
                                            .aspectRatio(contentMode: .fit)
                                            .frame(width: 10, height: 10)
                                            .foregroundColor(.white.opacity(0.8))
                                            .font(.system(size: 10, weight: .heavy))
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
                                .containerHelper(backgroundColor: Color(hex:0x111111), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0 * 1.5, shadowX: 0, shadowY: 0)
                                .overlay(
                                    HStack {
                                        Image(systemName: "doc.text")
                                            .resizable()
                                            .aspectRatio(contentMode: .fit)
                                            .frame(width: 10, height: 10)
                                            .foregroundColor(.white.opacity(0.8))
                                            .font(.system(size: 10, weight: .heavy))
                                            .padding(.trailing, 4)
                                            .allowsHitTesting(false)
                                        
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
                            .containerHelper(backgroundColor: Color(hex:0x171717), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0 * 1.5, shadowX: 0, shadowY: 0)
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
                                .containerHelper(backgroundColor: isReplace ? Color.clear : Color(hex:0x212121), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0 * 1.5, shadowX: 0, shadowY: 0)
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
                                .containerHelper(backgroundColor: !isReplace ? Color.clear : Color(hex:0x212121), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0 * 1.5, shadowX: 0, shadowY: 0)
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
                            .containerHelper(backgroundColor: Color(hex:0x171717), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0 * 1.5, shadowX: 0, shadowY: 0)
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
                                            .containerHelper(backgroundColor: Color(hex: 0x222222), borderColor: Color(hex:0x616161), borderWidth: 1, topLeft: 6, topRight: 0, bottomLeft: 6, bottomRight: 0, shadowColor: .clear, shadowRadius: 0 * 1.5, shadowX: 0, shadowY: 0)
                                            .hoverEffect(opacity: 0.8)
                                        
                                        HStack {
                                            MainButtonMain {
                                                if isCaseSensitive {
                                                    isCaseSensitive = false
                                                } else {
                                                    isCaseSensitive = true
                                                }
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
                                        shadowColor: .white.opacity(0.5), shadowRadius: 8, shadowX: 0, shadowY: 0
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
                                            .containerHelper(backgroundColor: Color(hex: 0x222222), borderColor: Color(hex:0x616161), borderWidth: 1, topLeft: 6, topRight: 0, bottomLeft: 6, bottomRight: 0, shadowColor: .clear, shadowRadius: 0 * 1.5, shadowX: 0, shadowY: 0)
                                            .hoverEffect(opacity: 0.8)
                                        
                                        HStack {
                                            MainButtonMain {
                                                if isCaseSensitive {
                                                    isCaseSensitive = false
                                                } else {
                                                    isCaseSensitive = true
                                                }
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
                                        shadowColor: .white.opacity(0.5), shadowRadius: 8, shadowX: 0, shadowY: 0
                                    )
                                    .padding(.bottom, 10)
                                    
                                    HStack(spacing: 0) {
                                        MainTextField(placeholder: "Replace with...", text: $directoryItemSearch)
                                            .lineLimit(1)
                                            .truncationMode(.tail)
                                            .textFieldStyle(PlainTextFieldStyle())
                                            .foregroundColor(.white)
                                            .font(.system(size: 8, weight: .semibold))
                                            .padding(.horizontal, 10)
                                            .frame(width: (geometry.size.width * leftPanelWidthRatio * 0.9) * 0.65, height: 32)
                                            .containerHelper(backgroundColor: Color(hex: 0x222222), borderColor: Color(hex:0x616161), borderWidth: 1, topLeft: 6, topRight: 0, bottomLeft: 6, bottomRight: 0, shadowColor: .clear, shadowRadius: 0 * 1.5, shadowX: 0, shadowY: 0)
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
                                            .hoverEffect(
                                                opacity: 0.6,
                                                scale: 1.05,
                                                cursor: .pointingHand
                                            )
                                            
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
                                        shadowColor: .white.opacity(0.5), shadowRadius: 8, shadowX: 0, shadowY: 0
                                    )
                                }
                            }
                            .frame(width: geometry.size.width * leftPanelWidthRatio,
                                   height: !isReplace ? (geometry.size.height - 50) * 0.1 : (geometry.size.height - 50) * 0.2)
                            .containerHelper(backgroundColor: Color(hex:0x171717), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
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
                                            .font(.system(size: 8, weight: .heavy))
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
                                    .containerHelper(backgroundColor: Color(hex:0x212121), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0 * 1.5, shadowX: 0, shadowY: 0)
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
                                                        CollapsibleItemView(item: child, level: 1, getIcon: getIcon)
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
                            .containerHelper(backgroundColor: Color(hex:0x171717), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0 * 1.5, shadowX: 0, shadowY: 0)
                            .overlay(
                                Rectangle()
                                    .frame(height: 0.5)
                                    .foregroundColor(Color(hex:0xc1c1c1).opacity(0.4)),
                                alignment: .bottom
                            )
                            
                            HStack {
                            }
                            .frame(width: geometry.size.width * leftPanelWidthRatio,
                                   height: (geometry.size.height - 50) * 0.05)
                            .containerHelper(backgroundColor: Color(hex:0x171717), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0 * 1.5, shadowX: 0, shadowY: 0)
                            .overlay(
                                Rectangle()
                                    .frame(height: 0.5)
                                    .foregroundColor(Color(hex:0xc1c1c1).opacity(0.4)),
                                alignment: .bottom
                            )
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
                            HStack {
                            }
                            .frame(width: geometry.size.width * (1 - leftPanelWidthRatio),
                                   height: (geometry.size.height - 50) * 0.05)
                            .containerHelper(backgroundColor: Color(hex:0x171717), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0 * 1.5, shadowX: 0, shadowY: 0)
                            .overlay(
                                Rectangle()
                                    .frame(height: 0.5)
                                    .foregroundColor(Color(hex:0xc1c1c1).opacity(0.4)),
                                alignment: .bottom
                            )
                            
                            VStack {
                                Button("Show Alert Modal") {
                                    alertTitle = "Alert Title"
                                    alertMessage = "Directory or File loaded. Now showing alert."
                                    alertInputs = [DinoLabsAlertInput(name: "Username", type: "text", defaultValue: "")]
                                    showCancelButton = true
                                    showAlert = true
                                }
                            }
                            .frame(width: geometry.size.width * (1 - leftPanelWidthRatio),
                                   height: (geometry.size.height - 50) * 0.9)
                            .containerHelper(backgroundColor: Color(hex:0x242424), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0 * 1.5, shadowX: 0, shadowY: 0)
                            .overlay(
                                Rectangle()
                                    .frame(height: 0.5)
                                    .foregroundColor(Color(hex:0xc1c1c1).opacity(0.4)),
                                alignment: .bottom
                            )
                            
                            HStack {
                            }
                            .frame(width: geometry.size.width * (1 - leftPanelWidthRatio),
                                   height: (geometry.size.height - 50) * 0.05)
                            .containerHelper(backgroundColor: Color(hex:0x171717), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0 * 1.5, shadowX: 0, shadowY: 0)
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
                
                DinoLabsAlert(geometry: geometry,
                              visible: showAlert,
                              title: alertTitle,
                              message: alertMessage,
                              inputs: alertInputs,
                              showCancel: showCancelButton,
                              onConfirm: { result in
                                  showAlert = false
                                  if let result = result {
                                      print("User input: \(result)")
                                  } else {
                                      print("User confirmed with no input.")
                                  }
                              },
                              onCancel: {
                                  showAlert = false
                                  print("User cancelled.")
                              })
            }
        }
    }

    func loadDirectory() {
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

    func loadFile() {
        let panel = NSOpenPanel()
        panel.canChooseFiles = true
        panel.canChooseDirectories = false
        panel.allowsMultipleSelection = false
        if panel.runModal() == .OK {
            fileURL = panel.urls.first
        }
    }
}
