import * as crypto from "crypto";

const ALGORITHM = "aes-128-ecb";

export function encodeCipher(text: string, secret: string) {
  const cipher = crypto.createCipher(ALGORITHM, secret);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return encrypted;
}

export function decodeCipher(hash: string, secret: string) {
  const decipher = crypto.createDecipher(ALGORITHM, secret);
  let decrypted = decipher.update(hash, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
