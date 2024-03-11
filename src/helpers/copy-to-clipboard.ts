export async function copyToClipboard(text: string) {
  return new Promise((resolve, reject) =>
    navigator.clipboard.writeText(text).then(resolve, reject),
  );
}
