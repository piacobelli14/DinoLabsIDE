//
//  DinoLabsText.swift
//
//  Created by Peter Iacobelli on 3/3/25.
//

import SwiftUI

import SwiftUI

struct TextView: View {
    let fileURL: URL
    @Binding var fileContent: String
    @Binding var hasUnsavedChanges: Bool
    
    var body: some View {
        VStack {
            TextEditor(text: $fileContent)
                .font(.system(size: 12, design: .monospaced))
                .padding()
                .onChange(of: fileContent) { newValue in
                    hasUnsavedChanges = true
                }
            
            Button("Save") {
                saveFile()
            }
            .padding()
        }
    }
    
    private func saveFile() {
        do {
            try fileContent.write(to: fileURL, atomically: true, encoding: .utf8)
            hasUnsavedChanges = false
        } catch {
            return
        }
    }
}
