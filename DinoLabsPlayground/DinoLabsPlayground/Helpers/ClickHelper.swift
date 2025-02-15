//
//  ClickHelper.swift
//
//  Created by Peter Iacobelli on 2/13/25.
//

import SwiftUI

struct ClickHelper: ViewModifier {
    let clickBackground: Color?
    let clickForeground: Color?
    let clickOpacity: Double?
    let scaleFactor: CGFloat?
    
    @State private var isClicked: Bool = false
    
    func body(content: Content) -> some View {
        content
            .simultaneousGesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { _ in
                        withAnimation(.easeInOut(duration: 0.1)) {
                            isClicked = true
                        }
                    }
                    .onEnded { _ in
                        withAnimation(.easeInOut(duration: 0.1)) {
                            isClicked = false
                        }
                    }
            )
            .background(isClicked ? (clickBackground ?? Color.clear) : Color.clear)
            .foregroundColor(isClicked ? (clickForeground ?? Color.primary) : Color.primary)
            .opacity(isClicked ? (clickOpacity ?? 1.0) : 1.0)
            .scaleEffect(isClicked ? (scaleFactor ?? 1.0) : 1.0)
    }
}

extension View {
    func clickEffect(
        backgroundColor: Color? = nil,
        foregroundColor: Color? = nil,
        opacity: Double? = nil,
        scale: CGFloat? = nil
    ) -> some View {
        self.modifier(
            ClickHelper(
                clickBackground: backgroundColor,
                clickForeground: foregroundColor,
                clickOpacity: opacity,
                scaleFactor: scale
            )
        )
    }
}
