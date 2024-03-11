export const formatToCep = (v: string) => {
  v = v.replace(/\D/g, '');
  if (v.length == 5) {
    return v.replace(/^(\d{5})(\d{3})$/, '$1-');
  }
  if (v.length > 5) {
    return v.replace(/^(\d{5})(\d{3})$/, '$1-$2');
  }
};
