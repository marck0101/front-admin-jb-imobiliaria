export const closeDialogWithAnimation = (query: string) => {
  const $dialog = document.querySelector(query) as HTMLDialogElement | null;
  $dialog?.classList.remove('animate-openModal');
  $dialog?.classList.add('animate-closeModal');
  setTimeout(() => {
    $dialog?.classList.remove('animate-closeModal');
    $dialog?.classList.add('animate-openModal');
    $dialog?.close();
  }, 300);
};
