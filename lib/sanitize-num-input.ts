export function sanitizeNumInput(num: string) {
  return num.replace(/\D/g, "");
}
