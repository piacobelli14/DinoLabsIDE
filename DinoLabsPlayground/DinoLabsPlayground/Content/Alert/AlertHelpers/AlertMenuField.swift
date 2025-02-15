//
//  AlertMenuField.swift
//
//  Created by Peter Iacobelli on 2/14/25.
//

import SwiftUI
import AppKit

struct AlertMenuField: NSViewRepresentable {
    var items: [String]
    @Binding var selection: String
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    func makeNSView(context: Context) -> NSPopUpButton {
        let popUpButton = NSPopUpButton(frame: .zero, pullsDown: false)
        
        popUpButton.isBordered = false
        popUpButton.bezelStyle = .regularSquare
        popUpButton.focusRingType = .none
        popUpButton.appearance = NSAppearance(named: .darkAqua)
        popUpButton.menu?.appearance = NSAppearance(named: .darkAqua)
        popUpButton.removeAllItems()
        popUpButton.addItems(withTitles: items)
        
        if let index = items.firstIndex(of: selection) {
            popUpButton.selectItem(at: index)
        }
        
        popUpButton.target = context.coordinator
        popUpButton.action = #selector(Coordinator.selectionChanged(_:))
        popUpButton.addCursorRect(popUpButton.bounds, cursor: .pointingHand)
        
        return popUpButton
    }
    
    func updateNSView(_ nsView: NSPopUpButton, context: Context) {
        nsView.removeAllItems()
        nsView.addItems(withTitles: items)
        
        if let index = items.firstIndex(of: selection) {
            nsView.selectItem(at: index)
        }
        
        nsView.appearance = NSAppearance(named: .darkAqua)
        nsView.menu?.appearance = NSAppearance(named: .darkAqua)
        nsView.discardCursorRects()
        nsView.addCursorRect(nsView.bounds, cursor: .pointingHand)
    }
    
    class Coordinator: NSObject {
        var parent: AlertMenuField
        
        init(_ parent: AlertMenuField) {
            self.parent = parent
        }
        
        @objc func selectionChanged(_ sender: NSPopUpButton) {
            if let title = sender.titleOfSelectedItem {
                parent.selection = title
            }
        }
    }
    
    static func dismantleNSView(_ nsView: NSPopUpButton, coordinator: Coordinator) {
        nsView.target = nil
        nsView.action = nil
    }
}
