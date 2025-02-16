//
//  CursorHelper.swift
//
//  Created by Peter Iacobelli on 2/15/25.
//

import SwiftUI

class CursorView: NSView {
    var cursor: NSCursor?
    
    override func resetCursorRects() {
        if let cursor = cursor {
            addCursorRect(bounds, cursor: cursor)
        }
    }
}

struct CursorAreaRepresentable: NSViewRepresentable {
    let cursor: NSCursor
    
    func makeNSView(context: Context) -> CursorView {
        let view = CursorView()
        view.cursor = cursor
        return view
    }
    
    func updateNSView(_ nsView: CursorView, context: Context) {
        nsView.cursor = cursor
        nsView.resetCursorRects()
    }
}


