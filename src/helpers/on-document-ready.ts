export const onDocumentReady = (cb: () => void) => {
  if (document.readyState == 'complete') {
    return cb();
  }

  document.onreadystatechange = () => {
    if (document.readyState === 'complete') return cb();
  };
};
