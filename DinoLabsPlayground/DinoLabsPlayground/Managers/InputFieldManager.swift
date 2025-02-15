//
//  InputFieldManager.swift
//
//  Created by Peter Iacobelli on 2/14/25.
//

import SwiftUI
import AppKit

class ClickableNSTextField: NSTextField {
    override func resetCursorRects() {
        self.discardCursorRects()
        self.addCursorRect(self.bounds, cursor: NSCursor.iBeam)
    }
    
    override func mouseDown(with event: NSEvent) {
        super.mouseDown(with: event)
        guard let window = self.window else { return }
        window.makeFirstResponder(self)
        
        if let fieldEditor = window.fieldEditor(true, for: self) as? NSTextView {
            fieldEditor.insertionPointColor = .lightGray
            let length = fieldEditor.string.count
            fieldEditor.selectedRange = NSRange(location: length, length: 0)
        }
    }
}

class ClickableNSSecureTextField: NSSecureTextField {
    override func resetCursorRects() {
        self.discardCursorRects()
        self.addCursorRect(self.bounds, cursor: NSCursor.iBeam)
    }
    
    override func mouseDown(with event: NSEvent) {
        super.mouseDown(with: event)
        guard let window = self.window else { return }
        window.makeFirstResponder(self)
        
        if let fieldEditor = window.fieldEditor(true, for: self) as? NSTextView {
            fieldEditor.insertionPointColor = .black
            let length = fieldEditor.string.count
            fieldEditor.selectedRange = NSRange(location: length, length: 0)
        }
    }
}

class KeyWindow: NSWindow {
    override var canBecomeKey: Bool {
        return true
    }
    override var canBecomeMain: Bool {
        return true
    }
}
