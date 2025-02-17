//
//  SecurityManager.swift
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
        kSecAttrService: Bundle.main.bundleIdentifier ?? "com.dinolabs.playground",
        kSecValueData: tokenData
    ] as CFDictionary

    deleteTokenFromKeychain()
    
    let status = SecItemAdd(query, nil)
    if status != errSecSuccess {
        return
    }
}

func loadTokenFromKeychain() -> String? {
    let query = [
        kSecClass: kSecClassGenericPassword,
        kSecAttrAccount: "authToken",
        kSecAttrService: Bundle.main.bundleIdentifier ?? "com.dinolabs.playground",
        kSecReturnData: true,
        kSecMatchLimit: kSecMatchLimitOne
    ] as CFDictionary

    var dataTypeRef: AnyObject?
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
        kSecAttrAccount: "authToken",
        kSecAttrService: Bundle.main.bundleIdentifier ?? "com.dinolabs.playground"
    ] as CFDictionary

    let status = SecItemDelete(query)
    if status != errSecSuccess && status != errSecItemNotFound {
        return
    }
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
