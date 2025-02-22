//
//  DinoLabsIDE.swift
//
//  Created by Peter Iacobelli on 2/21/25.
//

import SwiftUI
import AppKit

struct IDEView: View {
    let fileURL: URL
    let programmingLanguage: String
    @State private var fileContent: String = ""
    @State private var isLoading: Bool = false
    
    var body: some View {
        Group {
            if isLoading {
                ProgressView("Loading file...")
            } else {
                IDEEditorView(
                    text: $fileContent,
                    programmingLanguage: programmingLanguage
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
        textView.textColor       = NSColor(hex: 0xFFFFFF)
        textView.font            = .monospacedSystemFont(ofSize: 11, weight: .semibold)
        
        let paragraphStyle = NSMutableParagraphStyle()
        paragraphStyle.lineSpacing = 4.0
        textView.defaultParagraphStyle = paragraphStyle
        textView.typingAttributes = [
            .font: textView.font ?? NSFont.monospacedSystemFont(ofSize: 11, weight: .semibold),
            .foregroundColor: NSColor(hex: 0xFFFFFF),
            .paragraphStyle: paragraphStyle
        ]
        
        if let textContainer = textView.textContainer {
            textContainer.widthTracksTextView = false
            textContainer.lineBreakMode = .byClipping
            textContainer.containerSize = NSSize(
                width: CGFloat.greatestFiniteMagnitude,
                height: CGFloat.greatestFiniteMagnitude
            )
            textContainer.lineFragmentPadding = 8.0
        }
        textView.isHorizontallyResizable = true
        textView.isVerticallyResizable = true
        textView.autoresizingMask = [.width, .height]
        textView.maxSize = NSSize(
            width: CGFloat.greatestFiniteMagnitude,
            height: .greatestFiniteMagnitude
        )
        textView.textContainerInset = NSSize(width: 8, height: 8)
        textView.menu = context.coordinator.customMenu
        
        let scrollView = NSScrollView()
        scrollView.documentView = textView
        scrollView.hasVerticalScroller = true
        scrollView.hasHorizontalScroller = true
        scrollView.drawsBackground = false
        scrollView.hasVerticalRuler = true
        scrollView.rulersVisible = true
        scrollView.verticalRulerView = IDELineNumberMargin(textView: textView)

        return scrollView
    }
    
    func updateNSView(_ scrollView: NSScrollView, context: Context) {
        guard let textView = scrollView.documentView as? IDETextView else { return }
        if textView.string != text {
            textView.string = text
        }
    }
    
    class Coordinator: NSObject, NSTextViewDelegate, NSMenuDelegate {
        var parent: IDEEditorView
        
        init(_ parent: IDEEditorView) {
            self.parent = parent
        }
        
        lazy var customMenu: NSMenu = {
            let menu = NSMenu()
            menu.delegate = self
            
            menu.addItem(withTitle: "Cut",   action: #selector(NSText.cut(_:)),   keyEquivalent: "")
            menu.addItem(withTitle: "Copy",  action: #selector(NSText.copy(_:)),  keyEquivalent: "")
            menu.addItem(withTitle: "Paste", action: #selector(NSText.paste(_:)), keyEquivalent: "")
            menu.addItem(.separator())
            menu.addItem(withTitle: "Undo",  action: #selector(UndoManager.undo), keyEquivalent: "")
            menu.addItem(withTitle: "Redo",  action: #selector(UndoManager.redo), keyEquivalent: "")
            
            return menu
        }()
        
        func textDidChange(_ notification: Notification) {
            guard let textView = notification.object as? NSTextView else { return }
            parent.text = textView.string
            textView.enclosingScrollView?.verticalRulerView?.needsDisplay = true
        }
        
        func menuWillOpen(_ menu: NSMenu) {
            removeServicesMenuItem(from: menu)
        }
        
        private func removeServicesMenuItem(from menu: NSMenu) {
            let itemsToRemove = menu.items.filter {
                $0.title == "Services" || $0.title == "Services…"
            }
            itemsToRemove.forEach { menu.removeItem($0) }
        }
    }
}

class IDETextView: NSTextView {
    override func menu(for event: NSEvent) -> NSMenu? {
        self.menu
    }
    
    override func validateMenuItem(_ menuItem: NSMenuItem) -> Bool {
        if menuItem.title == "Services" || menuItem.title == "Services…" {
            return false
        }
        return super.validateMenuItem(menuItem)
    }
}

class IDELineNumberMargin: NSRulerView {
    weak var textView: NSTextView?
    
    init(textView: NSTextView) {
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
        
        guard
            let tv = textView,
            let layoutManager = tv.layoutManager
        else { return }
        
        let fullGlyphRange = NSRange(location: 0, length: layoutManager.numberOfGlyphs)
        
        var lineIndex = 1
        layoutManager.enumerateLineFragments(forGlyphRange: fullGlyphRange) { (lineFragmentRect, _, _, _, _) in
            
            var rectInTextView = lineFragmentRect
            rectInTextView.origin.x += tv.textContainerOrigin.x
            rectInTextView.origin.y += tv.textContainerOrigin.y
            
            let rectInRuler = self.convert(rectInTextView, from: tv)
            self.drawLineNumber(lineIndex, at: rectInRuler)
            
            lineIndex += 1
        }
    }
    
    private func drawLineNumber(_ number: Int, at rect: NSRect) {
        let attrs: [NSAttributedString.Key: Any] = [
            .font: NSFont.systemFont(ofSize: 11, weight: .semibold),
            .foregroundColor: NSColor(hex: 0xFFFFFF)
        ]
        let str = NSAttributedString(string: "\(number)", attributes: attrs)
        let size = str.size()
        let xPos: CGFloat = 10
        let yPos = rect.minY + (rect.height - size.height) / 2.0
        
        str.draw(at: NSPoint(x: xPos, y: yPos))
    }
}
