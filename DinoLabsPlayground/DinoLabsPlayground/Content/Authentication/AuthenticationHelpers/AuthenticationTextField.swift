//
//  AuthenticationTextField.swift
//  DinoLabsPlayground
//
//  Created by Peter Iacobelli on 2/13/25.
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
            fieldEditor.insertionPointColor = .black
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

struct AuthenticationTextField: NSViewRepresentable {
    var placeholder: String
    @Binding var text: String
    var isSecure: Bool = false
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    func makeNSView(context: Context) -> NSTextField {
        let textField: NSTextField
        
        if isSecure {
            let secureField = ClickableNSSecureTextField()
            secureField.isBordered = false
            secureField.drawsBackground = false
            secureField.backgroundColor = .clear
            secureField.focusRingType = .none
            secureField.isEditable = true
            secureField.isSelectable = true
            secureField.font = .systemFont(ofSize: 12)
            secureField.textColor = .black
            textField = secureField
        } else {
            let normalField = ClickableNSTextField()
            normalField.isBordered = false
            normalField.drawsBackground = false
            normalField.backgroundColor = .clear
            normalField.focusRingType = .none
            normalField.isEditable = true
            normalField.isSelectable = true
            normalField.font = .systemFont(ofSize: 12)
            normalField.textColor = .black
            textField = normalField
        }
        
        let placeholderColor = NSColor(srgbRed: 192/255, green: 192/255, blue: 192/255, alpha: 1)
        let placeholderAttributes: [NSAttributedString.Key: Any] = [
            .foregroundColor: placeholderColor,
            .font: NSFont.systemFont(ofSize: 12)
        ]
        textField.placeholderAttributedString = NSAttributedString(
            string: placeholder,
            attributes: placeholderAttributes
        )
        
        textField.delegate = context.coordinator
        
        return textField
    }
    
    func updateNSView(_ nsView: NSTextField, context: Context) {
        if nsView.stringValue != text {
            nsView.stringValue = text
        }
    }
    
    class Coordinator: NSObject, NSTextFieldDelegate {
        var parent: AuthenticationTextField
        
        init(_ parent: AuthenticationTextField) {
            self.parent = parent
        }
        
        func controlTextDidChange(_ notification: Notification) {
            if let textField = notification.object as? NSTextField {
                parent.text = textField.stringValue
            }
        }
    }
}
