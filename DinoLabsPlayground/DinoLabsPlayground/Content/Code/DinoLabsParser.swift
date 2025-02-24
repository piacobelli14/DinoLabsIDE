//
//  DinoLabsParser.swift
//
//  Created by Peter Iacobelli on 2/22/25.
//

import Foundation
import AppKit

public struct SwiftParser {
    
    public struct Token {
        public var value: String
        public var type: String?
        public var lineNumber: Int
    }
    
    public static func getTokenPatterns(_ language: String) -> [String]? {
        switch language.lowercased() {
        case "python":
            return [
                #"\b(False|class|finally|is|return|None|continue|for|lambda|try|True|def|from|nonlocal|while|and|del|global|not|with|as|elif|if|or|yield|assert|else|import|pass|break|except|in|raise|async|await|match|case)\b"#,
                #"(@[a-zA-Z_][a-zA-Z0-9_]*)"#,
                #"("(?:(?:[^"\\]|\\.)*)"|'(?:(?:[^'\\]|\\.)*)')"#,
                #"\b([a-zA-Z_][a-zA-Z0-9_]*)\b(?=\()"#,
                #"(\b\d+(?:\.\d+)?\b)"#,
                #"([+\-*/%=&|<>!^~()\[\]{}]+)"#,
                #"((?:"""[\s\S]*?"""|'''[\s\S]*?'''))"#,
                #"(#.*)"#,
                #"\b([a-zA-Z_][a-zA-Z0-9_]*)\b"#,
                #"\b(print|len|range|open|str|int|float|list|dict|set|tuple|super|self)\b"#,
                #"\b(self|cls)\b"#,
                #"\b(async|await)\b"#,
                #"\b(List|Dict|Tuple|Optional|Union|Any|Callable|Iterable|Iterator|Generator|TypeVar|Generic|Protocol)\b"#,
                #"__([a-zA-Z_]+)__"#
            ]
        case "typescript":
            return [
                #"\b(break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|function|if|import|in|instanceof|let|new|return|super|switch|this|throw|try|typeof|var|void|while|with|yield|await|implements|interface|package|private|protected|public|static|enum|null|true|false|as|async|await|declare|from|get|module|of|set|type)\b"#,
                #"(@[a-zA-Z_][a-zA-Z0-9_]*)"#,
                #"((?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'))"#,
                #"((?:\/\/.*)|(?:\/\*[^*]*\*+(?:[^/*][^*]*\*+)\/))"#,
                #"(\b\d+(?:\.\d+)?\b)"#,
                #"([==!=<>]=|[-+*/%&|^~<>()\[\]{}]=?)"#,
                #"\b([a-zA-Z_][a-zA-Z0-9_]*)\b(?=\()"#,
                #"\b([a-zA-Z_][a-zA-Z0-9_]*)\b"#,
                #"\b(console|window|document|require|module|exports|React|useState|useEffect|props|state)\b"#,
                #"\b(Array|String|Number|Boolean|Object|Function|Date|RegExp|Map|Set|WeakMap|WeakSet|Promise|ReadonlyArray|Symbol|BigInt)\b"#,
                #"\b(Array|String|Number|Boolean|Object|Function|Date|RegExp|Map|Set|WeakMap|WeakSet|Promise|ReadonlyArray|Symbol|BigInt)\b"#,
                #"</?[A-Z][A-Za-z0-9]+\b"#,
                #"\$\{[^}]+\}"#
            ]
        case "javascript", "react", "node", "express":
            return [
                #"\b(break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|function|if|import|in|instanceof|let|new|return|super|switch|this|throw|try|typeof|var|void|while|with|yield|await|implements|interface|package|private|protected|public|static|enum|null|true|false)\b"#,
                #"(@[a-zA-Z_][a-zA-Z0-9_]*)"#,
                #"((?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`))"#,
                #"((?:\/\/.*)|(?:\/\*[^*]*\*+(?:[^/*][^*]*\*+)\/))"#,
                #"(\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)"#,
                #"(\/(?:\\/|[^/\n])+\/[gimsuy]*)"#,
                #"([==!=<>]=|[-+*/%&|^~<>()\[\]{}]=?|===|!==|>>>=|<<=|>>=)"#,
                #"\b([a-zA-Z_][a-zA-Z0-9_]*)\b(?=\()"#,
                #"\b([a-zA-Z_][a-zA-Z0-9_]*)\b"#,
                #"\b(console|window|document|require|module|exports|React|useState|useEffect|props|state)\b"#,
                #"\b(Array|String|Number|Boolean|Object|Function|Date|RegExp|Map|Set|WeakMap|WeakSet|Promise|ReadonlyArray|Symbol|BigInt)\b"#,
                #"</?[A-Z][A-Za-z0-9]+\b"#,
                #"\$\{[^}]+\}"#
            ]
        case "bash", "shell":
            return [
                #"\b(if|then|else|fi|for|while|do|done|case|esac|function|in|select|until|declare|readonly|return|continue|break|export|local|shift|getopts|echo|printf|source|alias|unalias|true|false|cd|pwd|ls|grep|awk|sed|mkdir|rmdir|touch|rm|cp|mv|chmod|chown|declare|typeset|readonly|let)\b"#,
                #"\b(echo|printf|cd|pwd|ls|grep|awk|sed|mkdir|rmdir|touch|rm|cp|mv|chmod|chown|declare|typeset|readonly|let)\b"#,
                #"\b([a-zA-Z_][a-zA-Z0-9_]*)"#,
                #"(\\$\[a-zA-Z_][a-zA-Z0-9_]*\|\\$[a-zA-Z_][a-zA-Z0-9_]*)"#,
                #"(@[a-zA-Z_][a-zA-Z0-9_]*)"#,
                #"("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')"#,
                #"(#.*)"#,
                #"\b(\d+(?:\.\d+)?)\b"#,
                #"([;&|<>!+\-*/%=()\[\]{}]+)"#,
                #"(/(?:[a-zA-Z0-9_.-]+/)*[a-zA-Z0-9_.-]+)"#
            ]
        case "c":
            return [
                #"(#\s*(?:include|define|ifndef|ifdef|endif|else|elif|if|pragma|undef|line|error|warning)\b[^\n]*)"#,
                #"\b(auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|inline|int|long|register|restrict|return|short|signed|sizeof|static|struct|switch|typedef|union|unsigned|void|volatile|while)\b"#,
                #"(@[a-zA-Z_][a-zA-Z0-9_]*)"#,
                #"((?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'))"#,
                #"((?:\/\/.*)|(?:\/\*[^*]*\*+(?:[^/*][^*]*\*+)\/))"#,
                #"(\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)"#,
                #"([==!=<>]=|[-+*/%&|^~<>()\[\]{}]=?|->|\.|,)"#,
                #"\b([a-zA-Z_][a-zA-Z0-9_]*)\b(?=\()"#,
                #"\b([a-zA-Z_][a-zA-Z0-9_]*)\b"#,
                #"#include\s*<[^>]+>"#,
                #"#ifndef\s+\w+"#,
                #"#define\s+\w+"#,
                #"#endif"#,
                #"\b(printf|scanf|cout|cin|std|this|super|self|new|delete|nullptr|std|vector|map|unordered_map|string|iostream|cin|cout)\b"#,
                #"\b(std|vector|map|unordered_map|string|iostream|cin|cout)\b"#,
                #"\b(nullptr|NULL)\b"#,
                #"<\s*typename\s+[a-zA-Z_][a-zA-Z0-9]*\s*>"#,
                #":\s*(public|protected|private)\s+[a-zA-Z_][a-zA-Z0-9_]*"#
            ]
        case "c++":
            return [
                #"(#\s*(?:include|define|ifndef|ifdef|endif|else|elif|if|pragma|undef|line|error|warning)\b[^\n]*)"#,
                #"\b(auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|inline|int|long|register|restrict|return|short|signed|sizeof|static|struct|switch|typedef|union|unsigned|void|volatile|while|class|public|private|protected|namespace|using|template|typename|virtual|override)\b"#,
                #"(@[a-zA-Z_][a-zA-Z0-9_]*)"#,
                #"((?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'))"#,
                #"((?:\/\/.*)|(?:\/\*[^*]*\*+(?:[^/*][^*]*\*+)\/))"#,
                #"(\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)"#,
                #"([==!=<>]=|[-+*/%&|^~<>]=?|::|->|\.\.{2,})"#,
                #"\b([a-zA-Z_][a-zA-Z0-9_]*)\b(?=\()"#,
                #"\b([a-zA-Z_][a-zA-Z0-9_]*)\b"#,
                #"#include\s*<[^>]+>"#,
                #"#ifndef\s+\w+"#,
                #"#define\s+\w+"#,
                #"#endif"#,
                #"\b(printf|scanf|cout|cin|std|this|super|self|new|delete|nullptr|std|vector|map|unordered_map|string|iostream|cin|cout)\b"#,
                #"\b(std|vector|map|unordered_map|string|iostream|cin|cout)\b"#,
                #"\b(nullptr|NULL)\b"#,
                #"<\s*typename\s+[a-zA-Z_][a-zA-Z0-9]*\s*>"#,
                #":\s*(public|protected|private)\s+[a-zA-Z_][a-zA-Z0-9_]*"#
            ]
        case "c#":
            return [
                #"(#\s*(?:include|define|ifndef|ifdef|endif|else|elif|if|pragma|undef|line|error|warning)\b[^\n]*)"#,
                #"\b(abstract|and|as|base|bool|break|byte|case|catch|char|checked|class|const|continue|decimal|default|delegate|do|double|else|enum|event|explicit|extern|false|finally|fixed|float|for|foreach|goto|if|implicit|in|int|interface|internal|is|lock|long|namespace|new|null|object|operator|out|override|params|private|protected|public|readonly|ref|return|sbyte|sealed|short|sizeof|stackalloc|static|string|struct|switch|this|throw|true|try|typeof|uint|ulong|unchecked|unsafe|ushort|using|virtual|void|volatile|while)\b"#,
                #"(@[a-zA-Z_][a-zA-Z0-9_]*)"#,
                #"((?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'))"#,
                #"((?:\/\/.*)|(?:\/\*[^*]*\*+(?:[^/*][^*]*\*+)\/))"#,
                #"(\b\d+(?:\.\d+)?\b)"#,
                #"([==!=<>]=|[-+*/%&|^~<>]=?)"#,
                #"\b([a-zA-Z_][a-zA-Z0-9_]*)\b(?=\()"#,
                #"\b([a-zA-Z_][a-zA-Z0-9_]*)\b"#,
                #"#define\s+[a-zA-Z_][a-zA-Z0-9_]*"#,
                #"#using\s+[""<][^"">]+[">]"#,
                #"#namespace\s+[a-zA-Z_][a-zA-Z0-9_.]*"#,
                #"\b(Console|Math|String|List|Dictionary|Array|Task|Exception|Convert|Environment|Guid|DateTime|TimeSpan|Nullable|IEnumerable|IList|ICollection|Stream|File|Directory)\b"#,
                #"\b(Int32|Int64|String|Boolean|Double|Decimal|Object|Void|Char|Byte|Float|UInt32|UInt64|Short|UShort|Long|ULong|SByte)\b"#,
                #"<[a-zA-Z_][a-zA-Z0-9_, ]*>"#,
                #"\b(System|Microsoft|Collections|Generic|Linq|Text|Tasks)\b"#,
                #"\b([A-Z][a-zA-Z0-9_]*)\b"#
            ]
        case "swift":
            return [
                #"\b(import|class|deinit|enum|extension|func|init|let|protocol|struct|subscript|typealias|var|break|case|continue|default|defer|do|else|fallthrough|for|guard|if|in|repeat|return|switch|where|while|as|Any|catch|false|is|nil|rethrows|super|self|Self|throw|throws|true|try|associatedtype|dynamic|fileprivate|final|inout|lazy|open|nonmutating|optional|override|private|public|required|static|unowned|weak|willSet|didSet|throws|async|await|actor|convenience|dynamicType)\b"#,
                #"(@[a-zA-Z_][a-zA-Z0-9_]*)"#,
                #"((?:"(?:[^"\\]|\\.)*")|(?:'(?:[^'\\]|\\.)*'))"#,
                #"((?:\/\/.*)|(?:\/\*[^*]*\*+(?:[^/*][^*]*\*+)\/))"#,
                #"(\b\d+(?:\.\d+)?\b)"#,
                #"([==!=<>]=|[-+*/%&|^~<>()\[\]{}]=?|\.|\?|:)"#,
                #"\b([a-zA-Z_][a-zA-Z0-9_]*)\b(?=\()"#,
                #"\b([a-zA-Z_][a-zA-Z0-9_]*)\b"#,
                #"\b(print|map|filter|reduce|guard|guard let|guard var|let|var)\b"#,
                #"\b(Int|String|Bool|Double|Float|Array|Dictionary|Set|Optional|Any|AnyObject|Void|Never)\b"#,
                #"\b(self|super)\b"#,
                #":\s*([A-Z][a-zA-Z0-9_]*|[a-z]+)"#
            ]
        case "php":
            return [
                #"\b(abstract|and|array|as|break|callable|case|catch|class|clone|const|continue|declare|default|die|do|echo|else|elseif|empty|enddeclare|endfor|endforeach|endif|endswitch|endwhile|extends|final|finally|fn|for|foreach|function|global|goto|if|implements|include|include_once|instanceof|insteadof|interface|isset|list|namespace|new|or|print|private|protected|public|require|require_once|return|static|switch|throw|trait|try|unset|use|var|while|xor|yield|bool|int|float|string|void|iterable|object|null|true|false)\b"#,
                #"(@[a-zA-Z_][a-zA-Z0-9_]*)"#,
                #"((?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'))"#,
                #"((?:\/\/.*)|(?:\/\*[^*]*\*+(?:[^/*][^*]*\*+)\/)|(?:#.*))"#,
                #"(\b\d+(?:\.\d+)?\b)"#,
                #"([==!=<>]=|[-+*/%&|^~<>()\[\]{}]=?|->|\.|\.\.|::)"#,
                #"\b([a-zA-Z_][a-zA-Z0-9_]*)\b(?=\()"#,
                #"\b([a-zA-Z_][a-zA-Z0-9_]*)\b"#,
                #"(\\$[a-zA-Z_][a-zA-Z0-9_]*)"#,
                #"\b([A-Z][a-zA-Z0-9_]*)\b"#,
                #"\b(echo|print|var_dump|isset|empty|unset|require|include)\b"#,
                #"\b(mysqli|PDO|stdClass|Exception|DateTime|ArrayObject|Closure|Generator|Iterator|SplObjectStorage)\b"#,
                #"\b(null|true|false)\b"#,
                #"\b(_GET|_POST|_SESSION|_COOKIE|_SERVER|_REQUEST|_FILES|_ENV)\b"#,
                #"\\[a-zA-Z_][a-zA-Z0-9_]*"#
            ]
        case "sql":
            return [
                #"\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|JOIN|INNER|LEFT|RIGHT|FULL|ON|AS|INTO|VALUES|SET|AND|OR|NOT|NULL|LIKE|BETWEEN|EXISTS|PRIMARY|KEY|FOREIGN|GROUP|BY|ORDER|HAVING|LIMIT|OFFSET|DISTINCT|UNION|ALL|ANY|IN|EXCEPT|INTERSECT|CASE|WHEN|THEN|ELSE|END|CAST|CONVERT|ISNULL|COALESCE|TOP|IDENTITY|ROW_NUMBER|OVER|PARTITION|RANK|DENSE_RANK|CURRENT_DATE|CURRENT_TIME|CURRENT_TIMESTAMP)\b"#,
                #"((?:'(?:''|[^'])*')|(?:\"(?:\\\"|[^\"])*\"))"#,
                #"(--[^\n\r]*)"#,
                #"(\b\d+(?:\.\d+)?\b)"#,
                #"(=|<>|!=|<|>|<=|>=|\+|\-|\*|/|%|\(|\)|\[|\]|\{|\})"#,
                #"\b([a-zA-Z_][a-zA-Z0-9_]*)\b(?=\()"#,
                #"\b([a-zA-Z_][a-zA-Z0-9_]*)\b"#,
                #"(\\bDATE\\b|\\bINT\\b|\\bVARCHAR\\b|\\bTEXT\\b|\\bBOOLEAN\\b|\\bDECIMAL\\b|\\bFLOAT\\b|\\bNUMERIC\\b|\\bCHAR\\b|\\bDATETIME\\b|\\bTIMESTAMP\\b)"#,
                #"\b(COUNT|SUM|AVG|MIN|MAX|NOW|COALESCE|NULLIF|DATEADD|DATEDIFF|GROUP_CONCAT|STDEV|VAR)\b"#,
                #"\b(CURRENT_DATE|CURRENT_TIME|CURRENT_TIMESTAMP|GETDATE|GETUTCDATE|DATEPART|DATEADD|DATEDIFF|FORMAT)\b"#,
                #"\b(INNER JOIN|LEFT JOIN|RIGHT JOIN|FULL OUTER JOIN|CROSS JOIN|NATURAL JOIN)\b"#
            ]
        case "monkey c":
            return [
                #"\b(function|end|if|else|elseif|return|for|while|do|repeat|until|break|continue|switch|case|default|import|export|var|const|let|true|false|null|async|await|struct|enum|typedef|typedefstruct|typedefenum|interface|implements|extends|super|new|delete|typeof|instanceof)\b"#,
                #"(@[a-zA-Z_][a-zA-Z0-9_]*)"#,
                #"((?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'))"#,
                #"((?:\/\/.*)|(?:\/\*[^*]*\*+(?:[^/*][^*]*\*+)\/))"#,
                #"(\b\d+(?:\.\d+)?\b)"#,
                #"([==!=<>]=|[-+*/%&|^~<>]=?|\(|\)|\[|\]|\{|\})"#,
                #"\b([a-zA-Z_][a-zA-Z0-9_]*)\b(?=\()"#,
                #"\b([a-zA-Z_][a-zA-Z0-9_]*)\b"#,
                #"\b([A-Z][a-zA-Z0-9_]*)\b"#,
                #"\b(print|map|filter|reduce|guard|guard let|guard var|let|var|async|await)\b"#,
                #"\b(String|Int|Float|Bool|Array|Dictionary|Set|Option|Result|Any|Self)\b"#,
                #"\b(async|await)\b"#,
                #":\s*([A-Z][a-zA-Z0-9_]*|[a-z]+)"#
            ]
        case "rust":
            return [
                #"\b(as|async|await|break|const|continue|crate|dyn|else|enum|extern|false|fn|for|if|impl|in|let|loop|match|mod|move|mut|pub|ref|return|self|static|struct|super|trait|true|type|unsafe|use|where|while|yield|implements|type|as|from|of|async|await|dyn|extern|crate|macro|const|unsafe|trait|where|type|impl|for|fn)\b"#,
                #"(@[a-zA-Z_][a-zA-Z0-9_]*)"#,
                #"((?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'))"#,
                #"((?:\/\/.*)|(?:\/\*[^*]*\*+(?:[^/*][^*]*\*+)\/))"#,
                #"(\b\d+(?:\.\d+)?\b)"#,
                #"([==!=<>]=|[-+*/%&|^~<>]=?|<<=|>>=|&&|\|\||\(|\)|\[\]|\{|\})"#,
                #"\b([a-zA-Z_][a-zA-Z0-9_]*)\b(?=\()"#,
                #"\b([a-zA-Z_][a-zA-Z0-9_]*)\b"#,
                #"\b(println|vec|String|Option|Result|Some|None|println!|format!|print!|dbg!)\b"#,
                #"\b(Vec|HashMap|HashSet|Box|Rc|Arc|RefCell|Mutex|Option|Result)\b"#,
                #"\b(Option|Result)\b"#,
                #"('[a-zA-Z_][a-zA-Z0-9_]*"#
            ]
        case "assembly":
            return [
                #"\b(mov|add|sub|mul|div|jmp|je|jne|jg|jge|jl|jle|cmp|call|ret|push|pop|lea|and|or|xor|not|shl|shr|nop|int|iret|jmp|loop|jmpf|jmpq|callf|callq|retf|retq|hlt|sete|setne|setg|setge|setl|setle|cmove|cmovne|cmovg|cmovge|cmovl|cmovle)\b"#,
                #"\b(eax|ebx|ecx|edx|esi|edi|esp|ebp|rax|rbx|rcx|rdx|rsi|rdi|rsp|rbp|ax|bx|cx|dx|si|di|sp|bp|al|bl|cl|dl|ah|bh|ch|dh|r8|r9|r10|r11|r12|r13|r14|r15|r8d|r9d|r10d|r11d|r12d|r13d|r14d|r15d|r8w|r9w|r10w|r11w|r12w|r13w|r14w|r15w|r8b|r9b|r10b|r11b|r12b|r13b|r14b|r15b)\b"#,
                #"\b(.data|.text|.bss|.global|.extern|.section|.align|.byte|.word|.long|.quad|.ascii|.asciz|.org|.equ|.macro|.endm)\b"#,
                #"(;.*)"#,
                #"((?:0x[0-9a-fA-F]+)|(?:0b[01]+)|(?:\b\d+\b))"#,
                #"\b[a-zA-Z_][a-zA-Z0-9_]*:"#,
                #"\[[a-zA-Z0-9_+\-*/]+\]"#,
                #"([+\-*/%&|^~<>]=?|==|!=|<=|>=|\(|\)|\[|\]|\{|\})"#,
                #"\"(?:[^\"\\]|\\.)*\""#,
                #"\b[a-zA-Z_][a-zA-Z0-9_]*\b"#
            ]
        case "json":
            return [
                #"(\"(?:(?:\\.|[^\"\\])*)\"(?=\s*:))"#,
                #"(\"(?:(?:\\.|[^\"\\])*)\")"#,
                #"(\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)"#,
                #"(\b(?:true|false)\b)"#,
                #"(\bnull\b)"#,
                #"([{}\[\]:,])"#
            ]
        case "css":
            return [
                #"(@media\s*\([^)]*\))"#,
                #"(@(?:media|keyframes|supports)\s+[^{]+)"#,
                #"(@[a-zA-Z-]+[^;{]*;)"#,
                #"(\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\/)"#,
                #"([.#]?[a-zA-Z0-9_-]+(?::[a-zA-Z-]+)*\s*(?=\{|,))"#,
                #"((?:[a-zA-Z-]+\s*:\s*[^;\}]+;))"#,
                #"(#[a-fA-F0-9]{3,8})"#,
                #"([a-zA-Z-]+\([^)]*\))"#,
                #"(\b\d+(?:\.\d+)?(?:px|em|rem|vh|vw|%)\b)"#,
                #"(-(?:webkit|moz|ms|o)-[a-zA-Z-]+)"#,
                #"(!important\b)"#,
                #"(\.[A-Za-z0-9_-]+)"#,
                #"(#[A-Za-z0-9_-]+)"#,
                #"(@\w+)"#,
                #"(\b[A-Za-z-]+:)"#,
                #"(:\s*[^;]+;)"#,
                #"(;(?!\}))"#,
                #"(\b[A-Za-z-]+\b)"#,
                #"(?:"(?:[^\"\\]|\\.)*"|'(?:[^'\\]|\\.)*')"#,
                #"([\(\)\[\]\{\}])"#
            ]
        case "html":
            return [
                #"(<!--[\\s\\S]*?-->)"#,
                #"(<!DOCTYPE[^>]*>)"#,
                #"(<\/?[A-Za-z][A-Za-z0-9]*\b|<\/?|>|\/>)"#,
                #"\s+([A-Za-z][A-Za-z0-9-]*)"#,
                #"(=)"#,
                #"(\"[^\"]*\"|'[^']*')"#,
                #"(&(?:[a-zA-Z0-9]+;|#[0-9]+;|#x[a-fA-F0-9]+;))"#,
                #"([^<>&]+)"#,
                #"([\(\)\[\]\{\}])"#
            ]
        case "xml":
            return [
                #"(<!--[\\s\\S]*?-->)"#,
                #"(<\?[^>]+\?>)"#,
                #"(<\/?[A-Za-z_:][A-Za-z0-9_.:-]*\b|\/>)"#,
                #"\s+([A-Za-z_:][A-Za-z0-9_.:-]*)"#,
                #"(=)"#,
                #"(\"[^\"]*\"|'[^']*')"#,
                #"(&[a-zA-Z0-9]+;|&#[0-9]+;|&#x[a-fA-F0-9]+;)"#,
                #"([^<>&]+)"#,
                #"([\(\)\[\]\{\}])"#
            ]
        case "dockerfile":
            return [
                #"(#[^\n]*)"#,
                #"\b(FROM|RUN|CMD|LABEL|EXPOSE|ENV|ADD|COPY|ENTRYPOINT|VOLUME|USER|WORKDIR|ARG|ONBUILD|STOPSIGNAL|HEALTHCHECK|SHELL)\b"#,
                #"(\"[^\"]*\"|'[^']*')"#,
                #"([^\\s]+)"#
            ]
        case "makefile":
            return [
                #"(#[^\n]*)"#,
                #"^([A-Za-z0-9_./-]+:)"#,
                #"(\\$\([A-Za-z0-9_]+\))"#,
                #"(\"(?:(?:[^\"\\]|\\.)*)\"|'(?:(?:[^'\\]|\\.)*)')"#,
                #"([^\\s]+)"#
            ]
        default:
            return nil
        }
    }
    
    public static let tokenTypes: [String: [String]] = [
        "python": [
            "keyword", "decorator", "string", "function", "number", "operator",
            "string", "comment", "variable", "builtin", "variable", "keyword",
            "type-hint", "magic-method"
        ],
        "typescript": [
            "keyword", "decorator", "string", "comment", "number", "operator",
            "function", "variable", "builtin", "type", "type", "jsx-tag",
            "template-placeholder"
        ],
        "javascript": [
            "keyword", "decorator", "string", "comment", "number", "regex",
            "operator", "function", "variable", "builtin", "type", "jsx-tag",
            "template-placeholder"
        ],
        "react": [
            "keyword", "decorator", "string", "comment", "number", "regex",
            "operator", "function", "variable", "builtin", "type", "jsx-tag",
            "template-placeholder"
        ],
        "node": [
            "keyword", "decorator", "string", "comment", "number", "regex",
            "operator", "function", "variable", "builtin", "type", "jsx-tag",
            "template-placeholder"
        ],
        "express": [
            "keyword", "decorator", "string", "comment", "number", "regex",
            "operator", "function", "variable", "builtin", "type", "jsx-tag",
            "template-placeholder"
        ],
        "bash": [
            "keyword", "command", "variable", "variable-interpolation",
            "decorator", "string", "comment", "number", "operator", "filepath"
        ],
        "shell": [
            "keyword", "command", "variable", "variable-interpolation",
            "decorator", "string", "comment", "number", "operator", "filepath"
        ],
        "c": [
            "preprocessor", "keyword", "decorator", "string", "comment",
            "number", "operator", "function", "variable", "preprocessor",
            "preprocessor", "preprocessor", "preprocessor", "builtin",
            "builtin", "builtin", "type", "class-name"
        ],
        "c++": [
            "preprocessor", "keyword", "decorator", "string", "comment",
            "number", "operator", "function", "variable", "preprocessor",
            "preprocessor", "preprocessor", "preprocessor", "builtin",
            "builtin", "builtin", "type", "class-name"
        ],
        "c#": [
            "preprocessor", "keyword", "decorator", "string", "comment",
            "number", "operator", "function", "variable", "preprocessor",
            "preprocessor", "preprocessor", "builtin", "type", "type",
            "namespace", "class-name"
        ],
        "swift": [
            "keyword", "decorator", "string", "comment", "number", "operator",
            "function", "variable", "builtin", "type", "boolean",
            "type-annotation"
        ],
        "php": [
            "keyword", "decorator", "string", "comment", "number", "operator",
            "function", "variable", "superglobal", "class-name", "builtin",
            "type", "constant", "superglobal", "namespace-use"
        ],
        "sql": [
            "keyword", "string", "comment", "number", "operator", "function",
            "variable", "datatype", "aggregate-function", "date-function",
            "join-type"
        ],
        "monkey c": [
            "keyword", "decorator", "string", "comment", "number", "operator",
            "function", "variable", "class-name", "builtin", "type", "keyword",
            "type-annotation"
        ],
        "rust": [
            "keyword", "decorator", "string", "comment", "number", "operator",
            "function", "variable", "builtin", "type", "standard-library",
            "lifetime"
        ],
        "assembly": [
            "instruction", "register", "directive", "comment", "number",
            "label", "memory-address", "operator", "string", "builtin"
        ],
        "json": [
            "key", "string", "number", "boolean", "null", "punctuation"
        ],
        "css": [
            "at-rule", "at-rule", "at-rule", "comment", "selector", "property",
            "hex-color", "function", "unit", "vendor-prefix", "important",
            "class", "id", "at-rule", "property-name", "property-value",
            "semicolon", "keyword", "string", "parentheses"
        ],
        "html": [
            "comment", "doctype", "tag", "attribute", "operator", "string",
            "entity", "text", "operator"
        ],
        "xml": [
            "comment", "processing-instruction", "tag", "attribute", "operator",
            "string", "entity", "text", "operator"
        ],
        "dockerfile": [
            "comment", "instruction", "string", "variable"
        ],
        "makefile": [
            "comment", "target", "variable", "string", "text"
        ]
    ]
    
    public static func tokenize(_ codeStr: String, language: String) -> [Token] {
        guard let patterns = getTokenPatterns(language) else {
            if baseTokenPatterns[language.lowercased()] == nil {
                let allLines = codeStr.components(separatedBy: .newlines)
                var resultTokens: [Token] = []
                for (index, line) in allLines.enumerated() {
                    resultTokens.append(Token(value: line, type: nil, lineNumber: index + 1))
                }
                return resultTokens
            }
            let allLines = codeStr.components(separatedBy: .newlines)
            var resultTokens: [Token] = []
            for (index, line) in allLines.enumerated() {
                resultTokens.append(Token(value: line, type: nil, lineNumber: index + 1))
            }
            return resultTokens
        }
        
        let combinedPattern = patterns.joined(separator: "|")
        
        guard let regex = try? NSRegularExpression(pattern: combinedPattern, options: [.caseInsensitive]) else {
            let allLines = codeStr.components(separatedBy: .newlines)
            var resultTokens: [Token] = []
            for (index, line) in allLines.enumerated() {
                resultTokens.append(Token(value: line, type: nil, lineNumber: index + 1))
            }
            return resultTokens
        }
        
        return doTokenize(codeStr: codeStr, regex: regex, language: language)
    }
    
    public static let baseTokenPatterns: [String: [String]] = [:]
    
    private static func doTokenize(codeStr: String,
                                   regex: NSRegularExpression,
                                   language: String) -> [Token] {
        var tokens: [Token] = []
        let nsString = codeStr as NSString
        let fullRange = NSRange(location: 0, length: nsString.length)
        
        let matches = regex.matches(in: codeStr, options: [], range: fullRange)
        
        var lastMatchEnd: Int = 0
        var currentLine = 1
        
        let lowerLang = language.lowercased()
        let typeMap = tokenTypes[lowerLang] ?? []
        
        for match in matches {
            let matchRange = match.range
            let matchStart = matchRange.location
            let matchEnd = matchRange.location + matchRange.length
            
            if matchStart > lastMatchEnd {
                let precedingRange = NSRange(location: lastMatchEnd, length: matchStart - lastMatchEnd)
                if let precedingText = substring(nsString, range: precedingRange) {
                    let lines = precedingText.components(separatedBy: .newlines)
                    for (i, line) in lines.enumerated() {
                        if !line.isEmpty {
                            tokens.append(Token(value: line, type: nil, lineNumber: currentLine))
                        }
                        if i < lines.count - 1 {
                            currentLine += 1
                        }
                    }
                }
            }
            
            var tokenType: String? = nil
            for groupIndex in 1..<match.numberOfRanges {
                let groupRange = match.range(at: groupIndex)
                if groupRange.location != NSNotFound {
                    if groupIndex - 1 < typeMap.count {
                        tokenType = typeMap[groupIndex - 1]
                    }
                    break
                }
            }
            
            if let matchedText = substring(nsString, range: match.range) {
                let lines = matchedText.components(separatedBy: .newlines)
                for (i, line) in lines.enumerated() {
                    if !line.isEmpty {
                        tokens.append(Token(value: line, type: tokenType, lineNumber: currentLine))
                    }
                    if i < lines.count - 1 {
                        currentLine += 1
                    }
                }
            }
            
            lastMatchEnd = matchEnd
        }
        
        if lastMatchEnd < nsString.length {
            let remainingRange = NSRange(location: lastMatchEnd, length: nsString.length - lastMatchEnd)
            if let remainingText = substring(nsString, range: remainingRange) {
                let lines = remainingText.components(separatedBy: .newlines)
                for (i, line) in lines.enumerated() {
                    if !line.isEmpty {
                        tokens.append(Token(value: line, type: nil, lineNumber: currentLine))
                    }
                    if i < lines.count - 1 {
                        currentLine += 1
                    }
                }
            }
        }
        
        return tokens
    }
    
    private static func substring(_ nsString: NSString, range: NSRange) -> String? {
        if range.location == NSNotFound || range.location + range.length > nsString.length {
            return nil
        }
        return nsString.substring(with: range)
    }
    
    public static func escapeHtml(_ str: String) -> String {
        return str
            .replacingOccurrences(of: "&", with: "&amp;")
            .replacingOccurrences(of: "<", with: "&lt;")
            .replacingOccurrences(of: ">", with: "&gt;")
            .replacingOccurrences(of: "\"", with: "&quot;")
            .replacingOccurrences(of: "'", with: "&#039;")
    }
    
    public static func escapeRegExp(_ string: String) -> String {
        let pattern = #"[.*+?^${}()|\[\]\\]"#
        guard let regex = try? NSRegularExpression(pattern: pattern, options: []) else {
            return string
        }
        let range = NSRange(location: 0, length: string.utf16.count)
        return regex.stringByReplacingMatches(in: string, options: [], range: range, withTemplate: #"\$0"#)
    }
    
    public static func syntaxHighlight(
        codeStr: String,
        language: String,
        searchTerm: String? = nil,
        isCaseSensitive: Bool = false,
        activeLineNumber: Int? = nil,
        themeName: String = "default"
    ) -> String {
        if language.lowercased() == "unknown" {
            return escapeHtml(codeStr).replacingOccurrences(of: "\n", with: "<br/>")
        }
        
        let tokens = tokenize(codeStr, language: language)
        let lines = codeStr.components(separatedBy: .newlines)
        
        var themeClass = "default-token"
        switch themeName.lowercased() {
        case "dark":
            themeClass = "dark-token"
        case "light":
            themeClass = "light-token"
        default:
            themeClass = "default-token"
        }
        
        var regex: NSRegularExpression? = nil
        if let s = searchTerm, !s.isEmpty {
            let escapedSearchTerm = escapeRegExp(s)
            let options: NSRegularExpression.Options = isCaseSensitive ? [] : .caseInsensitive
            regex = try? NSRegularExpression(pattern: escapedSearchTerm, options: options)
        }
        
        let highlightedLines: [String] = lines.enumerated().map { (lineIndex, _) in
            let lineNumber = lineIndex + 1
            let lineTokens = tokens.filter { $0.lineNumber == lineNumber }
            let plainText = lineTokens.map { $0.value }.joined()
            
            var matchRanges: [NSRange] = []
            if let reg = regex {
                let searchRange = NSRange(location: 0, length: (plainText as NSString).length)
                matchRanges = reg.matches(in: plainText, options: [], range: searchRange).map { $0.range }
            }
            
            func fullyContains(_ tokenStart: Int, _ tokenEnd: Int) -> Bool {
                for mr in matchRanges {
                    let start = mr.location
                    let end = mr.location + mr.length
                    if tokenStart >= start && tokenEnd <= end {
                        return true
                    }
                }
                return false
            }
            
            func intersects(_ tokenStart: Int, _ tokenEnd: Int) -> Bool {
                for mr in matchRanges {
                    let start = mr.location
                    let end = mr.location + mr.length
                    if tokenStart < end && tokenEnd > start {
                        return true
                    }
                }
                return false
            }
            
            var lineHTML = ""
            var currentChar = 0
            
            for token in lineTokens {
                let tokenText = token.value
                let tokenLength = tokenText.count
                let tokenStart = currentChar
                let tokenEnd = currentChar + tokenLength
                currentChar += tokenLength
                
                var tokenHtml: String
                if let tType = token.type {
                    let escaped = escapeHtml(tokenText)
                    tokenHtml = #"<span class="\#(themeClass) \#(tType)">\#(escaped)</span>"#
                } else {
                    tokenHtml = escapeHtml(tokenText)
                }
                
                if matchRanges.isEmpty {
                    lineHTML += tokenHtml
                    continue
                }
                
                if fullyContains(tokenStart, tokenEnd) {
                    tokenHtml = #"<span class="searchHighlight">\#(tokenHtml)</span>"#
                    lineHTML += tokenHtml
                }
                else if intersects(tokenStart, tokenEnd) {
                    var newTokenHtml = ""
                    var localIndex = 0
                    
                    let localNS = tokenText as NSString
                    for mr in matchRanges {
                        let start = mr.location
                        let end = mr.location + mr.length
                        if end <= tokenStart || start >= tokenEnd {
                            continue
                        }
                        
                        let relStart = max(start - tokenStart, 0)
                        let relEnd = min(end - tokenStart, tokenLength)
                        
                        if relStart > localIndex {
                            let beforeRange = NSRange(location: localIndex, length: relStart - localIndex)
                            let beforeText = localNS.substring(with: beforeRange)
                            if let tType = token.type {
                                newTokenHtml += #"<span class="\#(themeClass) \#(tType)">\#(escapeHtml(beforeText))</span>"#
                            } else {
                                newTokenHtml += escapeHtml(beforeText)
                            }
                            localIndex += beforeRange.length
                        }
                        
                        let highlightLen = relEnd - relStart
                        if highlightLen > 0 {
                            let highlightRange = NSRange(location: localIndex, length: highlightLen)
                            let highlightText = localNS.substring(with: highlightRange)
                            newTokenHtml += #"<span class="searchHighlight">"#
                            if let tType = token.type {
                                newTokenHtml += #"<span class="\#(themeClass) \#(tType)">\#(escapeHtml(highlightText))</span>"#
                            } else {
                                newTokenHtml += escapeHtml(highlightText)
                            }
                            newTokenHtml += "</span>"
                            localIndex += highlightRange.length
                        }
                    }
                    
                    if localIndex < tokenText.count {
                        let remainderRange = NSRange(location: localIndex, length: tokenText.count - localIndex)
                        let remainderText = localNS.substring(with: remainderRange)
                        if let tType = token.type {
                            newTokenHtml += #"<span class="\#(themeClass) \#(tType)">\#(escapeHtml(remainderText))</span>"#
                        } else {
                            newTokenHtml += escapeHtml(remainderText)
                        }
                    }
                    lineHTML += newTokenHtml
                }
                else {
                    lineHTML += tokenHtml
                }
            }
            
            return lineHTML
        }
        
        return highlightedLines.joined(separator: "<br/>")
    }
}
