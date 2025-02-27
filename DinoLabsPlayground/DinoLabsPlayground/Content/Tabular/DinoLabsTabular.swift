import SwiftUI
import AppKit

struct TabularView: View {
    let geometry: GeometryProxy
    let fileURL: URL
    @Binding var leftPanelWidthRatio: CGFloat
    @State private var data: [[String]] = []
    private let rowHeight: CGFloat = 30
    private let rowNumberWidth: CGFloat = 50
    private let totalRows = 100
    private let totalColumns = 15
    @State private var horizontalOffset: CGFloat = 0
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
                            .padding(.leading, 8)
                        
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
                        .frame(width: (geometry.size.width * (1 - leftPanelWidthRatio) * 0.4))
                        Spacer()
                    }
                    .frame(width: (geometry.size.width * (1 - leftPanelWidthRatio) * 0.4))
                      
                    Spacer()
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
                    
                    Rectangle()
                        .frame(width: rowNumberWidth, height: rowHeight)
                        .foregroundColor(Color.gray.opacity(0.3))
                        .border(Color.gray.opacity(0.5), width: 0.5)
                        .zIndex(2)
                    
                    VStack(spacing: 0) {
                        ColumnHeaderScrollView(
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
                        .padding(.leading, rowNumberWidth)
                        
                        ScrollView(.vertical) {
                            HStack(alignment: .top, spacing: 0) {
                                LazyVStack(spacing: 0) {
                                    ForEach(0..<totalRows, id: \.self) { rowIndex in
                                        Text("\(rowIndex + 1)")
                                            .font(.system(size: 10, weight: .bold))
                                            .padding(.horizontal, 10)
                                            .frame(width: rowNumberWidth, height: rowHeight)
                                            .background(Color(hex: 0x212121))
                                            .border(Color.gray.opacity(0.5), width: 0.5)
                                    }
                                }
                                .frame(width: rowNumberWidth)
                                
                                ColumnHeaderScrollView(
                                    content: {
                                        AnyView(
                                            LazyVStack(spacing: 0) {
                                                ForEach(0..<totalRows, id: \.self) { rowIndex in
                                                    HStack(spacing: 0) {
                                                        ForEach(0..<totalColumns, id: \.self) { colIndex in
                                                            Text(
                                                                rowIndex < data.count && colIndex < data[rowIndex].count
                                                                ? data[rowIndex][colIndex]
                                                                : ""
                                                            )
                                                            .lineLimit(1)
                                                            .truncationMode(.tail)
                                                            .font(.system(size: 9, weight: .semibold))
                                                            .padding(.horizontal, 10)
                                                            .frame(width: 100, height: rowHeight)
                                                            .background(Color(hex: 0x181818))
                                                            .border(Color.gray.opacity(0.5), width: 0.5)
                                                        }
                                                    }
                                                }
                                            }
                                        )
                                    },
                                    horizontalOffset: $horizontalOffset,
                                    rowHeight: Int(rowHeight * CGFloat(totalRows)),
                                    totalColumns: totalColumns,
                                    rowNumberWidth: 0,
                                    isHeader: false
                                )
                            }
                            .id("topLeft")
                        }
                        .modifier(HideScrollIndicatorsIfAvailable())
                    }
                    .zIndex(1)
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

    private func loadSheet() {
        if let content = try? String(contentsOf: fileURL) {
            let rows = content.components(separatedBy: "\n")
            data = rows.map { $0.components(separatedBy: ",") }
        }
    }
}

fileprivate struct HideScrollIndicatorsIfAvailable: ViewModifier {
    func body(content: Content) -> some View {
        if #available(macOS 13.0, *) {
            return AnyView(content.scrollIndicators(.hidden))
        } else {
            return AnyView(content)
        }
    }
}

struct ColumnHeaderScrollView: NSViewRepresentable {
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
        var parent: ColumnHeaderScrollView
        var scrollView: NSScrollView?

        init(_ parent: ColumnHeaderScrollView) {
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
