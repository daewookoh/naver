export function generateRandomString(length: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function formatWalletAddress(
  address: string,
  prefixLength = 5,
  suffixLength = 3
) {
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}

export async function copyToClipboard(text: string, message?: string | null) {
  try {
    await navigator.clipboard.writeText(text);
    if (message === null) return;
    // ToastStore.info(message || "Text copied to clipboard");
  } catch (err) {
    // ToastStore.info("Failed to copy text to clipboard");
  }
}
