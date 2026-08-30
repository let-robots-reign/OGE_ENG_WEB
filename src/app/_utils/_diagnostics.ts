export const processFeedback = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/INCORRECT\[(.*?)\]/g, '<span class="fb-incorrect">$1</span>')
    .replace(/CORRECT\[(.*?)\]/g, '<span class="fb-correct">$1</span>');
};
