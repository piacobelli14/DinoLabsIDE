//
//  DinoLabsPlayground.swift
//
//  Created by Peter Iacobelli on 2/12/25.
//

import SwiftUI
import AppKit

struct DinoLabsPlayground: View {
    @Binding var currentView: AppView
    @State private var directoryURL: URL? = nil
    @State private var fileURL: URL? = nil
    @State private var showAlert: Bool = false
    @State private var alertTitle: String = ""
    @State private var alertMessage: String = ""
    @State private var alertInputs: [DinoLabsAlertInput] = []
    @State private var showCancelButton: Bool = false

    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .top) {
                VStack(spacing: 0) {
                    Spacer().frame(height: 50)
                    HStack(spacing: 0) {
                        VStack(spacing: 10) {
                            Button("Load Directory") { loadDirectory() }
                            Button("Load File") { loadFile() }
                        }
                        Divider()
                        VStack(spacing: 10) {
                            if let directoryURL = directoryURL {
                                Text("Directory selected: \(directoryURL.path)")
                            } else {
                                Text("No directory selected")
                            }
                            if let fileURL = fileURL {
                                Text("File selected: \(fileURL.lastPathComponent)")
                            } else {
                                Text("No file selected")
                            }
                            Button("Show Alert Modal") {
                                alertTitle = "Alert Title"
                                alertMessage = "Directory or File loaded. Now showing alert."
                                alertInputs = [DinoLabsAlertInput(name: "Username", type: "text", defaultValue: "")]
                                showCancelButton = true
                                showAlert = true
                            }
                        }
                        .frame(maxWidth: .infinity)
                    }
                    Spacer()
                }
                
                NavigationBar(geometry: geometry, currentView: $currentView)
                
                DinoLabsAlert(geometry: geometry, visible: showAlert, title: alertTitle, message: alertMessage, inputs: alertInputs, showCancel: showCancelButton, onConfirm: { result in
                    showAlert = false
                    if let result = result {
                        print("User input: \(result)")
                    } else {
                        print("User confirmed with no input.")
                    }
                }, onCancel: {
                    showAlert = false
                    print("User cancelled.")
                })
            }
        }
    }

    func loadDirectory() {
        let panel = NSOpenPanel()
        panel.canChooseFiles = false
        panel.canChooseDirectories = true
        panel.allowsMultipleSelection = false
        if panel.runModal() == .OK {
            directoryURL = panel.urls.first
        }
    }

    func loadFile() {
        let panel = NSOpenPanel()
        panel.canChooseFiles = true
        panel.canChooseDirectories = false
        panel.allowsMultipleSelection = false
        if panel.runModal() == .OK {
            fileURL = panel.urls.first
        }
    }
}
