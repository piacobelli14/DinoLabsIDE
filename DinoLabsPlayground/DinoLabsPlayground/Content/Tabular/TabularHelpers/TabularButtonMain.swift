//
//  TabularButtonMain.swift
//  Dino Labs Playground
//
//  Created by Peter Iacobelli on 2/26/25.
//

import SwiftUI
import AppKit

struct TabularButtonMain: NSViewRepresentable {
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
