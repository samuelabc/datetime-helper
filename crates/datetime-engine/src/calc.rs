use jiff::{Timestamp, ToSpan};

use crate::format::FormattedResult;

/// A single arithmetic operation to apply to a datetime.
#[derive(Debug, Clone)]
pub struct Operation {
    /// "add" or "subtract"
    pub op_type: String,
    /// "years", "months", "days", "hours", "minutes", "seconds"
    pub unit: String,
    /// The numeric value for the operation
    pub value: i64,
}

/// Simple JSON parser for operations array.
/// Expected format: [{"type":"add","unit":"months","value":3}, ...]
fn parse_operations(json: &str) -> Result<Vec<Operation>, String> {
    let trimmed = json.trim();
    if trimmed.is_empty() || trimmed == "[]" {
        return Ok(Vec::new());
    }

    // Very minimal JSON array-of-objects parser
    if !trimmed.starts_with('[') || !trimmed.ends_with(']') {
        return Err("Operations JSON must be an array".to_string());
    }

    let inner = &trimmed[1..trimmed.len() - 1].trim();
    if inner.is_empty() {
        return Ok(Vec::new());
    }

    let mut operations = Vec::new();
    let mut depth = 0;
    let mut start = 0;

    // Split by commas at depth 0 (top-level object boundaries)
    for (i, ch) in inner.char_indices() {
        match ch {
            '{' => depth += 1,
            '}' => {
                depth -= 1;
                if depth == 0 {
                    let obj_str = &inner[start..=i].trim();
                    operations.push(parse_single_operation(obj_str)?);
                    start = i + 1;
                    // Skip the comma after the object
                }
            }
            ',' if depth == 0 => {
                start = i + 1;
            }
            _ => {}
        }
    }

    Ok(operations)
}

/// Parse a single operation object: {"type":"add","unit":"months","value":3}
fn parse_single_operation(json: &str) -> Result<Operation, String> {
    let op_type = extract_string_field(json, "type")
        .ok_or_else(|| "Missing 'type' field in operation".to_string())?;
    let unit = extract_string_field(json, "unit")
        .ok_or_else(|| "Missing 'unit' field in operation".to_string())?;
    let value = extract_number_field(json, "value")
        .ok_or_else(|| "Missing 'value' field in operation".to_string())?;

    if op_type != "add" && op_type != "subtract" {
        return Err(format!("Unknown operation type: '{}'", op_type));
    }

    let valid_units = ["years", "months", "days", "hours", "minutes", "seconds"];
    if !valid_units.contains(&unit.as_str()) {
        return Err(format!("Unknown unit: '{}'", unit));
    }

    Ok(Operation {
        op_type,
        unit,
        value,
    })
}

/// Extract a string value for a given key from a JSON object string.
fn extract_string_field(json: &str, key: &str) -> Option<String> {
    let pattern = format!("\"{}\"", key);
    let key_pos = json.find(&pattern)?;
    let after_key = &json[key_pos + pattern.len()..];
    // Skip whitespace and colon
    let after_colon = after_key.trim_start().strip_prefix(':')?;
    let after_colon = after_colon.trim_start();
    // Find the opening quote
    let after_quote = after_colon.strip_prefix('"')?;
    // Find the closing quote (simple - no escape handling needed for our values)
    let end_quote = after_quote.find('"')?;
    Some(after_quote[..end_quote].to_string())
}

/// Extract a number value for a given key from a JSON object string.
fn extract_number_field(json: &str, key: &str) -> Option<i64> {
    let pattern = format!("\"{}\"", key);
    let key_pos = json.find(&pattern)?;
    let after_key = &json[key_pos + pattern.len()..];
    let after_colon = after_key.trim_start().strip_prefix(':')?;
    let after_colon = after_colon.trim_start();

    // Collect digits and optional minus sign
    let mut num_str = String::new();
    for ch in after_colon.chars() {
        if ch == '-' || ch.is_ascii_digit() {
            num_str.push(ch);
        } else if !num_str.is_empty() {
            break;
        }
    }

    num_str.parse().ok()
}

/// Parse a start date string into a Timestamp.
///
/// Supports:
/// - ISO 8601 / RFC 3339 timestamps (e.g., "2024-07-11T01:14:00Z")
/// - Civil dates (e.g., "2024-07-11") — interpreted as midnight UTC
/// - Civil datetimes (e.g., "2024-07-11T12:00:00") — interpreted as UTC
fn parse_start_date(start_date: &str) -> Result<Timestamp, String> {
    let trimmed = start_date.trim();

    // Try as Timestamp first (most specific)
    if let Ok(ts) = trimmed.parse::<Timestamp>() {
        return Ok(ts);
    }

    // Try as civil DateTime, convert to UTC Timestamp
    if let Ok(dt) = trimmed.parse::<jiff::civil::DateTime>() {
        return dt
            .to_zoned(jiff::tz::TimeZone::UTC)
            .map(|z| z.timestamp())
            .map_err(|e| format!("Failed to convert datetime to UTC: {}", e));
    }

    // Try as civil Date, convert to midnight UTC
    if let Ok(date) = trimmed.parse::<jiff::civil::Date>() {
        return date
            .at(0, 0, 0, 0)
            .to_zoned(jiff::tz::TimeZone::UTC)
            .map(|z| z.timestamp())
            .map_err(|e| format!("Failed to convert date to UTC: {}", e));
    }

    Err(format!(
        "Could not parse '{}' as a date or datetime",
        trimmed
    ))
}

/// Apply a sequence of operations to a start date and return a formatted result.
pub fn calculate(start_date: &str, operations_json: &str) -> Result<FormattedResult, String> {
    let ts = parse_start_date(start_date)?;
    let operations = parse_operations(operations_json)?;

    // Apply operations sequentially
    let mut current = ts;
    for op in &operations {
        current = apply_operation(current, op)?;
    }

    Ok(FormattedResult::from_timestamp(current))
}

/// Apply a single operation to a timestamp.
fn apply_operation(ts: Timestamp, op: &Operation) -> Result<Timestamp, String> {
    let span = match op.unit.as_str() {
        "years" => op.value.years(),
        "months" => op.value.months(),
        "days" => op.value.days(),
        "hours" => op.value.hours(),
        "minutes" => op.value.minutes(),
        "seconds" => op.value.seconds(),
        other => return Err(format!("Unknown unit: '{}'", other)),
    };

    // For calendar units (years, months, days), we need to go through Zoned
    // to handle DST and calendar edge cases correctly.
    let needs_calendar = matches!(op.unit.as_str(), "years" | "months" | "days");

    if needs_calendar {
        let zoned = ts.to_zoned(jiff::tz::TimeZone::UTC);

        let result = match op.op_type.as_str() {
            "add" => zoned
                .checked_add(span)
                .map_err(|e| format!("Add operation failed: {}", e))?,
            "subtract" => zoned
                .checked_sub(span)
                .map_err(|e| format!("Subtract operation failed: {}", e))?,
            other => return Err(format!("Unknown operation type: '{}'", other)),
        };

        Ok(result.timestamp())
    } else {
        // For time-only units, operate directly on Timestamp
        match op.op_type.as_str() {
            "add" => ts
                .checked_add(span)
                .map_err(|e| format!("Add operation failed: {}", e)),
            "subtract" => ts
                .checked_sub(span)
                .map_err(|e| format!("Subtract operation failed: {}", e)),
            other => Err(format!("Unknown operation type: '{}'", other)),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_iso_timestamp() {
        let ts = parse_start_date("2024-07-11T01:14:00Z").unwrap();
        assert_eq!(ts.as_second(), 1720660440);
    }

    #[test]
    fn test_parse_civil_date() {
        let ts = parse_start_date("2024-07-11").unwrap();
        // Should be midnight UTC
        assert_eq!(ts.to_string(), "2024-07-11T00:00:00Z");
    }

    #[test]
    fn test_calculate_empty_operations() {
        let result = calculate("2024-07-11T00:00:00Z", "[]").unwrap();
        assert_eq!(result.unix_timestamp, 1720656000);
        assert_eq!(result.iso_8601, "2024-07-11T00:00:00Z");
    }

    #[test]
    fn test_calculate_empty_string_operations() {
        let result = calculate("2024-07-11T00:00:00Z", "").unwrap();
        assert_eq!(result.unix_timestamp, 1720656000);
    }

    #[test]
    fn test_calculate_with_operations() {
        let result = calculate(
            "2024-01-15T00:00:00Z",
            r#"[{"type":"add","unit":"months","value":1}]"#,
        )
        .unwrap();
        assert_eq!(result.iso_8601, "2024-02-15T00:00:00Z");
    }

    #[test]
    fn test_calculate_subtract() {
        let result = calculate(
            "2024-03-15T00:00:00Z",
            r#"[{"type":"subtract","unit":"days","value":15}]"#,
        )
        .unwrap();
        // 2024 is a leap year: March 15 - 15 days = Feb 29
        assert_eq!(result.iso_8601, "2024-02-29T00:00:00Z");
    }

    #[test]
    fn test_calculate_multiple_operations() {
        let result = calculate(
            "2024-01-01T00:00:00Z",
            r#"[{"type":"add","unit":"months","value":1},{"type":"add","unit":"days","value":14}]"#,
        )
        .unwrap();
        assert_eq!(result.iso_8601, "2024-02-15T00:00:00Z");
    }

    #[test]
    fn test_invalid_start_date() {
        let result = calculate("not-a-date", "[]");
        assert!(result.is_err());
    }

    #[test]
    fn test_parse_operations_empty() {
        let ops = parse_operations("[]").unwrap();
        assert!(ops.is_empty());
    }

    #[test]
    fn test_parse_operations_single() {
        let ops =
            parse_operations(r#"[{"type":"add","unit":"months","value":3}]"#).unwrap();
        assert_eq!(ops.len(), 1);
        assert_eq!(ops[0].op_type, "add");
        assert_eq!(ops[0].unit, "months");
        assert_eq!(ops[0].value, 3);
    }
}
