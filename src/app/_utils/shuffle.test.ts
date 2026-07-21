import { describe, it, expect } from "vitest";
import { shuffle } from "./shuffle";

describe("shuffle", () => {
  it("should return an empty array when given an empty array", () => {
    expect(shuffle([])).toEqual([]);
  });

  it("should return the same array elements when given a single element array", () => {
    expect(shuffle([1])).toEqual([1]);
  });

  it("should keep all original elements and length", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);

    expect(result).toHaveLength(input.length);
    expect(result.sort()).toEqual(input.slice().sort());
  });

  it("should not mutate the original array", () => {
    const input = [1, 2, 3];
    const inputCopy = [...input];
    shuffle(input);
    expect(input).toEqual(inputCopy);
  });

  it("should shuffle elements (probabilistic check)", () => {
    const input = Array.from({ length: 100 }, (_, i) => i);
    const result = shuffle(input);

    // It is highly unlikely that 100 elements remain in the exact same order
    expect(result).not.toEqual(input);
  });

  it("should return the exact same array when all elements are identical", () => {
    const input = [5, 5, 5, 5];
    expect(shuffle(input)).toEqual([5, 5, 5, 5]);
  });
});
