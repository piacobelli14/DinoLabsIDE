//
//  ViewPortManager.swift
//  DinoLabsPlayground
//
//  Created by Peter Iacobelli on 2/13/25.
//

import SwiftUI

class AppDelegate: NSObject, NSApplicationDelegate, NSWindowDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        if let window = NSApplication.shared.windows.first {
            window.minSize = NSSize(width: 800, height: 600)
            window.maxSize = NSSize(width: 1800, height: 1600)
            window.delegate = self
        }
    }
    
    func windowWillResize(_ sender: NSWindow, to frameSize: NSSize) -> NSSize {
        var newSize = frameSize
        newSize.width = max(800, min(frameSize.width, 1600))
        newSize.height = max(600, min(frameSize.height, 600))
        return newSize
    }
}
