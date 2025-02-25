//
//  DinoLabsPlaygroundApp.swift
//
//  Created by Peter Iacobelli on 2/12/25.
//

import SwiftUI

@main
struct DinoLabsPlaygroundApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    @State private var openTabs: [FileTab] = []
    @State private var activeTabId: UUID?
    @State private var directoryURL: URL?
    @State private var displayedChildren: [FileItem] = [] 

    var body: some Scene {
        WindowGroup {
            ContentView(openTabs: $openTabs,
                        activeTabId: $activeTabId,
                        directoryURL: $directoryURL,
                        displayedChildren: $displayedChildren)
        }
    }
}

