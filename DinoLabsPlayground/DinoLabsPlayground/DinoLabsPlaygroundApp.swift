//
//  DinoLabsPlaygroundApp.swift
//
//  Created by Peter Iacobelli on 2/12/25.
//

import SwiftUI

@main
struct DinoLabsPlaygroundApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
