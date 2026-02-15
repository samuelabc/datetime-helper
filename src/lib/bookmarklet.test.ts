import { describe, expect, it } from "vitest";
import { buildBookmarklet, parseBookmarkletSearch } from "./bookmarklet";

describe("bookmarklet", () => {
  it("builds launch bookmarklet with encoded state", () => {
    const bookmarklet = buildBookmarklet("https://example.com/app", "s=now&o0=add%3A1%3Adays");
    expect(bookmarklet).toContain("javascript:");
    expect(bookmarklet).toContain("https://example.com/app?s=now&o0=add%3A1%3Adays");
  });

  it("parses incoming bookmarklet search", () => {
    expect(parseBookmarkletSearch("?s=now")).toBe("s=now");
    expect(parseBookmarkletSearch("")).toBeNull();
  });
});
