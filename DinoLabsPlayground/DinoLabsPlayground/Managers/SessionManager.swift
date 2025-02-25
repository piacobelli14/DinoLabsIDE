//
//  SessionManager.swift
//
//  Created by Peter Iacobelli on 2/24/25.
//

import SwiftUI
import AppKit

struct SessionData: Codable {
    var openTabs: [FileTab]
    var activeTabId: UUID?
    var directoryURL: URL?
    var displayedChildren: [FileItem]
}


class AppDelegate: NSObject, NSApplicationDelegate, NSWindowDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        if let window = NSApplication.shared.windows.first {
            window.setContentSize(NSSize(width: 1000, height: 700))
            window.minSize = NSSize(width: 800, height: 800)
            window.maxSize = NSSize(width: 1600, height: 1600)
            window.delegate = self
        }

        loadSessionData()
    }

    func windowWillResize(_ sender: NSWindow, to frameSize: NSSize) -> NSSize {
        var newSize = frameSize
        newSize.width = max(800, min(frameSize.width, 1600))
        newSize.height = max(600, min(frameSize.height, 1200))
        return newSize
    }

    func applicationWillTerminate(_ notification: Notification) {
        saveSessionData()
    }

    private func saveSessionData() {
        if let contentView = NSApplication.shared.windows.first?.contentView as? NSHostingView<ContentView> {
            let openTabs = contentView.rootView.openTabs
            let activeTabId = contentView.rootView.activeTabId
            let directoryURL = contentView.rootView.directoryURL
            let displayedChildren = contentView.rootView.displayedChildren

            let sessionData = SessionData(openTabs: openTabs, activeTabId: activeTabId, directoryURL: directoryURL, displayedChildren: displayedChildren)
            if let encodedData = try? JSONEncoder().encode(sessionData) {
                UserDefaults.standard.set(encodedData, forKey: "sessionData")
            }
        }
    }

    private func loadSessionData() {
        if let savedData = UserDefaults.standard.data(forKey: "sessionData"),
           let sessionData = try? JSONDecoder().decode(SessionData.self, from: savedData),
           let contentView = NSApplication.shared.windows.first?.contentView as? NSHostingView<ContentView> {
            contentView.rootView.openTabs = sessionData.openTabs
            contentView.rootView.activeTabId = sessionData.activeTabId
            contentView.rootView.directoryURL = sessionData.directoryURL
            contentView.rootView.displayedChildren = sessionData.displayedChildren

        }
    }

}
