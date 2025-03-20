export const minStr = (str1: string | undefined, str2: string | undefined) => {
  if (!str1 && !str2) return undefined;
  if (!str1) return str2;
  if (!str2) return str1;

  return str1 < str2 ? str1 : str2;
};

export const maxStr = (str1: string | undefined, str2: string | undefined) => {
  if (!str1 && !str2) return undefined;
  if (!str1) return str2;
  if (!str2) return str1;

  return str1 > str2 ? str1 : str2;
};