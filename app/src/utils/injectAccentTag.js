/**
 * Изменяет акцентирование фрагментов текста символами на теги
 * @param text - текст
 * @param accentSymbol - символ, который используется в тексте для выделения важных частей
 * @param tagWrapper - тег, в который нужно поместить важные части
 * @example
 * injectAccentTag("Hello, |World|", "|", "strong") === "Hello, <strong>World</strong>"
 */
export const injectAccentTag = (text, accentSymbol, tagWrapper) => {
    const [openingTag, closingTag] = [`<${tagWrapper}>`, `</${tagWrapper}>`];
    let count = 0;
    let resultString = '';
    for (const char of text) {
        if (char === accentSymbol) {
            resultString += (count % 2 === 0) ? openingTag : closingTag;
        } else {
            resultString += char;
        }
    }
    return resultString;
};
