import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CustomSelect } from "./custom-select";

describe("CustomSelect", () => {
  it("does not select a disabled option", () => {
    const onChange = vi.fn();

    render(
      <CustomSelect
        options={[
          { value: 1, label: "Available" },
          { value: 2, label: "Occupied", disabled: true },
        ]}
        value=""
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /выберите/i }));
    const occupiedOption = screen.getByRole("button", { name: "Occupied" });

    expect(occupiedOption).toBeDisabled();
    fireEvent.click(occupiedOption);
    expect(onChange).not.toHaveBeenCalled();
  });
});
