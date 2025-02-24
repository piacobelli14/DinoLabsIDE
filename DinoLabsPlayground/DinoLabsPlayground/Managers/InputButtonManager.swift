//
//  InputButtonManager.swift
//
//  Created by Peter Iacobelli on 2/14/25.
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
        
        let trackingArea = NSTrackingArea(
            rect: bounds,
            options: [.mouseEnteredAndExited, .activeAlways, .inVisibleRect],
            owner: self,
            userInfo: nil
        )
        addTrackingArea(trackingArea)
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func highlight(_ flag: Bool) { }
    
    override func resetCursorRects() {
        discardCursorRects()
        addCursorRect(bounds, cursor: NSCursor.pointingHand)
    }
    
    override func mouseEntered(with event: NSEvent) {
        NSCursor.pointingHand.push()
    }
    
    override func mouseExited(with event: NSEvent) {
        NSCursor.pop()
    }
    
    override func setFrameSize(_ newSize: NSSize) {
        super.setFrameSize(newSize)
        updateTrackingAreas()
    }
    
    override func updateTrackingAreas() {
        trackingAreas.forEach { removeTrackingArea($0) }
        let trackingArea = NSTrackingArea(
            rect: bounds,
            options: [.mouseEnteredAndExited, .activeAlways, .inVisibleRect],
            owner: self,
            userInfo: nil
        )
        addTrackingArea(trackingArea)
    }
}
