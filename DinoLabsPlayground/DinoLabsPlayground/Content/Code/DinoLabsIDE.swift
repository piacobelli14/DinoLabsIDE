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
    
    var body: some View {
        Group {
            if isLoading {
                ProgressView("Loading file...")
            } else {
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
                    keyBinds: keyBinds
                )
            }
        }
        .onAppear {
            loadFileContent()
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
}

struct IDEEditorView: NSViewRepresentable {
    @Binding var text: String
    let programmingLanguage: String
    var theme: CodeEditorTheme = .defaultTheme
    var zoomLevel: Double = 1.0
    var keyBinds: [String: String] = [:]
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    func makeNSView(context: Context) -> NSScrollView {
        let textView = IDETextView()
        textView.isEditable = true
        textView.isRichText = false
        textView.usesFindBar = true
        textView.allowsUndo = true
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
            textContainer.containerSize = NSSize(
                width: CGFloat.greatestFiniteMagnitude,
                height: .greatestFiniteMagnitude
            )
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
        
        let ruler = IDECenteredLineNumberRuler(textView: textView, theme: theme, zoomLevel: zoomLevel)
        scrollView.verticalRulerView = ruler
        
        scrollView.contentView.postsBoundsChangedNotifications = true
        NotificationCenter.default.addObserver(forName: NSView.boundsDidChangeNotification, object: scrollView.contentView, queue: .main) { _ in
            if let textView = scrollView.documentView as? IDETextView {
                context.coordinator.applySyntaxHighlighting(to: textView)
            }
        }
        
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
        }
    }
    
    class Coordinator: NSObject, NSTextViewDelegate {
        var parent: IDEEditorView
        private var pendingHighlightWorkItem: DispatchWorkItem?
        
        init(_ parent: IDEEditorView) {
            self.parent = parent
        }
        
        func textDidChange(_ notification: Notification) {
            guard let textView = notification.object as? NSTextView else { return }
            parent.text = textView.string
            pendingHighlightWorkItem?.cancel()
            let currentText = textView.string
            let workItem = DispatchWorkItem { [weak self, weak textView] in
                guard let self = self, let textView = textView else { return }
                if textView.string == currentText {
                    self.applySyntaxHighlightingInternal(on: textView, withReferenceText: currentText)
                }
            }
            pendingHighlightWorkItem = workItem
            DispatchQueue.global(qos: .userInitiated).asyncAfter(deadline: .now() + 0.05, execute: workItem)
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
            DispatchQueue.global(qos: .userInitiated).async(execute: workItem)
        }
        
        private func applySyntaxHighlightingInternal(on textView: NSTextView, withReferenceText currentText: String) {
            guard let layoutManager = textView.layoutManager,
                  let textContainer = textView.textContainer else { return }
            
            let visibleRect = textView.visibleRect
            let glyphRange = layoutManager.glyphRange(forBoundingRect: visibleRect, in: textContainer)
            let visibleCharRange = layoutManager.characterRange(forGlyphRange: glyphRange, actualGlyphRange: nil)
            
            let fullText = textView.string as NSString
            let visibleLineRange = fullText.lineRange(for: visibleCharRange)
            let visibleText = fullText.substring(with: visibleLineRange)
            
            let tokens = SwiftParser.tokenize(visibleText, language: parent.programmingLanguage)
            let paragraphStyle = textView.defaultParagraphStyle ?? NSParagraphStyle()
            let font = NSFont.monospacedSystemFont(ofSize: 11 * CGFloat(parent.zoomLevel), weight: .semibold)
            let lineHeight: CGFloat = 20.0
            let actualLineHeight = layoutManager.defaultLineHeight(for: font)
            let baselineOffset = (lineHeight - actualLineHeight) / 2.0
            
            let newVisibleAttributed = NSMutableAttributedString()
            var currentLine = 1
            for token in tokens {
                if token.lineNumber > currentLine {
                    let needed = token.lineNumber - currentLine
                    for _ in 0..<needed {
                        let newlineAttr = NSAttributedString(
                            string: "\n",
                            attributes: [.paragraphStyle: paragraphStyle]
                        )
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
                    let newlineAttr = NSAttributedString(
                        string: "\n",
                        attributes: [.paragraphStyle: paragraphStyle]
                    )
                    newVisibleAttributed.append(newlineAttr)
                }
            }
            
            let selRange = textView.selectedRange()
            DispatchQueue.main.async {
                if textView.string == currentText {
                    textView.alphaValue = 0.0
                    let undoManager = textView.undoManager
                    undoManager?.disableUndoRegistration()
                    textView.textStorage?.beginEditing()
                    textView.textStorage?.replaceCharacters(in: visibleLineRange, with: newVisibleAttributed)
                    textView.textStorage?.endEditing()
                    textView.setSelectedRange(selRange)
                    textView.alphaValue = 1.0
                    undoManager?.enableUndoRegistration()
                }
            }
        }
    }
}

class IDETextView: NSTextView {
    var customKeyBinds: [String: String] = [:]
    
    override var intrinsicContentSize: NSSize {
        return NSSize(width: CGFloat.greatestFiniteMagnitude, height: super.intrinsicContentSize.height)
    }
    
    override func keyDown(with event: NSEvent) {
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
        if hadTrailingNewline, let last = lines.last, last.isEmpty { lines.removeLast() }
        
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
        if hadTrailingNewline, let last = lines.last, last.isEmpty { lines.removeLast() }
        
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
}

class IDEScrollView: NSScrollView {
    override func performKeyEquivalent(with event: NSEvent) -> Bool {
        if let chars = event.charactersIgnoringModifiers, chars == "\t", event.modifierFlags.contains(.shift) {
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
        
        layoutManager.enumerateLineFragments(forGlyphRange: fullGlyphRange) { (lineRect, usedRect, container, fragmentRange, stop) in
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
