//
//  HoverHelper.swift
//
//  Created by Peter Iacobelli on 2/13/25.
//

import SwiftUI

struct HoverEffectModifier: ViewModifier {
    let hoverBackground: Color?
    let hoverForeground: Color?
    let hoverOpacity: Double?
    let scaleFactor: CGFloat?
    let cursor: NSCursor?
    
    @State private var isHovered: Bool = false
    
    func body(content: Content) -> some View {
        content
            .background(isHovered ? (hoverBackground ?? Color.clear) : Color.clear)
            .overlay(
                GeometryReader { proxy in
                    if let cursor = cursor {
                        Color.clear
                            .frame(width: proxy.size.width, height: proxy.size.height)
                            .overlay(
                                CursorAreaRepresentable(cursor: cursor)
                            )
                    }
                }
            )
            .onHover { hovering in
                withAnimation(.easeInOut(duration: 0.2)) {
                    isHovered = hovering
                }
            }
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
        scale: CGFloat? = nil,
        cursor: NSCursor? = nil
    ) -> some View {
        self.modifier(
            HoverEffectModifier(
                hoverBackground: backgroundColor,
                hoverForeground: foregroundColor,
                hoverOpacity: opacity,
                scaleFactor: scale,
                cursor: cursor
            )
        )
    }
}
