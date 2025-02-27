//
//  DinoLabsTabular.swift
//
//  Created by Peter Iacobelli on 2/25/25.
//

import SwiftUI
import AppKit

struct TabularView: View {
    let geometry: GeometryProxy
    let fileURL: URL
    @Binding var leftPanelWidthRatio: CGFloat
    @StateObject private var dataModel = DataTableModel(rows: 100, columns: 15)
    private let rowHeight: CGFloat = 20
    private let rowNumberWidth: CGFloat = 50
    private let totalRows = 100
    private let totalColumns = 15
    @State private var horizontalOffset: CGFloat = 0
    @State private var verticalOffset: CGFloat = 0
    @State private var showFileMenu = false
    @State private var showEditMenu = false
    @State private var showFormatMenu = false
    @State private var showToolsMenu = false
    @State private var showInsertMenu = false
    @State private var showFilterMenu = false
    @State private var labelRects: [CGRect] = Array(repeating: .zero, count: 6)
    
    func columnLabel(for index: Int) -> String {
        var columnName = ""
        var columnIndex = index
        repeat {
            columnIndex -= 1
            columnName = String(UnicodeScalar(65 + columnIndex % 26)!) + columnName
            columnIndex /= 26
        } while columnIndex > 0
        return columnName
    }

    var body: some View {
        ZStack(alignment: .topLeading) {
            VStack(spacing: 0) {
                HStack(spacing: 0) {
                    VStack(alignment: .leading) {
                        Spacer()
                        Text(fileURL.lastPathComponent)
                            .lineLimit(1)
                            .truncationMode(.tail)
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(Color.white.opacity(0.7))
                            .shadow(color: .white.opacity(0.5), radius: 0.5, x: 0, y: 0)
                            .padding(.leading, 6)
                            .padding(.top, 4)
                            .padding(.bottom, 0)
                        
                        HStack(spacing: 0) {
                            Text("File")
                                .lineLimit(1)
                                .truncationMode(.tail)
                                .padding(.horizontal, 6)
                                .padding(.top, 1)
                                .padding(.bottom, 5)
                                .font(.system(size: 11, weight: showFileMenu ? .semibold : .regular))
                                .foregroundColor(showFileMenu ? Color.white.opacity(0.8) : Color.white.opacity(0.5))
                                .containerHelper(
                                    backgroundColor: showFileMenu ? Color.white.opacity(0.1) : Color.clear,
                                    borderColor: Color.clear,
                                    borderWidth: 0,
                                    topLeft: 2, topRight: 2, bottomLeft: 0, bottomRight: 0,
                                    shadowColor: .white.opacity(showFileMenu ? 0.0 : 0.5), shadowRadius: 0.5, shadowX: 0, shadowY: 0
                                )
                                .hoverEffect(opacity: 0.8, cursor: .pointingHand)
                                .background(
                                    GeometryReader { g in
                                        Color.clear
                                            .onAppear {
                                                labelRects[0] = g.frame(in: .named("MenuBar"))
                                            }
                                            .onChange(of: g.size) { _ in
                                                labelRects[0] = g.frame(in: .named("MenuBar"))
                                            }
                                    }
                                )
                                .onTapGesture {
                                    showFileMenu.toggle()
                                    showEditMenu = false
                                    showFormatMenu = false
                                    showToolsMenu = false
                                    showInsertMenu = false
                                    showFilterMenu = false
                                }
                            
                            Text("Edit")
                                .lineLimit(1)
                                .truncationMode(.tail)
                                .padding(.horizontal, 6)
                                .padding(.top, 1)
                                .padding(.bottom, 5)
                                .font(.system(size: 11, weight: showEditMenu ? .semibold : .regular))
                                .foregroundColor(showEditMenu ? Color.white.opacity(0.8) : Color.white.opacity(0.5))
                                .containerHelper(
                                    backgroundColor: showEditMenu ? Color.white.opacity(0.1) : Color.clear,
                                    borderColor: Color.clear,
                                    borderWidth: 0,
                                    topLeft: 2, topRight: 2, bottomLeft: 0, bottomRight: 0,
                                    shadowColor: .white.opacity(showEditMenu ? 0.0 : 0.5), shadowRadius: 0.5, shadowX: 0, shadowY: 0
                                )
                                .hoverEffect(opacity: 0.8, cursor: .pointingHand)
                                .background(
                                    GeometryReader { g in
                                        Color.clear
                                            .onAppear {
                                                labelRects[1] = g.frame(in: .named("MenuBar"))
                                            }
                                            .onChange(of: g.size) { _ in
                                                labelRects[1] = g.frame(in: .named("MenuBar"))
                                            }
                                    }
                                )
                                .onTapGesture {
                                    showEditMenu.toggle()
                                    showFileMenu = false
                                    showFormatMenu = false
                                    showToolsMenu = false
                                    showInsertMenu = false
                                    showFilterMenu = false
                                }
                            
                            Text("Format")
                                .lineLimit(1)
                                .truncationMode(.tail)
                                .padding(.horizontal, 6)
                                .padding(.top, 1)
                                .padding(.bottom, 5)
                                .font(.system(size: 11, weight: showFormatMenu ? .semibold : .regular))
                                .foregroundColor(showFormatMenu ? Color.white.opacity(0.8) : Color.white.opacity(0.5))
                                .containerHelper(
                                    backgroundColor: showFormatMenu ? Color.white.opacity(0.1) : Color.clear,
                                    borderColor: Color.clear,
                                    borderWidth: 0,
                                    topLeft: 2, topRight: 2, bottomLeft: 0, bottomRight: 0,
                                    shadowColor: .white.opacity(showFormatMenu ? 0.0 : 0.5), shadowRadius: 0.5, shadowX: 0, shadowY: 0
                                )
                                .hoverEffect(opacity: 0.8, cursor: .pointingHand)
                                .background(
                                    GeometryReader { g in
                                        Color.clear
                                            .onAppear {
                                                labelRects[2] = g.frame(in: .named("MenuBar"))
                                            }
                                            .onChange(of: g.size) { _ in
                                                labelRects[2] = g.frame(in: .named("MenuBar"))
                                            }
                                    }
                                )
                                .onTapGesture {
                                    showFormatMenu.toggle()
                                    showFileMenu = false
                                    showEditMenu = false
                                    showToolsMenu = false
                                    showInsertMenu = false
                                    showFilterMenu = false
                                }
                            
                            Text("Tools")
                                .lineLimit(1)
                                .truncationMode(.tail)
                                .padding(.horizontal, 6)
                                .padding(.top, 1)
                                .padding(.bottom, 5)
                                .font(.system(size: 11, weight: showToolsMenu ? .semibold : .regular))
                                .foregroundColor(showToolsMenu ? Color.white.opacity(0.8) : Color.white.opacity(0.5))
                                .containerHelper(
                                    backgroundColor: showToolsMenu ? Color.white.opacity(0.1) : Color.clear,
                                    borderColor: Color.clear,
                                    borderWidth: 0,
                                    topLeft: 2, topRight: 2, bottomLeft: 0, bottomRight: 0,
                                    shadowColor: .white.opacity(showToolsMenu ? 0.0 : 0.5), shadowRadius: 0.5, shadowX: 0, shadowY: 0
                                )
                                .hoverEffect(opacity: 0.8, cursor: .pointingHand)
                                .background(
                                    GeometryReader { g in
                                        Color.clear
                                            .onAppear {
                                                labelRects[3] = g.frame(in: .named("MenuBar"))
                                            }
                                            .onChange(of: g.size) { _ in
                                                labelRects[3] = g.frame(in: .named("MenuBar"))
                                            }
                                    }
                                )
                                .onTapGesture {
                                    showToolsMenu.toggle()
                                    showFileMenu = false
                                    showEditMenu = false
                                    showFormatMenu = false
                                    showInsertMenu = false
                                    showFilterMenu = false
                                }
                            
                            Text("Insert")
                                .lineLimit(1)
                                .truncationMode(.tail)
                                .padding(.horizontal, 6)
                                .padding(.top, 1)
                                .padding(.bottom, 5)
                                .font(.system(size: 11, weight: showInsertMenu ? .semibold : .regular))
                                .foregroundColor(showInsertMenu ? Color.white.opacity(0.8) : Color.white.opacity(0.5))
                                .containerHelper(
                                    backgroundColor: showInsertMenu ? Color.white.opacity(0.1) : Color.clear,
                                    borderColor: Color.clear,
                                    borderWidth: 0,
                                    topLeft: 2, topRight: 2, bottomLeft: 0, bottomRight: 0,
                                    shadowColor: .white.opacity(showInsertMenu ? 0.0 : 0.5), shadowRadius: 0.5, shadowX: 0, shadowY: 0
                                )
                                .hoverEffect(opacity: 0.8, cursor: .pointingHand)
                                .background(
                                    GeometryReader { g in
                                        Color.clear
                                            .onAppear {
                                                labelRects[4] = g.frame(in: .named("MenuBar"))
                                            }
                                            .onChange(of: g.size) { _ in
                                                labelRects[4] = g.frame(in: .named("MenuBar"))
                                            }
                                    }
                                )
                                .onTapGesture {
                                    showInsertMenu.toggle()
                                    showFileMenu = false
                                    showEditMenu = false
                                    showFormatMenu = false
                                    showToolsMenu = false
                                    showFilterMenu = false
                                }
                            
                            Text("Filter")
                                .lineLimit(1)
                                .truncationMode(.tail)
                                .padding(.horizontal, 6)
                                .padding(.top, 1)
                                .padding(.bottom, 5)
                                .font(.system(size: 11, weight: showFilterMenu ? .semibold : .regular))
                                .foregroundColor(showFilterMenu ? Color.white.opacity(0.8) : Color.white.opacity(0.5))
                                .containerHelper(
                                    backgroundColor: showFilterMenu ? Color.white.opacity(0.1) : Color.clear,
                                    borderColor: Color.clear,
                                    borderWidth: 0,
                                    topLeft: 2, topRight: 2, bottomLeft: 0, bottomRight: 0,
                                    shadowColor: .white.opacity(showFilterMenu ? 0.0 : 0.5), shadowRadius: 0.5, shadowX: 0, shadowY: 0
                                )
                                .hoverEffect(opacity: 0.8, cursor: .pointingHand)
                                .background(
                                    GeometryReader { g in
                                        Color.clear
                                            .onAppear {
                                                labelRects[5] = g.frame(in: .named("MenuBar"))
                                            }
                                            .onChange(of: g.size) { _ in
                                                labelRects[5] = g.frame(in: .named("MenuBar"))
                                            }
                                    }
                                )
                                .onTapGesture {
                                    showFilterMenu.toggle()
                                    showFileMenu = false
                                    showEditMenu = false
                                    showFormatMenu = false
                                    showToolsMenu = false
                                    showInsertMenu = false
                                }
                            
                            Spacer()
                        }
                        .frame(width: (geometry.size.width * (1 - leftPanelWidthRatio) * 0.35))
                        Spacer()
                    }
                    .frame(width: (geometry.size.width * (1 - leftPanelWidthRatio) * 0.35))
                      
                    HStack {
                        
                    }
                    .frame(width: (geometry.size.width * (1 - leftPanelWidthRatio) * 0.55), height: 40)
                    .containerHelper(
                        backgroundColor: Color.black.opacity(0.1),
                        borderColor: Color.clear,
                        borderWidth: 0,
                        topLeft: 4, topRight: 4, bottomLeft: 4, bottomRight: 5,
                        shadowColor: .white.opacity(showFilterMenu ? 0.0 : 0.5), shadowRadius: 0.5, shadowX: 0, shadowY: 0
                    )
                    .padding(.trailing, 5)
                    .padding(.leading, 15)
                }
                .padding(.horizontal, 10)
                .frame(width: geometry.size.width * (1 - leftPanelWidthRatio), height: 80)
                .containerHelper(
                    backgroundColor: Color(hex: 0x171717),
                    borderColor: Color.clear,
                    borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0,
                    shadowColor: .clear, shadowRadius: 0, shadowX: 0, shadowY: 0
                )
                .overlay(
                    Rectangle()
                        .frame(height: 0.5)
                        .foregroundColor(Color(hex: 0xc1c1c1).opacity(0.4)),
                    alignment: .bottom
                )
                
                ZStack(alignment: .topLeading) {
                    HStack(spacing: 0) {
                        VStack(spacing: 0) {
                            Rectangle()
                                .frame(width: rowNumberWidth, height: rowHeight)
                                .foregroundColor(Color.gray.opacity(0.3))
                                .border(Color.gray.opacity(0.5), width: 0.5)
                            
                            TableRowNumbers(
                                rowHeight: rowHeight,
                                rowNumberWidth: rowNumberWidth,
                                totalRows: totalRows,
                                verticalOffset: $verticalOffset
                            )
                        }
                        .zIndex(2)
                        .frame(width: rowNumberWidth)
                        
                        VStack(spacing: 0) {
                            ColumnHeaders(
                                content: {
                                    AnyView(
                                        HStack(spacing: 0) {
                                            ForEach(0..<totalColumns, id: \.self) { colIndex in
                                                Text(columnLabel(for: colIndex + 1))
                                                    .font(.system(size: 10, weight: .bold))
                                                    .padding(.horizontal, 10)
                                                    .frame(width: 100, height: rowHeight)
                                                    .background(Color(hex: 0x212121))
                                                    .border(Color.gray.opacity(0.5), width: 0.5)
                                            }
                                        }
                                    )
                                },
                                horizontalOffset: $horizontalOffset,
                                rowHeight: Int(rowHeight),
                                totalColumns: totalColumns,
                                rowNumberWidth: 0,
                                isHeader: true
                            )
                            .frame(height: rowHeight)
                            .frame(width: geometry.size.width * (1 - leftPanelWidthRatio) - rowNumberWidth)
                            
                            DataTableGrid(
                                dataModel: dataModel,
                                rowHeight: rowHeight,
                                totalRows: totalRows,
                                totalColumns: totalColumns,
                                horizontalOffset: $horizontalOffset,
                                verticalOffset: $verticalOffset
                            )
                            .frame(width: geometry.size.width * (1 - leftPanelWidthRatio) - rowNumberWidth)
                        }
                    }
                    .frame(width: geometry.size.width * (1 - leftPanelWidthRatio))
                }
            }
            
            if showFileMenu || showEditMenu || showFormatMenu || showToolsMenu || showInsertMenu || showFilterMenu {
                Color.clear
                    .contentShape(Rectangle())
                    .onTapGesture {
                        showFileMenu = false
                        showEditMenu = false
                        showFormatMenu = false
                        showToolsMenu = false
                        showInsertMenu = false
                        showFilterMenu = false
                    }
                    .ignoresSafeArea()
            }
            
            if showFileMenu {
                VStack(spacing: 0) {
                    TabularButtonMain {
                        
                    }
                    .frame(height: 12)
                    .padding(.vertical, 10)
                    .padding(.horizontal, 8)
                    .containerHelper(backgroundColor: Color(hex: 0x222222), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                    .overlay(
                        HStack {
                            Image(systemName: "arrow.down.doc.fill")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .frame(width: 10, height: 10)
                                .foregroundColor(.white.opacity(0.8))
                                .padding(.leading, 8)
                                .padding(.trailing, 4)
                                .allowsHitTesting(false)
                            Text("Save File")
                                .foregroundColor(.white.opacity(0.8))
                                .font(.system(size: 9, weight: .semibold))
                                .lineLimit(1)
                                .truncationMode(.tail)
                                .allowsHitTesting(false)
                            Spacer()
                        }
                        .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                    )
                    .overlay(
                        Rectangle()
                            .frame(height: 0.5)
                            .foregroundColor(Color(hex: 0xc1c1c1).opacity(0.2)),
                        alignment: .bottom
                    )
                    
                    TabularButtonMain {
                        
                    }
                    .frame(height: 12)
                    .padding(.vertical, 10)
                    .padding(.horizontal, 8)
                    .containerHelper(backgroundColor: Color(hex: 0x222222), borderColor: Color.clear, borderWidth: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, shadowColor: .clear, shadowRadius: 0, shadowX: 0, shadowY: 0)
                    .overlay(
                        HStack {
                            Image(systemName: "square.and.arrow.down.on.square.fill")
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .frame(width: 10, height: 10)
                                .foregroundColor(.white.opacity(0.8))
                                .padding(.leading, 8)
                                .padding(.trailing, 4)
                                .allowsHitTesting(false)
                            Text("Download File")
                                .foregroundColor(.white.opacity(0.8))
                                .font(.system(size: 9, weight: .semibold))
                                .lineLimit(1)
                                .truncationMode(.tail)
                                .allowsHitTesting(false)
                            Spacer()
                        }
                        .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                    )
                    .overlay(
                        Rectangle()
                            .frame(height: 0.5)
                            .foregroundColor(Color(hex: 0xc1c1c1).opacity(0.2)),
                        alignment: .bottom
                    )
                    
                    Spacer()
                }
                .frame(width: 160, height: 200)
                .containerHelper(
                    backgroundColor: Color(hex: 0x181818),
                    borderColor: Color(hex: 0x262626),
                    borderWidth: 1, topLeft: 2, topRight: 2, bottomLeft: 6, bottomRight: 6,
                    shadowColor: Color.white.opacity(0.5), shadowRadius: 1, shadowX: 0, shadowY: 0
                )
                .position(
                    x: labelRects[0].minX + 80,
                    y: labelRects[0].maxY + 100
                )
            }
            if showEditMenu {
                VStack(spacing: 0) {
                }
                .frame(width: 160, height: 200)
                .containerHelper(
                    backgroundColor: Color(hex: 0x181818),
                    borderColor: Color(hex: 0x262626),
                    borderWidth: 1, topLeft: 2, topRight: 2, bottomLeft: 6, bottomRight: 6,
                    shadowColor: Color.white.opacity(0.5), shadowRadius: 1, shadowX: 0, shadowY: 0
                )
                .position(
                    x: labelRects[1].minX + 80,
                    y: labelRects[1].maxY + 100
                )
            }
            if showFormatMenu {
                VStack(spacing: 0) {
                }
                .frame(width: 160, height: 200)
                .containerHelper(
                    backgroundColor: Color(hex: 0x181818),
                    borderColor: Color(hex: 0x262626),
                    borderWidth: 1, topLeft: 2, topRight: 2, bottomLeft: 6, bottomRight: 6,
                    shadowColor: Color.white.opacity(0.5), shadowRadius: 1, shadowX: 0, shadowY: 0
                )
                .position(
                    x: labelRects[2].minX + 80,
                    y: labelRects[2].maxY + 100
                )
            }
            if showToolsMenu {
                VStack(spacing: 0) {
                }
                .frame(width: 160, height: 200)
                .containerHelper(
                    backgroundColor: Color(hex: 0x181818),
                    borderColor: Color(hex: 0x262626),
                    borderWidth: 1, topLeft: 2, topRight: 2, bottomLeft: 6, bottomRight: 6,
                    shadowColor: Color.white.opacity(0.5), shadowRadius: 1, shadowX: 0, shadowY: 0
                )
                .position(
                    x: labelRects[3].minX + 80,
                    y: labelRects[3].maxY + 100
                )
            }
            if showInsertMenu {
                VStack(spacing: 0) {
                }
                .frame(width: 160, height: 200)
                .containerHelper(
                    backgroundColor: Color(hex: 0x181818),
                    borderColor: Color(hex: 0x262626),
                    borderWidth: 1, topLeft: 2, topRight: 2, bottomLeft: 6, bottomRight: 6,
                    shadowColor: Color.white.opacity(0.5), shadowRadius: 1, shadowX: 0, shadowY: 0
                )
                .position(
                    x: labelRects[4].minX + 80,
                    y: labelRects[4].maxY + 100
                )
            }
            if showFilterMenu {
                VStack(spacing: 0) {
                }
                .frame(width: 160, height: 200)
                .containerHelper(
                    backgroundColor: Color(hex: 0x181818),
                    borderColor: Color(hex: 0x262626),
                    borderWidth: 1, topLeft: 2, topRight: 2, bottomLeft: 6, bottomRight: 6,
                    shadowColor: Color.white.opacity(0.5), shadowRadius: 1, shadowX: 0, shadowY: 0
                )
                .position(
                    x: labelRects[5].minX + 80,
                    y: labelRects[5].maxY + 100
                )
            }
        }
        .coordinateSpace(name: "MenuBar")
        .onAppear {
            loadSheet()
        }
    }

    fileprivate func loadSheet() {
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                let content = try String(contentsOf: fileURL)
                let rows = content.components(separatedBy: "\n")
                let parsedData = rows.map { $0.components(separatedBy: ",") }
                
                DispatchQueue.main.async {
                    dataModel.loadData(parsedData, totalRows: totalRows, totalColumns: totalColumns)
                }
            } catch {
                return
            }
        }
    }
}

fileprivate struct TableRowNumbers: NSViewRepresentable {
    let rowHeight: CGFloat
    let rowNumberWidth: CGFloat
    let totalRows: Int
    @Binding var verticalOffset: CGFloat

    func makeNSView(context: Context) -> NSScrollView {
        let scrollView = NSScrollView()
        scrollView.hasVerticalScroller = false
        scrollView.hasHorizontalScroller = false
        scrollView.autohidesScrollers = true
        scrollView.verticalScrollElasticity = .none
        scrollView.horizontalScrollElasticity = .none
        
        let contentView = NSView(frame: NSRect(x: 0, y: 0, width: rowNumberWidth, height: CGFloat(totalRows) * rowHeight))
        
        for row in 0..<totalRows {
            let containerFrame = NSRect(x: 0, y: CGFloat(totalRows - row - 1) * rowHeight, width: rowNumberWidth, height: rowHeight)
            let container = NSView(frame: containerFrame)
            
            container.wantsLayer = true
            container.layer?.backgroundColor = NSColor(hex: 0x212121).cgColor
            container.layer?.borderColor = NSColor.gray.withAlphaComponent(0.5).cgColor
            container.layer?.borderWidth = 0.5
            
            let font = NSFont.systemFont(ofSize: 10, weight: .bold)
            let textHeight = font.ascender + abs(font.descender)
            let labelFrame = NSRect(x: 0, y: (rowHeight - textHeight) / 2, width: rowNumberWidth, height: textHeight)
            let label = NSTextField(frame: labelFrame)
            label.stringValue = "\(row + 1)"
            label.isEditable = false
            label.isBordered = false
            label.backgroundColor = .clear
            
            label.textColor = .white
            label.font = font
            label.alignment = .center
            label.wantsLayer = true
            
            container.addSubview(label)
            contentView.addSubview(container)
        }
        
        scrollView.documentView = contentView
        DispatchQueue.main.async {
            let maxVerticalOffset = contentView.frame.height - scrollView.contentView.bounds.height
            scrollView.contentView.scroll(to: NSPoint(x: 0, y: maxVerticalOffset))
        }
        
        return scrollView
    }

    func updateNSView(_ nsView: NSScrollView, context: Context) {
        let currentY = nsView.contentView.bounds.origin.y
        if abs(currentY - verticalOffset) > 0.1 {
            nsView.contentView.scroll(to: NSPoint(x: 0, y: verticalOffset))
        }
    }
}

struct ColumnHeaders: NSViewRepresentable {
    let content: () -> AnyView
    @Binding var horizontalOffset: CGFloat
    var rowHeight: Int
    var totalColumns: Int
    var rowNumberWidth: Int
    var isHeader: Bool = false

    func makeNSView(context: Context) -> NSScrollView {
        let scrollView = NSScrollView()
        scrollView.hasVerticalScroller = false
        scrollView.hasHorizontalScroller = false
        scrollView.scrollerStyle = .overlay
        scrollView.autohidesScrollers = false
        scrollView.verticalScrollElasticity = .none
        scrollView.horizontalScrollElasticity = .none

        let hostingView = NSHostingView(rootView: content())
        scrollView.documentView = hostingView

        let minWidth = CGFloat(totalColumns * 80 + rowNumberWidth)
        hostingView.translatesAutoresizingMaskIntoConstraints = false

        if isHeader {
            hostingView.heightAnchor.constraint(equalToConstant: CGFloat(rowHeight)).isActive = true
        }

        hostingView.widthAnchor.constraint(greaterThanOrEqualToConstant: minWidth).isActive = true
        hostingView.widthAnchor.constraint(greaterThanOrEqualTo: scrollView.contentView.widthAnchor).isActive = true
        scrollView.contentView.scroll(to: NSPoint(x: horizontalOffset, y: 0))

        NotificationCenter.default.addObserver(
            context.coordinator,
            selector: #selector(context.coordinator.scrollViewDidScroll(_:)),
            name: NSView.boundsDidChangeNotification,
            object: scrollView.contentView
        )

        context.coordinator.scrollView = scrollView
        return scrollView
    }

    func updateNSView(_ nsView: NSScrollView, context: Context) {
        if let hostingView = nsView.documentView as? NSHostingView<AnyView> {
            hostingView.rootView = content()
        }
        nsView.contentView.scroll(to: NSPoint(x: horizontalOffset, y: 0))
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    class Coordinator: NSObject {
        var parent: ColumnHeaders
        var scrollView: NSScrollView?

        init(_ parent: ColumnHeaders) {
            self.parent = parent
        }

        @objc func scrollViewDidScroll(_ notification: Notification) {
            guard let scrollView = scrollView else { return }
            let newOffset = scrollView.contentView.bounds.origin.x
            if newOffset != parent.horizontalOffset {
                DispatchQueue.main.async {
                    self.parent.horizontalOffset = newOffset
                }
            }
        }

        deinit {
            NotificationCenter.default.removeObserver(self)
        }
    }

    static func dismantleNSView(_ nsView: NSScrollView, coordinator: Coordinator) {
        NotificationCenter.default.removeObserver(coordinator)
        nsView.documentView = nil
    }
}

fileprivate struct DataTableGrid: NSViewRepresentable {
    @ObservedObject var dataModel: DataTableModel
    let rowHeight: CGFloat
    let totalRows: Int
    let totalColumns: Int
    @Binding var horizontalOffset: CGFloat
    @Binding var verticalOffset: CGFloat

    func makeNSView(context: Context) -> NSScrollView {
        let scrollView = NSScrollView()
        scrollView.hasVerticalScroller = true
        scrollView.hasHorizontalScroller = true
        scrollView.autohidesScrollers = true
        scrollView.scrollerStyle = .overlay
        scrollView.verticalScrollElasticity = .none
        scrollView.horizontalScrollElasticity = .none
        
        let tableView = DataTableWrapper(
            frame: .zero,
            dataModel: dataModel,
            rowHeight: rowHeight,
            totalRows: totalRows,
            totalColumns: totalColumns
        )
        
        scrollView.documentView = tableView
        scrollView.contentView.postsBoundsChangedNotifications = true
        
        NotificationCenter.default.addObserver(
            context.coordinator,
            selector: #selector(context.coordinator.scrollViewDidScroll(_:)),
            name: NSView.boundsDidChangeNotification,
            object: scrollView.contentView
        )
        
        DispatchQueue.main.async {
            let maxVerticalOffset = tableView.frame.height - scrollView.contentView.bounds.height
            scrollView.contentView.scroll(to: NSPoint(x: horizontalOffset, y: maxVerticalOffset))
        }
        
        context.coordinator.scrollView = scrollView
        return scrollView
    }

    func updateNSView(_ nsView: NSScrollView, context: Context) {
        if let tableView = nsView.documentView as? DataTableWrapper {
            tableView.dataModel = dataModel
            tableView.updateCells()
        }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    class Coordinator: NSObject {
        var parent: DataTableGrid
        var scrollView: NSScrollView?

        init(_ parent: DataTableGrid) {
            self.parent = parent
        }

        @objc func scrollViewDidScroll(_ notification: Notification) {
            guard let scrollView = scrollView else { return }
            let newHorizontalOffset = scrollView.contentView.bounds.origin.x
            let newVerticalOffset = scrollView.contentView.bounds.origin.y
            
            if newHorizontalOffset != parent.horizontalOffset || newVerticalOffset != parent.verticalOffset {
                DispatchQueue.main.async {
                    self.parent.horizontalOffset = newHorizontalOffset
                    self.parent.verticalOffset = newVerticalOffset
                }
            }
        }

        deinit {
            NotificationCenter.default.removeObserver(self)
        }
    }
}

fileprivate class DataTableWrapper: NSView {
    var dataModel: DataTableModel
    let rowHeight: CGFloat
    let totalRows: Int
    let totalColumns: Int
    private var textFields: [[NSTextField]] = []
    private var gridOverlay: DataGridOverlay!

    init(frame: NSRect, dataModel: DataTableModel, rowHeight: CGFloat, totalRows: Int, totalColumns: Int) {
        self.dataModel = dataModel
        self.rowHeight = rowHeight
        self.totalRows = totalRows
        self.totalColumns = totalColumns
        super.init(frame: frame)
        
        setupTable()
        
        gridOverlay = DataGridOverlay(frame: self.bounds, totalRows: totalRows, totalColumns: totalColumns, rowHeight: rowHeight)
        gridOverlay.autoresizingMask = [.width, .height]
        gridOverlay.wantsLayer = true
        gridOverlay.layer?.zPosition = 1
        addSubview(gridOverlay)
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    private func setupTable() {
        let totalWidth = CGFloat(totalColumns) * 100
        let totalHeight = CGFloat(totalRows) * rowHeight
        frame = NSRect(x: 0, y: 0, width: totalWidth, height: totalHeight)
        
        textFields = []
        for row in 0..<totalRows {
            var rowFields: [NSTextField] = []
            let containerY = CGFloat(totalRows - row - 1) * rowHeight
            for col in 0..<totalColumns {
                let containerFrame = NSRect(x: CGFloat(col) * 100, y: containerY, width: 100, height: rowHeight)
                let container = NSView(frame: containerFrame)
                
                container.wantsLayer = true
                container.layer?.backgroundColor = NSColor(hex: 0x181818).cgColor

                let font = NSFont.systemFont(ofSize: 9, weight: .semibold)
                let textHeight = font.ascender + abs(font.descender)
                let textFieldFrame = NSRect(x: 0, y: (rowHeight - textHeight) / 2, width: 100, height: textHeight)
                let textField = NSTextField(frame: textFieldFrame)
                textField.stringValue = dataModel.getValue(row: row, column: col)
                textField.isBordered = false
                textField.backgroundColor = .clear
                textField.focusRingType = .none
                textField.textColor = .white
                textField.font = font
                textField.delegate = self
                textField.tag = row * totalColumns + col
                textField.wantsLayer = true
                textField.layer?.zPosition = 0
                textField.alignment = .center
                if let cell = textField.cell as? NSTextFieldCell {
                    cell.lineBreakMode = .byTruncatingTail
                }
                container.addSubview(textField)
                addSubview(container)
                rowFields.append(textField)
            }
            textFields.append(rowFields)
        }
    }
    
    func updateCells() {
        for row in 0..<totalRows {
            for col in 0..<totalColumns {
                let textField = textFields[row][col]
                if textField.currentEditor() == nil {
                    textField.stringValue = dataModel.getValue(row: row, column: col)
                }
            }
        }
    }
    
    override var isFlipped: Bool {
        return false
    }
}

extension DataTableWrapper: NSTextFieldDelegate {
    func controlTextDidChange(_ obj: Notification) {
        guard let textField = obj.object as? NSTextField else { return }
        let tag = textField.tag
        let row = tag / totalColumns
        let col = tag % totalColumns
        dataModel.updateCell(row: row, column: col, value: textField.stringValue)
    }
}

private class DataTableModel: ObservableObject {
    private var data: [[String]]
    private let rows: Int
    private let columns: Int
    
    init(rows: Int, columns: Int) {
        self.rows = rows
        self.columns = columns
        self.data = Array(repeating: Array(repeating: "", count: columns), count: rows)
    }
    
    func loadData(_ parsedData: [[String]], totalRows: Int, totalColumns: Int) {
        for row in 0..<min(totalRows, parsedData.count) {
            for col in 0..<min(totalColumns, parsedData[row].count) {
                data[row][col] = parsedData[row][col]
            }
        }
        objectWillChange.send()
    }
    
    func getValue(row: Int, column: Int) -> String {
        guard row < data.count && column < data[row].count else { return "" }
        return data[row][column]
    }
    
    func updateCell(row: Int, column: Int, value: String) {
        guard row < data.count && column < data[row].count else { return }
        data[row][column] = value
        objectWillChange.send()
    }
}

private class DataGridOverlay: NSView {
    let totalRows: Int
    let totalColumns: Int
    let rowHeight: CGFloat
    let cellWidth: CGFloat = 100

    init(frame frameRect: NSRect, totalRows: Int, totalColumns: Int, rowHeight: CGFloat) {
        self.totalRows = totalRows
        self.totalColumns = totalColumns
        self.rowHeight = rowHeight
        super.init(frame: frameRect)
        self.wantsLayer = true
        self.layer?.backgroundColor = NSColor.clear.cgColor
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func draw(_ dirtyRect: NSRect) {
        super.draw(dirtyRect)
        
        NSColor.gray.withAlphaComponent(0.5).setStroke()
        let path = NSBezierPath()
        
        for col in 0...totalColumns {
            let x = CGFloat(col) * cellWidth
            path.move(to: NSPoint(x: x, y: 0))
            path.line(to: NSPoint(x: x, y: self.bounds.height))
        }
        
        for row in 0...totalRows {
            let y = CGFloat(row) * rowHeight
            path.move(to: NSPoint(x: 0, y: y))
            path.line(to: NSPoint(x: self.bounds.width, y: y))
        }
        
        path.lineWidth = 0.5
        path.stroke()
    }
}
