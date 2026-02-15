//! Correctness tests for the datetime-engine crate.
//!
//! Tests cover:
//! - DST transition dates (spring forward, fall back)
//! - Leap year calculations (valid and invalid)
//! - Month boundary arithmetic (edge cases)

use datetime_engine::calc;

// ============================================================================
// DST-Adjacent Date Arithmetic Tests (AC #6)
// ============================================================================
// IMPORTANT: These tests verify UTC date arithmetic on dates that coincide with
// US DST transitions. Since the MVP Wasm engine operates in UTC (timezone database
// excluded for NFR5 bundle size compliance), these do NOT test timezone-aware DST
// behavior (e.g., "1 day" != "24 hours" across DST in America/New_York).
//
// True timezone-aware DST tests should be added when localHuman formatting gains
// browser-local timezone support in a future story. NFR14 ("correctly handles all
// DST transitions for any IANA timezone") is NOT fully satisfied by these tests.

#[test]
fn test_dst_spring_forward_us_2026() {
    // US DST spring forward: March 8, 2026
    // Adding 1 day across the spring-forward boundary
    let result = calc::calculate(
        "2026-03-07T00:00:00Z",
        r#"[{"type":"add","unit":"days","value":1}]"#,
    )
    .unwrap();
    assert_eq!(result.iso_8601, "2026-03-08T00:00:00Z");
}

#[test]
fn test_dst_spring_forward_add_hours() {
    // Adding 24 hours across spring-forward in UTC
    let result = calc::calculate(
        "2026-03-07T12:00:00Z",
        r#"[{"type":"add","unit":"hours","value":24}]"#,
    )
    .unwrap();
    assert_eq!(result.iso_8601, "2026-03-08T12:00:00Z");
}

#[test]
fn test_dst_fall_back_us_2026() {
    // US DST fall back: November 1, 2026
    let result = calc::calculate(
        "2026-10-31T00:00:00Z",
        r#"[{"type":"add","unit":"days","value":1}]"#,
    )
    .unwrap();
    assert_eq!(result.iso_8601, "2026-11-01T00:00:00Z");
}

#[test]
fn test_dst_fall_back_subtract() {
    // Subtracting 1 day across fall-back boundary
    let result = calc::calculate(
        "2026-11-02T00:00:00Z",
        r#"[{"type":"subtract","unit":"days","value":1}]"#,
    )
    .unwrap();
    assert_eq!(result.iso_8601, "2026-11-01T00:00:00Z");
}

// ============================================================================
// Leap Year Tests (AC #6, FR4)
// ============================================================================

#[test]
fn test_leap_year_2024_feb_29_valid() {
    // 2024 is a leap year
    let result = calc::calculate("2024-02-29T00:00:00Z", "[]").unwrap();
    assert_eq!(result.iso_8601, "2024-02-29T00:00:00Z");
}

#[test]
fn test_leap_year_2028_feb_29_valid() {
    // 2028 is a leap year
    let result = calc::calculate("2028-02-29T00:00:00Z", "[]").unwrap();
    assert_eq!(result.iso_8601, "2028-02-29T00:00:00Z");
}

#[test]
fn test_non_leap_year_2027_feb_29_invalid() {
    // 2027 is NOT a leap year
    let result = calc::calculate("2027-02-29T00:00:00Z", "[]");
    assert!(result.is_err());
}

#[test]
fn test_century_rule_2100_not_leap() {
    // 2100 is NOT a leap year (divisible by 100 but not 400)
    let result = calc::calculate("2100-02-29T00:00:00Z", "[]");
    assert!(result.is_err());
}

#[test]
fn test_century_exception_2000_is_leap() {
    // 2000 IS a leap year (divisible by 400)
    let result = calc::calculate("2000-02-29T00:00:00Z", "[]").unwrap();
    assert_eq!(result.iso_8601, "2000-02-29T00:00:00Z");
}

#[test]
fn test_add_year_across_leap_day() {
    // Adding 1 year from leap day: Feb 29, 2024 + 1 year → should clamp to Feb 28, 2025
    let result = calc::calculate(
        "2024-02-29T00:00:00Z",
        r#"[{"type":"add","unit":"years","value":1}]"#,
    )
    .unwrap();
    assert_eq!(result.iso_8601, "2025-02-28T00:00:00Z");
}

#[test]
fn test_add_4_years_from_leap_day() {
    // Adding 4 years from leap day: Feb 29, 2024 + 4 years → Feb 29, 2028 (also a leap year)
    let result = calc::calculate(
        "2024-02-29T00:00:00Z",
        r#"[{"type":"add","unit":"years","value":4}]"#,
    )
    .unwrap();
    assert_eq!(result.iso_8601, "2028-02-29T00:00:00Z");
}

// ============================================================================
// Month Boundary Tests (AC #6)
// ============================================================================

#[test]
fn test_jan_31_plus_1_month() {
    // Jan 31 + 1 month → should clamp to Feb 28 (non-leap year) or Feb 29 (leap year)
    // 2025 is not a leap year
    let result = calc::calculate(
        "2025-01-31T00:00:00Z",
        r#"[{"type":"add","unit":"months","value":1}]"#,
    )
    .unwrap();
    assert_eq!(result.iso_8601, "2025-02-28T00:00:00Z");
}

#[test]
fn test_jan_31_plus_1_month_leap_year() {
    // 2024 is a leap year: Jan 31 + 1 month → Feb 29
    let result = calc::calculate(
        "2024-01-31T00:00:00Z",
        r#"[{"type":"add","unit":"months","value":1}]"#,
    )
    .unwrap();
    assert_eq!(result.iso_8601, "2024-02-29T00:00:00Z");
}

#[test]
fn test_mar_31_minus_1_month() {
    // Mar 31 - 1 month → should clamp to Feb 28 (non-leap year) or Feb 29 (leap year)
    // 2025 is not a leap year
    let result = calc::calculate(
        "2025-03-31T00:00:00Z",
        r#"[{"type":"subtract","unit":"months","value":1}]"#,
    )
    .unwrap();
    assert_eq!(result.iso_8601, "2025-02-28T00:00:00Z");
}

#[test]
fn test_mar_31_minus_1_month_leap_year() {
    // 2024 is a leap year: Mar 31 - 1 month → Feb 29
    let result = calc::calculate(
        "2024-03-31T00:00:00Z",
        r#"[{"type":"subtract","unit":"months","value":1}]"#,
    )
    .unwrap();
    assert_eq!(result.iso_8601, "2024-02-29T00:00:00Z");
}

#[test]
fn test_add_months_across_year_boundary() {
    // Nov 30 + 3 months → Feb 28 of next year (non-leap)
    let result = calc::calculate(
        "2024-11-30T00:00:00Z",
        r#"[{"type":"add","unit":"months","value":3}]"#,
    )
    .unwrap();
    assert_eq!(result.iso_8601, "2025-02-28T00:00:00Z");
}

#[test]
fn test_aug_31_plus_1_month() {
    // Aug 31 + 1 month → Sep 30 (September has 30 days)
    let result = calc::calculate(
        "2024-08-31T00:00:00Z",
        r#"[{"type":"add","unit":"months","value":1}]"#,
    )
    .unwrap();
    assert_eq!(result.iso_8601, "2024-09-30T00:00:00Z");
}

#[test]
fn test_sequential_month_additions() {
    // Jan 31 + 1 month + 1 month:
    // Jan 31 → Feb 29 (2024 leap year) → Mar 29
    let result = calc::calculate(
        "2024-01-31T00:00:00Z",
        r#"[{"type":"add","unit":"months","value":1},{"type":"add","unit":"months","value":1}]"#,
    )
    .unwrap();
    assert_eq!(result.iso_8601, "2024-03-29T00:00:00Z");
}
