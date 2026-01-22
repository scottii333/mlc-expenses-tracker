import crypto from "crypto";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hashEmail(email: string) {
  const normalized = normalizeEmail(email);
  return crypto.createHash("sha256").update(normalized, "utf8").digest("hex");
}

function getEmailKey(): Buffer {
  const b64 = process.env.EMAIL_ENCRYPTION_KEY;
  if (!b64) throw new Error("Missing EMAIL_ENCRYPTION_KEY (32 bytes base64).");

  const key = Buffer.from(b64, "base64");
  if (key.length !== 32)
    throw new Error("EMAIL_ENCRYPTION_KEY must decode to 32 bytes.");
  return key;
}

export function encryptEmail(email: string) {
  const key = getEmailKey();
  const iv = crypto.randomBytes(12); // GCM recommended

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const plaintext = normalizeEmail(email);

  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return {
    email_enc: ciphertext.toString("base64"),
    email_iv: iv.toString("base64"),
    email_tag: tag.toString("base64"),
  };
}
