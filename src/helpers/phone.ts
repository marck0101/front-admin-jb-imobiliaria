export const formatToPhone = (v: string) => {
  // Remove todos os caracteres não numéricos
  v = v.replace(/\D/g, '');

  // Verifica o comprimento do número de telefone
  if (v.length <= 10) {
    // Formatação para números com até 10 dígitos
    v = v.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  } else if (v.length === 11) {
    // Formatação para números com 11 dígitos
    v = v.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})$/, '($1) $2 $3-$4');
  } else {
    // Formatação para números com mais de 11 dígitos
    v = v.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})(\d{0,4})$/, '($1) $2 $3-$4$5');
  }

  return v;
};

// export const formatToPhone = (v: string) => {
//   // Remove todos os caracteres não numéricos
//   v = v.replace(/\D/g, '');

//   // Verifica o comprimento do número de telefone
//   if (v.length <= 11) {
//     // Formatação para números com até 11 dígitos
//     v = v.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})$/, '($1) $2 $3-$4');
//   } else {
//     // Formatação para números com mais de 11 dígitos
//     v = v.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})(\d{0,4})$/, '($1) $2 $3-$4$5');
//   }

//   return v;
// };
