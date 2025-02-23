//
//  CodeTextField.swift
//
//  Created by Peter Iacobelli on 2/22/25.
//

import SwiftUI
import AppKit

struct CodeTextField: NSViewRepresentable {
    var placeholder: String
    @Binding var text: String
    var isSecure: Bool = false
    var onReturnKeyPressed: (() -> Void)? = nil
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    func makeNSView(context: Context) -> NSTextField {
        let textField: NSTextField
        
        if isSecure {
            let secureField = NSSecureTextField()
            secureField.isBordered = false
            secureField.drawsBackground = false
            secureField.backgroundColor = .clear
            secureField.focusRingType = .none
            secureField.isEditable = true
            secureField.isSelectable = true
            secureField.font = .systemFont(ofSize: 9, weight: .bold)
            secureField.textColor = .white
            textField = secureField
        } else {
            let normalField = CodeNSTextField()
            normalField.isBordered = false
            normalField.drawsBackground = false
            normalField.backgroundColor = .clear
            normalField.focusRingType = .none
            normalField.isEditable = true
            normalField.isSelectable = true
            normalField.font = .systemFont(ofSize: 9, weight: .bold)
            normalField.textColor = .white
            normalField.onReturnKeyPressed = {
                context.coordinator.parent.onReturnKeyPressed?()
            }
            textField = normalField
        }
        
        let placeholderColor = NSColor(srgbRed: 192/255, green: 192/255, blue: 192/255, alpha: 1)
        let placeholderAttributes: [NSAttributedString.Key: Any] = [
            .foregroundColor: placeholderColor,
            .font: NSFont.systemFont(ofSize: 9, weight: .bold)
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
        var parent: CodeTextField
        
        init(_ parent: CodeTextField) {
            self.parent = parent
        }
        
        func controlTextDidChange(_ notification: Notification) {
            if let textField = notification.object as? NSTextField {
                parent.text = textField.stringValue
            }
        }
        
        func control(_ control: NSControl, textView: NSTextView, doCommandBy commandSelector: Selector) -> Bool {
            if commandSelector == #selector(NSResponder.insertNewline(_:)) {
                parent.onReturnKeyPressed?()
                return true
            }
            return false
        }
    }
}

class CodeNSTextField: NSTextField {
    var onReturnKeyPressed: (() -> Void)? = nil
    
    override func keyDown(with event: NSEvent) {
        if event.keyCode == 36 {
            onReturnKeyPressed?()
        } else {
            super.keyDown(with: event)
        }
    }
}
