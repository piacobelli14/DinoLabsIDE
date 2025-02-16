import SwiftUI

struct ClickHelper: ViewModifier {
    let clickBackground: Color?
    let clickForeground: Color?
    let clickOpacity: Double?
    let scaleFactor: CGFloat?
    let cursor: NSCursor?
    
    @State private var isClicked: Bool = false
    
    func body(content: Content) -> some View {
        content
            .background(isClicked ? (clickBackground ?? Color.clear) : Color.clear)
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
        scale: CGFloat? = nil,
        cursor: NSCursor? = nil
    ) -> some View {
        self.modifier(
            ClickHelper(
                clickBackground: backgroundColor,
                clickForeground: foregroundColor,
                clickOpacity: opacity,
                scaleFactor: scale,
                cursor: cursor
            )
        )
    }
}
