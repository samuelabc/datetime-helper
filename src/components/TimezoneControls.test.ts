import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/svelte";
import TimezoneControls from "./TimezoneControls.svelte";

describe("TimezoneControls", () => {
  it("changes mode and iana timezone values", async () => {
    const onModeChange = vi.fn();
    const onIanaTimeZoneChange = vi.fn();
    render(TimezoneControls, {
      props: {
        mode: "utc",
        ianaEnabled: true,
        ianaTimeZone: "America/New_York",
        availableTimezones: ["America/New_York", "UTC", "Asia/Singapore"],
        onModeChange,
        onIanaTimeZoneChange,
      },
    });

    await fireEvent.click(screen.getByRole("button", { name: "Timezone mode IANA" }));
    expect(onModeChange).toHaveBeenCalledWith("iana");
  });

  it("filters and selects iana timezone from combobox", async () => {
    const onModeChange = vi.fn();
    const onIanaTimeZoneChange = vi.fn();
    render(TimezoneControls, {
      props: {
        mode: "iana",
        ianaEnabled: true,
        ianaTimeZone: "America/New_York",
        availableTimezones: ["America/New_York", "UTC", "Asia/Singapore"],
        onModeChange,
        onIanaTimeZoneChange,
      },
    });

    const ianaInput = screen.getByLabelText("IANA timezone");
    await fireEvent.focus(ianaInput);
    await fireEvent.input(ianaInput, { target: { value: "sing" } });
    await fireEvent.keyDown(ianaInput, { key: "Enter" });
    expect(onIanaTimeZoneChange).toHaveBeenCalledWith("Asia/Singapore");
  });
});
