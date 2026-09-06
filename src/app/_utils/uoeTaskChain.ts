export const UOE_ALL_TOPICS_CHAIN_TASK_COUNT = 9;
export const UOE_WORD_FORMATION_CHAIN_TASK_COUNT = 6;

export const UOE_CHAIN_TASK_COUNTS = [
  UOE_WORD_FORMATION_CHAIN_TASK_COUNT,
  UOE_ALL_TOPICS_CHAIN_TASK_COUNT,
] as const;

export function getUoeChainTaskCount(topicTitle: string | undefined) {
  return topicTitle === "Словообразование"
    ? UOE_WORD_FORMATION_CHAIN_TASK_COUNT
    : UOE_ALL_TOPICS_CHAIN_TASK_COUNT;
}
