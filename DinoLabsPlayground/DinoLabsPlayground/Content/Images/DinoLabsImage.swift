//
//  DinoLabsImage.swift
//
//  Created by Peter Iacobelli on 3/4/25.
//

import SwiftUI

struct ImageView: View {
    let geometry: GeometryProxy
    let fileURL: URL
    @Binding var hasUnsavedChanges: Bool
    @Binding var leftPanelWidthRatio: CGFloat

    var body: some View {
        VStack {
            if let image = NSImage(contentsOf: fileURL) {
                Image(nsImage: image)
                    .resizable()
                    .scaledToFit()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                Text("Unable to load image")
                    .foregroundColor(.white)
                    .font(.system(size: 14, weight: .semibold))
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(hex: 0x242424))
    }
}
