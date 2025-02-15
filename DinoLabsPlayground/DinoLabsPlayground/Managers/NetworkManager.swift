//
//  NetworkMonitor.swift
//
//  Created by Peter Iacobelli on 2/12/25.
//

import SwiftUI
import Network

class NetworkMonitor: ObservableObject {
    private var monitor: NWPathMonitor
    private var queue: DispatchQueue
    @Published var isConnected: Bool = false
    @Published var signalStrength: String = "No Connection"
    @Published var downloadSpeed: String = "Calculating..."
    
    private var speedTestURL: URL {
        URL(string: "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png")!
    }
    
    init() {
        monitor = NWPathMonitor()
        queue = DispatchQueue.global(qos: .background)
        monitor.pathUpdateHandler = { [weak self] path in
            DispatchQueue.main.async {
                self?.isConnected = (path.status == .satisfied)
                self?.updateSignalStrength()
                if self?.isConnected == true {
                    self?.startSpeedTest()
                } else {
                    self?.downloadSpeed = "No Connection"
                }
            }
        }
        monitor.start(queue: queue)
        let currentPath = monitor.currentPath
        DispatchQueue.main.async {
            self.isConnected = (currentPath.status == .satisfied)
            self.updateSignalStrength()
            if self.isConnected {
                self.startSpeedTest()
            } else {
                self.downloadSpeed = "No Connection"
            }
        }
    }
    
    deinit {
        monitor.cancel()
    }
    
    private func updateSignalStrength() {
        if !isConnected {
            signalStrength = "No Connection"
        } else {
            if downloadSpeed == "Calculating..." || downloadSpeed == "No Connection" {
                signalStrength = "Connected"
            }
        }
    }
    
    private func startSpeedTest() {
        DispatchQueue.global(qos: .background).async {
            self.measureDownloadSpeed()
        }
    }
    
    private func measureDownloadSpeed() {
        let startTime = CFAbsoluteTimeGetCurrent()
        let task = URLSession.shared.dataTask(with: speedTestURL) { data, response, error in
            guard error == nil, let data = data else {
                DispatchQueue.main.async {
                    self.downloadSpeed = "Error"
                    self.signalStrength = "No Connection"
                }
                return
            }
            let elapsedTime = CFAbsoluteTimeGetCurrent() - startTime
            let speedMbps = Double(data.count) / elapsedTime / 1024 / 1024 * 8
            DispatchQueue.main.async {
                self.downloadSpeed = String(format: "%.2f Mbps", speedMbps)
                self.updateSignalStrengthBasedOnSpeed(speedMbps)
            }
        }
        task.resume()
    }
    
    private func updateSignalStrengthBasedOnSpeed(_ speed: Double) {
        switch speed {
        case 0..<1:
            signalStrength = "Poor Connection"
        case 1..<5:
            signalStrength = "Moderate Connection"
        case 5..<20:
            signalStrength = "Good Connection"
        case 20...:
            signalStrength = "Excellent Connection"
        default:
            signalStrength = "Unknown"
        }
    }
}
