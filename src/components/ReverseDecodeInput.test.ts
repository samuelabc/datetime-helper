import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/svelte";
import ReverseDecodeInput from "./ReverseDecodeInput.svelte";

describe("ReverseDecodeInput", () => {
  it("forwards input changes and shows inline error", async () => {
    const onInput = vi.fn();
    render(ReverseDecodeInput, {
      props: {
        value: "",
        error: "Invalid reverse decode input.",
        onInput,
      },
    });

    const input = screen.getByLabelText("Reverse decode input");
    await fireEvent.input(input, { target: { value: "1739634600" } });
    expect(onInput).toHaveBeenCalledWith("1739634600");
    expect(screen.getByText("Invalid reverse decode input.")).toBeTruthy();
  });
});
