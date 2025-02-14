//
//  StructManager.swift
//  DinoLabsPlayground
//
//  Created by Peter Iacobelli on 2/12/25.
//

import Foundation

struct ErrorResponse: Codable {
    let message: String
}

struct LoginResponse: Codable {
    let userid: String
    let orgid: String
    let token: String
}
