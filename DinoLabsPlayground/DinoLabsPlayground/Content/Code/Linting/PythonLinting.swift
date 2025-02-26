import Foundation

func lintPython(_ code: String) -> [[String: Any]] {
    var errors = [[String: Any]]()
    var stack = [(char: Character, line: Int, col: Int)]()
    var line = 1
    var col = 0
    var inString = false
    var stringChar: Character? = nil
    var inTripleString = false
    var escape = false
    var inComment = false
    var bracketDepthAtLine = [Int: Int]()
    var currentBracketDepth = 0

    func charAt(_ index: Int) -> Character? {
        if index >= 0 && index < code.count {
            return code[code.index(code.startIndex, offsetBy: index)]
        }
        return nil
    }

    func substring(_ start: Int, length: Int) -> String? {
        if start >= 0 && (start + length) <= code.count {
            let s = code.index(code.startIndex, offsetBy: start)
            let e = code.index(s, offsetBy: length)
            return String(code[s..<e])
        }
        return nil
    }

    let totalLength = code.count
    var i = 0
    while i < totalLength {
        let c = charAt(i)!
        if inString && !inTripleString && c == "\\" && charAt(i+1) == "\n" {
            i += 1
            line += 1
            col = 0
            i += 1
            continue
        }
        if inString && !inTripleString && c == "\n" {
            errors.append(["line": line, "col": col, "message": "EOL while scanning string literal"])
            inString = false
        }
        if c == "\n" {
            bracketDepthAtLine[line] = currentBracketDepth
            line += 1
            col = 0
            inComment = false
            i += 1
            continue
        }
        col += 1
        if inComment {
            i += 1
            continue
        }
        if inString {
            if escape {
                escape = false
                i += 1
                continue
            }
            if c == "\\" {
                let allowedEscapes = ["'", "\"", "\\", "a", "b", "f", "n", "r", "t", "v"]
                if let nextC = charAt(i+1), nextC != "\n", !allowedEscapes.contains(String(nextC)) {
                    errors.append(["line": line, "col": col, "message": "Invalid escape sequence \\\(nextC)"])
                }
                escape = true
                i += 1
                continue
            }
            if inTripleString {
                if let sub = substring(i, length: 3), let sc = stringChar, sub == String(repeating: sc, count: 3) {
                    inString = false
                    inTripleString = false
                    i += 3
                    col += 2
                    continue
                }
                i += 1
                continue
            } else {
                if let sc = stringChar, c == sc {
                    inString = false
                    stringChar = nil
                }
                i += 1
                continue
            }
        }
        if c == "#" {
            inComment = true
            i += 1
            continue
        }
        if c == "'" || c == "\"" {
            if let sub = substring(i, length: 3), sub == String(repeating: c, count: 3) {
                inString = true
                inTripleString = true
                stringChar = c
                i += 3
                col += 2
                continue
            } else {
                inString = true
                inTripleString = false
                stringChar = c
                i += 1
                continue
            }
        }
        if c == "(" || c == "[" || c == "{" {
            stack.append((c, line, col))
            currentBracketDepth += 1
            i += 1
            continue
        }
        if c == ")" || c == "]" || c == "}" {
            if stack.isEmpty {
                errors.append(["line": line, "col": col, "message": "Unmatched closing '\(c)'"])
            } else {
                let last = stack.removeLast()
                if (last.char == "(" && c != ")")
                    || (last.char == "[" && c != "]")
                    || (last.char == "{" && c != "}") {
                    errors.append(["line": line, "col": col, "message": "Mismatched closing '\(c)'; expected closing for '\(last.char)' from line \(last.line), col \(last.col)"])
                }
            }
            currentBracketDepth = max(0, currentBracketDepth - 1)
            i += 1
            continue
        }
        i += 1
    }

    bracketDepthAtLine[line] = currentBracketDepth
    if inString {
        errors.append(["line": line, "col": col, "message": "Unclosed string literal"])
    }
    while !stack.isEmpty {
        let unclosed = stack.removeLast()
        errors.append(["line": unclosed.line, "col": unclosed.col, "message": "Unclosed '\(unclosed.char)'"])
    }

    let codeLines = code.components(separatedBy: CharacterSet.newlines)
    for (index, ln) in codeLines.enumerated() {
        let lineNumber = index + 1
        if ln.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            continue
        }
        let leadingWhitespace = ln.prefix { $0 == " " || $0 == "\t" }
        if leadingWhitespace.contains(" ") && leadingWhitespace.contains("\t") {
            errors.append(["line": lineNumber, "col": 1, "message": "Mixed tabs and spaces in indentation"])
        }
        let lineBracketDepth = bracketDepthAtLine[lineNumber] ?? 0
        if lineBracketDepth == 0 {
            let trimmed = ln.trimmingCharacters(in: .whitespaces)
            if let _ = trimmed.range(of: "^(if|elif|else|for|while|def|class|try|except|finally|with)\\b", options: .regularExpression) {
                if !trimmed.hasSuffix(":") {
                    errors.append(["line": lineNumber, "col": ln.count, "message": "Missing colon at end of block header"])
                }
            }
        }
    }
    return errors
}
