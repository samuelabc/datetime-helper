/// Shared JSON utility functions for manual serialization across the Wasm boundary.
///
/// We use manual JSON serialization instead of serde to minimize the Wasm bundle
/// size (NFR5: <100KB gzipped). These utilities provide correct JSON string escaping
/// per RFC 8259 (The JSON Data Interchange Format).

/// Escape a string for inclusion in a JSON value, per RFC 8259 Section 7.
///
/// Handles all required escapes:
/// - `"` → `\"`
/// - `\` → `\\`
/// - Control characters U+0000 through U+001F → `\uXXXX` or shorthand (`\n`, `\t`, `\r`)
pub fn json_escape(s: &str) -> String {
    let mut escaped = String::with_capacity(s.len());
    for ch in s.chars() {
        match ch {
            '"' => escaped.push_str("\\\""),
            '\\' => escaped.push_str("\\\\"),
            '\n' => escaped.push_str("\\n"),
            '\r' => escaped.push_str("\\r"),
            '\t' => escaped.push_str("\\t"),
            c if (c as u32) < 0x20 => {
                // Other control characters: use \uXXXX notation
                escaped.push_str(&format!("\\u{:04x}", c as u32));
            }
            c => escaped.push(c),
        }
    }
    escaped
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_no_escaping_needed() {
        assert_eq!(json_escape("hello world"), "hello world");
    }

    #[test]
    fn test_escape_double_quotes() {
        assert_eq!(json_escape(r#"he"llo"#), r#"he\"llo"#);
    }

    #[test]
    fn test_escape_backslash() {
        assert_eq!(json_escape(r"back\slash"), r"back\\slash");
    }

    #[test]
    fn test_escape_newline() {
        assert_eq!(json_escape("line1\nline2"), "line1\\nline2");
    }

    #[test]
    fn test_escape_tab() {
        assert_eq!(json_escape("col1\tcol2"), "col1\\tcol2");
    }

    #[test]
    fn test_escape_carriage_return() {
        assert_eq!(json_escape("line1\rline2"), "line1\\rline2");
    }

    #[test]
    fn test_escape_control_char() {
        // U+0001 (SOH) should be escaped as \u0001
        let input = String::from("\x01");
        assert_eq!(json_escape(&input), "\\u0001");
    }

    #[test]
    fn test_escape_null_char() {
        let input = String::from("\x00");
        assert_eq!(json_escape(&input), "\\u0000");
    }

    #[test]
    fn test_mixed_escapes() {
        assert_eq!(
            json_escape("tab\there \"quoted\"\nnewline"),
            "tab\\there \\\"quoted\\\"\\nnewline"
        );
    }
}
