//
//  HoverHelper.swift
//  DinoLabsPlayground
//
//  Created by Peter Iacobelli on 2/13/25.
//

import SwiftUI

struct HoverEffectModifier: ViewModifier {
    let hoverBackground: Color?
    let hoverForeground: Color?
    let hoverOpacity: Double?
    let scaleFactor: CGFloat?
    
    @State private var isHovered: Bool = false
    
    func body(content: Content) -> some View {
        content
            .onHover { hovering in
                withAnimation(.easeInOut(duration: 0.2)) {
                    isHovered = hovering
                }
            }
            .background(isHovered ? (hoverBackground ?? Color.clear) : Color.clear)
            .foregroundColor(isHovered ? (hoverForeground ?? Color.primary) : Color.primary)
            .opacity(isHovered ? (hoverOpacity ?? 1.0) : 1.0)
            .scaleEffect(isHovered ? (scaleFactor ?? 1.0) : 1.0)
    }
}

extension View {
    func hoverEffect(
        backgroundColor: Color? = nil,
        foregroundColor: Color? = nil,
        opacity: Double? = nil,
        scale: CGFloat? = nil
    ) -> some View {
        self.modifier(
            HoverEffectModifier(
                hoverBackground: backgroundColor,
                hoverForeground: foregroundColor,
                hoverOpacity: opacity,
                scaleFactor: scale
            )
        )
    }
}
