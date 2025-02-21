//
//  LineHelper.swift
//
//  Created by Peter Iacobelli on 2/12/25.
//

import SwiftUI
import Combine

struct LineChartDataPoint: Identifiable, Equatable {
    var id: String { "\(date.timeIntervalSince1970)-\(value)" }
    let date: Date
    let value: Double
}

struct LineChartView: View {
    let series1Name: String
    @Binding var series1Data: [LineChartDataPoint]
    let series2Name: String?
    @Binding var series2Data: [LineChartDataPoint]?
    let showGrid: Bool
    private let series1Color = Color(hex: 0x9b59b6)
    private let series2Color = Color(hex: 0x3498db)
    private let axisColor = Color.white.opacity(0.2)
    private let horizontalPadding: CGFloat = 15
    private let verticalPadding: CGFloat = 25
    private let lineWidth: CGFloat = 3
    private let symbolSize: CGFloat = 8
    private let gridLineWidth: CGFloat = 1.5
    private let axisFontSize: CGFloat = 12
    @State private var combinedHoverData: (date: Date, series1Value: Double, series2Value: Double?, index: Int, availableCount: Int)? = nil
    @State private var hoverLocation: CGPoint = .zero
    @State private var updateID = UUID()
    
    var body: some View {
        GeometryReader { geo in
            ZStack {
                chartContent(geo: geo)
                
                if let hd = combinedHoverData {
                    let availableWidth = geo.size.width - horizontalPadding * 2
                    let step = hd.availableCount > 1 ? availableWidth / CGFloat(hd.availableCount - 1) : 0
                    let xPos = horizontalPadding + CGFloat(hd.index) * step
                    let availableHeight = geo.size.height - verticalPadding * 2
                    let allValues1 = series1Data.map { $0.value }
                    let minValue1 = allValues1.min() ?? 0
                    let maxValue1 = allValues1.max() ?? 1
                    let range1 = (maxValue1 - minValue1 == 0) ? 1 : maxValue1 - minValue1
                    let yPos1 = computeYPosition(for: hd.series1Value,
                                                 availableHeight: availableHeight,
                                                 verticalPadding: verticalPadding,
                                                 minValue: minValue1,
                                                 valueRange: range1)
                    
                    let yPos2: CGFloat? = {
                        if let s2Val = hd.series2Value,
                           let s2Data = series2Data, !s2Data.isEmpty {
                            let allValues2 = s2Data.map { $0.value }
                            let minValue2 = allValues2.min() ?? 0
                            let maxValue2 = allValues2.max() ?? 1
                            let range2 = (maxValue2 - minValue2 == 0) ? 1 : maxValue2 - minValue2
                            return computeYPosition(for: s2Val,
                                                    availableHeight: availableHeight,
                                                    verticalPadding: verticalPadding,
                                                    minValue: minValue2,
                                                    valueRange: range2)
                        }
                        return nil
                    }()
                    
                    Circle()
                        .fill(series1Color)
                        .frame(width: symbolSize * 1.2, height: symbolSize * 1.2)
                        .position(x: xPos, y: yPos1)
                    
                    if let y2 = yPos2 {
                        Circle()
                            .fill(series2Color)
                            .frame(width: symbolSize * 1.2, height: symbolSize * 1.2)
                            .position(x: xPos, y: y2)
                    }
                    
                    let topY = yPos2 != nil ? min(yPos1, yPos2!) : yPos1
                    let tooltipY = topY + 60
                    let tooltipX = xPos - 80
                    
                    LineTooltipWrapper(
                        content: LineTooltipView(date: hd.date,
                                                 series1Name: series1Name,
                                                 series1Value: hd.series1Value,
                                                 series2Name: series2Name,
                                                 series2Value: hd.series2Value),
                        containerSize: geo.size,
                        proposedPosition: CGPoint(x: tooltipX, y: tooltipY)
                    )
                    .transition(.opacity)
                }
            }
            .background(
                MouseTrackingView { location in
                    hoverLocation = location
                    let candidate1 = nearestDataPoint(to: location,
                                                      in: geo.size,
                                                      horizontalPadding: horizontalPadding,
                                                      data: series1Data)
                    var candidate2: (point: LineChartDataPoint, index: Int)? = nil
                    if let s2Data = series2Data {
                        candidate2 = nearestDataPoint(to: location,
                                                      in: geo.size,
                                                      horizontalPadding: horizontalPadding,
                                                      data: s2Data)
                    }
                    if let c1 = candidate1 {
                        if let c2 = candidate2, abs(c1.index - c2.index) <= 1 {
                            combinedHoverData = (date: c1.point.date,
                                                 series1Value: c1.point.value,
                                                 series2Value: c2.point.value,
                                                 index: c1.index,
                                                 availableCount: series1Data.count)
                        } else {
                            combinedHoverData = (date: c1.point.date,
                                                 series1Value: c1.point.value,
                                                 series2Value: nil,
                                                 index: c1.index,
                                                 availableCount: series1Data.count)
                        }
                    } else if let c2 = candidate2 {
                        combinedHoverData = (date: c2.point.date,
                                             series1Value: 0,
                                             series2Value: c2.point.value,
                                             index: c2.index,
                                             availableCount: (series2Data?.count ?? 0))
                    } else {
                        combinedHoverData = nil
                    }
                }
            )
            .cursorOnHover(hovered: combinedHoverData != nil)
            .onHover { hovering in
                if !hovering {
                    combinedHoverData = nil
                }
            }
        }
        .padding(.horizontal, horizontalPadding)
        .padding(.vertical, verticalPadding)
        .id(updateID)
        .onChange(of: series1Data) { _ in
            updateID = UUID()
        }
    }
    
    private func chartContent(geo: GeometryProxy) -> some View {
        let availableWidth = geo.size.width - horizontalPadding * 2
        let labelData = !series1Data.isEmpty ? series1Data : (series2Data ?? [])
        let formatter = DateFormatter()
        formatter.dateFormat = "M-d"
        let xLabels = labelData.map { formatter.string(from: $0.date) }
        let count = xLabels.count
        let xPositions: [CGFloat] = (0..<count).map { i in
            horizontalPadding + (CGFloat(i) / CGFloat(max(count - 1, 1))) * availableWidth
        }
        let minLabelSpacing: CGFloat = 50
        var displayedIndices: [Int] = []
        if count > 0 { displayedIndices.append(0) }
        if count > 1 {
            for i in 1..<(count - 1) {
                if let last = displayedIndices.last,
                   (xPositions[i] - xPositions[last] >= minLabelSpacing) &&
                   (xPositions[count - 1] - xPositions[i] >= minLabelSpacing) {
                    displayedIndices.append(i)
                }
            }
        }
        if count > 1, displayedIndices.last != count - 1 {
            displayedIndices.append(count - 1)
        }
        
        return ZStack {
            GridBackgroundView(gridLineWidth: gridLineWidth,
                               axisColor: axisColor,
                               showGrid: showGrid,
                               horizontalPadding: horizontalPadding)
            
            Path { path in
                let baseline = geo.size.height - verticalPadding
                path.move(to: CGPoint(x: horizontalPadding, y: baseline))
                path.addLine(to: CGPoint(x: geo.size.width - horizontalPadding, y: baseline))
            }
            .stroke(axisColor, style: StrokeStyle(lineWidth: gridLineWidth))
            
            if series1Data.count > 1 {
                LineAndAreaView(data: series1Data,
                                lineColor: series1Color,
                                lineWidth: lineWidth,
                                symbolSize: symbolSize,
                                verticalPadding: verticalPadding,
                                horizontalPadding: horizontalPadding)
            }
            
            if let s2Data = series2Data, s2Data.count > 1 {
                LineAndAreaView(data: s2Data,
                                lineColor: series2Color,
                                lineWidth: lineWidth,
                                symbolSize: symbolSize,
                                verticalPadding: verticalPadding,
                                horizontalPadding: horizontalPadding)
            }
            
            ForEach(displayedIndices, id: \.self) { i in
                Text(xLabels[i])
                    .font(.system(size: axisFontSize, weight: .bold))
                    .foregroundColor(Color.white.opacity(0.7))
                    .position(x: xPositions[i],
                              y: geo.size.height - verticalPadding / 2)
            }
        }
    }
    
    private func nearestDataPoint(to location: CGPoint,
                                  in size: CGSize,
                                  horizontalPadding: CGFloat,
                                  data: [LineChartDataPoint]) -> (point: LineChartDataPoint, index: Int)? {
        guard data.count > 1 else { return nil }
        let availableWidth = size.width - horizontalPadding * 2
        let step = availableWidth / CGFloat(data.count - 1)
        let xs = (0..<data.count).map { horizontalPadding + CGFloat($0) * step }
        if let (idx, _) = xs.enumerated().min(by: { abs($0.element - location.x) < abs($1.element - location.x) }) {
            return (data[idx], idx)
        }
        return nil
    }
}

struct LineAndAreaView: View {
    let data: [LineChartDataPoint]
    let lineColor: Color
    let lineWidth: CGFloat
    let symbolSize: CGFloat
    let verticalPadding: CGFloat
    let horizontalPadding: CGFloat
    
    var body: some View {
        chartContent()
    }
    
    private func chartContent() -> some View {
        GeometryReader { geo in
            let availableWidth = geo.size.width - horizontalPadding * 2
            let availableHeight = geo.size.height - verticalPadding * 2
            let count = data.count
            let xStep = count > 1 ? availableWidth / CGFloat(count - 1) : 0
            let allValues = data.map { $0.value }
            let minValue = allValues.min() ?? 0
            let maxValue = allValues.max() ?? 1
            let valueRange = (maxValue - minValue == 0) ? 1 : maxValue - minValue
            let baseline = geo.size.height - verticalPadding
            
            let points: [CGPoint] = (0..<count).map { i in
                let x = horizontalPadding + CGFloat(i) * xStep
                let computedY = computeYPosition(for: data[i].value,
                                                 availableHeight: availableHeight,
                                                 verticalPadding: verticalPadding,
                                                 minValue: minValue,
                                                 valueRange: valueRange)
                let y = min(computedY, baseline)
                return CGPoint(x: x, y: y)
            }
            
            ZStack {
                Path { path in
                    guard !points.isEmpty else { return }
                    path.move(to: CGPoint(x: points[0].x, y: baseline))
                    for point in points {
                        path.addLine(to: point)
                    }
                    path.addLine(to: CGPoint(x: points[points.count - 1].x, y: baseline))
                    path.closeSubpath()
                }
                .fill(lineColor.opacity(0.3))
                
                Group {
                    let drawnPath = smoothedPath(for: points, alpha: 0.5)
                    let hitTestCGPath = drawnPath.cgPath.copy(
                        strokingWithWidth: lineWidth + 10,
                        lineCap: .round,
                        lineJoin: .round,
                        miterLimit: 10
                    )
                    let hitTestPath = Path(hitTestCGPath)
                    
                    drawnPath
                        .stroke(lineColor, style: StrokeStyle(lineWidth: lineWidth, lineJoin: .round))
                        .contentShape(hitTestPath)
                }
            }
        }
    }
}

private func smoothedPath(for points: [CGPoint], alpha: CGFloat = 0.5) -> Path {
    var path = Path()
    guard points.count >= 2 else { return path }
    path.move(to: points[0])
    for i in 0..<points.count - 1 {
        let p0 = i == 0 ? points[i] : points[i-1]
        let p1 = points[i]
        let p2 = points[i+1]
        let p3 = i+2 < points.count ? points[i+2] : p2
        let d1 = distance(p0, p1)
        let d2 = distance(p1, p2)
        let d3 = distance(p2, p3)
        let b1 = (d1 + d2) != 0 ? (d2 / (d1 + d2)) : 0
        let b2 = (d2 + d3) != 0 ? (d2 / (d2 + d3)) : 0
        let cp1 = CGPoint(
            x: p1.x + alpha * (p2.x - p0.x) * b1,
            y: p1.y + alpha * (p2.y - p0.y) * b1)
        let cp2 = CGPoint(
            x: p2.x - alpha * (p3.x - p1.x) * b2,
            y: p2.y - alpha * (p3.y - p1.y) * b2)
        path.addCurve(to: p2, control1: cp1, control2: cp2)
    }
    return path
}

private func distance(_ a: CGPoint, _ b: CGPoint) -> CGFloat {
    sqrt(pow(a.x - b.x, 2) + pow(a.y - b.y, 2))
}

private func computeYPosition(for value: Double,
                              availableHeight: CGFloat,
                              verticalPadding: CGFloat,
                              minValue: Double,
                              valueRange: Double) -> CGFloat {
    availableHeight * (1 - CGFloat((value - minValue) / valueRange)) + verticalPadding
}

struct GridBackgroundView: View {
    let gridLineWidth: CGFloat
    let axisColor: Color
    let showGrid: Bool
    let horizontalPadding: CGFloat

    var body: some View {
        Group {
            if showGrid {
                GeometryReader { geo in
                    Path { path in
                        let startX = horizontalPadding
                        let endX = geo.size.width - horizontalPadding
                        let y1 = geo.size.height * 0.25
                        let y2 = geo.size.height * 0.5
                        let y3 = geo.size.height * 0.75
                        
                        path.move(to: CGPoint(x: startX, y: y1))
                        path.addLine(to: CGPoint(x: endX, y: y1))
                        
                        path.move(to: CGPoint(x: startX, y: y2))
                        path.addLine(to: CGPoint(x: endX, y: y2))
                        
                        path.move(to: CGPoint(x: startX, y: y3))
                        path.addLine(to: CGPoint(x: endX, y: y3))
                    }
                    .stroke(axisColor, style: StrokeStyle(lineWidth: gridLineWidth, dash: [5, 3]))
                }
            } else {
                EmptyView()
            }
        }
    }
}

struct LineTooltipView: View {
    let date: Date
    let series1Name: String
    let series1Value: Double
    let series2Name: String?
    let series2Value: Double?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(formattedDate)
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(.white.opacity(0.8))
                .fixedSize(horizontal: true, vertical: false)
            Rectangle()
                .frame(height: 1)
                .foregroundColor(Color.gray.opacity(0.2))
                .padding(.vertical, 6)
            
            HStack(spacing: 0) {
                Text(series1Name + ": ")
                    .foregroundColor(series1Color)
                    .font(.system(size: 12, weight: .semibold))
                Text(String(format: "%.2f", series1Value))
                    .foregroundColor(.white)
                    .font(.system(size: 12, weight: .heavy))
                    .padding(.leading, 2)
            }
            .fixedSize(horizontal: true, vertical: false)
            
            if let s2Name = series2Name, let s2Value = series2Value {
                HStack(spacing: 0) {
                    Text(s2Name + ": ")
                        .foregroundColor(series2Color)
                        .font(.system(size: 12, weight: .semibold))
                    Text(String(format: "%.2f", s2Value))
                        .foregroundColor(.white)
                        .font(.system(size: 12, weight: .heavy))
                        .padding(.leading, 2)
                }
                .fixedSize(horizontal: true, vertical: false)
            }
        }
        .fixedSize(horizontal: true, vertical: false)
        .padding(.horizontal, 8)
        .padding(.vertical, 6)
        .background(
            RoundedRectangle(cornerRadius: 6)
                .fill(Color(hex: 0x1E1E1E))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 6)
                .stroke(Color.gray.opacity(0.2), lineWidth: 1)
        )
        .padding(8)
    }
    
    private var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d, yyyy"
        return formatter.string(from: date)
    }
    
    private var series1Color: Color { Color(hex: 0x9b59b6) }
    private var series2Color: Color { Color(hex: 0x3498db) }
}

struct LineTooltipWrapper<Content: View>: View {
    let content: Content
    let containerSize: CGSize
    let proposedPosition: CGPoint

    @State private var tooltipSize: CGSize = .zero

    var body: some View {
        content
            .background(
                GeometryReader { proxy in
                    Color.clear
                        .onAppear {
                            tooltipSize = proxy.size
                        }
                        .onChange(of: proxy.size) { newSize in
                            tooltipSize = newSize
                        }
                }
            )
            .position(adjustedPosition)
    }

    private var adjustedPosition: CGPoint {
        var pos = proposedPosition
        let halfWidth = tooltipSize.width / 2
        let halfHeight = tooltipSize.height / 2

        if pos.x - halfWidth < 0 {
            pos.x = halfWidth
        }
        if pos.x + halfWidth > containerSize.width {
            pos.x = containerSize.width - halfWidth
        }
        if pos.y - halfHeight < 0 {
            pos.y = halfHeight
        }
        if pos.y + halfHeight > containerSize.height {
            pos.y = containerSize.height - halfHeight
        }
        return pos
    }
}
