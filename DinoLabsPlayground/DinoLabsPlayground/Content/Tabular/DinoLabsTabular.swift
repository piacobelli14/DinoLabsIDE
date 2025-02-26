import SwiftUI
import AppKit

struct TabularView: View {
    let fileURL: URL
    @State private var data: [[String]] = []
    private let rowHeight: CGFloat = 30
    private let rowNumberWidth: CGFloat = 50
    private let totalRows = 100
    private let totalColumns = 15
    @State private var horizontalOffset: CGFloat = 0

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
