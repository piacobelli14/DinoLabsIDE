//
//  AuthenticationButtonMain.swift
//  DinoLabsPlayground
//
//  Created by Peter Iacobelli on 2/13/25.
//

import SwiftUI
import AppKit

class PlainNSButton: NSButton {
    override init(frame frameRect: NSRect) {
        super.init(frame: frameRect)
        isBordered = false
        bezelStyle = .regularSquare
        setButtonType(.momentaryChange)
        wantsLayer = true
        title = ""
        layer?.backgroundColor = NSColor.clear.cgColor
        focusRingType = .none
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func highlight(_ flag: Bool) { }
    
    override func resetCursorRects() {
        discardCursorRects()
        addCursorRect(self.bounds, cursor: NSCursor.pointingHand)
    }
}

struct AuthenticationButtonMain: NSViewRepresentable {
    let action: () -> Void

    func makeCoordinator() -> Coordinator {
        Coordinator(action: action)
    }

    func makeNSView(context: Context) -> PlainNSButton {
        let button = PlainNSButton()
        button.target = context.coordinator
        button.action = #selector(Coordinator.buttonAction)
        
        return button
    }

    func updateNSView(_ nsView: PlainNSButton, context: Context) {
    }

    class Coordinator: NSObject {
        let action: () -> Void
        init(action: @escaping () -> Void) {
            self.action = action
        }
        @objc func buttonAction() {
            action()
        }
    }
}
