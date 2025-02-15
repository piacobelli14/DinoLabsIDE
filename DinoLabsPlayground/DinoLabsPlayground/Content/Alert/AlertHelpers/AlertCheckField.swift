//
//  AlertCheckField.swift
//
//  Created by Peter Iacobelli on 2/14/25.
//

import SwiftUI
import AppKit

struct AlertCheckField: NSViewRepresentable {
    var label: String
    @Binding var isChecked: Bool
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    func makeNSView(context: Context) -> NSButton {
        let checkbox = NSButton(checkboxWithTitle: label, target: nil, action: nil)
        checkbox.state = isChecked ? .on : .off
        checkbox.title = label
        checkbox.setButtonType(.switch)
        checkbox.action = #selector(Coordinator.toggleCheck(_:))
        checkbox.target = context.coordinator
        checkbox.alignment = .left
        checkbox.imagePosition = .imageLeft
        checkbox.addCursorRect(checkbox.bounds, cursor: .pointingHand)
        
        return checkbox
    }

    func updateNSView(_ nsView: NSButton, context: Context) {
        nsView.state = isChecked ? .on : .off
        nsView.title = label
        nsView.alignment = .left
        nsView.imagePosition = .imageLeft
        nsView.discardCursorRects()
        nsView.addCursorRect(nsView.bounds, cursor: .pointingHand)
    }
    
    class Coordinator: NSObject {
        var parent: AlertCheckField
        
        init(_ parent: AlertCheckField) {
            self.parent = parent
        }
        
        @objc func toggleCheck(_ sender: NSButton) {
            parent.isChecked = (sender.state == .on)
        }
    }
    
    static func dismantleNSView(_ nsView: NSButton, coordinator: Coordinator) {
        nsView.target = nil
        nsView.action = nil
    }
}

extension AlertCheckField {
    func makeBinding() -> Binding<Bool> {
        Binding<Bool>(
            get: { self.isChecked },
            set: { newValue in
                self.isChecked = newValue
            }
        )
    }
}
