use crate::json_utils::json_escape;

/// Result of validating a date input string.
#[derive(Debug, PartialEq)]
pub struct ValidationResult {
    pub valid: bool,
    pub error: Option<String>,
    pub normalized: Option<String>,
}

impl ValidationResult {
    fn ok(normalized: String) -> Self {
        ValidationResult {
            valid: true,
            error: None,
            normalized: Some(normalized),
        }
    }

    fn err(msg: String) -> Self {
        ValidationResult {
            valid: false,
            error: Some(msg),
            normalized: None,
        }
    }

    /// Serialize to JSON string for Wasm boundary (manual serialization).
    pub fn to_json(&self) -> String {
        if self.valid {
            let normalized = self.normalized.as_deref().unwrap_or("");
            format!(
                r#"{{"valid":true,"normalized":"{}"}}"#,
                json_escape(normalized)
            )
        } else {
            let error = self.error.as_deref().unwrap_or("Unknown error");
            format!(
                r#"{{"valid":false,"error":"{}"}}"#,
                json_escape(error)
            )
        }
    }
}

/// Validate a date input string.
///
/// Accepts:
/// - ISO 8601 datetime strings (e.g., "2024-07-11T01:14:00Z")
/// - Civil date strings (e.g., "2024-07-11")
///
/// Returns a `ValidationResult` indicating whether the input is valid.
pub fn validate(input: &str) -> ValidationResult {
    let trimmed = input.trim();

    if trimmed.is_empty() {
        return ValidationResult::err("Input is empty".to_string());
    }

    // Try parsing as a full Timestamp (ISO 8601 / RFC 3339)
    if let Ok(ts) = trimmed.parse::<jiff::Timestamp>() {
        return ValidationResult::ok(ts.to_string());
    }

    // Try parsing as a civil date (YYYY-MM-DD)
    if let Ok(date) = trimmed.parse::<jiff::civil::Date>() {
        return ValidationResult::ok(date.to_string());
    }

    // Try parsing as a civil datetime (YYYY-MM-DDTHH:MM:SS without timezone)
    if let Ok(dt) = trimmed.parse::<jiff::civil::DateTime>() {
        return ValidationResult::ok(dt.to_string());
    }

    ValidationResult::err(format!("Invalid date input: '{}'", trimmed))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_iso_date() {
        let result = validate("2024-07-11");
        assert!(result.valid);
        assert_eq!(result.normalized.unwrap(), "2024-07-11");
    }

    #[test]
    fn test_valid_iso_datetime() {
        let result = validate("2024-07-11T01:14:00Z");
        assert!(result.valid);
    }

    #[test]
    fn test_invalid_leap_year() {
        let result = validate("2027-02-29");
        assert!(!result.valid);
        assert!(result.error.unwrap().contains("Invalid"));
    }

    #[test]
    fn test_empty_input() {
        let result = validate("");
        assert!(!result.valid);
        assert!(result.error.unwrap().contains("empty"));
    }

    #[test]
    fn test_json_output_valid() {
        let result = validate("2024-07-11");
        let json = result.to_json();
        assert!(json.contains("\"valid\":true"));
        assert!(json.contains("\"normalized\":\"2024-07-11\""));
    }

    #[test]
    fn test_json_output_invalid() {
        let result = validate("not-a-date");
        let json = result.to_json();
        assert!(json.contains("\"valid\":false"));
        assert!(json.contains("\"error\""));
    }
}
