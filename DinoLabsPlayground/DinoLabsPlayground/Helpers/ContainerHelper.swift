//
//  ContainerHelper.swift
//
//  Created by Peter Iacobelli on 2/15/25.
//

import SwiftUI
import CoreGraphics
import AppKit

struct ContainerHelper: ViewModifier {
    let backgroundColor: Color
    let borderColor: Color
    let borderWidth: CGFloat
    let topLeft: CGFloat
    let topRight: CGFloat
    let bottomLeft: CGFloat
    let bottomRight: CGFloat
    let shadowColor: Color
    let shadowRadius: CGFloat
    let shadowX: CGFloat
    let shadowY: CGFloat

    func body(content: Content) -> some View {
        content
            .background(
                GeometryReader { geometry in
                    Path { path in
                        path.addRoundedRect(
                            in: geometry.frame(in: .local),
                            cornerSize: CGSize(width: 0, height: 0),
                            corners: [
                                .topLeft: topLeft,
                                .topRight: topRight,
                                .bottomLeft: bottomLeft,
                                .bottomRight: bottomRight
                            ]
                        )
                    }
                    .fill(backgroundColor)
                    .shadow(color: shadowColor, radius: shadowRadius, x: shadowX, y: shadowY)
                }
            )
            .overlay(
                GeometryReader { geometry in
                    Path { path in
                        path.addRoundedRect(
                            in: geometry.frame(in: .local),
                            cornerSize: CGSize(width: 0, height: 0),
                            corners: [
                                .topLeft: topLeft,
                                .topRight: topRight,
                                .bottomLeft: bottomLeft,
                                .bottomRight: bottomRight
                            ]
                        )
                    }
                    .stroke(borderColor, lineWidth: borderWidth)
                }
            )
    }
}

extension Path {
    mutating func addRoundedRect(in rect: CGRect, cornerSize: CGSize, corners: [RectCorner: CGFloat]) {
        let topLeft = corners[.topLeft] ?? cornerSize.width
        let topRight = corners[.topRight] ?? cornerSize.width
        let bottomLeft = corners[.bottomLeft] ?? cornerSize.width
        let bottomRight = corners[.bottomRight] ?? cornerSize.width
        
        let path = NSBezierPath()
        path.move(to: CGPoint(x: rect.minX + topLeft, y: rect.minY))
        path.line(to: CGPoint(x: rect.maxX - topRight, y: rect.minY))
        path.appendArc(withCenter: CGPoint(x: rect.maxX - topRight, y: rect.minY + topRight),
                      radius: topRight,
                      startAngle: 270,
                      endAngle: 0)
        path.line(to: CGPoint(x: rect.maxX, y: rect.maxY - bottomRight))
        path.appendArc(withCenter: CGPoint(x: rect.maxX - bottomRight, y: rect.maxY - bottomRight),
                      radius: bottomRight,
                      startAngle: 0,
                      endAngle: 90)
        path.line(to: CGPoint(x: rect.minX + bottomLeft, y: rect.maxY))
        path.appendArc(withCenter: CGPoint(x: rect.minX + bottomLeft, y: rect.maxY - bottomLeft),
                      radius: bottomLeft,
                      startAngle: 90,
                      endAngle: 180)
        path.line(to: CGPoint(x: rect.minX, y: rect.minY + topLeft))
        path.appendArc(withCenter: CGPoint(x: rect.minX + topLeft, y: rect.minY + topLeft),
                      radius: topLeft,
                      startAngle: 180,
                      endAngle: 270)
        path.close()
        
        let cgPath = CGMutablePath()
        var points = [CGPoint](repeating: .zero, count: 3)
        var didClosePath = true
        
        for i in 0..<path.elementCount {
            let type = path.element(at: i, associatedPoints: &points)
            
            switch type {
            case .moveTo:
                cgPath.move(to: points[0])
            case .lineTo:
                cgPath.addLine(to: points[0])
            case .curveTo:
                cgPath.addCurve(to: points[2], control1: points[0], control2: points[1])
            case .closePath:
                if !didClosePath {
                    cgPath.closeSubpath()
                }
            @unknown default:
                break
            }
        }
        
        self = Path(cgPath)
    }
}

enum RectCorner {
    case topLeft, topRight, bottomLeft, bottomRight
}

extension View {
    func containerHelper(
        backgroundColor: Color,
        borderColor: Color,
        borderWidth: CGFloat = 1,
        topLeft: CGFloat = 0,
        topRight: CGFloat = 0,
        bottomLeft: CGFloat = 0,
        bottomRight: CGFloat = 0,
        shadowColor: Color = .clear,
        shadowRadius: CGFloat = 0,
        shadowX: CGFloat = 0,
        shadowY: CGFloat = 0
    ) -> some View {
        self.modifier(ContainerHelper(
            backgroundColor: backgroundColor,
            borderColor: borderColor,
            borderWidth: borderWidth,
            topLeft: topLeft,
            topRight: topRight,
            bottomLeft: bottomLeft,
            bottomRight: bottomRight,
            shadowColor: shadowColor,
            shadowRadius: shadowRadius,
            shadowX: shadowX,
            shadowY: shadowY
        ))
    }
}

