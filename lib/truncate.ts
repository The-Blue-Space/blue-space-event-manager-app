export default function truncate(sentence: string, amount: number = 10): string {
  if (amount > sentence.length) return sentence;
  const value = sentence.slice(0, amount);
  return `${value.trim()}...`;
}
