export const titleCase = (str: string): string => {
  const words = str.split(" ");
  const formattedWords = words.map((word) => {
    if (word.length) {
      const firstChar = word.slice(0, 1);
      const rest = word.slice(1);
      return `${firstChar.toUpperCase()}${rest.toLowerCase()}`;
    }
    return word;
  });

  return formattedWords.join(" ");
};
