/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unnecessary-type-assertion */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BaseInput } from "./BaseInput";
import { BaseSelect } from "./BaseSelect";
import { BaseRadio } from "./BaseRadio";
import { BaseRadioGroup } from "./BaseRadioGroup";

describe("Base UI Form Controls Suite", () => {
  describe("BaseInput", () => {
    it("should render placeholder and capture onChange inputs", () => {
      const mockChange = vi.fn();
      render(
        <BaseInput
          placeholder="Enter name"
          modelValue="test"
          onUpdate={mockChange}
        />,
      );

      const input = screen.getByPlaceholderText(
        "Enter name",
      ) as HTMLInputElement;
      expect(input.value).toBe("test");

      fireEvent.change(input, { target: { value: "newval" } });
      expect(mockChange).toHaveBeenCalledWith("newval");
    });

    it("should render in disabled state", () => {
      render(
        <BaseInput
          placeholder="Locked"
          modelValue="xyz"
          onUpdate={() => {}}
          disabled
        />,
      );
      expect(screen.getByPlaceholderText("Locked")).toBeDisabled();
    });
  });

  describe("BaseSelect", () => {
    it("should render option groups and fire change events", () => {
      const mockUpdate = vi.fn();
      const options = ["a", "b"];

      render(
        <BaseSelect options={options} modelValue="b" onUpdate={mockUpdate} />,
      );

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("b");

      fireEvent.change(select, { target: { value: "a" } });
      expect(mockUpdate).toHaveBeenCalledWith("a");
    });
  });

  describe("BaseRadio & BaseRadioGroup", () => {
    it("should emit changes on label click in BaseRadio", () => {
      const mockUpdate = vi.fn();
      render(
        <BaseRadio
          value="val-1"
          label="Label Text"
          name="radio-group"
          modelValue="val-2"
          onUpdate={mockUpdate}
        />,
      );

      const label = screen.getByText("Label Text");
      fireEvent.click(label);

      expect(mockUpdate).toHaveBeenCalledWith("val-1");
    });

    it("should render disabled radio button options", () => {
      render(
        <BaseRadio
          value="a"
          label="Disabled Radio"
          name="gr"
          modelValue="b"
          onUpdate={() => {}}
          disabled
        />,
      );

      expect(screen.getByRole("radio")).toBeDisabled();
    });

    it("should apply valid class when disabled and isChosenCorrect is true", () => {
      render(
        <BaseRadio
          value="A"
          label="Option Option"
          name="group-1"
          modelValue="A"
          onUpdate={() => {}}
          disabled={true}
          isChosenCorrect={true}
        />,
      );

      const label = screen.getByText("Option Option");
      expect(label).toHaveClass(/valid/);
    });

    it("should support grouped options rendered by BaseRadioGroup", () => {
      const mockUpdate = vi.fn();
      const options = ["Choice 1", "Choice 2"];

      render(
        <BaseRadioGroup
          options={options}
          name="group-test"
          modelValue="Choice 1"
          onUpdate={mockUpdate}
        />,
      );

      expect(screen.getByText("Choice 1")).toBeInTheDocument();
      expect(screen.getByText("Choice 2")).toBeInTheDocument();
    });
  });
});
