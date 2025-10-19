
export const amountSeparator = (num: string | number, format:"kobo"|"default"="default" , separator = ",") => {
  if (!num) return num as string;

  if(format === "kobo"){
    num = (Number(num) / 100).toFixed(2);
  }

  // Split the number into integer and decimal parts
  const [integerPart, decimalPart] = num.toString().split(".");

  // Remove existing separators from the integer part
  const rawInteger = integerPart.replace(new RegExp(`\\${separator}`, "g"), "");

  // Add separators to the integer part
  const formattedInteger = rawInteger.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    separator,
  );

  // Combine the formatted integer and decimal parts
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};
