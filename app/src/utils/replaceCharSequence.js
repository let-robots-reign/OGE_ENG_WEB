const countChars = (str, char) => {
    return (str.match(new RegExp(char, 'g')) || []).length;
};

export const replaceCharSequence = (str, char, replaceTo) => {
    const count = countChars(str, char);
    return str.replace(char.repeat(count), replaceTo);
};
