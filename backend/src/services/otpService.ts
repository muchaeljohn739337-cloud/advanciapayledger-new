/**
 * OTP Service
 * Generates and validates one-time passwords for authentication
 */

import crypto from "crypto";

/**
 * Generate a random OTP of specified length
 * @param length - Length of OTP (default: 6)
 * @returns Generated OTP string
 */
export function generateOTP(length: number = 6): string {
  const digits = "0123456789";
  let otp = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    otp += digits[randomIndex];
  }

  return otp;
}

/**
 * Generate a secure alphanumeric OTP
 * @param length - Length of OTP (default: 8)
 * @returns Generated alphanumeric OTP string
 */
export function generateSecureOTP(length: number = 8): string {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let otp = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    otp += chars[randomIndex];
  }

  return otp;
}

/**
 * Validate OTP format
 * @param otp - OTP to validate
 * @param expectedLength - Expected length (default: 6)
 * @returns Whether OTP is valid format
 */
export function validateOTPFormat(otp: string, expectedLength: number = 6): boolean {
  if (!otp || typeof otp !== "string") {
    return false;
  }

  if (otp.length !== expectedLength) {
    return false;
  }

  // Check if all characters are digits
  return /^\d+$/.test(otp);
}

/**
 * Generate OTP with expiration timestamp
 * @param length - Length of OTP (default: 6)
 * @param expiresInMinutes - Expiration time in minutes (default: 10)
 * @returns Object with OTP and expiration timestamp
 */
export function generateOTPWithExpiry(
  length: number = 6,
  expiresInMinutes: number = 10
): { otp: string; expiresAt: Date } {
  const otp = generateOTP(length);
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  return { otp, expiresAt };
}

/**
 * Check if OTP has expired
 * @param expiresAt - Expiration timestamp
 * @returns Whether OTP has expired
 */
export function isOTPExpired(expiresAt: Date): boolean {
  return new Date() > new Date(expiresAt);
}

export default {
  generateOTP,
  generateSecureOTP,
  validateOTPFormat,
  generateOTPWithExpiry,
  isOTPExpired,
};
