//
//  TabHelper.swift
//  Dino Labs Playground
//
//  Created by Peter Iacobelli on 2/18/25.
//

import Foundation
import SwiftUI

struct TabDropDelegate: DropDelegate {
    let item: DinoLabsPlayground.IDEFileTab
    @Binding var currentTabs: [DinoLabsPlayground.IDEFileTab]
    @Binding var draggingTab: DinoLabsPlayground.IDEFileTab?
    
    func dropEntered(info: DropInfo) {
        guard let dragging = draggingTab,
              dragging != item,
              let fromIndex = currentTabs.firstIndex(of: dragging),
              let toIndex = currentTabs.firstIndex(of: item) else { return }
        if currentTabs[toIndex] != dragging {
            withAnimation {
                currentTabs.move(fromOffsets: IndexSet(integer: fromIndex),
                                  toOffset: toIndex > fromIndex ? toIndex + 1 : toIndex)
            }
        }
    }
    
    func performDrop(info: DropInfo) -> Bool {
        draggingTab = nil
        return true
    }
    
    func dropUpdated(info: DropInfo) -> DropProposal? {
        return DropProposal(operation: .move)
    }
}
