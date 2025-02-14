//
//  SecurityManager.swift
//  DinoLabsPlayground
//
//  Created by Peter Iacobelli on 2/12/25.
//

import Foundation
import Security

func saveTokenToKeychain(token: String) {
    let tokenData = token.data(using: .utf8)!
    let query = [
        kSecClass: kSecClassGenericPassword,
        kSecAttrAccount: "authToken",
        kSecValueData: tokenData
    ] as CFDictionary

    SecItemDelete(query)

    SecItemAdd(query, nil)
}

func loadTokenFromKeychain() -> String? {
    let query = [
        kSecClass: kSecClassGenericPassword,
        kSecAttrAccount: "authToken",
        kSecReturnData: true,
        kSecMatchLimit: kSecMatchLimitOne
    ] as CFDictionary

    var dataTypeRef: AnyObject? = nil
    let status = SecItemCopyMatching(query, &dataTypeRef)

    if status == errSecSuccess {
        if let tokenData = dataTypeRef as? Data {
            return String(data: tokenData, encoding: .utf8)
        }
    }
    return nil
}

func deleteTokenFromKeychain() {
    let query = [
        kSecClass: kSecClassGenericPassword,
        kSecAttrAccount: "authToken"
    ] as CFDictionary

    let status = SecItemDelete(query)
}

func isTokenExpired(token: String) -> Bool {
    let parts = token.split(separator: ".")
    guard parts.count == 3 else {
        return true
    }

    let payload = parts[1]
    var base64String = String(payload)
    while base64String.count % 4 != 0 {
        base64String.append("=")
    }

    guard let decodedData = Data(base64Encoded: base64String) else {
        return true
    }

    guard let json = try? JSONSerialization.jsonObject(with: decodedData, options: []),
          let dict = json as? [String: Any],
          let exp = dict["exp"] as? TimeInterval else {
        return true
    }

    let expirationDate = Date(timeIntervalSince1970: exp)
    let isExpired = Date() > expirationDate
    return isExpired
}
