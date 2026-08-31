import { part1Questions } from "@/shared/diagnostics-questions";

// Answer keys never enter the client question catalogue.
const answerKeys: Record<number, string[][]> = {
  "1": [["do not touch", "don't touch"], ["teeth"]],
  "2": [["mine"], ["yours"]],
  "3": [["had"], ["would travel"]],
  "4": [
    ["cannot", "can't"],
    ["is having", "'s having"],
  ],
  "5": [["is cooked"], ["the most famous"]],
  "6": [["the highest"]],
  "7": [
    ["does not rain", "doesn't rain"],
    ["will go", "'ll go"],
  ],
  "8": [["have finished", "'ve finished"]],
  "9": [["those"], ["dresses"], ["think"], ["prettier"]],
  "10": [["them"], ["parties"], ["would not tell", "wouldn't tell"]],
  "11": [["will dress"], ["herself"]],
  "12": [["saw"], ["was waiting"]],
  "13": [["had started"]],
  "14": [["seeing"], ["us"]],
  "15": [["our"], ["theirs"], ["ours"], ["third"]],
  "16": [["are you doing"], ["am staying", "'m staying"], ["cleaning"]],
};

export const grammarQuestions = part1Questions.map((question) => {
  const correctAnswers = answerKeys[question.id];
  if (!correctAnswers) throw new Error("Missing diagnostic answer key");
  return { ...question, correctAnswers };
});
