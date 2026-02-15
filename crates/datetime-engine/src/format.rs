use jiff::Timestamp;

use crate::json_utils::json_escape;

/// The formatted result returned across the Wasm boundary as JSON.
/// All four fields represent the exact same instant in time.
///
/// **Note on `local_human`:** This field is named `localHuman` in JSON to match
/// the architecture contract. In the MVP (Story 1.1), it formats in UTC because
/// the jiff timezone database was excluded to meet the <100KB Wasm budget (NFR5).
/// Future stories may add browser-local timezone formatting using jiff's `Zoned`
/// type with the `js` feature's `Intl.DateTimeFormat` timezone detection.
#[derive(Debug, PartialEq)]
pub struct FormattedResult {
    pub unix_timestamp: i64,
    pub iso_8601: String,
    pub rfc_2822: String,
    /// Human-readable format. Currently UTC; will use browser-local timezone
    /// once timezone support is added in a future story.
    pub local_human: String,
}

impl FormattedResult {
    /// Format a `Timestamp` into all four output representations.
    pub fn from_timestamp(ts: Timestamp) -> Self {
        let unix_timestamp = ts.as_second();
        let iso_8601 = ts.to_string();

        // RFC 2822 format: "Thu, 01 Jan 1970 00:00:00 +0000"
        let rfc_2822 = ts.strftime("%a, %d %b %Y %H:%M:%S +0000").to_string();

        // Human-readable format (UTC for MVP, see struct-level doc comment).
        // Output example: "January 01, 1970 12:00:00 AM UTC"
        let local_human = ts.strftime("%B %d, %Y %I:%M:%S %p UTC").to_string();

        FormattedResult {
            unix_timestamp,
            iso_8601,
            rfc_2822,
            local_human,
        }
    }

    /// Serialize to JSON string for Wasm boundary (manual serialization to avoid serde).
    pub fn to_json(&self) -> String {
        format!(
            r#"{{"unixTimestamp":{},"iso8601":"{}","rfc2822":"{}","localHuman":"{}"}}"#,
            self.unix_timestamp,
            json_escape(&self.iso_8601),
            json_escape(&self.rfc_2822),
            json_escape(&self.local_human),
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_epoch_formatting() {
        let ts = Timestamp::from_second(0).unwrap();
        let result = FormattedResult::from_timestamp(ts);

        assert_eq!(result.unix_timestamp, 0);
        assert_eq!(result.iso_8601, "1970-01-01T00:00:00Z");
        assert!(result.rfc_2822.contains("01 Jan 1970"));
        assert!(result.local_human.contains("1970"));
    }

    #[test]
    fn test_json_serialization() {
        let ts = Timestamp::from_second(0).unwrap();
        let result = FormattedResult::from_timestamp(ts);
        let json = result.to_json();

        assert!(json.contains("\"unixTimestamp\":0"));
        assert!(json.contains("\"iso8601\""));
        assert!(json.contains("\"rfc2822\""));
        assert!(json.contains("\"localHuman\""));
    }
}
