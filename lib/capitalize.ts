export default function capitalize(value: string, type: "initial" | "all" = "initial"): string {
  if (value.length < 1) return value
  const toUpperFirst = (word: string): string => {
    const firstLetter = word[0];
    const capitalizedFirstLetter = firstLetter.toUpperCase();
    return `${capitalizedFirstLetter}${word.slice(1, word.length)}`;
  }

  if (type === "all") {
    const allWords = value.split(" ");
    const capitalizedFirstLetterForAllWords = allWords.filter((item) => item.trim()).map((item) => (toUpperFirst(item)));
    return capitalizedFirstLetterForAllWords.join(" ");
  } else return toUpperFirst(value);
}

