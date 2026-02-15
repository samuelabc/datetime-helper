import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";
import ShareLinkButton from "./ShareLinkButton.svelte";

const { copyMock } = vi.hoisted(() => ({
  copyMock: vi.fn().mockResolvedValue(true),
}));

vi.mock("../lib/clipboard", () => ({
  copyToClipboard: copyMock,
}));

describe("ShareLinkButton", () => {
  beforeEach(() => {
    copyMock.mockClear();
  });

  it("copies canonical share URL", async () => {
    render(ShareLinkButton, { props: { value: "https://example.com/?s=now" } });
    const button = screen.getByRole("button", { name: "Copy share link" });
    await fireEvent.click(button);
    expect(copyMock).toHaveBeenCalledWith("https://example.com/?s=now");
  });
});
