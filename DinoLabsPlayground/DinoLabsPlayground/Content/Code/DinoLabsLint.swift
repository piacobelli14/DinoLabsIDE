//
//  DinoLabsLint.swift
//
//  Created by Peter Iacobelli on 2/25/25.
//

struct LintError {
    let line: Int
    let col: Int
    let message: String
}

struct BracketToken {
    let char: Character
    let line: Int
    let col: Int
}
