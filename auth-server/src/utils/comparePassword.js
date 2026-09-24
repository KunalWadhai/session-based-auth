import crypto from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(crypto.scrypt);

export async function getHashString(password) {
  const salt = crypto.randomBytes(16).toString("hex");

  const derivedKey = await scrypt(password, salt, 64);

  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password, storedPassword) {
  const [salt, storedHash] =
    storedPassword.split(":");

  const derivedKey = await scrypt(
    password,
    salt,
    64
  );

  const storedKey =
    Buffer.from(storedHash, "hex");

  return crypto.timingSafeEqual(
    derivedKey,
    storedKey
  );
}