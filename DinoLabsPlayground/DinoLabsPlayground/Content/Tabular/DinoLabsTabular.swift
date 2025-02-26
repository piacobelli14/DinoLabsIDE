import SwiftUI

struct TabularView: View {
    let fileURL: URL
    @State private var data: [[String]] = []
    private let rowHeight: CGFloat = 20
    private let rowNumberWidth: CGFloat = 40
    private let totalRows = 1000
    private let totalColumns = 1000
    
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
        ScrollViewReader { proxy in
            ScrollView([.horizontal, .vertical]) {
                LazyVStack(alignment: .leading, spacing: 0) {
                    LazyHStack(spacing: 0) {
                        Rectangle()
                            .frame(width: rowNumberWidth, height: rowHeight)
                            .foregroundColor(Color.gray.opacity(0.3))
                            .border(Color.gray.opacity(0.5), width: 1)
                        
                        ForEach(0..<totalColumns, id: \.self) { colIndex in
                            Text(columnLabel(for: colIndex + 1))
                                .fontWeight(.bold)
                                .padding(2)
                                .frame(width: 80, height: rowHeight)
                                .background(Color.gray.opacity(0.2))
                                .border(Color.gray.opacity(0.5), width: 1)
                        }
                    }
                    
                    ForEach(0..<totalRows, id: \.self) { rowIndex in
                        LazyHStack(spacing: 0) {
                            Text("\(rowIndex + 1)")
                                .fontWeight(.bold)
                                .padding(2)
                                .frame(width: rowNumberWidth, height: rowHeight)
                                .background(Color.gray.opacity(0.2))
                                .border(Color.gray.opacity(0.5), width: 1)
                            
                            ForEach(0..<totalColumns, id: \.self) { colIndex in
                                Text(
                                    rowIndex < data.count && colIndex < data[rowIndex].count
                                    ? data[rowIndex][colIndex]
                                    : ""
                                )
                                .padding(2)
                                .frame(width: 80, height: rowHeight)
                                .border(Color.gray.opacity(0.5), width: 1)
                            }
                        }
                    }
                }
                .id("topLeft")
            }
            .onAppear {
                loadSheet()
                proxy.scrollTo("topLeft", anchor: .topLeading)
            }
        }
    }
    
    private func loadSheet() {
        if let content = try? String(contentsOf: fileURL) {
            let rows = content.components(separatedBy: "\n")
            data = rows.map { $0.components(separatedBy: ",") }
        }
    }
}
