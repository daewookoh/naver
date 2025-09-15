import Cryptr from "cryptr";

export function encrypt(text: string, password: string) {
  const cryptr = new Cryptr(password);
  return cryptr.encrypt(text);
}

export function decrypt(encryptedText: string, password: string) {
  const cryptr = new Cryptr(password);
  return cryptr.decrypt(encryptedText);
}
