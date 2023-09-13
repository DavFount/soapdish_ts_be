export const justNumericCharacters = (str: string) => {
  return str.replace(/\D/g, "");
};
