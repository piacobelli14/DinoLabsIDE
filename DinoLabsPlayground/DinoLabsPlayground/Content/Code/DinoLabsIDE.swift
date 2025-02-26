//
//  DinoLabsIDE.swift
//
//  Created by Peter Iacobelli on 2/22/25.
//

import SwiftUI
import AppKit

struct IDEView: View {
    let geometry: GeometryProxy
    let fileURL: URL
    let programmingLanguage: String
    let programmingLanguageImage: String
    var username: String
    var rootDirectory: String
    @Binding var leftPanelWidthRatio: CGFloat
    @Binding var keyBinds: [String: String]
    @Binding var zoomLevel: Double
    @Binding var colorTheme: String
    @Binding var fileContent: String
    @Binding var hasUnsavedChanges: Bool
    @Binding var showAlert: Bool
    @State private var isLoading: Bool = false
    @State private var copyIcon = "square.on.square"
    @State private var searchState: Bool = false
    @State private var replaceState: Bool = false
    @State private var searchCaseSensitive: Bool = true
    @State private var searchQuery: String = ""
    @State private var replaceQuery: String = ""
    @State private var isReplacing: Bool = false
    @State private var currentSearchMatch: Int = 0
    @State private var totalSearchMatches: Int = 0
    @State private var consoleState: String = "terminal"
    @State private var showFullRoot: Bool = true

    var body: some View {
        Group {
            if isLoading {
                ProgressView("")
            } else {
                VStack(spacing: 0) {
                    HStack {
                        if searchState || replaceState {
                            HStack(spacing: 0) {
                                HStack(spacing: 0) {
                                    CodeTextField(placeholder: "Search file...", text: $searchQuery, onReturnKeyPressed: {
                                        NotificationCenter.default.post(name: Notification.Name("JumpToNextSearchMatch"), object: nil)
                                    })
                                        .lineLimit(1)
                                        .truncationMode(.tail)
                                        .textFieldStyle(PlainTextFieldStyle())
                                        .foregroundColor(.white)
                                        .font(.system(size: 8, weight: .semibold))
                                        .padding(.horizontal, 10)
                                        .frame(width: 100, height: 25)
                                        .containerHelper(backgroundColor: Color(hex: 0x222222),
                                                          borderColor: Color(hex: 0x616161),
                                                          borderWidth: 1,
                                                          topLeft: 2, topRight: 0,
                                                          bottomLeft: 2, bottomRight: 0,
                                                          shadowColor: .clear,
                                                          shadowRadius: 0,
                                                          shadowX: 0, shadowY: 0)
                                        .hoverEffect(opacity: 0.8)
                                        .onChange(of: searchQuery) { _ in
                                            NotificationCenter.default.post(name: Notification.Name("SearchQueryChanged"), object: nil)
                                        }
                                    HStack {
                                        CodeButtonMain {
                                            NotificationCenter.default.post(name: Notification.Name("JumpToNextSearchMatch"), object: nil)
                                        }
                                        .lineLimit(1)
                                        .truncationMode(.tail)
                                        .textFieldStyle(PlainTextFieldStyle())
                                        .foregroundColor(.white)
                                        .overlay(
                                            Image(systemName: "arrow.down")
                                                .font(.system(size: 9, weight: .semibold))
                                                .foregroundColor(Color(hex: 0xf5f5f5))
                                                .allowsHitTesting(false)
                                        )
                                        .hoverEffect(opacity: 0.6, scale: 1.05, cursor: .pointingHand)
                                        CodeButtonMain {
                                            NotificationCenter.default.post(name: Notification.Name("JumpToPreviousSearchMatch"), object: nil)
                                        }
                                        .lineLimit(1)
                                        .truncationMode(.tail)
                                        .textFieldStyle(PlainTextFieldStyle())
                                        .foregroundColor(.white)
                                        .overlay(
                                            Image(systemName: "arrow.up")
                                                .font(.system(size: 9, weight: .semibold))
                                                .foregroundColor(Color(hex: 0xf5f5f5))
                                                .allowsHitTesting(false)
                                        )
                                        .hoverEffect(opacity: 0.6, scale: 1.05, cursor: .pointingHand)
                                        CodeButtonMain {
                                            searchCaseSensitive.toggle()
                                            withAnimation(.none) {
                                                fileContent = fileContent
                                            }
                                        }
                                        .lineLimit(1)
                                        .truncationMode(.tail)
                                        .textFieldStyle(PlainTextFieldStyle())
                                        .foregroundColor(.white)
                                        .overlay(
                                            Image(systemName: "a.square.fill")
                                                .font(.system(size: 10, weight: .semibold))
                                                .foregroundColor(searchCaseSensitive ? Color(hex: 0x5C2BE2)
                                                                                   : Color(hex: 0xf5f5f5))
                                                .allowsHitTesting(false)
                                        )
                                        .hoverEffect(opacity: 0.6, scale: 1.05, cursor: .pointingHand)
                                    }
                                    .padding(.horizontal, 10)
                                    .frame(width: 60, height: 25)
                                    .containerHelper(backgroundColor: Color(hex: 0x222222),
                                                      borderColor: Color(hex: 0x616161),
                                                      borderWidth: 1,
                                                      topLeft: 0, topRight: 0,
                                                      bottomLeft: 0, bottomRight: 0,
                                                      shadowColor: .clear,
                                                      shadowRadius: 0,
                                                      shadowX: 0, shadowY: 0)
                                    HStack {
                                        Text("\(currentSearchMatch) of \(totalSearchMatches)")
                                            .foregroundColor(.white)
                                            .font(.system(size: 8, weight: .semibold))
                                            .frame(width: 60, height: 25)
                                            .lineLimit(1)
                                            .truncationMode(.tail)
                                            .padding(.leading, 8)
                                        Spacer()
                                    }
                                    .padding(.horizontal, 10)
                                    .frame(width: 60, height: 25)
                                    .containerHelper(backgroundColor: Color(hex: 0x222222),
                                                      borderColor: Color(hex: 0x616161),
                                                      borderWidth: 1,
                                                      topLeft: 0, topRight: 2,
                                                      bottomLeft: 0, bottomRight: 2,
                                                      shadowColor: .clear,
                                                      shadowRadius: 0,
                                                      shadowX: 0, shadowY: 0)
                                }
                                .frame(width: 220, height: 25)
                                .containerHelper(backgroundColor: Color.clear,
                                                  borderColor: Color(hex: 0x616161),
                                                  borderWidth: 1,
                                                  topLeft: 2, topRight: 2,
                                                  bottomLeft: 2, bottomRight: 2,
                                                  shadowColor: Color.white.opacity(0.5),
                                                  shadowRadius: 8,
                                                  shadowX: 0, shadowY: 0)
                                if replaceState {
                                    HStack(spacing: 0) {
                                        CodeTextField(placeholder: "Replace with...", text: $replaceQuery)
                                            .lineLimit(1)
                                            .truncationMode(.tail)
                                            .textFieldStyle(PlainTextFieldStyle())
                                            .foregroundColor(.white)
                                            .font(.system(size: 8, weight: .semibold))
                                            .padding(.horizontal, 10)
                                            .frame(width: 100, height: 25)
                                            .containerHelper(backgroundColor: Color(hex: 0x222222),
                                                              borderColor: Color(hex: 0x616161),
                                                              borderWidth: 1,
                                                              topLeft: 2, topRight: 0,
                                                              bottomLeft: 2, bottomRight: 0,
                                                              shadowColor: .clear,
                                                              shadowRadius: 0,
                                                              shadowX: 0, shadowY: 0)
                                            .hoverEffect(opacity: 0.8)
                                        HStack {
                                            CodeButtonMain {
                                                replaceNextOccurrence()
                                            }
                                            .lineLimit(1)
                                            .truncationMode(.tail)
                                            .textFieldStyle(PlainTextFieldStyle())
                                            .foregroundColor(.white)
                                            .overlay(
                                                Image(systemName: "square.fill")
                                                    .font(.system(size: 9, weight: .semibold))
                                                    .foregroundColor(Color(hex: 0xf5f5f5))
                                                    .allowsHitTesting(false)
                                            )
                                            .hoverEffect(opacity: 0.6,
                                                         scale: 1.05,
                                                         cursor: .pointingHand)
                                            CodeButtonMain {
                                                replaceAllOccurrences()
                                            }
                                            .lineLimit(1)
                                            .truncationMode(.tail)
                                            .textFieldStyle(PlainTextFieldStyle())
                                            .foregroundColor(.white)
                                            .overlay(
                                                Image(systemName: "square.grid.3x1.below.line.grid.1x2")
                                                    .font(.system(size: 9, weight: .semibold))
                                                    .foregroundColor(Color(hex: 0xf5f5f5))
                                                    .allowsHitTesting(false)
                                            )
                                            .hoverEffect(opacity: 0.6,
                                                         scale: 1.05,
                                                         cursor: .pointingHand)
                                        }
                                        .padding(.horizontal, 10)
                                        .frame(width: 60, height: 25)
                                        .containerHelper(backgroundColor: Color(hex: 0x222222),
                                                          borderColor: Color(hex: 0x616161),
                                                          borderWidth: 1,
                                                          topLeft: 0, topRight: 2,
                                                          bottomLeft: 0, bottomRight: 2,
                                                          shadowColor: .clear,
                                                          shadowRadius: 0,
                                                          shadowX: 0, shadowY: 0)
                                    }
                                    .frame(width: 160, height: 25)
                                    .containerHelper(backgroundColor: Color.clear,
                                                      borderColor: Color(hex: 0x616161),
                                                      borderWidth: 1,
                                                      topLeft: 2, topRight: 2,
                                                      bottomLeft: 2, bottomRight: 2,
                                                      shadowColor: Color.white.opacity(0.5),
                                                      shadowRadius: 8,
                                                      shadowX: 0, shadowY: 0)
                                    .padding(.leading, 10)
                                }
                            }
                        } else {
                            Image("\(programmingLanguageImage)")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .frame(width: 11, height: 11)
                                .foregroundColor(.white.opacity(0.8))
                                .padding(.trailing, 2)
                            Text("\(programmingLanguage)")
                                .foregroundColor(.white.opacity(0.8))
                                .font(.system(size: 11, weight: .semibold))
                                .lineLimit(1)
                                .truncationMode(.tail)
                        }
                        Spacer()
                        HStack(spacing: 8) {
                            CodeButtonMain {
                                if !searchState {
                                    searchState = true
                                    replaceState = false
                                } else {
                                    searchState = false
                                    replaceState = false
                                    searchQuery = ""
                                    replaceQuery = ""
                                }
                            }
                            .containerHelper(backgroundColor: searchState ? Color(hex: 0xAD6ADD) : Color(hex: 0x414141),
                                             borderColor: Color(hex: 0x414141),
                                             borderWidth: 1,
                                             topLeft: 2, topRight: 2,
                                             bottomLeft: 2, bottomRight: 2,
                                             shadowColor: Color(hex: 0x222222),
                                             shadowRadius: 0.5,
                                             shadowX: 0, shadowY: 0)
                            .frame(width: 20, height: 20)
                            .overlay(
                                Image(systemName: "magnifyingglass")
                                    .font(.system(size: 11, weight: .semibold))
                                    .foregroundColor(Color(hex: 0xf5f5f5).opacity(0.8))
                                    .allowsHitTesting(false)
                            )
                            .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                            CodeButtonMain {
                                if !replaceState {
                                    replaceState = true
                                    searchState = false
                                } else {
                                    replaceState = false
                                    searchState = false
                                    searchQuery = ""
                                    replaceQuery = ""
                                }
                            }
                            .containerHelper(backgroundColor: replaceState ? Color(hex: 0xAD6ADD) : Color(hex: 0x414141),
                                             borderColor: Color(hex: 0x414141),
                                             borderWidth: 1,
                                             topLeft: 2, topRight: 2,
                                             bottomLeft: 2, bottomRight: 2,
                                             shadowColor: Color(hex: 0x222222),
                                             shadowRadius: 0.5,
                                             shadowX: 0, shadowY: 0)
                            .frame(width: 20, height: 20)
                            .overlay(
                                Image(systemName: "text.magnifyingglass")
                                    .font(.system(size: 11, weight: .semibold))
                                    .foregroundColor(Color(hex: 0xf5f5f5).opacity(0.8))
                                    .allowsHitTesting(false)
                            )
                            .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                            CodeButtonMain {
                                let pasteboard = NSPasteboard.general
                                pasteboard.clearContents()
                                pasteboard.setString(fileContent, forType: .string)
                                withAnimation {
                                    copyIcon = "checkmark.square.fill"
                                }
                                DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                    withAnimation {
                                        copyIcon = "square.on.square"
                                    }
                                }
                            }
                            .containerHelper(backgroundColor: Color(hex: 0x414141),
                                             borderColor: Color(hex: 0x414141),
                                             borderWidth: 1,
                                             topLeft: 2, topRight: 2,
                                             bottomLeft: 2, bottomRight: 2,
                                             shadowColor: Color(hex: 0x222222),
                                             shadowRadius: 0.5,
                                             shadowX: 0, shadowY: 0)
                            .frame(width: 20, height: 20)
                            .overlay(
                                Image(systemName: copyIcon)
                                    .font(.system(size: 11, weight: .semibold))
                                    .foregroundColor(Color(hex: 0xf5f5f5).opacity(0.8))
                                    .allowsHitTesting(false)
                            )
                            .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                            CodeButtonMain {
                                NotificationCenter.default.post(name: Notification.Name("PerformUndo"), object: nil)
                            }
                            .containerHelper(backgroundColor: Color(hex: 0x414141),
                                             borderColor: Color(hex: 0x414141),
                                             borderWidth: 1,
                                             topLeft: 2, topRight: 2,
                                             bottomLeft: 2, bottomRight: 2,
                                             shadowColor: Color(hex: 0x222222),
                                             shadowRadius: 0.5,
                                             shadowX: 0, shadowY: 0)
                            .frame(width: 20, height: 20)
                            .overlay(
                                Image(systemName: "arrow.uturn.backward")
                                    .font(.system(size: 11, weight: .semibold))
                                    .foregroundColor(Color(hex: 0xf5f5f5).opacity(0.8))
                                    .allowsHitTesting(false)
                            )
                            .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                            CodeButtonMain {
                                NotificationCenter.default.post(name: Notification.Name("PerformRedo"), object: nil)
                            }
                            .containerHelper(backgroundColor: Color(hex: 0x414141),
                                             borderColor: Color(hex: 0x414141),
                                             borderWidth: 1,
                                             topLeft: 2, topRight: 2,
                                             bottomLeft: 2, bottomRight: 2,
                                             shadowColor: Color(hex: 0x222222),
                                             shadowRadius: 0.5,
                                             shadowX: 0, shadowY: 0)
                            .frame(width: 20, height: 20)
                            .overlay(
                                Image(systemName: "arrow.uturn.forward")
                                    .font(.system(size: 11, weight: .semibold))
                                    .foregroundColor(Color(hex: 0xf5f5f5).opacity(0.8))
                                    .allowsHitTesting(false)
                            )
                            .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                        }
                    }
                    .frame(height: (searchState || replaceState) ? 45 : 20)
                    .padding(.vertical, 10)
                    .padding(.horizontal, 20)
                    .containerHelper(backgroundColor: Color(hex: 0x171717).opacity(0.9),
                                      borderColor: Color.clear,
                                      borderWidth: 0,
                                      topLeft: 0, topRight: 0,
                                      bottomLeft: 0, bottomRight: 0,
                                      shadowColor: Color.clear,
                                      shadowRadius: 0,
                                      shadowX: 0, shadowY: 0)
                    .overlay(
                        Rectangle()
                            .frame(height: 0.5)
                            .foregroundColor(Color(hex: 0xc1c1c1).opacity(0.4)),
                        alignment: .bottom
                    )
                    
                    IDEEditorView(
                        text: $fileContent,
                        programmingLanguage: programmingLanguage,
                        theme: {
                            switch colorTheme.lowercased() {
                            case "light":
                                return .lightTheme
                            case "dark":
                                return .darkTheme
                            default:
                                return .defaultTheme
                            }
                        }(),
                        zoomLevel: zoomLevel,
                        keyBinds: keyBinds,
                        searchQuery: $searchQuery,
                        replaceQuery: $replaceQuery,
                        searchCaseSensitive: $searchCaseSensitive,
                        isReplacing: $isReplacing,
                        currentSearchMatch: $currentSearchMatch,
                        totalSearchMatches: $totalSearchMatches,
                        hasUnsavedChanges: $hasUnsavedChanges,
                        showAlert: $showAlert,
                        onSave: saveFile
                    )
                    
                    VStack(alignment: .leading, spacing: 0) {
                        HStack(spacing: 20) {
                            Text("Terminal")
                                .font(
                                    consoleState == "terminal" ?
                                        .system(size: 10, weight: .bold, design: .default).italic() :
                                        .system(size: 10, weight: .semibold, design: .default)
                                )
                                .foregroundColor(Color(hex: 0xf5f5f5).opacity(consoleState == "terminal" ? 1.0 : 0.8))
                                .underline(consoleState == "terminal" ? true : false)
                                .allowsHitTesting(false)
                                .hoverEffect(opacity: 0.8, cursor: .pointingHand)
                                .onTapGesture {
                                    consoleState = "terminal"
                                }
                            
                            Text("Problems")
                                .font(
                                    consoleState == "problems" ?
                                        .system(size: 10, weight: .bold, design: .default).italic() :
                                        .system(size: 10, weight: .semibold, design: .default)
                                )
                                .foregroundColor(Color(hex: 0xf5f5f5).opacity(consoleState == "problems" ? 1.0 : 0.8))
                                .underline(consoleState == "problems" ? true : false)
                                .allowsHitTesting(false)
                                .hoverEffect(opacity: 0.8, cursor: .pointingHand)
                                .onTapGesture {
                                    consoleState = "problems"
                                }
                            
                            Spacer()
                            
                            HStack {
                                Text("Show Full Root")
                                    .font(.system(size: 9, weight: .regular))
                                    .foregroundColor(Color(hex: 0xf5f5f5).opacity(0.8))
                                    .padding(.trailing, 6)
                                
                                Toggle("", isOn: $showFullRoot)
                                    .toggleStyle(ToggleSwitch(
                                        toggleWidth: 25,
                                        toggleHeight: 14,
                                        circleSize: 12,
                                        activeColor: .purple,
                                        inactiveColor: Color(hex: 0x333333),
                                        thumbColor: .white,
                                        textColor: .white,
                                        fontSize: 9,
                                        fontWeight: .bold,
                                        activeText: "Yes",
                                        inactiveText: "No",
                                        showText: true,
                                        animationDuration: 0.2,
                                        animationDamping: 0.8
                                    ))
                            }
                            .padding(.horizontal, 10)
                        }
                        .padding(.horizontal, 10)
                        .frame(width: geometry.size.width * (1 - leftPanelWidthRatio), height: 40, alignment: .leading)
                    
                        
                        Spacer()
                        
                        VStack(spacing: 0) {
                            if consoleState == "terminal" {
                                TerminalView(username: username, rootDirectory: rootDirectory, showFullRoot: showFullRoot)
                                    .background(Color.clear)
                                    .frame(width: geometry.size.width * (1 - leftPanelWidthRatio))
                            }
                            
                        }
                        .frame(width: geometry.size.width * (1 - leftPanelWidthRatio), alignment: .leading)
                    
                    }
                    .frame(width: geometry.size.width * (1 - leftPanelWidthRatio), height: 150)
                    .containerHelper(backgroundColor: Color(hex: 0x171717),
                                     borderColor: Color.clear,
                                     borderWidth: 0,
                                     topLeft: 0, topRight: 0,
                                     bottomLeft: 0, bottomRight: 0,
                                     shadowColor: Color.clear,
                                     shadowRadius: 0,
                                     shadowX: 0, shadowY: 0)
                    .overlay(
                        Rectangle()
                            .frame(height: 2.0)
                            .foregroundColor(Color(hex: 0xc1c1c1).opacity(0.4)),
                        alignment: .top
                    )
                }
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: Notification.Name("OpenSearch"))) { _ in
            if !searchState {
                searchState = true
                replaceState = false
            } else {
                searchState = false
                replaceState = false
                searchQuery = ""
                replaceQuery = ""
            }
        }
        .onAppear {
            if fileContent.isEmpty {
                loadFileContent()
            }
        }
    }
    
    private func saveFile() {
        do {
            try fileContent.write(to: fileURL, atomically: true, encoding: .utf8)
            hasUnsavedChanges = false
        } catch {
            return
        }
    }
    
    private func loadFileContent() {
        isLoading = true
        DispatchQueue.global(qos: .userInitiated).async {
            let content = (try? String(contentsOf: fileURL)) ?? "Unable to load file content."
            DispatchQueue.main.async {
                self.fileContent = content
                self.isLoading = false
                if let lineNumber = self.getLineNumberToNavigate() {
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                        NotificationCenter.default.post(
                            name: Notification.Name("NavigateToLine"),
                            object: nil,
                            userInfo: ["lineNumber": lineNumber]
                        )
                    }
                }
            }
        }
    }
    
    private func getLineNumberToNavigate() -> Int? {
        if let fragment = fileURL.fragment, fragment.starts(with: "L") {
            let lineNumberString = String(fragment.dropFirst())
            return Int(lineNumberString)
        }
        return nil
    }

    private func replaceNextOccurrence() {
        guard !searchQuery.isEmpty else { return }
        if let foundRange = nextRange(of: searchQuery, in: fileContent, caseSensitive: searchCaseSensitive) {
            let nsRange = NSRange(foundRange, in: fileContent)
            let oldContent = fileContent
            NotificationCenter.default.post(name: Notification.Name("PerformReplacementNext"), object: nil, userInfo: ["range": nsRange, "replacement": replaceQuery, "oldContent": oldContent])
            hasUnsavedChanges = true
            let tempSearch = searchQuery
            searchQuery = ""
            DispatchQueue.main.async {
                self.searchQuery = tempSearch
            }
        }
    }
    
    private func replaceAllOccurrences() {
        guard !searchQuery.isEmpty else { return }
        let oldContent = fileContent
        let tempSearch = searchQuery
        searchQuery = ""
        NotificationCenter.default.post(name: Notification.Name("PerformReplacementAll"), object: nil, userInfo: ["search": tempSearch, "replacement": replaceQuery, "oldContent": oldContent, "caseSensitive": searchCaseSensitive])
        hasUnsavedChanges = true
        DispatchQueue.main.async {
            self.searchQuery = tempSearch
        }
    }
    
    private func nextRange(of needle: String, in haystack: String, caseSensitive: Bool) -> Range<String.Index>? {
        let options: String.CompareOptions = caseSensitive ? [] : .caseInsensitive
        return haystack.range(of: needle, options: options)
    }
}

struct IDEEditorView: NSViewRepresentable {
    @Binding var text: String
    let programmingLanguage: String
    var theme: CodeEditorTheme = .defaultTheme
    var zoomLevel: Double = 1.0
    var keyBinds: [String: String] = [:]
    @Binding var searchQuery: String
    @Binding var replaceQuery: String
    @Binding var searchCaseSensitive: Bool
    @Binding var isReplacing: Bool
    @Binding var currentSearchMatch: Int
    @Binding var totalSearchMatches: Int
    @Binding var hasUnsavedChanges: Bool
    @Binding var showAlert: Bool
    var onSave: () -> Void
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    func makeNSView(context: Context) -> NSScrollView {
        let textView = IDETextView()
        textView.wantsLayer = true
        textView.layer?.actions = [:]
        textView.layer?.speed = 1000
        textView.isEditable = !showAlert
        textView.isRichText = false
        textView.usesFindBar = true
        textView.allowsUndo = true
        textView.undoManager?.levelsOfUndo = 0
        textView.delegate = context.coordinator
        textView.backgroundColor = NSColor(hex: 0x222222)
        textView.textColor = ThemeColorProvider.defaultTextColor(for: theme)
        textView.font = .monospacedSystemFont(ofSize: 11 * CGFloat(zoomLevel), weight: .semibold)
        
        let paragraphStyle = NSMutableParagraphStyle()
        paragraphStyle.minimumLineHeight = 20.0
        paragraphStyle.maximumLineHeight = 20.0
        paragraphStyle.lineSpacing = 0.0
        paragraphStyle.tabStops = []
        paragraphStyle.defaultTabInterval = 40
        textView.defaultParagraphStyle = paragraphStyle
        textView.typingAttributes = [
            .font: textView.font ?? NSFont.monospacedSystemFont(ofSize: 11 * CGFloat(zoomLevel), weight: .semibold),
            .foregroundColor: ThemeColorProvider.defaultTextColor(for: theme),
            .paragraphStyle: paragraphStyle
        ]
        
        if let textContainer = textView.textContainer {
            textContainer.widthTracksTextView = false
            textContainer.containerSize = NSSize(width: CGFloat.greatestFiniteMagnitude, height: .greatestFiniteMagnitude)
            textContainer.lineFragmentPadding = 8.0
            textContainer.lineBreakMode = .byClipping
        }
        
        textView.isHorizontallyResizable = true
        textView.isVerticallyResizable = true
        textView.autoresizingMask = [.width, .height]
        textView.maxSize = NSSize(width: CGFloat.greatestFiniteMagnitude, height: .greatestFiniteMagnitude)
        textView.textContainerInset = NSSize(width: 0, height: 8)
        textView.customKeyBinds = keyBinds
        
        let scrollView = IDEScrollView()
        scrollView.documentView = textView
        scrollView.hasVerticalScroller = true
        scrollView.hasHorizontalScroller = true
        scrollView.drawsBackground = false
        scrollView.hasVerticalRuler = true
        scrollView.rulersVisible = true
        scrollView.verticalScroller = InvisibleScroller(frame: .zero)
        scrollView.horizontalScroller = InvisibleScroller(frame: .zero)
        
        let ruler = IDECenteredLineNumberRuler(textView: textView, theme: theme, zoomLevel: zoomLevel)
        scrollView.verticalRulerView = ruler
        scrollView.contentView.postsBoundsChangedNotifications = true
        NotificationCenter.default.addObserver(
            forName: NSView.boundsDidChangeNotification,
            object: scrollView.contentView,
            queue: .main
        ) { _ in
            if let textView = scrollView.documentView as? IDETextView {
                context.coordinator.applySyntaxHighlightingInternal(on: textView, withReferenceText: textView.string)
            }
        }
        context.coordinator.textView = textView
        return scrollView
    }
    
    func updateNSView(_ scrollView: NSScrollView, context: Context) {
        guard let textView = scrollView.documentView as? IDETextView else { return }
        textView.isEditable = !showAlert
        textView.window?.invalidateCursorRects(for: textView)
        textView.resetCursorRects()
        if textView.string != text {
            textView.string = text
            context.coordinator.applySyntaxHighlighting(to: textView)
            DispatchQueue.main.async {
                textView.scrollRangeToVisible(NSRange(location: 0, length: 0))
            }
        } else {
            context.coordinator.applySyntaxHighlighting(to: textView)
        }
    }
    
    class Coordinator: NSObject, NSTextViewDelegate {
        var parent: IDEEditorView
        weak var textView: NSTextView?
        private var pendingHighlightWorkItem: DispatchWorkItem?
        var lineHighlightRange: NSRange?
        
        init(_ parent: IDEEditorView) {
            self.parent = parent
            super.init()
            NotificationCenter.default.addObserver(forName: Notification.Name("NavigateToLine"), object: nil, queue: .main) { [weak self] notification in
                if let lineNumber = notification.userInfo?["lineNumber"] as? Int {
                    self?.navigateToLine(lineNumber)
                }
            }
            NotificationCenter.default.addObserver(forName: Notification.Name("JumpToNextSearchMatch"), object: nil, queue: .main) { [weak self] _ in
                self?.jumpToNextSearchMatch()
            }
            NotificationCenter.default.addObserver(forName: Notification.Name("JumpToPreviousSearchMatch"), object: nil, queue: .main) { [weak self] _ in
                self?.jumpToPreviousSearchMatch()
            }
            NotificationCenter.default.addObserver(forName: Notification.Name("SearchQueryChanged"), object: nil, queue: .main) { [weak self] _ in
                self?.updateSearchIndicator()
            }
            NotificationCenter.default.addObserver(forName: Notification.Name("PerformUndo"), object: nil, queue: .main) { [weak self] _ in
                self?.textView?.undoManager?.undo()
            }
            NotificationCenter.default.addObserver(forName: Notification.Name("PerformRedo"), object: nil, queue: .main) { [weak self] _ in
                self?.textView?.undoManager?.redo()
            }
            NotificationCenter.default.addObserver(forName: Notification.Name("PerformReplacementNext"), object: nil, queue: .main) { [weak self] notification in
                guard let self = self, let textView = self.textView else { return }
                guard let userInfo = notification.userInfo,
                      let nsRange = userInfo["range"] as? NSRange,
                      let replacement = userInfo["replacement"] as? String else { return }
                if textView.shouldChangeText(in: nsRange, replacementString: replacement) {
                    textView.replaceCharacters(in: nsRange, with: replacement)
                    textView.didChangeText()
                }
            }
            NotificationCenter.default.addObserver(forName: Notification.Name("PerformReplacementAll"), object: nil, queue: .main) { [weak self] notification in
                guard let self = self, let textView = self.textView else { return }
                guard let userInfo = notification.userInfo,
                      let search = userInfo["search"] as? String,
                      let replacement = userInfo["replacement"] as? String,
                      let caseSensitive = userInfo["caseSensitive"] as? Bool else { return }
                let options: NSString.CompareOptions = caseSensitive ? [] : [.caseInsensitive]
                let nsText = textView.string as NSString
                var searchRange = NSRange(location: 0, length: nsText.length)
                while true {
                    let foundRange = nsText.range(of: search, options: options, range: searchRange)
                    if foundRange.location != NSNotFound {
                        if textView.shouldChangeText(in: foundRange, replacementString: replacement) {
                            textView.replaceCharacters(in: foundRange, with: replacement)
                            textView.didChangeText()
                        }
                        let newLocation = foundRange.location + (replacement as NSString).length
                        if newLocation < nsText.length {
                            searchRange = NSRange(location: newLocation, length: nsText.length - newLocation)
                        } else {
                            break
                        }
                    } else {
                        break
                    }
                }
            }
            NotificationCenter.default.addObserver(self, selector: #selector(handleSelectionDidChange(_:)), name: NSTextView.didChangeSelectionNotification, object: nil)
        }
        
        @objc private func handleSelectionDidChange(_ note: Notification) {
            guard let tv = textView, let obj = note.object as? NSTextView, obj == tv else { return }
            if lineHighlightRange != nil {
                lineHighlightRange = nil
                applySyntaxHighlighting(to: tv)
            }
        }
        
        func textDidChange(_ notification: Notification) {
            guard let textView = notification.object as? NSTextView else { return }
            parent.text = textView.string
            parent.hasUnsavedChanges = true
            pendingHighlightWorkItem?.cancel()
            applySyntaxHighlightingInternal(on: textView, withReferenceText: textView.string)
            updateSearchIndicator()
        }
        
        func applySyntaxHighlighting(to textView: NSTextView) {
            pendingHighlightWorkItem?.cancel()
            let currentText = textView.string
            let workItem = DispatchWorkItem { [weak self, weak textView] in
                guard let self = self, let textView = textView else { return }
                if textView.string == currentText {
                    self.applySyntaxHighlightingInternal(on: textView, withReferenceText: currentText)
                }
            }
            pendingHighlightWorkItem = workItem
            DispatchQueue.main.async(execute: workItem)
        }
        
        func applySyntaxHighlightingInternal(on textView: NSTextView, withReferenceText currentText: String) {
            guard textView.string == currentText,
                  let layoutManager = textView.layoutManager,
                  let textContainer = textView.textContainer else { return }
            layoutManager.ensureLayout(for: textContainer)
            let visibleRect = textView.visibleRect
            let glyphRange = layoutManager.glyphRange(forBoundingRect: visibleRect, in: textContainer)
            let visibleCharRange = layoutManager.characterRange(forGlyphRange: glyphRange, actualGlyphRange: nil)
            let fullText = textView.string as NSString
            let visibleLineRange = fullText.lineRange(for: visibleCharRange)
            let expandedRange = expandRangeToIncludeFullContext(visibleLineRange, in: fullText)
            let expandedText = fullText.substring(with: expandedRange)
            let paragraphStyle = textView.defaultParagraphStyle ?? NSParagraphStyle()
            let font = NSFont.monospacedSystemFont(ofSize: 11 * CGFloat(parent.zoomLevel), weight: .semibold)
            let lineHeight: CGFloat = 20.0
            let actualLineHeight = layoutManager.defaultLineHeight(for: font)
            let baselineOffset = (lineHeight - actualLineHeight) / 2.0
            let selRange = textView.selectedRange()
            let tokens = SwiftParser.tokenize(expandedText, language: parent.programmingLanguage)
            let newVisibleAttributed = NSMutableAttributedString()
            var currentLine = 1
            for token in tokens {
                if token.lineNumber > currentLine {
                    let needed = token.lineNumber - currentLine
                    for _ in 0..<needed {
                        let newlineAttr = NSAttributedString(string: "\n", attributes: [.paragraphStyle: paragraphStyle])
                        newVisibleAttributed.append(newlineAttr)
                    }
                    currentLine = token.lineNumber
                }
                let color = ThemeColorProvider.tokenColor(for: token.type, theme: parent.theme)
                let attrs: [NSAttributedString.Key: Any] = [
                    .foregroundColor: color,
                    .font: font,
                    .paragraphStyle: paragraphStyle,
                    .baselineOffset: baselineOffset
                ]
                newVisibleAttributed.append(NSAttributedString(string: token.value, attributes: attrs))
            }
            let visibleLinesCount = expandedText.components(separatedBy: "\n").count
            if visibleLinesCount > currentLine {
                let diff = visibleLinesCount - currentLine
                for _ in 0..<diff {
                    let newlineAttr = NSAttributedString(string: "\n", attributes: [.paragraphStyle: paragraphStyle])
                    newVisibleAttributed.append(newlineAttr)
                }
            }
            if !parent.isReplacing && !parent.searchQuery.isEmpty {
                let searchText = parent.searchQuery
                let options: NSString.CompareOptions = parent.searchCaseSensitive ? [] : [.caseInsensitive]
                let nsNewVisibleText = newVisibleAttributed.string as NSString
                var searchRange = NSRange(location: 0, length: nsNewVisibleText.length)
                let baseFontSize = 11 * CGFloat(parent.zoomLevel)
                let highlightFont = NSFont.monospacedSystemFont(ofSize: baseFontSize * 1.05, weight: .semibold)
                let highlightColor = NSColor(hex: 0xAD6ADD)
                let shadow = NSShadow()
                shadow.shadowOffset = NSSize(width: 1, height: -1)
                shadow.shadowBlurRadius = 2
                shadow.shadowColor = NSColor.black.withAlphaComponent(0.7)
                var foundMatch = false
                while true {
                    let foundRange = nsNewVisibleText.range(of: searchText, options: options, range: searchRange)
                    if foundRange.location != NSNotFound {
                        foundMatch = true
                        newVisibleAttributed.addAttribute(.font, value: highlightFont, range: foundRange)
                        newVisibleAttributed.addAttribute(.foregroundColor, value: highlightColor, range: foundRange)
                        newVisibleAttributed.addAttribute(.shadow, value: shadow, range: foundRange)
                        newVisibleAttributed.removeAttribute(.backgroundColor, range: foundRange)
                        let newLocation = foundRange.location + foundRange.length
                        if newLocation < nsNewVisibleText.length {
                            searchRange = NSRange(location: newLocation, length: nsNewVisibleText.length - newLocation)
                        } else {
                            break
                        }
                    } else {
                        break
                    }
                }
                if foundMatch {
                    newVisibleAttributed.enumerateAttribute(.foregroundColor, in: NSRange(location: 0, length: newVisibleAttributed.length), options: []) { value, range, _ in
                        if let color = value as? NSColor {
                            if color != highlightColor {
                                let mutedColor = color.withAlphaComponent(0.3)
                                newVisibleAttributed.addAttribute(.foregroundColor, value: mutedColor, range: range)
                            }
                        }
                    }
                } else {
                    newVisibleAttributed.enumerateAttribute(.foregroundColor, in: NSRange(location: 0, length: newVisibleAttributed.length), options: []) { value, range, _ in
                        if let color = value as? NSColor {
                            let restoredColor = color.withAlphaComponent(1.0)
                            newVisibleAttributed.addAttribute(.foregroundColor, value: restoredColor, range: range)
                        }
                    }
                }
            }
            if let lineRange = lineHighlightRange {
                let baseFontSize = 11 * CGFloat(parent.zoomLevel)
                let highlightFont = NSFont.monospacedSystemFont(ofSize: baseFontSize * 1.05, weight: .semibold)
                let highlightColor = NSColor(hex: 0xAD6ADD)
                let shadow = NSShadow()
                shadow.shadowOffset = NSSize(width: 1, height: -1)
                shadow.shadowBlurRadius = 2
                shadow.shadowColor = NSColor.black.withAlphaComponent(0.7)
                let intersection = NSIntersectionRange(NSRange(location: expandedRange.location, length: newVisibleAttributed.length), lineRange)
                if intersection.length > 0 {
                    let localRange = NSRange(location: intersection.location - expandedRange.location, length: intersection.length)
                    newVisibleAttributed.addAttribute(.font, value: highlightFont, range: localRange)
                    newVisibleAttributed.addAttribute(.foregroundColor, value: highlightColor, range: localRange)
                    newVisibleAttributed.addAttribute(.shadow, value: shadow, range: localRange)
                    newVisibleAttributed.removeAttribute(.backgroundColor, range: localRange)
                }
            }
            if let currentAttributed = textView.textStorage?.attributedSubstring(from: expandedRange), currentAttributed.isEqual(to: newVisibleAttributed) {
                return
            }
            CATransaction.begin()
            CATransaction.setDisableActions(true)
            textView.textStorage?.beginEditing()
            textView.textStorage?.replaceCharacters(in: expandedRange, with: newVisibleAttributed)
            textView.textStorage?.endEditing()
            textView.setSelectedRange(selRange)
            CATransaction.commit()
            textView.layer?.removeAllAnimations()
        }
        
        private func expandRangeToIncludeFullContext(_ visibleRange: NSRange, in fullText: NSString) -> NSRange {
            var expandedRange = visibleRange
            let delimiterPairs: [(String, String)] = [
                ("/*", "*/"),
                ("{/*", "*/}"),
                ("\"\"\"", "\"\"\""),
                ("'''", "'''"),
                ("<!--", "-->"),
                ("/**", "*/"),
                ("///", "///"),
                ("%{", "}"),
                ("#{", "}"),
                ("<<EOF", "EOF"),
                ("=begin", "=end"),
                ("{-", "-}"),
                ("(*", "*)"),
                ("{*", "*}"),
                ("/** @", "*/"),
                ("//!", "//!"),
                (">>> ", "..."),
                ("\\begin{", "\\end{"),
                ("--[[", "]]"),
                ("[[", "]]")
            ]
            for (startDelimiter, endDelimiter) in delimiterPairs {
                if startDelimiter == endDelimiter {
                    var occurrences: [NSRange] = []
                    var searchRange = NSRange(location: 0, length: fullText.length)
                    while true {
                        let foundRange = fullText.range(of: startDelimiter, options: [], range: searchRange)
                        if foundRange.location == NSNotFound { break }
                        occurrences.append(foundRange)
                        let newLocation = foundRange.location + foundRange.length
                        if newLocation >= fullText.length { break }
                        searchRange = NSRange(location: newLocation, length: fullText.length - newLocation)
                    }
                    if occurrences.count >= 2 {
                        for i in 0..<occurrences.count - 1 where i % 2 == 0 {
                            let start = occurrences[i]
                            let end = occurrences[i + 1]
                            if (start.location < visibleRange.location && end.location + end.length > visibleRange.location)
                                || (visibleRange.contains(start.location) && end.location + end.length > NSMaxRange(visibleRange))
                                || (visibleRange.contains(start.location) && visibleRange.contains(end.location + end.length - 1)) {
                                let blockStart = start.location
                                let blockEnd = end.location + end.length
                                expandedRange = NSUnionRange(expandedRange, NSRange(location: blockStart, length: blockEnd - blockStart))
                            }
                        }
                    }
                } else {
                    let startSearchRange1 = NSRange(location: 0, length: visibleRange.location)
                    let startRange1 = fullText.range(of: startDelimiter, options: .backwards, range: startSearchRange1)
                    if startRange1.location != NSNotFound {
                        let endSearchStart = startRange1.location + startRange1.length
                        let endSearchRange1 = NSRange(location: endSearchStart, length: fullText.length - endSearchStart)
                        let endRange1 = fullText.range(of: endDelimiter, options: [], range: endSearchRange1)
                        if endRange1.location != NSNotFound && endRange1.location >= visibleRange.location {
                            let blockStart = startRange1.location
                            let blockEnd = endRange1.location + endRange1.length
                            expandedRange = NSUnionRange(expandedRange, NSRange(location: blockStart, length: blockEnd - blockStart))
                        }
                    }
                    let startSearchRange2 = visibleRange
                    let startRange2 = fullText.range(of: startDelimiter, options: [], range: startSearchRange2)
                    if startRange2.location != NSNotFound {
                        let endSearchStart = startRange2.location + startRange2.length
                        let endSearchRange2 = NSRange(location: endSearchStart, length: fullText.length - endSearchStart)
                        let endRange2 = fullText.range(of: endDelimiter, options: [], range: endSearchRange2)
                        if endRange2.location != NSNotFound {
                            let blockStart = startRange2.location
                            let blockEnd = endRange2.location + endRange2.length
                            expandedRange = NSUnionRange(expandedRange, NSRange(location: blockStart, length: blockEnd - blockStart))
                        }
                    }
                }
            }
            return expandedRange
        }
        
        func navigateToLine(_ lineNumber: Int) {
            guard let textView = textView else { return }
            let lines = textView.string.components(separatedBy: "\n")
            guard lineNumber > 0, lineNumber <= lines.count else { return }
            
            var location = 0
            for i in 0..<lineNumber - 1 {
                location += lines[i].count + 1
            }
            
            let lineText = lines[lineNumber - 1]
            let range = NSRange(location: location, length: lineText.count)
            
            textView.scrollRangeToVisible(range)
            textView.setSelectedRange(range)
        }
        
        func jumpToNextSearchMatch() {
            guard let textView = textView, !parent.searchQuery.isEmpty else { return }
            DispatchQueue.main.async {
                let options: NSString.CompareOptions = self.parent.searchCaseSensitive ? [] : [.caseInsensitive]
                let nsText = textView.string as NSString
                let currentRange = textView.selectedRange()
                let startLocation = currentRange.location + currentRange.length
                let searchRange = NSRange(location: startLocation, length: nsText.length - startLocation)
                var foundRange = nsText.range(of: self.parent.searchQuery, options: options, range: searchRange)
                if foundRange.location == NSNotFound {
                    foundRange = nsText.range(of: self.parent.searchQuery, options: options)
                }
                if foundRange.location != NSNotFound {
                    textView.scrollRangeToVisible(foundRange)
                    textView.setSelectedRange(foundRange)
                    self.updateSearchIndicator()
                }
            }
        }
        
        func jumpToPreviousSearchMatch() {
            guard let textView = textView, !parent.searchQuery.isEmpty else { return }
            let options: NSString.CompareOptions = parent.searchCaseSensitive ? [.backwards] : [.backwards, .caseInsensitive]
            let nsText = textView.string as NSString
            let currentRange = textView.selectedRange()
            let searchRange = NSRange(location: 0, length: currentRange.location)
            var foundRange = nsText.range(of: parent.searchQuery, options: options, range: searchRange)
            if foundRange.location == NSNotFound {
                foundRange = nsText.range(of: parent.searchQuery, options: options)
            }
            if foundRange.location != NSNotFound {
                textView.scrollRangeToVisible(foundRange)
                textView.setSelectedRange(foundRange)
                updateSearchIndicator()
            }
        }
        
        func updateSearchIndicator() {
            guard let textView = textView, !parent.searchQuery.isEmpty else {
                parent.totalSearchMatches = 0
                parent.currentSearchMatch = 0
                return
            }
            let nsText = textView.string as NSString
            let options: NSString.CompareOptions = parent.searchCaseSensitive ? [] : [.caseInsensitive]
            var searchRange = NSRange(location: 0, length: nsText.length)
            var matches: [NSRange] = []
            while true {
                let foundRange = nsText.range(of: parent.searchQuery, options: options, range: searchRange)
                if foundRange.location != NSNotFound {
                    matches.append(foundRange)
                    let newLocation = foundRange.location + foundRange.length
                    if newLocation < nsText.length {
                        searchRange = NSRange(location: newLocation, length: nsText.length - newLocation)
                    } else {
                        break
                    }
                } else {
                    break
                }
            }
            parent.totalSearchMatches = matches.count
            let currentLoc = textView.selectedRange().location
            var currentIndex = 0
            for (i, range) in matches.enumerated() {
                if NSLocationInRange(currentLoc, range) {
                    currentIndex = i + 1
                    break
                }
                if currentLoc < range.location {
                    currentIndex = i + 1
                    break
                }
                currentIndex = i + 1
            }
            parent.currentSearchMatch = currentIndex
        }
    }
}

class IDETextView: NSTextView {
    var customKeyBinds: [String: String] = [:]
    private var trackingArea: NSTrackingArea?
    
    override var intrinsicContentSize: NSSize {
        return NSSize(width: CGFloat.greatestFiniteMagnitude, height: super.intrinsicContentSize.height)
    }
    
    override func performKeyEquivalent(with event: NSEvent) -> Bool {
        if event.modifierFlags.contains(.command) {
            let allowedKeys: Set<String> = ["s", "f", "z", "y", "c", "v", "x", "a"]
            if let key = event.charactersIgnoringModifiers?.lowercased(), !allowedKeys.contains(key) {
                return true
            }
        }
        return super.performKeyEquivalent(with: event)
    }
    
    override func keyDown(with event: NSEvent) {
        if event.modifierFlags.contains(.command) {
            let allowedKeys: Set<String> = ["s", "f", "z", "y", "c", "v", "x", "a"]
            if let key = event.charactersIgnoringModifiers?.lowercased(), !allowedKeys.contains(key) {
                return
            }
        }
        if event.modifierFlags.contains(.command) && event.charactersIgnoringModifiers == "s" {
            if let coordinator = self.delegate as? IDEEditorView.Coordinator {
                coordinator.parent.onSave()
            }
            return
        }
        if event.modifierFlags.contains(.command) && event.charactersIgnoringModifiers == "f" {
            NotificationCenter.default.post(name: Notification.Name("OpenSearch"), object: nil)
            return
        }
        if event.modifierFlags.contains(.command) && event.charactersIgnoringModifiers == "z" {
            self.undoManager?.undo()
            return
        } else if event.modifierFlags.contains(.command) && event.charactersIgnoringModifiers == "y" {
            self.undoManager?.redo()
            return
        }
        if event.modifierFlags.contains(.command) && event.charactersIgnoringModifiers == "c" {
            self.copy(self)
            return
        } else if event.modifierFlags.contains(.command) && event.charactersIgnoringModifiers == "v" {
            self.paste(self)
            return
        } else if event.modifierFlags.contains(.command) && event.charactersIgnoringModifiers == "x" {
            self.cut(self)
            return
        } else if event.modifierFlags.contains(.command) && event.charactersIgnoringModifiers == "a" {
            self.selectAll(self)
            return
        }
        guard let chars = event.charactersIgnoringModifiers else {
            super.keyDown(with: event)
            return
        }
        if chars == "\t" && !event.modifierFlags.contains(.shift) {
            if self.selectedRange().length > 0 {
                let selectionRange = self.selectedRange()
                let selectionText = (self.string as NSString).substring(with: selectionRange)
                let isMultiline = selectionText.contains("\n")
                if isMultiline {
                    indentSelectedLines()
                } else {
                    indentSingleLine(selectionRange: selectionRange)
                }
            } else {
                let nsString = self.string as NSString
                let sel = self.selectedRange()
                let currentLineRange = nsString.lineRange(for: sel)
                let currentLineText = nsString.substring(with: currentLineRange)
                let currentLineTrimmed = currentLineText.trimmingCharacters(in: .whitespacesAndNewlines)
                if currentLineTrimmed.isEmpty && currentLineRange.location > 0 {
                    let previousLineRange = nsString.lineRange(for: NSRange(location: currentLineRange.location - 1, length: 0))
                    let previousLineText = nsString.substring(with: previousLineRange)
                    let indentation = previousLineText.prefix { $0 == " " || $0 == "\t" }
                    if !indentation.isEmpty {
                        self.replaceCharacters(in: currentLineRange, with: String(indentation))
                        self.setSelectedRange(NSRange(location: currentLineRange.location + String(indentation).count, length: 0))
                        return
                    }
                }
                super.keyDown(with: event)
            }
        } else {
            super.keyDown(with: event)
        }
    }
    
    override func deleteBackward(_ sender: Any?) {
        let sel = self.selectedRange()
        if sel.length != 0 {
            super.deleteBackward(sender)
            return
        }
        let nsString = self.string as NSString
        let caretLocation = sel.location
        let lineRange = nsString.lineRange(for: NSRange(location: caretLocation, length: 0))
        let prefixRange = NSRange(location: lineRange.location, length: caretLocation - lineRange.location)
        let prefix = nsString.substring(with: prefixRange)
        if prefix.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && !prefix.isEmpty {
            if prefix.hasSuffix("\t") {
                let deleteRange = NSRange(location: caretLocation - 1, length: 1)
                self.shouldChangeText(in: deleteRange, replacementString: "")
                self.replaceCharacters(in: deleteRange, with: "")
                self.didChangeText()
                return
            } else {
                var spaceCount = 0
                for char in prefix.reversed() {
                    if char == " " {
                        spaceCount += 1
                    } else {
                        break
                    }
                }
                let indentSize = 4
                let remainder = spaceCount % indentSize
                let removeCount = remainder == 0 ? indentSize : remainder
                let deletionLength = min(removeCount, spaceCount)
                let deleteRange = NSRange(location: caretLocation - deletionLength, length: deletionLength)
                self.shouldChangeText(in: deleteRange, replacementString: "")
                self.replaceCharacters(in: deleteRange, with: "")
                self.didChangeText()
                return
            }
        }
        super.deleteBackward(sender)
    }
    
    override func insertBacktab(_ sender: Any?) {
        let selRange = self.selectedRange()
        let nsString = self.string as NSString
        let startLineRange = nsString.lineRange(for: NSRange(location: selRange.location, length: 0))
        var endLoc = selRange.location + selRange.length - 1
        if endLoc < 0 { endLoc = 0 }
        let endLineRange = nsString.lineRange(for: NSRange(location: endLoc, length: 0))
        let rangeToModify = NSRange(location: startLineRange.location, length: endLineRange.location + endLineRange.length - startLineRange.location)
        if rangeToModify.length == 0 { return }
        let pattern = "^(\\t| {1,4})"
        if let regex = try? NSRegularExpression(pattern: pattern, options: [.anchorsMatchLines]) {
            let originalText = nsString.substring(with: rangeToModify)
            let newText = regex.stringByReplacingMatches(in: originalText, options: [], range: NSRange(location: 0, length: (originalText as NSString).length), withTemplate: "")
            self.shouldChangeText(in: rangeToModify, replacementString: newText)
            self.replaceCharacters(in: rangeToModify, with: newText)
            self.didChangeText()
            self.setSelectedRange(NSRange(location: startLineRange.location, length: (newText as NSString).length))
            if let coordinator = self.delegate as? IDEEditorView.Coordinator {
                coordinator.applySyntaxHighlighting(to: self)
            }
        }
    }
    
    override func insertNewline(_ sender: Any?) {
        let nsString = self.string as NSString
        let selRange = self.selectedRange()
        let currentLineRange = nsString.lineRange(for: selRange)
        let currentLine = nsString.substring(with: currentLineRange)
        let indentation = currentLine.prefix { $0 == " " || $0 == "\t" }
        super.insertNewline(sender)
        if !indentation.isEmpty {
            self.insertText(String(indentation), replacementRange: self.selectedRange())
        }
    }
    
    private func indentSelectedLines() {
        let selRange = self.selectedRange()
        let nsString = self.string as NSString
        let startLine = nsString.lineRange(for: NSRange(location: selRange.location, length: 0))
        var endLoc = selRange.location + selRange.length - 1
        if endLoc < 0 { endLoc = 0 }
        let endLine = nsString.lineRange(for: NSRange(location: endLoc, length: 0))
        let rangeToModify = NSRange(location: startLine.location, length: endLine.location + endLine.length - startLine.location)
        let originalText = nsString.substring(with: rangeToModify)
        var lines = originalText.components(separatedBy: "\n")
        let hadTrailingNewline = originalText.hasSuffix("\n")
        if hadTrailingNewline, let last = lines.last, last.isEmpty {
            lines.removeLast()
        }
        lines = lines.map { "\t" + $0 }
        var newText = lines.joined(separator: "\n")
        if hadTrailingNewline { newText += "\n" }
        self.shouldChangeText(in: rangeToModify, replacementString: newText)
        self.replaceCharacters(in: rangeToModify, with: newText)
        self.didChangeText()
        let newLength = (newText as NSString).length
        self.setSelectedRange(NSRange(location: startLine.location, length: newLength))
        if let coordinator = self.delegate as? IDEEditorView.Coordinator {
            coordinator.applySyntaxHighlighting(to: self)
        }
    }
    
    private func indentSingleLine(selectionRange: NSRange) {
        let selectedText = (self.string as NSString).substring(with: selectionRange)
        let replaced = "\t" + selectedText
        self.shouldChangeText(in: selectionRange, replacementString: replaced)
        self.insertText(replaced, replacementRange: selectionRange)
        self.didChangeText()
        let newRange = NSRange(location: selectionRange.location, length: replaced.count)
        self.setSelectedRange(newRange)
        if let coordinator = self.delegate as? IDEEditorView.Coordinator {
            coordinator.applySyntaxHighlighting(to: self)
        }
    }
    
    private func unindentSingleLine(selectionRange: NSRange) {
        let nsString = self.string as NSString
        let fullLineRange = nsString.lineRange(for: selectionRange)
        let lineText = nsString.substring(with: fullLineRange)
        let pattern = "^(\\t| {1,4})"
        if let regex = try? NSRegularExpression(pattern: pattern, options: []) {
            let newText = regex.stringByReplacingMatches(in: lineText, options: [], range: NSRange(location: 0, length: (lineText as NSString).length), withTemplate: "")
            self.shouldChangeText(in: fullLineRange, replacementString: newText)
            self.replaceCharacters(in: fullLineRange, with: newText)
            self.didChangeText()
            let newRange = NSRange(location: fullLineRange.location, length: (newText as NSString).length)
            self.setSelectedRange(newRange)
            if let coordinator = self.delegate as? IDEEditorView.Coordinator {
                coordinator.applySyntaxHighlighting(to: self)
            }
        }
    }
    
    override func menu(for event: NSEvent) -> NSMenu? {
        let customMenu = NSMenu(title: "Context Menu")
        customMenu.addItem(withTitle: "Copy", action: #selector(NSText.copy(_:)), keyEquivalent: customKeyBinds["copy"] ?? "")
        customMenu.addItem(withTitle: "Paste", action: #selector(NSText.paste(_:)), keyEquivalent: customKeyBinds["paste"] ?? "")
        customMenu.addItem(withTitle: "Cut", action: #selector(NSText.cut(_:)), keyEquivalent: customKeyBinds["cut"] ?? "")
        let undoItem = NSMenuItem(title: "Undo", action: #selector(customUndo(_:)), keyEquivalent: customKeyBinds["undo"] ?? "")
        undoItem.target = self
        customMenu.addItem(undoItem)
        let redoItem = NSMenuItem(title: "Redo", action: #selector(customRedo(_:)), keyEquivalent: customKeyBinds["redo"] ?? "")
        redoItem.target = self
        customMenu.addItem(redoItem)
        return customMenu
    }
    
    override func validateMenuItem(_ menuItem: NSMenuItem) -> Bool {
        if menuItem.title == "Services" || menuItem.title == "Services…" {
            return false
        }
        return super.validateMenuItem(menuItem)
    }
    
    @objc func customUndo(_ sender: Any?) {
        self.undoManager?.undo()
    }
    
    @objc func customRedo(_ sender: Any?) {
        self.undoManager?.redo()
    }
    
    override func viewDidMoveToWindow() {
        super.viewDidMoveToWindow()
        self.window?.invalidateCursorRects(for: self)
        self.resetCursorRects()
    }
    
    override func resetCursorRects() {
        super.resetCursorRects()
        let rect = self.visibleRect
        if !self.isEditable {
            self.addCursorRect(rect, cursor: NSCursor.pointingHand)
        } else {
            self.addCursorRect(rect, cursor: NSCursor.iBeam)
        }
    }
    
    override var isEditable: Bool {
        didSet {
            self.window?.invalidateCursorRects(for: self)
            self.resetCursorRects()
        }
    }
    
    override func mouseEntered(with event: NSEvent) {
        if !self.isEditable {
            NSCursor.pointingHand.set()
        } else {
            NSCursor.iBeam.set()
        }
    }
    
    override func mouseMoved(with event: NSEvent) {
        if !self.isEditable {
            NSCursor.pointingHand.set()
        } else {
            NSCursor.iBeam.set()
        }
    }
    
    override func cursorUpdate(with event: NSEvent) {
        if !self.isEditable {
            NSCursor.pointingHand.set()
        } else {
            NSCursor.iBeam.set()
        }
    }
    
    override func updateTrackingAreas() {
        super.updateTrackingAreas()
        if let trackingArea = self.trackingArea {
            self.removeTrackingArea(trackingArea)
        }
        let options: NSTrackingArea.Options = [
            .activeAlways,
            .mouseEnteredAndExited,
            .mouseMoved,
            .cursorUpdate,
            .inVisibleRect
        ]
        self.trackingArea = NSTrackingArea(rect: self.bounds, options: options, owner: self, userInfo: nil)
        self.addTrackingArea(self.trackingArea!)
        self.window?.invalidateCursorRects(for: self)
    }
}

class IDEScrollView: NSScrollView {
    override func performKeyEquivalent(with event: NSEvent) -> Bool {
        if let chars = event.charactersIgnoringModifiers,
           chars == "\t",
           event.modifierFlags.contains(.shift) {
            if let textView = self.documentView as? IDETextView {
                textView.insertBacktab(nil)
                return true
            }
        }
        return super.performKeyEquivalent(with: event)
    }
}

class IDECenteredLineNumberRuler: NSRulerView {
    weak var textView: NSTextView?
    let theme: CodeEditorTheme
    let zoomLevel: Double
    
    init(textView: NSTextView, theme: CodeEditorTheme, zoomLevel: Double) {
        self.theme = theme
        self.zoomLevel = zoomLevel
        super.init(scrollView: textView.enclosingScrollView, orientation: .verticalRuler)
        self.textView = textView
        self.clientView = textView
        self.ruleThickness = 70
    }
    
    required init(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func drawHashMarksAndLabels(in rect: NSRect) {
        NSColor(hex: 0x333333).setFill()
        rect.fill()
        
        guard let tv = textView, let layoutManager = tv.layoutManager else { return }
        let fullGlyphRange = NSRange(location: 0, length: layoutManager.numberOfGlyphs)
        var lineIndex = 1
        layoutManager.enumerateLineFragments(forGlyphRange: fullGlyphRange) { lineRect, _, _, _, _ in
            var lineRectInTextView = lineRect
            lineRectInTextView.origin.x += tv.textContainerOrigin.x
            lineRectInTextView.origin.y += tv.textContainerOrigin.y
            let lineRectInRuler = self.convert(lineRectInTextView, from: tv)
            let yCenter = lineRectInRuler.midY
            let numberString = "\(lineIndex)"
            let font = NSFont.monospacedSystemFont(ofSize: 10 * CGFloat(self.zoomLevel), weight: .semibold)
            let attrs: [NSAttributedString.Key: Any] = [
                .font: font,
                .foregroundColor: ThemeColorProvider.lineNumberTextColor(for: self.theme)
            ]
            let numAttr = NSAttributedString(string: numberString, attributes: attrs)
            let size = numAttr.size()
            let xPos = self.ruleThickness - size.width - 35
            let yPos = yCenter - (size.height / 2.5)
            numAttr.draw(at: NSPoint(x: xPos, y: yPos))
            lineIndex += 1
        }
    }
}

class InvisibleScroller: NSScroller {
    override func draw(_ dirtyRect: NSRect) {
    }
    override var alphaValue: CGFloat {
        get { 0 }
        set { }
    }
    override func hitTest(_ point: NSPoint) -> NSView? {
        return nil
    }
}

extension NSRange {
    func contains(_ location: Int) -> Bool {
        return location >= self.location && location < self.location + self.length
    }
}
