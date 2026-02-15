//! Edge case tests for the datetime-engine crate.
//!
//! Tests cover:
//! - Unix epoch boundaries
//! - Year 2038 boundary
//! - Far-future dates
//! - Negative timestamps
//! - Validation edge cases

use datetime_engine::calc;
use datetime_engine::validate;

// ============================================================================
// Epoch Boundary Tests
// ============================================================================

#[test]
fn test_unix_epoch() {
    let result = calc::calculate("1970-01-01T00:00:00Z", "[]").unwrap();
    assert_eq!(result.unix_timestamp, 0);
    assert_eq!(result.iso_8601, "1970-01-01T00:00:00Z");
}

#[test]
fn test_one_second_before_epoch() {
    let result = calc::calculate(
        "1970-01-01T00:00:00Z",
        r#"[{"type":"subtract","unit":"seconds","value":1}]"#,
    )
    .unwrap();
    assert_eq!(result.unix_timestamp, -1);
    assert_eq!(result.iso_8601, "1969-12-31T23:59:59Z");
}

#[test]
fn test_one_second_after_epoch() {
    let result = calc::calculate(
        "1970-01-01T00:00:00Z",
        r#"[{"type":"add","unit":"seconds","value":1}]"#,
    )
    .unwrap();
    assert_eq!(result.unix_timestamp, 1);
    assert_eq!(result.iso_8601, "1970-01-01T00:00:01Z");
}

// ============================================================================
// Year 2038 Boundary (32-bit overflow)
// ============================================================================

#[test]
fn test_year_2038_boundary() {
    // 2038-01-19T03:14:07Z is the max for signed 32-bit Unix timestamp
    let result = calc::calculate("2038-01-19T03:14:07Z", "[]").unwrap();
    assert_eq!(result.unix_timestamp, 2147483647); // i32::MAX
    assert_eq!(result.iso_8601, "2038-01-19T03:14:07Z");
}

#[test]
fn test_year_2038_boundary_plus_one() {
    // One second after the 32-bit boundary should still work (we use i64)
    let result = calc::calculate("2038-01-19T03:14:08Z", "[]").unwrap();
    assert_eq!(result.unix_timestamp, 2147483648);
    assert_eq!(result.iso_8601, "2038-01-19T03:14:08Z");
}

// ============================================================================
// Far-Future Dates
// ============================================================================

#[test]
fn test_far_future_year_3000() {
    let result = calc::calculate("3000-01-01T00:00:00Z", "[]").unwrap();
    assert!(result.unix_timestamp > 0);
    assert_eq!(result.iso_8601, "3000-01-01T00:00:00Z");
}

#[test]
fn test_far_future_year_5000() {
    // jiff supports dates up to year 9999 but Timestamp range is more limited.
    // Year 5000 is a safe far-future test.
    let result = calc::calculate("5000-01-01T00:00:00Z", "[]").unwrap();
    assert!(result.unix_timestamp > 0);
    assert_eq!(result.iso_8601, "5000-01-01T00:00:00Z");
}

// ============================================================================
// Year Boundary Tests
// ============================================================================

#[test]
fn test_year_boundary_crossing_forward() {
    let result = calc::calculate(
        "2024-12-31T23:59:59Z",
        r#"[{"type":"add","unit":"seconds","value":1}]"#,
    )
    .unwrap();
    assert_eq!(result.iso_8601, "2025-01-01T00:00:00Z");
}

#[test]
fn test_year_boundary_crossing_backward() {
    let result = calc::calculate(
        "2025-01-01T00:00:00Z",
        r#"[{"type":"subtract","unit":"seconds","value":1}]"#,
    )
    .unwrap();
    assert_eq!(result.iso_8601, "2024-12-31T23:59:59Z");
}

#[test]
fn test_add_year_across_boundary() {
    let result = calc::calculate(
        "2024-12-15T00:00:00Z",
        r#"[{"type":"add","unit":"years","value":1}]"#,
    )
    .unwrap();
    assert_eq!(result.iso_8601, "2025-12-15T00:00:00Z");
}

// ============================================================================
// Negative Timestamp Tests
// ============================================================================

#[test]
fn test_pre_epoch_date() {
    let result = calc::calculate("1960-06-15T00:00:00Z", "[]").unwrap();
    assert!(result.unix_timestamp < 0);
}

#[test]
fn test_subtract_to_pre_epoch() {
    let result = calc::calculate(
        "1970-06-01T00:00:00Z",
        r#"[{"type":"subtract","unit":"years","value":2}]"#,
    )
    .unwrap();
    assert_eq!(result.iso_8601, "1968-06-01T00:00:00Z");
    assert!(result.unix_timestamp < 0);
}

// ============================================================================
// Input Parsing Edge Cases
// ============================================================================

#[test]
fn test_civil_date_input() {
    // Civil date without time → midnight UTC
    let result = calc::calculate("2024-07-11", "[]").unwrap();
    assert_eq!(result.iso_8601, "2024-07-11T00:00:00Z");
    assert_eq!(result.unix_timestamp, 1720656000);
}

#[test]
fn test_civil_datetime_input() {
    // Civil datetime without timezone → treated as UTC
    let result = calc::calculate("2024-07-11T14:30:00", "[]").unwrap();
    assert_eq!(result.iso_8601, "2024-07-11T14:30:00Z");
}

#[test]
fn test_invalid_date_returns_error() {
    let result = calc::calculate("not-a-date", "[]");
    assert!(result.is_err());
}

#[test]
fn test_invalid_operations_json() {
    let result = calc::calculate("2024-01-01T00:00:00Z", "invalid json");
    assert!(result.is_err());
}

// ============================================================================
// Validation Edge Cases
// ============================================================================

#[test]
fn test_validate_valid_date() {
    let result = validate::validate("2024-07-11");
    assert!(result.valid);
}

#[test]
fn test_validate_valid_timestamp() {
    let result = validate::validate("2024-07-11T14:30:00Z");
    assert!(result.valid);
}

#[test]
fn test_validate_invalid_feb_29_non_leap() {
    let result = validate::validate("2027-02-29");
    assert!(!result.valid);
}

#[test]
fn test_validate_invalid_month_13() {
    let result = validate::validate("2024-13-01");
    assert!(!result.valid);
}

#[test]
fn test_validate_invalid_day_32() {
    let result = validate::validate("2024-01-32");
    assert!(!result.valid);
}

#[test]
fn test_validate_empty() {
    let result = validate::validate("");
    assert!(!result.valid);
}

#[test]
fn test_validate_whitespace_only() {
    let result = validate::validate("   ");
    assert!(!result.valid);
}

#[test]
fn test_validate_garbage_input() {
    let result = validate::validate("hello world");
    assert!(!result.valid);
}

// ============================================================================
// Large Arithmetic Operations
// ============================================================================

#[test]
fn test_add_100_years() {
    let result = calc::calculate(
        "2024-01-01T00:00:00Z",
        r#"[{"type":"add","unit":"years","value":100}]"#,
    )
    .unwrap();
    assert_eq!(result.iso_8601, "2124-01-01T00:00:00Z");
}

#[test]
fn test_add_many_hours() {
    // 24 * 365 = 8760 hours ≈ 1 year
    let result = calc::calculate(
        "2024-01-01T00:00:00Z",
        r#"[{"type":"add","unit":"hours","value":8784}]"#,
    )
    .unwrap();
    // 2024 is a leap year (366 days = 8784 hours)
    assert_eq!(result.iso_8601, "2025-01-01T00:00:00Z");
}
