//
// DinoLabsIDE.swift
//
// Created by Peter Iacobelli on 2/21/25.
//

import SwiftUI
import AppKit

struct IDEView: View {
    let fileURL: URL
    let programmingLanguage: String
    @Binding var keyBinds: [String: String]
    @Binding var zoomLevel: Double
    @Binding var colorTheme: String
    @State private var fileContent: String = ""
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
                                    CodeTextField(placeholder: "Search all files...", text: $searchQuery, onReturnKeyPressed: {
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
                                            NotificationCenter.default.post(name: Notification.Name("JumpToNextSearchMatch"), object: nil)
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
                                        .hoverEffect(opacity: 0.6,
                                                     scale: 1.05,
                                                     cursor: .pointingHand)
                                        
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
                                        .hoverEffect(opacity: 0.6,
                                                     scale: 1.05,
                                                     cursor: .pointingHand)
                                        
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
                                        .hoverEffect(opacity: 0.6,
                                                     scale: 1.05,
                                                     cursor: .pointingHand)
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
                            
                            CodeButtonMain {
                                
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
                                Image(systemName: "square.split.2x1")
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
                        totalSearchMatches: $totalSearchMatches
                    )
                }
            }
        }
        .onAppear {
            loadFileContent()
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
    }
    
    private func loadFileContent() {
        isLoading = true
        DispatchQueue.global(qos: .userInitiated).async {
            let content = (try? String(contentsOf: fileURL)) ?? "Unable to load file content."
            DispatchQueue.main.async {
                self.fileContent = content
                self.isLoading = false
            }
        }
    }
    
    private func replaceNextOccurrence() {
        guard !searchQuery.isEmpty else { return }
        if let foundRange = nextRange(of: searchQuery, in: fileContent, caseSensitive: searchCaseSensitive) {
            let tempSearch = searchQuery
            searchQuery = ""
            fileContent.replaceSubrange(foundRange, with: replaceQuery)
            withAnimation(.none) {
                fileContent = fileContent
            }
            DispatchQueue.main.async {
                self.searchQuery = tempSearch
            }
        }
    }
    
    private func replaceAllOccurrences() {
        guard !searchQuery.isEmpty else { return }
        let tempSearch = searchQuery
        searchQuery = ""
        if searchCaseSensitive {
            fileContent = fileContent.replacingOccurrences(of: tempSearch, with: replaceQuery)
        } else {
            fileContent = fileContent.replacingOccurrences(of: tempSearch, with: replaceQuery, options: .caseInsensitive, range: nil)
        }
        withAnimation(.none) {
            fileContent = fileContent
        }
        DispatchQueue.main.async {
            self.searchQuery = tempSearch
        }
    }
    
    private func nextRange(of needle: String,
                           in haystack: String,
                           caseSensitive: Bool) -> Range<String.Index>? {
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
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    func makeNSView(context: Context) -> NSScrollView {
        let textView = IDETextView()
        textView.wantsLayer = true
        textView.layer?.actions = [:]
        textView.layer?.speed = 1000
        textView.isEditable = true
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
            textContainer.containerSize = NSSize(width: CGFloat.greatestFiniteMagnitude,
                                                  height: .greatestFiniteMagnitude)
            textContainer.lineFragmentPadding = 8.0
            textContainer.lineBreakMode = .byClipping
        }
        
        textView.isHorizontallyResizable = true
        textView.isVerticallyResizable = true
        textView.autoresizingMask = [.width, .height]
        textView.maxSize = NSSize(width: CGFloat.greatestFiniteMagnitude,
                                  height: .greatestFiniteMagnitude)
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
                context.coordinator.applySyntaxHighlightingInternal(on: textView,
                                                                    withReferenceText: textView.string)
            }
        }
        
        context.coordinator.textView = textView
        return scrollView
    }
    
    func updateNSView(_ scrollView: NSScrollView, context: Context) {
        guard let textView = scrollView.documentView as? IDETextView else { return }
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
        
        init(_ parent: IDEEditorView) {
            self.parent = parent
            super.init()
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
        }
        
        func textDidChange(_ notification: Notification) {
            guard let textView = notification.object as? NSTextView else { return }
            parent.text = textView.string
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
                    self.applySyntaxHighlightingInternal(on: textView,
                                                         withReferenceText: currentText)
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
            let visibleText = fullText.substring(with: visibleLineRange)
            
            let paragraphStyle = textView.defaultParagraphStyle ?? NSParagraphStyle()
            let font = NSFont.monospacedSystemFont(ofSize: 11 * CGFloat(parent.zoomLevel), weight: .semibold)
            let lineHeight: CGFloat = 20.0
            let actualLineHeight = layoutManager.defaultLineHeight(for: font)
            let baselineOffset = (lineHeight - actualLineHeight) / 2.0
            let selRange = textView.selectedRange()
            
            let tokens = SwiftParser.tokenize(visibleText, language: parent.programmingLanguage)
            let newVisibleAttributed = NSMutableAttributedString()
            var currentLine = 1
            
            for token in tokens {
                if token.lineNumber > currentLine {
                    let needed = token.lineNumber - currentLine
                    for _ in 0..<needed {
                        let newlineAttr = NSAttributedString(string: "\n",
                                                              attributes: [.paragraphStyle: paragraphStyle])
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
            
            let visibleLinesCount = visibleText.components(separatedBy: "\n").count
            if visibleLinesCount > currentLine {
                let diff = visibleLinesCount - currentLine
                for _ in 0..<diff {
                    let newlineAttr = NSAttributedString(string: "\n",
                                                          attributes: [.paragraphStyle: paragraphStyle])
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
                
                while true {
                    let foundRange = nsNewVisibleText.range(of: searchText, options: options, range: searchRange)
                    if foundRange.location != NSNotFound {
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
                
                newVisibleAttributed.enumerateAttribute(.foregroundColor, in: NSRange(location: 0, length: newVisibleAttributed.length), options: []) { value, range, _ in
                    if let color = value as? NSColor {
                        if color != highlightColor {
                            let mutedColor = color.withAlphaComponent(0.3)
                            newVisibleAttributed.addAttribute(.foregroundColor, value: mutedColor, range: range)
                        }
                    }
                }
            }
            
            if let currentAttributed = textView.textStorage?.attributedSubstring(from: visibleLineRange),
               currentAttributed.isEqual(to: newVisibleAttributed) {
                return
            }
            
            CATransaction.begin()
            CATransaction.setDisableActions(true)
            textView.textStorage?.beginEditing()
            textView.textStorage?.replaceCharacters(in: visibleLineRange, with: newVisibleAttributed)
            textView.textStorage?.endEditing()
            textView.setSelectedRange(selRange)
            CATransaction.commit()
            textView.layer?.removeAllAnimations()
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
    
    override var intrinsicContentSize: NSSize {
        return NSSize(width: CGFloat.greatestFiniteMagnitude,
                      height: super.intrinsicContentSize.height)
    }
    
    override func keyDown(with event: NSEvent) {
        if event.modifierFlags.contains(.command) && event.charactersIgnoringModifiers == "f" {
            NotificationCenter.default.post(name: Notification.Name("OpenSearch"), object: nil)
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
                super.keyDown(with: event)
            }
        } else {
            super.keyDown(with: event)
        }
    }
    
    override func insertBacktab(_ sender: Any?) {
        var selRange = self.selectedRange()
        if selRange.length == 0 {
            let nsString = self.string as NSString
            selRange = nsString.lineRange(for: selRange)
            self.setSelectedRange(selRange)
        }
        let selectionText = (self.string as NSString).substring(with: self.selectedRange())
        let isMultiline = selectionText.contains("\n")
        if isMultiline {
            unindentSelectedLines()
        } else {
            unindentSingleLine(selectionRange: self.selectedRange())
        }
    }
    
    private func indentSelectedLines() {
        let selRange = self.selectedRange()
        let nsString = self.string as NSString
        let startLine = nsString.lineRange(for: NSRange(location: selRange.location, length: 0))
        var endLoc = selRange.location + selRange.length - 1
        if endLoc < 0 { endLoc = 0 }
        let endLine = nsString.lineRange(for: NSRange(location: endLoc, length: 0))
        let rangeToModify = NSRange(location: startLine.location,
                                    length: endLine.location + endLine.length - startLine.location)
        let originalText = nsString.substring(with: rangeToModify)
        var lines = originalText.components(separatedBy: "\n")
        let hadTrailingNewline = originalText.hasSuffix("\n")
        if hadTrailingNewline, let last = lines.last, last.isEmpty {
            lines.removeLast()
        }
        lines = lines.map { "\t" + $0 }
        var newText = lines.joined(separator: "\n")
        if hadTrailingNewline { newText += "\n" }
        self.replaceCharacters(in: rangeToModify, with: newText)
        let newLength = (newText as NSString).length
        self.setSelectedRange(NSRange(location: startLine.location, length: newLength))
        if let coordinator = self.delegate as? IDEEditorView.Coordinator {
            coordinator.applySyntaxHighlighting(to: self)
        }
    }
    
    private func unindentSelectedLines() {
        let selRange = self.selectedRange()
        let nsString = self.string as NSString
        let startLine = nsString.lineRange(for: NSRange(location: selRange.location, length: 0))
        var endLoc = selRange.location + selRange.length - 1
        if endLoc < 0 { endLoc = 0 }
        let endLine = nsString.lineRange(for: NSRange(location: endLoc, length: 0))
        let rangeToModify = NSRange(location: startLine.location,
                                    length: endLine.location + endLine.length - startLine.location)
        let originalText = nsString.substring(with: rangeToModify)
        var lines = originalText.components(separatedBy: "\n")
        let hadTrailingNewline = originalText.hasSuffix("\n")
        if hadTrailingNewline, let last = lines.last, last.isEmpty {
            lines.removeLast()
        }
        let indentWidth = 4
        lines = lines.map { line -> String in
            if line.hasPrefix("\t") {
                return String(line.dropFirst())
            } else {
                let spaceCount = line.prefix(while: { $0 == " " }).count
                let removal = min(indentWidth, spaceCount)
                return String(line.dropFirst(removal))
            }
        }
        var newText = lines.joined(separator: "\n")
        if hadTrailingNewline { newText += "\n" }
        self.replaceCharacters(in: rangeToModify, with: newText)
        let newLength = (newText as NSString).length
        self.setSelectedRange(NSRange(location: startLine.location, length: newLength))
        if let coordinator = self.delegate as? IDEEditorView.Coordinator {
            coordinator.applySyntaxHighlighting(to: self)
        }
    }
    
    private func indentSingleLine(selectionRange: NSRange) {
        let selectedText = (self.string as NSString).substring(with: selectionRange)
        let replaced = "\t" + selectedText
        self.insertText(replaced, replacementRange: selectionRange)
        let newRange = NSRange(location: selectionRange.location, length: replaced.count)
        self.setSelectedRange(newRange)
        if let coordinator = self.delegate as? IDEEditorView.Coordinator {
            coordinator.applySyntaxHighlighting(to: self)
        }
    }
    
    private func unindentSingleLine(selectionRange: NSRange) {
        let selectedText = (self.string as NSString).substring(with: selectionRange)
        let indentWidth = 4
        if selectedText.hasPrefix("\t") {
            let replaced = String(selectedText.dropFirst())
            self.insertText(replaced, replacementRange: selectionRange)
            let newRange = NSRange(location: selectionRange.location, length: replaced.count)
            self.setSelectedRange(newRange)
            if let coordinator = self.delegate as? IDEEditorView.Coordinator {
                coordinator.applySyntaxHighlighting(to: self)
            }
        } else {
            let spaceCount = selectedText.prefix(while: { $0 == " " }).count
            if spaceCount > 0 {
                let removal = min(indentWidth, spaceCount)
                let replaced = String(selectedText.dropFirst(removal))
                self.insertText(replaced, replacementRange: selectionRange)
                let newRange = NSRange(location: selectionRange.location, length: replaced.count)
                self.setSelectedRange(newRange)
                if let coordinator = self.delegate as? IDEEditorView.Coordinator {
                    coordinator.applySyntaxHighlighting(to: self)
                }
            }
        }
    }
    
    override func menu(for event: NSEvent) -> NSMenu? {
        let customMenu = NSMenu(title: "Context Menu")
        customMenu.addItem(withTitle: "Copy",
                           action: #selector(NSText.copy(_:)),
                           keyEquivalent: customKeyBinds["copy"] ?? "")
        customMenu.addItem(withTitle: "Paste",
                           action: #selector(NSText.paste(_:)),
                           keyEquivalent: customKeyBinds["paste"] ?? "")
        customMenu.addItem(withTitle: "Cut",
                           action: #selector(NSText.cut(_:)),
                           keyEquivalent: customKeyBinds["cut"] ?? "")
        let undoItem = NSMenuItem(title: "Undo",
                                  action: #selector(customUndo(_:)),
                                  keyEquivalent: customKeyBinds["undo"] ?? "")
        undoItem.target = self
        customMenu.addItem(undoItem)
        let redoItem = NSMenuItem(title: "Redo",
                                  action: #selector(customRedo(_:)),
                                  keyEquivalent: customKeyBinds["redo"] ?? "")
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
