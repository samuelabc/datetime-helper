import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/svelte";
import TimezoneControls from "./TimezoneControls.svelte";

describe("TimezoneControls", () => {
  it("changes mode and iana timezone values", async () => {
    const onModeChange = vi.fn();
    const onIanaTimeZoneChange = vi.fn();
    render(TimezoneControls, {
      props: {
        mode: "iana",
        ianaEnabled: true,
        ianaTimeZone: "America/New_York",
        availableTimezones: ["America/New_York", "UTC"],
        onModeChange,
        onIanaTimeZoneChange,
      },
    });

    const mode = screen.getByLabelText("Timezone mode");
    await fireEvent.input(mode, { target: { value: "utc" } });
    expect(onModeChange).toHaveBeenCalledWith("utc");

    const iana = screen.getByLabelText("IANA timezone");
    await fireEvent.input(iana, { target: { value: "UTC" } });
    expect(onIanaTimeZoneChange).toHaveBeenCalledWith("UTC");
  });
});
