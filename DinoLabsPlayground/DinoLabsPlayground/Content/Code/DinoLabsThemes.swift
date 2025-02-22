//
//  DinoLabsThemeControl.swift
//
//  Created by Peter Iacobelli on 2/22/25.
//

import SwiftUI
import AppKit

enum CodeEditorTheme {
    case defaultTheme
    case lightTheme
    case darkTheme
}

struct ThemeColorProvider {
    static func defaultTextColor(for theme: CodeEditorTheme) -> NSColor {
        switch theme {
        case .defaultTheme:
            return NSColor(hex: 0xFFFFFF)
        case .lightTheme:
            return NSColor(hex: 0xFFFFFF)
        case .darkTheme:
            return NSColor(hex: 0xFFFFFF)
        }
    }
    
    static func tokenColor(for tokenType: String?, theme: CodeEditorTheme) -> NSColor {
        guard let t = tokenType else {
            return fallbackColor(for: theme)
        }
        
        switch theme {
        case .defaultTheme:
            switch t {
            case "keyword", "decorator", "annotation":
                return NSColor(hex: 0xC586C0)
            case "string", "jsx-string", "hex-color", "property-value":
                return NSColor(hex: 0xCE9178)
            case "comment":
                return NSColor(hex: 0x6A9955)
            case "number", "constant":
                return NSColor(hex: 0xB5CEA8)
            case "operator", "regex", "boolean", "text",
                 "arrow", "spread", "generator", "event-handler", "join-type",
                 "memory-address", "register", "instruction", "important",
                 "semicolon":
                return NSColor(hex: 0xD4D4D4)
            case "datatype", "builtin", "standard-library":
                return NSColor(hex: 0x4EC9B0)
            case "function", "method", "magic-method":
                return NSColor(hex: 0xDCDCAA)
            case "variable", "variable-interpolation", "superglobal",
                 "jsx-attribute", "key", "parameter", "property":
                return NSColor(hex: 0x9CDCFE)
            case "type", "type-hint", "nullish", "optional",
                 "property-name", "class", "label":
                return NSColor(hex: 0x569CD6)
            case "template-placeholder", "protocol", "namespace", "namespace-use":
                return NSColor(hex: 0xC586C0)
            case "class-name", "enum", "struct", "trait":
                return NSColor(hex: 0xCE9178)
            case "directive", "macro":
                return NSColor(hex: 0xC586C0)
            case "filepath":
                return NSColor(hex: 0xB5CEA8)
            case "preprocessor":
                return NSColor(hex: 0xFF00FF)
            case "jsx-tag":
                return NSColor(hex: 0x569CD6)
            case "aggregate-function":
                return NSColor(hex: 0xC586C0)
            case "date-function":
                return NSColor(hex: 0xB5CEA8)
            case "schema", "lifetime":
                return NSColor(hex: 0xC586C0)
            case "interface":
                return NSColor(hex: 0xA0E1FB)
            case "type-annotation":
                return NSColor(hex: 0xB5CEA8)
            case "tag", "doctype", "doctype-declaration":
                return NSColor(hex: 0x569CD6)
            case "attribute":
                return NSColor(hex: 0x9CDCFE)
            case "entity":
                return NSColor(hex: 0xB5CEA8)
            case "processing-instruction":
                return NSColor(hex: 0xC586C0)
            case "selector":
                return NSColor(hex: 0x569CD6)
            case "unit":
                return NSColor(hex: 0xB5CEA8)
            case "vendor-prefix":
                return NSColor(hex: 0xC586C0)
            case "at-rule":
                return NSColor(hex: 0xFF00FF)
            default:
                return NSColor(hex: 0xFFFFFF)
            }
            
        case .lightTheme:
            switch t {
            case "keyword", "decorator", "annotation":
                return NSColor.systemPurple
            case "string", "jsx-string", "hex-color", "property-value":
                return NSColor.systemRed
            case "comment":
                return NSColor.systemGreen
            case "number", "constant":
                return NSColor.systemOrange
            case "operator", "regex", "boolean", "text",
                 "arrow", "spread", "generator", "event-handler", "join-type",
                 "memory-address", "register", "instruction", "important",
                 "semicolon":
                return NSColor.labelColor
            case "datatype", "builtin", "standard-library":
                return NSColor.systemTeal
            case "function", "method", "magic-method":
                return NSColor.systemBlue
            case "variable", "variable-interpolation", "superglobal",
                 "jsx-attribute", "key", "parameter", "property":
                return NSColor.systemBrown
            case "type", "type-hint", "nullish", "optional",
                 "property-name", "class", "label":
                return NSColor.systemIndigo
            case "template-placeholder", "protocol", "namespace", "namespace-use":
                return NSColor.systemPurple
            case "class-name", "enum", "struct", "trait":
                return NSColor.systemRed
            case "directive", "macro":
                return NSColor.systemPurple
            case "filepath":
                return NSColor.systemOrange
            case "preprocessor":
                return NSColor.magenta
            case "jsx-tag":
                return NSColor.systemBlue
            case "aggregate-function":
                return NSColor.systemPurple
            case "date-function":
                return NSColor.systemOrange
            case "schema", "lifetime":
                return NSColor.systemPurple
            case "interface":
                return NSColor.systemBlue
            case "type-annotation":
                return NSColor.systemOrange
            case "tag", "doctype", "doctype-declaration":
                return NSColor.systemBlue
            case "attribute":
                return NSColor.systemBrown
            case "entity":
                return NSColor.systemPurple
            case "processing-instruction":
                return NSColor.systemPurple
            case "selector":
                return NSColor.systemBlue
            case "unit":
                return NSColor.systemOrange
            case "vendor-prefix":
                return NSColor.systemPurple
            case "at-rule":
                return NSColor.magenta
            default:
                return NSColor.labelColor
            }
            
        case .darkTheme:
            switch t {
            case "keyword", "decorator", "annotation":
                return NSColor.systemPink
            case "string", "jsx-string", "hex-color", "property-value":
                return NSColor.systemYellow
            case "comment":
                return NSColor.systemGreen
            case "number", "constant":
                return NSColor.systemOrange
            case "operator", "regex", "boolean", "text",
                 "arrow", "spread", "generator", "event-handler", "join-type",
                 "memory-address", "register", "instruction", "important",
                 "semicolon":
                return NSColor(hex: 0xEEEEEE)
            case "datatype", "builtin", "standard-library":
                return NSColor.systemTeal
            case "function", "method", "magic-method":
                return NSColor.systemBlue
            case "variable", "variable-interpolation", "superglobal",
                 "jsx-attribute", "key", "parameter", "property":
                return NSColor.systemPurple
            case "type", "type-hint", "nullish", "optional",
                 "property-name", "class", "label":
                return NSColor(hex: 0xFF7777)
            case "template-placeholder", "protocol", "namespace", "namespace-use":
                return NSColor.systemPink
            case "class-name", "enum", "struct", "trait":
                return NSColor.systemYellow
            case "directive", "macro":
                return NSColor.systemPink
            case "filepath":
                return NSColor.systemOrange
            case "preprocessor":
                return NSColor(hex: 0xFF00FF)
            case "jsx-tag":
                return NSColor.systemBlue
            case "aggregate-function":
                return NSColor.systemPink
            case "date-function":
                return NSColor.systemOrange
            case "schema", "lifetime":
                return NSColor.systemPink
            case "interface":
                return NSColor.systemBlue
            case "type-annotation":
                return NSColor.systemOrange
            case "tag", "doctype", "doctype-declaration":
                return NSColor.systemBlue
            case "attribute":
                return NSColor.systemPurple
            case "entity":
                return NSColor.systemPink
            case "processing-instruction":
                return NSColor.systemPink
            case "selector":
                return NSColor.systemBlue
            case "unit":
                return NSColor.systemOrange
            case "vendor-prefix":
                return NSColor.systemPink
            case "at-rule":
                return NSColor(hex: 0xFF00FF)
            default:
                return NSColor.white
            }
        }
    }
    
    static func fallbackColor(for theme: CodeEditorTheme) -> NSColor {
        switch theme {
        case .defaultTheme:
            return NSColor(hex: 0xFFFFFF)
        case .lightTheme:
            return NSColor(hex: 0xFFFFFF)
        case .darkTheme:
            return NSColor(hex: 0xFFFFFF)
        }
    }
    
    static func lineNumberTextColor(for theme: CodeEditorTheme) -> NSColor {
        switch theme {
        case .defaultTheme:
            return NSColor(hex: 0xc0c0c0)
        case .lightTheme:
            return NSColor(hex: 0xc0c0c0)
        case .darkTheme:
            return NSColor(hex: 0xc0c0c0)
        }
    }
}
