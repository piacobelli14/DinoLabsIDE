//
//  BackgroundVideoHelper.swift
//
//  Created by Peter Iacobelli on 2/14/25.
//

import SwiftUI
import AVKit

#if os(macOS)

struct BackgroundVideoPlayer: NSViewRepresentable {
    let player: AVPlayer

    func makeNSView(context: Context) -> AVPlayerView {
        let playerView = AVPlayerView()
        playerView.player = player
        playerView.controlsStyle = .none
        playerView.videoGravity = .resizeAspectFill
        return playerView
    }

    func updateNSView(_ nsView: AVPlayerView, context: Context) {
        nsView.player = player
    }
}

#else
#endif
