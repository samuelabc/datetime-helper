use wasm_bindgen::prelude::*;

pub mod calc;
pub mod format;
pub mod json_utils;
pub mod validate;

/// Initialize the Wasm module.
/// Currently a no-op; reserved for future initialization needs.
#[wasm_bindgen]
pub fn init() {}

/// Returns the current Unix timestamp as f64.
///
/// Uses `jiff::Timestamp::now()` which, on wasm32-unknown-unknown with the `js`
/// feature, calls JavaScript's `Date.now()` under the hood.
#[wasm_bindgen]
pub fn now_unix() -> f64 {
    jiff::Timestamp::now().as_second() as f64
}

/// Calculate formatted result from a start date and operations JSON.
///
/// # Arguments
/// * `start_date` - An ISO 8601 date/datetime string (e.g., "2024-07-11" or "2024-07-11T01:14:00Z")
/// * `operations_json` - A JSON array of operations (e.g., `[{"type":"add","unit":"months","value":1}]`)
///                       Pass `""` or `"[]"` for no operations.
///
/// # Returns
/// A JSON string with `FormattedResult` fields: `unixTimestamp`, `iso8601`, `rfc2822`, `localHuman`
/// or a JSON error object: `{"error": "..."}`
#[wasm_bindgen]
pub fn calculate(start_date: &str, operations_json: &str) -> String {
    match calc::calculate(start_date, operations_json) {
        Ok(result) => result.to_json(),
        Err(e) => format!(r#"{{"error":"{}"}}"#, e.replace('"', r#"\""#)),
    }
}

/// Validate a date input string.
///
/// # Arguments
/// * `input` - A date or datetime string to validate
///
/// # Returns
/// A JSON string with `ValidationResult` fields: `valid` (bool), `error` (optional string), `normalized` (optional string)
#[wasm_bindgen]
pub fn validate_date(input: &str) -> String {
    validate::validate(input).to_json()
}
