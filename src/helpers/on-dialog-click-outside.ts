export const onDialogClickOutside = (
  $dialog: HTMLDialogElement | null,
  cb: () => void,
) => {
  $dialog?.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    if (!(target instanceof HTMLDialogElement) || !e?.target) return;

    const rect = target.getBoundingClientRect();

    const hasClickedInDialog =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;

    if (!hasClickedInDialog) cb();
  });
};
