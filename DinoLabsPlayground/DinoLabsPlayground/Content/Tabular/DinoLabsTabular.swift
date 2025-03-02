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
    @Binding var hasUnsavedChanges: Bool
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
    @State private var cellSelection: (startRow: Int, endRow: Int, startColumn: Int, endColumn: Int)? = nil
    @State private var copyIcon = "square.on.square"
    @State private var searchState: Bool = false
    @State private var replaceState: Bool = false
    @State private var searchCaseSensitive: Bool = true
    @State private var searchQuery: String = ""
    @State private var replaceQuery: String = ""
    @State private var isReplacing: Bool = false
    @State private var currentSearchMatch: Int = 0
    @State private var totalSearchMatches: Int = 0
    @State private var cmdFMonitor: Any? = nil
    @State private var undoRedoMonitor: Any? = nil
    @State private var keyBindMonitor: Any? = nil
    @State private var copiedData: [[String]] = []
    @State private var searchMatches: [(row: Int, column: Int)] = []

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
                        shadowColor: Color.white.opacity(0.2), shadowRadius: 0.5, shadowX: 0, shadowY: 0
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
                
                HStack {
                    if searchState || replaceState {
                        HStack(spacing: 0) {
                            HStack(spacing: 0) {
                                TabularTextField(
                                    placeholder: "Search file...",
                                    text: $searchQuery,
                                    onReturnKeyPressed: {
                                        if !searchMatches.isEmpty {
                                            let newIndex = (currentSearchMatch + 1) > totalSearchMatches
                                                ? 1
                                                : (currentSearchMatch + 1)
                                            currentSearchMatch = newIndex
                                            postSearchUpdate()
                                        }
                                    }
                                )
                                .lineLimit(1)
                                .truncationMode(.tail)
                                .textFieldStyle(PlainTextFieldStyle())
                                .foregroundColor(.white)
                                .font(.system(size: 8, weight: .semibold))
                                .padding(.horizontal, 10)
                                .frame(width: 100, height: 25)
                                .containerHelper(backgroundColor: Color(hex: 0x222222),
                                                  borderColor: Color(hex: 0x616161),
                                                  borderWidth: 1,
                                                  topLeft: 2, topRight: 0,
                                                  bottomLeft: 2, bottomRight: 0,
                                                  shadowColor: .clear,
                                                  shadowRadius: 0,
                                                  shadowX: 0, shadowY: 0)
                                .hoverEffect(opacity: 0.8)
                                .onChange(of: searchQuery) { _ in
                                    performSearch()
                                }
                                    
                                HStack {
                                    TabularButtonMain {
                                        if !searchMatches.isEmpty {
                                            let newIndex = (currentSearchMatch + 1) > totalSearchMatches
                                                ? 1
                                                : (currentSearchMatch + 1)
                                            currentSearchMatch = newIndex
                                            postSearchUpdate()
                                        }
                                    }
                                    .lineLimit(1)
                                    .truncationMode(.tail)
                                    .textFieldStyle(PlainTextFieldStyle())
                                    .foregroundColor(.white)
                                    .overlay(
                                        Image(systemName: "arrow.down")
                                            .font(.system(size: 9, weight: .semibold))
                                            .foregroundColor(Color(hex: 0xf5f5f5))
                                            .allowsHitTesting(false)
                                    )
                                    .hoverEffect(opacity: 0.6, scale: 1.05, cursor: .pointingHand)
                                    
                                    TabularButtonMain {
                                        if !searchMatches.isEmpty {
                                            let newIndex = (currentSearchMatch - 1) < 1
                                                ? totalSearchMatches
                                                : (currentSearchMatch - 1)
                                            currentSearchMatch = newIndex
                                            postSearchUpdate()
                                        }
                                    }
                                    .lineLimit(1)
                                    .truncationMode(.tail)
                                    .textFieldStyle(PlainTextFieldStyle())
                                    .foregroundColor(.white)
                                    .overlay(
                                        Image(systemName: "arrow.up")
                                            .font(.system(size: 9, weight: .semibold))
                                            .foregroundColor(Color(hex: 0xf5f5f5))
                                            .allowsHitTesting(false)
                                    )
                                    .hoverEffect(opacity: 0.6, scale: 1.05, cursor: .pointingHand)
                                    
                                    TabularButtonMain {
                                        searchCaseSensitive.toggle()
                                        performSearch()
                                    }
                                    .lineLimit(1)
                                    .truncationMode(.tail)
                                    .textFieldStyle(PlainTextFieldStyle())
                                    .foregroundColor(.white)
                                    .overlay(
                                        Image(systemName: "a.square.fill")
                                            .font(.system(size: 10, weight: .semibold))
                                            .foregroundColor(searchCaseSensitive ? Color(hex: 0x5C2BE2)
                                                                                 : Color(hex: 0xf5f5f5))
                                            .allowsHitTesting(false)
                                    )
                                    .hoverEffect(opacity: 0.6, scale: 1.05, cursor: .pointingHand)
                                }
                                .padding(.horizontal, 10)
                                .frame(width: 60, height: 25)
                                .containerHelper(backgroundColor: Color(hex: 0x222222),
                                                  borderColor: Color(hex: 0x616161),
                                                  borderWidth: 1,
                                                  topLeft: 0, topRight: 2,
                                                  bottomLeft: 0, bottomRight: 2,
                                                  shadowColor: .clear,
                                                  shadowRadius: 0,
                                                  shadowX: 0, shadowY: 0)
                                HStack {
                                    Text("\(currentSearchMatch) of \(totalSearchMatches)")
                                        .foregroundColor(.white)
                                        .font(.system(size: 8, weight: .semibold))
                                        .frame(width: 60, height: 25)
                                        .lineLimit(1)
                                        .truncationMode(.tail)
                                        .padding(.leading, 8)
                                    Spacer()
                                }
                                .padding(.horizontal, 10)
                                .frame(width: 60, height: 25)
                                .containerHelper(backgroundColor: Color(hex: 0x222222),
                                                  borderColor: Color(hex: 0x616161),
                                                  borderWidth: 1,
                                                  topLeft: 0, topRight: 2,
                                                  bottomLeft: 0, bottomRight: 2,
                                                  shadowColor: .clear,
                                                  shadowRadius: 0,
                                                  shadowX: 0, shadowY: 0)
                            }
                            .frame(width: 220, height: 25)
                            .containerHelper(backgroundColor: Color.clear,
                                              borderColor: Color(hex: 0x616161),
                                              borderWidth: 1,
                                              topLeft: 2, topRight: 2,
                                              bottomLeft: 2, bottomRight: 2,
                                              shadowColor: Color.white.opacity(0.5),
                                              shadowRadius: 8,
                                              shadowX: 0, shadowY: 0)
                            if replaceState {
                                HStack(spacing: 0) {
                                    TabularTextField(placeholder: "Replace with...", text: $replaceQuery)
                                        .lineLimit(1)
                                        .truncationMode(.tail)
                                        .textFieldStyle(PlainTextFieldStyle())
                                        .foregroundColor(.white)
                                        .font(.system(size: 8, weight: .semibold))
                                        .padding(.horizontal, 10)
                                        .frame(width: 100, height: 25)
                                        .containerHelper(backgroundColor: Color(hex: 0x222222),
                                                          borderColor: Color(hex: 0x616161),
                                                          borderWidth: 1,
                                                          topLeft: 2, topRight: 0,
                                                          bottomLeft: 2, bottomRight: 0,
                                                          shadowColor: .clear,
                                                          shadowRadius: 0,
                                                          shadowX: 0, shadowY: 0)
                                        .hoverEffect(opacity: 0.8)
                                    HStack {
                                        TabularButtonMain {
                                            if !searchMatches.isEmpty && currentSearchMatch > 0 {
                                                let matchIndex = currentSearchMatch - 1
                                                let (row, col) = searchMatches[matchIndex]
                                                dataModel.updateCell(row: row, column: col, value: replaceQuery)
                                                performSearch()
                                                if currentSearchMatch > totalSearchMatches {
                                                    currentSearchMatch = totalSearchMatches
                                                }
                                                postSearchUpdate()
                                            }
                                        }
                                        .lineLimit(1)
                                        .truncationMode(.tail)
                                        .textFieldStyle(PlainTextFieldStyle())
                                        .foregroundColor(.white)
                                        .overlay(
                                            Image(systemName: "square.fill")
                                                .font(.system(size: 9, weight: .semibold))
                                                .foregroundColor(Color(hex: 0xf5f5f5))
                                                .allowsHitTesting(false)
                                        )
                                        .hoverEffect(opacity: 0.6,
                                                     scale: 1.05,
                                                     cursor: .pointingHand)
                                        
                                        TabularButtonMain {
                                            if !searchMatches.isEmpty {
                                                for (row, col) in searchMatches {
                                                    dataModel.updateCell(row: row, column: col, value: replaceQuery)
                                                }
                                                performSearch()
                                                postSearchUpdate()
                                            }
                                        }
                                        .lineLimit(1)
                                        .truncationMode(.tail)
                                        .textFieldStyle(PlainTextFieldStyle())
                                        .foregroundColor(.white)
                                        .overlay(
                                            Image(systemName: "square.grid.3x1.below.line.grid.1x2")
                                                .font(.system(size: 9, weight: .semibold))
                                                .foregroundColor(Color(hex: 0xf5f5f5))
                                                .allowsHitTesting(false)
                                        )
                                        .hoverEffect(opacity: 0.6,
                                                     scale: 1.05,
                                                     cursor: .pointingHand)
                                    }
                                    .padding(.horizontal, 10)
                                    .frame(width: 60, height: 25)
                                    .containerHelper(backgroundColor: Color(hex: 0x222222),
                                                      borderColor: Color(hex: 0x616161),
                                                      borderWidth: 1,
                                                      topLeft: 0, topRight: 2,
                                                      bottomLeft: 0, bottomRight: 2,
                                                      shadowColor: .clear,
                                                      shadowRadius: 0,
                                                      shadowX: 0, shadowY: 0)
                                }
                                .frame(width: 160, height: 25)
                                .containerHelper(backgroundColor: Color.clear,
                                                  borderColor: Color(hex: 0x616161),
                                                  borderWidth: 1,
                                                  topLeft: 2, topRight: 2,
                                                  bottomLeft: 2, bottomRight: 2,
                                                  shadowColor: Color.white.opacity(0.5),
                                                  shadowRadius: 8,
                                                  shadowX: 0, shadowY: 0)
                                .padding(.leading, 10)
                            }
                        }
                    }
                    Spacer()
                    HStack(spacing: 8) {
                        TabularButtonMain {
                            if !searchState {
                                searchState = true
                                replaceState = false
                            } else {
                                searchState = false
                                replaceState = false
                                searchQuery = ""
                                replaceQuery = ""
                                clearSearchResults()
                            }
                        }
                        .containerHelper(backgroundColor: searchState ? Color(hex: 0xAD6ADD) : Color(hex: 0x414141),
                                         borderColor: Color(hex: 0x414141),
                                         borderWidth: 1,
                                         topLeft: 2, topRight: 2,
                                         bottomLeft: 2, bottomRight: 2,
                                         shadowColor: Color(hex: 0x222222),
                                         shadowRadius: 0.5,
                                         shadowX: 0, shadowY: 0)
                        .frame(width: 20, height: 20)
                        .overlay(
                            Image(systemName: "magnifyingglass")
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundColor(Color(hex: 0xf5f5f5).opacity(0.8))
                                .allowsHitTesting(false)
                        )
                        .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                        TabularButtonMain {
                            if !replaceState {
                                replaceState = true
                                searchState = false
                                clearSearchResults()
                            } else {
                                replaceState = false
                                searchState = false
                                searchQuery = ""
                                replaceQuery = ""
                                clearSearchResults()
                            }
                        }
                        .containerHelper(backgroundColor: replaceState ? Color(hex: 0xAD6ADD) : Color(hex: 0x414141),
                                         borderColor: Color(hex: 0x414141),
                                         borderWidth: 1,
                                         topLeft: 2, topRight: 2,
                                         bottomLeft: 2, bottomRight: 2,
                                         shadowColor: Color(hex: 0x222222),
                                         shadowRadius: 0.5,
                                         shadowX: 0, shadowY: 0)
                        .frame(width: 20, height: 20)
                        .overlay(
                            Image(systemName: "text.magnifyingglass")
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundColor(Color(hex: 0xf5f5f5).opacity(0.8))
                                .allowsHitTesting(false)
                        )
                        .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                        
                        TabularButtonMain {
                            dataModel.undo()
                        }
                        .containerHelper(backgroundColor: Color(hex: 0x414141),
                                         borderColor: Color(hex: 0x414141),
                                         borderWidth: 1,
                                         topLeft: 2, topRight: 2,
                                         bottomLeft: 2, bottomRight: 2,
                                         shadowColor: Color(hex: 0x222222),
                                         shadowRadius: 0.5,
                                         shadowX: 0, shadowY: 0)
                        .frame(width: 20, height: 20)
                        .overlay(
                            Image(systemName: "arrow.uturn.backward")
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundColor(Color(hex: 0xf5f5f5).opacity(0.8))
                                .allowsHitTesting(false)
                        )
                        .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                        TabularButtonMain {
                            dataModel.redo()
                        }
                        .containerHelper(backgroundColor: Color(hex: 0x414141),
                                         borderColor: Color(hex: 0x414141),
                                         borderWidth: 1,
                                         topLeft: 2, topRight: 2,
                                         bottomLeft: 2, bottomRight: 2,
                                         shadowColor: Color(hex: 0x222222),
                                         shadowRadius: 0.5,
                                         shadowX: 0, shadowY: 0)
                        .frame(width: 20, height: 20)
                        .overlay(
                            Image(systemName: "arrow.uturn.forward")
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundColor(Color(hex: 0xf5f5f5).opacity(0.8))
                                .allowsHitTesting(false)
                        )
                        .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                    }
                }
                .frame(height: 25)
                .padding(.bottom, 15)
                .padding(.horizontal, 20)
                .containerHelper(backgroundColor: Color(hex: 0x171717).opacity(0.9),
                                  borderColor: Color.clear,
                                  borderWidth: 0,
                                  topLeft: 0, topRight: 0,
                                  bottomLeft: 0, bottomRight: 0,
                                  shadowColor: Color.clear,
                                  shadowRadius: 0,
                                  shadowX: 0, shadowY: 0)
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
                                .onTapGesture {
                                    NotificationCenter.default.post(name: Notification.Name("FullSheetSelection"), object: nil)
                                }
                            
                            RowNumbers(
                                rowHeight: rowHeight,
                                rowNumberWidth: rowNumberWidth,
                                totalRows: totalRows,
                                verticalOffset: $verticalOffset,
                                selectedRange: cellSelection.map { ($0.startRow, $0.endRow) }
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
                                                let isSelected = cellSelection != nil && (colIndex >= cellSelection!.startColumn && colIndex <= cellSelection!.endColumn)
                                                Text(columnLabel(for: colIndex + 1))
                                                    .font(.system(size: 10, weight: .bold))
                                                    .padding(.horizontal, 10)
                                                    .frame(width: 100, height: rowHeight)
                                                    .background(isSelected ? Color(hex: 0x2F2F2F) : Color(hex: 0x212121))
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
                                verticalOffset: $verticalOffset,
                                hasUnsavedChanges: $hasUnsavedChanges
                            )
                            .frame(width: geometry.size.width * (1 - leftPanelWidthRatio) - rowNumberWidth)
                            .contextMenu {
                                Button("Cut") {
                                    if let selection = cellSelection {
                                        let minRow = min(selection.startRow, selection.endRow)
                                        let maxRow = max(selection.startRow, selection.endRow)
                                        let minCol = min(selection.startColumn, selection.endColumn)
                                        let maxCol = max(selection.startColumn, selection.endColumn)
                                        var buffer: [[String]] = []
                                        for row in minRow...maxRow {
                                            var rowBuffer: [String] = []
                                            for col in minCol...maxCol {
                                                rowBuffer.append(dataModel.getValue(row: row, column: col))
                                            }
                                            buffer.append(rowBuffer)
                                        }
                                        copiedData = buffer
                                        for row in minRow...maxRow {
                                            for col in minCol...maxCol {
                                                dataModel.updateCell(row: row, column: col, value: "")
                                            }
                                        }
                                    } else if let keyWindow = NSApp.keyWindow,
                                              let responder = keyWindow.firstResponder as? NSTextView,
                                              let textField = responder.delegate as? NSTextField {
                                        let tag = textField.tag
                                        let row = tag / totalColumns
                                        let col = tag % totalColumns
                                        copiedData = [[dataModel.getValue(row: row, column: col)]]
                                        dataModel.updateCell(row: row, column: col, value: "")
                                    }
                                }
                                Button("Copy") {
                                    if let selection = cellSelection {
                                        let minRow = min(selection.startRow, selection.endRow)
                                        let maxRow = max(selection.startRow, selection.endRow)
                                        let minCol = min(selection.startColumn, selection.endColumn)
                                        let maxCol = max(selection.startColumn, selection.endColumn)
                                        
                                        var buffer: [[String]] = []
                                        for row in minRow...maxRow {
                                            var rowBuffer: [String] = []
                                            for col in minCol...maxCol {
                                                rowBuffer.append(dataModel.getValue(row: row, column: col))
                                            }
                                            buffer.append(rowBuffer)
                                        }
                                        copiedData = buffer
                                    } else if let keyWindow = NSApp.keyWindow,
                                              let responder = keyWindow.firstResponder as? NSTextView,
                                              let textField = responder.delegate as? NSTextField {
                                        let tag = textField.tag
                                        let row = tag / totalColumns
                                        let col = tag % totalColumns
                                        copiedData = [[dataModel.getValue(row: row, column: col)]]
                                    }
                                }
                                Button("Paste") {
                                    if let selection = cellSelection {
                                        let minRow = min(selection.startRow, selection.endRow)
                                        let minCol = min(selection.startColumn, selection.endColumn)
                                        for (rIndex, rowData) in copiedData.enumerated() {
                                            for (cIndex, value) in rowData.enumerated() {
                                                let destRow = minRow + rIndex
                                                let destCol = minCol + cIndex
                                                if destRow < totalRows && destCol < totalColumns {
                                                    dataModel.updateCell(row: destRow, column: destCol, value: value)
                                                }
                                            }
                                        }
                                    } else if let keyWindow = NSApp.keyWindow,
                                              let responder = keyWindow.firstResponder as? NSTextView,
                                              let textField = responder.delegate as? NSTextField {
                                        let tag = textField.tag
                                        let row = tag / totalColumns
                                        let col = tag % totalColumns
                                        for (rIndex, rowData) in copiedData.enumerated() {
                                            for (cIndex, value) in rowData.enumerated() {
                                                let destRow = row + rIndex
                                                let destCol = col + cIndex
                                                if destRow < totalRows && destCol < totalColumns {
                                                    dataModel.updateCell(row: destRow, column: destCol, value: value)
                                                }
                                            }
                                        }
                                    }
                                }
                                Button("Undo") {
                                    dataModel.undo()
                                }
                                Button("Redo") {
                                    dataModel.redo()
                                }
                            }
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
                        saveSheet()
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
        .onReceive(NotificationCenter.default.publisher(for: Notification.Name("CellSelectionChanged"))) { notification in
            if let info = notification.userInfo,
               let startRow = info["startRow"] as? Int,
               let endRow = info["endRow"] as? Int,
               let startColumn = info["startColumn"] as? Int,
               let endColumn = info["endColumn"] as? Int {
                self.cellSelection = (startRow, endRow, startColumn, endColumn)
            } else {
                self.cellSelection = nil
            }
        }
        .onAppear {
            loadSheet()
            cmdFMonitor = NSEvent.addLocalMonitorForEvents(matching: .keyDown) { event in
                if event.modifierFlags.contains(.command) && event.charactersIgnoringModifiers?.lowercased() == "f" {
                    searchState = true
                    return nil
                }
                return event
            }
            undoRedoMonitor = NSEvent.addLocalMonitorForEvents(matching: .keyDown) { event in
                if event.modifierFlags.contains(.command) {
                    if event.charactersIgnoringModifiers?.lowercased() == "z" {
                        dataModel.undo()
                        return nil
                    } else if event.charactersIgnoringModifiers?.lowercased() == "y" {
                        dataModel.redo()
                        return nil
                    }
                }
                return event
            }
            
            keyBindMonitor = NSEvent.addLocalMonitorForEvents(matching: .keyDown) { event in
                if event.modifierFlags.contains(.command) {
                    
                    if let keyWindow = NSApp.keyWindow,
                       let responder = keyWindow.firstResponder as? NSTextView,
                       let textField = responder.delegate as? NSTextField,
                       textField.currentEditor() != nil {
                        return event
                    }
                    
                    if event.charactersIgnoringModifiers?.lowercased() == "s" {
                        saveSheet()
                        return nil
                    }
                    
                    if event.charactersIgnoringModifiers?.lowercased() == "a" {
                        NotificationCenter.default.post(name: Notification.Name("FullSheetSelection"), object: nil)
                        return nil
                    }
                    
                    if event.charactersIgnoringModifiers?.lowercased() == "c" {
                        if let selection = cellSelection {
                            let minRow = min(selection.startRow, selection.endRow)
                            let maxRow = max(selection.startRow, selection.endRow)
                            let minCol = min(selection.startColumn, selection.endColumn)
                            let maxCol = max(selection.startColumn, selection.endColumn)
                            
                            var buffer: [[String]] = []
                            for row in minRow...maxRow {
                                var rowBuffer: [String] = []
                                for col in minCol...maxCol {
                                    rowBuffer.append(dataModel.getValue(row: row, column: col))
                                }
                                buffer.append(rowBuffer)
                            }
                            copiedData = buffer
                        } else if let keyWindow = NSApp.keyWindow,
                                  let responder = keyWindow.firstResponder as? NSTextView,
                                  let textField = responder.delegate as? NSTextField {
                            let tag = textField.tag
                            let row = tag / totalColumns
                            let col = tag % totalColumns
                            copiedData = [[dataModel.getValue(row: row, column: col)]]
                        }
                        return nil
                    }
                    else if event.charactersIgnoringModifiers?.lowercased() == "x" {
                        if let selection = cellSelection {
                            let minRow = min(selection.startRow, selection.endRow)
                            let maxRow = max(selection.startRow, selection.endRow)
                            let minCol = min(selection.startColumn, selection.endColumn)
                            let maxCol = max(selection.startColumn, selection.endColumn)
                            
                            var buffer: [[String]] = []
                            for row in minRow...maxRow {
                                var rowBuffer: [String] = []
                                for col in minCol...maxCol {
                                    rowBuffer.append(dataModel.getValue(row: row, column: col))
                                }
                                buffer.append(rowBuffer)
                            }
                            copiedData = buffer
                            
                            for row in minRow...maxRow {
                                for col in minCol...maxCol {
                                    dataModel.updateCell(row: row, column: col, value: "")
                                }
                            }
                        } else if let keyWindow = NSApp.keyWindow,
                                  let responder = keyWindow.firstResponder as? NSTextView,
                                  let textField = responder.delegate as? NSTextField {
                            let tag = textField.tag
                            let row = tag / totalColumns
                            let col = tag % totalColumns
                            copiedData = [[dataModel.getValue(row: row, column: col)]]
                            dataModel.updateCell(row: row, column: col, value: "")
                        }
                        return nil
                    }
                    else if event.charactersIgnoringModifiers?.lowercased() == "v" {
                        if let selection = cellSelection {
                            let minRow = min(selection.startRow, selection.endRow)
                            let minCol = min(selection.startColumn, selection.endColumn)
                            for (rIndex, rowData) in copiedData.enumerated() {
                                for (cIndex, value) in rowData.enumerated() {
                                    let destRow = minRow + rIndex
                                    let destCol = minCol + cIndex
                                    if destRow < totalRows && destCol < totalColumns {
                                        dataModel.updateCell(row: destRow, column: destCol, value: value)
                                    }
                                }
                            }
                        } else if let keyWindow = NSApp.keyWindow,
                                  let responder = keyWindow.firstResponder as? NSTextView,
                                  let textField = responder.delegate as? NSTextField {
                            let tag = textField.tag
                            let row = tag / totalColumns
                            let col = tag % totalColumns
                            for (rIndex, rowData) in copiedData.enumerated() {
                                for (cIndex, value) in rowData.enumerated() {
                                    let destRow = row + rIndex
                                    let destCol = col + cIndex
                                    if destRow < totalRows && destCol < totalColumns {
                                        dataModel.updateCell(row: destRow, column: destCol, value: value)
                                    }
                                }
                            }
                        }
                        return nil
                    }
                }
                return event
            }
        }
        .onDisappear {
            if let monitor = cmdFMonitor {
                NSEvent.removeMonitor(monitor)
                cmdFMonitor = nil
            }
            if let monitor = undoRedoMonitor {
                NSEvent.removeMonitor(monitor)
                undoRedoMonitor = nil
            }
            if let monitor = keyBindMonitor {
                NSEvent.removeMonitor(monitor)
                keyBindMonitor = nil
            }
        }
    }
    
    private func saveSheet() {
        var lines: [String] = []
        for row in 0..<totalRows {
            var rowData: [String] = []
            for col in 0..<totalColumns {
                rowData.append(dataModel.getValue(row: row, column: col))
            }
            lines.append(rowData.joined(separator: ","))
        }
        let csv = lines.joined(separator: "\n")
        
        do {
            try csv.write(to: fileURL, atomically: true, encoding: .utf8)
            hasUnsavedChanges = false
        } catch {
            return
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

    private func performSearch() {
        searchMatches.removeAll()
        let query = searchCaseSensitive ? searchQuery : searchQuery.lowercased()

        if query.isEmpty {
            totalSearchMatches = 0
            currentSearchMatch = 0
            postSearchUpdate()
            return
        }

        for row in 0..<totalRows {
            for col in 0..<totalColumns {
                let value = dataModel.getValue(row: row, column: col)
                let target = searchCaseSensitive ? value : value.lowercased()
                if target.contains(query) {
                    searchMatches.append((row: row, column: col))
                }
            }
        }

        totalSearchMatches = searchMatches.count
        currentSearchMatch = totalSearchMatches > 0 ? 1 : 0
        postSearchUpdate()
    }

    private func postSearchUpdate() {
        NotificationCenter.default.post(
            name: Notification.Name("SearchResultsUpdated"),
            object: nil,
            userInfo: [
                "matches": searchMatches,
                "currentIndex": currentSearchMatch > 0 ? (currentSearchMatch - 1) : -1
            ]
        )
    }

    private func clearSearchResults() {
        searchMatches.removeAll()
        totalSearchMatches = 0
        currentSearchMatch = 0
        NotificationCenter.default.post(
            name: Notification.Name("SearchResultsUpdated"),
            object: nil,
            userInfo: [
                "matches": [],
                "currentIndex": -1
            ]
        )
    }
}

fileprivate struct RowNumbers: NSViewRepresentable {
    let rowHeight: CGFloat
    let rowNumberWidth: CGFloat
    let totalRows: Int
    @Binding var verticalOffset: CGFloat
    let selectedRange: (startRow: Int, endRow: Int)?

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
            
            let isSelected = selectedRange != nil && (row >= selectedRange!.startRow && row <= selectedRange!.endRow)
            container.layer?.backgroundColor = isSelected ? NSColor(hex: 0x2F2F2F).cgColor : NSColor(hex: 0x212121).cgColor
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
        
        let overlay = RowNumberOverlay(frame: contentView.bounds, totalRows: totalRows, rowHeight: rowHeight)
        overlay.autoresizingMask = [.width, .height]
        contentView.addSubview(overlay)
        
        return scrollView
    }

    func updateNSView(_ nsView: NSScrollView, context: Context) {
        let currentY = nsView.contentView.bounds.origin.y
        if abs(currentY - verticalOffset) > 0.1 {
            nsView.contentView.scroll(to: NSPoint(x: 0, y: verticalOffset))
        }
        if let contentView = nsView.documentView {
            for subview in contentView.subviews {
                if subview is RowNumberOverlay { continue }
                let rowIndex = totalRows - 1 - Int(subview.frame.origin.y / rowHeight)
                let isSelected = selectedRange != nil && (rowIndex >= selectedRange!.startRow && rowIndex <= selectedRange!.endRow)
                subview.layer?.backgroundColor = isSelected ? NSColor(hex: 0x2F2F2F).cgColor : NSColor(hex: 0x212121).cgColor
            }
        }
    }
}

private class RowNumberOverlay: NSView {
    let totalRows: Int
    let rowHeight: CGFloat
    var startRow: Int?
    
    init(frame frameRect: NSRect, totalRows: Int, rowHeight: CGFloat) {
        self.totalRows = totalRows
        self.rowHeight = rowHeight
        super.init(frame: frameRect)
        self.wantsLayer = true
        self.layer?.backgroundColor = NSColor.clear.cgColor
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func updateTrackingAreas() {
        super.updateTrackingAreas()
        for trackingArea in self.trackingAreas {
            self.removeTrackingArea(trackingArea)
        }
        let options: NSTrackingArea.Options = [.mouseEnteredAndExited, .mouseMoved, .activeInKeyWindow, .inVisibleRect, .enabledDuringMouseDrag]
        let trackingArea = NSTrackingArea(rect: self.bounds, options: options, owner: self, userInfo: nil)
        self.addTrackingArea(trackingArea)
    }
    
    override func mouseDown(with event: NSEvent) {
        let point = convert(event.locationInWindow, from: nil)
        let row = totalRows - 1 - Int(point.y / rowHeight)
        let isShift = event.modifierFlags.contains(.shift)
        NotificationCenter.default.post(name: Notification.Name("RowHeaderSelectionChanged"), object: nil, userInfo: ["phase": "down", "endRow": row, "shift": isShift])
        startRow = row
    }
    
    override func mouseDragged(with event: NSEvent) {
        let point = convert(event.locationInWindow, from: nil)
        let currentRow = totalRows - 1 - Int(point.y / rowHeight)
        let isShift = event.modifierFlags.contains(.shift)
        NotificationCenter.default.post(name: Notification.Name("RowHeaderSelectionChanged"), object: nil, userInfo: ["phase": "drag", "endRow": currentRow, "shift": isShift])
    }
    
    override func mouseUp(with event: NSEvent) {
        let point = convert(event.locationInWindow, from: nil)
        let endRow = totalRows - 1 - Int(point.y / rowHeight)
        let isShift = event.modifierFlags.contains(.shift)
        NotificationCenter.default.post(name: Notification.Name("RowHeaderSelectionChanged"), object: nil, userInfo: ["phase": "up", "endRow": endRow, "shift": isShift])
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

        let overlay = ColumnHeaderOverlay(frame: hostingView.frame, totalColumns: totalColumns, cellWidth: 100)
        overlay.autoresizingMask = [.width, .height]
        scrollView.contentView.addSubview(overlay, positioned: .above, relativeTo: hostingView)
        
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

private class ColumnHeaderOverlay: NSView {
    let totalColumns: Int
    let cellWidth: CGFloat
    var startColumn: Int?
    
    init(frame frameRect: NSRect, totalColumns: Int, cellWidth: CGFloat) {
        self.totalColumns = totalColumns
        self.cellWidth = cellWidth
        super.init(frame: frameRect)
        self.wantsLayer = true
        self.layer?.backgroundColor = NSColor.clear.cgColor
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func updateTrackingAreas() {
        super.updateTrackingAreas()
        for trackingArea in self.trackingAreas {
            self.removeTrackingArea(trackingArea)
        }
        let options: NSTrackingArea.Options = [.mouseEnteredAndExited, .mouseMoved, .activeInKeyWindow, .inVisibleRect, .enabledDuringMouseDrag]
        let trackingArea = NSTrackingArea(rect: self.bounds, options: options, owner: self, userInfo: nil)
        self.addTrackingArea(trackingArea)
    }
    
    override func hitTest(_ point: NSPoint) -> NSView? {
        return self
    }
    
    override func acceptsFirstMouse(for event: NSEvent?) -> Bool {
        return true
    }
    
    override func mouseDown(with event: NSEvent) {
        let point = convert(event.locationInWindow, from: nil)
        let column = Int(point.x / cellWidth)
        let isShift = event.modifierFlags.contains(.shift)
        NotificationCenter.default.post(name: Notification.Name("ColumnHeaderSelectionChanged"), object: nil, userInfo: ["phase": "down", "endColumn": column, "shift": isShift])
        startColumn = column
    }
    
    override func mouseDragged(with event: NSEvent) {
        let point = convert(event.locationInWindow, from: nil)
        let currentColumn = Int(point.x / cellWidth)
        let isShift = event.modifierFlags.contains(.shift)
        NotificationCenter.default.post(name: Notification.Name("ColumnHeaderSelectionChanged"), object: nil, userInfo: ["phase": "drag", "endColumn": currentColumn, "shift": isShift])
    }
    
    override func mouseUp(with event: NSEvent) {
        let point = convert(event.locationInWindow, from: nil)
        let endColumn = Int(point.x / cellWidth)
        let isShift = event.modifierFlags.contains(.shift)
        NotificationCenter.default.post(name: Notification.Name("ColumnHeaderSelectionChanged"), object: nil, userInfo: ["phase": "up", "endColumn": endColumn, "shift": isShift])
    }
}

fileprivate struct DataTableGrid: NSViewRepresentable {
    @ObservedObject var dataModel: DataTableModel
    let rowHeight: CGFloat
    let totalRows: Int
    let totalColumns: Int
    @Binding var horizontalOffset: CGFloat
    @Binding var verticalOffset: CGFloat
    @Binding var hasUnsavedChanges: Bool

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
            totalColumns: totalColumns,
            hasUnsavedChanges: $hasUnsavedChanges
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
    private var hasUnsavedChanges: Binding<Bool>
    private var textFields: [[NSTextField]] = []
    private var gridOverlay: DataGridOverlay!
    private var activeCell: (row: Int, column: Int)? = nil
    private var maybeSingleClickCell: (row: Int, col: Int)?
    private var userActuallyDragged = false
    var selectionStart: (row: Int, column: Int)?
    var selectionEnd: (row: Int, column: Int)?
    private var rowHeaderSelectionAnchor: Int?
    private var columnHeaderSelectionAnchor: Int?
    private var selectionView: NSView?
    private var resizeHandler: ResizeHandler?
    private var isResizingSelection: Bool = false
    private var isDraggingSelection: Bool = false
    private var dragStartPoint: NSPoint?
    private var originalSelectionStart: (row: Int, column: Int)?
    private var originalSelectionEnd: (row: Int, column: Int)?
    private var originalSelectionData: [[String]]?
    private var searchMatches: [(row: Int, column: Int)] = []
    private var currentSearchIndex: Int = -1

    init(frame frameRect: NSRect, dataModel: DataTableModel, rowHeight: CGFloat, totalRows: Int, totalColumns: Int, hasUnsavedChanges: Binding<Bool>) {
        self.dataModel = dataModel
        self.rowHeight = rowHeight
        self.totalRows = totalRows
        self.totalColumns = totalColumns
        self.hasUnsavedChanges = hasUnsavedChanges
        super.init(frame: frameRect)
        
        setupTable()
        
        gridOverlay = DataGridOverlay(frame: self.bounds, totalRows: totalRows, totalColumns: totalColumns, rowHeight: rowHeight)
        gridOverlay.autoresizingMask = [.width, .height]
        gridOverlay.wantsLayer = true
        gridOverlay.layer?.zPosition = 1
        addSubview(gridOverlay)
        
        NotificationCenter.default.addObserver(self, selector: #selector(handleRowHeaderSelection(_:)), name: Notification.Name("RowHeaderSelectionChanged"), object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(handleColumnHeaderSelection(_:)), name: Notification.Name("ColumnHeaderSelectionChanged"), object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(handleFullSheetSelection(_:)), name: Notification.Name("FullSheetSelection"), object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(handleSearchResultsUpdated(_:)), name: Notification.Name("SearchResultsUpdated"), object: nil)
        
        self.addTrackingArea(NSTrackingArea(rect: self.bounds, options: [.mouseEnteredAndExited, .activeAlways, .mouseMoved], owner: self, userInfo: nil))
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    @objc private func handleSearchResultsUpdated(_ notification: Notification) {
        guard let info = notification.userInfo else { return }
        let newMatches = info["matches"] as? [(Int, Int)] ?? []
        let newIndex = info["currentIndex"] as? Int ?? -1
        
        self.searchMatches = newMatches
        self.currentSearchIndex = newIndex
        updateCellHighlight()
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
                let textField = CellTextField(frame: textFieldFrame)
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
                textField.isEnabled = true
                container.addSubview(textField)
                addSubview(container)
                rowFields.append(textField)
            }
            textFields.append(rowFields)
        }
        updateCellHighlight()
    }
    
    override func mouseDown(with event: NSEvent) {
        userActuallyDragged = false
        maybeSingleClickCell = nil
        
        if let a = activeCell {
            window?.makeFirstResponder(nil)
            activeCell = nil
            updateCellHighlight()
        }
        
        let globalPoint = event.locationInWindow
        let localPoint = convert(globalPoint, from: nil)
        
        if let selView = selectionView, let resizeHandler = resizeHandler {
            let pointInSel = selView.convert(globalPoint, from: nil)
            if resizeHandler.frame.contains(pointInSel) {
                isResizingSelection = true
                return
            }
        }
        
        if let selView = selectionView {
            if selView.frame.contains(localPoint) {
                let pointInSel = selView.convert(globalPoint, from: nil)
                if selView.bounds.insetBy(dx: 4, dy: 4).contains(pointInSel) {
                    isDraggingSelection = true
                    dragStartPoint = localPoint
                    originalSelectionStart = selectionStart
                    originalSelectionEnd = selectionEnd
                    if let selStart = selectionStart, let selEnd = selectionEnd {
                        let minRow = min(selStart.row, selEnd.row)
                        let maxRow = max(selStart.row, selEnd.row)
                        let minCol = min(selStart.column, selEnd.column)
                        let maxCol = max(selStart.column, selEnd.column)
                        originalSelectionData = []
                        for r in minRow...maxRow {
                            var rowData: [String] = []
                            for c in minCol...maxCol {
                                rowData.append(dataModel.getValue(row: r, column: c))
                            }
                            originalSelectionData?.append(rowData)
                        }
                    }
                    return
                }
            }
        }
        
        guard let (row, col) = cellIndex(at: localPoint) else {
            clearSelection()
            return
        }
        
        if event.clickCount == 1 && !event.modifierFlags.contains(.shift) {
            maybeSingleClickCell = (row, col)
        } else {
            handleCellClick(row: row, column: col, event: event)
        }
    }
    
    override func mouseDragged(with event: NSEvent) {
        if !userActuallyDragged, let (row, col) = maybeSingleClickCell {
            maybeSingleClickCell = nil
            handleCellClick(row: row, column: col, event: event)
            userActuallyDragged = true
        }
        
        let localPoint = convert(event.locationInWindow, from: nil)
        
        if isDraggingSelection {
            let dx = localPoint.x - (dragStartPoint?.x ?? 0)
            let dy = localPoint.y - (dragStartPoint?.y ?? 0)
            let deltaCol = Int(round(dx / 100))
            let deltaRow = -Int(round(dy / rowHeight))
            if let origStart = originalSelectionStart, let origEnd = originalSelectionEnd {
                var newStartRow = origStart.row + deltaRow
                var newEndRow = origEnd.row + deltaRow
                var newStartCol = origStart.column + deltaCol
                var newEndCol = origEnd.column + deltaCol
                if newStartRow < 0 {
                    newStartRow = 0
                    newEndRow = newStartRow + (origEnd.row - origStart.row)
                }
                if newEndRow >= totalRows {
                    newEndRow = totalRows - 1
                    newStartRow = newEndRow - (origEnd.row - origStart.row)
                }
                if newStartCol < 0 {
                    newStartCol = 0
                    newEndCol = newStartCol + (origEnd.column - origStart.column)
                }
                if newEndCol >= totalColumns {
                    newEndCol = totalColumns - 1
                    newStartCol = newEndCol - (origEnd.column - origStart.column)
                }
                selectionStart = (newStartRow, newStartCol)
                selectionEnd = (newEndRow, newEndCol)
                updateCellHighlight()
                updateSelectionViewFrame()
            }
            return
        }
        
        if let (row, col) = cellIndex(at: localPoint), let anchor = selectionStart, let currentEnd = selectionEnd {
            if event.modifierFlags.contains(.shift) {
                if anchor.column == 0 && currentEnd.column == totalColumns - 1 {
                    selectionEnd = (row, totalColumns - 1)
                } else if anchor.row == 0 && currentEnd.row == totalRows - 1 {
                    selectionEnd = (totalRows - 1, col)
                } else {
                    selectionEnd = (row, col)
                }
            } else {
                selectionEnd = (row, col)
            }
            updateCellHighlight()
            updateSelectionViewFrame()
        }
        
        userActuallyDragged = true
    }
    
    override func mouseUp(with event: NSEvent) {
        if isResizingSelection {
            isResizingSelection = false
        }
        if isDraggingSelection {
            if let origStart = originalSelectionStart,
               let origEnd = originalSelectionEnd,
               let origData = originalSelectionData,
               let selStart = selectionStart,
               let selEnd = selectionEnd {
                let origMinRow = min(origStart.row, origEnd.row)
                let origMaxRow = max(origStart.row, origEnd.row)
                let origMinCol = min(origStart.column, origEnd.column)
                let origMaxCol = max(origStart.column, origEnd.column)
                let newMinRow = min(selStart.row, selEnd.row)
                let newMaxRow = max(selStart.row, selEnd.row)
                let newMinCol = min(selStart.column, selEnd.column)
                let newMaxCol = max(selStart.column, selEnd.column)
                
                if (origMaxRow - origMinRow) == (newMaxRow - newMinRow) && (origMaxCol - origMinCol) == (newMaxCol - newMinCol) {
                    for r in 0..<(origMaxRow - origMinRow + 1) {
                        for c in 0..<(origMaxCol - origMinCol + 1) {
                            dataModel.updateCell(row: newMinRow + r, column: newMinCol + c, value: origData[r][c])
                        }
                    }
                    
                    if !(origMinRow == newMinRow && origMinCol == newMinCol) {
                        for r in origMinRow...origMaxRow {
                            for c in origMinCol...origMaxCol {
                                if r < newMinRow || r > newMaxRow || c < newMinCol || c > newMaxCol {
                                    dataModel.updateCell(row: r, column: c, value: "")
                                }
                            }
                        }
                    }
                }
            }
            isDraggingSelection = false
            dragStartPoint = nil
            originalSelectionStart = nil
            originalSelectionEnd = nil
            originalSelectionData = nil
            return
        }
        
        if let (row, col) = maybeSingleClickCell, !userActuallyDragged {
            maybeSingleClickCell = nil
            clearSelection()
            activateCell(row: row, column: col)
            updateCellHighlight()
            return
        }
        
        if let s = selectionStart, let e = selectionEnd,
           (s.row != e.row || s.column != e.column) {
            activeCell = nil
            window?.makeFirstResponder(nil)
            updateCellHighlight()
        }
    }
    
    func handleCellClick(row: Int, column: Int, event: NSEvent) {
        if let a = activeCell {
            window?.makeFirstResponder(nil)
            activeCell = nil
        }
        
        if event.modifierFlags.contains(.shift), let anchor = selectionStart, let currentEnd = selectionEnd {
            if anchor.column == 0 && currentEnd.column == totalColumns - 1 {
                selectionEnd = (row, totalColumns - 1)
            } else if anchor.row == 0 && currentEnd.row == totalRows - 1 {
                selectionEnd = (totalRows - 1, column)
            } else {
                selectionEnd = (row, column)
            }
        } else {
            clearSelection()
            selectionStart = (row, column)
            selectionEnd = (row, column)
        }
        
        updateCellHighlight()
        
        selectionView?.removeFromSuperview()
        let selView = DraggableSelectionView(frame: .zero)
        selView.wantsLayer = true
        selView.layer?.backgroundColor = NSColor(red: 0, green: 0.5, blue: 0, alpha: 0.2).cgColor
        selView.layer?.borderColor = NSColor.green.cgColor
        selView.layer?.borderWidth = 2
        self.selectionView = selView
        self.addSubview(selView, positioned: .above, relativeTo: nil)
        
        resizeHandler?.removeFromSuperview()
        let handler = ResizeHandler(frame: NSRect(x: 0, y: 0, width: 16, height: 16))
        handler.wantsLayer = true
        handler.layer?.backgroundColor = NSColor.green.cgColor
        resizeHandler = handler
        selView.addSubview(handler)
        
        updateSelectionViewFrame()
    }
    
    func activateCell(row: Int, column: Int) {
        clearSelection()
        
        if let old = activeCell, (old.row != row || old.column != column) {
            window?.makeFirstResponder(nil)
        }
        activeCell = (row, column)
        let newTag = row * totalColumns + column
        if newTag < textFields.flatMap({ $0 }).count {
            let newField = textFields[row][column]
            window?.makeFirstResponder(newField)
        }
    }
    
    private func cellIndex(at point: NSPoint) -> (Int, Int)? {
        let col = Int(point.x / 100)
        let row = totalRows - 1 - Int(point.y / rowHeight)
        if col >= 0 && col < totalColumns && row >= 0 && row < totalRows {
            return (row, col)
        }
        return nil
    }
    
    override var isFlipped: Bool {
        return false
    }
    
    private func updateSelectionViewFrame() {
        guard let start = selectionStart, let end = selectionEnd, let selView = selectionView else { return }
        let minRow = min(start.row, end.row)
        let maxRow = max(start.row, end.row)
        let minCol = min(start.column, end.column)
        let maxCol = max(start.column, end.column)
        
        let x = CGFloat(minCol) * 100
        let width = CGFloat(maxCol - minCol + 1) * 100
        let y = CGFloat(totalRows - 1 - maxRow) * rowHeight
        let height = CGFloat(maxRow - minRow + 1) * rowHeight
        
        let newFrame = NSRect(x: x, y: y, width: width, height: height)
        selView.frame = newFrame
        
        let handlerSize: CGFloat = 16
        resizeHandler?.frame = NSRect(
            x: selView.bounds.width - handlerSize/2,
            y: -handlerSize/2,
            width: handlerSize,
            height: handlerSize
        )
    }
    
    private func updateCellHighlight() {
        for row in 0..<totalRows {
            for col in 0..<totalColumns {
                let textField = textFields[row][col]
                let container = textField.superview!
                
                if let active = activeCell, active.row == row && active.column == col {
                    container.layer?.backgroundColor = NSColor(red: 0, green: 0.5, blue: 0, alpha: 0.2).cgColor
                    container.layer?.borderColor = NSColor.green.cgColor
                    container.layer?.borderWidth = 2
                    continue
                }
                
                if let start = selectionStart, let end = selectionEnd {
                    let minRow = min(start.row, end.row)
                    let maxRow = max(start.row, end.row)
                    let minCol = min(start.column, end.column)
                    let maxCol = max(start.column, end.column)
                    
                    if row >= minRow && row <= maxRow && col >= minCol && col <= maxCol {
                        container.layer?.backgroundColor = NSColor(red: 0, green: 0.5, blue: 0, alpha: 0.2).cgColor
                        container.layer?.borderColor = NSColor.clear.cgColor
                        container.layer?.borderWidth = 0
                        continue
                    }
                }
                
                if let index = searchMatches.firstIndex(where: { $0.row == row && $0.column == col }) {
                    if index == currentSearchIndex {
                        container.layer?.backgroundColor = NSColor.systemOrange.withAlphaComponent(0.25).cgColor
                        container.layer?.borderColor = NSColor.orange.cgColor
                        container.layer?.borderWidth = 2
                    } else {
                        container.layer?.backgroundColor = NSColor.systemOrange.withAlphaComponent(0.15).cgColor
                        container.layer?.borderColor = NSColor.clear.cgColor
                        container.layer?.borderWidth = 0
                    }
                    continue
                }
                
                container.layer?.backgroundColor = NSColor(hex: 0x181818).cgColor
                container.layer?.borderColor = NSColor.gray.withAlphaComponent(0.5).cgColor
                container.layer?.borderWidth = 0.5
            }
        }
        
        if let start = selectionStart, let end = selectionEnd {
            let minRow = min(start.row, end.row)
            let maxRow = max(start.row, end.row)
            let minCol = min(start.column, end.column)
            let maxCol = max(start.column, end.column)
            NotificationCenter.default.post(name: Notification.Name("CellSelectionChanged"), object: nil, userInfo: [
                "startRow": minRow,
                "endRow": maxRow,
                "startColumn": minCol,
                "endColumn": maxCol
            ])
        } else {
            NotificationCenter.default.post(name: Notification.Name("CellSelectionChanged"), object: nil, userInfo: nil)
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
        updateCellHighlight()
    }
    
    func clearSelection() {
        selectionStart = nil
        selectionEnd = nil
        selectionView?.removeFromSuperview()
        selectionView = nil
        resizeHandler = nil
        updateCellHighlight()
    }
    
    @objc func handleRowHeaderSelection(_ notification: Notification) {
        guard let userInfo = notification.userInfo,
              let clickedRow = userInfo["endRow"] as? Int,
              let phase = userInfo["phase"] as? String else { return }
        let isShift = userInfo["shift"] as? Bool ?? false
        
        if let a = activeCell {
            window?.makeFirstResponder(nil)
            activeCell = nil
        }
        
        if phase == "down" {
            if !isShift {
                rowHeaderSelectionAnchor = clickedRow
            } else if rowHeaderSelectionAnchor == nil {
                rowHeaderSelectionAnchor = clickedRow
            }
        }
        
        guard let anchorRow = rowHeaderSelectionAnchor else { return }
        let minRow = min(anchorRow, clickedRow)
        let maxRow = max(anchorRow, clickedRow)
        selectionStart = (minRow, 0)
        selectionEnd = (maxRow, totalColumns - 1)
        selectionView?.removeFromSuperview()
        let selView = DraggableSelectionView(frame: .zero)
        selView.wantsLayer = true
        selView.layer?.backgroundColor = NSColor(red: 0, green: 0.5, blue: 0, alpha: 0.2).cgColor
        selView.layer?.borderColor = NSColor.green.cgColor
        selView.layer?.borderWidth = 2
        selectionView = selView
        addSubview(selView, positioned: .above, relativeTo: nil)
        resizeHandler?.removeFromSuperview()
        let handler = ResizeHandler(frame: NSRect(x: 0, y: 0, width: 16, height: 16))
        handler.wantsLayer = true
        handler.layer?.backgroundColor = NSColor.green.cgColor
        resizeHandler = handler
        selView.addSubview(handler)
        
        updateCellHighlight()
        updateSelectionViewFrame()
    }
    
    @objc func handleColumnHeaderSelection(_ notification: Notification) {
        guard let userInfo = notification.userInfo,
              let clickedCol = userInfo["endColumn"] as? Int,
              let phase = userInfo["phase"] as? String else { return }
        let isShift = userInfo["shift"] as? Bool ?? false
        
        if let a = activeCell {
            window?.makeFirstResponder(nil)
            activeCell = nil
        }
        
        if phase == "down" {
            if !isShift {
                columnHeaderSelectionAnchor = clickedCol
            } else if columnHeaderSelectionAnchor == nil {
                columnHeaderSelectionAnchor = clickedCol
            }
        }
        
        guard let anchorCol = columnHeaderSelectionAnchor else { return }
        let minCol = min(anchorCol, clickedCol)
        let maxCol = max(anchorCol, clickedCol)
        selectionStart = (0, minCol)
        selectionEnd = (totalRows - 1, maxCol)
        selectionView?.removeFromSuperview()
        let selView = DraggableSelectionView(frame: .zero)
        selView.wantsLayer = true
        selView.layer?.backgroundColor = NSColor(red: 0, green: 0.5, blue: 0, alpha: 0.2).cgColor
        selView.layer?.borderColor = NSColor.green.cgColor
        selView.layer?.borderWidth = 2
        selectionView = selView
        addSubview(selView, positioned: .above, relativeTo: nil)
        resizeHandler?.removeFromSuperview()
        let handler = ResizeHandler(frame: NSRect(x: 0, y: 0, width: 16, height: 16))
        handler.wantsLayer = true
        handler.layer?.backgroundColor = NSColor.green.cgColor
        resizeHandler = handler
        selView.addSubview(handler)
        
        updateCellHighlight()
        updateSelectionViewFrame()
    }
    
    @objc func handleFullSheetSelection(_ notification: Notification) {
        if let a = activeCell {
            window?.makeFirstResponder(nil)
            activeCell = nil
        }
        
        selectionStart = (0, 0)
        selectionEnd = (totalRows - 1, totalColumns - 1)
        
        selectionView?.removeFromSuperview()
        let selView = DraggableSelectionView(frame: .zero)
        selView.wantsLayer = true
        selView.layer?.backgroundColor = NSColor(red: 0, green: 0.5, blue: 0, alpha: 0.2).cgColor
        selView.layer?.borderColor = NSColor.green.cgColor
        selView.layer?.borderWidth = 2
        selectionView = selView
        addSubview(selView, positioned: .above, relativeTo: nil)
        resizeHandler?.removeFromSuperview()
        let handler = ResizeHandler(frame: NSRect(x: 0, y: 0, width: 16, height: 16))
        handler.wantsLayer = true
        handler.layer?.backgroundColor = NSColor.green.cgColor
        resizeHandler = handler
        selView.addSubview(handler)
        
        updateCellHighlight()
        updateSelectionViewFrame()
    }
    
    override var acceptsFirstResponder: Bool {
        return true
    }
    
    override func keyDown(with event: NSEvent) {
        guard let active = activeCell else {
            super.keyDown(with: event)
            return
        }
        let key = event.keyCode
        var newRow = active.row
        var newCol = active.column
        switch key {
        case 123:
            newCol = max(0, active.column - 1)
        case 124:
            newCol = min(totalColumns - 1, active.column + 1)
        case 125:
            newRow = min(totalRows - 1, active.row + 1)
        case 126:
            newRow = max(0, active.row - 1)
        case 48:
            newCol = min(totalColumns - 1, active.column + 1)
        case 36, 76:
            newRow = min(totalRows - 1, active.row + 1)
        default:
            super.keyDown(with: event)
            return
        }
        activeCell = (newRow, newCol)
        updateCellHighlight()
        let newTag = newRow * totalColumns + newCol
        if newTag < textFields.flatMap({ $0 }).count {
            let newField = textFields[newRow][newCol]
            window?.makeFirstResponder(newField)
        }
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
    }
}

extension DataTableWrapper: NSTextFieldDelegate {
    func controlTextDidBeginEditing(_ obj: Notification) {
        guard let textField = obj.object as? NSTextField else { return }
        let tag = textField.tag
        let row = tag / totalColumns
        let col = tag % totalColumns
        if selectionStart != nil || selectionEnd != nil {
            clearSelection()
        }
        activeCell = (row, col)
        updateCellHighlight()
    }
    
    func controlTextDidEndEditing(_ obj: Notification) {
        guard let textField = obj.object as? NSTextField else { return }
        let tag = textField.tag
        let row = tag / totalColumns
        let col = tag % totalColumns
        dataModel.updateCell(row: row, column: col, value: textField.stringValue)
        hasUnsavedChanges.wrappedValue = true
    }
    
    func control(_ control: NSControl, textView: NSTextView, doCommandBy commandSelector: Selector) -> Bool {
        guard let current = activeCell else { return false }
        var newRow = current.row
        var newCol = current.column
        
        if commandSelector == #selector(NSResponder.moveLeft(_:)) {
            if textView.selectedRange().location > 0 {
                return false
            }
            newCol = max(0, current.column - 1)
        } else if commandSelector == #selector(NSResponder.moveRight(_:)) {
            let textLength = textView.string.count
            if textView.selectedRange().location < textLength {
                return false
            }
            newCol = min(totalColumns - 1, current.column + 1)
        } else if commandSelector == #selector(NSResponder.moveUp(_:)) {
            newRow = max(0, current.row - 1)
        } else if commandSelector == #selector(NSResponder.moveDown(_:)) {
            newRow = min(totalRows - 1, current.row + 1)
        } else if commandSelector == #selector(NSResponder.insertTab(_:)) {
            newCol = min(totalColumns - 1, current.column + 1)
        } else if commandSelector == #selector(NSResponder.insertNewline(_:)) {
            newRow = min(totalRows - 1, current.row + 1)
        } else {
            return false
        }
        
        activeCell = (newRow, newCol)
        updateCellHighlight()
        let newTag = newRow * totalColumns + newCol
        if newTag < textFields.flatMap({ $0 }).count {
            let newField = textFields[newRow][newCol]
            window?.makeFirstResponder(newField)
        }
        return true
    }
}

private class DataTableModel: ObservableObject {
    private var data: [[String]]
    private let rows: Int
    private let columns: Int
    private let undoManager = UndoManager()
    
    init(rows: Int, columns: Int) {
        self.rows = rows
        self.columns = columns
        self.data = Array(repeating: Array(repeating: "", count: columns), count: rows)
        self.undoManager.levelsOfUndo = 0
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
        let oldValue = data[row][column]
        if oldValue == value { return }
        data[row][column] = value
        undoManager.registerUndo(withTarget: self) { target in
            target.updateCell(row: row, column: column, value: oldValue)
        }
        objectWillChange.send()
    }
    
    func undo() {
        undoManager.undo()
        objectWillChange.send()
    }
    
    func redo() {
        undoManager.redo()
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

private class ResizeHandler: NSView {
    override func resetCursorRects() {
        super.resetCursorRects()
        addCursorRect(bounds, cursor: .crosshair)
    }
}

private class DraggableSelectionView: NSView {
    override func resetCursorRects() {
        super.resetCursorRects()
        addCursorRect(bounds, cursor: NSCursor.openHand)
    }
    override func mouseDown(with event: NSEvent) {
         self.superview?.mouseDown(with: event)
    }
    override func mouseDragged(with event: NSEvent) {
         self.superview?.mouseDragged(with: event)
    }
    override func mouseUp(with event: NSEvent) {
         self.superview?.mouseUp(with: event)
    }
}

class CellTextField: NSTextField {
    override func keyDown(with event: NSEvent) {
        let keysToForward: Set<UInt16> = [123, 124, 125, 126, 36, 76]
        if keysToForward.contains(event.keyCode) {
            if let container = self.superview, let tableWrapper = container.superview as? DataTableWrapper {
                tableWrapper.keyDown(with: event)
                return
            }
        }
        super.keyDown(with: event)
    }
    
    override func mouseDown(with event: NSEvent) {
        if event.clickCount == 2 {
            super.mouseDown(with: event)
            return
        }
        
        if let container = self.superview {
            container.mouseDown(with: event)
        }
    }
    override func mouseDragged(with event: NSEvent) {
        if let container = self.superview {
            container.mouseDragged(with: event)
        } else {
            super.mouseDragged(with: event)
        }
    }
    override func mouseUp(with event: NSEvent) {
        if let container = self.superview {
            container.mouseUp(with: event)
        } else {
            super.mouseUp(with: event)
        }
    }
}
