//
//  ToggleHelper.swift
//
//  Created by Peter Iacobelli on 2/20/25.
//

import SwiftUI

struct ToggleSwitch: ToggleStyle {
    var toggleWidth: CGFloat
    var toggleHeight: CGFloat
    var circleSize: CGFloat
    var textSpacing: CGFloat
    var activeColor: Color
    var inactiveColor: Color
    var thumbColor: Color
    var textColor: Color
    var fontSize: CGFloat
    var fontWeight: Font.Weight
    var activeText: String
    var inactiveText: String
    var showText: Bool
    var animationDuration: Double
    var animationDamping: Double
    
    init(
        toggleWidth: CGFloat = 50,
        toggleHeight: CGFloat = 24,
        circleSize: CGFloat = 20,
        textSpacing: CGFloat = 8,
        activeColor: Color = .purple,
        inactiveColor: Color = Color(white: 0.3),
        thumbColor: Color = .white,
        textColor: Color = .white,
        fontSize: CGFloat = 14,
        fontWeight: Font.Weight = .medium,
        activeText: String = "Yes",
        inactiveText: String = "No",
        showText: Bool = true,
        animationDuration: Double = 0.2,
        animationDamping: Double = 0.7
    ) {
        self.toggleWidth = toggleWidth
        self.toggleHeight = toggleHeight
        self.circleSize = circleSize
        self.textSpacing = textSpacing
        self.activeColor = activeColor
        self.inactiveColor = inactiveColor
        self.thumbColor = thumbColor
        self.textColor = textColor
        self.fontSize = fontSize
        self.fontWeight = fontWeight
        self.activeText = activeText
        self.inactiveText = inactiveText
        self.showText = showText
        self.animationDuration = animationDuration
        self.animationDamping = animationDamping
    }
    
    func makeBody(configuration: Configuration) -> some View {
        HStack(spacing: textSpacing) {
            ZStack {
                Capsule()
                    .fill(configuration.$isOn.wrappedValue ? activeColor : inactiveColor)
                    .frame(width: toggleWidth, height: toggleHeight)
                
                HStack {
                    if configuration.$isOn.wrappedValue {
                        Circle()
                            .fill(thumbColor)
                            .frame(width: circleSize, height: circleSize)
                        Spacer()
                    } else {
                        Spacer()
                        Circle()
                            .fill(thumbColor)
                            .frame(width: circleSize, height: circleSize)
                    }
                }
                .frame(width: toggleWidth, height: toggleHeight)
            }
            .hoverEffect(opacity: 0.6, cursor: .pointingHand)
            
            if showText {
                ZStack {
                    Text(activeText)
                        .foregroundColor(textColor)
                        .font(.system(size: fontSize, weight: fontWeight))
                        .opacity(configuration.$isOn.wrappedValue ? 1 : 0)
                    
                    Text(inactiveText)
                        .foregroundColor(textColor)
                        .font(.system(size: fontSize, weight: fontWeight))
                        .opacity(configuration.$isOn.wrappedValue ? 0 : 1)
                }
                .animation(.none, value: configuration.$isOn.wrappedValue)
            }
        }
        .onTapGesture {
            withAnimation(.spring(response: animationDuration, dampingFraction: animationDamping)) {
                configuration.$isOn.wrappedValue.toggle()
            }
        }
    }
}
