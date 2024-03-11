export const formatToNumber = (n: string | number) =>
  isNaN(Number(n)) ? 0 : Number(n);
