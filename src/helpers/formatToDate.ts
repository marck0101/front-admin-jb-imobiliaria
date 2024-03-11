export const formatToDate = (value: string) => {
  // Remove todos os caracteres não numéricos
  value = value.replace(/\D/g, '');

  // Adiciona a máscara para datas
  if (value.length <= 12) {
    value = value.replace(/^(\d{2})(\d{1,2})(\d{1,4})$/, '$1/$2/$3');
  } else {
    value = value.replace(
      /^(\d{2})(\d{1,2})(\d{1,4})(\d{1,2})(\d{1,2})$/,
      '$1/$2/$3 $4:$5',
    );
  }

  return value;
};
