//
//  DateManager.swift
//
//  Created by Peter Iacobelli on 2/12/25.
//

import Foundation
import SwiftUI

extension ISO8601DateFormatter {
    static var shared: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime]
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        return formatter
    }()
}

extension Date {
    func timeAgoSinceDate() -> String {
        let fromDate = self
        let toDate = Date()
        let calendar = Calendar.current

        let components = calendar.dateComponents([.year, .month, .weekOfYear, .day, .hour, .minute], from: fromDate, to: toDate)

        if let years = components.year, years > 0 {
            return "\(years) \(years == 1 ? "year" : "years") ago"
        } else if let months = components.month, months > 0 {
            return "\(months) \(months == 1 ? "month" : "months") ago"
        } else if let weeks = components.weekOfYear, weeks > 0 {
            return "\(weeks) \(weeks == 1 ? "week" : "weeks") ago"
        } else if let days = components.day, days > 0 {
            return "\(days) \(days == 1 ? "day" : "days") ago"
        } else if let hours = components.hour, hours > 0 {
            return "\(hours) \(hours == 1 ? "hour" : "hours") ago"
        } else if let minutes = components.minute, minutes > 0 {
            return "\(minutes) \(minutes == 1 ? "minute" : "minutes") ago"
        } else {
            return "just now"
        }
    }
}
