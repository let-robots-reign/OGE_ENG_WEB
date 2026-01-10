const countChars = (str, char) => {
  return (str.match(new RegExp(char, 'g')) || []).length;
};

export const replaceCharSequence = (str, char, replaceTo, options=null) => {
  const count = countChars(str, char);
  if (options.tagWrapper) {
    replaceTo = `<${options.tagWrapper}>${replaceTo}</${options.tagWrapper}>`;
  }
  return str.replace(char.repeat(count), replaceTo);
};
