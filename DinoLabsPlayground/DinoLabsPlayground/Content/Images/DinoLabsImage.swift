//
//  DinoLabsImage.swift
//
//  Created by Peter Iacobelli on 3/4/25.
//

import SwiftUI

struct ImageView: View {
    let geometry: GeometryProxy
    let fileURL: URL
    @Binding var hasUnsavedChanges: Bool
    @Binding var leftPanelWidthRatio: CGFloat
    
    @State private var xPos: String = "0.0"
    @State private var yPos: String = "0.0"
    @State private var imageWidth: String = "0.0"
    @State private var imageHeight: String = "0.0"
    @State private var preserveAspectRatio: Bool = true {
        didSet {
            hasUnsavedChanges = true
        }
    }
    @State private var isCropping: Bool = false
    @State private var isCircleCropping: Bool = false
    @State private var imageSize: CGSize = .zero
    @State private var originalAspectRatio: CGFloat = 1.0
    @State private var lastDragPosition: CGPoint?
    @State private var imagePosition: CGPoint = .zero
    @State private var initialDragImageSize: CGSize?
    @State private var initialDragImagePosition: CGPoint?

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 0) {
                VStack(spacing: 0) {
                    VStack(spacing: 0) {
                        HStack(spacing: 0) {
                            Image(systemName: "photo.fill")
                                .resizable()
                                .scaledToFit()
                                .frame(width: 15, height: 15)
                                .font(.system(size: 15, weight: .semibold))
                                .padding(.leading, 12)
                                .padding(.trailing, 8)
                            
                            Text("Layout")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(Color(hex: 0xc1c1c1))
                            
                            Spacer()
                            
                            HStack(spacing: 12) {
                                ImageButtonMain {
                                    
                                }
                                .containerHelper(backgroundColor: Color(hex: 0x515151),
                                                 borderColor: Color(hex: 0x616161),
                                                 borderWidth: 1,
                                                 topLeft: 2, topRight: 2,
                                                 bottomLeft: 2, bottomRight: 2,
                                                 shadowColor: Color.white.opacity(0.5),
                                                 shadowRadius: 1,
                                                 shadowX: 0, shadowY: 0)
                                .frame(width: 20, height: 20)
                                .overlay(
                                    Image(systemName: "arrow.clockwise")
                                        .font(.system(size: 10, weight: .semibold))
                                        .foregroundColor(Color(hex: 0xf5f5f5).opacity(0.8))
                                        .allowsHitTesting(false)
                                )
                                .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                                
                                ImageButtonMain {
                                    
                                }
                                .containerHelper(backgroundColor: Color(hex: 0x515151),
                                                 borderColor: Color(hex: 0x616161),
                                                 borderWidth: 1,
                                                 topLeft: 2, topRight: 2,
                                                 bottomLeft: 2, bottomRight: 2,
                                                 shadowColor: Color.white.opacity(0.5),
                                                 shadowRadius: 1,
                                                 shadowX: 0, shadowY: 0)
                                .frame(width: 20, height: 20)
                                .overlay(
                                    Image(systemName: "square.and.arrow.up")
                                        .font(.system(size: 10, weight: .semibold))
                                        .foregroundColor(Color(hex: 0xf5f5f5).opacity(0.8))
                                        .allowsHitTesting(false)
                                )
                                .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                            }
                            .padding(.trailing, 12)
                        }
                        .padding(.top, 15)
                        .padding(.bottom, 12)
                        .containerHelper(
                            backgroundColor: Color(hex: 0x121212),
                            borderColor: .clear,
                            borderWidth: 0,
                            topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0,
                            shadowColor: .clear,
                            shadowRadius: 0,
                            shadowX: 0,
                            shadowY: 0
                        )
                            
                        HStack {
                            Spacer()
                            VStack(alignment: .leading, spacing: 0) {
                                HStack {
                                    Text("Position")
                                        .font(.system(size: 9, weight: .semibold))
                                        .foregroundColor(Color(hex: 0xc1c1c1))
                                        .padding(.leading, 2)
                                    Spacer()
                                }
                                .frame(width: (geometry.size.width * (1 - leftPanelWidthRatio) * 0.3) * 0.9)
                                .padding(.bottom, 8)
                                
                                HStack(spacing: 8) {
                                    CodeTextField(placeholder: "", text: $xPos, onReturnKeyPressed: {
                                        
                                    })
                                    .lineLimit(1)
                                    .truncationMode(.tail)
                                    .textFieldStyle(PlainTextFieldStyle())
                                    .foregroundColor(.white)
                                    .font(.system(size: 8, weight: .semibold))
                                    .padding(.horizontal, 10)
                                    .frame(height: 25)
                                    .containerHelper(backgroundColor: Color(hex: 0x222222),
                                                     borderColor: Color(hex: 0x616161),
                                                     borderWidth: 1,
                                                     topLeft: 2, topRight: 2,
                                                     bottomLeft: 2, bottomRight: 2,
                                                     shadowColor: .white.opacity(0.5),
                                                     shadowRadius: 0.5,
                                                     shadowX: 0, shadowY: 0)
                                    .hoverEffect(opacity: 0.8)
                                    
                                    CodeTextField(placeholder: "", text: $yPos, onReturnKeyPressed: {
                                        
                                    })
                                    .lineLimit(1)
                                    .truncationMode(.tail)
                                    .textFieldStyle(PlainTextFieldStyle())
                                    .foregroundColor(.white)
                                    .font(.system(size: 8, weight: .semibold))
                                    .padding(.horizontal, 10)
                                    .frame(height: 25)
                                    .containerHelper(backgroundColor: Color(hex: 0x222222),
                                                     borderColor: Color(hex: 0x616161),
                                                     borderWidth: 1,
                                                     topLeft: 2, topRight: 2,
                                                     bottomLeft: 2, bottomRight: 2,
                                                     shadowColor: .white.opacity(0.5),
                                                     shadowRadius: 0.5,
                                                     shadowX: 0, shadowY: 0)
                                    .hoverEffect(opacity: 0.8)
                                    
                                    Spacer()
                                }
                                .frame(width: (geometry.size.width * (1 - leftPanelWidthRatio) * 0.3) * 0.9)
                                .padding(.bottom, 16)
                                
                                HStack(spacing: 8) {
                                    ImageButtonMain {
                                        
                                    }
                                    .containerHelper(backgroundColor: Color(hex: 0x515151),
                                                     borderColor: Color(hex: 0x616161),
                                                     borderWidth: 1,
                                                     topLeft: 2, topRight: 2,
                                                     bottomLeft: 2, bottomRight: 2,
                                                     shadowColor: Color.white.opacity(0.5),
                                                     shadowRadius: 1,
                                                     shadowX: 0, shadowY: 0)
                                    .frame(width: geometry.size.width * 0.02, height: 20)
                                    .overlay(
                                        Image(systemName: "plus.magnifyingglass")
                                            .font(.system(size: 10, weight: .semibold))
                                            .foregroundColor(Color(hex: 0xf5f5f5).opacity(0.8))
                                            .allowsHitTesting(false)
                                    )
                                    .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                                    
                                    ImageButtonMain {
                                        
                                    }
                                    .containerHelper(backgroundColor: Color(hex: 0x515151),
                                                     borderColor: Color(hex: 0x616161),
                                                     borderWidth: 1,
                                                     topLeft: 2, topRight: 2,
                                                     bottomLeft: 2, bottomRight: 2,
                                                     shadowColor: Color.white.opacity(0.5),
                                                     shadowRadius: 1,
                                                     shadowX: 0, shadowY: 0)
                                    .frame(width: geometry.size.width * 0.02, height: 20)
                                    .overlay(
                                        Image(systemName: "minus.magnifyingglass")
                                            .font(.system(size: 10, weight: .semibold))
                                            .foregroundColor(Color(hex: 0xf5f5f5).opacity(0.8))
                                            .allowsHitTesting(false)
                                    )
                                    .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                                    
                                    ImageButtonMain {
                                        
                                    }
                                    .containerHelper(backgroundColor: Color(hex: 0x515151),
                                                     borderColor: Color(hex: 0x616161),
                                                     borderWidth: 1,
                                                     topLeft: 2, topRight: 2,
                                                     bottomLeft: 2, bottomRight: 2,
                                                     shadowColor: Color.white.opacity(0.5),
                                                     shadowRadius: 1,
                                                     shadowX: 0, shadowY: 0)
                                    .frame(width: geometry.size.width * 0.02, height: 20)
                                    .overlay(
                                        Image(systemName: "rotate.left")
                                            .font(.system(size: 10, weight: .semibold))
                                            .foregroundColor(Color(hex: 0xf5f5f5).opacity(0.8))
                                            .allowsHitTesting(false)
                                    )
                                    .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                                    
                                    ImageButtonMain {
                                        
                                    }
                                    .containerHelper(backgroundColor: Color(hex: 0x515151),
                                                     borderColor: Color(hex: 0x616161),
                                                     borderWidth: 1,
                                                     topLeft: 2, topRight: 2,
                                                     bottomLeft: 2, bottomRight: 2,
                                                     shadowColor: Color.white.opacity(0.5),
                                                     shadowRadius: 1,
                                                     shadowX: 0, shadowY: 0)
                                    .frame(width: geometry.size.width * 0.02, height: 20)
                                    .overlay(
                                        Image(systemName: "rotate.right")
                                            .font(.system(size: 10, weight: .semibold))
                                            .foregroundColor(Color(hex: 0xf5f5f5).opacity(0.8))
                                            .allowsHitTesting(false)
                                    )
                                    .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                                    
                                    ImageButtonMain {
                                        
                                    }
                                    .containerHelper(backgroundColor: Color(hex: 0x515151),
                                                     borderColor: Color(hex: 0x616161),
                                                     borderWidth: 1,
                                                     topLeft: 2, topRight: 2,
                                                     bottomLeft: 2, bottomRight: 2,
                                                     shadowColor: Color.white.opacity(0.5),
                                                     shadowRadius: 1,
                                                     shadowX: 0, shadowY: 0)
                                    .frame(width: geometry.size.width * 0.02, height: 20)
                                    .overlay(
                                        Image(systemName: "arrow.left.arrow.right")
                                            .font(.system(size: 10, weight: .semibold))
                                            .foregroundColor(Color(hex: 0xf5f5f5).opacity(0.8))
                                            .allowsHitTesting(false)
                                    )
                                    .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                                    
                                    ImageButtonMain {
                                        
                                    }
                                    .containerHelper(backgroundColor: Color(hex: 0x515151),
                                                     borderColor: Color(hex: 0x616161),
                                                     borderWidth: 1,
                                                     topLeft: 2, topRight: 2,
                                                     bottomLeft: 2, bottomRight: 2,
                                                     shadowColor: Color.white.opacity(0.5),
                                                     shadowRadius: 1,
                                                     shadowX: 0, shadowY: 0)
                                    .frame(width: geometry.size.width * 0.02, height: 20)
                                    .overlay(
                                        Image(systemName: "arrow.up.arrow.down")
                                            .font(.system(size: 10, weight: .semibold))
                                            .foregroundColor(Color(hex: 0xf5f5f5).opacity(0.8))
                                            .allowsHitTesting(false)
                                    )
                                    .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                                    
                                    Spacer()
                                }
                                .frame(width: (geometry.size.width * (1 - leftPanelWidthRatio) * 0.3) * 0.9)
                                .padding(.leading, 2)
                                .padding(.bottom, 16)
                            }
                            Spacer()
                        }
                        .frame(width: geometry.size.width * (1 - leftPanelWidthRatio) * 0.3)
                        .padding(.top, 12)
                    }
                    .padding(.bottom, 12)
                    .overlay(
                        Rectangle()
                            .frame(height: 0.5)
                            .foregroundColor(Color(hex: 0xc1c1c1).opacity(0.4)),
                        alignment: .bottom
                    )
                    
                    VStack(spacing: 0) {
                        HStack(spacing: 0) {
                            Image(systemName: "ruler")
                                .resizable()
                                .scaledToFit()
                                .frame(width: 15, height: 15)
                                .font(.system(size: 15, weight: .semibold))
                                .padding(.leading, 12)
                                .padding(.trailing, 8)
                            
                            Text("Dimensions")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(Color(hex: 0xc1c1c1))
                            
                            Spacer()
                        }
                        .padding(.top, 15)
                        .padding(.bottom, 12)
                        .containerHelper(
                            backgroundColor: Color(hex: 0x121212),
                            borderColor: .clear,
                            borderWidth: 0,
                            topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0,
                            shadowColor: .clear,
                            shadowRadius: 0,
                            shadowX: 0,
                            shadowY: 0
                        )
                            
                        HStack {
                            Spacer()
                            VStack(alignment: .leading, spacing: 0) {
                                HStack {
                                    Text("Image Size")
                                        .font(.system(size: 9, weight: .semibold))
                                        .foregroundColor(Color(hex: 0xc1c1c1))
                                        .padding(.leading, 2)
                                    Spacer()
                                }
                                .frame(width: (geometry.size.width * (1 - leftPanelWidthRatio) * 0.3) * 0.9)
                                .padding(.bottom, 8)
                                
                                HStack(spacing: 8) {
                                    CodeTextField(placeholder: "", text: $imageWidth, onReturnKeyPressed: {
                                        
                                    })
                                    .lineLimit(1)
                                    .truncationMode(.tail)
                                    .textFieldStyle(PlainTextFieldStyle())
                                    .foregroundColor(.white)
                                    .font(.system(size: 8, weight: .semibold))
                                    .padding(.horizontal, 10)
                                    .frame(height: 25)
                                    .containerHelper(backgroundColor: Color(hex: 0x222222),
                                                     borderColor: Color(hex: 0x616161),
                                                     borderWidth: 1,
                                                     topLeft: 2, topRight: 2,
                                                     bottomLeft: 2, bottomRight: 2,
                                                     shadowColor: .white.opacity(0.5),
                                                     shadowRadius: 0.5,
                                                     shadowX: 0, shadowY: 0)
                                    .hoverEffect(opacity: 0.8)
                                    
                                    CodeTextField(placeholder: "", text: $imageHeight, onReturnKeyPressed: {
                                        
                                    })
                                    .lineLimit(1)
                                    .truncationMode(.tail)
                                    .textFieldStyle(PlainTextFieldStyle())
                                    .foregroundColor(.white)
                                    .font(.system(size: 8, weight: .semibold))
                                    .padding(.horizontal, 10)
                                    .frame(height: 25)
                                    .containerHelper(backgroundColor: Color(hex: 0x222222),
                                                     borderColor: Color(hex: 0x616161),
                                                     borderWidth: 1,
                                                     topLeft: 2, topRight: 2,
                                                     bottomLeft: 2, bottomRight: 2,
                                                     shadowColor: .white.opacity(0.5),
                                                     shadowRadius: 0.5,
                                                     shadowX: 0, shadowY: 0)
                                    .hoverEffect(opacity: 0.8)
                                    
                                    Spacer()
                                }
                                .frame(width: (geometry.size.width * (1 - leftPanelWidthRatio) * 0.3) * 0.9)
                                .padding(.bottom, 16)
                                
                                HStack(spacing: 8) {
                                    ImageButtonMain {
                                        if isCropping {
                                            isCropping = false
                                            isCircleCropping = false
                                        } else {
                                            isCropping = true
                                            isCircleCropping = false
                                        }
                                    }
                                    .containerHelper(backgroundColor:  isCropping ? Color(hex: 0xAD6ADD) : Color(hex: 0x515151),
                                                     borderColor: Color(hex: 0x616161),
                                                     borderWidth: 1,
                                                     topLeft: 2, topRight: 2,
                                                     bottomLeft: 2, bottomRight: 2,
                                                     shadowColor: Color.white.opacity(0.5),
                                                     shadowRadius: 1,
                                                     shadowX: 0, shadowY: 0)
                                    .frame(width: geometry.size.width * 0.02, height: 20)
                                    .overlay(
                                        Image(systemName: "crop")
                                            .font(.system(size: 10, weight: .semibold))
                                            .foregroundColor(Color(hex: 0xf5f5f5).opacity(0.8))
                                            .allowsHitTesting(false)
                                    )
                                    .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                                    
                                    if isCropping {
                                        ImageButtonMain {
                                            if isCircleCropping {
                                                isCircleCropping = false
                                            } else {
                                                isCircleCropping = true
                                            }
                                        }
                                        .containerHelper(backgroundColor: isCircleCropping ? Color(hex: 0xAD6ADD) : Color(hex: 0x515151),
                                                         borderColor: Color(hex: 0x616161),
                                                         borderWidth: 1,
                                                         topLeft: 2, topRight: 2,
                                                         bottomLeft: 2, bottomRight: 2,
                                                         shadowColor: Color.white.opacity(0.5),
                                                         shadowRadius: 1,
                                                         shadowX: 0, shadowY: 0)
                                        .frame(width: geometry.size.width * 0.02, height: 20)
                                        .overlay(
                                            Image(systemName: "circle.dotted")
                                                .font(.system(size: 10, weight: .semibold))
                                                .foregroundColor(Color(hex: 0xf5f5f5).opacity(0.8))
                                                .allowsHitTesting(false)
                                        )
                                        .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                                    }
                                    
                                    ImageButtonMain {
                                        
                                    }
                                    .containerHelper(backgroundColor: Color(hex: 0x515151),
                                                     borderColor: Color(hex: 0x616161),
                                                     borderWidth: 1,
                                                     topLeft: 2, topRight: 2,
                                                     bottomLeft: 2, bottomRight: 2,
                                                     shadowColor: Color.white.opacity(0.5),
                                                     shadowRadius: 1,
                                                     shadowX: 0, shadowY: 0)
                                    .frame(width: geometry.size.width * 0.02, height: 20)
                                    .overlay(
                                        Image(systemName: "arrow.uturn.backward.square.fill")
                                            .font(.system(size: 10, weight: .semibold))
                                            .foregroundColor(Color(hex: 0xf5f5f5).opacity(0.8))
                                            .allowsHitTesting(false)
                                    )
                                    .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                                    
                                    Spacer()
                                }
                                .frame(width: (geometry.size.width * (1 - leftPanelWidthRatio) * 0.3) * 0.9)
                                .padding(.leading, 2)
                                .padding(.bottom, 16)
                                
                                if isCropping {
                                    HStack(spacing: 8) {
                                        ImageButtonMain {
                                            
                                        }
                                        .containerHelper(backgroundColor: Color(hex: 0x515151),
                                                         borderColor: Color(hex: 0x616161),
                                                         borderWidth: 1,
                                                         topLeft: 2, topRight: 2,
                                                         bottomLeft: 2, bottomRight: 2,
                                                         shadowColor: Color.white.opacity(0.5),
                                                         shadowRadius: 1,
                                                         shadowX: 0, shadowY: 0)
                                        .frame(width: geometry.size.width * 0.03, height: 20)
                                        .overlay(
                                            Text("1:1")
                                                .font(.system(size: 10, weight: .semibold))
                                                .foregroundColor(Color(hex: 0xf5f5f5).opacity(0.8))
                                                .allowsHitTesting(false)
                                        )
                                        .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                                        
                                        ImageButtonMain {
                                            
                                        }
                                        .containerHelper(backgroundColor: Color(hex: 0x515151),
                                                         borderColor: Color(hex: 0x616161),
                                                         borderWidth: 1,
                                                         topLeft: 2, topRight: 2,
                                                         bottomLeft: 2, bottomRight: 2,
                                                         shadowColor: Color.white.opacity(0.5),
                                                         shadowRadius: 1,
                                                         shadowX: 0, shadowY: 0)
                                        .frame(width: geometry.size.width * 0.03, height: 20)
                                        .overlay(
                                            Text("4:3")
                                                .font(.system(size: 10, weight: .semibold))
                                                .foregroundColor(Color(hex: 0xf5f5f5).opacity(0.8))
                                                .allowsHitTesting(false)
                                        )
                                        .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                                        
                                        ImageButtonMain {
                                            
                                        }
                                        .containerHelper(backgroundColor: Color(hex: 0x515151),
                                                         borderColor: Color(hex: 0x616161),
                                                         borderWidth: 1,
                                                         topLeft: 2, topRight: 2,
                                                         bottomLeft: 2, bottomRight: 2,
                                                         shadowColor: Color.white.opacity(0.5),
                                                         shadowRadius: 1,
                                                         shadowX: 0, shadowY: 0)
                                        .frame(width: geometry.size.width * 0.03, height: 20)
                                        .overlay(
                                            Text("16:9")
                                                .font(.system(size: 10, weight: .semibold))
                                                .foregroundColor(Color(hex: 0xf5f5f5).opacity(0.8))
                                                .allowsHitTesting(false)
                                        )
                                        .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                                        
                                        Spacer()
                                    }
                                    .frame(width: (geometry.size.width * (1 - leftPanelWidthRatio) * 0.3) * 0.9)
                                    .padding(.leading, 2)
                                    .padding(.bottom, 16)
                                }
                            }
                            Spacer()
                        }
                        .frame(width: geometry.size.width * (1 - leftPanelWidthRatio) * 0.3)
                        .padding(.top, 12)
                    }
                    .padding(.bottom, 12)
                    .overlay(
                        Rectangle()
                            .frame(height: 0.5)
                            .foregroundColor(Color(hex: 0xc1c1c1).opacity(0.4)),
                        alignment: .bottom
                    )
                    Spacer()
                }
                .frame(width: geometry.size.width * (1 - leftPanelWidthRatio) * 0.3)
                .frame(maxHeight: .infinity)
                .containerHelper(
                    backgroundColor: Color(hex: 0x171717),
                    borderColor: .clear,
                    borderWidth: 0,
                    topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0,
                    shadowColor: .clear,
                    shadowRadius: 0,
                    shadowX: 0,
                    shadowY: 0
                )
                .overlay(
                    Rectangle()
                        .frame(width: 3.0)
                        .foregroundColor(Color(hex: 0x121212).opacity(0.4)),
                    alignment: .trailing
                )

                VStack(spacing: 0) {
                    VStack {
                        if let image = NSImage(contentsOf: fileURL) {
                            GeometryReader { proxy in
                                ZStack {
                                    Image(nsImage: image)
                                        .resizable()
                                        .frame(width: imageSize.width, height: imageSize.height)
                                        .position(imagePosition)
                                    
                                    Group {
                                        Circle()
                                            .frame(width: 8, height: 8)
                                            .foregroundColor(.white)
                                            .position(
                                                x: imagePosition.x - imageSize.width/2 - 4,
                                                y: imagePosition.y - imageSize.height/2 - 4
                                            )
                                            .gesture(dragGesture(for: .topLeft))
                                        
                                        Circle()
                                            .frame(width: 8, height: 8)
                                            .foregroundColor(.white)
                                            .position(
                                                x: imagePosition.x + imageSize.width/2 + 4,
                                                y: imagePosition.y - imageSize.height/2 - 4
                                            )
                                            .gesture(dragGesture(for: .topRight))
                                        
                                        Circle()
                                            .frame(width: 8, height: 8)
                                            .foregroundColor(.white)
                                            .position(
                                                x: imagePosition.x - imageSize.width/2 - 4,
                                                y: imagePosition.y + imageSize.height/2 + 4
                                            )
                                            .gesture(dragGesture(for: .bottomLeft))
                                        
                                        Circle()
                                            .frame(width: 8, height: 8)
                                            .foregroundColor(.white)
                                            .position(
                                                x: imagePosition.x + imageSize.width/2 + 4,
                                                y: imagePosition.y + imageSize.height/2 + 4
                                            )
                                            .gesture(dragGesture(for: .bottomRight))
                                    }
                                }
                                .onAppear {
                                    if imageSize == .zero {
                                        originalAspectRatio = image.size.width / image.size.height
                                        let maxWidth = proxy.size.width * 0.8
                                        let maxHeight = proxy.size.height * 0.8
                                        let scale = min(maxWidth / image.size.width, maxHeight / image.size.height)
                                        imageSize = CGSize(
                                            width: image.size.width * scale,
                                            height: image.size.height * scale
                                        )
                                        imagePosition = CGPoint(x: proxy.size.width / 2, y: proxy.size.height / 2)
                                        updateTextFields()
                                    }
                                }
                            }
                        } else {
                            Text("Unable to load image.")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(Color(hex: 0xc1c1c1))
                                .padding()
                        }
                    }
                    .frame(width: geometry.size.width * (1 - leftPanelWidthRatio) * 0.7)
                    .frame(maxHeight: .infinity - 60)
                    .containerHelper(
                        backgroundColor: Color(hex: 0x242424),
                        borderColor: .clear,
                        borderWidth: 0,
                        topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0,
                        shadowColor: .clear,
                        shadowRadius: 0,
                        shadowX: 0,
                        shadowY: 0
                    )
                    
                    HStack(spacing: 0) {
                        Spacer()
                        Toggle("", isOn: $preserveAspectRatio)
                            .toggleStyle(ToggleSwitch(
                                toggleWidth: 25,
                                toggleHeight: 14,
                                circleSize: 12,
                                activeColor: .purple,
                                inactiveColor: Color(hex: 0x333333),
                                thumbColor: .white,
                                textColor: .white.opacity(0.8),
                                fontSize: 9,
                                fontWeight: .bold,
                                activeText: "Preserve Aspect Ratio",
                                inactiveText: "Ignore Aspect Ratio",
                                showText: true,
                                animationDuration: 0.2,
                                animationDamping: 0.8
                            ))
                            .padding(.trailing, 20)
                    }
                    .frame(width: geometry.size.width * (1 - leftPanelWidthRatio) * 0.7, height: 60)
                    .containerHelper(
                        backgroundColor: Color(hex: 0x171717),
                        borderColor: .clear,
                        borderWidth: 0,
                        topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0,
                        shadowColor: .clear,
                        shadowRadius: 0,
                        shadowX: 0,
                        shadowY: 0
                    )
                    .overlay(
                        Rectangle()
                            .frame(height: 3.0)
                            .foregroundColor(Color(hex: 0x121212).opacity(0.4)),
                        alignment: .top
                    )
                }
                .frame(width: geometry.size.width * (1 - leftPanelWidthRatio) * 0.7)
                .frame(maxHeight: .infinity)
            }
            .frame(width: geometry.size.width * (1 - leftPanelWidthRatio))
            .frame(maxHeight: .infinity)
            .containerHelper(
                backgroundColor: Color(hex: 0x242424),
                borderColor: .clear,
                borderWidth: 0,
                topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0,
                shadowColor: .clear,
                shadowRadius: 0,
                shadowX: 0,
                shadowY: 0
            )
            .overlay(
                Rectangle()
                    .frame(height: 0.5)
                    .foregroundColor(Color(hex: 0xc1c1c1).opacity(0.4)),
                alignment: .top
            )
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
    private enum Corner {
        case topLeft, topRight, bottomLeft, bottomRight
    }
    
    private func dragGesture(for corner: Corner) -> some Gesture {
        DragGesture(minimumDistance: 0)
            .onChanged { value in
                if lastDragPosition == nil {
                    lastDragPosition = value.startLocation
                    initialDragImageSize = imageSize
                    initialDragImagePosition = imagePosition
                    if preserveAspectRatio {
                        originalAspectRatio = imageSize.width / imageSize.height
                    }
                }
                
                guard let last = lastDragPosition else { return }
                let deltaX = value.location.x - last.x
                let deltaY = value.location.y - last.y
                let sensitivity: CGFloat = 0.5
                
                var newWidth = imageSize.width
                var newHeight = imageSize.height
                
                switch corner {
                case .topLeft:
                    newWidth = max(50, imageSize.width - deltaX * sensitivity)
                    newHeight = preserveAspectRatio ?
                        newWidth / originalAspectRatio :
                        max(50, imageSize.height - deltaY * sensitivity)
                case .topRight:
                    newWidth = max(50, imageSize.width + deltaX * sensitivity)
                    newHeight = preserveAspectRatio ?
                        newWidth / originalAspectRatio :
                        max(50, imageSize.height - deltaY * sensitivity)
                case .bottomLeft:
                    newWidth = max(50, imageSize.width - deltaX * sensitivity)
                    newHeight = preserveAspectRatio ?
                        newWidth / originalAspectRatio :
                        max(50, imageSize.height + deltaY * sensitivity)
                case .bottomRight:
                    newWidth = max(50, imageSize.width + deltaX * sensitivity)
                    newHeight = preserveAspectRatio ?
                        newWidth / originalAspectRatio :
                        max(50, imageSize.height + deltaY * sensitivity)
                }
                
                if !preserveAspectRatio {
                    guard let initialPosition = initialDragImagePosition,
                          let initialSize = initialDragImageSize else { return }
                    switch corner {
                    case .topLeft:
                        let fixed = CGPoint(x: initialPosition.x + initialSize.width/2,
                                            y: initialPosition.y + initialSize.height/2)
                        imagePosition = CGPoint(x: fixed.x - newWidth/2,
                                                y: fixed.y - newHeight/2)
                    case .topRight:
                        let fixed = CGPoint(x: initialPosition.x - initialSize.width/2,
                                            y: initialPosition.y + initialSize.height/2)
                        imagePosition = CGPoint(x: fixed.x + newWidth/2,
                                                y: fixed.y - newHeight/2)
                    case .bottomLeft:
                        let fixed = CGPoint(x: initialPosition.x + initialSize.width/2,
                                            y: initialPosition.y - initialSize.height/2)
                        imagePosition = CGPoint(x: fixed.x - newWidth/2,
                                                y: fixed.y + newHeight/2)
                    case .bottomRight:
                        let fixed = CGPoint(x: initialPosition.x - initialSize.width/2,
                                            y: initialPosition.y - initialSize.height/2)
                        imagePosition = CGPoint(x: fixed.x + newWidth/2,
                                                y: fixed.y + newHeight/2)
                    }
                }
                
                imageSize = CGSize(width: newWidth, height: newHeight)
                updateTextFields()
                lastDragPosition = value.location
            }
            .onEnded { _ in
                lastDragPosition = nil
                initialDragImageSize = nil
                initialDragImagePosition = nil
                hasUnsavedChanges = true
            }
    }
    
    private func updateTextFields() {
        imageWidth = String(format: "W: %.1fpx", imageSize.width)
        imageHeight = String(format: "H: %.1fpx", imageSize.height)
    }
}
