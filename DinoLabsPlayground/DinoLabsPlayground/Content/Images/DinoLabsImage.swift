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
    @State private var editorSize: CGSize = .zero
    @State private var initialDragOffset: CGPoint? = nil
    @State private var rotationAngle: Angle = .zero
    @State private var flipHorizontal: Bool = false
    @State private var flipVertical: Bool = false
    @State private var initialLoadedImageSize: CGSize = .zero
    @State private var initialLoadedImagePosition: CGPoint = .zero
    
    @State private var currentImage: NSImage? = nil
    @State private var cropHistory: [(image: NSImage, size: CGSize, position: CGPoint)] = []
    
    @State private var cropRectPosition: CGPoint = .zero
    @State private var cropRectSize: CGSize = .zero
    @State private var initialCropDragOffset: CGPoint? = nil
    @State private var initialCropRectSize: CGSize? = nil
    @State private var initialCropRectPosition: CGPoint? = nil
    @State private var cropRotationAngle: Angle = .zero
    @State private var initialCropRotationOffset: Angle? = nil

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
                                    imageSize = initialLoadedImageSize
                                    imagePosition = initialLoadedImagePosition
                                    rotationAngle = .zero
                                    flipHorizontal = false
                                    flipVertical = false
                                    isCropping = false
                                    isCircleCropping = false
                                    cropRectSize = .zero
                                    cropRectPosition = .zero
                                    currentImage = NSImage(contentsOf: fileURL)
                                    cropHistory = []
                                    updateTextFields()
                                    hasUnsavedChanges = true
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
                                        let numericString = extractNumeric(from: xPos)
                                        if let newX = Double(numericString) {
                                            imagePosition.x = CGFloat(newX)
                                            hasUnsavedChanges = true
                                            updateTextFields()
                                        }
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
                                        let numericString = extractNumeric(from: yPos)
                                        if let newY = Double(numericString) {
                                            imagePosition.y = CGFloat(newY)
                                            hasUnsavedChanges = true
                                            updateTextFields()
                                        }
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
                                        let scale: CGFloat = 1.1
                                        let newWidth = imageSize.width * scale
                                        let newHeight = imageSize.height * scale
                                        imageSize = CGSize(width: newWidth, height: newHeight)
                                        updateTextFields()
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
                                        let scale: CGFloat = 0.9
                                        let newWidth = max(50, imageSize.width * scale)
                                        let newHeight = max(50, imageSize.height * scale)
                                        imageSize = CGSize(width: newWidth, height: newHeight)
                                        updateTextFields()
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
                                        rotationAngle -= .degrees(90)
                                        hasUnsavedChanges = true
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
                                        rotationAngle += .degrees(90)
                                        hasUnsavedChanges = true
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
                                        flipHorizontal.toggle()
                                        hasUnsavedChanges = true
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
                                        flipVertical.toggle()
                                        hasUnsavedChanges = true
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
                                        let numericString = extractNumeric(from: imageWidth)
                                        if let newWidth = Double(numericString) {
                                            hasUnsavedChanges = true
                                            if preserveAspectRatio {
                                                imageSize.width = CGFloat(newWidth)
                                                imageSize.height = CGFloat(newWidth) / originalAspectRatio
                                            } else {
                                                imageSize.width = CGFloat(newWidth)
                                            }
                                            updateTextFields()
                                        }
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
                                        let numericString = extractNumeric(from: imageHeight)
                                        if let newHeight = Double(numericString) {
                                            hasUnsavedChanges = true
                                            if preserveAspectRatio {
                                                imageSize.height = CGFloat(newHeight)
                                                imageSize.width = CGFloat(newHeight) * originalAspectRatio
                                            } else {
                                                imageSize.height = CGFloat(newHeight)
                                            }
                                            updateTextFields()
                                        }
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
                                            cropImage()
                                            isCropping = false
                                            isCircleCropping = false
                                        } else {
                                            isCropping = true
                                            isCircleCropping = false
                                            cropRectPosition = imagePosition
                                            cropRectSize = imageSize
                                        }
                                    }
                                    .containerHelper(backgroundColor: isCropping ? Color(hex: 0xAD6ADD) : Color(hex: 0x515151),
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
                                                cropRectSize = imageSize
                                                cropRectPosition = imagePosition
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
                                    
                                    if isCropping {
                                        ImageButtonMain {
                                            isCropping = false
                                            cropRectSize = .zero
                                            cropRectPosition = .zero
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
                                            Image(systemName: "xmark.square.fill")
                                                .font(.system(size: 10, weight: .semibold))
                                                .foregroundColor(Color(hex: 0xf5f5f5).opacity(0.8))
                                                .allowsHitTesting(false)
                                        )
                                        .hoverEffect(opacity: 0.5, scale: 1.02, cursor: .pointingHand)
                                    }
                                    
                                    ImageButtonMain {
                                        if let previousState = cropHistory.popLast() {
                                            currentImage = previousState.image
                                            imageSize = previousState.size
                                            imagePosition = previousState.position
                                            hasUnsavedChanges = true
                                        }
                                        isCropping = false
                                        cropRectSize = .zero
                                        cropRectPosition = .zero
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
                                            let presetRatio: CGFloat = 1.0
                                            let currentWidth = imageSize.width
                                            let currentHeight = imageSize.height
                                            var newWidth: CGFloat = currentWidth
                                            var newHeight: CGFloat = currentHeight
                                            if currentWidth / currentHeight > presetRatio {
                                                newHeight = currentHeight
                                                newWidth = newHeight * presetRatio
                                            } else {
                                                newWidth = currentWidth
                                                newHeight = newWidth / presetRatio
                                            }
                                            cropRectSize = CGSize(width: newWidth, height: newHeight)
                                            cropRectPosition = imagePosition
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
                                            let presetRatio: CGFloat = 4.0/3.0
                                            let currentWidth = imageSize.width
                                            let currentHeight = imageSize.height
                                            var newWidth: CGFloat = currentWidth
                                            var newHeight: CGFloat = currentHeight
                                            if currentWidth / currentHeight > presetRatio {
                                                newHeight = currentHeight
                                                newWidth = newHeight * presetRatio
                                            } else {
                                                newWidth = currentWidth
                                                newHeight = newWidth / presetRatio
                                            }
                                            cropRectSize = CGSize(width: newWidth, height: newHeight)
                                            cropRectPosition = imagePosition
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
                                            let presetRatio: CGFloat = 16.0/9.0
                                            let currentWidth = imageSize.width
                                            let currentHeight = imageSize.height
                                            var newWidth: CGFloat = currentWidth
                                            var newHeight: CGFloat = currentHeight
                                            if currentWidth / currentHeight > presetRatio {
                                                newHeight = currentHeight
                                                newWidth = newHeight * presetRatio
                                            } else {
                                                newWidth = currentWidth
                                                newHeight = newWidth / presetRatio
                                            }
                                            cropRectSize = CGSize(width: newWidth, height: newHeight)
                                            cropRectPosition = imagePosition
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
                        if let image = currentImage ?? NSImage(contentsOf: fileURL) {
                            GeometryReader { proxy in
                                ZStack {
                                    Image(nsImage: image)
                                        .resizable()
                                        .frame(width: imageSize.width, height: imageSize.height)
                                        .rotationEffect(rotationAngle)
                                        .scaleEffect(x: flipHorizontal ? -1 : 1, y: flipVertical ? -1 : 1)
                                        .position(imagePosition)
                                        .gesture(isCropping ? nil : imageDragGesture())
                                    
                                    if !isCropping {
                                        Group {
                                            RoundedRectangle(cornerRadius: 2)
                                                .frame(width: 8, height: 8)
                                                .foregroundColor(Color(hex: 0x818181))
                                                .position(calculateCornerPosition(.topLeft))
                                                .gesture(dragGesture(for: .topLeft))
                                            
                                            RoundedRectangle(cornerRadius: 2)
                                                .frame(width: 8, height: 8)
                                                .foregroundColor(Color(hex: 0x818181))
                                                .position(calculateCornerPosition(.topRight))
                                                .gesture(dragGesture(for: .topRight))
                                            
                                            RoundedRectangle(cornerRadius: 2)
                                                .frame(width: 8, height: 8)
                                                .foregroundColor(Color(hex: 0x818181))
                                                .position(calculateCornerPosition(.bottomLeft))
                                                .gesture(dragGesture(for: .bottomLeft))
                                            
                                            RoundedRectangle(cornerRadius: 2)
                                                .frame(width: 8, height: 8)
                                                .foregroundColor(Color(hex: 0x818181))
                                                .position(calculateCornerPosition(.bottomRight))
                                                .gesture(dragGesture(for: .bottomRight))
                                        }
                                    }
                                    
                                    if isCropping {
                                        if isCircleCropping {
                                            Ellipse()
                                                .fill(Color.black.opacity(0.3))
                                                .frame(width: cropRectSize.width, height: cropRectSize.height)
                                                .overlay(
                                                    Ellipse()
                                                        .stroke(Color.white.opacity(0.8), lineWidth: 2)
                                                )
                                                .rotationEffect(cropRotationAngle)
                                                .position(cropRectPosition)
                                                .gesture(cropDragGesture())
                                        } else {
                                            Rectangle()
                                                .fill(Color.black.opacity(0.3))
                                                .frame(width: cropRectSize.width, height: cropRectSize.height)
                                                .border(Color.white.opacity(0.8), width: 2)
                                                .rotationEffect(cropRotationAngle)
                                                .position(cropRectPosition)
                                                .gesture(cropDragGesture())
                                        }
                                        
                                        Group {
                                            RoundedRectangle(cornerRadius: 2)
                                                .frame(width: 8, height: 8)
                                                .foregroundColor(Color.white.opacity(0.8))
                                                .position(rotatedCropCornerPosition(for: .topLeft))
                                                .gesture(cropResizeGesture(for: .topLeft))
                                            
                                            RoundedRectangle(cornerRadius: 2)
                                                .frame(width: 8, height: 8)
                                                .foregroundColor(Color.white.opacity(0.8))
                                                .position(rotatedCropCornerPosition(for: .topRight))
                                                .gesture(cropResizeGesture(for: .topRight))
                                            
                                            RoundedRectangle(cornerRadius: 2)
                                                .frame(width: 8, height: 8)
                                                .foregroundColor(Color.white.opacity(0.8))
                                                .position(rotatedCropCornerPosition(for: .bottomLeft))
                                                .gesture(cropResizeGesture(for: .bottomLeft))
                                            
                                            RoundedRectangle(cornerRadius: 2)
                                                .frame(width: 8, height: 8)
                                                .foregroundColor(Color.white.opacity(0.8))
                                                .position(rotatedCropCornerPosition(for: .bottomRight))
                                                .gesture(cropResizeGesture(for: .bottomRight))
                                        }
                                        
                                        Group {
                                            RoundedRectangle(cornerRadius: 2)
                                                .frame(width: 8, height: 8)
                                                .containerHelper(backgroundColor: Color.clear,
                                                                 borderColor: Color.white,
                                                                 borderWidth: 0,
                                                                 topLeft: 0, topRight: 0,
                                                                 bottomLeft: 0, bottomRight: 0,
                                                                 shadowColor: Color.white,
                                                                 shadowRadius: 1,
                                                                 shadowX: 0, shadowY: 0)
                                                .foregroundColor(Color(hex: 0x919191))
                                                .hoverEffect(opacity: 0.6, cursor: .openHand)
                                                .position(cropRotationHandlePosition(for: .topLeft))
                                                .gesture(cropRotationGesture())
                                            
                                            RoundedRectangle(cornerRadius: 2)
                                                .frame(width: 8, height: 8)
                                                .containerHelper(backgroundColor: Color.clear,
                                                                  borderColor: Color.white,
                                                                  borderWidth: 0,
                                                                  topLeft: 0, topRight: 0,
                                                                  bottomLeft: 0, bottomRight: 0,
                                                                  shadowColor: Color.white,
                                                                  shadowRadius: 1,
                                                                  shadowX: 0, shadowY: 0)
                                                .foregroundColor(Color(hex: 0x919191))
                                                .hoverEffect(opacity: 0.6, cursor: .openHand)
                                                .position(cropRotationHandlePosition(for: .topRight))
                                                .gesture(cropRotationGesture())
                                            
                                            RoundedRectangle(cornerRadius: 2)
                                                .frame(width: 8, height: 8)
                                                .containerHelper(backgroundColor: Color.clear,
                                                                  borderColor: Color.white,
                                                                  borderWidth: 0,
                                                                  topLeft: 0, topRight: 0,
                                                                  bottomLeft: 0, bottomRight: 0,
                                                                  shadowColor: Color.white,
                                                                  shadowRadius: 1,
                                                                  shadowX: 0, shadowY: 0)
                                                .foregroundColor(Color(hex: 0x919191))
                                                .hoverEffect(opacity: 0.6, cursor: .openHand)
                                                .position(cropRotationHandlePosition(for: .bottomLeft))
                                                .gesture(cropRotationGesture())
                                            
                                            RoundedRectangle(cornerRadius: 2)
                                                .frame(width: 8, height: 8)
                                                .containerHelper(backgroundColor: Color.clear,
                                                                  borderColor: Color.white,
                                                                  borderWidth: 0,
                                                                  topLeft: 0, topRight: 0,
                                                                  bottomLeft: 0, bottomRight: 0,
                                                                  shadowColor: Color.white,
                                                                  shadowRadius: 1,
                                                                  shadowX: 0, shadowY: 0)
                                                .foregroundColor(Color(hex: 0x919191))
                                                .hoverEffect(opacity: 0.6, cursor: .openHand)
                                                .position(cropRotationHandlePosition(for: .bottomRight))
                                                .gesture(cropRotationGesture())
                                        }
                                    }
                                }
                                .onAppear {
                                    editorSize = proxy.size
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
                                        initialLoadedImageSize = imageSize
                                        initialLoadedImagePosition = imagePosition
                                        updateTextFields()
                                        if currentImage == nil {
                                            currentImage = image
                                        }
                                    }
                                }
                            }
                            .clipped()
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
    
    private func fixedLocalOffset(for corner: Corner, size: CGSize) -> CGPoint {
        switch corner {
        case .topLeft:
            return CGPoint(x: size.width/2, y: size.height/2)
        case .topRight:
            return CGPoint(x: -size.width/2, y: size.height/2)
        case .bottomLeft:
            return CGPoint(x: size.width/2, y: -size.height/2)
        case .bottomRight:
            return CGPoint(x: -size.width/2, y: -size.height/2)
        }
    }
    
    private func calculateCornerPosition(_ corner: Corner) -> CGPoint {
        let offset: CGPoint
        switch corner {
        case .topLeft:
            offset = CGPoint(x: -imageSize.width/2, y: -imageSize.height/2)
        case .topRight:
            offset = CGPoint(x: imageSize.width/2, y: -imageSize.height/2)
        case .bottomLeft:
            offset = CGPoint(x: -imageSize.width/2, y: imageSize.height/2)
        case .bottomRight:
            offset = CGPoint(x: imageSize.width/2, y: imageSize.height/2)
        }
        let rad = CGFloat(rotationAngle.radians)
        let rotatedOffset = CGPoint(
            x: offset.x * cos(rad) - offset.y * sin(rad),
            y: offset.x * sin(rad) + offset.y * cos(rad)
        )
        return CGPoint(x: imagePosition.x + rotatedOffset.x, y: imagePosition.y + rotatedOffset.y)
    }
    
    private func dragGesture(for corner: Corner) -> some Gesture {
        DragGesture(minimumDistance: 0)
            .onChanged { value in
                if initialDragImageSize == nil || initialDragImagePosition == nil {
                    initialDragImageSize = imageSize
                    initialDragImagePosition = imagePosition
                    if preserveAspectRatio {
                        originalAspectRatio = imageSize.width / imageSize.height
                    }
                }
                let translation = value.translation
                let rad = CGFloat(rotationAngle.radians)
                let localTranslationX = translation.width * cos(rad) + translation.height * sin(rad)
                let localTranslationY = -translation.width * sin(rad) + translation.height * cos(rad)
                let sensitivity: CGFloat = 0.5
                var newWidth: CGFloat = imageSize.width
                var newHeight: CGFloat = imageSize.height
                
                if let initialSize = initialDragImageSize {
                    switch corner {
                    case .topLeft:
                        newWidth = max(50, initialSize.width - localTranslationX * sensitivity)
                        if preserveAspectRatio {
                            newHeight = newWidth / originalAspectRatio
                        } else {
                            newHeight = max(50, initialSize.height - localTranslationY * sensitivity)
                        }
                    case .topRight:
                        newWidth = max(50, initialSize.width + localTranslationX * sensitivity)
                        if preserveAspectRatio {
                            newHeight = newWidth / originalAspectRatio
                        } else {
                            newHeight = max(50, initialSize.height - localTranslationY * sensitivity)
                        }
                    case .bottomLeft:
                        newWidth = max(50, initialSize.width - localTranslationX * sensitivity)
                        if preserveAspectRatio {
                            newHeight = newWidth / originalAspectRatio
                        } else {
                            newHeight = max(50, initialSize.height + localTranslationY * sensitivity)
                        }
                    case .bottomRight:
                        newWidth = max(50, initialSize.width + localTranslationX * sensitivity)
                        if preserveAspectRatio {
                            newHeight = newWidth / originalAspectRatio
                        } else {
                            newHeight = max(50, initialSize.height + localTranslationY * sensitivity)
                        }
                    }
                }
                
                imageSize = CGSize(width: newWidth, height: newHeight)
                if let initialCenter = initialDragImagePosition, let initialSize = initialDragImageSize {
                    let initialFixedLocal = fixedLocalOffset(for: corner, size: initialSize)
                    let initialFixedScreen = CGPoint(
                        x: initialCenter.x + initialFixedLocal.x * cos(rad) - initialFixedLocal.y * sin(rad),
                        y: initialCenter.y + initialFixedLocal.x * sin(rad) + initialFixedLocal.y * cos(rad)
                    )
                    let newFixedLocal = fixedLocalOffset(for: corner, size: CGSize(width: newWidth, height: newHeight))
                    let rotatedNewFixed = CGPoint(
                        x: newFixedLocal.x * cos(rad) - newFixedLocal.y * sin(rad),
                        y: newFixedLocal.x * sin(rad) + newFixedLocal.y * cos(rad)
                    )
                    imagePosition = CGPoint(x: initialFixedScreen.x - rotatedNewFixed.x,
                                            y: initialFixedScreen.y - rotatedNewFixed.y)
                }
                updateTextFields()
            }
            .onEnded { _ in
                initialDragImageSize = nil
                initialDragImagePosition = nil
            }
    }
    
    private func imageDragGesture() -> some Gesture {
        DragGesture()
            .onChanged { value in
                if initialDragOffset == nil {
                    initialDragOffset = imagePosition
                }
                let newX = initialDragOffset!.x + value.translation.width
                let newY = initialDragOffset!.y + value.translation.height
                let halfWidth = imageSize.width / 2
                let halfHeight = imageSize.height / 2
                let clampedX = min(max(newX, halfWidth), editorSize.width - halfWidth)
                let clampedY = min(max(newY, halfHeight), editorSize.height - halfHeight)
                imagePosition = CGPoint(x: clampedX, y: clampedY)
                updateTextFields()
            }
            .onEnded { _ in
                initialDragOffset = nil
            }
    }
    
    private func updateTextFields() {
        imageWidth = String(format: "W: %.1fpx", imageSize.width)
        imageHeight = String(format: "H: %.1fpx", imageSize.height)
        xPos = String(format: "X: %.1f", imagePosition.x)
        yPos = String(format: "Y: %.1f", imagePosition.y)
    }
    
    private func extractNumeric(from text: String) -> String {
        let allowedCharacters = "0123456789.-"
        return text.filter { allowedCharacters.contains($0) }
    }
    
    private func rotatedCropCornerPosition(for corner: Corner) -> CGPoint {
        let halfWidth = cropRectSize.width / 2
        let halfHeight = cropRectSize.height / 2
        let vector: CGPoint
        switch corner {
        case .topLeft:
            vector = CGPoint(x: -halfWidth, y: -halfHeight)
        case .topRight:
            vector = CGPoint(x: halfWidth, y: -halfHeight)
        case .bottomLeft:
            vector = CGPoint(x: -halfWidth, y: halfHeight)
        case .bottomRight:
            vector = CGPoint(x: halfWidth, y: halfHeight)
        }
        let rad = CGFloat(cropRotationAngle.radians)
        let rotatedVector = CGPoint(
            x: vector.x * cos(rad) - vector.y * sin(rad),
            y: vector.x * sin(rad) + vector.y * cos(rad)
        )
        return CGPoint(x: cropRectPosition.x + rotatedVector.x, y: cropRectPosition.y + rotatedVector.y)
    }
    
    private func cropRotationHandlePosition(for corner: Corner) -> CGPoint {
        let base = rotatedCropCornerPosition(for: corner)
        let dx = base.x - cropRectPosition.x
        let dy = base.y - cropRectPosition.y
        let factor: CGFloat = 1.1
        return CGPoint(x: cropRectPosition.x + dx * factor, y: cropRectPosition.y + dy * factor)
    }
    
    private func cropRotationGesture() -> some Gesture {
        DragGesture(minimumDistance: 0)
            .onChanged { value in
                let center = cropRectPosition
                let currentAngle = atan2(value.location.y - center.y, value.location.x - center.x)
                if initialCropRotationOffset == nil {
                    let startAngle = atan2(value.startLocation.y - center.y, value.startLocation.x - center.x)
                    initialCropRotationOffset = cropRotationAngle - Angle(radians: Double(startAngle))
                }
                cropRotationAngle = Angle(radians: Double(currentAngle)) + (initialCropRotationOffset ?? .zero)
            }
            .onEnded { _ in
                initialCropRotationOffset = nil
            }
    }
    
    private func cropResizeGesture(for corner: Corner) -> some Gesture {
        DragGesture(minimumDistance: 0)
            .onChanged { value in
                if initialCropRectSize == nil || initialCropRectPosition == nil {
                    initialCropRectSize = cropRectSize
                    initialCropRectPosition = cropRectPosition
                }
                let angle = CGFloat(cropRotationAngle.radians)
                let localTranslation = CGPoint(
                    x: value.translation.width * cos(angle) + value.translation.height * sin(angle),
                    y: -value.translation.width * sin(angle) + value.translation.height * cos(angle)
                )
                let sensitivity: CGFloat = 1.0
                var newWidth = cropRectSize.width
                var newHeight = cropRectSize.height
                if let initialSize = initialCropRectSize {
                    switch corner {
                    case .topLeft:
                        newWidth = max(50, initialSize.width - localTranslation.x * sensitivity)
                        newHeight = max(50, initialSize.height - localTranslation.y * sensitivity)
                    case .topRight:
                        newWidth = max(50, initialSize.width + localTranslation.x * sensitivity)
                        newHeight = max(50, initialSize.height - localTranslation.y * sensitivity)
                    case .bottomLeft:
                        newWidth = max(50, initialSize.width - localTranslation.x * sensitivity)
                        newHeight = max(50, initialSize.height + localTranslation.y * sensitivity)
                    case .bottomRight:
                        newWidth = max(50, initialSize.width + localTranslation.x * sensitivity)
                        newHeight = max(50, initialSize.height + localTranslation.y * sensitivity)
                    }
                }
                let localCenterShift = CGPoint(x: localTranslation.x / 2, y: localTranslation.y / 2)
                let rotatedCenterShift = CGPoint(
                    x: localCenterShift.x * cos(angle) - localCenterShift.y * sin(angle),
                    y: localCenterShift.x * sin(angle) + localCenterShift.y * cos(angle)
                )
                var newCenter = cropRectPosition
                if let initialCenter = initialCropRectPosition {
                    newCenter = CGPoint(x: initialCenter.x + rotatedCenterShift.x,
                                        y: initialCenter.y + rotatedCenterShift.y)
                }
                cropRectSize = CGSize(width: newWidth, height: newHeight)
                cropRectPosition = newCenter
            }
            .onEnded { _ in
                initialCropRectSize = nil
                initialCropRectPosition = nil
            }
    }
    
    private func cropDragGesture() -> some Gesture {
        DragGesture()
            .onChanged { value in
                if initialCropDragOffset == nil {
                    initialCropDragOffset = cropRectPosition
                }
                let newCenter = CGPoint(x: initialCropDragOffset!.x + value.translation.width,
                                        y: initialCropDragOffset!.y + value.translation.height)
                cropRectPosition = newCenter
            }
            .onEnded { _ in
                initialCropDragOffset = nil
            }
    }
    
    private func cropImage() {
        let circleCrop = isCircleCropping
        DispatchQueue.global(qos: .userInitiated).async {
            guard let image = currentImage ?? NSImage(contentsOf: fileURL) else { return }
            
            let imageFrameOrigin = CGPoint(x: imagePosition.x - imageSize.width/2,
                                           y: imagePosition.y - imageSize.height/2)
            let cropOriginInView = CGPoint(x: cropRectPosition.x - cropRectSize.width/2,
                                           y: cropRectPosition.y - cropRectSize.height/2)
            let relativeCropOrigin = CGPoint(x: cropOriginInView.x - imageFrameOrigin.x,
                                             y: cropOriginInView.y - imageFrameOrigin.y)
            let scaleX = image.size.width / imageSize.width
            let scaleY = image.size.height / imageSize.height
            
            let rad = CGFloat(cropRotationAngle.radians)
            let halfW = cropRectSize.width / 2
            let halfH = cropRectSize.height / 2
            let corners = [
                CGPoint(x: -halfW, y: -halfH),
                CGPoint(x: halfW, y: -halfH),
                CGPoint(x: halfW, y: halfH),
                CGPoint(x: -halfW, y: halfH)
            ]
            var imageSpaceCorners: [CGPoint] = []
            for c in corners {
                let rotated = CGPoint(
                    x: c.x * cos(rad) - c.y * sin(rad),
                    y: c.x * sin(rad) + c.y * cos(rad)
                )
                let viewX = cropRectPosition.x + rotated.x
                let viewY = cropRectPosition.y + rotated.y
                let inImageFrameX = (viewX - imageFrameOrigin.x) * scaleX
                let inImageFrameY = (viewY - imageFrameOrigin.y) * scaleY
                imageSpaceCorners.append(CGPoint(x: inImageFrameX, y: inImageFrameY))
            }
            
            if circleCrop {
                if let circleCropped = image.croppedToCircle(using: imageSpaceCorners) {
                    DispatchQueue.main.async {
                        cropHistory.append((image: currentImage ?? image, size: imageSize, position: imagePosition))
                        currentImage = circleCropped
                        imageSize = cropRectSize
                        imagePosition = cropRectPosition
                        cropRectSize = .zero
                        cropRectPosition = .zero
                        hasUnsavedChanges = true
                    }
                }
            } else {
                if let diamondCropped = image.croppedToDiamond(using: imageSpaceCorners) {
                    DispatchQueue.main.async {
                        cropHistory.append((image: currentImage ?? image, size: imageSize, position: imagePosition))
                        currentImage = diamondCropped
                        imageSize = cropRectSize
                        imagePosition = cropRectPosition
                        cropRectSize = .zero
                        cropRectPosition = .zero
                        hasUnsavedChanges = true
                    }
                }
            }
        }
    }
}

private extension NSImage {
    func cropped(to rect: CGRect) -> NSImage? {
        guard let cgImage = self.cgImage(forProposedRect: nil, context: nil, hints: nil),
              let croppedCGImage = cgImage.cropping(to: rect) else { return nil }
        return NSImage(cgImage: croppedCGImage, size: rect.size)
    }
}

private extension NSImage {
    func croppedToDiamond(using corners: [CGPoint]) -> NSImage? {
        guard corners.count >= 3 else { return nil }
        let xs = corners.map { $0.x }
        let ys = corners.map { $0.y }
        guard let minX = xs.min(), let maxX = xs.max(),
              let minY = ys.min(), let maxY = ys.max() else { return nil }
        let boundingRect = CGRect(x: minX, y: minY,
                                  width: maxX - minX,
                                  height: maxY - minY)
        
        guard let cgImage = self.cgImage(forProposedRect: nil, context: nil, hints: nil) else { return nil }
        guard let ctx = CGContext(data: nil,
                                  width: Int(boundingRect.width),
                                  height: Int(boundingRect.height),
                                  bitsPerComponent: 8,
                                  bytesPerRow: 0,
                                  space: CGColorSpaceCreateDeviceRGB(),
                                  bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)
        else { return nil }
        
        let offsetCorners = corners.map {
            CGPoint(x: $0.x - boundingRect.origin.x, y: $0.y - boundingRect.origin.y)
        }
        let path = CGMutablePath()
        path.move(to: offsetCorners[0])
        for i in 1..<offsetCorners.count {
            path.addLine(to: offsetCorners[i])
        }
        path.closeSubpath()
        
        ctx.addPath(path)
        ctx.clip()
        
        let drawRect = CGRect(origin: CGPoint(x: -boundingRect.origin.x,
                                              y: -boundingRect.origin.y),
                              size: self.size)
        ctx.draw(cgImage, in: drawRect)
        
        guard let newCG = ctx.makeImage() else { return nil }
        return NSImage(cgImage: newCG, size: boundingRect.size)
    }
}

private extension NSImage {
    func croppedToCircle(using corners: [CGPoint]) -> NSImage? {
        guard corners.count >= 3 else { return nil }
        let xs = corners.map { $0.x }
        let ys = corners.map { $0.y }
        guard let minX = xs.min(), let maxX = xs.max(),
              let minY = ys.min(), let maxY = ys.max() else { return nil }
        let boundingRect = CGRect(x: minX, y: minY,
                                  width: maxX - minX,
                                  height: maxY - minY)
        
        guard let cgImage = self.cgImage(forProposedRect: nil, context: nil, hints: nil) else { return nil }
        guard let ctx = CGContext(data: nil,
                                  width: Int(boundingRect.width),
                                  height: Int(boundingRect.height),
                                  bitsPerComponent: 8,
                                  bytesPerRow: 0,
                                  space: CGColorSpaceCreateDeviceRGB(),
                                  bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)
        else { return nil }
        
        let drawRect = CGRect(origin: CGPoint(x: -boundingRect.origin.x,
                                              y: -boundingRect.origin.y),
                              size: self.size)
        let ellipsePath = CGPath(ellipseIn: CGRect(origin: .zero, size: boundingRect.size), transform: nil)
        ctx.addPath(ellipsePath)
        ctx.clip()
        ctx.draw(cgImage, in: drawRect)
        
        guard let newCG = ctx.makeImage() else { return nil }
        return NSImage(cgImage: newCG, size: boundingRect.size)
    }
}
