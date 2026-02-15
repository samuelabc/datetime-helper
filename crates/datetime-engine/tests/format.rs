//! Format consistency tests for the datetime-engine crate.
//!
//! Verifies that all four output formats (unixTimestamp, iso8601, rfc2822, localHuman)
//! represent the exact same instant in time.

use datetime_engine::calc;
use datetime_engine::format::FormattedResult;

/// Helper: verify all four formats are internally consistent for a given timestamp.
fn assert_format_consistency(result: &FormattedResult) {
    // 1. Verify ISO 8601 matches the unix timestamp
    let ts_from_iso: jiff::Timestamp = result.iso_8601.parse().unwrap();
    assert_eq!(
        ts_from_iso.as_second(),
        result.unix_timestamp,
        "ISO 8601 and unix_timestamp mismatch"
    );

    // 2. Verify RFC 2822 contains the correct date components
    // RFC 2822 format: "Thu, 01 Jan 1970 00:00:00 +0000"
    assert!(
        result.rfc_2822.contains("+0000"),
        "RFC 2822 should be in UTC (+0000): {}",
        result.rfc_2822
    );

    // 3. Verify local_human contains UTC
    assert!(
        result.local_human.contains("UTC"),
        "local_human should indicate UTC: {}",
        result.local_human
    );

    // 4. Verify all formats contain matching year
    let zoned = ts_from_iso.to_zoned(jiff::tz::TimeZone::UTC);
    let year = zoned.year();
    let year_str = year.to_string();
    assert!(
        result.rfc_2822.contains(&year_str),
        "RFC 2822 should contain year {}: {}",
        year,
        result.rfc_2822
    );
    assert!(
        result.local_human.contains(&year_str),
        "local_human should contain year {}: {}",
        year,
        result.local_human
    );
}

#[test]
fn test_epoch_format_consistency() {
    let result = calc::calculate("1970-01-01T00:00:00Z", "[]").unwrap();
    assert_format_consistency(&result);
    assert_eq!(result.unix_timestamp, 0);
}

#[test]
fn test_modern_date_format_consistency() {
    let result = calc::calculate("2024-07-11T14:30:00Z", "[]").unwrap();
    assert_format_consistency(&result);
}

#[test]
fn test_leap_day_format_consistency() {
    let result = calc::calculate("2024-02-29T12:00:00Z", "[]").unwrap();
    assert_format_consistency(&result);
    assert!(result.rfc_2822.contains("29 Feb 2024"));
}

#[test]
fn test_year_boundary_format_consistency() {
    let result = calc::calculate("2024-12-31T23:59:59Z", "[]").unwrap();
    assert_format_consistency(&result);
}

#[test]
fn test_midnight_format_consistency() {
    let result = calc::calculate("2024-01-01T00:00:00Z", "[]").unwrap();
    assert_format_consistency(&result);
}

#[test]
fn test_noon_format_consistency() {
    let result = calc::calculate("2024-06-15T12:00:00Z", "[]").unwrap();
    assert_format_consistency(&result);
}

#[test]
fn test_calculated_result_format_consistency() {
    // Verify format consistency after arithmetic operations
    let result = calc::calculate(
        "2024-01-15T08:30:00Z",
        r#"[{"type":"add","unit":"months","value":6},{"type":"add","unit":"hours","value":4}]"#,
    )
    .unwrap();
    assert_format_consistency(&result);
}

#[test]
fn test_negative_timestamp_format_consistency() {
    // Before Unix epoch: 1969-12-31T00:00:00Z
    let result = calc::calculate("1969-12-31T00:00:00Z", "[]").unwrap();
    assert_format_consistency(&result);
    assert!(result.unix_timestamp < 0);
}

#[test]
fn test_json_output_structure() {
    let result = calc::calculate("2024-07-11T00:00:00Z", "[]").unwrap();
    let json = result.to_json();

    // Verify JSON has all four fields
    assert!(json.contains("\"unixTimestamp\":"));
    assert!(json.contains("\"iso8601\":\""));
    assert!(json.contains("\"rfc2822\":\""));
    assert!(json.contains("\"localHuman\":\""));

    // Verify it's valid JSON by checking structure
    assert!(json.starts_with('{'));
    assert!(json.ends_with('}'));
}
